"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"

export interface HistorialAprobacionRow extends RowDataPacket {
  id: number
  solicitud_id: number
  user_id: number
  periodo_id: number
  admin_id: number
  promedio_ciclo: number | string
  trimestre: number
  puntaje_baremo_: number
  nivel_riesgo: string
  tipo_beca_snapshot: string | null
  estatus_previo: string
  estatus_nuevo: string
  observacion_admin: string | null
  materias_snapshot_json: string | null
  indice_global_snapshot: number | string | null
  fecha_aprobacion: Date | string
  token_verificacion: string | null
  ip_accion: string | null
  email_institucional: string
  nombre: string
  apellido: string
  cedula: string
  periodo_nombre: string
}

export interface FiltrosHistorialAprobacion {
  fechaInicio?: string
  fechaFin?: string
  search?: string
}

/**
 * Obtiene el historial de aprobaciones completo con filtros frescos de fecha
 * y búsqueda insensible a mayúsculas por nombre completo o cédula.
 */
export async function obtenerHistorialAprobaciones(
  filtros: FiltrosHistorialAprobacion = {}
): Promise<{
  success: boolean
  data: HistorialAprobacionRow[]
  message?: string
}> {
  try {
    let sql = `
      SELECT 
        h.*, 
        s.email_institucional,
        st.nombre,
        st.apellido,
        st.cedula,
        p.nombre AS periodo_nombre
      FROM historial_aprobaciones h
      JOIN solicitudes s ON h.solicitud_id = s.id
      JOIN students st ON h.user_id = st.id
      JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE 1=1
    `

    const params: Array<string | number> = []

    if (filtros.fechaInicio && filtros.fechaFin) {
      sql += ` AND h.fecha_aprobacion BETWEEN ? AND ?`
      params.push(`${filtros.fechaInicio} 00:00:00`, `${filtros.fechaFin} 23:59:59`)
    }

    const searchClean = (filtros.search || "").trim().toLowerCase()
    if (searchClean !== "") {
      const term = `%${searchClean}%`
      sql += `
        AND (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
        )
      `
      params.push(term, term, term, term)
    }

    sql += ` ORDER BY h.fecha_aprobacion DESC`

    const rows = await queryFresh<HistorialAprobacionRow[]>(sql, params)

    return {
      success: true,
      data: rows,
    }
  } catch (error) {
    console.error("Error en obtenerHistorialAprobaciones:", error)
    return {
      success: false,
      data: [],
      message: "Error al sincronizar el historial de decisiones.",
    }
  }
}