'use server'

import { db } from './db'
import { unstable_noStore as noStore } from 'next/cache'

interface FiltrosRanking {
  carrera?: string;
  tipoBeca?: string;
}

export async function obtenerRankingPrioridad(filtros: FiltrosRanking = {}) {
  noStore();

  try {
    const condiciones: string[] = [];
    const parametros: any[] = [];

    condiciones.push("(s.estatus = 'Pendiente' OR s.estatus = 'En Revisión')");

    if (filtros.carrera && filtros.carrera !== "") {
      condiciones.push("st.carrera = ?");
      parametros.push(filtros.carrera);
    }

    if (filtros.tipoBeca && filtros.tipoBeca !== "") {
      condiciones.push("s.tipo_beca = ?");
      parametros.push(filtros.tipoBeca);
    }

    condiciones.push("s.promedio_notas >= 16.49"); 

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
        
        /* Determinamos el puntaje aplicando la regla de prioridad */
        COALESCE(
          (SELECT puntaje FROM estudios_socioeconomicos WHERE student_id = st.id AND tipo = 'administrador' LIMIT 1),
          (SELECT puntaje FROM estudios_socioeconomicos WHERE student_id = st.id AND tipo = 'estudiante' LIMIT 1),
          0
        ) as vulnerabilidad_puntos,

        /* Identificamos visualmente el origen para colorearlo en el frontend */
        CASE 
          WHEN (SELECT id FROM estudios_socioeconomicos WHERE student_id = st.id AND tipo = 'administrador' LIMIT 1) IS NOT NULL THEN 'admin'
          ELSE 'estudiante'
        END as origen_puntaje,
        
        (
          (CAST(s.promedio_notas AS DECIMAL(10,2)) * 100) + 
          (COALESCE(
            (SELECT puntaje FROM estudios_socioeconomicos WHERE student_id = st.id AND tipo = 'administrador' LIMIT 1),
            (SELECT puntaje FROM estudios_socioeconomicos WHERE student_id = st.id AND tipo = 'estudiante' LIMIT 1),
            0
          ) * 1.5)
        ) as indice_merito

      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      
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