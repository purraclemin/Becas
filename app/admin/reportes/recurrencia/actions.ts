"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

interface RecurrenciaSQLRow extends RowDataPacket {
  student_id: number
  cedula: string
  nombre: string
  apellido: string
  carrera: string
  beca_perdida: number
  total_beneficios_sql: number
  periodos_sol_aprob: string | null
  periodos_hist_aprob: string | null
  periodos_sol_rech: string | null
  periodos_hist_rech: string | null
  fue_rechazado: number
  estatus_final: string | null
  tipo_beca_reciente: string | null
  motivo_rechazo: string | null
}

export interface ReporteRecurrenciaItem {
  student_id: number
  cedula: string
  nombre: string
  apellido: string
  carrera: string
  beca_perdida: boolean
  total_beneficios: number
  periodos_beneficiados: string[]
  periodos_rechazados: string[]
  fue_rechazado: boolean
  es_finalizado: boolean
  estatus_final: string
  tipo_beca_reciente: string
  motivo_rechazo: string | null
}

export interface StatsRecurrenciaReporte {
  totalEvaluados: number
  totalActivos: number
  totalFinalizados: number
  totalRechazados: number
}

export interface FiltrosReporteRecurrencia {
  search?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface RespuestaReporteRecurrencia {
  success: boolean
  data: ReporteRecurrenciaItem[]
  stats: StatsRecurrenciaReporte
  error?: string
}

function combinarPeriodosUnicos(
  primario: string | null,
  secundario: string | null
): string[] {
  const resultado: string[] = []
  const vistos = new Set<string>()

  const agregarDesdeTexto = (raw: string | null) => {
    if (!raw) return
    const partes = String(raw)
      .split("||")
      .map((p) => p.trim())
      .filter(Boolean)

    for (const p of partes) {
      const clave = p.toLowerCase()
      if (!vistos.has(clave)) {
        vistos.add(clave)
        resultado.push(p)
      }
    }
  }

  agregarDesdeTexto(primario)
  agregarDesdeTexto(secundario)

  return resultado
}

/**
 * Consulta la recurrencia trimestral completa por estudiante unificando
 * periodos aprobados, finalizados y rechazados de `solicitudes` y `historial_aprobaciones`,
 * separando claramente Activos, Finalizadas (sin sanción) y Rechazados (baja).
 */
export async function obtenerReporteRecurrencia(
  entrada?: string | FiltrosReporteRecurrencia
): Promise<RespuestaReporteRecurrencia> {
  try {
    const filtros: FiltrosReporteRecurrencia =
      typeof entrada === "string" ? { search: entrada } : entrada ?? {}

    const limpio = (filtros.search || "").trim().toLowerCase()
    const desde = (filtros.fechaDesde || "").trim()
    const hasta = (filtros.fechaHasta || "").trim()

    const params: Array<string | number> = []
    let filtroSearchSql = ""
    let filtroFechaSql = ""

    if (desde && hasta) {
      const inicioTs = `${desde} 00:00:00`
      const finTs = `${hasta} 23:59:59`
      filtroFechaSql = `
        AND (
          EXISTS (
            SELECT 1
            FROM solicitudes s_dt
            WHERE s_dt.user_id = st.id
              AND COALESCE(s_dt.fecha_decision, s_dt.fecha_registro) BETWEEN ? AND ?
          )
          OR EXISTS (
            SELECT 1
            FROM historial_aprobaciones h_dt
            WHERE h_dt.user_id = st.id
              AND h_dt.fecha_aprobacion BETWEEN ? AND ?
          )
        )
      `
      params.push(inicioTs, finTs, inicioTs, finTs)
    } else if (desde) {
      const inicioTs = `${desde} 00:00:00`
      filtroFechaSql = `
        AND (
          EXISTS (
            SELECT 1
            FROM solicitudes s_dt
            WHERE s_dt.user_id = st.id
              AND COALESCE(s_dt.fecha_decision, s_dt.fecha_registro) >= ?
          )
          OR EXISTS (
            SELECT 1
            FROM historial_aprobaciones h_dt
            WHERE h_dt.user_id = st.id
              AND h_dt.fecha_aprobacion >= ?
          )
        )
      `
      params.push(inicioTs, inicioTs)
    } else if (hasta) {
      const finTs = `${hasta} 23:59:59`
      filtroFechaSql = `
        AND (
          EXISTS (
            SELECT 1
            FROM solicitudes s_dt
            WHERE s_dt.user_id = st.id
              AND COALESCE(s_dt.fecha_decision, s_dt.fecha_registro) <= ?
          )
          OR EXISTS (
            SELECT 1
            FROM historial_aprobaciones h_dt
            WHERE h_dt.user_id = st.id
              AND h_dt.fecha_aprobacion <= ?
          )
        )
      `
      params.push(finTs, finTs)
    }

    if (limpio !== "") {
      const term = `%${limpio}%`
      filtroSearchSql = `
        AND (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(st.carrera) LIKE ?
        )
      `
      params.push(term, term, term, term, term)
    }

    const sql = `
      SELECT
        st.id AS student_id,
        st.cedula,
        st.nombre,
        st.apellido,
        st.carrera,
        IFNULL(st.beca_perdida, 0) AS beca_perdida,
        GREATEST(
          IFNULL((
            SELECT COUNT(DISTINCT s_ap.periodo_id)
            FROM solicitudes s_ap
            WHERE s_ap.user_id = st.id
              AND LOWER(TRIM(s_ap.estatus)) IN ('aprobada', 'aprobado')
          ), 0),
          IFNULL((
            SELECT COUNT(DISTINCT h_ap.periodo_id)
            FROM historial_aprobaciones h_ap
            WHERE h_ap.user_id = st.id
              AND LOWER(TRIM(h_ap.estatus_nuevo)) IN ('aprobada', 'aprobado')
          ), 0)
        ) AS total_beneficios_sql,
        (
          SELECT GROUP_CONCAT(DISTINCT p_sa.nombre ORDER BY p_sa.fecha_inicio ASC SEPARATOR '||')
          FROM solicitudes s_ap2
          JOIN periodos_academicos p_sa ON s_ap2.periodo_id = p_sa.id
          WHERE s_ap2.user_id = st.id
            AND LOWER(TRIM(s_ap2.estatus)) IN ('aprobada', 'aprobado')
        ) AS periodos_sol_aprob,
        (
          SELECT GROUP_CONCAT(DISTINCT p_ha.nombre ORDER BY p_ha.fecha_inicio ASC SEPARATOR '||')
          FROM historial_aprobaciones h_ap2
          JOIN periodos_academicos p_ha ON h_ap2.periodo_id = p_ha.id
          WHERE h_ap2.user_id = st.id
            AND LOWER(TRIM(h_ap2.estatus_nuevo)) IN ('aprobada', 'aprobado')
        ) AS periodos_hist_aprob,
        (
          SELECT GROUP_CONCAT(DISTINCT p_sr.nombre ORDER BY p_sr.fecha_inicio ASC SEPARATOR '||')
          FROM solicitudes s_re2
          JOIN periodos_academicos p_sr ON s_re2.periodo_id = p_sr.id
          WHERE s_re2.user_id = st.id
            AND LOWER(TRIM(s_re2.estatus)) IN ('rechazada', 'rechazado')
        ) AS periodos_sol_rech,
        (
          SELECT GROUP_CONCAT(DISTINCT p_hr.nombre ORDER BY p_hr.fecha_inicio ASC SEPARATOR '||')
          FROM historial_aprobaciones h_re2
          JOIN periodos_academicos p_hr ON h_re2.periodo_id = p_hr.id
          WHERE h_re2.user_id = st.id
            AND LOWER(TRIM(h_re2.estatus_nuevo)) IN ('rechazada', 'rechazado')
        ) AS periodos_hist_rech,
        CASE
          WHEN IFNULL(st.beca_perdida, 0) = 1
            OR EXISTS (
              SELECT 1 FROM solicitudes s_r
              WHERE s_r.user_id = st.id
                AND LOWER(TRIM(s_r.estatus)) IN ('rechazada', 'rechazado')
            )
            OR EXISTS (
              SELECT 1 FROM historial_aprobaciones h_r
              WHERE h_r.user_id = st.id
                AND LOWER(TRIM(h_r.estatus_nuevo)) IN ('rechazada', 'rechazado')
            )
          THEN 1
          ELSE 0
        END AS fue_rechazado,
        CASE
          WHEN IFNULL(st.beca_perdida, 0) = 1
            OR EXISTS (
              SELECT 1 FROM solicitudes s_r2
              WHERE s_r2.user_id = st.id
                AND LOWER(TRIM(s_r2.estatus)) IN ('rechazada', 'rechazado')
            )
            OR EXISTS (
              SELECT 1 FROM historial_aprobaciones h_r2
              WHERE h_r2.user_id = st.id
                AND LOWER(TRIM(h_r2.estatus_nuevo)) IN ('rechazada', 'rechazado')
            )
          THEN 'Rechazada'
          ELSE IFNULL(
            (
              SELECT s_ult.estatus
              FROM solicitudes s_ult
              WHERE s_ult.user_id = st.id
              ORDER BY s_ult.periodo_id DESC, s_ult.id DESC
              LIMIT 1
            ),
            'Aprobada'
          )
        END AS estatus_final,
        IFNULL(
          (
            SELECT s_tb.tipo_beca
            FROM solicitudes s_tb
            WHERE s_tb.user_id = st.id
            ORDER BY s_tb.periodo_id DESC, s_tb.id DESC
            LIMIT 1
          ),
          (
            SELECT h_tb.tipo_beca_snapshot
            FROM historial_aprobaciones h_tb
            WHERE h_tb.user_id = st.id
            ORDER BY h_tb.fecha_aprobacion DESC, h_tb.id DESC
            LIMIT 1
          )
        ) AS tipo_beca_reciente,
        COALESCE(
          (
            SELECT NULLIF(TRIM(s_mr.observaciones_admin), '')
            FROM solicitudes s_mr
            WHERE s_mr.user_id = st.id
              AND LOWER(TRIM(s_mr.estatus)) IN ('rechazada', 'rechazado', 'finalizada')
            ORDER BY s_mr.periodo_id DESC, s_mr.id DESC
            LIMIT 1
          ),
          (
            SELECT NULLIF(TRIM(h_mr.observacion_admin), '')
            FROM historial_aprobaciones h_mr
            WHERE h_mr.user_id = st.id
              AND LOWER(TRIM(h_mr.estatus_nuevo)) IN ('rechazada', 'rechazado', 'finalizada')
            ORDER BY h_mr.fecha_aprobacion DESC, h_mr.id DESC
            LIMIT 1
          ),
          NULLIF(TRIM(st.motivo_exclusion), '')
        ) AS motivo_rechazo
      FROM students st
      WHERE (
        EXISTS (
          SELECT 1
          FROM solicitudes s_ex
          WHERE s_ex.user_id = st.id
            AND LOWER(TRIM(s_ex.estatus)) IN ('aprobada', 'aprobado', 'rechazada', 'rechazado', 'finalizada')
        )
        OR EXISTS (
          SELECT 1
          FROM historial_aprobaciones h_ex
          WHERE h_ex.user_id = st.id
            AND LOWER(TRIM(h_ex.estatus_nuevo)) IN ('aprobada', 'aprobado', 'rechazada', 'rechazado', 'finalizada')
        )
        OR IFNULL(st.beca_perdida, 0) = 1
      )
      ${filtroFechaSql}
      ${filtroSearchSql}
      ORDER BY total_beneficios_sql DESC, fue_rechazado ASC, st.apellido ASC, st.nombre ASC
    `

    const rows = await queryFresh<RecurrenciaSQLRow[]>(sql, params)

    const data: ReporteRecurrenciaItem[] = rows
      .map((row) => {
        const periodosAprobados = combinarPeriodosUnicos(
          row.periodos_sol_aprob,
          row.periodos_hist_aprob
        )
        const periodosRechazados = combinarPeriodosUnicos(
          row.periodos_sol_rech,
          row.periodos_hist_rech
        )
        const totalBeneficios = Math.max(
          periodosAprobados.length,
          Number(row.total_beneficios_sql ?? 0)
        )
        const estatusCrudo = String(row.estatus_final || "Aprobada").trim()
        const fueRechazado =
          Number(row.fue_rechazado) === 1 ||
          estatusCrudo.toLowerCase().includes("rechaz")
        const esFinalizado =
          !fueRechazado && estatusCrudo.toLowerCase() === "finalizada"

        return {
          student_id: Number(row.student_id),
          cedula: String(row.cedula || ""),
          nombre: String(row.nombre || ""),
          apellido: String(row.apellido || ""),
          carrera: String(row.carrera || "---"),
          beca_perdida: Number(row.beca_perdida) === 1,
          total_beneficios: totalBeneficios,
          periodos_beneficiados: periodosAprobados,
          periodos_rechazados: periodosRechazados,
          fue_rechazado: fueRechazado,
          es_finalizado: esFinalizado,
          estatus_final: fueRechazado
            ? "Rechazada"
            : esFinalizado
              ? "Finalizada"
              : estatusCrudo,
          tipo_beca_reciente:
            normalizarTipoBecaOficial(row.tipo_beca_reciente) ||
            String(row.tipo_beca_reciente || "No especificado"),
          motivo_rechazo: row.motivo_rechazo ? String(row.motivo_rechazo).trim() : null,
        }
      })
      .sort((a, b) => {
        if (b.total_beneficios !== a.total_beneficios) {
          return b.total_beneficios - a.total_beneficios
        }
        if (a.fue_rechazado !== b.fue_rechazado) {
          return a.fue_rechazado ? 1 : -1
        }
        return a.apellido.localeCompare(b.apellido, "es")
      })

    const totalRechazados = data.filter((r) => r.fue_rechazado).length
    const totalFinalizados = data.filter((r) => r.es_finalizado).length
    const totalActivos = data.length - totalRechazados - totalFinalizados

    return {
      success: true,
      data,
      stats: {
        totalEvaluados: data.length,
        totalActivos,
        totalFinalizados,
        totalRechazados,
      },
    }
  } catch (error) {
    console.error("Error en obtenerReporteRecurrencia:", error)
    return {
      success: false,
      data: [],
      stats: {
        totalEvaluados: 0,
        totalActivos: 0,
        totalFinalizados: 0,
        totalRechazados: 0,
      },
      error: "No fue posible consultar el reporte de recurrencia trimestral.",
    }
  }
}
