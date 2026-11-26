'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { randomUUID } from 'crypto'

interface SnapshotSolicitudRow extends RowDataPacket {
  estudiante_id: number;
  periodo_id: number;
  promedio_notas: number | string | null;
  estatus_anterior_db: string;
  tipo_beca: string | null;
  materias_json: string | null;
  semestre: number | null;
  indice_global: number | string | null;
  puntaje: number | null;
  nivel_riesgo: string | null;
}

interface SolicitudExistenteRow extends RowDataPacket {
  id: number;
}

/**
 * Registra cada cambio de estatus en el historial, capturando una "fotografía" académica.
 * Permite gestionar y dictaminar solicitudes provenientes de periodos anteriores:
 * - Toma siempre el último baremo administrativo del estudiante.
 * - Si la solicitud venía en cola de un periodo previo y no existe otra solicitud del mismo
 *   estudiante en el periodo vigente, la sincroniza al periodo vigente para que consuma
 *   correctamente el cupo actual.
 */
export async function registrarDecisionEnHistorial(
  solicitudId: number,
  nuevoEstatus: string,
  adminId: string | number,
  observaciones: string | null,
  ip: string = '127.0.0.1',
  estatusPrevioForzado?: string,
  departamentoAsignado?: string,
  periodoActualId?: number
): Promise<{ success: boolean; token: string }> {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. OBTENER SNAPSHOT ACADÉMICO COMPLETO (con el estudio administrativo más reciente del estudiante)
    const [dataRows] = await connection.execute<SnapshotSolicitudRow[]>(
      `
      SELECT 
        s.user_id AS estudiante_id, 
        s.periodo_id, 
        s.promedio_notas, 
        s.estatus AS estatus_anterior_db, 
        s.tipo_beca,
        s.materias_json,
        st.semestre,
        IFNULL(st.indice_global, 0.00) AS indice_global,
        IFNULL(e.puntaje, 0) AS puntaje, 
        IFNULL(e.nivel_riesgo, 'Bajo') AS nivel_riesgo
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e 
        ON e.id = (
          SELECT MAX(e_max.id)
          FROM estudios_socioeconomicos e_max
          WHERE e_max.student_id = st.id
            AND e_max.tipo = 'administrador'
        )
      WHERE s.id = ?
      LIMIT 1
      `,
      [Number(solicitudId)]
    );

    if (dataRows.length === 0) throw new Error("Solicitud no encontrada.");
    const snapshot = dataRows[0];

    const estatusPrevioReal = estatusPrevioForzado || snapshot.estatus_anterior_db;
    const responsableReal = nuevoEstatus === 'Renovacion' ? 0 : adminId;
    const token = randomUUID();
    const observacionesLimpias =
      observaciones && observaciones.trim() !== '' ? observaciones.trim() : null;

    const materiasSnapshot =
      typeof snapshot.materias_json === 'string'
        ? snapshot.materias_json
        : JSON.stringify(snapshot.materias_json || []);

    // 2. DETERMINAR PERIODO EFECTIVO (promover solicitud en cola al periodo vigente si no colisiona)
    let periodoEfectivo = Number(snapshot.periodo_id);
    let promoverAPeriodoActual = false;

    if (
      periodoActualId &&
      Number(periodoActualId) > 0 &&
      Number(snapshot.periodo_id) !== Number(periodoActualId) &&
      estatusPrevioReal !== 'Aprobada'
    ) {
      const [otraEnPeriodoActual] = await connection.execute<SolicitudExistenteRow[]>(
        `
        SELECT id
        FROM solicitudes
        WHERE user_id = ?
          AND periodo_id = ?
          AND id != ?
        LIMIT 1
        `,
        [snapshot.estudiante_id, Number(periodoActualId), Number(solicitudId)]
      );

      if (otraEnPeriodoActual.length === 0) {
        periodoEfectivo = Number(periodoActualId);
        promoverAPeriodoActual = true;
      }
    }

    // 3. INSERTAR EN HISTORIAL
    await connection.execute<ResultSetHeader>(
      `
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
      `,
      [
        Number(solicitudId),
        snapshot.estudiante_id,
        periodoEfectivo,
        responsableReal,
        snapshot.promedio_notas,
        snapshot.semestre,
        snapshot.puntaje ?? 0,
        snapshot.nivel_riesgo || 'Bajo',
        snapshot.tipo_beca,
        estatusPrevioReal,
        nuevoEstatus,
        observacionesLimpias,
        materiasSnapshot,
        snapshot.indice_global ?? 0.0,
        token,
        ip,
      ]
    );

    // 4. LÓGICA DE NEGOCIO PARA EL DEPARTAMENTO ASIGNADO:
    const debeGuardarDept = ['Aprobada', 'Convocado a Entrevista'].includes(nuevoEstatus);
    const deptFinal = debeGuardarDept ? (departamentoAsignado || null) : null;

    // 5. ACTUALIZAR ESTATUS, OBSERVACIONES, DEPARTAMENTO Y PERIODO EFECTIVO EN TABLA SOLICITUDES
    let updateSolicitud =
      'UPDATE solicitudes SET estatus = ?, revisado_por = ?, observaciones_admin = ?, departamento_asignado = ?';
    const paramsSolicitud: Array<string | number | null> = [
      nuevoEstatus,
      responsableReal,
      observacionesLimpias,
      deptFinal,
    ];

    if (promoverAPeriodoActual) {
      updateSolicitud += ', periodo_id = ?';
      paramsSolicitud.push(periodoEfectivo);
    }

    if (nuevoEstatus === 'Aprobada' || nuevoEstatus === 'Rechazada') {
      updateSolicitud += ', fecha_decision = NOW()';
    } else if (nuevoEstatus === 'En Revisión') {
      updateSolicitud += ', fecha_revision = NOW()';
    }

    updateSolicitud += ' WHERE id = ?';
    paramsSolicitud.push(Number(solicitudId));

    await connection.execute<ResultSetHeader>(updateSolicitud, paramsSolicitud);

    // 6. ACTUALIZAR PROGRESIÓN ACADÉMICA Y BLOQUEO PERMANENTE POR RECHAZO
    if (nuevoEstatus === 'Aprobada') {
      await connection.execute<ResultSetHeader>(
        'UPDATE students SET ha_tenido_beca = 1 WHERE id = ?',
        [snapshot.estudiante_id]
      );
    } else if (nuevoEstatus === 'Rechazada') {
      await connection.execute<ResultSetHeader>(
        'UPDATE students SET beca_perdida = 1 WHERE id = ?',
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