"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial, SISTEMA_ADMIN_ID } from "@/lib/RecordAcademicoUtils"
import { ejecutarRotacionExcelenciaEnPeriodo } from "@/lib/ActionsGestionEspecial"

interface PeriodoActualRow extends RowDataPacket {
  id: number
  fecha_inicio: Date | string | null
}

interface CarreraCatalogoSQLRow extends RowDataPacket {
  id: number
  nombre: string
}

interface EstudianteCarreraSQLRow extends RowDataPacket {
  solicitud_id: number
  user_id: number
  periodo_id: number | null
  estatus: string | null
  tipo_beca: string | null
  promedio_notas: number | string | null
  puntaje_baremo: number | null
  fecha_registro: Date | string | null
  nombre: string
  apellido: string
  cedula: string
  carrera: string | null
  semestre: number | null
  indice_global: number | string | null
  periodo_codigo: string | null
}

export interface FiltrosReporteCarreras {
  search?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface EstudianteCarreraReporte {
  solicitud_id: number
  user_id: number
  cedula: string
  nombre: string
  apellido: string
  carrera: string
  semestre: number
  tipo_beca: string
  estatus: string
  es_aprobada_vigente: boolean
  promedio_notas: string
  indice_global: string
  puntaje_baremo: number | null
  periodo_codigo: string
  fecha_registro: string
}

export interface ReporteCarreraItem {
  carrera: string
  total_solicitudes: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
  finalizadas: number
  efectividad: number
  promedio_general: string
  estudiantes: EstudianteCarreraReporte[]
}

export interface StatsCarrerasReporte {
  totalCarreras: number
  totalSolicitudes: number
  totalAprobadas: number
  totalFinalizadas: number
  efectividadGlobal: number
}

export interface RespuestaReporteCarreras {
  success: boolean
  data: ReporteCarreraItem[]
  stats: StatsCarrerasReporte
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

function normalizarFechaSql(fecha: Date | string | null | undefined): string {
  if (!fecha) return ""
  if (fecha instanceof Date) {
    return Number.isNaN(fecha.getTime()) ? "" : fecha.toISOString().split("T")[0]
  }
  const s = String(fecha).trim()
  return s.includes("T") ? s.split("T")[0] : s.slice(0, 10)
}

function prioridadEstatus(estatus: string): number {
  const e = estatus.trim().toLowerCase()
  if (e === "aprobada" || e === "aprobado") return 1
  if (e === "en revisión" || e === "en revision") return 2
  if (e === "convocado a entrevista") return 3
  if (e === "pendiente") return 4
  if (e === "revisión especial" || e === "revision especial") return 5
  if (e === "finalizada") return 6
  if (e === "rechazada" || e === "rechazado") return 7
  return 8
}

/**
 * Distribución operativa por carrera SIN DUPLICADOS (`MAX(id)` acotado al periodo vigente),
 * con búsqueda insensible a mayúsculas (`LOWER`) y filtro por rango de fechas (`Desde` / `Hasta`),
 * priorizando dentro de cada carrera por estatus, 1° Promedio DESC y 2° Puntaje Baremo DESC.
 */
export async function obtenerReporteCarreras(
  entrada?: string | FiltrosReporteCarreras
): Promise<RespuestaReporteCarreras> {
  try {
    try {
      await ejecutarRotacionExcelenciaEnPeriodo(undefined, SISTEMA_ADMIN_ID)
    } catch (rotErr) {
      console.error("⚠️ Advertencia sincronizando Excelencia en reporte de carreras:", rotErr)
    }

    const filtros: FiltrosReporteCarreras =
      typeof entrada === "string" ? { search: entrada } : entrada ?? {}

    const limpio = (filtros.search || "").trim().toLowerCase()
    const desde = (filtros.fechaDesde || "").trim()
    const hasta = (filtros.fechaHasta || "").trim()
    const hayFiltroFecha = desde !== "" || hasta !== ""

    const [periodoRows, carrerasCatalogoRows] = await Promise.all([
      queryFresh<PeriodoActualRow[]>(
        `SELECT id, fecha_inicio FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
      ),
      queryFresh<CarreraCatalogoSQLRow[]>(
        `SELECT id, nombre FROM carreras ORDER BY nombre ASC`
      ),
    ])

    const periodoActualId = Number(periodoRows[0]?.id ?? 0)
    const fechaInicioActual = normalizarFechaSql(periodoRows[0]?.fecha_inicio)
    const usarCorteCronologico = periodoActualId > 0 && fechaInicioActual !== ""

    const params: Array<string | number> = []
    const joinUltima = usarCorteCronologico
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

    if (usarCorteCronologico) {
      params.push(fechaInicioActual)
    }

    const condiciones: string[] = []
    const fechaEfectivaExpr = `COALESCE(s.fecha_decision, s.fecha_registro)`

    if (desde && hasta) {
      condiciones.push(`${fechaEfectivaExpr} BETWEEN ? AND ?`)
      params.push(`${desde} 00:00:00`, `${hasta} 23:59:59`)
    } else if (desde) {
      condiciones.push(`${fechaEfectivaExpr} >= ?`)
      params.push(`${desde} 00:00:00`)
    } else if (hasta) {
      condiciones.push(`${fechaEfectivaExpr} <= ?`)
      params.push(`${hasta} 23:59:59`)
    }

    if (limpio !== "") {
      const term = `%${limpio}%`
      condiciones.push(`(
        LOWER(st.nombre) LIKE ?
        OR LOWER(st.apellido) LIKE ?
        OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
        OR LOWER(st.cedula) LIKE ?
        OR LOWER(COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar')) LIKE ?
        OR LOWER(IFNULL(s.tipo_beca, '')) LIKE ?
        OR LOWER(IFNULL(s.estatus, '')) LIKE ?
      )`)
      params.push(term, term, term, term, term, term, term)
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : ""

    const estudiantesRows = await queryFresh<EstudianteCarreraSQLRow[]>(
      `
      SELECT
        s.id AS solicitud_id,
        s.user_id,
        s.periodo_id,
        s.estatus,
        s.tipo_beca,
        s.promedio_notas,
        COALESCE(e_adm.puntaje, e_est.puntaje) AS puntaje_baremo,
        COALESCE(s.fecha_decision, s.fecha_registro) AS fecha_registro,
        st.nombre,
        st.apellido,
        st.cedula,
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS carrera,
        IFNULL(st.semestre, 1) AS semestre,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo
      FROM solicitudes s
      ${joinUltima}
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
        st.apellido ASC,
        st.nombre ASC
      `,
      params
    )

    const nombreOficialPorClave = new Map<string, string>()
    const estudiantesPorCarrera = new Map<string, EstudianteCarreraReporte[]>()

    for (const c of carrerasCatalogoRows) {
      const nombreLimpio = String(c.nombre || "").trim()
      if (!nombreLimpio) continue
      const clave = nombreLimpio.toLowerCase()
      nombreOficialPorClave.set(clave, nombreLimpio)
      if (!hayFiltroFecha && (limpio === "" || clave.includes(limpio))) {
        estudiantesPorCarrera.set(clave, [])
      }
    }

    for (const row of estudiantesRows) {
      const carreraRaw = String(row.carrera || "Sin Asignar").trim() || "Sin Asignar"
      const carreraClave = carreraRaw.toLowerCase()
      const carreraOficial = nombreOficialPorClave.get(carreraClave) ?? carreraRaw

      const nombre = String(row.nombre || "").trim()
      const apellido = String(row.apellido || "").trim()
      const cedula = String(row.cedula || "").trim()
      const tipoBeca =
        normalizarTipoBecaOficial(row.tipo_beca) ||
        String(row.tipo_beca || "No especificado")
      const estatus = String(row.estatus || "Pendiente").trim()
      const estatusLower = estatus.toLowerCase()
      const esAprobada = estatusLower === "aprobada" || estatusLower === "aprobado"
      const esAprobadaVigente =
        esAprobada &&
        (periodoActualId === 0 || Number(row.periodo_id ?? 0) === periodoActualId)

      // Excluir aprobaciones históricas no vigentes para mantener paridad exacta con Dashboard
      if (esAprobada && !esAprobadaVigente) {
        continue
      }

      if (!nombreOficialPorClave.has(carreraClave)) {
        nombreOficialPorClave.set(carreraClave, carreraOficial)
      }

      const lista = estudiantesPorCarrera.get(carreraClave) ?? []
      lista.push({
        solicitud_id: Number(row.solicitud_id),
        user_id: Number(row.user_id),
        cedula,
        nombre,
        apellido,
        carrera: carreraOficial,
        semestre: Number(row.semestre ?? 1),
        tipo_beca: tipoBeca,
        estatus,
        es_aprobada_vigente: esAprobadaVigente,
        promedio_notas: formatearDecimal(row.promedio_notas),
        indice_global: formatearDecimal(row.indice_global),
        puntaje_baremo:
          row.puntaje_baremo !== null && row.puntaje_baremo !== undefined
            ? Number(row.puntaje_baremo)
            : null,
        periodo_codigo: String(row.periodo_codigo || "S/P"),
        fecha_registro: serializarFechaISO(row.fecha_registro),
      })
      estudiantesPorCarrera.set(carreraClave, lista)
    }

    const data: ReporteCarreraItem[] = Array.from(estudiantesPorCarrera.entries())
      .map(([clave, listaEstudiantes]) => {
        const carreraNombre = nombreOficialPorClave.get(clave) ?? clave

        const estudiantesOrdenados = [...listaEstudiantes].sort((a, b) => {
          const pA = prioridadEstatus(a.estatus)
          const pB = prioridadEstatus(b.estatus)
          if (pA !== pB) return pA - pB

          // Regla estricta: 1° Promedio DESC, 2° Puntaje Baremo DESC
          const promDiff =
            (parseFloat(b.promedio_notas) || 0) - (parseFloat(a.promedio_notas) || 0)
          if (Math.abs(promDiff) >= 0.005) return promDiff

          const baremoA = a.puntaje_baremo ?? -1
          const baremoB = b.puntaje_baremo ?? -1
          if (baremoB !== baremoA) return baremoB - baremoA

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

          if (est.es_aprobada_vigente) {
            aprobadas += 1
          } else if (e === "rechazada" || e === "rechazado") {
            rechazadas += 1
          } else if (e === "finalizada") {
            finalizadas += 1
          } else {
            enProceso += 1
          }
        }

        const total = estudiantesOrdenados.length
        const efectividad = total > 0 ? Math.round((aprobadas / total) * 100) : 0
        const promedioGeneral = total > 0 ? (sumaProm / total).toFixed(2) : "0.00"

        return {
          carrera: carreraNombre,
          total_solicitudes: total,
          aprobadas,
          rechazadas,
          en_proceso: enProceso,
          finalizadas,
          efectividad,
          promedio_general: promedioGeneral,
          estudiantes: estudiantesOrdenados,
        }
      })
      .sort((a, b) => {
        if (b.total_solicitudes !== a.total_solicitudes) {
          return b.total_solicitudes - a.total_solicitudes
        }
        return a.carrera.localeCompare(b.carrera, "es")
      })

    const totalSolicitudes = data.reduce((acc, r) => acc + r.total_solicitudes, 0)
    const totalAprobadas = data.reduce((acc, r) => acc + r.aprobadas, 0)
    const totalFinalizadas = data.reduce((acc, r) => acc + r.finalizadas, 0)
    const efectividadGlobal =
      totalSolicitudes > 0 ? Math.round((totalAprobadas / totalSolicitudes) * 100) : 0

    return {
      success: true,
      data,
      stats: {
        totalCarreras: data.length,
        totalSolicitudes,
        totalAprobadas,
        totalFinalizadas,
        efectividadGlobal,
      },
    }
  } catch (error) {
    console.error("Error en obtenerReporteCarreras:", error)
    return {
      success: false,
      data: [],
      stats: {
        totalCarreras: 0,
        totalSolicitudes: 0,
        totalAprobadas: 0,
        totalFinalizadas: 0,
        efectividadGlobal: 0,
      },
      error: "No fue posible consultar la distribución por carreras.",
    }
  }
}
