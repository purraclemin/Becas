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

    return {
      porEstatus: conteoEstatus,
      porTipo: conteoTipos,
      promedio: promedioGral[0]?.promedio || 0
    };
  } catch (error) {
    console.error("Error al generar reportes:", error);
    return null;
  }
}