// lib/ActionsRecientes.ts
'use server'

import { db } from './db'

/**
 * Obtiene las últimas solicitudes registradas en el sistema.
 * Une la tabla 'solicitudes' con 'students' para obtener nombres reales.
 */
export async function obtenerSolicitudesRecientes() {
  try {
    const [rows]: any = await db.execute(`
      SELECT 
        s.id,
        st.nombre,
        st.apellido,
        s.tipo_beca,
        s.promedio_notas,
        s.estatus,
        s.fecha_registro
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      ORDER BY s.fecha_registro DESC
      LIMIT 5
    `);

    return rows;
  } catch (error) {
    console.error("❌ Error al obtener solicitudes recientes:", error);
    return [];
  }
}