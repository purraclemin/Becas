"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial, SISTEMA_ADMIN_ID } from "@/lib/RecordAcademicoUtils"
import { ejecutarRotacionExcelenciaEnPeriodo } from "@/lib/ActionsGestionEspecial"

interface PeriodoOpcionSQLRow extends RowDataPacket {
  id: number
  codigo: string
  nombre: string
  es_actual: number
}

interface BecarioDepartamentoSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  departamento_asignado: string | null
  nombre: string
  apellido: string
  cedula: string
  email: string | null
  telefono: string | null
  carrera: string
  semestre: number | null
  tipo_beca: string | null
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

export interface PeriodoDepartamentoOption {
  id: number
  codigo: string
  nombre: string
  esActual: boolean
}

export interface FiltrosReporteDepartamentos {
  search?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface RespuestaReporteDepartamentos {
  success: boolean
  departamentos: DepartamentoAgrupadoReporte[]
  stats: StatsDepartamentosReporte
  periodoActual: PeriodoDepartamentoOption | null
  periodos: PeriodoDepartamentoOption[]
  periodoSeleccionado: number | "todos"
  error?: string
}

function formatearDecimal(valor: number | string | null | undefined): string {
  const num = Number(valor ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : "0.00"
}

/**
 * Devuelve estrictamente los becarios con estatus 'Aprobada' del periodo académico
 * actual (`es_actual = 1`), agrupados por departamento asignado y excluyendo
 * rechazados, finalizados y periodos anteriores.
 */
export async function obtenerReporteDepartamentos(
  filtros: FiltrosReporteDepartamentos = {}
): Promise<RespuestaReporteDepartamentos> {
  try {
    try {
      await ejecutarRotacionExcelenciaEnPeriodo(undefined, SISTEMA_ADMIN_ID)
    } catch (rotErr) {
      console.error("⚠️ Advertencia sincronizando Excelencia en departamentos:", rotErr)
    }

    const periodosRows = await queryFresh<PeriodoOpcionSQLRow[]>(
      `
      SELECT id, codigo, nombre, es_actual
      FROM periodos_academicos
      WHERE es_actual = 1
      ORDER BY fecha_inicio DESC, id DESC
      LIMIT 1
      `
    )

    const periodoActual: PeriodoDepartamentoOption | null = periodosRows[0]
      ? {
          id: Number(periodosRows[0].id),
          codigo: String(periodosRows[0].codigo),
          nombre: String(periodosRows[0].nombre),
          esActual: true,
        }
      : null

    if (!periodoActual) {
      return {
        success: true,
        departamentos: [],
        stats: {
          totalDepartamentosActivos: 0,
          totalBecariosAsignados: 0,
          totalSinDepartamento: 0,
          totalBecarios: 0,
        },
        periodoActual: null,
        periodos: [],
        periodoSeleccionado: 0,
      }
    }

    let whereClause = `
      WHERE p.es_actual = 1
        AND s.periodo_id = ?
        AND LOWER(TRIM(s.estatus)) = 'aprobada'
    `
    const params: Array<string | number> = [periodoActual.id]

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
          OR LOWER(IFNULL(s.tipo_beca, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term, term)
    }

    const rows = await queryFresh<BecarioDepartamentoSQLRow[]>(
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
        COALESCE(s.fecha_decision, s.fecha_registro) AS fecha_decision
      FROM solicitudes s
      INNER JOIN periodos_academicos p ON s.periodo_id = p.id
      INNER JOIN students st ON s.user_id = st.id
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
        CASE WHEN NULLIF(TRIM(s.departamento_asignado), '') IS NULL THEN 1 ELSE 0 END ASC,
        s.departamento_asignado ASC,
        CAST(IFNULL(s.promedio_notas, 0) AS DECIMAL(10,2)) DESC,
        IFNULL(COALESCE(e_adm.puntaje, e_est.puntaje), -1) DESC,
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
        semestre: Number(row.semestre ?? 1),
        tipoBeca:
          normalizarTipoBecaOficial(row.tipo_beca) || String(row.tipo_beca || "---"),
        promedioTrimestral: formatearDecimal(row.promedio_notas),
        indiceGlobal: formatearDecimal(row.indice_global),
        periodoCodigo: String(row.periodo_codigo || periodoActual.codigo),
        periodoNombre: String(row.periodo_nombre || periodoActual.nombre),
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
      periodoActual,
      periodos: [periodoActual],
      periodoSeleccionado: periodoActual.id,
    }
  } catch (error) {
    console.error("Error en obtenerReporteDepartamentos:", error)
    return {
      success: false,
      departamentos: [],
      stats: {
        totalDepartamentosActivos: 0,
        totalBecariosAsignados: 0,
        totalSinDepartamento: 0,
        totalBecarios: 0,
      },
      periodoActual: null,
      periodos: [],
      periodoSeleccionado: 0,
      error: "No fue posible consultar el reporte de becarios por departamento.",
    }
  }
}
