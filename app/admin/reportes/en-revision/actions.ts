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

interface PeriodoActualRow extends RowDataPacket {
  id: number
  codigo: string
  nombre: string
}

interface ReporteEnRevisionSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  nombre: string
  apellido: string
  cedula: string
  email_institucional: string | null
  tipo_beca: string | null
  carrera: string
  semestre: number | null
  promedio_notas: number | string | null
  indice_global_efectivo: number | string | null
  puntaje_estudiante: number | null
  puntaje_admin: number | null
  nivel_riesgo_admin: string | null
  observaciones_admin: string | null
  periodo_id: number | null
  periodo_origen_codigo: string | null
  periodo_origen_nombre: string | null
  fecha_registro: Date | string | null
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

export interface FiltrosReporteEnRevision {
  search?: string
  carrera?: string
  tipoBeca?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface ExpedienteEnRevisionItem {
  solicitud_id: number
  user_id: number
  nombre: string
  apellido: string
  cedula: string
  email_institucional: string | null
  tipo_beca: string
  carrera: string
  semestre: number
  promedio_notas: string
  indice_global: string
  puntaje_estudiante: number | null
  puntaje_admin: number | null
  nivel_riesgo_admin: string | null
  observaciones_admin: string | null
  periodo_id: number | null
  periodo_origen_codigo: string | null
  periodo_origen_nombre: string | null
  fecha_registro: string | null
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
  data: ExpedienteEnRevisionItem[]
  cuposResumen: ResumenCupoModalidad[]
  periodoActual: PeriodoResumenBasico | null
  error?: string
}

export interface RespuestaEnvioSecretaria {
  success: boolean
  destinatario?: string
  totalEnviados?: number
  totalDisponibles?: number
  totalModalidadesEnviadas?: number
  maxPorTipoBeca?: number
  limiteAplicado?: boolean
  fechaEnvio?: string
  message?: string
  error?: string
}

interface ResumenEnvioModalidad {
  modalidad: string
  enviados: number
  totalEnRevision: number
}

const EMAIL_SECRETARIA_DEFECTO = "SecretariaGeneral@unimar.edu.ve"
const MAX_EXPEDIENTES_POR_TIPO_BECA = 5

/**
 * Regla estricta UNIMAR:
 * 1° Mejor Promedio Trimestral (DESC)
 * 2° Mayor Puntaje de Baremo Socioeconómico (Admin, respaldo Estudiante, DESC)
 * 3° Mayor Índice Global (DESC)
 * 4° Apellido y Nombre (ASC)
 */
function compararPrioridadEnRevision(
  a: ExpedienteEnRevisionItem,
  b: ExpedienteEnRevisionItem
): number {
  const promDiff = (parseFloat(b.promedio_notas) || 0) - (parseFloat(a.promedio_notas) || 0)
  if (Math.abs(promDiff) >= 0.005) return promDiff

  const baremoA = a.puntaje_admin ?? a.puntaje_estudiante ?? -1
  const baremoB = b.puntaje_admin ?? b.puntaje_estudiante ?? -1
  if (baremoB !== baremoA) return baremoB - baremoA

  const globalDiff = (parseFloat(b.indice_global) || 0) - (parseFloat(a.indice_global) || 0)
  if (Math.abs(globalDiff) >= 0.005) return globalDiff

  const apDiff = a.apellido.localeCompare(b.apellido, "es")
  if (apDiff !== 0) return apDiff
  return a.nombre.localeCompare(b.nombre, "es")
}

/**
 * Selecciona los primeros N expedientes (Top 5) por cada tipo de beca
 * respetando estrictamente 1° Promedio DESC y 2° Puntaje de Baremo DESC.
 */
function seleccionarTopPorModalidad(
  items: ExpedienteEnRevisionItem[],
  maxPorModalidad: number = MAX_EXPEDIENTES_POR_TIPO_BECA
): {
  seleccionados: ExpedienteEnRevisionItem[]
  resumenPorModalidad: ResumenEnvioModalidad[]
  totalModalidades: number
  limiteAplicado: boolean
} {
  const grupos = new Map<string, ExpedienteEnRevisionItem[]>()
  for (const item of items) {
    const clave = item.tipo_beca || "No especificado"
    const lista = grupos.get(clave) ?? []
    lista.push(item)
    grupos.set(clave, lista)
  }

  const modalidadesOrdenadas = Array.from(grupos.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "es")
  )

