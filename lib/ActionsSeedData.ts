'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { MODALIDADES_BECA_OFICIALES } from './RecordAcademicoUtils'

interface PeriodoActualRow extends RowDataPacket {
  id: number;
}

interface CarreraRow extends RowDataPacket {
  id: number;
  nombre: string;
}

interface MateriaPensumSeedRow extends RowDataPacket {
  codigo_materia: string;
  nombre_materia: string;
  unidades_credito: number;
}

interface UserIdSeedRow extends RowDataPacket {
  id: number;
}

/**
 * SEEDER DE DATOS: Genera 100 estudiantes con las 10 denominaciones oficiales
 * de la Normativa UNIMAR 2023, materias desde pensum y estudios socioeconómicos.
 */
export async function seedDatabase(): Promise<{ success: boolean; message?: string; error?: string }> {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [periodoRes] = await connection.execute<PeriodoActualRow[]>(
      `SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const periodoId = periodoRes?.[0]?.id;

    if (!periodoId) {
      throw new Error("No se encontró ningún periodo académico activo (es_actual = 1) en la base de datos.");
    }

    const [carrerasDB] = await connection.execute<CarreraRow[]>(`SELECT id, nombre FROM carreras`);
    const carrerasMap = new Map<string, number>(carrerasDB.map((c) => [c.nombre, c.id]));

    const municipios = [
      "Arismendi", "Antolín del Campo", "Díaz", "García", "Gómez",
      "Maneiro", "Marcano", "Mariño", "Península de Macanao", "Tubores", "Villalba"
    ];

    const carrerasNombres = Array.from(carrerasMap.keys());
    const tiposBeca = [...MODALIDADES_BECA_OFICIALES];
    const estatusPosibles = ["Pendiente", "En Revisión", "Aprobada", "Rechazada"];
    const sexosPosibles = ["M", "F"];
    const passwordHash = await bcrypt.hash("estudiante123", 10);

    for (let i = 1; i <= 100; i++) {
      const cedula = (30000000 + i).toString();
      const email = `test_user${i}@unimar.edu.ve`;
      const nombre = `Estudiante${i}`;
      const apellido = `Prueba${i}`;
      const semestreNum = Math.floor(Math.random() * 12) + 1;
      const carreraNombre = carrerasNombres[Math.floor(Math.random() * carrerasNombres.length)];
      const carreraId = carrerasMap.get(carreraNombre) ?? 1;
      const tipoBecaActual = tiposBeca[Math.floor(Math.random() * tiposBeca.length)];

      const sexoAleatorio = sexosPosibles[Math.floor(Math.random() * sexosPosibles.length)];
      const anioNacimiento = 2026 - (Math.floor(Math.random() * 8) + 18);
      const mesNacimiento = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const diaNacimiento = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const fechaNacimiento = `${anioNacimiento}-${mesNacimiento}-${diaNacimiento}`;

      const [userRes] = await connection.execute<ResultSetHeader>(
        `INSERT INTO users (email, password, role) VALUES (?, ?, 'estudiante')`,
        [email, passwordHash]
      );
      const userId = userRes.insertId;

      await connection.execute<ResultSetHeader>(
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

      const [materiasPensum] = await connection.execute<MateriaPensumSeedRow[]>(
        `SELECT codigo_materia, nombre_materia, unidades_credito FROM pensum_materias WHERE carrera_id = ? AND trimestre_ubicacion = ?`,
        [carreraId, semestreNum]
      );

      let sumaNotas = 0;
      const materiasFormateadas = materiasPensum.map((mat) => {
        const notaAleatoria = parseFloat((Math.random() * (20 - 10) + 10).toFixed(2));
        sumaNotas += notaAleatoria;
        return {
          codigo: mat.codigo_materia,
          nombre: mat.nombre_materia,
          creditos: mat.unidades_credito,
          nota: notaAleatoria
        };
      });

      const promedio = materiasFormateadas.length > 0
        ? (sumaNotas / materiasFormateadas.length).toFixed(2)
        : (Math.random() * (20 - 10) + 10).toFixed(2);

      const materiasJsonString = JSON.stringify({
        trimestre: semestreNum,
        materias: materiasFormateadas,
        fecha_proceso: new Date().toISOString()
      });

      const estatus = estatusPosibles[Math.floor(Math.random() * estatusPosibles.length)];

      const fotoCarnet = `/uploads/mock_foto_carnet_${i}.png`;
      const copiaCedula = `/uploads/mock_cedula_${i}.png`;
      const constanciaResidencia =
        tipoBecaActual === "BECA SOCIAL APRENDIZAJE" ||
        tipoBecaActual === "BECA APRENDIZAJE" ||
        tipoBecaActual === "BECA POR DISCAPACIDAD"
          ? `/uploads/mock_residencia_${i}.pdf`
          : null;
      const declaracionManutencion = constanciaResidencia
        ? `/uploads/mock_manutencion_${i}.pdf`
        : null;
      const informeMedico =
        tipoBecaActual === "BECA POR DISCAPACIDAD" ? `/uploads/mock_informe_medico_${i}.pdf` : null;
      const carnetDiscapacidad =
        tipoBecaActual === "BECA POR DISCAPACIDAD" ? `/uploads/mock_carnet_disc_${i}.png` : null;
      const documentosFiliacion =
        tipoBecaActual === "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES" ||
        tipoBecaActual === "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES"
          ? `/uploads/mock_filiacion_${i}.pdf`
          : null;
      const constanciaClub =
        tipoBecaActual === "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN"
          ? `/uploads/mock_club_${i}.pdf`
          : null;
      const constanciaNotas =
        tipoBecaActual === "BECA APRENDIZAJE" || tipoBecaActual === "BECA A LA EXCELENCIA ACADÉMICA"
          ? `/uploads/mock_constancia_notas_${i}.pdf`
          : null;
      const notasCertificadas =
        semestreNum === 1 &&
        (tipoBecaActual === "BECA SOCIAL APRENDIZAJE" || tipoBecaActual === "BECA POR DISCAPACIDAD")
          ? `/uploads/mock_notas_certificadas_${i}.pdf`
          : null;

      await connection.execute<ResultSetHeader>(
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

      await connection.execute<ResultSetHeader>(
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
    return {
      success: true,
      message: `100 estudiantes con modalidades oficiales UNIMAR 2023 creados exitosamente en el periodo actual (ID: ${periodoId}).`
    };
  } catch (error: unknown) {
    await connection.rollback();
    const message = error instanceof Error ? error.message : "Error desconocido en Seeding.";
    console.error("❌ Error en Seeding:", error);
    return { success: false, error: message };
  } finally {
    connection.release();
  }
}

/**
 * LIMPIEZA DE DATOS: Borra los estudiantes, estudios socioeconómicos y solicitudes de prueba.
 */
export async function cleanSeedData(): Promise<{ success: boolean; message?: string; error?: string }> {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute<UserIdSeedRow[]>(
      `SELECT id FROM users 
       WHERE email LIKE 'test_user%' 
       AND id NOT IN (10, 12)`
    );

    const idsToDelete = rows.map((r) => r.id);

    if (idsToDelete.length === 0) {
      await connection.commit();
      return { success: true, message: "No se encontraron registros de prueba para eliminar." };
    }

    const placeholders = idsToDelete.map(() => '?').join(',');

    await connection.execute<ResultSetHeader>(
      `DELETE FROM estudios_socioeconomicos WHERE student_id IN (${placeholders})`,
      idsToDelete
    );

    await connection.execute<ResultSetHeader>(
      `DELETE FROM users WHERE id IN (${placeholders})`,
      idsToDelete
    );

    await connection.commit();
    return {
      success: true,
      message: `${idsToDelete.length} registros de prueba y sus estudios socioeconómicos fueron eliminados correctamente.`
    };
  } catch (error: unknown) {
    await connection.rollback();
    const message = error instanceof Error ? error.message : "Error desconocido en Limpieza.";
    console.error("❌ Error en Limpieza:", error);
    return { success: false, error: message };
  } finally {
    connection.release();
  }
}