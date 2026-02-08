'use server'

import { db } from './db'
import { unstable_noStore as noStore } from 'next/cache'

export async function obtenerRankingPrioridad(filtros?: any) {
  noStore();
  try {
    let query = `
      SELECT 
        s.id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        s.promedio_notas,
        IFNULL(e.puntaje, 0) as vulnerabilidad_puntos,
        /* EL PROMEDIO ES EL REY: 
           Multiplicamos por 100 para que el mérito sea incuestionable.
        */
        ((CAST(s.promedio_notas AS DECIMAL(10,2)) * 100) + IFNULL(e.puntaje, 0)) as indice_merito
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      WHERE 
        (s.estatus = 'Pendiente' OR s.estatus = 'En Revisión')
    `;

    const params: any[] = [];

    // --- FILTROS DINÁMICOS ---
    if (filtros) {
      if (filtros.carrera) {
        query += ` AND st.carrera = ?`;
        params.push(filtros.carrera);
      }
      if (filtros.tipoBeca) {
        query += ` AND s.tipo_beca = ?`;
        params.push(filtros.tipoBeca);
      }
    }

    /* --- FILTROS RELAJADOS PARA DEPURACIÓN --- */
    query += ` AND s.promedio_notas >= 16.50`; // Bajado de 16.50 a 10.00
    query += ` AND IFNULL(e.puntaje, 0) >= 35`;   // Bajado de 40 a 0

    query += ` ORDER BY indice_merito DESC LIMIT 6`;

    const [rows]: any = await db.execute(query, params);

    return rows;
  } catch (error) {
    console.error("❌ Error en ranking élite:", error);
    return [];
  }
}