'use server'

import { db } from './db'
import { unstable_noStore as noStore } from 'next/cache'

export async function obtenerSolicitudesRecientes() {
  noStore(); // Para ver los datos nuevos siempre
  try {
    const [rows]: any = await db.execute(`
      SELECT 
        s.id,
        st.nombre,
        st.apellido,
        st.cedula,     /* <--- ¡ESTO ES LO QUE FALTABA! */
        st.carrera,
        s.tipo_beca,
        s.promedio_notas,
        s.estatus,
        s.fecha_registro
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      ORDER BY s.fecha_registro DESC
      LIMIT 50
    `);

    return rows;
  } catch (error) {
    console.error("❌ Error al obtener solicitudes recientes:", error);
    return [];
  }
}