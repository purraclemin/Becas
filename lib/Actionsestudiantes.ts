'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { queryFresh } from './db'
import { normalizarTipoBecaOficial } from './RecordAcademicoUtils'

interface EstudianteAdminSQLRow extends RowDataPacket {
  id: number
  nombre: string
  apellido: string
  cedula: string
  email: string | null
  email_institucional: string | null
  telefono: string | null
  carrera: string | null
  semestre: number | null
  created_at: Date | string | null
  estatus_actual: string | null
  tipo_beca_actual: string | null
  periodo_codigo: string | null
}

interface TotalCountSQLRow extends RowDataPacket {
  total: number
}

interface CarreraOpcionSQLRow extends RowDataPacket {
  carrera: string
}

export interface IEstudianteAdmin {
  id: number
  cedula: string
  nombre: string
  apellido: string
  correo: string
  email: string
  email_institucional: string
  telefono: string
  carrera: string
  semestre: number
  created_at: string
  estatus_actual: string
  tipo_beca_actual: string
  periodo_codigo: string
  [key: string]: unknown
}

export interface RespuestaEstudiantesAdmin {
  success: boolean
  estudiantes: IEstudianteAdmin[]
  carreras: string[]
  totalPaginas: number
  totalRegistros: number
  page: number
  error?: string
}

function serializarFechaISO(valor: Date | string | null | undefined): string {
  if (!valor) return ''
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? '' : valor.toISOString()
  }
  const parsed = new Date(valor)
  return Number.isNaN(parsed.getTime()) ? String(valor) : parsed.toISOString()
}

/**
 * Obtiene el padrón deduplicado de estudiantes con solicitud (`MAX(id)` por `user_id`),
 * con soporte de búsqueda insensible a mayúsculas, filtro por carrera y paginación segura.
 */
export async function obtenerEstudiantesConSolicitud(
  busqueda: string = '',
  page: number = 1,
  limit: number = 12,
  carrera: string = ''
): Promise<RespuestaEstudiantesAdmin> {
  try {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 12)))
    const safePage = Math.max(1, Math.floor(Number(page) || 1))
    const offset = (safePage - 1) * safeLimit

    const searchClean = busqueda.trim().toLowerCase()
    const carreraClean = carrera.trim().toLowerCase()

    const joinUltimaSolicitud = `
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        GROUP BY user_id
      ) ult ON st.id = ult.user_id
      INNER JOIN solicitudes s ON s.id = ult.last_id
      LEFT JOIN users u ON st.id = u.id
      LEFT JOIN periodos_academicos p ON s.periodo_id = p.id
    `

    let whereClause = ' WHERE 1=1'
    const params: Array<string | number> = []

    if (searchClean !== '') {
      const term = `%${searchClean}%`
      whereClause += `
        AND (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(IFNULL(NULLIF(TRIM(s.email_institucional), ''), IFNULL(st.email, ''))) LIKE ?
          OR LOWER(IFNULL(s.estatus, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term)
    }

    if (carreraClean !== '') {
      whereClause += ` AND LOWER(TRIM(COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar'))) = ?`
      params.push(carreraClean)
    }

    const countQuery = `
      SELECT COUNT(st.id) AS total
      FROM students st
      ${joinUltimaSolicitud}
      ${whereClause}
    `

    const dataQuery = `
      SELECT
        st.id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.email,
        s.email_institucional,
        st.telefono,
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS carrera,
        IFNULL(st.semestre, 1) AS semestre,
        COALESCE(u.created_at, s.fecha_registro) AS created_at,
        s.estatus AS estatus_actual,
        s.tipo_beca AS tipo_beca_actual,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo
      FROM students st
      ${joinUltimaSolicitud}
      ${whereClause}
      ORDER BY st.apellido ASC, st.nombre ASC
      LIMIT ${safeLimit} OFFSET ${offset}
    `

    const carrerasQuery = `
      SELECT DISTINCT
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS carrera
      FROM students st
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        GROUP BY user_id
      ) ult ON st.id = ult.user_id
      ORDER BY carrera ASC
    `

    const [countRows, rows, carrerasRows] = await Promise.all([
      queryFresh<TotalCountSQLRow[]>(countQuery, params),
      queryFresh<EstudianteAdminSQLRow[]>(dataQuery, params),
      queryFresh<CarreraOpcionSQLRow[]>(carrerasQuery),
    ])

    const totalRegistros = Number(countRows[0]?.total ?? 0)
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / safeLimit))

    const estudiantes: IEstudianteAdmin[] = rows.map((row) => {
      const emailInst = String(row.email_institucional || '').trim()
      const emailPers = String(row.email || '').trim()
      const correoFinal = emailInst || emailPers || ''

      return {
        id: Number(row.id),
        cedula: String(row.cedula || '').trim(),
        nombre: String(row.nombre || '').trim(),
        apellido: String(row.apellido || '').trim(),
        correo: correoFinal,
        email: emailPers,
        email_institucional: emailInst,
        telefono: String(row.telefono || '').trim(),
        carrera: String(row.carrera || 'Sin Asignar').trim(),
        semestre: Number(row.semestre ?? 1),
        created_at: serializarFechaISO(row.created_at),
        estatus_actual: String(row.estatus_actual || 'Pendiente').trim(),
        tipo_beca_actual:
          normalizarTipoBecaOficial(row.tipo_beca_actual) ||
          String(row.tipo_beca_actual || 'No especificado'),
        periodo_codigo: String(row.periodo_codigo || 'S/P'),
      }
    })

    const carreras = carrerasRows
      .map((c) => String(c.carrera || '').trim())
      .filter((c) => c !== '')

    return {
      success: true,
      estudiantes,
      carreras,
      totalPaginas,
      totalRegistros,
      page: safePage,
    }
  } catch (error) {
    console.error('❌ Error en búsqueda de estudiantes:', error)
    return {
      success: false,
      estudiantes: [],
      carreras: [],
      totalPaginas: 1,
      totalRegistros: 0,
      page: 1,
      error: 'No fue posible consultar el directorio de estudiantes.',
    }
  }
}

