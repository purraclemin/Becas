'use server'

import { db } from './db'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { getModoPruebaStatus } from './ModoPrueba'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'

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
  if (lapso === 'III') return `Periodo II ${anio} (May-Ago)`; 
  
  return "Periodo Anterior";
}

/**
 * REESTRUCTURADO: Maneja el estado académico, dispara la habilitación de renovación
 * y calcula el Índice Global histórico real basado en TODAS las solicitudes del estudiante.
 */
export async function getStudentAcademicStatus(userId: string | number, trimestreManual?: string) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId) : userId;
    const periodoActualId = await obtenerOCrearPeriodoObjetivo();
    const { activo } = await getModoPruebaStatus();

    // 1. Datos maestros del estudiante
    const [studentRows]: any = await db.execute(
      'SELECT id, indice_global, carrera, semestre, ha_tenido_beca, beca_perdida FROM students WHERE id = ?',
      [idNum]
    );
    const studentData = studentRows[0] || {};

    // 2. Datos del periodo actual del sistema
    const [periodoRows]: any = await db.execute(
      'SELECT id, codigo, nombre, fecha_inicio, fecha_fin FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );
    const pAct = periodoRows[0];

    // 3. CÁLCULO DEL ÍNDICE GLOBAL HISTÓRICO REAL (TODAS LAS SOLICITUDES)
    // Se eliminó el filtro de estatus para promediar toda la trayectoria registrada
    const [allSolicitudes]: any = await db.execute(
      'SELECT promedio_notas FROM solicitudes WHERE user_id = ? AND promedio_notas IS NOT NULL',
      [idNum]
    );

    let indiceGlobalCalculado = "0.00";
    if (allSolicitudes.length > 0) {
      const sumaPromedios = allSolicitudes.reduce((acc: number, sol: any) => acc + parseFloat(sol.promedio_notas || 0), 0);
      indiceGlobalCalculado = (sumaPromedios / allSolicitudes.length).toFixed(2);
      
      // Actualizamos la tabla students para que el valor sea persistente y auditable
      await db.execute('UPDATE students SET indice_global = ? WHERE id = ?', [indiceGlobalCalculado, idNum]);
    }

    // 4. Lógica de Pensum y sugerencias
    const trimestreSugerido = Math.max(1, (studentData.semestre || 1) - 1);
    const trimestreABuscar = trimestreManual ? parseInt(trimestreManual) : trimestreSugerido;

    let materiasSugeridas = [];
    if (studentData.carrera && trimestreABuscar > 0) {
      const [pensumRows]: any = await db.execute(`
        SELECT pm.codigo_materia, pm.nombre_materia, pm.unidades_credito
        FROM pensum_materias pm
        JOIN carreras c ON pm.carrera_id = c.id
        WHERE c.nombre = ? AND pm.trimestre_ubicacion = ?
      `, [studentData.carrera, trimestreABuscar]);
      materiasSugeridas = pensumRows;
    }

    // 5. Obtener solicitud más reciente (para estatus actual y notas del periodo anterior)
    const [userRows]: any = await db.execute(`
      SELECT sol.*, p.codigo as codigo_periodo_solicitud, p.nombre as nombre_periodo_solicitud
      FROM solicitudes sol
      LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
      WHERE sol.user_id = ?
      ORDER BY sol.fecha_registro DESC LIMIT 1
    `, [idNum]);

    let s = userRows[0] || {};

    // 6. TRIGGER AUTOMÁTICO DE RENOVACIÓN
    if (pAct && s.id && s.estatus === 'Aprobada' && Number(s.periodo_id) !== Number(periodoActualId)) {
        
        const hoy = new Date();
        const fechaInicioPeriodo = new Date(pAct.fecha_inicio);
        const diffDaysAlInicio = Math.ceil((fechaInicioPeriodo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

        const ventanaAbierta = activo || (diffDaysAlInicio <= 7 && diffDaysAlInicio >= -15);

        if (ventanaAbierta) {
            const [checkRows]: any = await db.execute(
                'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
                [idNum, periodoActualId]
            );

            if (checkRows.length === 0) {
                // CAPTURA DE ESTATUS PREVIO para el historial
                const estatusPrevio = s.estatus;

                const [insertResult]: any = await db.execute(`
                    INSERT INTO solicitudes (
                        user_id, periodo_id, email_institucional, tipo_beca, 
                        promedio_notas, motivo_solicitud, materias_json, 
                        estatus, foto_carnet, copia_cedula, fecha_registro, revisado_por
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Renovacion', ?, ?, NOW(), 0)
                `, [
                    idNum, periodoActualId, s.email_institucional, s.tipo_beca, 
                    s.promedio_notas, s.motivo_solicitud, '[]', 
                    s.foto_carnet, s.copia_cedula
                ]);

                const nuevaSolicitudId = insertResult.insertId;

                await registrarDecisionEnHistorial(
                  nuevaSolicitudId,
                  'Renovacion',
                  0, 
                  "Sistema: Habilitación por ventana de tiempo.",
                  '127.0.0.1',
                  estatusPrevio
                );

                const [newRows]: any = await db.execute(`
                    SELECT sol.*, p.codigo as codigo_periodo_solicitud, p.nombre as nombre_periodo_solicitud
                    FROM solicitudes sol
                    LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
                    WHERE sol.id = ? AND sol.user_id = ? LIMIT 1
                `, [nuevaSolicitudId, idNum]);
                
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

    // 7. Estatus UI
    let estatusFinalUI = s.estatus || 'ninguna';
    if (studentData.beca_perdida === 1) {
      estatusFinalUI = 'Rechazada';
    } else if (Number(s.periodo_id) === Number(periodoActualId)) {
      estatusFinalUI = s.estatus; 
    }

    // 8. Validación de ventana de tiempo para Banner
    let esPeriodoRenovacion = false;
    if (pAct) {
      const hoy = new Date();
      const fechaInicio = new Date(pAct.fecha_inicio);
      const diffDaysAlInicio = Math.ceil((fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (activo || (diffDaysAlInicio <= 7 && diffDaysAlInicio >= -15)) esPeriodoRenovacion = true;
    }

    return {
      indiceGlobal: indiceGlobalCalculado !== "0.00" ? indiceGlobalCalculado : (studentData.indice_global || s.promedio_notas || "0.00"),
      carrera: studentData.carrera || 'No Definida',
      semestre: studentData.semestre || 0,
      estatus: estatusFinalUI,
      esPeriodoRenovacion,
      periodoActual: pAct?.codigo || "S/N",
      periodoActualNombre: pAct?.nombre || "",
      periodoActualId: periodoActualId,
      periodoNotas: s.codigo_periodo_solicitud ? obtenerNombrePeriodoAnterior(s.codigo_periodo_solicitud) : "",
      materias: materiasArray,
      materiasSugeridas: materiasSugeridas,
      trimestreSugerido: trimestreSugerido,
      lastSolicitud: s 
    };

  } catch (error) {
    console.error("❌ Error en getStudentAcademicStatus:", error);
    return { estatus: 'ninguna', materias: [], materiasSugeridas: [], lastSolicitud: null };
  }
}