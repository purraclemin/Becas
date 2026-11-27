"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial, SISTEMA_ADMIN_ID } from "@/lib/RecordAcademicoUtils"
import { ejecutarRotacionExcelenciaEnPeriodo } from "@/lib/ActionsGestionEspecial"

interface PeriodoTipoBecaSQLRow extends RowDataPacket {
  id: number
  codigo: string
  nombre: string
  es_actual: number
}

interface EstudianteTipoBecaSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  periodo_id: number
  estatus: string | null
  tipo_beca: string | null
  departamento_asignado: string | null
  promedio_notas: number | string | null
  fecha_registro: Date | string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string | null
  semestre: number | null
  indice_global: number | string | null
  puntaje_baremo: number | null
  periodo_codigo: string | null
}

export interface PeriodoTipoBecaOption {
  id: number
  codigo: string
  nombre: string
  esActual: boolean
}

export interface EstudianteTipoBecaReporte {
  solicitud_id: number
  user_id: number
  cedula: string
  nombre: string
  apellido: string
  carrera: string
  semestre: number
  tipo_beca: string
  departamento_asignado: string
  estatus: string
  promedio_notas: string
  indice_global: string
  puntaje_baremo: number | null
  periodo_codigo: string
  fecha_registro: string
}

export interface ReporteTipoBecaItem {
  tipo_beca: string
  total: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
  finalizadas: number
  porcentaje: number
  promedio_general: string
  estudiantes: EstudianteTipoBecaReporte[]
}

export interface StatsTiposBecaReporte {
  totalModalidades: number
  totalSolicitudes: number
  totalAprobadas: number
  totalRechazadas: number
  totalFinalizadas: number
}

export interface FiltrosReporteTiposBeca {
  search?: string
  periodoId?: number
  fechaDesde?: string
  fechaHasta?: string
}

