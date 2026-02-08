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

    // 3. Promedio general
    const [promedioGral]: any = await db.execute(
      'SELECT AVG(promedio_notas) as promedio FROM solicitudes'
    );

    // 4. Total por Carrera
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
      porCarrera: conteoCarrera
    };
  } catch (error) {
    console.error("Error en Action Dashboard:", error);
    return { porEstatus: [], porTipo: [], promedio: 0, porCarrera: [] };
  }
}