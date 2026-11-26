"use server"

import type { RowDataPacket } from "mysql2/promise"
import type { Alignment, Borders, Fill, Font, Workbook } from "exceljs"
import nodemailer from "nodemailer"
import { queryFresh } from "@/lib/db"
import {
  REGLAMENTO_TIPOS_BECA,
  normalizarTipoBecaOficial,
  obtenerVariantesTipoBeca,
} from "@/lib/RecordAcademicoUtils"

export interface ReporteAprobadaRow extends RowDataPacket {
  fecha_aprobacion: Date | string
  puntaje_baremo_: number
  tipo_beca_snapshot: string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  periodo: string
}

export interface ReporteRechazadaRow extends RowDataPacket {
  fecha_aprobacion: Date | string
  puntaje_baremo_: number
  tipo_beca_snapshot: string | null
  observacion_admin: string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string
  periodo: string
}

export interface ReporteRecurrenciaRow extends RowDataPacket {
  student_id: number
  cedula: string
  nombre: string
  apellido: string
  carrera: string
  beca_perdida: number
  total_beneficios: number
  periodos_beneficiados: string | null
  periodos_rechazados: string | null
  fue_rechazado: number
  estatus_final: string
  tipo_beca_reciente: string | null
  motivo_rechazo: string | null
}

export interface ReporteSolicitudFechaRow extends RowDataPacket {
  fecha_registro: Date | string
  tipo_beca: string
  estatus: string
  nombre: string
  apellido: string
  cedula: string
  carrera: string
}

export interface ReporteDistribucionCarreraRow extends RowDataPacket {
  carrera: string
  total_solicitudes: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
}

export interface ReporteAuditoriaAdminRow extends RowDataPacket {
  fecha_aprobacion: Date | string
  estatus_previo: string
  estatus_nuevo: string
  ip_accion: string | null
  admin_email: string
  alumno_nombre: string
  alumno_apellido: string
  alumno_cedula: string
}

export interface ReporteTipoBecaRow extends RowDataPacket {
  tipo_beca: string
  total: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
}

// ============================================================================
// NUEVAS INTERFACES: REPORTE EN REVISIÓN Y BECARIOS POR DEPARTAMENTO
// ============================================================================

export interface FiltrosReporteEnRevision {
  search?: string
  carrera?: string
  tipoBeca?: string
}

export interface ReporteEnRevisionRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  nombre: string
  apellido: string
  cedula: string
  email_institucional: string | null
  tipo_beca: string
  carrera: string
  semestre: number
  promedio_notas: number | string | null
  indice_global: number | string | null
  puntaje_estudiante: number | null
  puntaje_admin: number | null
  nivel_riesgo_admin: string | null
  observaciones_admin: string | null
  periodo_id: number | null
  periodo_origen_codigo: string | null
  periodo_origen_nombre: string | null
  fecha_registro: Date | string | null
}

export interface ResumenCupoModalidad {
  modalidad: string
  enRevisionLote: number
  aprobadosPeriodoActual: number
  cupoMaximo: number | null
  disponibles: number | null
}

export interface PeriodoResumenBasico {
  id: number
  codigo: string
  nombre: string
}

export interface RespuestaReporteEnRevision {
  success: boolean
  data: ReporteEnRevisionRow[]
  cuposResumen: ResumenCupoModalidad[]
  periodoActual: PeriodoResumenBasico | null
  error?: string
}

export interface RespuestaEnvioSecretaria {
  success: boolean
  destinatario?: string
  totalEnviados?: number
  fechaEnvio?: string
  message?: string
  error?: string
}

export interface BecarioDepartamentoRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  departamento_asignado: string | null
  nombre: string
  apellido: string
  cedula: string
  email: string | null
  telefono: string | null
  carrera: string
  semestre: number
  tipo_beca: string
  promedio_notas: number | string | null
  indice_global: number | string | null
  periodo_id: number
  periodo_codigo: string | null
  periodo_nombre: string | null
  fecha_decision: Date | string | null
}

export interface BecarioDepartamentoItem {
  solicitudId: number
  userId: number
  departamento: string
  nombre: string
  apellido: string
  cedula: string
  email: string
  telefono: string
  carrera: string
  semestre: number
  tipoBeca: string
  promedioTrimestral: string
  indiceGlobal: string
  periodoCodigo: string
  periodoNombre: string
  fechaDecision: string
}

export interface DepartamentoAgrupadoReporte {
  departamento: string
  sinAsignar: boolean
  totalEstudiantes: number
  promedioGeneral: string
  resumenModalidades: Array<{ tipoBeca: string; cantidad: number }>
  estudiantes: BecarioDepartamentoItem[]
}

export interface StatsDepartamentosReporte {
  totalDepartamentosActivos: number
  totalBecariosAsignados: number
  totalSinDepartamento: number
  totalBecarios: number
}

export interface PeriodoOpcionReporte extends RowDataPacket {
  id: number
  codigo: string
  nombre: string
  es_actual: number
}

export interface RespuestaReporteDepartamentos {
  success: boolean
  departamentos: DepartamentoAgrupadoReporte[]
  stats: StatsDepartamentosReporte
  periodos: Array<{
    id: number
    codigo: string
    nombre: string
    esActual: boolean
  }>
  periodoSeleccionado: number | "todos"
  error?: string
}

interface AprobadosPorBecaRow extends RowDataPacket {
  tipo_beca: string | null
  total: number
}

interface SecretariaEmailRow extends RowDataPacket {
  email: string | null
}

interface ExcelJSModuleShape {
  Workbook?: new () => Workbook
  default?: {
    Workbook?: new () => Workbook
  }
}

type MailTransporter = ReturnType<typeof nodemailer.createTransport>

