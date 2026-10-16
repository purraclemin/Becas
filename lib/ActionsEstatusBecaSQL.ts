'use server'

import { db } from './db'
import { randomUUID } from 'crypto'

/**
 * Registra cada cambio de estatus en el historial, capturando una "fotografía" académica.
 * Sincronizado para persistir de forma transaccional el departamento asignado.
 */
export async function registrarDecisionEnHistorial(
  solicitudId: number, 
  nuevoEstatus: string, 
  adminId: string | number, 
  observaciones: string | null,
  ip: string = '127.0.0.1',
  estatusPrevioForzado?: string,
  departamentoAsignado?: string // 🟢 1. Añadimos el parámetro opcional del departamento
) {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. OBTENER SNAPSHOT ACADÉMICO COMPLETO
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

    const estatusPrevioReal = estatusPrevioForzado || snapshot.estatus_anterior_db;
    let responsableReal = (nuevoEstatus === 'Renovacion') ? 0 : adminId;
    const token = randomUUID();

    const materiasSnapshot = typeof snapshot.materias_json === 'string' 
      ? snapshot.materias_json 
      : JSON.stringify(snapshot.materias_json || []);

    const esExcepcion = observaciones?.includes('[APROBACIÓN EXCEPCIONAL]');

    // 2. INSERTAR EN HISTORIAL
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
      solicitudId,
      snapshot.estudiante_id,
      snapshot.periodo_id,
      responsableReal,
      snapshot.promedio_notas,
      snapshot.semestre,
      snapshot.puntaje || 0,
      snapshot.nivel_riesgo || 'Bajo',
      snapshot.tipo_beca,
      estatusPrevioReal,
      nuevoEstatus,
      observaciones,
      materiasSnapshot,
      snapshot.indice_global || 0.00,
      token,
      ip
    ]);

    // 🟢 3. LÓGICA DE NEGOCIO PARA EL DEPARTAMENTO ASIGNADO:
    // Si el estatus es Aprobada o Convocado a Entrevista, guardamos el departamento. Si no, se limpia a NULL.
    const debeGuardarDept = ['Aprobada', 'Convocado a Entrevista'].includes(nuevoEstatus);
    const deptFinal = debeGuardarDept ? (departamentoAsignado || null) : null;

    // 4. ACTUALIZAR ESTATUS Y DEPARTAMENTO EN TABLA SOLICITUDES
    let updateSolicitud = 'UPDATE solicitudes SET estatus = ?, revisado_por = ?, observaciones_admin = ?, departamento_asignado = ?';
    const paramsSolicitud: any[] = [nuevoEstatus, responsableReal, observaciones, deptFinal];

    if (nuevoEstatus === 'Aprobada' || nuevoEstatus === 'Rechazada') {
        updateSolicitud += ', fecha_decision = NOW()';
    } else if (nuevoEstatus === 'En Revisión') {
        updateSolicitud += ', fecha_revision = NOW()';
    }

    updateSolicitud += ' WHERE id = ?';
    paramsSolicitud.push(solicitudId);

    await connection.execute(updateSolicitud, paramsSolicitud);

    // 5. ACTUALIZAR PROGRESIÓN ACADÉMICA (Hito de Beca)
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