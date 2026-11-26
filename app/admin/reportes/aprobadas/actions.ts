"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

interface ReporteAprobadaSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  fecha_aprobacion: Date | string | null
  promedio_notas: number | string | null
  indice_global: number | string | null
  puntaje_admin: number | null
  puntaje_estudiante: number | null
  puntaje_historial: number | null
  tipo_beca: string | null
  departamento_asignado: string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  semestre: number
  periodo: string
  periodo_codigo: string
}

export interface ReporteAprobadaItem {
  solicitud_id: number
  user_id: number
  fecha_aprobacion: string
  promedio_notas: string
  indice_global: string
  puntaje_baremo: number | null
  origen_baremo: "Admin" | "Historial" | "Estudiante" | "Sin Estudio"
  tipo_beca: string
  departamento_asignado: string
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  semestre: number
  periodo: string
  periodo_codigo: string
}

export interface FiltrosReporteAprobadas {
  inicio?: string
  fin?: string
  search?: string
}

export interface RespuestaReporteAprobadas {
  success: boolean
  data: ReporteAprobadaItem[]
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
 * Consulta TODAS las becas aprobadas desde la fuente oficial (`solicitudes`)
 * complementada con `LEFT JOIN` a periodos, estudios socioeconómicos e historial.
 * Evita pérdida de registros sin traza previa en historial y evita duplicados.
 */
export async function obtenerReporteAprobadas(
  filtros: FiltrosReporteAprobadas = {}
): Promise<RespuestaReporteAprobadas> {
  try {
    const fechaEfectivaExpr = `COALESCE(
      s.fecha_decision,
      (
        SELECT MAX(h_f.fecha_aprobacion)
        FROM historial_aprobaciones h_f
        WHERE h_f.solicitud_id = s.id
          AND LOWER(TRIM(h_f.estatus_nuevo)) IN ('aprobada', 'aprobado')
      ),
      s.fecha_registro
    )`

    let whereClause = ` WHERE LOWER(TRIM(s.estatus)) IN ('aprobada', 'aprobado')`
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
        ${fechaEfectivaExpr} AS fecha_aprobacion,
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        e_adm.puntaje AS puntaje_admin,
        e_est.puntaje AS puntaje_estudiante,
        (
          SELECT h_p.puntaje_baremo_
          FROM historial_aprobaciones h_p
          WHERE h_p.solicitud_id = s.id
            AND LOWER(TRIM(h_p.estatus_nuevo)) IN ('aprobada', 'aprobado')
          ORDER BY h_p.fecha_aprobacion DESC, h_p.id DESC
          LIMIT 1
        ) AS puntaje_historial,
        s.tipo_beca,
        IFNULL(NULLIF(TRIM(s.departamento_asignado), ''), 'Sin asignar') AS departamento_asignado,
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
      ORDER BY fecha_aprobacion DESC, s.id DESC
    `

    const rows = await queryFresh<ReporteAprobadaSQLRow[]>(sql, params)

    const data: ReporteAprobadaItem[] = rows.map((row) => {
      let puntajeBaremo: number | null = null
      let origenBaremo: ReporteAprobadaItem["origen_baremo"] = "Sin Estudio"

      if (row.puntaje_admin !== null && row.puntaje_admin !== undefined) {
        puntajeBaremo = Number(row.puntaje_admin)
        origenBaremo = "Admin"
      } else if (
        row.puntaje_historial !== null &&
        row.puntaje_historial !== undefined &&
        Number(row.puntaje_historial) > 0
      ) {
        puntajeBaremo = Number(row.puntaje_historial)
        origenBaremo = "Historial"
      } else if (row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined) {
        puntajeBaremo = Number(row.puntaje_estudiante)
        origenBaremo = "Estudiante"
      }

      return {
        solicitud_id: Number(row.solicitud_id),
        user_id: Number(row.user_id),
        fecha_aprobacion: serializarFechaISO(row.fecha_aprobacion),
        promedio_notas: formatearDecimal(row.promedio_notas),
        indice_global: formatearDecimal(row.indice_global),
        puntaje_baremo: puntajeBaremo,
        origen_baremo: origenBaremo,
        tipo_beca:
          normalizarTipoBecaOficial(row.tipo_beca) ||
          String(row.tipo_beca || "No especificado"),
        departamento_asignado: String(row.departamento_asignado || "Sin asignar"),
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
    console.error("Error en obtenerReporteAprobadas:", error)
    return {
      success: false,
      data: [],
      error: "No fue posible consultar el reporte de becas aprobadas.",
    }
  }
}