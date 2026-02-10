'use server'

import { db } from './db'

/**
 * 🟢 LÓGICA DE NEGOCIO PARA ESTUDIANTES
 * Centraliza la inteligencia de periodos, promedios y estatus de renovación de la UNIMAR.
 */

export async function getStudentAcademicStatus(userId: string | number) {
  try {
    // 1. Obtener Índice Global y datos académicos directamente de la tabla students
    // Esto asegura que leamos el valor calculado y guardado por ActionsSolicitud
    const [studentRows]: any = await db.execute(`
      SELECT indice_global, carrera, semestre
      FROM students
      WHERE id = ?
    `, [userId]);

    const studentData = studentRows[0] || {};

    // 2. Obtener datos de la última solicitud enviada
    const [userRows]: any = await db.execute(`
      SELECT 
        sol.estatus as estatus_reciente,
        sol.periodo_id as last_periodo_id,
        sol.materias_json as materias_recientes
      FROM solicitudes sol
      WHERE sol.user_id = ?
      ORDER BY sol.fecha_registro DESC
      LIMIT 1
    `, [userId]);

    // 3. Consultar el periodo académico marcado como actual
    const [periodoRows]: any = await db.execute(
      'SELECT id, codigo, fecha_fin FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );

    let esPeriodoRenovacion = false;
    let periodoActualId = null;
    let periodoActualCodigo = "N/A";

    if (periodoRows.length > 0) {
      const p = periodoRows[0];
      periodoActualId = p.id;
      periodoActualCodigo = p.codigo;

      if (p.fecha_fin) {
        const hoy = new Date();
        const fechaFin = new Date(p.fecha_fin);
        
        // Calculamos la diferencia en días
        const diffTime = fechaFin.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // REGLA UNIMAR: Ventana de 7 días antes o después del cierre
        if (diffDays <= 7 && diffDays >= -7) {
          esPeriodoRenovacion = true;
        }
      }
    }

    const s = userRows[0] || {};
    let estatusFinalUI = s.estatus_reciente || 'ninguna';

    /**
     * 🟢 INTELIGENCIA DE RENOVACIÓN:
     * Si tiene beca aprobada de un periodo anterior y estamos en ventana, 
     * forzamos el estatus visual a 'Renovacion'.
     */
    if (esPeriodoRenovacion && s.estatus_reciente === 'Aprobada' && s.last_periodo_id !== periodoActualId) {
       estatusFinalUI = 'Renovacion';
    }

    // Procesar JSON de materias para el banner y el historial
    let materiasArray = [];
    try {
      materiasArray = s.materias_recientes ? JSON.parse(s.materias_recientes) : [];
    } catch (e) {
      materiasArray = [];
    }

    return {
      // Datos de Identidad Académica (desde tabla students)
      indiceGlobal: studentData.indice_global || 0,
      carrera: studentData.carrera || '',
      semestre: studentData.semestre || 0,

      // Datos de Gestión (desde tabla solicitudes y periodos)
      estatus: estatusFinalUI,
      esPeriodoRenovacion,
      periodoActual: periodoActualCodigo,
      periodoActualId: periodoActualId,
      materias: materiasArray
    };

  } catch (error) {
    console.error("❌ Error en getStudentAcademicStatus:", error);
    return {
      indiceGlobal: 0,
      carrera: '',
      semestre: 0,
      estatus: 'ninguna',
      esPeriodoRenovacion: false,
      periodoActual: "N/A",
      materias: []
    };
  }
}