const EMAIL_SECRETARIA_DEFECTO = "SecretariaGeneral@unimar.edu.ve"

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function crearTransporterSMTP(): {
  transporter: MailTransporter | null
  smtpUser: string
  errorConfig?: string
} {
  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim()
  const port = Number(process.env.SMTP_PORT || 587)
  const smtpUser = (process.env.SMTP_USER || "").trim()
  const smtpPass = (process.env.SMTP_PASS || "").trim()

  if (!smtpUser || !smtpPass) {
    return {
      transporter: null,
      smtpUser: "",
      errorConfig:
        "Credenciales SMTP no configuradas en el servidor (verifique SMTP_USER y SMTP_PASS en .env o Vercel).",
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  return { transporter, smtpUser }
}

function formatearDecimal(valor: number | string | null | undefined): string {
  const num = Number(valor ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : "0.00"
}

function construirFiltroNombreCedula(
  search?: string,
  alias: string = "st"
): { clause: string; params: string[] } {
  const limpio = (search || "").trim().toLowerCase()
  if (limpio === "") {
    return { clause: "", params: [] }
  }
  const term = `%${limpio}%`
  return {
    clause: `
      AND (
        LOWER(${alias}.nombre) LIKE ?
        OR LOWER(${alias}.apellido) LIKE ?
        OR LOWER(CONCAT(${alias}.nombre, ' ', ${alias}.apellido)) LIKE ?
        OR LOWER(${alias}.cedula) LIKE ?
      )
    `,
    params: [term, term, term, term],
  }
}

/**
 * REPORTE: Becas Aprobadas por Fecha y/o Búsqueda por Nombre/Cédula
 */
export async function reporteAprobadasPorFecha(
  inicio?: string,
  fin?: string,
  search?: string
): Promise<{ success: boolean; data: ReporteAprobadaRow[] }> {
  try {
    let sql = `
      SELECT 
        h.fecha_aprobacion,
        h.puntaje_baremo_,
        h.tipo_beca_snapshot,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        p.nombre AS periodo
      FROM historial_aprobaciones h
      JOIN students st ON h.user_id = st.id
      JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE h.estatus_nuevo = 'Aprobada'
    `
    const params: Array<string | number> = []

    if (inicio && fin) {
      sql += ` AND h.fecha_aprobacion BETWEEN ? AND ?`
      params.push(`${inicio} 00:00:00`, `${fin} 23:59:59`)
    }

    const filtro = construirFiltroNombreCedula(search, "st")
    if (filtro.clause) {
      sql += filtro.clause
      params.push(...filtro.params)
    }

    sql += ` ORDER BY h.fecha_aprobacion DESC`

    const rows = await queryFresh<ReporteAprobadaRow[]>(sql, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Error en reporteAprobadasPorFecha:", error)
    return { success: false, data: [] }
  }
}

/**
 * REPORTE: Becas Rechazadas por Fecha y/o Búsqueda por Nombre/Cédula
 */
export async function reporteRechazadasPorFecha(
  inicio?: string,
  fin?: string,
  search?: string
): Promise<{ success: boolean; data: ReporteRechazadaRow[] }> {
  try {
    let sql = `
      SELECT 
        h.fecha_aprobacion,
        h.puntaje_baremo_,
        h.tipo_beca_snapshot,
        h.observacion_admin,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        p.nombre AS periodo
      FROM historial_aprobaciones h
      JOIN students st ON h.user_id = st.id
      JOIN periodos_academicos p ON h.periodo_id = p.id
      WHERE h.estatus_nuevo = 'Rechazada'
    `
    const params: Array<string | number> = []

    if (inicio && fin) {
      sql += ` AND h.fecha_aprobacion BETWEEN ? AND ?`
      params.push(`${inicio} 00:00:00`, `${fin} 23:59:59`)
    }

    const filtro = construirFiltroNombreCedula(search, "st")
    if (filtro.clause) {
      sql += filtro.clause
      params.push(...filtro.params)
    }

    sql += ` ORDER BY h.fecha_aprobacion DESC`

    const rows = await queryFresh<ReporteRechazadaRow[]>(sql, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Error en reporteRechazadasPorFecha:", error)
    return { success: false, data: [] }
  }
}

/**
 * REPORTE: Recurrencia Trimestral (Histórico completo por estudiante)
 */
export async function reporteRecurrenciaAlumnos(
  search?: string
): Promise<{ success: boolean; data: ReporteRecurrenciaRow[] }> {
  try {
    const filtro = construirFiltroNombreCedula(search, "st")
    const params: Array<string | number> = [...filtro.params]

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
            WHERE s_ap.user_id = st.id AND s_ap.estatus = 'Aprobada'
          ), 0),
          IFNULL((
            SELECT COUNT(DISTINCT h_ap.periodo_id)
            FROM historial_aprobaciones h_ap
            WHERE h_ap.user_id = st.id AND h_ap.estatus_nuevo = 'Aprobada'
          ), 0)
        ) AS total_beneficios,
        IFNULL(
          (
            SELECT GROUP_CONCAT(DISTINCT p_ap.nombre ORDER BY p_ap.fecha_inicio ASC SEPARATOR ', ')
            FROM historial_aprobaciones h_ap2
            JOIN periodos_academicos p_ap ON h_ap2.periodo_id = p_ap.id
            WHERE h_ap2.user_id = st.id AND h_ap2.estatus_nuevo = 'Aprobada'
          ),
          (
            SELECT GROUP_CONCAT(DISTINCT p_ap3.nombre ORDER BY p_ap3.fecha_inicio ASC SEPARATOR ', ')
            FROM solicitudes s_ap2
            JOIN periodos_academicos p_ap3 ON s_ap2.periodo_id = p_ap3.id
            WHERE s_ap2.user_id = st.id AND s_ap2.estatus = 'Aprobada'
          )
        ) AS periodos_beneficiados,
        IFNULL(
          (
            SELECT GROUP_CONCAT(DISTINCT p_re.nombre ORDER BY p_re.fecha_inicio ASC SEPARATOR ', ')
            FROM historial_aprobaciones h_re
            JOIN periodos_academicos p_re ON h_re.periodo_id = p_re.id
            WHERE h_re.user_id = st.id AND h_re.estatus_nuevo = 'Rechazada'
          ),
          (
            SELECT GROUP_CONCAT(DISTINCT p_re2.nombre ORDER BY p_re2.fecha_inicio ASC SEPARATOR ', ')
            FROM solicitudes s_re
            JOIN periodos_academicos p_re2 ON s_re.periodo_id = p_re2.id
            WHERE s_re.user_id = st.id AND s_re.estatus = 'Rechazada'
          )
        ) AS periodos_rechazados,
        CASE
          WHEN IFNULL(st.beca_perdida, 0) = 1
            OR EXISTS (SELECT 1 FROM solicitudes s_r WHERE s_r.user_id = st.id AND s_r.estatus = 'Rechazada')
            OR EXISTS (SELECT 1 FROM historial_aprobaciones h_r WHERE h_r.user_id = st.id AND h_r.estatus_nuevo = 'Rechazada')
          THEN 1
          ELSE 0
        END AS fue_rechazado,
        CASE
          WHEN IFNULL(st.beca_perdida, 0) = 1
            OR EXISTS (SELECT 1 FROM solicitudes s_r2 WHERE s_r2.user_id = st.id AND s_r2.estatus = 'Rechazada')
            OR EXISTS (SELECT 1 FROM historial_aprobaciones h_r2 WHERE h_r2.user_id = st.id AND h_r2.estatus_nuevo = 'Rechazada')
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
        IFNULL(
          (
            SELECT NULLIF(TRIM(s_mr.observaciones_admin), '')
            FROM solicitudes s_mr
            WHERE s_mr.user_id = st.id AND s_mr.estatus = 'Rechazada'
            ORDER BY s_mr.periodo_id DESC, s_mr.id DESC
            LIMIT 1
          ),
          IFNULL(
            (
              SELECT NULLIF(TRIM(h_mr.observacion_admin), '')
              FROM historial_aprobaciones h_mr
              WHERE h_mr.user_id = st.id AND h_mr.estatus_nuevo = 'Rechazada'
              ORDER BY h_mr.fecha_aprobacion DESC, h_mr.id DESC
              LIMIT 1
            ),
            st.motivo_exclusion
          )
        ) AS motivo_rechazo
      FROM students st
      WHERE (
        EXISTS (
          SELECT 1
          FROM historial_aprobaciones h_ex
          WHERE h_ex.user_id = st.id
            AND h_ex.estatus_nuevo IN ('Aprobada', 'Rechazada')
        )
        OR EXISTS (
          SELECT 1
          FROM solicitudes s_ex
          WHERE s_ex.user_id = st.id
            AND s_ex.estatus IN ('Aprobada', 'Rechazada')
        )
        OR IFNULL(st.beca_perdida, 0) = 1
      )
      ${filtro.clause}
      ORDER BY total_beneficios DESC, fue_rechazado ASC, st.apellido ASC
    `

    const rows = await queryFresh<ReporteRecurrenciaRow[]>(sql, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Error en reporteRecurrenciaAlumnos:", error)
    return { success: false, data: [] }
  }
}

/**
 * REPORTE: Solicitudes por rango de fecha y/o búsqueda por Nombre/Cédula
 */
export async function reporteSolicitudesPorFecha(
  inicio?: string,
  fin?: string,
  search?: string
): Promise<ReporteSolicitudFechaRow[]> {
  try {
    let sql = `
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
      WHERE 1=1
    `
    const params: Array<string | number> = []

    if (inicio && fin) {
      sql += ` AND s.fecha_registro BETWEEN ? AND ?`
      params.push(`${inicio} 00:00:00`, `${fin} 23:59:59`)
    }

    const filtro = construirFiltroNombreCedula(search, "st")
    if (filtro.clause) {
      sql += filtro.clause
      params.push(...filtro.params)
    }

    sql += ` ORDER BY s.fecha_registro DESC`

    const rows = await queryFresh<ReporteSolicitudFechaRow[]>(sql, params)
    return rows
  } catch (error) {
    console.error("Error en reporteSolicitudesPorFecha:", error)
    return []
  }
}

/**
 * REPORTE: Distribución Detallada por Carreras
 */
export async function reporteDistribucionCarreras(
  search?: string
): Promise<{ success: boolean; data: ReporteDistribucionCarreraRow[] }> {
  try {
    const limpio = (search || "").trim().toLowerCase()
    const params: Array<string | number> = []

    if (limpio !== "") {
      const term = `%${limpio}%`
      const sqlFiltrado = `
        SELECT 
          c.nombre AS carrera,
          COUNT(s.id) AS total_solicitudes,
          IFNULL(SUM(CASE WHEN s.estatus = 'Aprobada' THEN 1 ELSE 0 END), 0) AS aprobadas,
          IFNULL(SUM(CASE WHEN s.estatus = 'Rechazada' THEN 1 ELSE 0 END), 0) AS rechazadas,
          IFNULL(SUM(CASE WHEN s.estatus IN ('En Revisión', 'Pendiente', 'Convocado a Entrevista', 'Revisión Especial') THEN 1 ELSE 0 END), 0) AS en_proceso
        FROM carreras c
        JOIN students st ON LOWER(TRIM(c.nombre)) = LOWER(TRIM(st.carrera))
        JOIN solicitudes s ON st.id = s.user_id
        WHERE (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(c.nombre) LIKE ?
        )
        GROUP BY c.id, c.nombre
        ORDER BY total_solicitudes DESC
      `
      params.push(term, term, term, term, term)
      const rows = await queryFresh<ReporteDistribucionCarreraRow[]>(sqlFiltrado, params)
      return { success: true, data: rows }
    }

    const sql = `
      SELECT 
        c.nombre AS carrera,
        COUNT(s.id) AS total_solicitudes,
        IFNULL(SUM(CASE WHEN s.estatus = 'Aprobada' THEN 1 ELSE 0 END), 0) AS aprobadas,
        IFNULL(SUM(CASE WHEN s.estatus = 'Rechazada' THEN 1 ELSE 0 END), 0) AS rechazadas,
        IFNULL(SUM(CASE WHEN s.estatus IN ('En Revisión', 'Pendiente', 'Convocado a Entrevista', 'Revisión Especial') THEN 1 ELSE 0 END), 0) AS en_proceso
      FROM carreras c
      LEFT JOIN students st ON LOWER(TRIM(c.nombre)) = LOWER(TRIM(st.carrera))
      LEFT JOIN solicitudes s ON st.id = s.user_id
      GROUP BY c.id, c.nombre
      ORDER BY total_solicitudes DESC
    `
    const rows = await queryFresh<ReporteDistribucionCarreraRow[]>(sql)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Error en reporteDistribucionCarreras:", error)
    return { success: false, data: [] }
  }
}

/**
 * REPORTE: Auditoría de Administradores
 */
export async function reporteAuditoriaAdministradores(
  search?: string
): Promise<{ success: boolean; data: ReporteAuditoriaAdminRow[] }> {
  try {
    const limpio = (search || "").trim().toLowerCase()
    const params: Array<string | number> = []
    let whereClause = ""

    if (limpio !== "") {
      const term = `%${limpio}%`
      whereClause = `
        WHERE (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(u.email) LIKE ?
        )
      `
      params.push(term, term, term, term, term)
    }

    const sql = `
      SELECT 
        h.fecha_aprobacion,
        h.estatus_previo,
        h.estatus_nuevo,
        h.ip_accion,
        u.email AS admin_email,
        st.nombre AS alumno_nombre,
        st.apellido AS alumno_apellido,
        st.cedula AS alumno_cedula
      FROM historial_aprobaciones h
      JOIN users u ON h.admin_id = u.id
      JOIN students st ON h.user_id = st.id
      ${whereClause}
      ORDER BY h.fecha_aprobacion DESC
      LIMIT 200
    `
    const rows = await queryFresh<ReporteAuditoriaAdminRow[]>(sql, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Error en reporteAuditoriaAdministradores:", error)
    return { success: false, data: [] }
  }
}

/**
 * REPORTE: Tipos de Beca
 */
export async function reporteTiposDeBeca(
  search?: string
): Promise<{ success: boolean; data: ReporteTipoBecaRow[] }> {
  try {
    const limpio = (search || "").trim().toLowerCase()
    const params: Array<string | number> = []
    let whereClause = ""

    if (limpio !== "") {
      const term = `%${limpio}%`
      whereClause = `
        WHERE (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(s.tipo_beca) LIKE ?
        )
      `
      params.push(term, term, term, term, term)
    }

    const sql = `
      SELECT 
        s.tipo_beca,
        COUNT(s.id) AS total,
        IFNULL(SUM(CASE WHEN s.estatus = 'Aprobada' THEN 1 ELSE 0 END), 0) AS aprobadas,
        IFNULL(SUM(CASE WHEN s.estatus = 'Rechazada' THEN 1 ELSE 0 END), 0) AS rechazadas,
        IFNULL(SUM(CASE WHEN s.estatus IN ('En Revisión', 'Pendiente', 'Convocado a Entrevista', 'Revisión Especial') THEN 1 ELSE 0 END), 0) AS en_proceso
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      ${whereClause}
      GROUP BY s.tipo_beca
      ORDER BY total DESC
    `
    const rows = await queryFresh<ReporteTipoBecaRow[]>(sql, params)
    return { success: true, data: rows }
  } catch (error) {
    console.error("Error en reporteTiposDeBeca:", error)
    return { success: false, data: [] }
  }
}

// ============================================================================
// NUEVO REPORTE #1: EXPEDIENTES "EN REVISIÓN" PARA SECRETARÍA GENERAL
// ============================================================================

/**
 * Obtiene todos los expedientes en estatus 'En Revisión' con ambos baremos (Estudiante y Admin),
 * promedio trimestral, índice global, observaciones técnicas y balance de cupos vigentes.
 */
export async function reporteEnRevision(
  filtros: FiltrosReporteEnRevision = {}
): Promise<RespuestaReporteEnRevision> {
  try {
    const periodosActuales = await queryFresh<PeriodoOpcionReporte[]>(
      `SELECT id, codigo, nombre, es_actual FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    )
    const pActual = periodosActuales[0]
      ? {
          id: Number(periodosActuales[0].id),
          codigo: String(periodosActuales[0].codigo),
          nombre: String(periodosActuales[0].nombre),
        }
      : null

    let whereClause = ` WHERE s.estatus = 'En Revisión'`
    const params: Array<string | number> = []

    const filtroSearch = construirFiltroNombreCedula(filtros.search, "st")
    if (filtroSearch.clause) {
      whereClause += filtroSearch.clause
      params.push(...filtroSearch.params)
    }

    if (filtros.carrera && filtros.carrera.trim() !== "") {
      whereClause += ` AND LOWER(TRIM(st.carrera)) = ?`
      params.push(filtros.carrera.trim().toLowerCase())
    }

    if (filtros.tipoBeca && filtros.tipoBeca.trim() !== "") {
      const variantes = obtenerVariantesTipoBeca(filtros.tipoBeca)
      if (variantes.length > 0) {
        const placeholders = variantes.map(() => "?").join(", ")
        whereClause += ` AND LOWER(TRIM(s.tipo_beca)) IN (${placeholders})`
        params.push(...variantes)
      }
    }

    const sql = `
      SELECT
        s.id AS solicitud_id,
        s.user_id,
        st.nombre,
        st.apellido,
        st.cedula,
        IFNULL(NULLIF(TRIM(s.email_institucional), ''), st.email) AS email_institucional,
        s.tipo_beca,
        st.carrera,
        IFNULL(st.semestre, 1) AS semestre,
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        e_est.puntaje AS puntaje_estudiante,
        e_adm.puntaje AS puntaje_admin,
        e_adm.nivel_riesgo AS nivel_riesgo_admin,
        s.observaciones_admin,
        s.periodo_id,
        p.codigo AS periodo_origen_codigo,
        p.nombre AS periodo_origen_nombre,
        s.fecha_registro
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN periodos_academicos p ON s.periodo_id = p.id
      LEFT JOIN estudios_socioeconomicos e_est
        ON e_est.id = (
          SELECT MAX(es1.id)
          FROM estudios_socioeconomicos es1
          WHERE es1.student_id = st.id
            AND es1.tipo = 'estudiante'
        )
      LEFT JOIN estudios_socioeconomicos e_adm
        ON e_adm.id = (
          SELECT MAX(es2.id)
          FROM estudios_socioeconomicos es2
          WHERE es2.student_id = st.id
            AND es2.tipo = 'administrador'
        )
      ${whereClause}
      ORDER BY IFNULL(e_adm.puntaje, -1) DESC, s.promedio_notas DESC, st.apellido ASC
    `

    const [rows, aprobadosRows] = await Promise.all([
      queryFresh<ReporteEnRevisionRow[]>(sql, params),
      pActual
        ? queryFresh<AprobadosPorBecaRow[]>(
            `
            SELECT tipo_beca, COUNT(*) AS total
            FROM solicitudes
            WHERE periodo_id = ?
              AND estatus IN ('Aprobada', 'Renovacion', 'Renovación')
            GROUP BY tipo_beca
            `,
            [pActual.id]
          )
        : Promise.resolve<AprobadosPorBecaRow[]>([]),
    ])

    // Normalizar conteo de aprobados vigentes por denominación oficial
    const mapaAprobados = new Map<string, number>()
    for (const r of aprobadosRows) {
      const oficial = normalizarTipoBecaOficial(r.tipo_beca) || String(r.tipo_beca || "OTRA")
      mapaAprobados.set(oficial, (mapaAprobados.get(oficial) ?? 0) + Number(r.total || 0))
    }

    // Contar expedientes en revisión de este lote por modalidad oficial
    const mapaLote = new Map<string, number>()
    for (const row of rows) {
      const oficial = normalizarTipoBecaOficial(row.tipo_beca) || String(row.tipo_beca || "OTRA")
      mapaLote.set(oficial, (mapaLote.get(oficial) ?? 0) + 1)
    }

    const cuposResumen: ResumenCupoModalidad[] = Array.from(mapaLote.entries())
      .map(([modalidad, enRevisionLote]) => {
        const oficial = normalizarTipoBecaOficial(modalidad)
        const regla = oficial ? REGLAMENTO_TIPOS_BECA[oficial] : null
        const cupoMaximo = regla?.cupoMaximo ?? null
        const aprobadosPeriodoActual = mapaAprobados.get(modalidad) ?? 0
        const disponibles =
          cupoMaximo !== null ? Math.max(0, cupoMaximo - aprobadosPeriodoActual) : null

        return {
          modalidad,
          enRevisionLote,
          aprobadosPeriodoActual,
          cupoMaximo,
          disponibles,
        }
      })
      .sort((a, b) => b.enRevisionLote - a.enRevisionLote)

    return {
      success: true,
      data: rows,
      cuposResumen,
      periodoActual: pActual,
    }
  } catch (error) {
    console.error("Error en reporteEnRevision:", error)
    return {
      success: false,
      data: [],
      cuposResumen: [],
      periodoActual: null,
      error: "No fue posible consultar los expedientes en revisión.",
    }
  }
}

/**
 * Genera el libro Excel (.xlsx) en servidor para adjuntarlo al correo dirigido a Secretaría General.
 */
async function construirBufferExcelEnRevision(
  rows: ReporteEnRevisionRow[],
  periodoLabel: string
): Promise<Buffer> {
  const moduloImportado = (await import("exceljs")) as unknown as ExcelJSModuleShape
  const WorkbookConstructor =
    moduloImportado.Workbook ?? moduloImportado.default?.Workbook

  if (!WorkbookConstructor) {
    throw new Error("No se pudo inicializar ExcelJS en el servidor.")
  }

  const workbook = new WorkbookConstructor()
  workbook.creator = "Sistema de Becas UNIMAR"
  workbook.created = new Date()

  const columnas = [
    "Nombre",
    "Apellido",
    "Cédula",
    "Tipo de Beca",
    "Carrera",
    "Trimestre",
    "Prom. Trimestral",
    "Índice Global",
    "Baremo Estudiante",
    "Baremo Admin",
    "Diferencia",
    "Nivel Riesgo",
    "Periodo Origen",
    "Observaciones Coordinación",
  ]

  const totalCols = columnas.length
  const ws = workbook.addWorksheet("En_Revision", {
    views: [{ state: "frozen", ySplit: 5 }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  })

  const fillAzul: Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } }
  const fillClaro: Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } }
  const fillBlanco: Fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } }
  const bordeSuave: Partial<Borders> = {
    top: { style: "thin", color: { argb: "FFCBD5E1" } },
    left: { style: "thin", color: { argb: "FFCBD5E1" } },
    bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
    right: { style: "thin", color: { argb: "FFCBD5E1" } },
  }

  const f1 = ws.addRow(["UNIVERSIDAD DE MARGARITA — DEPARTAMENTO DE BIENESTAR ESTUDIANTIL"])
  ws.mergeCells(1, 1, 1, totalCols)
  f1.height = 26
  f1.getCell(1).fill = fillAzul
  f1.getCell(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } } as Partial<Font>
  f1.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 } as Partial<Alignment>

  const f2 = ws.addRow(["EXPEDIENTES EN REVISIÓN PARA DICTAMEN — SECRETARÍA GENERAL"])
  ws.mergeCells(2, 1, 2, totalCols)
  f2.height = 22
  f2.getCell(1).fill = fillClaro
  f2.getCell(1).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF1E3A5F" } } as Partial<Font>
  f2.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 } as Partial<Alignment>
  for (let c = 1; c <= totalCols; c++) {
    f2.getCell(c).border = { bottom: { style: "medium", color: { argb: "FFD4A843" } } }
  }

  const fechaEmision = new Date().toLocaleDateString("es-VE")
  const f3 = ws.addRow([
    `PERIODO VIGENTE: ${periodoLabel.toUpperCase()}   |   TOTAL EXPEDIENTES: ${rows.length}   |   EMISIÓN: ${fechaEmision}`,
  ])
  ws.mergeCells(3, 1, 3, totalCols)
  f3.height = 18
  f3.getCell(1).font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF475569" } } as Partial<Font>
  f3.getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 } as Partial<Alignment>

  ws.addRow([]).height = 8

  const fHead = ws.addRow(columnas.map((c) => c.toUpperCase()))
  fHead.height = 24
  fHead.eachCell((cell) => {
    cell.fill = fillAzul
    cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } } as Partial<Font>
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true } as Partial<Alignment>
    cell.border = {
      top: { style: "thin", color: { argb: "FF1E3A5F" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "medium", color: { argb: "FFD4A843" } },
    }
  })

  ws.autoFilter = {
    from: { row: 5, column: 1 },
    to: { row: 5, column: totalCols },
  }

  rows.forEach((r, idx) => {
    const pEst = r.puntaje_estudiante !== null && r.puntaje_estudiante !== undefined
      ? Number(r.puntaje_estudiante)
      : null
    const pAdm = r.puntaje_admin !== null && r.puntaje_admin !== undefined
      ? Number(r.puntaje_admin)
      : null
    const diff = pEst !== null && pAdm !== null ? pAdm - pEst : null

    const fila = ws.addRow([
      String(r.nombre || "---").toUpperCase(),
      String(r.apellido || "---").toUpperCase(),
      `V-${r.cedula}`,
      String(r.tipo_beca || "---").toUpperCase(),
      String(r.carrera || "---").toUpperCase(),
      `${Number(r.semestre || 1)}°`,
      Number(formatearDecimal(r.promedio_notas)),
      Number(formatearDecimal(r.indice_global)),
      pEst !== null ? pEst : "Sin estudio",
      pAdm !== null ? pAdm : "Pendiente",
      diff !== null ? (diff > 0 ? `+${diff}` : String(diff)) : "---",
      String(r.nivel_riesgo_admin || "Pendiente").toUpperCase(),
      String(r.periodo_origen_codigo || "---").toUpperCase(),
      r.observaciones_admin ? String(r.observaciones_admin).trim() : "---",
    ])

    fila.height = 20
    const fillFila = idx % 2 === 0 ? fillBlanco : fillClaro
    fila.eachCell((cell, colNumber) => {
      cell.fill = fillFila
      cell.border = bordeSuave
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF0F172A" } } as Partial<Font>
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber >= 6 && colNumber <= 13 ? "center" : "left",
        wrapText: true,
      } as Partial<Alignment>
    })
  })

  const anchos = [18, 18, 14, 32, 26, 11, 15, 13, 16, 14, 12, 14, 15, 36]
  anchos.forEach((w, i) => {
    ws.getColumn(i + 1).width = w
  })

  const rawBuffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(rawBuffer as ArrayBuffer)
}

