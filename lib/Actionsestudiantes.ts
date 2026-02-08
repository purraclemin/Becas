'use server'

import { db } from './db'

/**
 * Obtiene estudiantes con solicitud activa realizando el filtrado en el servidor.
 * Optimizado para bajo consumo de memoria en el cliente.
 */
export async function obtenerEstudiantesConSolicitud(busqueda: string = "") {
  try {
    const term = `%${busqueda.trim()}%`;
    
    // Consulta optimizada: El motor SQL filtra, agrupa y ordena en un solo paso
    const query = `
      SELECT 
        st.id, st.nombre, st.apellido, st.cedula, st.email, 
        st.telefono, st.carrera, st.semestre, u.created_at 
      FROM students st
      INNER JOIN solicitudes s ON st.id = s.user_id 
      LEFT JOIN users u ON st.email = u.email
      WHERE (st.nombre LIKE ? OR st.apellido LIKE ? OR st.cedula LIKE ? OR st.email LIKE ?)
      GROUP BY st.id
      ORDER BY st.apellido ASC
    `;

    const [rows]: any = await db.execute(query, [term, term, term, term]);
    return rows;

  } catch (error) {
    console.error("❌ Error en búsqueda de estudiantes:", error);
    return [];
  }
}