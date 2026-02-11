'use server'

import { db } from './db'

/**
 * Función auxiliar para calcular el nombre del periodo ANTERIOR
 * dado un código de periodo actual (Ej: 2026-I -> Periodo III 2025)
 */
function obtenerNombrePeriodoAnterior(codigo: string): string {
  if (!codigo || !codigo.includes('-')) return "Periodo Anterior";

  const partes = codigo.split('-'); // Separa "2026" y "I"
  const anio = parseInt(partes[0]);
  const lapso = partes[1];

  // Lógica de retroceso UNIMAR
  if (lapso === 'I') {
    return `Periodo III ${anio - 1} (Sep-Dic)`; 
  } else if (lapso === 'II') {
    return `Periodo I ${anio} (Ene-Abr)`; 
  } else if (lapso === 'III') {
    return `Periodo II ${anio} (May-Ago)`; 
  }
  
  return "Periodo Anterior";
}

/**
 * 🟢 LÓGICA DE NEGOCIO PARA ESTUDIANTES
 * Proporciona el estatus actual y los datos necesarios para la renovación simplificada.
 */
export async function getStudentAcademicStatus(userId: string | number) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId) : userId;

    // 1. Obtener datos base del estudiante
    const [studentRows]: any = await db.execute(`
      SELECT id, indice_global, carrera, semestre
      FROM students
      WHERE id = ?
    `, [idNum]);

    const studentData = studentRows[0] || {};

    // 2. Obtener la última solicitud (incluyendo todos los campos para poder clonarlos)
    const [userRows]: any = await db.execute(`
      SELECT 
        sol.*,
        p.codigo as codigo_periodo_solicitud,
        p.nombre as nombre_periodo_solicitud
      FROM solicitudes sol
      LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
      WHERE sol.user_id = ?
      ORDER BY sol.fecha_registro DESC
      LIMIT 1
    `, [idNum]);

    const s = userRows[0] || {};

    let materiasArray = [];
    try {
      materiasArray = s.materias_json ? JSON.parse(s.materias_json) : [];
    } catch (e) {
      materiasArray = [];
    }

    // Cálculo dinámico de índice
    let indiceFinal = studentData.indice_global || 0;
    if (Number(indiceFinal) === 0) {
      if (s.promedio_notas && Number(s.promedio_notas) > 0) {
        indiceFinal = s.promedio_notas;
      } else if (materiasArray.length > 0) {
        const suma = materiasArray.reduce((acc: number, m: any) => acc + parseFloat(m.nota || 0), 0);
        indiceFinal = (suma / materiasArray.length).toFixed(2);
      }
    }

    // 3. OBTENER PERIODO ACTUAL (Periodo donde se daría la beca)
    const [periodoRows]: any = await db.execute(`
      SELECT id, codigo, nombre, fecha_fin, fecha_limite_solicitud 
      FROM periodos_academicos 
      WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin
      OR es_actual = 1
      ORDER BY es_actual DESC, fecha_inicio DESC
      LIMIT 1
    `);

    let esPeriodoRenovacion = false;
    let periodoActualId = null;
    let periodoActualCodigo = "Sin Periodo Activo";
    let periodoActualNombre = "";

    if (periodoRows.length > 0) {
      const p = periodoRows[0];
      periodoActualId = p.id;
      periodoActualCodigo = p.codigo || "S/N";
      periodoActualNombre = p.nombre || "";

      // Lógica de Ventana de Renovación (Ventana de 15 días antes del cierre)
      const hoy = new Date();
      const fechaLimite = p.fecha_limite_solicitud ? new Date(p.fecha_limite_solicitud) : new Date(p.fecha_fin);
      const diffTime = fechaLimite.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Permitimos renovar si estamos en la ventana o si el periodo ya inició pero el estudiante no tiene solicitud para este periodo aún
      if (diffDays <= 15 && diffDays >= -7) {
        esPeriodoRenovacion = true;
      }
    }

    const estatusReciente = s.estatus || 'ninguna';
    let estatusFinalUI = estatusReciente;

    // 🟢 CONDICIÓN DE RENOVACIÓN:
    // Si la última solicitud fue aprobada, pero pertenece a un periodo DIFERENTE al actual.
    if (estatusReciente === 'Aprobada' && s.periodo_id !== periodoActualId) {
       estatusFinalUI = 'Renovacion';
    }

    // Cálculo del nombre del periodo de las notas
    let nombrePeriodoNotas = "";
    if (s.codigo_periodo_solicitud) {
        nombrePeriodoNotas = obtenerNombrePeriodoAnterior(s.codigo_periodo_solicitud);
    }

    return {
      indiceGlobal: indiceFinal,
      carrera: studentData.carrera || 'No Definida',
      semestre: studentData.semestre || 0,
      estatus: estatusFinalUI,
      esPeriodoRenovacion,
      periodoActual: periodoActualCodigo,
      periodoActualNombre: periodoActualNombre,
      periodoActualId: periodoActualId,
      periodoNotas: nombrePeriodoNotas,
      materias: materiasArray,
      // 🟢 IMPORTANTE: Retornamos la última solicitud completa para poder "clonarla" desde el perfil
      lastSolicitud: s 
    };

  } catch (error) {
    console.error("❌ Error en getStudentAcademicStatus:", error);
    return {
      indiceGlobal: "0.00",
      carrera: '',
      semestre: 0,
      estatus: 'ninguna',
      esPeriodoRenovacion: false,
      periodoActual: "Error",
      periodoNotas: "",
      materias: [],
      lastSolicitud: null
    };
  }
}