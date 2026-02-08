'use server'

import { db } from './db'

export async function obtenerEstadisticasBecas() {
  try {
    // 🚀 OPTIMIZACIÓN: Preparamos las consultas SIN 'await' para lanzarlas en paralelo
    
    // 1. Total de solicitudes por estatus
    const promesaEstatus = db.execute(
      'SELECT estatus, COUNT(*) as total FROM solicitudes GROUP BY estatus'
    );

    // 2. Total por tipo de beca
    const promesaTipos = db.execute(
      'SELECT tipo_beca, COUNT(*) as total FROM solicitudes GROUP BY tipo_beca'
    );

    // 3. Promedio general académico de los solicitantes
    const promesaPromedio = db.execute(
      'SELECT AVG(promedio_notas) as promedio FROM solicitudes'
    );

    // 4. Total por Carrera (Ordenado por las más solicitadas)
    const promesaCarrera = db.execute(`
      SELECT st.carrera as name, COUNT(s.id) as value
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      GROUP BY st.carrera
      ORDER BY value DESC
    `);

    // ⚡ EJECUCIÓN SIMULTÁNEA: Esperamos todas las respuestas a la vez
    // Esto reduce el tiempo de carga drásticamente (de Suma de tiempos a Máximo tiempo individual)
    const [resEstatus, resTipos, resPromedio, resCarrera] = await Promise.all([
      promesaEstatus,
      promesaTipos,
      promesaPromedio,
      promesaCarrera
    ]);

    // Extraemos las filas de los resultados [rows, fields]
    const rowsEstatus: any = resEstatus[0];
    const rowsTipos: any = resTipos[0];
    const rowsPromedio: any = resPromedio[0];
    const rowsCarrera: any = resCarrera[0];

    return {
      porEstatus: rowsEstatus,
      porTipo: rowsTipos,
      // Convertimos a Number y manejamos null por si la tabla está vacía
      promedio: Number(rowsPromedio[0]?.promedio) || 0,
      porCarrera: rowsCarrera
    };

  } catch (error) {
    console.error("❌ Error Crítico en Dashboard KPIs:", error);
    // Retornamos estructura vacía segura para evitar Pantalla Blanca de la Muerte
    return { 
      porEstatus: [], 
      porTipo: [], 
      promedio: 0, 
      porCarrera: [] 
    };
  }
}