/**
 * Envía el reporte de expedientes "En Revisión" al correo de Secretaría General
 * con tabla HTML ejecutiva, resumen de cupos y archivo Excel (.xlsx) adjunto.
 */
export async function enviarReporteEnRevisionSecretaria(
  filtros: FiltrosReporteEnRevision = {}
): Promise<RespuestaEnvioSecretaria> {
  try {
    const reporte = await reporteEnRevision(filtros)

    if (!reporte.success) {
      return {
        success: false,
        error: reporte.error || "No se pudo generar el listado para el envío.",
      }
    }

    if (reporte.data.length === 0) {
      return {
        success: false,
        error: "No existen expedientes en estatus 'En Revisión' con los filtros actuales para enviar.",
      }
    }

    const { transporter, smtpUser, errorConfig } = crearTransporterSMTP()
    if (!transporter) {
      return {
        success: false,
        error: errorConfig || "Servidor SMTP no configurado.",
      }
    }

    // Buscar correo oficial del usuario 'secretaria' en BD o usar respaldo institucional
    const secRows = await queryFresh<SecretariaEmailRow[]>(
      `SELECT email FROM users WHERE role = 'secretaria' AND email IS NOT NULL AND TRIM(email) != '' LIMIT 1`
    )
    const destinatario =
      secRows[0]?.email?.trim() ||
      process.env.SECRETARIA_GENERAL_EMAIL?.trim() ||
      EMAIL_SECRETARIA_DEFECTO

    const periodoLabel = reporte.periodoActual
      ? `${reporte.periodoActual.codigo} — ${reporte.periodoActual.nombre}`
      : "Periodo Vigente"

    const excelBuffer = await construirBufferExcelEnRevision(reporte.data, periodoLabel)
    const fechaIsoArchivo = new Date().toISOString().slice(0, 10)
    const fechaLegible = new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const filasCuposHtml = reporte.cuposResumen
      .map(
        (c) => `
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a5f;">${escaparHtml(c.modalidad)}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${c.enRevisionLote}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${c.aprobadosPeriodoActual}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${c.cupoMaximo !== null ? c.cupoMaximo : "Según pres."}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${c.disponibles === 0 ? "#be123c" : "#047857"};">${c.disponibles !== null ? c.disponibles : "Disponible"}</td>
          </tr>
        `
      )
      .join("")

    const filasExpedientesHtml = reporte.data
      .map((r, i) => {
        const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc"
        const pEst = r.puntaje_estudiante !== null && r.puntaje_estudiante !== undefined
          ? `${r.puntaje_estudiante} pts`
          : "N/A"
        const pAdm = r.puntaje_admin !== null && r.puntaje_admin !== undefined
          ? `${r.puntaje_admin} pts`
          : "Pendiente"
        return `
          <tr style="background-color: ${bg};">
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
              <strong style="color: #1e3a5f;">${escaparHtml(`${r.nombre} ${r.apellido}`)}</strong><br />
              <span style="font-size: 11px; color: #64748b;">V-${escaparHtml(r.cedula)}</span>
            </td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${escaparHtml(r.tipo_beca)}</td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${escaparHtml(r.carrera)}</td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${Number(r.semestre || 1)}°</td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">
              ${formatearDecimal(r.promedio_notas)}<br />
              <span style="font-size: 10px; color: #b8860b;">G: ${formatearDecimal(r.indice_global)}</span>
            </td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px;">
              Est: <strong>${pEst}</strong><br />
              Adm: <strong style="color: #1e3a5f;">${pAdm}</strong>
            </td>
          </tr>
        `
      })
      .join("")

    await transporter.sendMail({
      from: `"Bienestar Estudiantil — UNIMAR" <${smtpUser}>`,
      to: destinatario,
      subject: `Expedientes En Revisión (${reporte.data.length}) — Becas UNIMAR ${reporte.periodoActual?.codigo || ""}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 820px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #1e3a5f; padding: 20px 24px; border-bottom: 4px solid #d4a843;">
            <h2 style="margin: 0; color: #ffffff; font-size: 18px;">Universidad de Margarita — Secretaría General</h2>
            <p style="margin: 6px 0 0 0; color: #d4a843; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              Remisión Oficial de Expedientes En Revisión • ${escaparHtml(periodoLabel)}
            </p>
          </div>

          <div style="padding: 20px 24px;">
            <p style="font-size: 13px; line-height: 1.5; margin-top: 0;">
              Estimada <strong>Secretaría General</strong>,<br />
              El Departamento de Bienestar Estudiantil remite el listado actualizado de
              <strong>${reporte.data.length} expediente(s) en estatus En Revisión</strong> listos para su evaluación y dictamen final (Aprobación o Rechazo).
              Se adjunta el archivo en formato Excel (<code>.xlsx</code>) con el detalle completo.
            </p>

            ${
              reporte.cuposResumen.length > 0
                ? `
                  <h3 style="color: #1e3a5f; font-size: 13px; text-transform: uppercase; margin: 18px 0 8px 0;">
                    Resumen de Cupos del Periodo Vigente
                  </h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 18px;">
                    <thead>
                      <tr style="background-color: #1e3a5f; color: #ffffff;">
                        <th style="padding: 7px 10px; border: 1px solid #1e3a5f; text-align: left;">Modalidad</th>
                        <th style="padding: 7px 10px; border: 1px solid #1e3a5f;">En Revisión</th>
                        <th style="padding: 7px 10px; border: 1px solid #1e3a5f;">Aprobados</th>
                        <th style="padding: 7px 10px; border: 1px solid #1e3a5f;">Cupo Máx.</th>
                        <th style="padding: 7px 10px; border: 1px solid #1e3a5f;">Disponibles</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filasCuposHtml}
                    </tbody>
                  </table>
                `
                : ""
            }

            <h3 style="color: #1e3a5f; font-size: 13px; text-transform: uppercase; margin: 18px 0 8px 0;">
              Listado de Expedientes En Revisión (${reporte.data.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="background-color: #1e3a5f; color: #ffffff;">
                  <th style="padding: 7px 8px; border: 1px solid #1e3a5f; text-align: left;">Estudiante</th>
                  <th style="padding: 7px 8px; border: 1px solid #1e3a5f; text-align: left;">Tipo de Beca</th>
                  <th style="padding: 7px 8px; border: 1px solid #1e3a5f; text-align: left;">Carrera</th>
                  <th style="padding: 7px 8px; border: 1px solid #1e3a5f;">Trim.</th>
                  <th style="padding: 7px 8px; border: 1px solid #1e3a5f;">Prom / Global</th>
                  <th style="padding: 7px 8px; border: 1px solid #1e3a5f;">Baremos (Est / Adm)</th>
                </tr>
              </thead>
              <tbody>
                ${filasExpedientesHtml}
              </tbody>
            </table>

            <p style="margin-top: 22px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              Emitido automáticamente el ${escaparHtml(fechaLegible)} por el Sistema de Gestión de Becas UNIMAR.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `expedientes_en_revision_unimar_${fechaIsoArchivo}.xlsx`,
          content: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    })

    return {
      success: true,
      destinatario,
      totalEnviados: reporte.data.length,
      fechaEnvio: fechaLegible,
      message: `Reporte con ${reporte.data.length} expediente(s) y archivo Excel adjunto enviado correctamente a ${destinatario}.`,
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Error de envío SMTP."
    console.error("Error en enviarReporteEnRevisionSecretaria:", error)
    return {
      success: false,
      error: `No fue posible enviar el correo a Secretaría General: ${errMsg}`,
    }
  }
}

// ============================================================================
// NUEVO REPORTE #2: BECARIOS AGRUPADOS POR DEPARTAMENTO (TIPO KARDEX)
// ============================================================================

/**
 * Devuelve los becarios aprobados agrupados por departamento asignado con estadísticas globales,
 * selector de periodo (por defecto el periodo actual) y filtro insensible a mayúsculas.
 */
export async function reporteBecariosPorDepartamento(
  filtros: {
    search?: string
    periodoId?: number | "todos"
  } = {}
): Promise<RespuestaReporteDepartamentos> {
  try {
    const periodosRows = await queryFresh<PeriodoOpcionReporte[]>(
      `
      SELECT id, codigo, nombre, es_actual
      FROM periodos_academicos
      ORDER BY fecha_inicio DESC, id DESC
      `
    )

    const periodosFormateados = periodosRows.map((p) => ({
      id: Number(p.id),
      codigo: String(p.codigo),
      nombre: String(p.nombre),
      esActual: Number(p.es_actual) === 1,
    }))

    const periodoActualObj = periodosFormateados.find((p) => p.esActual) ?? periodosFormateados[0]

    let periodoSeleccionado: number | "todos" = "todos"
    if (filtros.periodoId === "todos") {
      periodoSeleccionado = "todos"
    } else if (
      filtros.periodoId !== undefined &&
      Number.isInteger(Number(filtros.periodoId)) &&
      Number(filtros.periodoId) > 0
    ) {
      periodoSeleccionado = Number(filtros.periodoId)
    } else if (periodoActualObj) {
      periodoSeleccionado = periodoActualObj.id
    }

    let whereClause = ` WHERE s.estatus = 'Aprobada'`
    const params: Array<string | number> = []

    if (periodoSeleccionado !== "todos") {
      whereClause += ` AND s.periodo_id = ?`
      params.push(periodoSeleccionado)
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
          OR LOWER(IFNULL(NULLIF(TRIM(s.departamento_asignado), ''), 'Sin Departamento Asignado')) LIKE ?
          OR LOWER(st.carrera) LIKE ?
          OR LOWER(s.tipo_beca) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term, term)
    }

    const rows = await queryFresh<BecarioDepartamentoRow[]>(
      `
      SELECT
        s.id AS solicitud_id,
        s.user_id,
        NULLIF(TRIM(s.departamento_asignado), '') AS departamento_asignado,
        st.nombre,
        st.apellido,
        st.cedula,
        IFNULL(NULLIF(TRIM(s.email_institucional), ''), st.email) AS email,
        st.telefono,
        st.carrera,
        IFNULL(st.semestre, 1) AS semestre,
        s.tipo_beca,
        s.promedio_notas,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        s.periodo_id,
        p.codigo AS periodo_codigo,
        p.nombre AS periodo_nombre,
        s.fecha_decision
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN periodos_academicos p ON s.periodo_id = p.id
      ${whereClause}
      ORDER BY
        CASE WHEN NULLIF(TRIM(s.departamento_asignado), '') IS NULL THEN 1 ELSE 0 END ASC,
        s.departamento_asignado ASC,
        st.apellido ASC,
        st.nombre ASC
      `,
      params
    )

    const SIN_DEPARTAMENTO_LABEL = "Sin Departamento Asignado"
    const mapaDepartamentos = new Map<string, BecarioDepartamentoItem[]>()

    for (const row of rows) {
      const deptoLimpio = row.departamento_asignado
        ? String(row.departamento_asignado).trim()
        : SIN_DEPARTAMENTO_LABEL

      const fechaStr = row.fecha_decision
        ? new Date(row.fecha_decision).toLocaleDateString("es-VE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "---"

      const item: BecarioDepartamentoItem = {
        solicitudId: Number(row.solicitud_id),
        userId: Number(row.user_id),
        departamento: deptoLimpio,
        nombre: String(row.nombre || ""),
        apellido: String(row.apellido || ""),
        cedula: String(row.cedula || ""),
        email: String(row.email || "---"),
        telefono: String(row.telefono || "---"),
        carrera: String(row.carrera || "---"),
        semestre: Number(row.semestre || 1),
        tipoBeca:
          normalizarTipoBecaOficial(row.tipo_beca) || String(row.tipo_beca || "---"),
        promedioTrimestral: formatearDecimal(row.promedio_notas),
        indiceGlobal: formatearDecimal(row.indice_global),
        periodoCodigo: String(row.periodo_codigo || "---"),
        periodoNombre: String(row.periodo_nombre || "---"),
        fechaDecision: fechaStr,
      }

      const lista = mapaDepartamentos.get(deptoLimpio) ?? []
      lista.push(item)
      mapaDepartamentos.set(deptoLimpio, lista)
    }

    const departamentos: DepartamentoAgrupadoReporte[] = Array.from(
      mapaDepartamentos.entries()
    )
      .map(([departamento, estudiantes]) => {
        const sinAsignar = departamento === SIN_DEPARTAMENTO_LABEL
        const sumaProm = estudiantes.reduce(
          (acc, est) => acc + (parseFloat(est.promedioTrimestral) || 0),
          0
        )
        const promedioGeneral =
          estudiantes.length > 0 ? (sumaProm / estudiantes.length).toFixed(2) : "0.00"

        const mapaMod = new Map<string, number>()
        for (const est of estudiantes) {
          mapaMod.set(est.tipoBeca, (mapaMod.get(est.tipoBeca) ?? 0) + 1)
        }
        const resumenModalidades = Array.from(mapaMod.entries())
          .map(([tipoBeca, cantidad]) => ({ tipoBeca, cantidad }))
          .sort((a, b) => b.cantidad - a.cantidad)

        return {
          departamento,
          sinAsignar,
          totalEstudiantes: estudiantes.length,
          promedioGeneral,
          resumenModalidades,
          estudiantes,
        }
      })
      .sort((a, b) => {
        if (a.sinAsignar !== b.sinAsignar) return a.sinAsignar ? 1 : -1
        if (b.totalEstudiantes !== a.totalEstudiantes) {
          return b.totalEstudiantes - a.totalEstudiantes
        }
        return a.departamento.localeCompare(b.departamento, "es")
      })

    const totalSinDepartamento =
      departamentos.find((d) => d.sinAsignar)?.totalEstudiantes ?? 0
    const totalBecarios = rows.length
    const totalBecariosAsignados = totalBecarios - totalSinDepartamento
    const totalDepartamentosActivos = departamentos.filter((d) => !d.sinAsignar).length

    return {
      success: true,
      departamentos,
      stats: {
        totalDepartamentosActivos,
        totalBecariosAsignados,
        totalSinDepartamento,
        totalBecarios,
      },
      periodos: periodosFormateados,
      periodoSeleccionado,
    }
  } catch (error) {
    console.error("Error en reporteBecariosPorDepartamento:", error)
    return {
      success: false,
      departamentos: [],
      stats: {
        totalDepartamentosActivos: 0,
        totalBecariosAsignados: 0,
        totalSinDepartamento: 0,
        totalBecarios: 0,
      },
      periodos: [],
      periodoSeleccionado: "todos",
      error: "No fue posible consultar el reporte de becarios por departamento.",
    }
  }
}