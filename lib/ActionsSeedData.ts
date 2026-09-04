'use server'

import { db } from './db'
import bcrypt from 'bcryptjs'

/**
 * 🚀 SEEDER DE DATOS: Genera 100 estudiantes con datos demográficos completos (género, fecha de nacimiento),
 * solicitudes con tipos de beca variados, materias dinámicas desde el pensum en JSON, 
 * y registros completos en estudios socioeconómicos de prueba.
 */
export async function seedDatabase() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 🟢 1. Obtener dinámicamente el periodo académico activo actual
    const [periodoRes]: any = await connection.execute(
      `SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const periodoId = periodoRes?.[0]?.id;

    if (!periodoId) {
      throw new Error("No se encontró ningún periodo académico activo (es_actual = 1) en la base de datos.");
    }

    // 🟢 2. Cargar el mapeo de carreras desde la base de datos (id <-> nombre)
    const [carrerasDB]: any = await connection.execute(`SELECT id, nombre FROM carreras`);
    const carrerasMap = new Map(carrerasDB.map((c: any) => [c.nombre, c.id]));

    const municipios = [
      "Arismendi", "Antolín del Campo", "Díaz", "García", "Gómez", 
      "Maneiro", "Marcano", "Mariño", "Península de Macanao", "Tubores", "Villalba"
    ];

    const carrerasNombres = Array.from(carrerasMap.keys() as Iterable<string>);

    // Listado completo de tipos de becas y ayudas de acuerdo al sistema
    const tiposBeca = [
      "BECA SOCIAL", 
      "BECA APRENDIZAJE", 
      "BECA POR DISCAPACIDAD", 
      "BECA A LA EXCELENCIA", 
      "AYUDA ECONÓMICA GENERAL", 
      "AYUDA ECONÓMICA FAMILIAR", 
      "AYUDA ECONÓMICA PARA TRABAJADORES", 
      "AYUda ECONÓMICA PARA HIJOS DE TRABAJADORES", 
      "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES", 
      "AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES"
    ];

    const estatusPosibles = ["Pendiente", "En Revisión", "Aprobada", "Rechazada"];
    const sexosPosibles = ["M", "F"];
    const passwordHash = await bcrypt.hash("estudiante123", 10);

    console.log(`⏳ Iniciando inserción de 100 registros completos en el periodo ID: ${periodoId}...`);

    for (let i = 1; i <= 100; i++) {
      const cedula = (30000000 + i).toString();
      const email = `test_user${i}@unimar.edu.ve`;
      const nombre = `Estudiante${i}`;
      const apellido = `Prueba${i}`;
      const semestreNum = Math.floor(Math.random() * 12) + 1; // Equivale al trimestre / semestre
      const carreraNombre = carrerasNombres[Math.floor(Math.random() * carrerasNombres.length)];
      const carreraId = carrerasMap.get(carreraNombre);
      const tipoBecaActual = tiposBeca[Math.floor(Math.random() * tiposBeca.length)];
      
      // Datos demográficos nuevos solicitados
      const sexoAleatorio = sexosPosibles[Math.floor(Math.random() * sexosPosibles.length)];
      // Generar una fecha de nacimiento aleatoria coherente con estudiantes universitarios (entre 18 y 25 años aprox)
      const anioNacimiento = 2026 - (Math.floor(Math.random() * 8) + 18);
      const mesNacimiento = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const diaNacimiento = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const fechaNacimiento = `${anioNacimiento}-${mesNacimiento}-${diaNacimiento}`;

      // 1. Insertar en tabla USERS
      const [userRes]: any = await connection.execute(
        `INSERT INTO users (email, password, role) VALUES (?, ?, 'estudiante')`,
        [email, passwordHash]
      );
      const userId = userRes.insertId;

      // 2. Insertar en tabla STUDENTS (incluyendo sexo y fecha_nacimiento)
      await connection.execute(
        `INSERT INTO students (id, nombre, apellido, cedula, sexo, fecha_nacimiento, telefono, carrera, semestre, municipio_residencia, email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          nombre, 
          apellido, 
          cedula, 
          sexoAleatorio,
          fechaNacimiento,
          "04120000000", 
          carreraNombre,
          semestreNum,
          municipios[Math.floor(Math.random() * municipios.length)],
          email
        ]
      );

      // 3. Consultar materias del pensum según la carrera y el trimestre actual para construir el JSON
      const [materiasPensum]: any = await connection.execute(
        `SELECT codigo_materia, nombre_materia, unidades_credito FROM pensum_materias WHERE carrera_id = ? AND trimestre_ubicacion = ?`,
        [carreraId, semestreNum]
      );

      let sumaNotas = 0;
      const materiasFormateadas = materiasPensum.map((mat: any) => {
        // Generar una nota aleatoria realista entre 10 y 20
        const notaAleatoria = parseFloat((Math.random() * (20 - 10) + 10).toFixed(2));
        sumaNotas += notaAleatoria;
        return {
          codigo: mat.codigo_materia,
          nombre: mat.nombre_materia,
          creditos: mat.unidades_credito,
          nota: notaAleatoria
        };
      });

      // Calcular promedio dinámico basado en las materias del pensum, o fallback aleatorio si estuviera vacío
      const promedio = materiasFormateadas.length > 0 
        ? (sumaNotas / materiasFormateadas.length).toFixed(2) 
        : (Math.random() * (20 - 10) + 10).toFixed(2);

      const materiasJsonString = JSON.stringify({
        trimestre: semestreNum,
        materias: materiasFormateadas,
        fecha_proceso: new Date().toISOString()
      });

      const estatus = estatusPosibles[Math.floor(Math.random() * estatusPosibles.length)];

      // 4. Definición y asignación dinámica de documentos según el tipo de beca seleccionada
      let fotoCarnet = `/uploads/mock_foto_carnet_${i}.png`;
      let copiaCedula = `/uploads/mock_cedula_${i}.png`;
      let constanciaResidencia = (tipoBecaActual.includes("SOCIAL") || tipoBecaActual.includes("APRENDIZAJE") || tipoBecaActual.includes("DISCAPACIDAD")) ? `/uploads/mock_residencia_${i}.pdf` : null;
      let declaracionManutencion = (tipoBecaActual.includes("SOCIAL") || tipoBecaActual.includes("APRENDIZAJE") || tipoBecaActual.includes("DISCAPACIDAD")) ? `/uploads/mock_manutencion_${i}.pdf` : null;
      let informeMedico = tipoBecaActual.includes("DISCAPACIDAD") ? `/uploads/mock_informe_medico_${i}.pdf` : null;
      let carnetDiscapacidad = tipoBecaActual.includes("DISCAPACIDAD") ? `/uploads/mock_carnet_disc_${i}.png` : null;
      let documentosFiliacion = tipoBecaActual.includes("FAMILIAR") || tipoBecaActual.includes("HIJOS DE TRABAJADORES") ? `/uploads/mock_filiacion_${i}.pdf` : null;
      let constanciaClub = tipoBecaActual.includes("EXTRACURRICULARES") ? `/uploads/mock_club_${i}.pdf` : null;
      let constanciaNotas = (tipoBecaActual.includes("APRENDIZAJE") || tipoBecaActual.includes("EXCELENCIA")) ? `/uploads/mock_constancia_notas_${i}.pdf` : null;
      let notasCertificadas = (semestreNum === 1 && (tipoBecaActual.includes("SOCIAL") || tipoBecaActual.includes("DISCAPACIDAD"))) ? `/uploads/mock_notas_certificadas_${i}.pdf` : null;

      // 5. Insertar en tabla SOLICITUDES (incluyendo materias_json y documentos)[cite: 2]
      await connection.execute(
        `INSERT INTO solicitudes (
           user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, motivo_solicitud, materias_json, estatus,
           foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion, informe_medico,
           constancia_club, constancia_notas, notas_certificadas, carnet_discapacidad, documentos_filiacion
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          periodoId, 
          email, 
          tipoBecaActual, 
          promedio,
          "Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema.",
          materiasJsonString,
          estatus,
          fotoCarnet,
          copiaCedula,
          constanciaResidencia,
          declaracionManutencion,
          informeMedico,
          constanciaClub,
          constanciaNotas,
          notasCertificadas,
          carnetDiscapacidad,
          documentosFiliacion
        ]
      );

      // 6. Insertar en tabla ESTUDIOS_SOCIOECONOMICOS con todos los campos requeridos por el esquema[cite: 2]
      await connection.execute(
        `INSERT INTO estudios_socioeconomicos (
           student_id, periodo_id, tipo, socio_lugar_nac, socio_nacionalidad, socio_estado_civil,
           socio_telf_hab, direccion_completa, socio_trabajo_empresa, socio_trabajo_cargo,
           monto_ingreso_sueldo, monto_ingreso_extra, monto_ingreso_pension, monto_ingreso_ayuda, monto_ingreso_familiar,
           socio_ue_procedencia, socio_otros_estudios, socio_fecha_unimar, socio_modalidad,
           padre_nombre, padre_edad, padre_ocupacion, padre_trabajo,
           madre_nombre, madre_edad, madre_ocupacion, madre_trabajo,
           rango_ingreso_familiar, vivienda_tipo, vivienda_estatus, serv_internet, familia_num_hermanos, familia_hermanos_uni,
           monto_egreso_mercado, monto_egreso_vivienda, monto_egreso_salud, monto_egreso_servicios,
           situacion_laboral_jefe, salud_condicion_especial, serv_agua, serv_gas, serv_aseo,
           equip_lavadora, equip_nevera, serv_luz, equip_cable, salud_enfermedad_desc, salud_tratamiento,
           familia_relacion, puntaje, nivel_riesgo
         ) VALUES (?, ?, 'estudiante', 'Porlamar', 'Venezolano/a', 'Soltero/a', '02952600000', 'Calle Principal #123', 'Independiente', 'Asistente', 350.00, 50.00, 0.00, 0.00, 400.00, 'U.E. Dr. Francisco Antonio Risquez', 'Ninguno', '2024-10-01', 'S', 'Padre Prueba', 55, 'Comerciante', 'Independiente', 'Madre Prueba', 50, 'Docente', 'Colegio Privado', '2', 'Casa', 'Propia', 'on', 1, 0, 150.00, 50.00, 30.00, 40.00, 'Empleado', 'No', 'on', 'on', 'on', 'on', 'on', 'on', 'on', 'Ninguna', 'Ninguno', 'Buena', 45, 'Bajo')`,
        [userId, periodoId]
      );
    }

    await connection.commit();
    return { success: true, message: `100 estudiantes con datos demográficos completos, solicitudes y estudios socioeconómicos creados exitosamente en el periodo actual (ID: ${periodoId}).` };

  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en Seeding:", error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

/**
 * 🧹 LIMPIEZA DE DATOS: Borra los estudiantes, estudios socioeconómicos y solicitudes de prueba.
 * Excluye explícitamente los IDs 10 y 12 para proteger registros manuales.
 */
export async function cleanSeedData() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log("⏳ Iniciando limpieza de datos de prueba...");

    // 1. Identificar IDs de usuarios de prueba (test_user%) excluyendo IDs manuales (10 y 12)
    const [rows]: any = await connection.execute(
      `SELECT id FROM users 
       WHERE email LIKE 'test_user%' 
       AND id NOT IN (10, 12)`
    );

    const idsToDelete = rows.map((r: any) => r.id);

    if (idsToDelete.length === 0) {
      return { success: true, message: "No se encontraron registros de prueba para eliminar." };
    }

    const placeholders = idsToDelete.map(() => '?').join(',');

    // 2. Borrar primero los estudios socioeconómicos asociados estrictamente a estos IDs de prueba
    await connection.execute(
      `DELETE FROM estudios_socioeconomicos WHERE student_id IN (${placeholders})`,
      idsToDelete
    );

    // 3. Borrar de la tabla USERS (por cascada eliminará students y solicitudes de prueba)
    await connection.execute(
      `DELETE FROM users WHERE id IN (${placeholders})`,
      idsToDelete
    );

    await connection.commit();
    return { success: true, message: `${idsToDelete.length} registros de prueba y sus estudios socioeconómicos fueron eliminados correctamente (IDs 10 y 12 protegidos).` };

  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en Limpieza:", error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}