'use server'

import { db } from './db'
import { unstable_noStore as noStore } from 'next/cache'

/**
 * Obtiene el historial de las últimas 50 solicitudes para la vista de Actividad.
 * Esta función está separada de las métricas del dashboard para permitir 
 * un seguimiento detallado sin afectar el rendimiento del panel principal.
 */
export async function obtenerSolicitudesRecientes() {
  // Forzamos a Next.js a no cachear este resultado para que el historial
  // refleje los cambios (nuevos registros o cambios de estatus) al instante.
  noStore(); 

  try {
    const query = `
      SELECT 
        s.id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        s.tipo_beca,
        s.promedio_notas,
        s.estatus,
        s.fecha_registro
      FROM solicitudes s
      INNER JOIN students st ON s.user_id = st.id
      ORDER BY s.fecha_registro DESC
      LIMIT 50
    `;

    const [rows]: any = await db.execute(query);

    // Retornamos el array de registros para ser mapeado en la tabla de actividad
    return rows;

  } catch (error) {
    console.error("❌ Error al recuperar el historial de actividad:", error);
    // Retornamos array vacío para evitar que el .map() falle en el cliente
    return [];
  }
}