'use server'

import { db } from './db'
import { randomUUID } from 'crypto'

/**
 * Registra cada cambio de estatus en el historial, capturando una "fotografía" académica.
 * Sincronizado para usar el trimestre real de la tabla students y registrar excepciones.
 */
export async function registrarDecisionEnHistorial(
  solicitudId: number, 
  nuevoEstatus: string, 
  adminId: string | number, 
  observaciones: string | null,
  ip: string = '127.0.0.1',
  estatusPrevioForzado?: string 
) {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. OBTENER SNAPSHOT ACADÉMICO COMPLETO (La Verdad de las Tablas)
    const [dataRows]: any = await connection.execute(`
      SELECT 
        s.user_id AS estudiante_id, 
        s.periodo_id, 
        s.promedio_notas, 
        s.estatus AS estatus_anterior_db, 
        s.tipo_beca,
        s.materias_json,
        st.semestre,
        st.indice_global,
        e.puntaje, 
        e.nivel_riesgo
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador'
      WHERE s.id = ?
    `, [solicitudId]);

    if (dataRows.length === 0) throw new Error("Solicitud no encontrada.");
    const snapshot = dataRows[0];

    // Lógica para determinar el estatus previo real
    const estatusPrevioReal = estatusPrevioForzado || snapshot.estatus_anterior_db;

    // Determinar responsable (0 si es el sistema en una renovación automática)
    let responsableReal = (nuevoEstatus === 'Renovacion') ? 0 : adminId;

    // 2. GENERAR TOKEN DE VERIFICACIÓN ÚNICO
    const token = randomUUID();

    // 3. PREPARAR SNAPSHOT DE MATERIAS
    const materiasSnapshot = typeof snapshot.materias_json === 'string' 
      ? snapshot.materias_json 
      : JSON.stringify(snapshot.materias_json || []);

    // 🟢 DETECCIÓN DE EXCEPCIÓN: Si las observaciones traen la marca del orquestador, 
    // aseguramos que el historial refleje la naturaleza de la acción.
    const esExcepcion = observaciones?.includes('[APROBACIÓN EXCEPCIONAL]');

    // 4. INSERTAR EN HISTORIAL (Guardamos la "fotografía" del momento)
    await connection.execute(`
      INSERT INTO historial_aprobaciones (
        solicitud_id, 
        user_id, 
        periodo_id, 
        admin_id, 
        promedio_ciclo, 
        trimestre, 
        puntaje_baremo_, 
        nivel_riesgo, 
        tipo_beca_snapshot, 
        estatus_previo, 
        estatus_nuevo, 
        observacion_admin, 
        materias_snapshot_json,
        indice_global_snapshot,
        fecha_aprobacion, 
        token_verificacion, 
        ip_accion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `, [
      solicitudId,                       // solicitud_id
      snapshot.estudiante_id,            // user_id
      snapshot.periodo_id,               // periodo_id
      responsableReal,                   // admin_id
      snapshot.promedio_notas,           // promedio_ciclo
      snapshot.semestre,                 // trimestre (semestre real de la tabla students)
      snapshot.puntaje || 0,             // puntaje_baremo_
      snapshot.nivel_riesgo || 'Bajo',   // nivel_riesgo
      snapshot.tipo_beca,                // tipo_beca_snapshot
      estatusPrevioReal,                 // estatus_previo
      nuevoEstatus,                      // estatus_nuevo
      observaciones,                     // observacion_admin (Incluye la marca de excepción si existe)
      materiasSnapshot,                  // materias_snapshot_json
      snapshot.indice_global || 0.00,    // indice_global_snapshot
      token,                             // token_verificacion
      ip                                 // ip_accion
    ]);

    // 5. ACTUALIZAR ESTATUS EN TABLA SOLICITUDES
    let updateSolicitud = 'UPDATE solicitudes SET estatus = ?, revisado_por = ?, observaciones_admin = ?';
    const paramsSolicitud: any[] = [nuevoEstatus, responsableReal, observaciones];

    if (nuevoEstatus === 'Aprobada' || nuevoEstatus === 'Rechazada') {
        updateSolicitud += ', fecha_decision = NOW()';
    } else if (nuevoEstatus === 'En Revisión') {
        updateSolicitud += ', fecha_revision = NOW()';
    }

    updateSolicitud += ' WHERE id = ?';
    paramsSolicitud.push(solicitudId);

    await connection.execute(updateSolicitud, paramsSolicitud);

    // 6. ACTUALIZAR PROGRESIÓN ACADÉMICA (Hito de Beca)
    if (nuevoEstatus === 'Aprobada') {
        await connection.execute(
            'UPDATE students SET ha_tenido_beca = 1 WHERE id = ?',
            [snapshot.estudiante_id]
        );
    }

    await connection.commit();
    return { success: true, token };

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en registrarDecisionEnHistorial:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}