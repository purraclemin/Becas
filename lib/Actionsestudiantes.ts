'use server'

import { db } from './db'

/**
 * Obtiene estudiantes con solicitud activa realizando el filtrado y paginación en el servidor.
 */
export async function obtenerEstudiantesConSolicitud(
  busqueda: string = "", 
  page: number = 1, 
  limit: number = 12 // Mostramos 12 por página (bueno para grids de 3x4 o 4x3)
) {
  try {
    const term = `%${busqueda.trim()}%`;
    const offset = (page - 1) * limit;
    
    // 1. CONDICIÓN DE BÚSQUEDA REUTILIZABLE
    const whereClause = `
      WHERE (st.nombre LIKE ? OR st.apellido LIKE ? OR st.cedula LIKE ? OR st.email LIKE ?)
    `;

    // 2. CONSULTA DE CONTEO (Para saber cuántas páginas hay)
    const countQuery = `
      SELECT COUNT(DISTINCT st.id) as total
      FROM students st
      INNER JOIN solicitudes s ON st.id = s.user_id 
      ${whereClause}
    `;
    
    const [countRows]: any = await db.execute(countQuery, [term, term, term, term]);
    const totalRegistros = countRows[0].total;

    // 3. CONSULTA DE DATOS (Con Límite Seguro)
    const dataQuery = `
      SELECT 
        st.id, st.nombre, st.apellido, st.cedula, st.email, 
        st.telefono, st.carrera, st.semestre, u.created_at 
      FROM students st
      INNER JOIN solicitudes s ON st.id = s.user_id 
      LEFT JOIN users u ON st.email = u.email
      ${whereClause}
      GROUP BY st.id
      ORDER BY st.apellido ASC
      LIMIT ? OFFSET ?
    `;

    // Nota: Los parámetros de LIMIT y OFFSET deben ser enteros, no strings
    const [rows]: any = await db.execute(dataQuery, [
        term, term, term, term, 
        limit.toString(), 
        offset.toString()
    ]);

    return {
      estudiantes: rows,
      totalPaginas: Math.ceil(totalRegistros / limit),
      totalRegistros: totalRegistros
    };

  } catch (error) {
    console.error("❌ Error en búsqueda de estudiantes:", error);
    return { estudiantes: [], totalPaginas: 0, totalRegistros: 0 };
  }
}