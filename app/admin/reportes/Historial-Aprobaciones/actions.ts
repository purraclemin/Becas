"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

interface HistorialAprobacionSQLRow extends RowDataPacket {
  id: number
  solicitud_id: number
  user_id: number
  periodo_id: number
  admin_id: number
  promedio_ciclo: number | string | null
  trimestre: number | null
  puntaje_baremo_: number | null
  nivel_riesgo: string | null
  tipo_beca_snapshot: string | null
  estatus_previo: string | null
  estatus_nuevo: string | null
  observacion_admin: string | null
  materias_snapshot_json: string | null
  indice_global_snapshot: number | string | null
  fecha_aprobacion: Date | string | null
  token_verificacion: string | null
  ip_accion: string | null
  email_institucional: string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string | null
  periodo_nombre: string | null
  periodo_codigo: string | null
}

export interface HistorialAprobacionItem {
  id: number
  solicitud_id: number
  user_id: number
  periodo_id: number
  admin_id: number
  promedio_ciclo: string
  indice_global_snapshot: string
  trimestre: number
  puntaje_baremo: number
  nivel_riesgo: string
  tipo_beca_snapshot: string
  estatus_previo: string
  estatus_nuevo: string
  observacion_admin: string | null
  es_cambio_departamento: boolean
  departamento_anterior: string | null
  departamento_nuevo: string | null
  materias_snapshot_json: string | null
  fecha_aprobacion: string
  ip_accion: string
  email_institucional: string
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  periodo_nombre: string
  periodo_codigo: string
}

export interface FiltrosHistorialAprobaciones {
  fechaInicio?: string
  fechaFin?: string
  fechaDesde?: string
  fechaHasta?: string
  search?: string
}

