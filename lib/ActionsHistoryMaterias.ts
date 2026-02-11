'use server'

import { db } from './db'

/**
 * 🟢 MÓDULO DE HISTORIAL ACADÉMICO (KARDEX)
 * Se encarga exclusivamente de consultar y procesar los registros históricos
 * de solicitudes aprobadas para generar la línea de tiempo del estudiante.
 */

export async function getStudentHistory(userId: string | number) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId) : userId;

    // 1. Consulta SQL optimizada para traer solo lo aprobado y ordenado cronológicamente
    // Usamos INNER JOIN para asegurar que traiga datos del periodo asociado
    const [rows]: any = await db.execute(`
      SELECT 
        s.id as solicitud_id,
        s.promedio_notas,
        s.materias_json,
        s.fecha_registro,
        p.codigo as codigo_periodo,
        p.nombre as nombre_periodo,
        p.fecha_inicio as fecha_inicio_periodo
      FROM solicitudes s
      INNER JOIN periodos_academicos p ON s.periodo_id = p.id
      WHERE s.user_id = ? 
        AND s.estatus = 'Aprobada'
      ORDER BY p.fecha_inicio DESC
    `, [idNum]);

    // 2. Procesamiento de datos (Parsing y Formato)
    const historial = rows.map((row: any) => {
      let materias = [];
      try {
        materias = row.materias_json ? JSON.parse(row.materias_json) : [];
      } catch (e) {
        console.error(`Error parseando JSON de solicitud ${row.solicitud_id}`, e);
        materias = [];
      }

      // Calculamos promedio real de las materias guardadas en ese JSON
      // (Doble verificación por si el campo promedio_notas difiere)
      const promedioCalculado = materias.length > 0
        ? (materias.reduce((acc: number, m: any) => acc + parseFloat(m.nota || 0), 0) / materias.length)
        : 0;

      return {
        id: row.solicitud_id,
        periodoCodigo: row.codigo_periodo,
        periodoNombre: row.nombre_periodo,
        fechaRegistro: new Date(row.fecha_registro).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' }),
        promedio: parseFloat(row.promedio_notas || promedioCalculado).toFixed(2),
        materias: materias,
        totalMaterias: materias.length,
        estado: 'Aprobado' // Redundante pero útil para UI
      };
    });

    // 3. Generación de Estadísticas Globales para el Dashboard
    const totalPeriodos = historial.length;
    const totalMateriasAprobadas = historial.reduce((acc: number, curr: any) => acc + curr.totalMaterias, 0);
    
    // Cálculo de promedio histórico ponderado (simple en este caso)
    const sumaPromedios = historial.reduce((acc: number, curr: any) => acc + parseFloat(curr.promedio), 0);
    const promedioHistorico = totalPeriodos > 0 
      ? (sumaPromedios / totalPeriodos).toFixed(2) 
      : "0.00";

    return {
      success: true,
      data: historial,
      stats: {
        totalPeriodos,
        totalMaterias: totalMateriasAprobadas,
        promedioHistorico
      }
    };

  } catch (error) {
    console.error("❌ Error en getStudentHistory:", error);
    return {
      success: false,
      data: [],
      stats: {
        totalPeriodos: 0,
        totalMaterias: 0,
        promedioHistorico: "0.00"
      }
    };
  }
}