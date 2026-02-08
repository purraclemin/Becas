'use server'

import { db } from './db'
import { unstable_noStore as noStore } from 'next/cache'

// Definimos la estructura de los filtros para tener autocompletado
interface FiltrosRanking {
  carrera?: string;
  tipoBeca?: string;
}

export async function obtenerRankingPrioridad(filtros: FiltrosRanking = {}) {
  // 1. Desactivamos caché para que el ranking sea en tiempo real
  noStore();

  try {
    // 2. CONSTRUCCIÓN DINÁMICA DE LA CONSULTA
    // Usamos un array para apilar las condiciones 'WHERE' de forma ordenada
    const condiciones: string[] = [];
    const parametros: any[] = [];

    // A. Condición Base: Solo solicitudes activas
    condiciones.push("(s.estatus = 'Pendiente' OR s.estatus = 'En Revisión')");

    // B. Filtros Dinámicos (Solo se agregan si existen)
    if (filtros.carrera && filtros.carrera !== "") {
      condiciones.push("st.carrera = ?");
      parametros.push(filtros.carrera);
    }

    if (filtros.tipoBeca && filtros.tipoBeca !== "") {
      condiciones.push("s.tipo_beca = ?");
      parametros.push(filtros.tipoBeca);
    }

    // C. Filtros de "Excelencia" (Umbral mínimo para aparecer en el Top)
    // Puedes ajustar estos números según la exigencia de la UNIMAR
    condiciones.push("s.promedio_notas >= 16.49"); // Umbral razonable para "buenos estudiantes"
    // condiciones.push("IFNULL(e.puntaje, 0) >= 20"); // Opcional: Filtrar también por vulnerabilidad mínima

    // 3. ARMAMOS LA SQL FINAL
    // Unimos todas las condiciones con 'AND' automáticamente
    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const query = `
      SELECT 
        s.id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        s.tipo_beca,
        s.promedio_notas,
        COALESCE(e.puntaje, 0) as vulnerabilidad_puntos,
        
        /* FÓRMULA DEL ÍNDICE DE MÉRITO (Algoritmo de Prioridad)
           - El Promedio Académico pesa un 60% (x100 para escalar)
           - La Vulnerabilidad pesa un 40% (x1.5 para equilibrar la escala 0-100)
        */
        (
          (CAST(s.promedio_notas AS DECIMAL(10,2)) * 100) + 
          (COALESCE(e.puntaje, 0) * 1.5)
        ) as indice_merito

      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      
      ${whereClause}
      
      ORDER BY indice_merito DESC
      LIMIT 6
    `;

    const [rows]: any = await db.execute(query, parametros);
    return rows;

  } catch (error) {
    console.error("❌ Error calculando Ranking de Prioridad:", error);
    return [];
  }
}