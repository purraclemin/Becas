"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

interface SolicitudFechaSQLRow extends RowDataPacket {
  solicitud_id: number
  fecha_registro: Date | string | null
  tipo_beca: string | null
  estatus: string | null
  promedio_notas: number | string | null
  indice_global: number | string | null
  semestre: number | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  periodo_codigo: string | null
  periodo_nombre: string | null
}

export interface ReporteSolicitudFechaItem {
  solicitud_id: number
  fecha_registro: string
  tipo_beca: string
  estatus: string
  promedio_notas: string
  indice_global: string
  semestre: number
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  periodo_codigo: string
  periodo_nombre: string
}

export interface FiltrosReporteSolicitudesFecha {
  inicio?: string
  fin?: string
  search?: string
}

export interface RespuestaReporteSolicitudesFecha {
  success: boolean
  data: ReporteSolicitudFechaItem[]
  error?: string
}

function formatearDecimal(valor: number | string | null | undefined): string {
  const num = Number(valor ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : "0.00"
}

function serializarFechaISO(valor: Date | string | null | undefined): string {
  if (!valor) return ""
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? "" : valor.toISOString()
  }
  const parsed = new Date(valor)
  return Number.isNaN(parsed.getTime()) ? String(valor) : parsed.toISOString()
}

/**
 * Consulta todas las solicitudes registradas ordenadas por fecha de ingreso más reciente (DESC).
 */
export async function obtenerReporteSolicitudesFecha(
  filtros: FiltrosReporteSolicitudesFecha = {}
): Promise<RespuestaReporteSolicitudesFecha> {
  try {
    let sql = `
      SELECT
        s.id AS solicitud_id,
        s.fecha_registro,
        s.tipo_beca,
        s.estatus,
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        IFNULL(st.semestre, 1) AS semestre,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo,
        IFNULL(p.nombre, 'Periodo no registrado') AS periodo_nombre
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN periodos_academicos p ON s.periodo_id = p.id
      WHERE 1=1
    `

    const params: Array<string | number> = []

    if (filtros.inicio && filtros.fin) {
      sql += ` AND s.fecha_registro BETWEEN ? AND ?`
      params.push(`${filtros.inicio} 00:00:00`, `${filtros.fin} 23:59:59`)
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
          OR LOWER(st.carrera) LIKE ?
          OR LOWER(IFNULL(s.tipo_beca, '')) LIKE ?
          OR LOWER(IFNULL(s.estatus, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term, term)
    }

    sql += ` ORDER BY s.fecha_registro DESC, s.id DESC`

    const rows = await queryFresh<SolicitudFechaSQLRow[]>(sql, params)

    const data: ReporteSolicitudFechaItem[] = rows.map((row) => ({
      solicitud_id: Number(row.solicitud_id),
      fecha_registro: serializarFechaISO(row.fecha_registro),
      tipo_beca:
        normalizarTipoBecaOficial(row.tipo_beca) ||
        String(row.tipo_beca || "No especificado"),
      estatus: String(row.estatus || "Pendiente"),
      promedio_notas: formatearDecimal(row.promedio_notas),
      indice_global: formatearDecimal(row.indice_global),
      semestre: Number(row.semestre ?? 1),
      nombre: String(row.nombre || ""),
      apellido: String(row.apellido || ""),
      cedula: String(row.cedula || ""),
      carrera: String(row.carrera || "---"),
      periodo_codigo: String(row.periodo_codigo || "S/P"),
      periodo_nombre: String(row.periodo_nombre || "Periodo no registrado"),
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error en obtenerReporteSolicitudesFecha:", error)
    return {
      success: false,
      data: [],
      error: "No fue posible consultar las solicitudes por fecha.",
    }
  }
}