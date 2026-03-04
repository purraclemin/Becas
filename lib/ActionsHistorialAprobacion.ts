"use server"

import { queryFresh } from "@/lib/db"

/**
 * Obtiene el historial de aprobaciones completo con filtros de fecha frescos.
 */
export async function obtenerHistorialAprobaciones(filtros: { fechaInicio?: string; fechaFin?: string }) {
  try {
    let sql = `
      SELECT 
        h.*, 
        s.email_institucional,
        st.nombre,
        st.apellido,
        st.cedula,
        p.nombre as periodo_nombre
      FROM historial_aprobaciones h
      JOIN solicitudes s ON h.solicitud_id = s.id
      JOIN students st ON h.user_id = st.id
      JOIN periodos_academicos p ON h.periodo_id = p.id
    `;
    
    const params: any[] = [];

    if (filtros.fechaInicio && filtros.fechaFin) {
      sql += ` WHERE h.fecha_aprobacion BETWEEN ? AND ?`;
      params.push(`${filtros.fechaInicio} 00:00:00`, `${filtros.fechaFin} 23:59:59`);
    }

    sql += ` ORDER BY h.fecha_aprobacion DESC`;

    // Ejecución con queryFresh para evitar caché de base de datos
    const rows = await queryFresh(sql, params) as any[];
    
    return {
      success: true,
      data: rows
    };
  } catch (error) {
    console.error("Error en obtenerHistorialAprobaciones:", error);
    return {
      success: false,
      message: "Error al sincronizar el historial de decisiones."
    };
  }
}