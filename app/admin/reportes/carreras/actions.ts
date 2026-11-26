"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"

interface DistribucionCarreraSQLRow extends RowDataPacket {
  carrera: string
  total_solicitudes: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
}

export interface ReporteCarreraItem {
  carrera: string
  total_solicitudes: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
  efectividad: number
}

export interface StatsCarrerasReporte {
  totalCarreras: number
  totalSolicitudes: number
  totalAprobadas: number
  efectividadGlobal: number
}

export interface RespuestaReporteCarreras {
  success: boolean
  data: ReporteCarreraItem[]
  stats: StatsCarrerasReporte
  error?: string
}

/**
 * Distribución operativa por carrera con normalización insensible a mayúsculas
 * de todos los estatus (incluyendo Renovación, Aprobado y Rechazado).
 */
export async function obtenerReporteCarreras(
  search?: string
): Promise<RespuestaReporteCarreras> {
  try {
    const limpio = (search || "").trim().toLowerCase()
    const params: Array<string | number> = []

    const selectAgregados = `
      c.nombre AS carrera,
      COUNT(s.id) AS total_solicitudes,
      IFNULL(SUM(CASE WHEN LOWER(TRIM(s.estatus)) IN ('aprobada', 'aprobado') THEN 1 ELSE 0 END), 0) AS aprobadas,
      IFNULL(SUM(CASE WHEN LOWER(TRIM(s.estatus)) IN ('rechazada', 'rechazado') THEN 1 ELSE 0 END), 0) AS rechazadas,
      IFNULL(SUM(CASE WHEN LOWER(TRIM(s.estatus)) IN (
        'en revisión',
        'en revision',
        'pendiente',
        'convocado a entrevista',
        'revisión especial',
        'revision especial',
        'renovacion',
        'renovación'
      ) THEN 1 ELSE 0 END), 0) AS en_proceso
    `

    let sql: string
    if (limpio !== "") {
      const term = `%${limpio}%`
      sql = `
        SELECT ${selectAgregados}
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
        ORDER BY total_solicitudes DESC, c.nombre ASC
      `
      params.push(term, term, term, term, term)
    } else {
      sql = `
        SELECT ${selectAgregados}
        FROM carreras c
        LEFT JOIN students st ON LOWER(TRIM(c.nombre)) = LOWER(TRIM(st.carrera))
        LEFT JOIN solicitudes s ON st.id = s.user_id
        GROUP BY c.id, c.nombre
        ORDER BY total_solicitudes DESC, c.nombre ASC
      `
    }

    const rows = await queryFresh<DistribucionCarreraSQLRow[]>(sql, params)

    const data: ReporteCarreraItem[] = rows.map((row) => {
      const total = Number(row.total_solicitudes ?? 0)
      const aprobadas = Number(row.aprobadas ?? 0)
      const rechazadas = Number(row.rechazadas ?? 0)
      const enProceso = Number(row.en_proceso ?? 0)
      const efectividad = total > 0 ? Math.round((aprobadas / total) * 100) : 0

      return {
        carrera: String(row.carrera || "---"),
        total_solicitudes: total,
        aprobadas,
        rechazadas,
        en_proceso: enProceso,
        efectividad,
      }
    })

    const totalSolicitudes = data.reduce((acc, r) => acc + r.total_solicitudes, 0)
    const totalAprobadas = data.reduce((acc, r) => acc + r.aprobadas, 0)
    const efectividadGlobal =
      totalSolicitudes > 0 ? Math.round((totalAprobadas / totalSolicitudes) * 100) : 0

    return {
      success: true,
      data,
      stats: {
        totalCarreras: data.length,
        totalSolicitudes,
        totalAprobadas,
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
        efectividadGlobal: 0,
      },
      error: "No fue posible consultar la distribución por carreras.",
    }
  }
}