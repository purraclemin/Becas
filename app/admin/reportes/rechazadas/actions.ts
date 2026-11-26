"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

interface ReporteRechazadaSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  fecha_rechazo: Date | string | null
  promedio_notas: number | string | null
  indice_global: number | string | null
  puntaje_admin: number | null
  puntaje_estudiante: number | null
  puntaje_historial: number | null
  tipo_beca: string | null
  motivo_rechazo: string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  semestre: number
  periodo: string
  periodo_codigo: string
}

export interface ReporteRechazadaItem {
  solicitud_id: number
  user_id: number
  fecha_rechazo: string
  promedio_notas: string
  indice_global: string
  puntaje_baremo: number | null
  tipo_beca: string
  motivo_rechazo: string
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  semestre: number
  periodo: string
  periodo_codigo: string
}

export interface FiltrosReporteRechazadas {
  inicio?: string
  fin?: string
  search?: string
}

export interface RespuestaReporteRechazadas {
  success: boolean
  data: ReporteRechazadaItem[]
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
 * Consulta TODAS las solicitudes rechazadas/reprobadas desde la fuente oficial (`solicitudes`)
 * con cascada segura para motivo y fecha real de rechazo.
 */
export async function obtenerReporteRechazadas(
  filtros: FiltrosReporteRechazadas = {}
): Promise<RespuestaReporteRechazadas> {
  try {
    const fechaEfectivaExpr = `COALESCE(
      s.fecha_decision,
      (
        SELECT MAX(h_f.fecha_aprobacion)
        FROM historial_aprobaciones h_f
        WHERE h_f.solicitud_id = s.id
          AND LOWER(TRIM(h_f.estatus_nuevo)) IN ('rechazada', 'rechazado')
      ),
      s.fecha_registro
    )`

    let whereClause = ` WHERE LOWER(TRIM(s.estatus)) IN ('rechazada', 'rechazado')`
    const params: Array<string | number> = []

    if (filtros.inicio && filtros.fin) {
      whereClause += ` AND ${fechaEfectivaExpr} BETWEEN ? AND ?`
      params.push(`${filtros.inicio} 00:00:00`, `${filtros.fin} 23:59:59`)
    }

    const searchClean = (filtros.search || "").trim().toLowerCase()
    if (searchClean !== "") {
      const term = `%${searchClean}%`
      whereClause += `
        AND (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(st.carrera) LIKE ?
          OR LOWER(IFNULL(s.tipo_beca, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term)
    }

    const sql = `
      SELECT
        s.id AS solicitud_id,
        s.user_id,
        ${fechaEfectivaExpr} AS fecha_rechazo,
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        e_adm.puntaje AS puntaje_admin,
        e_est.puntaje AS puntaje_estudiante,
        (
          SELECT h_p.puntaje_baremo_
          FROM historial_aprobaciones h_p
          WHERE h_p.solicitud_id = s.id
            AND LOWER(TRIM(h_p.estatus_nuevo)) IN ('rechazada', 'rechazado')
          ORDER BY h_p.fecha_aprobacion DESC, h_p.id DESC
          LIMIT 1
        ) AS puntaje_historial,
        s.tipo_beca,
        COALESCE(
          NULLIF(TRIM(s.observaciones_admin), ''),
          (
            SELECT NULLIF(TRIM(h_m.observacion_admin), '')
            FROM historial_aprobaciones h_m
            WHERE h_m.solicitud_id = s.id
              AND LOWER(TRIM(h_m.estatus_nuevo)) IN ('rechazada', 'rechazado')
            ORDER BY h_m.fecha_aprobacion DESC, h_m.id DESC
            LIMIT 1
          ),
          NULLIF(TRIM(st.motivo_exclusion), ''),
          'Sin motivo especificado'
        ) AS motivo_rechazo,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        IFNULL(st.semestre, 1) AS semestre,
        IFNULL(p.nombre, 'Periodo no registrado') AS periodo,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN periodos_academicos p ON s.periodo_id = p.id
      LEFT JOIN estudios_socioeconomicos e_adm
        ON e_adm.id = (
          SELECT MAX(es1.id)
          FROM estudios_socioeconomicos es1
          WHERE es1.student_id = st.id
            AND es1.tipo = 'administrador'
        )
      LEFT JOIN estudios_socioeconomicos e_est
        ON e_est.id = (
          SELECT MAX(es2.id)
          FROM estudios_socioeconomicos es2
          WHERE es2.student_id = st.id
            AND es2.tipo = 'estudiante'
        )
      ${whereClause}
      ORDER BY fecha_rechazo DESC, s.id DESC
    `

    const rows = await queryFresh<ReporteRechazadaSQLRow[]>(sql, params)

    const data: ReporteRechazadaItem[] = rows.map((row) => {
      const puntajeBaremo =
        row.puntaje_admin !== null && row.puntaje_admin !== undefined
          ? Number(row.puntaje_admin)
          : row.puntaje_historial !== null &&
              row.puntaje_historial !== undefined &&
              Number(row.puntaje_historial) > 0
            ? Number(row.puntaje_historial)
            : row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined
              ? Number(row.puntaje_estudiante)
              : null

      return {
        solicitud_id: Number(row.solicitud_id),
        user_id: Number(row.user_id),
        fecha_rechazo: serializarFechaISO(row.fecha_rechazo),
        promedio_notas: formatearDecimal(row.promedio_notas),
        indice_global: formatearDecimal(row.indice_global),
        puntaje_baremo: puntajeBaremo,
        tipo_beca:
          normalizarTipoBecaOficial(row.tipo_beca) ||
          String(row.tipo_beca || "No especificado"),
        motivo_rechazo: String(row.motivo_rechazo || "Sin motivo especificado"),
        nombre: String(row.nombre || ""),
        apellido: String(row.apellido || ""),
        cedula: String(row.cedula || ""),
        carrera: String(row.carrera || "---"),
        semestre: Number(row.semestre || 1),
        periodo: String(row.periodo || "Periodo no registrado"),
        periodo_codigo: String(row.periodo_codigo || "S/P"),
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error en obtenerReporteRechazadas:", error)
    return {
      success: false,
      data: [],
      error: "No fue posible consultar el reporte de becas rechazadas.",
    }
  }
}