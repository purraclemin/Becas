"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

export type EstatusCierreReporte = "Rechazada" | "Finalizada"
export type FiltroEstatusCierre = "Todas" | EstatusCierreReporte

interface ReporteRechazadaSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  estatus: string | null
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
  estatus: EstatusCierreReporte
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

export interface StatsReporteRechazadas {
  totalRegistros: number
  totalRechazadas: number
  totalFinalizadas: number
}

export interface FiltrosReporteRechazadas {
  inicio?: string
  fin?: string
  fechaDesde?: string
  fechaHasta?: string
  search?: string
  estatus?: FiltroEstatusCierre
}

export interface RespuestaReporteRechazadas {
  success: boolean
  data: ReporteRechazadaItem[]
  stats: StatsReporteRechazadas
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

function normalizarEstatusCierre(raw: string | null | undefined): EstatusCierreReporte {
  const limpio = String(raw || "").trim().toLowerCase()
  return limpio === "finalizada" ? "Finalizada" : "Rechazada"
}

interface PeriodoActualRechRow extends RowDataPacket {
  id: number
  fecha_inicio: Date | string | null
}

function normalizarFechaSqlRech(fecha: Date | string | null | undefined): string {
  if (!fecha) return ""
  if (fecha instanceof Date) {
    return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString().split("T")[0]
  }
  const s = String(fecha).trim()
  return s.includes("T") ? s.split("T")[0] : s.slice(0, 10)
}

/**
 * Consulta la última solicitud por estudiante (`MAX(id)` acotado al periodo vigente)
 * cuyo estatus de cierre sea 'Rechazada' o 'Finalizada', devolviendo KPIs separados
 * sin contaminación cruzada y permitiendo filtrar por estatus (?estatus=Rechazada | Finalizada).
 */
export async function obtenerReporteRechazadas(
  filtros: FiltrosReporteRechazadas = {}
): Promise<RespuestaReporteRechazadas> {
  try {
    const periodoRows = await queryFresh<PeriodoActualRechRow[]>(
      `SELECT id, fecha_inicio FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    )
    const fechaInicioActual = normalizarFechaSqlRech(periodoRows[0]?.fecha_inicio)
    const usarCorteCronologico =
      Number(periodoRows[0]?.id ?? 0) > 0 && fechaInicioActual !== ""

    const fechaEfectivaExpr = `COALESCE(
      s.fecha_decision,
      (
        SELECT MAX(h_f.fecha_aprobacion)
        FROM historial_aprobaciones h_f
        WHERE h_f.solicitud_id = s.id
          AND LOWER(TRIM(h_f.estatus_nuevo)) IN ('rechazada', 'rechazado', 'finalizada')
      ),
      s.fecha_registro
    )`

    let whereClause = ` WHERE LOWER(TRIM(s.estatus)) IN ('rechazada', 'rechazado', 'finalizada')`
    const params: Array<string | number> = usarCorteCronologico
      ? [fechaInicioActual]
      : []

    const desde = (filtros.fechaDesde || filtros.inicio || "").trim()
    const hasta = (filtros.fechaHasta || filtros.fin || "").trim()

    if (desde && hasta) {
      whereClause += ` AND ${fechaEfectivaExpr} BETWEEN ? AND ?`
      params.push(`${desde} 00:00:00`, `${hasta} 23:59:59`)
    } else if (desde) {
      whereClause += ` AND ${fechaEfectivaExpr} >= ?`
      params.push(`${desde} 00:00:00`)
    } else if (hasta) {
      whereClause += ` AND ${fechaEfectivaExpr} <= ?`
      params.push(`${hasta} 23:59:59`)
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
          OR LOWER(IFNULL(s.estatus, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term, term)
    }

    const sql = `
      SELECT
        s.id AS solicitud_id,
        s.user_id,
        s.estatus,
        ${fechaEfectivaExpr} AS fecha_rechazo,
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        e_adm.puntaje AS puntaje_admin,
        e_est.puntaje AS puntaje_estudiante,
        (
          SELECT h_p.puntaje_baremo_
          FROM historial_aprobaciones h_p
          WHERE h_p.solicitud_id = s.id
            AND LOWER(TRIM(h_p.estatus_nuevo)) IN ('rechazada', 'rechazado', 'finalizada')
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
              AND LOWER(TRIM(h_m.estatus_nuevo)) IN ('rechazada', 'rechazado', 'finalizada')
            ORDER BY h_m.fecha_aprobacion DESC, h_m.id DESC
            LIMIT 1
          ),
          CASE
            WHEN LOWER(TRIM(s.estatus)) = 'finalizada' THEN 'Acabó su periodo académico'
            ELSE NULLIF(TRIM(st.motivo_exclusion), '')
          END,
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
      ${
        usarCorteCronologico
          ? `
            INNER JOIN (
              SELECT s_u.user_id, MAX(s_u.id) AS last_id
              FROM solicitudes s_u
              INNER JOIN periodos_academicos p_u ON s_u.periodo_id = p_u.id
              WHERE p_u.fecha_inicio <= ?
              GROUP BY s_u.user_id
            ) ult ON s.id = ult.last_id
          `
          : `
            INNER JOIN (
              SELECT user_id, MAX(id) AS last_id
              FROM solicitudes
              GROUP BY user_id
            ) ult ON s.id = ult.last_id
          `
      }
      INNER JOIN students st ON s.user_id = st.id
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

    const todosNormalizados: ReporteRechazadaItem[] = rows.map((row) => {
      const estatusNorm = normalizarEstatusCierre(row.estatus)
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
        estatus: estatusNorm,
        fecha_rechazo: serializarFechaISO(row.fecha_rechazo),
        promedio_notas: formatearDecimal(row.promedio_notas),
        indice_global: formatearDecimal(row.indice_global),
        puntaje_baremo: puntajeBaremo,
        tipo_beca:
          normalizarTipoBecaOficial(row.tipo_beca) ||
          String(row.tipo_beca || "No especificado"),
        motivo_rechazo: String(
          row.motivo_rechazo ||
            (estatusNorm === "Finalizada"
              ? "Acabó su periodo académico"
              : "Sin motivo especificado")
        ),
        nombre: String(row.nombre || ""),
        apellido: String(row.apellido || ""),
        cedula: String(row.cedula || ""),
        carrera: String(row.carrera || "---"),
        semestre: Number(row.semestre || 1),
        periodo: String(row.periodo || "Periodo no registrado"),
        periodo_codigo: String(row.periodo_codigo || "S/P"),
      }
    })

    const totalRechazadas = todosNormalizados.filter(
      (item) => item.estatus === "Rechazada"
    ).length
    const totalFinalizadas = todosNormalizados.filter(
      (item) => item.estatus === "Finalizada"
    ).length

    const filtroEstatus = filtros.estatus ?? "Todas"
    const data =
      filtroEstatus === "Rechazada" || filtroEstatus === "Finalizada"
        ? todosNormalizados.filter((item) => item.estatus === filtroEstatus)
        : todosNormalizados

    return {
      success: true,
      data,
      stats: {
        totalRegistros: todosNormalizados.length,
        totalRechazadas,
        totalFinalizadas,
      },
    }
  } catch (error) {
    console.error("Error en obtenerReporteRechazadas:", error)
    return {
      success: false,
      data: [],
      stats: {
        totalRegistros: 0,
        totalRechazadas: 0,
        totalFinalizadas: 0,
      },
      error: "No fue posible consultar el reporte de solicitudes rechazadas y finalizadas.",
    }
  }
}
