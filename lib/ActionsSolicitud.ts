'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { mkdir } from 'fs/promises'
import { guardarArchivo } from './SolicitudUtils'
import { actualizarIndiceGlobal, obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
// 🟢 MOTOR UNIFICADO CON LÓGICA DE INGRESO RESIDUAL
import { calcularPuntajeUnificado } from './MotorBaremoUnificado'

/**
 * Procesa el envío de la solicitud de beca, calcula el baremo institucional
 * y sincroniza los datos en las tablas de solicitudes y estudios socioeconómicos.
 */
export async function enviarSolicitud(formData: FormData) {
  let connection;

  try {
    // 1. EXTRAER DATOS BÁSICOS
    const userId = formData.get('user_id')
    const emailInstitucional = formData.get('email_institucional')
    const tipo_beca = formData.get('tipo_beca')
    const promedio = formData.get('promedio')
    const motivo = formData.get('motivo_solicitud')
    const trimestreSeleccionado = formData.get('trimestre_seleccionado')

    if (!userId || !emailInstitucional || !tipo_beca || !promedio) {
      return { error: "Faltan datos obligatorios en la sección de beneficios." }
    }

    const userIdNum = parseInt(userId as string);
    const trimestreNum = parseInt(trimestreSeleccionado as string);

    // 2. VERIFICACIÓN DE VETO
    const [statusRows]: any = await db.execute(
      'SELECT beca_perdida FROM students WHERE id = ?',
      [userIdNum]
    );
    if (statusRows[0]?.beca_perdida === 1) {
      return { error: "Solicitud Denegada: Su beneficio ha sido revocado permanentemente." };
    }

    // 3. PROCESAMIENTO DE MATERIAS
    const materiasCodigos = formData.getAll('materias_codigos[]');
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const materiasArray = materiasCodigos.map((codigo, index) => ({
        codigo: codigo as string,
        nombre: materiasNombres[index] as string,
        nota: parseFloat(materiasNotas[index] as string || "0")
    })).filter(m => m.nombre && m.nombre.trim() !== ""); 

    if (materiasArray.some(m => m.nota < 10)) {
        return { error: "Solicitud Denegada: No se permiten materias reprobadas." };
    }

    const materiasJsonString = JSON.stringify({
        trimestre: trimestreNum,
        materias: materiasArray,
        fecha_proceso: new Date().toISOString()
    });

    const numPromedio = parseFloat(promedio as string);
    const estatusFinal = numPromedio < 16 ? 'Revisión Especial' : 'Pendiente';

    // 4. SINCRONIZACIÓN DE PERIODO
    let periodoId = await obtenerOCrearPeriodoObjetivo();

    // 5. CARGA DE ARCHIVOS
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    const [rutaFoto, rutaCedula] = await Promise.all([
      guardarArchivo(formData.get('foto_carnet') as File),
      guardarArchivo(formData.get('copia_cedula') as File)
    ])

    // --- CÁLCULO DE INGRESOS (Sincronizado con nombres reales de columnas) ---
    const sueldoReal = parseFloat(formData.get('monto_ingreso_sueldo') as string || "0");
    const montoFamiliarExtra = parseFloat(formData.get('monto_ingreso_familiar') as string || "0");

    const ingresoTotal = (
      sueldoReal + 
      parseFloat(formData.get('monto_ingreso_extra') as string || "0") +
      parseFloat(formData.get('monto_ingreso_pension') as string || "0") + 
      parseFloat(formData.get('monto_ingreso_ayuda') as string || "0") +
      montoFamiliarExtra
    );

    // 🟢 6. MOTOR DE BAREMO UNIFICADO (Corregido .nivelRiesgo)
    const { puntaje: puntajeCalculado, nivelRiesgo } = await calcularPuntajeUnificado({
      ingresoTotal,
      monto_ingreso_sueldo: sueldoReal,
      monto_ingreso_extra: parseFloat(formData.get('monto_ingreso_extra') as string || "0"),
      monto_ingreso_pension: parseFloat(formData.get('monto_ingreso_pension') as string || "0"),
      monto_ingreso_ayuda: parseFloat(formData.get('monto_ingreso_ayuda') as string || "0"),
      monto_ingreso_familiar: montoFamiliarExtra,
      monto_egreso_mercado: parseFloat(formData.get('monto_egreso_mercado') as string || "0"),
      monto_egreso_vivienda: parseFloat(formData.get('monto_egreso_vivienda') as string || "0"),
      monto_egreso_salud: parseFloat(formData.get('monto_egreso_salud') as string || "0"),
      monto_egreso_servicios: parseFloat(formData.get('monto_egreso_servicios') as string || "0"),
      viviendaTipo: formData.get('vivienda_tipo') as string,
      viviendaEstatus: formData.get('vivienda_estatus') as string,
      numHermanos: parseInt(formData.get('familia_num_hermanos') as string || "0"),
      poseeEmpleo: formData.get('posee_empleo_aspirante') as string,
      saludCondicion: formData.get('salud_condicion_especial') as string,
      servInternet: formData.get('serv_internet') as string,
      equipNevera: formData.get('equip_nevera') as string,
      equipLavadora: formData.get('equip_lavadora') as string
    });

    // 7. TRANSACCIÓN DE GUARDADO
    connection = await db.getConnection(); 
    await connection.beginTransaction(); 

    try {
      const [solicitudExistente]: any = await connection.execute(
          'SELECT id, estatus, foto_carnet, copia_cedula FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
          [userIdNum, periodoId]
      );

      if (solicitudExistente.length > 0) {
          const existente = solicitudExistente[0];
          await connection.execute(`
              UPDATE solicitudes SET 
                  email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
                  motivo_solicitud = ?, materias_json = ?, 
                  estatus = ?, foto_carnet = ?, copia_cedula = ?, fecha_registro = NOW()
              WHERE id = ?
          `, [
            emailInstitucional || null, 
            tipo_beca || null, 
            numPromedio || 0, 
            motivo || null, 
            materiasJsonString || null, 
            estatusFinal || 'Pendiente', 
            rutaFoto || existente.foto_carnet, 
            rutaCedula || existente.copia_cedula, 
            existente.id
          ]);
      } else {
          await connection.execute(`
            INSERT INTO solicitudes (
              user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
              motivo_solicitud, materias_json, estatus, 
              foto_carnet, copia_cedula, fecha_registro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            userIdNum, 
            periodoId, 
            emailInstitucional || null, 
            tipo_beca || null, 
            numPromedio || 0, 
            motivo || null, 
            materiasJsonString || null, 
            estatusFinal || 'Pendiente', 
            rutaFoto || null, 
            rutaCedula || null
          ]);
      }

      // 8. GUARDADO EN TABLA SOCIOECONÓMICA (Blindaje contra undefined)
      await connection.execute(`
        INSERT INTO estudios_socioeconomicos (
          student_id, periodo_id, tipo,
          socio_lugar_nac, socio_nacionalidad, socio_estado_civil, socio_telf_hab, direccion_completa,
          socio_trabajo_empresa, socio_trabajo_cargo, monto_ingreso_sueldo,
          socio_ue_procedencia, socio_otros_estudios, socio_fecha_unimar, socio_modalidad,
          padre_nombre, padre_edad, padre_ocupacion, padre_trabajo,
          madre_nombre, madre_edad, madre_ocupacion, madre_trabajo,
          familia_num_hermanos, familia_hermanos_uni,
          rango_ingreso_familiar, monto_ingreso_extra, monto_ingreso_pension, monto_ingreso_ayuda, monto_ingreso_familiar,
          monto_egreso_mercado, monto_egreso_vivienda, monto_egreso_salud, monto_egreso_servicios,
          vivienda_tipo, vivienda_estatus, 
          serv_internet, serv_luz, serv_agua, serv_gas, serv_aseo,
          equip_nevera, equip_lavadora, equip_cable,
          salud_condicion_especial, salud_enfermedad_desc, salud_tratamiento,
          situacion_laboral_jefe, familia_relacion,
          puntaje, nivel_riesgo, created_at
        ) VALUES (
          ?, ?, 'estudiante', 
          ?, ?, ?, ?, ?,
          ?, ?, ?, 
          ?, ?, ?, ?, 
          ?, ?, ?, ?, 
          ?, ?, ?, ?, 
          ?, ?, 
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, 
          ?, ?, 
          ?, ?, ?, ?, ?, 
          ?, ?, ?, 
          ?, ?, ?, 
          ?, ?,
          ?, ?, NOW()
        )
        ON DUPLICATE KEY UPDATE 
          socio_telf_hab = VALUES(socio_telf_hab),
          direccion_completa = VALUES(direccion_completa),
          monto_ingreso_sueldo = VALUES(monto_ingreso_sueldo),
          monto_ingreso_familiar = VALUES(monto_ingreso_familiar),
          monto_ingreso_extra = VALUES(monto_ingreso_extra),
          monto_egreso_mercado = VALUES(monto_egreso_mercado),
          monto_egreso_vivienda = VALUES(monto_egreso_vivienda),
          monto_egreso_salud = VALUES(monto_egreso_salud),
          monto_egreso_servicios = VALUES(monto_egreso_servicios),
          familia_relacion = VALUES(familia_relacion),
          puntaje = VALUES(puntaje),
          nivel_riesgo = VALUES(nivel_riesgo),
          created_at = NOW()
      `, [
          userIdNum, 
          periodoId,
          formData.get('socio_lugar_nac') || null, 
          formData.get('socio_nacionalidad') || null, 
          formData.get('socio_estado_civil') || null, 
          formData.get('socio_telf_hab') || null, 
          formData.get('direccion_completa') || null,
          formData.get('socio_trabajo_empresa') || null, 
          formData.get('socio_trabajo_cargo') || null, 
          sueldoReal,
          formData.get('socio_ue_procedencia') || null, 
          formData.get('socio_otros_estudios') || null, 
          formData.get('socio_fecha_unimar') || null, 
          formData.get('socio_modalidad') || null,
          formData.get('padre_nombre') || null, 
          parseInt(formData.get('padre_edad') as string || "0"), 
          formData.get('padre_ocupacion') || null, 
          formData.get('padre_trabajo') || null,
          formData.get('madre_nombre') || null, 
          parseInt(formData.get('madre_edad') as string || "0"), 
          formData.get('madre_ocupacion') || null, 
          formData.get('madre_trabajo') || null,
          parseInt(formData.get('familia_num_hermanos') as string || "0"), 
          parseInt(formData.get('familia_hermanos_uni') as string || "0"),
          formData.get('rango_ingreso_familiar') || null, 
          parseFloat(formData.get('monto_ingreso_extra') as string || "0"), 
          parseFloat(formData.get('monto_ingreso_pension') as string || "0"), 
          parseFloat(formData.get('monto_ingreso_ayuda') as string || "0"), 
          montoFamiliarExtra,
          parseFloat(formData.get('monto_egreso_mercado') as string || "0"), 
          parseFloat(formData.get('monto_egreso_vivienda') as string || "0"), 
          parseFloat(formData.get('monto_egreso_salud') as string || "0"), 
          parseFloat(formData.get('monto_egreso_servicios') as string || "0"),
          formData.get('vivienda_tipo') || null, 
          formData.get('vivienda_estatus') || null, 
          formData.get('serv_internet') === 'on' ? 'on' : 'off',
          formData.get('serv_luz') === 'on' ? 'on' : 'off',
          formData.get('serv_agua') === 'on' ? 'on' : 'off',
          formData.get('serv_gas') === 'on' ? 'on' : 'off',
          formData.get('serv_aseo') === 'on' ? 'on' : 'off',
          formData.get('equip_nevera') === 'on' ? 'on' : 'off',
          formData.get('equip_lavadora') === 'on' ? 'on' : 'off',
          formData.get('equip_cable') === 'on' ? 'on' : 'off',
          formData.get('salud_condicion_especial') || 'No', 
          formData.get('salud_enfermedad_desc') || null, 
          formData.get('salud_tratamiento') || null,
          formData.get('posee_empleo_aspirante') || 'No', 
          formData.get('familia_relacion') || 'Buena',
          puntajeCalculado || 0,
          nivelRiesgo || 'Bajo'
      ]);

      await connection.commit(); 
    } catch (sqlError) {
      if (connection) await connection.rollback(); 
      throw sqlError;
    } finally {
      if (connection) connection.release(); 
    }

    await actualizarIndiceGlobal(userIdNum, materiasArray);
    revalidatePath('/admin/solicitudes')
    revalidatePath('/perfil')
    
    return { success: true }

  } catch (error: any) {
    console.error("❌ Error en Proceso de Solicitud:", error)
    return { error: "Error crítico al procesar la solicitud institucional." }
  }
}