/**
 * Obtiene el padrón completo filtrado (sin límite de 12 por página) para exportación
 * íntegra a PDF y Excel (.xlsx) desde `/admin/estudiantes`.
 */
export async function obtenerTodosEstudiantesParaExportacion(
  busqueda: string = '',
  carrera: string = ''
): Promise<{ success: boolean; estudiantes: IEstudianteAdmin[]; error?: string }> {
  try {
    const searchClean = busqueda.trim().toLowerCase()
    const carreraClean = carrera.trim().toLowerCase()

    const joinUltimaSolicitud = `
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        GROUP BY user_id
      ) ult ON st.id = ult.user_id
      INNER JOIN solicitudes s ON s.id = ult.last_id
      LEFT JOIN users u ON st.id = u.id
      LEFT JOIN periodos_academicos p ON s.periodo_id = p.id
    `

    let whereClause = ' WHERE 1=1'
    const params: Array<string | number> = []

    if (searchClean !== '') {
      const term = `%${searchClean}%`
      whereClause += `
        AND (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(IFNULL(NULLIF(TRIM(s.email_institucional), ''), IFNULL(st.email, ''))) LIKE ?
          OR LOWER(IFNULL(s.estatus, '')) LIKE ?
        )
      `
      params.push(term, term, term, term, term, term)
    }

    if (carreraClean !== '') {
      whereClause += ` AND LOWER(TRIM(COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar'))) = ?`
      params.push(carreraClean)
    }

    const rows = await queryFresh<EstudianteAdminSQLRow[]>(
      `
      SELECT
        st.id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.email,
        s.email_institucional,
        st.telefono,
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS carrera,
        IFNULL(st.semestre, 1) AS semestre,
        COALESCE(u.created_at, s.fecha_registro) AS created_at,
        s.estatus AS estatus_actual,
        s.tipo_beca AS tipo_beca_actual,
        IFNULL(p.codigo, 'S/P') AS periodo_codigo
      FROM students st
      ${joinUltimaSolicitud}
      ${whereClause}
      ORDER BY st.apellido ASC, st.nombre ASC
      `,
      params
    )

    const estudiantes: IEstudianteAdmin[] = rows.map((row) => {
      const emailInst = String(row.email_institucional || '').trim()
      const emailPers = String(row.email || '').trim()
      const correoFinal = emailInst || emailPers || ''

      return {
        id: Number(row.id),
        cedula: String(row.cedula || '').trim(),
        nombre: String(row.nombre || '').trim(),
        apellido: String(row.apellido || '').trim(),
        correo: correoFinal,
        email: emailPers,
        email_institucional: emailInst,
        telefono: String(row.telefono || '').trim(),
        carrera: String(row.carrera || 'Sin Asignar').trim(),
        semestre: Number(row.semestre ?? 1),
        created_at: serializarFechaISO(row.created_at),
        estatus_actual: String(row.estatus_actual || 'Pendiente').trim(),
        tipo_beca_actual:
          normalizarTipoBecaOficial(row.tipo_beca_actual) ||
          String(row.tipo_beca_actual || 'No especificado'),
        periodo_codigo: String(row.periodo_codigo || 'S/P'),
      }
    })

    return { success: true, estudiantes }
  } catch (error) {
    console.error('❌ Error exportando padrón completo de estudiantes:', error)
    return {
      success: false,
      estudiantes: [],
      error: 'No fue posible preparar el padrón completo para exportación.',
    }
  }
}
