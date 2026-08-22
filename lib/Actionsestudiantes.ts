'use server'

import { db } from './db'
import { RowDataPacket } from 'mysql2/promise'

export interface IEstudianteAdmin {
  id: number | string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  carrera?: string;
  fecha_ingreso?: string;
  [key: string]: unknown; 
}

/**
 * Obtiene estudiantes con solicitud activa realizando el filtrado y paginación en el servidor.
 */
export async function obtenerEstudiantesConSolicitud(
  busqueda: string = "", 
  page: number = 1, 
  limit: number = 12 
) {
  try {
    const term = `%${busqueda.trim()}%`;
    const safeLimit = Number(limit) || 12;
    const safePage = Number(page) || 1;
    const offset = (safePage - 1) * safeLimit;
    
    // 1. CONDICIÓN DE BÚSQUEDA REUTILIZABLE (Optimizada con EXISTS para evitar duplicados y conflictos de grupo)
    const whereClause = `
      WHERE EXISTS (
        SELECT 1 FROM solicitudes s WHERE s.user_id = st.id
      )
      AND (st.nombre LIKE ? OR st.apellido LIKE ? OR st.cedula LIKE ? OR st.email LIKE ?)
    `;

    // 2. CONSULTA DE CONTEO (Para saber cuántas páginas hay)
    const countQuery = `
      SELECT COUNT(st.id) as total
      FROM students st
      ${whereClause}
    `;
    
    const [countRows] = await db.execute<RowDataPacket[]>(countQuery, [term, term, term, term]);
    const totalRegistros = Number(countRows[0]?.total || 0);

    // 3. CONSULTA DE DATOS (Inyectando LIMIT y OFFSET como números seguros para compatibilidad total con TiDB Cloud)
    const dataQuery = `
      SELECT 
        st.id, st.nombre, st.apellido, st.cedula, st.email, 
        st.telefono, st.carrera, st.semestre, u.created_at 
      FROM students st
      LEFT JOIN users u ON st.id = u.id
      ${whereClause}
      ORDER BY st.apellido ASC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    // Se pasan únicamente los términos de búsqueda para proteger contra inyección SQL
    const [rows] = await db.execute<RowDataPacket[]>(dataQuery, [
        term, term, term, term
    ]);

    return {
      estudiantes: rows as unknown as IEstudianteAdmin[],
      totalPaginas: Math.ceil(totalRegistros / safeLimit),
      totalRegistros: totalRegistros
    };

  } catch (error) {
    console.error("❌ Error en búsqueda de estudiantes:", error);
    return { estudiantes: [], totalPaginas: 0, totalRegistros: 0 };
  }
}