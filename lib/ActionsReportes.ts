"use server"

import { queryFresh } from "@/lib/db"

/**
 * REPORTE: Becas Aprobadas por Fecha
 */
export async function reporteAprobadasPorFecha(inicio: string, fin: string) {
  try {
    const sql = `
      SELECT 
        h.fecha_aprobacion,
        h.puntaje_baremo_,
        h.tipo_beca_snapshot,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        p.nombre as periodo
      FROM historial_aprobaciones h
      JOIN students st ON h.user_id = st.id
      JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE h.estatus_nuevo = 'Aprobada'
        AND h.fecha_aprobacion BETWEEN ? AND ?
      ORDER BY h.fecha_aprobacion DESC
    `;
    const rows = await queryFresh(sql, [`${inicio} 00:00:00`, `${fin} 23:59:59`]);
    return { success: true, data: rows as any[] };
  } catch (error) {
    console.error("Error en reporteAprobadasPorFecha:", error);
    return { success: false, data: [] };
  }
}

/**
 * REPORTE: Becas Rechazadas por Fecha
 */
export async function reporteRechazadasPorFecha(inicio: string, fin: string) {
  try {
    const sql = `
      SELECT 
        h.fecha_aprobacion,
        h.puntaje_baremo_,
        h.observacion_admin,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        p.nombre as periodo
      FROM historial_aprobaciones h
      JOIN students st ON h.user_id = st.id
      JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE h.estatus_nuevo = 'Rechazada'
        AND h.fecha_aprobacion BETWEEN ? AND ?
      ORDER BY h.fecha_aprobacion DESC
    `;
    const rows = await queryFresh(sql, [`${inicio} 00:00:00`, `${fin} 23:59:59`]);
    return { success: true, data: rows as any[] };
  } catch (error) {
    console.error("Error en reporteRechazadasPorFecha:", error);
    return { success: false, data: [] };
  }
}

/**
 * REPORTE: Recurrencia (Estudiantes con más de una beca aprobada)
 */
export async function reporteRecurrenciaAlumnos() {
  try {
    const sql = `
      SELECT 
        st.cedula, 
        st.nombre, 
        st.apellido, 
        st.carrera,
        COUNT(h.id) as total_beneficios,
        GROUP_CONCAT(DISTINCT p.nombre SEPARATOR ', ') as periodos_beneficiados
      FROM students st
      JOIN historial_aprobaciones h ON st.id = h.user_id
      JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE h.estatus_nuevo = 'Aprobada'
      GROUP BY st.id
      ORDER BY total_beneficios DESC
    `;
    const rows = await queryFresh(sql);
    return { success: true, data: rows as any[] };
  } catch (error) {
    console.error("Error en reporteRecurrenciaAlumnos:", error);
    return { success: false, data: [] };
  }
}

/**
 * REPORTE: Solicitudes por rango de fecha (Ingreso al sistema)
 */
export async function reporteSolicitudesPorFecha(inicio: string, fin: string) {
  try {
    const sql = `
      SELECT 
        s.fecha_registro, 
        s.tipo_beca, 
        s.estatus, 
        st.nombre, 
        st.apellido, 
        st.cedula, 
        st.carrera
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.fecha_registro BETWEEN ? AND ?
      ORDER BY s.fecha_registro DESC
    `;
    const rows = await queryFresh(sql, [`${inicio} 00:00:00`, `${fin} 23:59:59`]);
    return rows as any[];
  } catch (error) {
    console.error("Error en reporteSolicitudesPorFecha:", error);
    return [];
  }
}

/**
 * REPORTE: Distribución Detallada por Carreras
 */
export async function reporteDistribucionCarreras() {
  try {
    const sql = `
      SELECT 
        c.nombre as carrera,
        COUNT(s.id) as total_solicitudes,
        SUM(CASE WHEN s.estatus = 'Aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN s.estatus = 'Rechazada' THEN 1 ELSE 0 END) as rechazadas,
        SUM(CASE WHEN s.estatus IN ('En Revisión', 'Pendiente', 'Revisión Especial') THEN 1 ELSE 0 END) as en_proceso
      FROM carreras c
      LEFT JOIN students st ON c.nombre = st.carrera
      LEFT JOIN solicitudes s ON st.id = s.user_id
      GROUP BY c.id, c.nombre
      ORDER BY total_solicitudes DESC
    `;
    const rows = await queryFresh(sql);
    return { success: true, data: rows as any[] };
  } catch (error) {
    console.error("Error en reporteDistribucionCarreras:", error);
    return { success: false, data: [] };
  }
}

/**
 * REPORTE: Auditoría de Administradores
 */
export async function reporteAuditoriaAdministradores() {
  try {
    const sql = `
      SELECT 
        h.fecha_aprobacion,
        h.estatus_previo,
        h.estatus_nuevo,
        h.ip_accion,
        u.email as admin_email,
        st.nombre as alumno_nombre,
        st.apellido as alumno_apellido,
        st.cedula as alumno_cedula
      FROM historial_aprobaciones h
      JOIN users u ON h.admin_id = u.id
      JOIN students st ON h.user_id = st.id
      ORDER BY h.fecha_aprobacion DESC
      LIMIT 200
    `;
    const rows = await queryFresh(sql);
    return { success: true, data: rows as any[] };
  } catch (error) {
    console.error("Error en reporteAuditoriaAdministradores:", error);
    return { success: false, data: [] };
  }
}

/**
 * REPORTE: Tipos de Beca (Desglose operativo por categoría)
 */
export async function reporteTiposDeBeca() {
  try {
    const sql = `
      SELECT 
        tipo_beca,
        COUNT(*) as total,
        SUM(CASE WHEN estatus = 'Aprobada' THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN estatus = 'Rechazada' THEN 1 ELSE 0 END) as rechazadas,
        SUM(CASE WHEN estatus IN ('En Revisión', 'Pendiente', 'Revisión Especial') THEN 1 ELSE 0 END) as en_proceso
      FROM solicitudes
      GROUP BY tipo_beca
      ORDER BY total DESC
    `;
    const rows = await queryFresh(sql);
    return { success: true, data: rows as any[] };
  } catch (error) {
    console.error("Error en reporteTiposDeBeca:", error);
    return { success: false, data: [] };
  }
}