export interface RespuestaHistorialAprobaciones {
  success: boolean
  data: HistorialAprobacionItem[]
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

function extraerCambioDepartamento(
  estatusPrevio: string,
  estatusNuevo: string,
  observacion: string | null
): {
  esCambio: boolean
  departamentoAnterior: string | null
  departamentoNuevo: string | null
} {
  const obs = (observacion || "").trim()
  const match = /^Reasignaci[oó]n de Departamento:\s*(.+?)\s*(?:→|->)\s*([^|\r\n]+)/i.exec(obs)

  if (match) {
    return {
      esCambio: true,
      departamentoAnterior: match[1].trim(),
      departamentoNuevo: match[2].trim(),
    }
  }

  const esAprobadaAAprobada =
    estatusPrevio.trim().toLowerCase() === "aprobada" &&
    estatusNuevo.trim().toLowerCase() === "aprobada" &&
    (obs.toLowerCase().includes("departamento") || obs === "")

  if (esAprobadaAAprobada) {
    return {
      esCambio: true,
      departamentoAnterior: null,
      departamentoNuevo: null,
    }
  }

  return {
    esCambio: false,
    departamentoAnterior: null,
    departamentoNuevo: null,
  }
}

/**
 * Obtiene la bitácora completa de decisiones ordenada estrictamente
 * por fecha y hora más reciente primero (DESC), con detección explícita
 * de cambios de departamento y soporte de búsqueda insensible a mayúsculas
 * y rango de fechas (Desde / Hasta).
 */
export async function obtenerReporteHistorialAprobaciones(
  filtros: FiltrosHistorialAprobaciones = {}
): Promise<RespuestaHistorialAprobaciones> {
  try {
    let sql = `
      SELECT
        h.id,
        h.solicitud_id,
        h.user_id,
        h.periodo_id,
        h.admin_id,
        h.promedio_ciclo,
        h.trimestre,
        h.puntaje_baremo_,
        h.nivel_riesgo,
        h.tipo_beca_snapshot,
        h.estatus_previo,
        h.estatus_nuevo,
        h.observacion_admin,
        h.materias_snapshot_json,
        h.indice_global_snapshot,
        h.fecha_aprobacion,
        h.token_verificacion,
        h.ip_accion,
        IFNULL(NULLIF(TRIM(s.email_institucional), ''), st.email) AS email_institucional,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        IFNULL(p.nombre, 'Periodo no registrado') AS periodo_nombre,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo
      FROM historial_aprobaciones h
      JOIN students st ON h.user_id = st.id
      LEFT JOIN solicitudes s ON h.solicitud_id = s.id
      LEFT JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE 1=1
    `

    const params: Array<string | number> = []

    const desde = (filtros.fechaDesde || filtros.fechaInicio || "").trim()
    const hasta = (filtros.fechaHasta || filtros.fechaFin || "").trim()

    if (desde && hasta) {
      sql += ` AND h.fecha_aprobacion BETWEEN ? AND ?`
      params.push(`${desde} 00:00:00`, `${hasta} 23:59:59`)
    } else if (desde) {
      sql += ` AND h.fecha_aprobacion >= ?`
      params.push(`${desde} 00:00:00`)
    } else if (hasta) {
      sql += ` AND h.fecha_aprobacion <= ?`
      params.push(`${hasta} 23:59:59`)
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
          OR LOWER(IFNULL(h.estatus_nuevo, '')) LIKE ?
          OR LOWER(IFNULL(h.tipo_beca_snapshot, '')) LIKE ?
          OR LOWER(IFNULL(h.observacion_admin, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term, term)
    }

    sql += ` ORDER BY h.fecha_aprobacion DESC, h.id DESC`

    const rows = await queryFresh<HistorialAprobacionSQLRow[]>(sql, params)

    const data: HistorialAprobacionItem[] = rows.map((row) => {
      const estatusPrevio = String(row.estatus_previo || "---")
      const estatusNuevo = String(row.estatus_nuevo || "---")
      const observacionLimpia = row.observacion_admin
        ? String(row.observacion_admin).trim()
        : null
      const cambioDepto = extraerCambioDepartamento(
        estatusPrevio,
        estatusNuevo,
        observacionLimpia
      )

      return {
        id: Number(row.id),
        solicitud_id: Number(row.solicitud_id),
        user_id: Number(row.user_id),
        periodo_id: Number(row.periodo_id),
        admin_id: Number(row.admin_id),
        promedio_ciclo: formatearDecimal(row.promedio_ciclo),
        indice_global_snapshot: formatearDecimal(row.indice_global_snapshot),
        trimestre: Number(row.trimestre ?? 1),
        puntaje_baremo: Number(row.puntaje_baremo_ ?? 0),
        nivel_riesgo: String(row.nivel_riesgo || "Bajo"),
        tipo_beca_snapshot:
          normalizarTipoBecaOficial(row.tipo_beca_snapshot) ||
          String(row.tipo_beca_snapshot || "No especificado"),
        estatus_previo: estatusPrevio,
        estatus_nuevo: estatusNuevo,
        observacion_admin: observacionLimpia,
        es_cambio_departamento: cambioDepto.esCambio,
        departamento_anterior: cambioDepto.departamentoAnterior,
        departamento_nuevo: cambioDepto.departamentoNuevo,
        materias_snapshot_json: row.materias_snapshot_json
          ? String(row.materias_snapshot_json)
          : null,
        fecha_aprobacion: serializarFechaISO(row.fecha_aprobacion),
        ip_accion: String(row.ip_accion || "127.0.0.1"),
        email_institucional: String(row.email_institucional || "---"),
        nombre: String(row.nombre || ""),
        apellido: String(row.apellido || ""),
        cedula: String(row.cedula || ""),
        carrera: String(row.carrera || "No definida"),
        periodo_nombre: String(row.periodo_nombre || "Periodo no registrado"),
        periodo_codigo: String(row.periodo_codigo || "S/P"),
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error("❌ Error en obtenerReporteHistorialAprobaciones:", error)
    return {
      success: false,
      data: [],
      error: "No se pudo consultar el historial de decisiones.",
    }
  }
}
