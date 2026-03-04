'use server'

import { db } from './db'
import { getSession } from './ActionsSession'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { calcularPuntajeUnificado } from './MotorBaremoUnificado'

/**
 * Lógica de negocio para procesar y guardar el estudio socioeconómico (Auditoría Admin)
 */
export async function procesarGuardadoEstudio(data: any) {
  const session = await getSession();
  const adminId = session.id;
  if (!adminId) throw new Error("Sesión no válida.");

  const periodoIdActual = await obtenerOCrearPeriodoObjetivo();
  
  // Normalización de switches para MariaDB (on/off)
  const normalizeSwitch = (val: string) => 
    (val === 'Posee' || val === 'Si' || val === 'on' || val === 'on_true') ? 'on' : 'off';

  // 1. Ejecución del motor con los datos auditados
  const { puntaje, nivel } = await calcularPuntajeUnificado({
    ...data,
    monto_ingreso_sueldo: Number(data.monto_ingreso_sueldo || 0),
    monto_ingreso_extra: Number(data.monto_ingreso_extra || 0),
    monto_ingreso_pension: Number(data.monto_ingreso_pension || 0),
    monto_ingreso_ayuda: Number(data.monto_ingreso_ayuda || 0),
    monto_ingreso_familiar: Number(data.monto_ingreso_familiar || 0),
    familia_num_hermanos: Number(data.familia_num_hermanos || 0),
    serv_internet: normalizeSwitch(data.serv_internet),
    serv_agua: normalizeSwitch(data.serv_agua),
    serv_gas: normalizeSwitch(data.serv_gas),
    serv_aseo: normalizeSwitch(data.serv_aseo),
    serv_luz: normalizeSwitch(data.serv_luz),
    equip_lavadora: normalizeSwitch(data.equip_lavadora),
    equip_nevera: normalizeSwitch(data.equip_nevera),
    equip_cable: normalizeSwitch(data.equip_cable),
    // Priorizamos la carga de discapacidad si existe
    salud_condicion_especial: data.carga_familiar_discapacidad || data.salud_condicion_especial || 'No'
  });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const fechaUnimar = (data.socio_fecha_unimar && data.socio_fecha_unimar !== "") ? data.socio_fecha_unimar : null;

    // safeParams: Lista exacta de 52 valores para los "?" del INSERT
    const safeParams = [
      data.student_id, 
      periodoIdActual, 
      adminId,
      data.socio_lugar_nac || "", 
      data.socio_nacionalidad || "", 
      data.socio_estado_civil || "", 
      data.socio_telf_hab || "", 
      data.direccion_completa || "",
      data.socio_trabajo_empresa || "", 
      data.socio_trabajo_cargo || "", 
      Number(data.monto_ingreso_sueldo || 0), 
      Number(data.monto_ingreso_extra || 0), 
      Number(data.monto_ingreso_pension || 0), 
      Number(data.monto_ingreso_ayuda || 0),
      Number(data.monto_ingreso_familiar || 0), // Nueva columna 15
      data.socio_ue_procedencia || "", 
      data.socio_otros_estudios || "", 
      fechaUnimar, 
      data.socio_modalidad || "P",
      data.padre_nombre || "", 
      Number(data.padre_edad || 0), 
      data.padre_ocupacion || "", 
      data.padre_trabajo || "",
      data.madre_nombre || "", 
      Number(data.madre_edad || 0), 
      data.madre_ocupacion || "", 
      data.madre_trabajo || "",
      data.rango_ingreso_familiar || "1", 
      data.vivienda_tipo || "", 
      data.vivienda_estatus || "",
      normalizeSwitch(data.serv_internet),
      Number(data.familia_num_hermanos || 0), 
      Number(data.familia_hermanos_uni || 0),
      Number(data.monto_egreso_mercado || 0), 
      Number(data.monto_egreso_vivienda || 0),
      Number(data.monto_egreso_salud || 0), 
      Number(data.monto_egreso_servicios || 0),
      data.posee_empleo_aspirante || "No", 
      data.carga_familiar_discapacidad || data.salud_condicion_especial || "No",
      normalizeSwitch(data.serv_agua), 
      normalizeSwitch(data.serv_gas), 
      normalizeSwitch(data.serv_aseo),
      normalizeSwitch(data.equip_lavadora), 
      normalizeSwitch(data.equip_nevera), 
      normalizeSwitch(data.serv_luz),
      normalizeSwitch(data.equip_cable),
      data.salud_enfermedad_desc || "", 
      data.salud_tratamiento || "", 
      data.familia_relacion || "Buena",
      puntaje, 
      nivel
    ];

    await connection.execute(
      `INSERT INTO estudios_socioeconomicos 
        (student_id, periodo_id, evaluador_id, tipo, 
         socio_lugar_nac, socio_nacionalidad, socio_estado_civil, socio_telf_hab, direccion_completa,
         socio_trabajo_empresa, socio_trabajo_cargo, monto_ingreso_sueldo, monto_ingreso_extra,
         monto_ingreso_pension, monto_ingreso_ayuda, monto_ingreso_familiar, socio_ue_procedencia, socio_otros_estudios,
         socio_fecha_unimar, socio_modalidad, padre_nombre, padre_edad, padre_ocupacion,
         padre_trabajo, madre_nombre, madre_edad, madre_ocupacion, madre_trabajo,
         rango_ingreso_familiar, vivienda_tipo, vivienda_estatus, serv_internet,
         familia_num_hermanos, familia_hermanos_uni, monto_egreso_mercado, monto_egreso_vivienda,
         monto_egreso_salud, monto_egreso_servicios, situacion_laboral_jefe, salud_condicion_especial,
         serv_agua, serv_gas, serv_aseo, equip_lavadora, equip_nevera, serv_luz,
         equip_cable, salud_enfermedad_desc, salud_tratamiento, familia_relacion,
         puntaje, nivel_riesgo, created_at) 
        VALUES (?, ?, ?, 'administrador', 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
          periodo_id = VALUES(periodo_id),
          evaluador_id = VALUES(evaluador_id),
          puntaje = VALUES(puntaje),
          nivel_riesgo = VALUES(nivel_riesgo),
          vivienda_tipo = VALUES(vivienda_tipo),
          vivienda_estatus = VALUES(vivienda_estatus),
          familia_relacion = VALUES(familia_relacion),
          direccion_completa = VALUES(direccion_completa),
          monto_ingreso_sueldo = VALUES(monto_ingreso_sueldo),
          monto_ingreso_familiar = VALUES(monto_ingreso_familiar),
          socio_trabajo_empresa = VALUES(socio_trabajo_empresa),
          situacion_laboral_jefe = VALUES(situacion_laboral_jefe),
          created_at = NOW()`,
      safeParams
    );

    // 2. Actualización de estatus de la solicitud
    await connection.execute(
      `UPDATE solicitudes SET estatus = 'En Revisión', fecha_revision = NOW() WHERE user_id = ? AND estatus = 'Pendiente'`,
      [data.student_id]
    );

    await connection.commit();
    return { success: true, puntaje, nivel };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en procesarGuardadoEstudio:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}