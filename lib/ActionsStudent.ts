'use server'

import { db } from './db'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'

/**
 * Función auxiliar para calcular el nombre del periodo ANTERIOR
 */
function obtenerNombrePeriodoAnterior(codigo: string): string {
  if (!codigo || !codigo.includes('-')) return "Periodo Anterior";
  const partes = codigo.split('-'); 
  const anio = parseInt(partes[0]);
  const lapso = partes[1];

  if (lapso === 'I') return `Periodo III ${anio - 1} (Sep-Dic)`; 
  if (lapso === 'II') return `Periodo I ${anio} (Ene-Abr)`; 
  if (lapso === 'III') return `Periodo II ${anio} (May-Ago`; // Corregido Ago
  
  return "Periodo Anterior";
}

export async function getStudentAcademicStatus(userId: string | number) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const periodoActualId = await obtenerOCrearPeriodoObjetivo();

    // 1. Datos maestros
    const [studentRows]: any = await db.execute(
      'SELECT id, indice_global, carrera, semestre, ha_tenido_beca, beca_perdida FROM students WHERE id = ?',
      [idNum]
    );
    const studentData = studentRows[0] || {};

    // 2. Datos del periodo actual
    const [periodoRows]: any = await db.execute(
      'SELECT id, codigo, nombre, fecha_inicio, fecha_fin FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );
    const pAct = periodoRows[0];

    // 3. Obtener solicitud más reciente
    const [userRows]: any = await db.execute(`
      SELECT sol.*, p.codigo as codigo_periodo_solicitud, p.nombre as nombre_periodo_solicitud
      FROM solicitudes sol
      LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
      WHERE sol.user_id = ?
      ORDER BY sol.fecha_registro DESC LIMIT 1
    `, [idNum]);

    let s = userRows[0] || {};

    // 🟢 4. TRIGGER AUTOMÁTICO DE RENOVACIÓN (VENTANA 15 DÍAS ANTES / 15 DESPUÉS)
    if (pAct && s.id && s.estatus?.toLowerCase().includes('aprob') && Number(s.periodo_id) !== Number(periodoActualId)) {
        
        const hoy = new Date();
        const fechaInicioPeriodo = new Date(pAct.fecha_inicio);
        
        // Calculamos la distancia al inicio del periodo
        // Resultado positivo: faltan días para empezar. Negativo: ya empezó.
        const diffDaysAlInicio = Math.ceil((fechaInicioPeriodo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        /**
         * LÓGICA DE VENTANA:
         * Se activa si faltan 15 días o menos para empezar (diffDaysAlInicio <= 15)
         * Y se mantiene activa hasta 15 días después de haber empezado (diffDaysAlInicio >= -15)
         */
        if (diffDaysAlInicio <= 15 && diffDaysAlInicio >= -15) {
            const [checkRows]: any = await db.execute(
                'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
                [idNum, periodoActualId]
            );

            if (checkRows.length === 0) {
                await db.execute(`
                    INSERT INTO solicitudes (
                        user_id, periodo_id, email_institucional, tipo_beca, 
                        promedio_notas, motivo_solicitud, materias_json, 
                        ingreso_familiar_total, estatus, foto_carnet, 
                        copia_cedula, fecha_registro
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Renovacion', ?, ?, NOW())
                `, [
                    idNum, periodoActualId, s.email_institucional, s.tipo_beca, 
                    s.promedio_notas, s.motivo_solicitud, '[]', 
                    s.ingreso_familiar_total, s.foto_carnet, s.copia_cedula
                ]);

                const [newRows]: any = await db.execute(`
                    SELECT sol.*, p.codigo as codigo_periodo_solicitud, p.nombre as nombre_periodo_solicitud
                    FROM solicitudes sol
                    LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
                    WHERE sol.user_id = ? AND sol.periodo_id = ? LIMIT 1
                `, [idNum, periodoActualId]);
                
                if (newRows.length > 0) s = newRows[0];
            }
        }
    }

    let materiasArray = [];
    try {
      materiasArray = s.materias_json ? JSON.parse(s.materias_json) : [];
    } catch (e) {
      materiasArray = [];
    }

    // 5. DETERMINACIÓN DEL ESTATUS UI
    let estatusFinalUI = s.estatus || 'ninguna';
    if (studentData.beca_perdida === 1) {
      estatusFinalUI = 'Rechazada';
    } else if (Number(s.periodo_id) === Number(periodoActualId)) {
      estatusFinalUI = s.estatus; 
    }

    // 6. CONTROL DEL BANNER (Sincronizado con la ventana de 30 días)
    let esPeriodoRenovacion = false;
    if (pAct) {
      const hoy = new Date();
      const fechaInicio = new Date(pAct.fecha_inicio);
      const diffDaysAlInicio = Math.ceil((fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDaysAlInicio <= 15 && diffDaysAlInicio >= -15) {
        esPeriodoRenovacion = true;
      }
    }

    return {
      indiceGlobal: studentData.indice_global || s.promedio_notas || "0.00",
      carrera: studentData.carrera || 'No Definida',
      semestre: studentData.semestre || 0,
      estatus: estatusFinalUI,
      esPeriodoRenovacion,
      periodoActual: pAct?.codigo || "S/N",
      periodoActualNombre: pAct?.nombre || "",
      periodoActualId: periodoActualId,
      periodoNotas: s.codigo_periodo_solicitud ? obtenerNombrePeriodoAnterior(s.codigo_periodo_solicitud) : "",
      materias: materiasArray,
      lastSolicitud: s 
    };

  } catch (error) {
    console.error("❌ Error en getStudentAcademicStatus:", error);
    return { estatus: 'ninguna', materias: [], lastSolicitud: null };
  }
}