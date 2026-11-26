"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"

interface TipoBecaSQLRow extends RowDataPacket {
  tipo_beca: string | null
  total: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
}

export interface ReporteTipoBecaItem {
  tipo_beca: string
  total: number
  aprobadas: number
  rechazadas: number
  en_proceso: number
  porcentaje: number
}

export interface StatsTiposBecaReporte {
  totalModalidades: number
  totalSolicitudes: number
  totalAprobadas: number
}

export interface RespuestaReporteTiposBeca {
  success: boolean
  data: ReporteTipoBecaItem[]
  stats: StatsTiposBecaReporte
  error?: string
}

/**
 * Desglose operativo por modalidad homologando todas las variantes históricas
 * y de capitalización a las 10 denominaciones oficiales de la Normativa UNIMAR 2023.
 */
export async function obtenerReporteTiposBeca(
  search?: string
): Promise<RespuestaReporteTiposBeca> {
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
          OR LOWER(IFNULL(s.tipo_beca, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term)
    }

    const sql = `
      SELECT
        s.tipo_beca,
        COUNT(s.id) AS total,
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
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      ${whereClause}
      GROUP BY s.tipo_beca
      ORDER BY total DESC
    `

    const rows = await queryFresh<TipoBecaSQLRow[]>(sql, params)

    // Consolidar variantes legadas bajo su nombre oficial UNIMAR 2023
    const acumulado = new Map<
      string,
      { total: number; aprobadas: number; rechazadas: number; en_proceso: number }
    >()

    for (const row of rows) {
      const oficial =
        normalizarTipoBecaOficial(row.tipo_beca) ||
        (row.tipo_beca && String(row.tipo_beca).trim() !== ""
          ? String(row.tipo_beca).trim().toUpperCase()
          : "NO ESPECIFICADO")

      const actual = acumulado.get(oficial) ?? {
        total: 0,
        aprobadas: 0,
        rechazadas: 0,
        en_proceso: 0,
      }

      actual.total += Number(row.total ?? 0)
      actual.aprobadas += Number(row.aprobadas ?? 0)
      actual.rechazadas += Number(row.rechazadas ?? 0)
      actual.en_proceso += Number(row.en_proceso ?? 0)
      acumulado.set(oficial, actual)
    }

    const totalSolicitudes = Array.from(acumulado.values()).reduce(
      (acc, v) => acc + v.total,
      0
    )

    const data: ReporteTipoBecaItem[] = Array.from(acumulado.entries())
      .map(([tipo_beca, valores]) => ({
        tipo_beca,
        total: valores.total,
        aprobadas: valores.aprobadas,
        rechazadas: valores.rechazadas,
        en_proceso: valores.en_proceso,
        porcentaje:
          totalSolicitudes > 0
            ? Math.round((valores.total / totalSolicitudes) * 100)
            : 0,
      }))
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total
        return a.tipo_beca.localeCompare(b.tipo_beca, "es")
      })

    const totalAprobadas = data.reduce((acc, item) => acc + item.aprobadas, 0)

    return {
      success: true,
      data,
      stats: {
        totalModalidades: data.length,
        totalSolicitudes,
        totalAprobadas,
      },
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
      },
      error: "No fue posible consultar el reporte de tipos de beca.",
    }
  }
}