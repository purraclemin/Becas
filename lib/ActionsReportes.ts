// lib/ActionsReportes.ts
'use server'

import { db } from './db'

export async function obtenerEstadisticasBecas() {
  try {
    // 1. Total de solicitudes por estatus
    const [conteoEstatus]: any = await db.execute(
      'SELECT estatus, COUNT(*) as total FROM solicitudes GROUP BY estatus'
    );

    // 2. Total por tipo de beca
    const [conteoTipos]: any = await db.execute(
      'SELECT tipo_beca, COUNT(*) as total FROM solicitudes GROUP BY tipo_beca'
    );

    // 3. Promedio general de los postulantes
    const [promedioGral]: any = await db.execute(
      'SELECT AVG(promedio_notas) as promedio FROM solicitudes'
    );

    // 4. NUEVO: Total por Carrera (Facultad)
    // Usamos el mismo JOIN que te funcionó en Recientes (s.user_id = st.id)
    const [conteoCarrera]: any = await db.execute(`
      SELECT st.carrera as name, COUNT(s.id) as value
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      GROUP BY st.carrera
    `);

    return {
      porEstatus: conteoEstatus,
      porTipo: conteoTipos,
      promedio: promedioGral[0]?.promedio || 0,
      porCarrera: conteoCarrera // <-- ¡Aquí va la data para tu gráfico de barras!
    };
  } catch (error) {
    console.error("Error al generar reportes:", error);
    // Devolvemos estructura vacía segura para que no rompa el dashboard
    return { porEstatus: [], porTipo: [], promedio: 0, porCarrera: [] };
  }
}