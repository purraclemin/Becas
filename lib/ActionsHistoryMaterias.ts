'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { unstable_noStore as noStore } from 'next/cache'
import { queryFresh } from './db'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'

interface SolicitudHistorialRow extends RowDataPacket {
  solicitud_id: number
  promedio_notas: number | string | null
  materias_json: string | null
  fecha_registro: Date | string
  estatus: string | null
  codigo_periodo: string | null
  nombre_periodo: string | null
}

interface MateriaJSONItem {
  codigo?: string
  nombre?: string
  creditos?: number | string
  nota?: number | string
}

interface HistorialPeriodoItem {
  id: number | string
  periodoCodigo: string
  periodoNombre: string
  trimestre: number | null
  fechaRegistro: string
  promedio: string
  materias: Array<{
    codigo: string
    nombre: string
    creditos: number
    nota: number
  }>
  totalMaterias: number
  estado: string
}

/**
 * MÓDULO DE HISTORIAL ACADÉMICO (KARDEX)
 * Prioriza el récord académico oficial por trimestre (record_academico)
 * tanto para la vista del estudiante como para auditoría administrativa,
 * y conserva respaldo en solicitudes.materias_json.
 */
export async function getStudentHistory(userId: string | number, onlyApproved: boolean = true) {
  noStore()

  try {
    if (userId === undefined || userId === null || userId === '') {
      return {
        success: false,
        data: [],
        stats: { totalPeriodos: 0, totalMaterias: 0, promedioHistorico: '0.00' },
      }
    }

    const idNum = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId)

    if (!Number.isInteger(idNum) || idNum <= 0) {
      return {
        success: false,
        data: [],
        stats: { totalPeriodos: 0, totalMaterias: 0, promedioHistorico: '0.00' },
      }
    }

    // 1. Leer siempre desde el récord académico oficial sincronizado (record_academico)
    const syncRes = await sincronizarYObtenerRecordAcademico(idNum)
    const expediente = syncRes.success ? syncRes.data : null

    if (expediente && expediente.historialPorTrimestre.length > 0) {
      const historialOficial: HistorialPeriodoItem[] = expediente.historialPorTrimestre.map(
        (grupo) => {
          const materiasFormateadas = grupo.materias.map((m) => ({
            codigo: m.codigo_materia,
            nombre: m.nombre_materia,
            creditos: Number(m.unidades_credito ?? 3),
            nota: Number(m.nota ?? 0),
          }))

          return {
            id: `trim-${expediente.studentId}-${grupo.trimestre}`,
            periodoCodigo: `T-${grupo.trimestre}`,
            periodoNombre: `Trimestre ${grupo.trimestre}`,
            trimestre: grupo.trimestre,
            fechaRegistro: 'Récord Oficial UNIMAR',
            promedio: Number(grupo.promedioTrimestre).toFixed(2),
            materias: materiasFormateadas,
            totalMaterias: materiasFormateadas.length,
            estado: 'Cursado',
          }
        }
      )

      const totalPeriodos = historialOficial.length
      const totalMaterias = historialOficial.reduce(
        (acc, item) => acc + item.totalMaterias,
        0
      )

      return {
        success: true,
        data: historialOficial,
        stats: {
          totalPeriodos,
          totalMaterias,
          promedioHistorico: Number(expediente.indiceGlobal).toFixed(2),
        },
      }
    }

    // 2. Respaldo desde solicitudes (para semestre 1 sin récord precargado o historial previo)
    const statusFilter = onlyApproved ? "AND s.estatus = 'Aprobada'" : ''

    const rows = await queryFresh<SolicitudHistorialRow[]>(
      `
        SELECT
          s.id AS solicitud_id,
          s.promedio_notas,
          s.materias_json,
          s.fecha_registro,
          s.estatus,
          p.codigo AS codigo_periodo,
          p.nombre AS nombre_periodo
        FROM solicitudes s
        INNER JOIN periodos_academicos p ON s.periodo_id = p.id
        WHERE s.user_id = ?
          AND s.materias_json IS NOT NULL
          AND s.materias_json != ''
          ${statusFilter}
        ORDER BY p.fecha_inicio DESC
      `,
      [idNum]
    )

    const historial: HistorialPeriodoItem[] = rows.map((row) => {
      let materiasRaw: MateriaJSONItem[] = []
      let trimestreHistorico: number | null = null

      try {
        const parsed: unknown =
          typeof row.materias_json === 'string'
            ? JSON.parse(row.materias_json)
            : row.materias_json

        if (Array.isArray(parsed)) {
          materiasRaw = parsed as MateriaJSONItem[]
        } else if (parsed && typeof parsed === 'object') {
          const obj = parsed as { materias?: MateriaJSONItem[]; trimestre?: number | string | null }
          materiasRaw = Array.isArray(obj.materias) ? obj.materias : []
          trimestreHistorico =
            obj.trimestre !== undefined && obj.trimestre !== null
              ? Number(obj.trimestre)
              : null
        }
      } catch (e) {
        console.error(`Error parseando JSON de solicitud ${row.solicitud_id}`, e)
        materiasRaw = []
      }

      const materiasFormateadas = materiasRaw.map((m) => ({
        codigo: String(m.codigo ?? 'N/A'),
        nombre: String(m.nombre ?? 'Asignatura'),
        creditos: Number(m.creditos ?? 3),
        nota: parseFloat(String(m.nota ?? 0)) || 0,
      }))

      const promedioCalculado =
        materiasFormateadas.length > 0
          ? materiasFormateadas.reduce((acc, m) => acc + m.nota, 0) /
            materiasFormateadas.length
          : 0

      const promedioFinal =
        row.promedio_notas !== null &&
        row.promedio_notas !== undefined &&
        String(row.promedio_notas).trim() !== ''
          ? parseFloat(String(row.promedio_notas))
          : promedioCalculado

      return {
        id: row.solicitud_id,
        periodoCodigo: String(row.codigo_periodo ?? 'N/A'),
        periodoNombre: String(row.nombre_periodo ?? 'Periodo Académico'),
        trimestre: trimestreHistorico,
        fechaRegistro: new Date(row.fecha_registro).toLocaleDateString('es-VE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        promedio: Number.isFinite(promedioFinal) ? promedioFinal.toFixed(2) : '0.00',
        materias: materiasFormateadas,
        totalMaterias: materiasFormateadas.length,
        estado: String(row.estatus ?? 'Pendiente'),
      }
    })

    const totalPeriodos = historial.length
    const totalMateriasContabilizadas = historial.reduce(
      (acc, curr) => acc + curr.totalMaterias,
      0
    )
    const sumaPromedios = historial.reduce(
      (acc, curr) => acc + parseFloat(curr.promedio),
      0
    )
    const promedioHistorico =
      totalPeriodos > 0 ? (sumaPromedios / totalPeriodos).toFixed(2) : '0.00'

    return {
      success: true,
      data: historial,
      stats: {
        totalPeriodos,
        totalMaterias: totalMateriasContabilizadas,
        promedioHistorico,
      },
    }
  } catch (error) {
    console.error('❌ Error crítico en getStudentHistory:', error)
    return {
      success: false,
      data: [],
      stats: { totalPeriodos: 0, totalMaterias: 0, promedioHistorico: '0.00' },
    }
  }
}