  const seleccionados: ExpedienteEnRevisionItem[] = []
  const resumenPorModalidad: ResumenEnvioModalidad[] = []

  for (const [modalidad, lista] of modalidadesOrdenadas) {
    const ordenados = [...lista].sort(compararPrioridadEnRevision)
    const top = ordenados.slice(0, maxPorModalidad)
    seleccionados.push(...top)
    resumenPorModalidad.push({
      modalidad,
      enviados: top.length,
      totalEnRevision: lista.length,
    })
  }

  return {
    seleccionados,
    resumenPorModalidad,
    totalModalidades: resumenPorModalidad.length,
    limiteAplicado: seleccionados.length < items.length,
  }
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function formatearDecimal(valor: number | string | null | undefined): string {
  const num = Number(valor ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : "0.00"
}

function serializarFechaISO(valor: Date | string | null | undefined): string | null {
  if (!valor) return null
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor.toISOString()
  }
  const parsed = new Date(valor)
  return Number.isNaN(parsed.getTime()) ? String(valor) : parsed.toISOString()
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

/**
 * Obtiene todos los expedientes en estatus 'En Revisión' priorizando:
 * 1° Mejor promedio trimestral (DESC)
 * 2° Mayor puntaje de baremo (Admin, con respaldo en Estudiante, DESC)
 * 3° Mayor índice global efectivo (DESC) y apellido (ASC)
 */
export async function obtenerReporteEnRevision(
  filtros: FiltrosReporteEnRevision = {}
): Promise<RespuestaReporteEnRevision> {
  try {
    const periodosActuales = await queryFresh<PeriodoActualRow[]>(
      `SELECT id, codigo, nombre FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    )
    const pActual: PeriodoResumenBasico | null = periodosActuales[0]
      ? {
          id: Number(periodosActuales[0].id),
          codigo: String(periodosActuales[0].codigo),
          nombre: String(periodosActuales[0].nombre),
        }
      : null

    let whereClause = ` WHERE LOWER(TRIM(s.estatus)) IN ('en revisión', 'en revision')`
    const params: Array<string | number> = []

    const desde = (filtros.fechaDesde || "").trim()
    const hasta = (filtros.fechaHasta || "").trim()
    const fechaExpr = `COALESCE(s.fecha_revision, s.fecha_registro)`

    if (desde && hasta) {
      whereClause += ` AND ${fechaExpr} BETWEEN ? AND ?`
      params.push(`${desde} 00:00:00`, `${hasta} 23:59:59`)
    } else if (desde) {
      whereClause += ` AND ${fechaExpr} >= ?`
      params.push(`${desde} 00:00:00`)
    } else if (hasta) {
      whereClause += ` AND ${fechaExpr} <= ?`
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
        )
      `
      params.push(term, term, term, term)
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
        COALESCE(
          CASE WHEN IFNULL(st.indice_global, 0) > 0 THEN st.indice_global ELSE NULL END,
          (
            SELECT ROUND(AVG(ra.nota), 2)
            FROM record_academico ra
            WHERE ra.student_id = st.id
          ),
          (
            SELECT h_g.indice_global_snapshot
            FROM historial_aprobaciones h_g
            WHERE h_g.user_id = st.id
              AND IFNULL(h_g.indice_global_snapshot, 0) > 0
            ORDER BY h_g.fecha_aprobacion DESC, h_g.id DESC
            LIMIT 1
          ),
          (
            SELECT ROUND(AVG(s_g.promedio_notas), 2)
            FROM solicitudes s_g
            WHERE s_g.user_id = st.id
              AND IFNULL(s_g.promedio_notas, 0) > 0
          ),
          0.00
        ) AS indice_global_efectivo,
        e_est.puntaje AS puntaje_estudiante,
        e_adm.puntaje AS puntaje_admin,
        e_adm.nivel_riesgo AS nivel_riesgo_admin,
        s.observaciones_admin,
        s.periodo_id,
        p.codigo AS periodo_origen_codigo,
        p.nombre AS periodo_origen_nombre,
        s.fecha_registro
      FROM solicitudes s
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        GROUP BY user_id
      ) ult ON s.id = ult.last_id
      INNER JOIN students st ON s.user_id = st.id
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
      ORDER BY
        CAST(IFNULL(s.promedio_notas, 0) AS DECIMAL(10,2)) DESC,
        IFNULL(e_adm.puntaje, IFNULL(e_est.puntaje, -1)) DESC,
        indice_global_efectivo DESC,
        st.apellido ASC,
        st.nombre ASC
    `

    const [rows, aprobadosRows] = await Promise.all([
      queryFresh<ReporteEnRevisionSQLRow[]>(sql, params),
      pActual
        ? queryFresh<AprobadosPorBecaRow[]>(
            `
            SELECT tipo_beca, COUNT(*) AS total
            FROM solicitudes
            WHERE periodo_id = ?
              AND LOWER(TRIM(estatus)) IN ('aprobada', 'aprobado', 'renovacion', 'renovación')
            GROUP BY tipo_beca
            `,
            [pActual.id]
          )
        : Promise.resolve<AprobadosPorBecaRow[]>([]),
    ])

    const data: ExpedienteEnRevisionItem[] = rows.map((row) => ({
      solicitud_id: Number(row.solicitud_id),
      user_id: Number(row.user_id),
      nombre: String(row.nombre || ""),
      apellido: String(row.apellido || ""),
      cedula: String(row.cedula || ""),
      email_institucional: row.email_institucional ? String(row.email_institucional) : null,
      tipo_beca:
        normalizarTipoBecaOficial(row.tipo_beca) ||
        String(row.tipo_beca || "No especificado"),
      carrera: String(row.carrera || "---"),
      semestre: Number(row.semestre ?? 1),
      promedio_notas: formatearDecimal(row.promedio_notas),
      indice_global: formatearDecimal(row.indice_global_efectivo),
      puntaje_estudiante:
        row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined
          ? Number(row.puntaje_estudiante)
          : null,
      puntaje_admin:
        row.puntaje_admin !== null && row.puntaje_admin !== undefined
          ? Number(row.puntaje_admin)
          : null,
      nivel_riesgo_admin: row.nivel_riesgo_admin ? String(row.nivel_riesgo_admin) : null,
      observaciones_admin: row.observaciones_admin ? String(row.observaciones_admin).trim() : null,
      periodo_id:
        row.periodo_id !== null && row.periodo_id !== undefined
          ? Number(row.periodo_id)
          : null,
      periodo_origen_codigo: row.periodo_origen_codigo
        ? String(row.periodo_origen_codigo)
        : null,
      periodo_origen_nombre: row.periodo_origen_nombre
        ? String(row.periodo_origen_nombre)
        : null,
      fecha_registro: serializarFechaISO(row.fecha_registro),
    }))

    const mapaAprobados = new Map<string, number>()
    for (const r of aprobadosRows) {
      const oficial = normalizarTipoBecaOficial(r.tipo_beca) || String(r.tipo_beca || "OTRA")
      mapaAprobados.set(oficial, (mapaAprobados.get(oficial) ?? 0) + Number(r.total || 0))
    }

    const mapaLote = new Map<string, number>()
    for (const item of data) {
      mapaLote.set(item.tipo_beca, (mapaLote.get(item.tipo_beca) ?? 0) + 1)
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
      data,
      cuposResumen,
      periodoActual: pActual,
    }
  } catch (error) {
    console.error("Error en obtenerReporteEnRevision:", error)
    return {
      success: false,
      data: [],
      cuposResumen: [],
      periodoActual: null,
      error: "No fue posible consultar los expedientes en revisión.",
    }
  }
}

async function construirBufferExcelEnRevision(
  rows: ExpedienteEnRevisionItem[],
  periodoLabel: string,
  notaSeleccion: string
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
    `PERIODO VIGENTE: ${periodoLabel.toUpperCase()}   |   ${notaSeleccion.toUpperCase()}   |   TOTAL EXPEDIENTES: ${rows.length}   |   EMISIÓN: ${fechaEmision}`,
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
    const pEst = r.puntaje_estudiante
    const pAdm = r.puntaje_admin
    const diff = pEst !== null && pAdm !== null ? pAdm - pEst : null

    const fila = ws.addRow([
      r.nombre.toUpperCase() || "---",
      r.apellido.toUpperCase() || "---",
      `V-${r.cedula}`,
      r.tipo_beca.toUpperCase(),
      r.carrera.toUpperCase(),
      r.semestre >= 13 ? "EGRESADO" : `${r.semestre}°`,
      Number(r.promedio_notas),
      Number(r.indice_global),
      pEst !== null ? pEst : "Sin estudio",
      pAdm !== null ? pAdm : "Pendiente",
      diff !== null ? (diff > 0 ? `+${diff}` : String(diff)) : "---",
      String(r.nivel_riesgo_admin || "Pendiente").toUpperCase(),
      String(r.periodo_origen_codigo || "---").toUpperCase(),
      r.observaciones_admin || "---",
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
  return Buffer.from(new Uint8Array(rawBuffer))
}

/**
 * Envía el reporte de expedientes "En Revisión" (ordenados por Promedio → Baremo)
 * priorizando el destinatario definido en .env (SECRETARIA_GENERAL_EMAIL),
 * con respaldo en la tabla users (role = 'secretaria') y el correo institucional por defecto.
 */
export async function enviarReporteEnRevisionSecretaria(
  filtros: FiltrosReporteEnRevision = {}
): Promise<RespuestaEnvioSecretaria> {
  try {
    const reporte = await obtenerReporteEnRevision(filtros)

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

    // Prioridad 1: .env (SECRETARIA_GENERAL_EMAIL) | Prioridad 2: users (role = 'secretaria') | Prioridad 3: Defecto
    const emailDesdeEnv = (process.env.SECRETARIA_GENERAL_EMAIL || "").trim()
    let destinatario = emailDesdeEnv

    if (!destinatario) {
      const secRows = await queryFresh<SecretariaEmailRow[]>(
        `SELECT email FROM users WHERE role = 'secretaria' AND email IS NOT NULL AND TRIM(email) != '' LIMIT 1`
      )
      destinatario = secRows[0]?.email?.trim() || EMAIL_SECRETARIA_DEFECTO
    }

    const totalDisponibles = reporte.data.length
    const {
      seleccionados: expedientesEnvio,
      resumenPorModalidad,
      totalModalidades,
      limiteAplicado,
    } = seleccionarTopPorModalidad(reporte.data, MAX_EXPEDIENTES_POR_TIPO_BECA)

    const mapaEnviadosPorModalidad = new Map<string, number>()
    for (const item of resumenPorModalidad) {
      mapaEnviadosPorModalidad.set(item.modalidad, item.enviados)
    }

    const periodoLabel = reporte.periodoActual
      ? `${reporte.periodoActual.codigo} — ${reporte.periodoActual.nombre}`
      : "Periodo Vigente"

    const notaSeleccionExcel = `Top ${MAX_EXPEDIENTES_POR_TIPO_BECA} por tipo de beca (1° Promedio, 2° Baremo)`
    const excelBuffer = await construirBufferExcelEnRevision(
      expedientesEnvio,
      periodoLabel,
      notaSeleccionExcel
    )
    const fechaIsoArchivo = new Date().toISOString().slice(0, 10)
    const fechaLegible = new Date().toLocaleString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Caracas",
    })

    const filasCuposHtml = reporte.cuposResumen
      .map((c) => {
        const enviadosMod = mapaEnviadosPorModalidad.get(c.modalidad) ?? 0
        return `
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a5f;">${escaparHtml(c.modalidad)}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #1e3a5f;">${enviadosMod} / ${c.enRevisionLote}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${c.aprobadosPeriodoActual}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">${c.cupoMaximo !== null ? c.cupoMaximo : "Según pres."}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: ${c.disponibles === 0 ? "#be123c" : "#047857"};">${c.disponibles !== null ? c.disponibles : "Disponible"}</td>
          </tr>
        `
      })
      .join("")

    const filasExpedientesHtml = expedientesEnvio
      .map((r, i) => {
        const bg = i % 2 === 0 ? "#ffffff" : "#f8fafc"
        const pEst = r.puntaje_estudiante !== null ? `${r.puntaje_estudiante} pts` : "N/A"
        const pAdm = r.puntaje_admin !== null ? `${r.puntaje_admin} pts` : "Pendiente"
        return `
          <tr style="background-color: ${bg};">
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1;">
              <strong style="color: #1e3a5f;">${escaparHtml(`${r.nombre} ${r.apellido}`)}</strong><br />
              <span style="font-size: 11px; color: #64748b;">V-${escaparHtml(r.cedula)}</span>
            </td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${escaparHtml(r.tipo_beca)}</td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 11px;">${escaparHtml(r.carrera)}</td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${r.semestre >= 13 ? "Egresado" : `${r.semestre}°`}</td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">
              ${escaparHtml(r.promedio_notas)}<br />
              <span style="font-size: 10px; color: #b8860b;">G: ${escaparHtml(r.indice_global)}</span>
            </td>
            <td style="padding: 6px 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 11px;">
              Est: <strong>${pEst}</strong><br />
              Adm: <strong style="color: #1e3a5f;">${pAdm}</strong>
            </td>
          </tr>
        `
      })
      .join("")

    const avisoLimiteHtml = `<p style="font-size: 12px; background-color: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 10px 12px; border-radius: 6px; margin: 0 0 14px 0;">
          <strong>Criterio de selección:</strong> Se incluyen los <strong>${MAX_EXPEDIENTES_POR_TIPO_BECA} primeros expedientes por cada tipo de beca</strong> (${expedientesEnvio.length} de ${totalDisponibles} en revisión, abarcando ${totalModalidades} modalidad(es)), priorizados estrictamente por <strong>1° mejor promedio académico</strong> y <strong>2° mayor puntaje de baremo</strong>. El universo completo está disponible en el panel de Secretaría General.
        </p>`

    await transporter.sendMail({
      from: `"Bienestar Estudiantil — UNIMAR" <${smtpUser}>`,
      to: destinatario,
      subject: `Expedientes En Revisión — Top ${MAX_EXPEDIENTES_POR_TIPO_BECA} por Modalidad (${expedientesEnvio.length}${limiteAplicado ? ` de ${totalDisponibles}` : ""}) — Becas UNIMAR ${reporte.periodoActual?.codigo || ""}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 820px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #1e3a5f; padding: 20px 24px; border-bottom: 4px solid #d4a843;">
            <h2 style="margin: 0; color: #ffffff; font-size: 18px;">Universidad de Margarita — Secretaría General</h2>
            <p style="margin: 6px 0 0 0; color: #d4a843; font-size: 12px; font-weight: bold; text-transform: uppercase;">
              Remisión Oficial de Expedientes En Revisión (Top ${MAX_EXPEDIENTES_POR_TIPO_BECA} por Tipo de Beca) • ${escaparHtml(periodoLabel)}
            </p>
          </div>

          <div style="padding: 20px 24px;">
            <p style="font-size: 13px; line-height: 1.5; margin-top: 0;">
              Estimada <strong>Secretaría General</strong>,<br />
              El Departamento de Bienestar Estudiantil remite la selección de
              <strong>${expedientesEnvio.length} expediente(s) en estatus En Revisión</strong> (Top ${MAX_EXPEDIENTES_POR_TIPO_BECA} por cada tipo de beca, priorizados por 1° mejor promedio académico y 2° mayor puntaje de baremo) listos para su evaluación y dictamen final.
              Se adjunta el archivo en formato Excel (<code>.xlsx</code>) con esta misma selección.
            </p>

            ${avisoLimiteHtml}

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
                        <th style="padding: 7px 10px; border: 1px solid #1e3a5f;">Enviados / En Rev.</th>
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
              Selección Remitida — Top ${MAX_EXPEDIENTES_POR_TIPO_BECA} por Tipo de Beca (${expedientesEnvio.length}${limiteAplicado ? ` de ${totalDisponibles}` : ""})
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
          filename: `expedientes_en_revision_top${MAX_EXPEDIENTES_POR_TIPO_BECA}_unimar_${fechaIsoArchivo}.xlsx`,
          content: excelBuffer,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    })

    return {
      success: true,
      destinatario,
      totalEnviados: expedientesEnvio.length,
      totalDisponibles,
      totalModalidadesEnviadas: totalModalidades,
      maxPorTipoBeca: MAX_EXPEDIENTES_POR_TIPO_BECA,
      limiteAplicado,
      fechaEnvio: fechaLegible,
      message: limiteAplicado
        ? `Reporte con el Top ${MAX_EXPEDIENTES_POR_TIPO_BECA} por tipo de beca (${expedientesEnvio.length} de ${totalDisponibles} expedientes en ${totalModalidades} modalidad(es)) y archivo Excel adjunto enviado correctamente a ${destinatario}.`
        : `Reporte con ${expedientesEnvio.length} expediente(s) (${totalModalidades} modalidad(es), máx. ${MAX_EXPEDIENTES_POR_TIPO_BECA} por tipo) y archivo Excel adjunto enviado correctamente a ${destinatario}.`,
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