export interface RespuestaReporteTiposBeca {
  success: boolean
  data: ReporteTipoBecaItem[]
  stats: StatsTiposBecaReporte
  periodos: PeriodoTipoBecaOption[]
  periodoSeleccionadoId: number
  esPeriodoActual: boolean
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
 * Orden de grupos de estatus en periodos históricos:
 * 1° Aprobadas, 2° Rechazadas / Reprobadas, 3° Finalizadas, 4° resto en proceso.
 */
function prioridadGrupoEstatusHistorico(estatus: string): number {
  const e = estatus.trim().toLowerCase()
  if (e === "aprobada" || e === "aprobado") return 1
  if (e === "rechazada" || e === "rechazado" || e === "reprobada" || e === "reprobado") return 2
  if (e === "finalizada") return 3
  if (e === "en revisión" || e === "en revision") return 4
  if (e === "convocado a entrevista") return 5
  if (e === "pendiente") return 6
  return 7
}

/**
 * Kardex operativo por Tipo de Beca con filtro por periodo:
 * - Periodo actual (`es_actual = 1`): únicamente estudiantes Aprobados (`Aprobada`),
 *   ordenados estrictamente por 1° Promedio DESC y 2° Puntaje de Baremo DESC.
 * - Periodos anteriores (`es_actual = 0`): todos los estudiantes del periodo ordenados
 *   poniendo primero Aprobados, luego Rechazados/Reprobados y demás estatus, respetando
 *   dentro de cada grupo 1° Promedio DESC y 2° Puntaje de Baremo DESC.
 */
export async function obtenerReporteTiposBeca(
  filtrosInput?: FiltrosReporteTiposBeca | string
): Promise<RespuestaReporteTiposBeca> {
  try {
    const filtros: FiltrosReporteTiposBeca =
      typeof filtrosInput === "string"
        ? { search: filtrosInput }
        : filtrosInput ?? {}

    const periodosRows = await queryFresh<PeriodoTipoBecaSQLRow[]>(
      `
      SELECT id, codigo, nombre, es_actual
      FROM periodos_academicos
      ORDER BY fecha_inicio DESC, id DESC
      `
    )

    const periodos: PeriodoTipoBecaOption[] = periodosRows.map((p) => ({
      id: Number(p.id),
      codigo: String(p.codigo),
      nombre: String(p.nombre),
      esActual: Number(p.es_actual) === 1,
    }))

    const periodoActualObj = periodos.find((p) => p.esActual) ?? periodos[0] ?? null

    let periodoObjetivo: PeriodoTipoBecaOption | null = periodoActualObj
    if (
      filtros.periodoId !== undefined &&
      Number.isInteger(Number(filtros.periodoId)) &&
      Number(filtros.periodoId) > 0
    ) {
      const encontrado = periodos.find((p) => p.id === Number(filtros.periodoId))
      if (encontrado) {
        periodoObjetivo = encontrado
      }
    }

    if (!periodoObjetivo) {
      return {
        success: true,
        data: [],
        stats: {
          totalModalidades: 0,
          totalSolicitudes: 0,
          totalAprobadas: 0,
          totalRechazadas: 0,
          totalFinalizadas: 0,
        },
        periodos: [],
        periodoSeleccionadoId: 0,
        esPeriodoActual: true,
      }
    }

    const esPeriodoActual = periodoObjetivo.esActual

    if (esPeriodoActual) {
      try {
        await ejecutarRotacionExcelenciaEnPeriodo(periodoObjetivo.id, SISTEMA_ADMIN_ID)
      } catch (rotErr) {
        console.error("⚠️ Advertencia sincronizando Excelencia en tipos-beca:", rotErr)
      }
    }

    const params: Array<string | number> = [periodoObjetivo.id]
    let whereClause = ` WHERE s.periodo_id = ?`

    if (esPeriodoActual) {
      whereClause += ` AND LOWER(TRIM(s.estatus)) = 'aprobada'`
    }

    const desde = (filtros.fechaDesde || "").trim()
    const hasta = (filtros.fechaHasta || "").trim()
    const fechaExpr = `COALESCE(s.fecha_decision, s.fecha_registro)`

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

    const limpio = (filtros.search || "").trim().toLowerCase()
    if (limpio !== "") {
      const term = `%${limpio}%`
      whereClause += `
        AND (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar')) LIKE ?
          OR LOWER(IFNULL(s.tipo_beca, '')) LIKE ?
          OR LOWER(IFNULL(s.estatus, '')) LIKE ?
          OR LOWER(IFNULL(NULLIF(TRIM(s.departamento_asignado), ''), 'Sin Asignar')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term, term, term)
    }

    const rows = await queryFresh<EstudianteTipoBecaSQLRow[]>(
      `
      SELECT
        s.id AS solicitud_id,
        s.user_id,
        s.periodo_id,
        s.estatus,
        s.tipo_beca,
        NULLIF(TRIM(s.departamento_asignado), '') AS departamento_asignado,
        s.promedio_notas,
        COALESCE(s.fecha_decision, s.fecha_registro) AS fecha_registro,
        st.nombre,
        st.apellido,
        st.cedula,
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS carrera,
        IFNULL(st.semestre, 1) AS semestre,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        COALESCE(e_adm.puntaje, e_est.puntaje) AS puntaje_baremo,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo
      FROM solicitudes s
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
      ORDER BY
        CAST(IFNULL(s.promedio_notas, 0) AS DECIMAL(10,2)) DESC,
        IFNULL(COALESCE(e_adm.puntaje, e_est.puntaje), -1) DESC,
        IFNULL(st.indice_global, 0) DESC,
        st.apellido ASC,
        st.nombre ASC
      `,
      params
    )

    const grupos = new Map<string, EstudianteTipoBecaReporte[]>()

    for (const row of rows) {
      const tipoOficial =
        normalizarTipoBecaOficial(row.tipo_beca) ||
        (row.tipo_beca && String(row.tipo_beca).trim() !== ""
          ? String(row.tipo_beca).trim().toUpperCase()
          : "NO ESPECIFICADO")

      const nombre = String(row.nombre || "").trim()
      const apellido = String(row.apellido || "").trim()
      const cedula = String(row.cedula || "").trim()
      const carrera = String(row.carrera || "Sin Asignar").trim()
      const estatus = String(row.estatus || "Pendiente").trim()
      const depto = row.departamento_asignado
        ? String(row.departamento_asignado).trim()
        : "Sin Asignar"

      if (limpio !== "") {
        const coincide =
          tipoOficial.toLowerCase().includes(limpio) ||
          nombre.toLowerCase().includes(limpio) ||
          apellido.toLowerCase().includes(limpio) ||
          `${nombre} ${apellido}`.toLowerCase().includes(limpio) ||
          cedula.toLowerCase().includes(limpio) ||
          carrera.toLowerCase().includes(limpio) ||
          estatus.toLowerCase().includes(limpio) ||
          depto.toLowerCase().includes(limpio)

        if (!coincide) continue
      }

      const lista = grupos.get(tipoOficial) ?? []
      lista.push({
        solicitud_id: Number(row.solicitud_id),
        user_id: Number(row.user_id),
        cedula,
        nombre,
        apellido,
        carrera,
        semestre: Number(row.semestre ?? 1),
        tipo_beca: tipoOficial,
        departamento_asignado: depto,
        estatus,
        promedio_notas: formatearDecimal(row.promedio_notas),
        indice_global: formatearDecimal(row.indice_global),
        puntaje_baremo:
          row.puntaje_baremo !== null && row.puntaje_baremo !== undefined
            ? Number(row.puntaje_baremo)
            : null,
        periodo_codigo: String(row.periodo_codigo || periodoObjetivo.codigo),
        fecha_registro: serializarFechaISO(row.fecha_registro),
      })
      grupos.set(tipoOficial, lista)
    }

    const totalSolicitudes = Array.from(grupos.values()).reduce(
      (acc, lista) => acc + lista.length,
      0
    )

    const data: ReporteTipoBecaItem[] = Array.from(grupos.entries())
      .map(([tipo_beca, listaEstudiantes]) => {
        const estudiantesOrdenados = [...listaEstudiantes].sort((a, b) => {
          if (!esPeriodoActual) {
            const pA = prioridadGrupoEstatusHistorico(a.estatus)
            const pB = prioridadGrupoEstatusHistorico(b.estatus)
            if (pA !== pB) return pA - pB
          }

          // Regla estricta: 1° Promedio DESC, 2° Puntaje Baremo DESC, 3° Índice Global DESC
          const promDiff =
            (parseFloat(b.promedio_notas) || 0) - (parseFloat(a.promedio_notas) || 0)
          if (Math.abs(promDiff) >= 0.005) return promDiff

          const baremoA = a.puntaje_baremo ?? -1
          const baremoB = b.puntaje_baremo ?? -1
          if (baremoB !== baremoA) return baremoB - baremoA

          const globalDiff =
            (parseFloat(b.indice_global) || 0) - (parseFloat(a.indice_global) || 0)
          if (Math.abs(globalDiff) >= 0.005) return globalDiff

          return a.apellido.localeCompare(b.apellido, "es")
        })

        let aprobadas = 0
        let rechazadas = 0
        let enProceso = 0
        let finalizadas = 0
        let sumaProm = 0

        for (const est of estudiantesOrdenados) {
          const e = est.estatus.trim().toLowerCase()
          sumaProm += parseFloat(est.promedio_notas) || 0

          if (e === "aprobada" || e === "aprobado") {
            aprobadas += 1
          } else if (e === "rechazada" || e === "rechazado" || e === "reprobada" || e === "reprobado") {
            rechazadas += 1
          } else if (e === "finalizada") {
            finalizadas += 1
          } else {
            enProceso += 1
          }
        }

        const total = estudiantesOrdenados.length
        const promedioGeneral = total > 0 ? (sumaProm / total).toFixed(2) : "0.00"
        const porcentaje =
          totalSolicitudes > 0 ? Math.round((total / totalSolicitudes) * 100) : 0

        return {
          tipo_beca,
          total,
          aprobadas,
          rechazadas,
          en_proceso: enProceso,
          finalizadas,
          porcentaje,
          promedio_general: promedioGeneral,
          estudiantes: estudiantesOrdenados,
        }
      })
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total
        return a.tipo_beca.localeCompare(b.tipo_beca, "es")
      })

    const totalAprobadas = data.reduce((acc, item) => acc + item.aprobadas, 0)
    const totalRechazadas = data.reduce((acc, item) => acc + item.rechazadas, 0)
    const totalFinalizadas = data.reduce((acc, item) => acc + item.finalizadas, 0)

    return {
      success: true,
      data,
      stats: {
        totalModalidades: data.length,
        totalSolicitudes,
        totalAprobadas,
        totalRechazadas,
        totalFinalizadas,
      },
      periodos,
      periodoSeleccionadoId: periodoObjetivo.id,
      esPeriodoActual,
    }
  } catch (error) {
    console.error("Error en obtenerReporteTiposBeca:", error)
    return {
      success: false,
      data: [],
      stats: {
        totalModalidades: 0,
        totalSolicitudes: 0,
        totalAprobadas: 0,
        totalRechazadas: 0,
        totalFinalizadas: 0,
      },
      periodos: [],
      periodoSeleccionadoId: 0,
      esPeriodoActual: true,
      error: "No fue posible consultar el reporte Kardex de tipos de beca.",
    }
  }
}
