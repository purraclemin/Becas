'use server'

import { db } from './db'

/**
 * 🟢 MÓDULO DE HISTORIAL ACADÉMICO (KARDEX)
 * Se encarga de consultar y procesar los registros históricos.
 * @param userId ID del usuario a consultar.
 * @param onlyApproved Si es true, filtra solo becas aprobadas (para el alumno). 
 * Si es false, trae todas las solicitudes con materias (para el admin).
 */

export async function getStudentHistory(userId: string | number, onlyApproved: boolean = true) {
  try {
    // 1. VALIDACIÓN DE SEGURIDAD
    if (userId === undefined || userId === null || userId === "") {
      return {
        success: false,
        data: [],
        stats: { totalPeriodos: 0, totalMaterias: 0, promedioHistorico: "0.00" }
      };
    }

    const idNum = typeof userId === 'string' ? parseInt(userId) : userId;

    if (isNaN(idNum)) {
      console.warn("getStudentHistory: El ID proporcionado no es un número válido.");
      return {
        success: false,
        data: [],
        stats: { totalPeriodos: 0, totalMaterias: 0, promedioHistorico: "0.00" }
      };
    }

    // 2. CONSTRUCCIÓN DINÁMICA DE LA CONSULTA
    // Filtro estricto para alumnos, abierto para administradores.
    const statusFilter = onlyApproved ? "AND s.estatus = 'Aprobada'" : "";

    const [rows]: any = await db.execute(`
      SELECT 
        s.id as solicitud_id,
        s.promedio_notas,
        s.materias_json,
        s.fecha_registro,
        s.estatus,
        p.codigo as codigo_periodo,
        p.nombre as nombre_periodo,
        p.fecha_inicio as fecha_inicio_periodo
      FROM solicitudes s
      INNER JOIN periodos_academicos p ON s.periodo_id = p.id
      WHERE s.user_id = ? 
        AND s.materias_json IS NOT NULL 
        AND s.materias_json != ''
        ${statusFilter}
      ORDER BY p.fecha_inicio DESC
    `, [idNum]);

    // 3. PROCESAMIENTO DE DATOS (Parsing Robusto)
    const historial = rows.map((row: any) => {
      let materias = [];
      let trimestreHistorico = null;

      try {
        // Validación extra: Si es un objeto ya parseado (algunos drivers lo hacen) o un string
        const parsed = typeof row.materias_json === 'string' 
          ? JSON.parse(row.materias_json) 
          : row.materias_json;
        
        if (Array.isArray(parsed)) {
          materias = parsed;
        } else if (parsed && typeof parsed === 'object') {
          // Soporte para estructura { materias: [], trimestre: X }
          materias = parsed.materias || [];
          trimestreHistorico = parsed.trimestre || null;
        }
      } catch (e) {
        console.error(`Error parseando JSON de solicitud ${row.solicitud_id}`, e);
        materias = [];
      }

      // Normalización de notas para asegurar que sean números
      const materiasFormateadas = materias.map((m: any) => ({
        ...m,
        nota: parseFloat(m.nota || 0)
      }));

      const promedioCalculado = materiasFormateadas.length > 0
        ? (materiasFormateadas.reduce((acc: number, m: any) => acc + m.nota, 0) / materiasFormateadas.length)
        : 0;

      return {
        id: row.solicitud_id,
        periodoCodigo: row.codigo_periodo,
        periodoNombre: row.nombre_periodo,
        trimestre: trimestreHistorico,
        fechaRegistro: new Date(row.fecha_registro).toLocaleDateString('es-VE', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        promedio: parseFloat(row.promedio_notas || promedioCalculado).toFixed(2),
        materias: materiasFormateadas,
        totalMaterias: materiasFormateadas.length,
        estado: row.estatus
      };
    });

    // 4. GENERACIÓN DE ESTADÍSTICAS GLOBALES
    const totalPeriodos = historial.length;
    // Solo contamos materias si tienen nota válida
    const totalMateriasContabilizadas = historial.reduce((acc: number, curr: any) => acc + curr.totalMaterias, 0);
    
    const sumaPromedios = historial.reduce((acc: number, curr: any) => acc + parseFloat(curr.promedio), 0);
    const promedioHistorico = totalPeriodos > 0 
      ? (sumaPromedios / totalPeriodos).toFixed(2) 
      : "0.00";

    return {
      success: true,
      data: historial,
      stats: {
        totalPeriodos,
        totalMaterias: totalMateriasContabilizadas,
        promedioHistorico
      }
    };

  } catch (error) {
    console.error("❌ Error crítico en getStudentHistory:", error);
    return {
      success: false,
      data: [],
      stats: { totalPeriodos: 0, totalMaterias: 0, promedioHistorico: "0.00" }
    };
  }
}