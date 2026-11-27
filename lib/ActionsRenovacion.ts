'use server'

import { randomUUID } from 'crypto'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { revalidatePath } from 'next/cache'
import { db, queryFresh } from './db'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import {
  sincronizarTodosLosRecordsFaltantes,
  sincronizarYObtenerRecordAcademico,
} from './ActionsRecordAcademico'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { ejecutarRotacionExcelenciaEnPeriodo } from './ActionsGestionEspecial'
import {
  enviarCorreoCambioEstatusPorSolicitudId,
  type ParamsCorreoCambioEstatusSolicitud,
} from './EmailNotificacionesBeca'
import {
  PROMEDIO_MINIMO_BECA,
  PROMEDIO_MINIMO_EXCELENCIA,
  SISTEMA_ADMIN_ID,
  TRIMESTRE_MINIMO_EXCELENCIA,
  construirSnapshotDeTrimestre,
  esBecaExcelenciaAcademica,
  evaluarElegibilidadTrimestre,
  normalizarTipoBecaOficial,
  obtenerPromedioMinimoPorTipoBeca,
} from './RecordAcademicoUtils'

const ESTATUS_LISTA_ESPERA = new Set([
  'Pendiente',
  'Convocado a Entrevista',
  'En Revisión',
  'Revisión Especial',
]);

const CLAVE_ULTIMO_PERIODO_ACTIVO = 'ultimo_periodo_activo';
const SEMESTRE_EGRESADO = 13;
const OBSERVACION_EGRESADO = 'Acabó su periodo académico';

interface PeriodoFechaRow extends RowDataPacket {
  id: number;
  codigo: string;
  fecha_inicio: Date | string;
}

interface ConfigPeriodoRow extends RowDataPacket {
  valor_int: number | null;
  valor_txt: string | null;
}

interface TransicionEstudianteRow extends RowDataPacket {
  semestre_anterior: number;
  semestre_nuevo: number;
}

interface EstudianteAvanceRow extends RowDataPacket {
  id: number;
  semestre: number;
  tipo_beca_reciente: string | null;
}

interface StudentTransicionRow extends RowDataPacket {
  id: number;
  carrera: string;
  semestre: number;
  beca_perdida: number;
  ha_tenido_beca: number;
  email: string | null;
  beca_base_respaldo: string | null;
  departamento_base_respaldo: string | null;
}

interface SolicitudPreviaCompletaRow extends RowDataPacket {
  id: number;
  user_id: number;
  periodo_id: number;
  email_institucional: string | null;
  tipo_beca: string | null;
  promedio_notas: number | string | null;
  motivo_solicitud: string | null;
  estatus: string | null;
  departamento_asignado: string | null;
  foto_carnet: string | null;
  copia_cedula: string | null;
  planilla_inscripcion: string | null;
  constancia_residencia: string | null;
  declaracion_manutencion: string | null;
  informe_medico: string | null;
  partida_nacimiento: string | null;
  constancia_club: string | null;
  constancia_notas: string | null;
  notas_certificadas: string | null;
  carnet_discapacidad: string | null;
  documentos_filiacion: string | null;
}

interface SolicitudIdRow extends RowDataPacket {
  id: number;
}

interface EstudioBaremoRow extends RowDataPacket {
  puntaje: number | null;
  nivel_riesgo: string | null;
}

interface SolicitudRenovacionRow extends RowDataPacket {
  id: number;
  tipo_beca: string | null;
  departamento_asignado: string | null;
}

interface UserIdRow extends RowDataPacket {
  user_id: number;
}

interface RivalSuperiorRow extends RowDataPacket {
  hay_superior: number;
}

export interface ResultadoTransicionPeriodo {
  processed: boolean;
  estatus?: string;
  becaPerdida?: boolean;
  nuevoSemestre?: number;
  trimestreAuditado?: number;
  reason?: string;
  notificacionCorreo?: ParamsCorreoCambioEstatusSolicitud;
}

function normalizarFechaSql(fecha: Date | string | null | undefined): string {
  if (!fecha) return '';
  if (fecha instanceof Date) {
    return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString().split('T')[0];
  }
  const s = String(fecha).trim();
  return s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
}

/**
 * Crea de forma idempotente la tabla de control atómico de avance trimestral por periodo
 * para garantizar que cada estudiante avance exactamente +1 trimestre por periodo nuevo.
 */
async function asegurarTablaTransicionesPeriodo(): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
    CREATE TABLE IF NOT EXISTS transiciones_periodo_estudiantes (
      periodo_id INT(11) NOT NULL,
      student_id INT(11) NOT NULL,
      semestre_anterior INT(11) NOT NULL,
      semestre_nuevo INT(11) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (periodo_id, student_id),
      KEY idx_transicion_student (student_id),
      CONSTRAINT fk_transicion_periodo
        FOREIGN KEY (periodo_id) REFERENCES periodos_academicos(id) ON DELETE CASCADE,
      CONSTRAINT fk_transicion_student
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `
  );
}

/**
 * Avanza atómicamente el trimestre de un estudiante en el periodo dado si todavía no fue
 * avanzado en ese periodo. Permite pasar de 12° trimestre a 13 (Egresado) y detiene ahí.
 */
async function asegurarAvanceSemestreEnPeriodo(
  studentId: number,
  semestreActual: number,
  periodoActualId: number
): Promise<number> {
  await asegurarTablaTransicionesPeriodo();

  const existentes = await queryFresh<TransicionEstudianteRow[]>(
    `
    SELECT semestre_anterior, semestre_nuevo
    FROM transiciones_periodo_estudiantes
    WHERE periodo_id = ? AND student_id = ?
    LIMIT 1
    `,
    [periodoActualId, studentId]
  );

  if (existentes.length > 0) {
    return Number(semestreActual);
  }

  const semestreLimpio = Math.max(
    1,
    Math.min(SEMESTRE_EGRESADO, Number(semestreActual || 1))
  );
  const nuevoSemestre =
    semestreLimpio < SEMESTRE_EGRESADO ? semestreLimpio + 1 : SEMESTRE_EGRESADO;

  const [insRes] = await db.execute<ResultSetHeader>(
    `
    INSERT IGNORE INTO transiciones_periodo_estudiantes
      (periodo_id, student_id, semestre_anterior, semestre_nuevo)
    VALUES (?, ?, ?, ?)
    `,
    [periodoActualId, studentId, semestreLimpio, nuevoSemestre]
  );

  if (insRes.affectedRows > 0 && nuevoSemestre !== semestreLimpio) {
    await db.execute<ResultSetHeader>(
      `UPDATE students SET semestre = ? WHERE id = ?`,
      [nuevoSemestre, studentId]
    );
    return nuevoSemestre;
  }

  return semestreLimpio;
}

/**
 * Avanza automáticamente a TODOS los estudiantes del padrón cuando el periodo académico
 * se mueve hacia adelante (ej. 2026-III -> 2027-I), generando de inmediato las materias
 * y notas del trimestre recién culminado (1..12) y recalculando su `indice_global`.
 */
export async function avanzarTodosLosEstudiantesEnCambioPeriodo(
  periodoActualId: number
): Promise<{ esAvanceNuevoPeriodo: boolean; estudiantesAvanzados: number }> {
  await asegurarTablaTransicionesPeriodo();

  const periodoRows = await queryFresh<PeriodoFechaRow[]>(
    `SELECT id, codigo, fecha_inicio FROM periodos_academicos WHERE id = ? LIMIT 1`,
    [periodoActualId]
  );

  if (periodoRows.length === 0) {
    return { esAvanceNuevoPeriodo: false, estudiantesAvanzados: 0 };
  }

  const fechaActualStr = normalizarFechaSql(periodoRows[0].fecha_inicio);

  const configRows = await queryFresh<ConfigPeriodoRow[]>(
    `SELECT valor_int, valor_txt FROM sistema_config WHERE clave = ? LIMIT 1`,
    [CLAVE_ULTIMO_PERIODO_ACTIVO]
  );

  if (configRows.length === 0) {
    await db.execute<ResultSetHeader>(
      `
      INSERT INTO sistema_config (clave, valor_int, valor_txt)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE valor_int = VALUES(valor_int), valor_txt = VALUES(valor_txt)
      `,
      [CLAVE_ULTIMO_PERIODO_ACTIVO, periodoActualId, fechaActualStr]
    );

    await db.execute<ResultSetHeader>(
      `
      INSERT IGNORE INTO transiciones_periodo_estudiantes
        (periodo_id, student_id, semestre_anterior, semestre_nuevo)
      SELECT ?, id, semestre, semestre
      FROM students
      `,
      [periodoActualId]
    );

    return { esAvanceNuevoPeriodo: false, estudiantesAvanzados: 0 };
  }

  const ultimoPeriodoId = Number(configRows[0].valor_int ?? 0);
  const ultimaFechaStr = normalizarFechaSql(configRows[0].valor_txt);

  if (ultimoPeriodoId === periodoActualId) {
    return { esAvanceNuevoPeriodo: false, estudiantesAvanzados: 0 };
  }

  await db.execute<ResultSetHeader>(
    `
    INSERT INTO sistema_config (clave, valor_int, valor_txt)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE valor_int = VALUES(valor_int), valor_txt = VALUES(valor_txt)
    `,
    [CLAVE_ULTIMO_PERIODO_ACTIVO, periodoActualId, fechaActualStr]
  );

  const esAvanceAdelante =
    ultimaFechaStr === '' || fechaActualStr > ultimaFechaStr;

  if (!esAvanceAdelante) {
    return { esAvanceNuevoPeriodo: false, estudiantesAvanzados: 0 };
  }

  await db.execute<ResultSetHeader>(
    `
    INSERT IGNORE INTO transiciones_periodo_estudiantes
      (periodo_id, student_id, semestre_anterior, semestre_nuevo)
    SELECT ?, st.id, st.semestre, st.semestre
    FROM students st
    WHERE EXISTS (
      SELECT 1 FROM solicitudes s_ex
      WHERE s_ex.user_id = st.id AND s_ex.periodo_id = ?
    )
    `,
    [periodoActualId, periodoActualId]
  );

  const todosPendientes = await queryFresh<EstudianteAvanceRow[]>(
    `
    SELECT
      st.id,
      IFNULL(st.semestre, 1) AS semestre,
      (
        SELECT s_ult.tipo_beca
        FROM solicitudes s_ult
        WHERE s_ult.user_id = st.id
        ORDER BY s_ult.periodo_id DESC, s_ult.id DESC
        LIMIT 1
      ) AS tipo_beca_reciente
    FROM students st
    WHERE NOT EXISTS (
      SELECT 1
      FROM transiciones_periodo_estudiantes tpe
      WHERE tpe.periodo_id = ? AND tpe.student_id = st.id
    )
    ORDER BY st.id ASC
    `,
    [periodoActualId]
  );

  let estudiantesAvanzados = 0;

  for (const est of todosPendientes) {
    const semestrePrev = Math.max(1, Number(est.semestre || 1));

    if (semestrePrev >= SEMESTRE_EGRESADO) {
      await asegurarAvanceSemestreEnPeriodo(
        Number(est.id),
        semestrePrev,
        periodoActualId
      );
      continue;
    }

    if (semestrePrev > 1) {
      await sincronizarYObtenerRecordAcademico(est.id, undefined, est.tipo_beca_reciente);
    }

    const nuevoSem = await asegurarAvanceSemestreEnPeriodo(
      Number(est.id),
      semestrePrev,
      periodoActualId
    );

    await sincronizarYObtenerRecordAcademico(est.id, undefined, est.tipo_beca_reciente);

    if (nuevoSem > semestrePrev) {
      estudiantesAvanzados += 1;
    }
  }

  return { esAvanceNuevoPeriodo: true, estudiantesAvanzados };
}

/**
 * MOTOR AUTOMÁTICO DE CAMBIO DE PERIODO POR ESTUDIANTE (Normativa UNIMAR 2023):
 * 1. Bloqueo definitivo (Art. 28): si tiene beca_perdida = 1 o rechazo previo, no renueva.
 * 2. Lista de espera ('Pendiente', 'Convocado a Entrevista', 'En Revisión', 'Revisión Especial'):
 *    - Si egresa (pasa a trimestre 13): cierra la solicitud como 'Finalizada' ("Acabó su periodo académico").
 *    - Si continúa (<= 12): conserva la misma solicitud (cero duplicidad), actualiza notas de (semestre - 1)
 *      y audita >= 16 con 0 reprobadas.
 * 3. Becado vigente ('Aprobada'):
 *    - Si egresa (avanza desde 12° a 13°): registra cierre en el nuevo periodo con estatus 'Finalizada'
 *      y observación "Acabó su periodo académico" (sin sanción Art. 28).
 *    - Si era BECA A LA EXCELENCIA ACADÉMICA:
 *      * Si sigue siendo #1 de su carrera (Global >= 18, 0 reprobadas, criterio de desempate idéntico a Nómina Automática)
 *        -> renueva Excelencia (conservando su beca_base_respaldo si tenía una).
 *      * Si perdió el #1 o bajó de 18 y tiene `beca_base_respaldo` -> retorna automáticamente a su beca base
 *        si cumple >= 16 y 0 reprobadas (o pasa a Rechazada si incumple).
 *      * Si perdió Excelencia y NO tenía `beca_base_respaldo`:
 *        - Si reprobó o bajó de 16 en el último trimestre -> Rechazada (beca_perdida = 1).
 *        - Si mantuvo >= 16 y 0 reprobadas -> registra solicitud en estatus 'Finalizada' sin sanción (beca_perdida = 0).
 *    - Resto de modalidades (Beca Aprendizaje, Social, Discapacidad, Ayudas):
 *      * Evalúa promedio del trimestre anterior >= 16 y 0 reprobadas (< 10).
 *      * Luego la rotación automática de Excelencia promueve al #1 de cada carrera resguardando su beca base.
 */
export async function evaluarYRenovarEstudianteEnCambioPeriodo(
  studentIdInput: number | string,
  periodoActualIdInput?: number,
  diferirCorreo: boolean = false
): Promise<ResultadoTransicionPeriodo> {
  const studentId = Number(studentIdInput);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return { processed: false, reason: 'ID_INVALIDO' };
  }

  try {
    const periodoActualId =
      periodoActualIdInput && Number(periodoActualIdInput) > 0
        ? Number(periodoActualIdInput)
        : Number(await obtenerOCrearPeriodoObjetivo());

    if (!periodoActualId) {
      return { processed: false, reason: 'SIN_PERIODO_ACTIVO' };
    }

    const studentRows = await queryFresh<StudentTransicionRow[]>(
      `
      SELECT
        id,
        carrera,
        IFNULL(semestre, 1) AS semestre,
        IFNULL(beca_perdida, 0) AS beca_perdida,
        IFNULL(ha_tenido_beca, 0) AS ha_tenido_beca,
        email,
        beca_base_respaldo,
        departamento_base_respaldo
      FROM students
      WHERE id = ?
      LIMIT 1
      `,
      [studentId]
    );

    if (studentRows.length === 0) {
      return { processed: false, reason: 'ESTUDIANTE_NO_ENCONTRADO' };
    }

    const st = studentRows[0];

    const rechazoHistoricoRows = await queryFresh<SolicitudIdRow[]>(
      `
      SELECT id
      FROM solicitudes
      WHERE user_id = ?
        AND LOWER(TRIM(estatus)) IN ('rechazada', 'rechazado')
      LIMIT 1
      `,
      [studentId]
    );

    if (Number(st.beca_perdida) === 1 || rechazoHistoricoRows.length > 0) {
      if (Number(st.beca_perdida) !== 1) {
        await db.execute<ResultSetHeader>(
          `UPDATE students SET beca_perdida = 1 WHERE id = ?`,
          [studentId]
        );
      }
      return {
        processed: false,
        estatus: 'Rechazada',
        becaPerdida: true,
        reason: 'RECHAZO_PERMANENTE',
      };
    }

    const existentesPeriodoActual = await queryFresh<SolicitudIdRow[]>(
      `SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ? LIMIT 1`,
      [studentId, periodoActualId]
    );

    if (existentesPeriodoActual.length > 0) {
      return { processed: false, reason: 'YA_PROCESADO_EN_PERIODO' };
    }

    const prevRows = await queryFresh<SolicitudPreviaCompletaRow[]>(
      `
      SELECT
        id, user_id, periodo_id, email_institucional, tipo_beca, promedio_notas,
        motivo_solicitud, estatus, departamento_asignado,
        foto_carnet, copia_cedula, planilla_inscripcion, constancia_residencia,
        declaracion_manutencion, informe_medico, partida_nacimiento, constancia_club,
        constancia_notas, notas_certificadas, carnet_discapacidad, documentos_filiacion
      FROM solicitudes
      WHERE user_id = ? AND periodo_id < ?
      ORDER BY periodo_id DESC, id DESC
      LIMIT 1
      `,
      [studentId, periodoActualId]
    );

    if (prevRows.length === 0) {
      return { processed: false, reason: 'SIN_SOLICITUD_PREVIA' };
    }

    const ultimaSol = prevRows[0];
    const estatusPrevio = String(ultimaSol.estatus || '').trim();
    const tipoBecaOficial =
      normalizarTipoBecaOficial(ultimaSol.tipo_beca) ||
      String(ultimaSol.tipo_beca || 'AYUDA ECONÓMICA').trim();
    const semestreEnDB = Math.max(1, Number(st.semestre || 1));

    // =========================================================================
    // RAMA A: LISTA DE ESPERA (Pendiente, Convocado a Entrevista, En Revisión)
    // =========================================================================
    if (ESTATUS_LISTA_ESPERA.has(estatusPrevio)) {
      const marcaPeriodoRows = await queryFresh<SolicitudIdRow[]>(
        `
        SELECT id
        FROM historial_aprobaciones
        WHERE solicitud_id = ?
          AND periodo_id = ?
          AND admin_id = 0
        LIMIT 1
        `,
        [ultimaSol.id, periodoActualId]
      );

      if (marcaPeriodoRows.length > 0) {
        return { processed: false, reason: 'LISTA_ESPERA_YA_ACTUALIZADA' };
      }

      const nuevoSemestre = await asegurarAvanceSemestreEnPeriodo(
        studentId,
        semestreEnDB,
        periodoActualId
      );
      const trimestreAuditado = Math.min(12, Math.max(1, nuevoSemestre - 1));
      const esEgresadoListaEspera = nuevoSemestre >= SEMESTRE_EGRESADO;

      const recordRes = await sincronizarYObtenerRecordAcademico(
        studentId,
        undefined,
        tipoBecaOficial
      );

      if (!recordRes.success || !recordRes.data) {
        return { processed: false, reason: 'ERROR_SINCRONIZANDO_RECORD' };
      }

      const expediente = recordRes.data;
      const evaluacionTrim = evaluarElegibilidadTrimestre(
        trimestreAuditado,
        expediente.recordCompleto,
        tipoBecaOficial,
        'ingreso'
      );

      const snapshotTrimestre = construirSnapshotDeTrimestre(
        expediente.recordCompleto,
        trimestreAuditado
      );

      const materiasJson = JSON.stringify(
        snapshotTrimestre ?? {
          trimestre: trimestreAuditado,
          materias: [],
          fecha_proceso: new Date().toISOString(),
        }
      );

      const baremoRows = await queryFresh<EstudioBaremoRow[]>(
        `
        SELECT puntaje, nivel_riesgo
        FROM estudios_socioeconomicos
        WHERE student_id = ? AND tipo = 'administrador'
        ORDER BY id DESC
        LIMIT 1
        `,
        [studentId]
      );
      const puntajeBaremo = Number(baremoRows[0]?.puntaje ?? 0);
      const nivelRiesgo = String(baremoRows[0]?.nivel_riesgo || 'Bajo');

      const connection = await db.getConnection();
      let resultadoRamaA: ResultadoTransicionPeriodo | null = null;
      let correoPendienteRamaA: ParamsCorreoCambioEstatusSolicitud | null = null;

      try {
        await connection.beginTransaction();

        const [recheckMarca] = await connection.execute<SolicitudIdRow[]>(
          `
          SELECT id FROM historial_aprobaciones
          WHERE solicitud_id = ? AND periodo_id = ? AND admin_id = 0
          LIMIT 1 FOR UPDATE
          `,
          [ultimaSol.id, periodoActualId]
        );

        if (recheckMarca.length > 0) {
          await connection.rollback();
          return { processed: false, reason: 'LISTA_ESPERA_CONCURRENTE' };
        }

        if (esEgresadoListaEspera) {
          await connection.execute<ResultSetHeader>(
            `
            UPDATE solicitudes
            SET estatus = 'Finalizada',
                periodo_id = ?,
                promedio_notas = ?,
                materias_json = ?,
                tipo_beca = ?,
                observaciones_admin = ?,
                departamento_asignado = NULL,
                fecha_decision = NOW(),
                revisado_por = 0
            WHERE id = ?
            `,
            [
              periodoActualId,
              evaluacionTrim.promedioTrimestre.toFixed(2),
              materiasJson,
              tipoBecaOficial,
              OBSERVACION_EGRESADO,
              ultimaSol.id,
            ]
          );

          await connection.execute<ResultSetHeader>(
            `
            INSERT INTO historial_aprobaciones (
              solicitud_id, user_id, periodo_id, admin_id,
              promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
              tipo_beca_snapshot, estatus_previo, estatus_nuevo,
              observacion_admin, materias_snapshot_json, indice_global_snapshot,
              fecha_aprobacion, token_verificacion, ip_accion
            ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, 'Finalizada', ?, ?, ?, NOW(), ?, '127.0.0.1')
            `,
            [
              ultimaSol.id,
              studentId,
              periodoActualId,
              evaluacionTrim.promedioTrimestre.toFixed(2),
              nuevoSemestre,
              puntajeBaremo,
              nivelRiesgo,
              tipoBecaOficial,
              estatusPrevio,
              OBSERVACION_EGRESADO,
              materiasJson,
              expediente.indiceGlobal.toFixed(2),
              randomUUID(),
            ]
          );

          await connection.commit();
          correoPendienteRamaA = {
            solicitudId: Number(ultimaSol.id),
            nuevoEstatus: 'Finalizada',
            estatusPrevio,
            observaciones: OBSERVACION_EGRESADO,
          };
          resultadoRamaA = {
            processed: true,
            estatus: 'Finalizada',
            becaPerdida: false,
            nuevoSemestre,
            trimestreAuditado,
            reason: 'EGRESADO_TRIMESTRE_12',
          };
        } else if (evaluacionTrim.apto) {
          await connection.execute<ResultSetHeader>(
            `
            UPDATE solicitudes
            SET promedio_notas = ?,
                materias_json = ?,
                tipo_beca = ?
            WHERE id = ?
            `,
            [
              evaluacionTrim.promedioTrimestre.toFixed(2),
              materiasJson,
              tipoBecaOficial,
              ultimaSol.id,
            ]
          );

          await connection.execute<ResultSetHeader>(
            `
            INSERT INTO historial_aprobaciones (
              solicitud_id, user_id, periodo_id, admin_id,
              promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
              tipo_beca_snapshot, estatus_previo, estatus_nuevo,
              observacion_admin, materias_snapshot_json, indice_global_snapshot,
              fecha_aprobacion, token_verificacion, ip_accion
            ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, '127.0.0.1')
            `,
            [
              ultimaSol.id,
              studentId,
              periodoActualId,
              evaluacionTrim.promedioTrimestre.toFixed(2),
              nuevoSemestre,
              puntajeBaremo,
              nivelRiesgo,
              tipoBecaOficial,
              estatusPrevio,
              estatusPrevio,
              `Actualización automática de notas del Trimestre ${trimestreAuditado} (promedio ${evaluacionTrim.promedioTrimestre.toFixed(
                2
              )} pts) para lista de espera en el periodo vigente.`,
              materiasJson,
              expediente.indiceGlobal.toFixed(2),
              randomUUID(),
            ]
          );

          await connection.commit();
          resultadoRamaA = {
            processed: true,
            estatus: estatusPrevio,
            becaPerdida: false,
            nuevoSemestre,
            trimestreAuditado,
          };
        } else {
          const motivoRechazo =
            evaluacionTrim.motivoRechazo ||
            `Rechazo automático en auditoría del Trimestre ${trimestreAuditado} por incumplimiento académico.`;

          await connection.execute<ResultSetHeader>(
            `
            UPDATE solicitudes
            SET estatus = 'Rechazada',
                periodo_id = ?,
                promedio_notas = ?,
                materias_json = ?,
                tipo_beca = ?,
                observaciones_admin = ?,
                departamento_asignado = NULL,
                fecha_decision = NOW(),
                revisado_por = 0
            WHERE id = ?
            `,
            [
              periodoActualId,
              evaluacionTrim.promedioTrimestre.toFixed(2),
              materiasJson,
              tipoBecaOficial,
              motivoRechazo,
              ultimaSol.id,
            ]
          );

          await connection.execute<ResultSetHeader>(
            `UPDATE students SET beca_perdida = 1 WHERE id = ?`,
            [studentId]
          );

          await connection.execute<ResultSetHeader>(
            `
            INSERT INTO historial_aprobaciones (
              solicitud_id, user_id, periodo_id, admin_id,
              promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
              tipo_beca_snapshot, estatus_previo, estatus_nuevo,
              observacion_admin, materias_snapshot_json, indice_global_snapshot,
              fecha_aprobacion, token_verificacion, ip_accion
            ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, 'Rechazada', ?, ?, ?, NOW(), ?, '127.0.0.1')
            `,
            [
              ultimaSol.id,
              studentId,
              periodoActualId,
              evaluacionTrim.promedioTrimestre.toFixed(2),
              nuevoSemestre,
              puntajeBaremo,
              nivelRiesgo,
              tipoBecaOficial,
              estatusPrevio,
              motivoRechazo,
              materiasJson,
              expediente.indiceGlobal.toFixed(2),
              randomUUID(),
            ]
          );

          await connection.commit();
          correoPendienteRamaA = {
            solicitudId: Number(ultimaSol.id),
            nuevoEstatus: 'Rechazada',
            estatusPrevio,
            observaciones: motivoRechazo,
          };
          resultadoRamaA = {
            processed: true,
            estatus: 'Rechazada',
            becaPerdida: true,
            nuevoSemestre,
            trimestreAuditado,
          };
        }
      } catch (sqlErr) {
        await connection.rollback();
        throw sqlErr;
      } finally {
        connection.release();
      }

      if (correoPendienteRamaA) {
        if (diferirCorreo) {
          resultadoRamaA.notificacionCorreo = correoPendienteRamaA;
        } else {
          await enviarCorreoCambioEstatusPorSolicitudId(correoPendienteRamaA);
        }
      }

      return resultadoRamaA;
    }

    // =========================================================================
    // RAMA B: BECADO VIGENTE ('Aprobada' en periodo anterior)
    // =========================================================================
    if (estatusPrevio !== 'Aprobada') {
      return { processed: false, reason: 'ESTATUS_NO_ELEGIBLE_PARA_TRANSICION' };
    }

    await asegurarTablaTransicionesPeriodo();
    const transicionPreviaRows = await queryFresh<TransicionEstudianteRow[]>(
      `
      SELECT semestre_anterior, semestre_nuevo
      FROM transiciones_periodo_estudiantes
      WHERE periodo_id = ? AND student_id = ?
      LIMIT 1
      `,
      [periodoActualId, studentId]
    );

    const semestreAntesDeEstePeriodo =
      transicionPreviaRows.length > 0
        ? Number(transicionPreviaRows[0].semestre_anterior)
        : semestreEnDB;

    const eraExcelencia = esBecaExcelenciaAcademica(tipoBecaOficial);

    if (eraExcelencia && !st.beca_base_respaldo) {
      const marcaCeseRows = await queryFresh<SolicitudIdRow[]>(
        `
        SELECT id
        FROM historial_aprobaciones
        WHERE solicitud_id = ?
          AND periodo_id = ?
          AND admin_id = 0
        LIMIT 1
        `,
        [ultimaSol.id, periodoActualId]
      );

      if (marcaCeseRows.length > 0) {
        return { processed: false, reason: 'EXCELENCIA_CESADA_EN_PERIODO' };
      }
    }

    const nuevoSemestre = await asegurarAvanceSemestreEnPeriodo(
      studentId,
      semestreEnDB,
      periodoActualId
    );
    const esEgresado =
      semestreAntesDeEstePeriodo >= 12 || nuevoSemestre >= SEMESTRE_EGRESADO;
    const trimestreAuditado = Math.min(12, Math.max(1, nuevoSemestre - 1));

    const recordRes = await sincronizarYObtenerRecordAcademico(
      studentId,
      undefined,
      tipoBecaOficial
    );

    if (!recordRes.success || !recordRes.data) {
      return { processed: false, reason: 'ERROR_SINCRONIZANDO_RECORD' };
    }

    const expediente = recordRes.data;
    const snapshotTrimestre = construirSnapshotDeTrimestre(
      expediente.recordCompleto,
      trimestreAuditado
    );

    const materiasJson = JSON.stringify(
      snapshotTrimestre ?? {
        trimestre: trimestreAuditado,
        materias: [],
        fecha_proceso: new Date().toISOString(),
      }
    );

    let tipoBecaDestino = tipoBecaOficial;
    let estatusFinal: 'Aprobada' | 'Rechazada' | 'Finalizada' = 'Aprobada';
    let observacionSistema = '';
    let departamentoFinal: string | null = ultimaSol.departamento_asignado ?? null;
    let limpiarRespaldoBase = false;
    let promedioParaGuardar = expediente.promedioUltimoTrimestre;

    if (esEgresado) {
      tipoBecaDestino = tipoBecaOficial;
      estatusFinal = 'Finalizada';
      departamentoFinal = null;
      limpiarRespaldoBase = Boolean(st.beca_base_respaldo);
      promedioParaGuardar = expediente.promedioUltimoTrimestre;
      observacionSistema = OBSERVACION_EGRESADO;
    } else if (eraExcelencia) {
      const evalEx = evaluarElegibilidadTrimestre(
        trimestreAuditado,
        expediente.recordCompleto,
        'BECA A LA EXCELENCIA ACADÉMICA',
        'renovacion'
      );
      promedioParaGuardar = evalEx.promedioTrimestre;
      const globalRedondeado = Number(expediente.indiceGlobal.toFixed(2));
      const trimRedondeado = Number(evalEx.promedioTrimestre.toFixed(2));

      // Mismo criterio determinístico de rival superior que Nómina Automática (excluyendo egresados)
      const rivalRows = await queryFresh<RivalSuperiorRow[]>(
        `
        SELECT EXISTS (
          SELECT 1
          FROM students st_r
          WHERE st_r.id != ?
            AND LOWER(TRIM(st_r.carrera)) = LOWER(TRIM(?))
            AND st_r.semestre >= ?
            AND st_r.semestre < ?
            AND IFNULL(st_r.beca_perdida, 0) = 0
            AND IFNULL(st_r.indice_global, 0) >= ?
            AND NOT EXISTS (
              SELECT 1
              FROM solicitudes s_rj
              WHERE s_rj.user_id = st_r.id
                AND LOWER(TRIM(s_rj.estatus)) IN ('rechazada', 'rechazado')
            )
            AND NOT EXISTS (
              SELECT 1
              FROM record_academico ra_r
              WHERE ra_r.student_id = st_r.id
                AND ra_r.trimestre_cursado = GREATEST(1, st_r.semestre - 1)
                AND (ra_r.nota < 10 OR ra_r.aprobada = 0)
            )
            AND (
              ROUND(IFNULL(st_r.indice_global, 0), 2) > ?
              OR (
                ROUND(IFNULL(st_r.indice_global, 0), 2) = ?
                AND IFNULL((
                  SELECT ROUND(AVG(ra_t.nota), 2)
                  FROM record_academico ra_t
                  WHERE ra_t.student_id = st_r.id
                    AND ra_t.trimestre_cursado = GREATEST(1, st_r.semestre - 1)
                ), 0) > ?
              )
              OR (
                ROUND(IFNULL(st_r.indice_global, 0), 2) = ?
                AND IFNULL((
                  SELECT ROUND(AVG(ra_t2.nota), 2)
                  FROM record_academico ra_t2
                  WHERE ra_t2.student_id = st_r.id
                    AND ra_t2.trimestre_cursado = GREATEST(1, st_r.semestre - 1)
                ), 0) = ?
                AND st_r.semestre > ?
              )
            )
        ) AS hay_superior
        `,
        [
          studentId,
          st.carrera,
          TRIMESTRE_MINIMO_EXCELENCIA,
          SEMESTRE_EGRESADO,
          PROMEDIO_MINIMO_EXCELENCIA,
          globalRedondeado,
          globalRedondeado,
          trimRedondeado,
          globalRedondeado,
          trimRedondeado,
          nuevoSemestre,
        ]
      );

      const fueSuperadoPorOtro = Number(rivalRows[0]?.hay_superior || 0) === 1;
      const mantieneExcelencia =
        evalEx.apto &&
        expediente.indiceGlobal >= PROMEDIO_MINIMO_EXCELENCIA &&
        !fueSuperadoPorOtro;

      if (mantieneExcelencia) {
        tipoBecaDestino = 'BECA A LA EXCELENCIA ACADÉMICA';
        estatusFinal = 'Aprobada';
        departamentoFinal = null;
        observacionSistema = `Renovación automática de Beca a la Excelencia Académica: mantiene el mayor Índice Global Acumulado (${expediente.indiceGlobal.toFixed(
          2
        )} pts) en ${st.carrera} sin asignaturas reprobadas en el Trimestre ${trimestreAuditado}.`;
      } else if (st.beca_base_respaldo) {
        // Perdió Excelencia (por promedio o por rotación), pero posee beca base resguardada
        const becaBaseOficial =
          normalizarTipoBecaOficial(st.beca_base_respaldo) || st.beca_base_respaldo;
        const evalBase = evaluarElegibilidadTrimestre(
          trimestreAuditado,
          expediente.recordCompleto,
          becaBaseOficial,
          'renovacion'
        );

        tipoBecaDestino = becaBaseOficial;
        promedioParaGuardar = evalBase.promedioTrimestre;
        limpiarRespaldoBase = true;

        const motivoCambio = fueSuperadoPorOtro
          ? `Otro estudiante de ${st.carrera} obtuvo un Índice Global superior en este periodo.`
          : `Su Índice Global (${expediente.indiceGlobal.toFixed(
              2
            )} pts) dejó de cumplir el umbral de 18.00 pts para Excelencia.`;

        if (evalBase.apto) {
          estatusFinal = 'Aprobada';
          departamentoFinal = st.departamento_base_respaldo ?? null;
          observacionSistema = `${motivoCambio} Retorno automático a su beca base (${becaBaseOficial}): su promedio del Trimestre ${trimestreAuditado} (${evalBase.promedioTrimestre.toFixed(
            2
          )} pts) cumple el mínimo de ${evalBase.promedioMinimoRequerido.toFixed(
            2
          )} pts sin reprobadas.`;
        } else {
          estatusFinal = 'Rechazada';
          departamentoFinal = null;
          observacionSistema = `${motivoCambio} Tampoco cumple el mantenimiento de su beca base (${becaBaseOficial}): ${evalBase.motivoRechazo}`;
        }
      } else {
        // Sin beca base:
        // - Si reprobó materia (< 10) o promedio trimestral < 16 -> Rechazada (beca_perdida = 1).
        // - Si mantuvo >= 16 y 0 reprobadas -> Finalizada sin sanción (beca_perdida = 0) en solicitudes.
        const falloAcademicoBase =
          evalEx.totalReprobadas > 0 ||
          evalEx.promedioTrimestre < PROMEDIO_MINIMO_BECA;

        tipoBecaDestino = 'BECA A LA EXCELENCIA ACADÉMICA';
        departamentoFinal = null;

        if (falloAcademicoBase) {
          estatusFinal = 'Rechazada';
          observacionSistema =
            evalEx.motivoRechazo ||
            `Suspensión definitiva de Beca a la Excelencia Académica en el Trimestre ${trimestreAuditado} por incumplimiento académico (< 16.00 pts o asignatura reprobada).`;
        } else {
          estatusFinal = 'Finalizada';
          observacionSistema = fueSuperadoPorOtro
            ? `Finalización sin sanción de Beca a la Excelencia Académica en el Trimestre ${trimestreAuditado}: otro estudiante de ${st.carrera} alcanzó un Índice Global superior.`
            : `Finalización sin sanción de Beca a la Excelencia Académica en el Trimestre ${trimestreAuditado}: Índice Global (${expediente.indiceGlobal.toFixed(
                2
              )} pts) inferior a 18.00 pts manteniendo promedio trimestral >= 16.00 sin reprobadas.`;
        }
      }
    } else {
      const evaluacionTrim = evaluarElegibilidadTrimestre(
        trimestreAuditado,
        expediente.recordCompleto,
        tipoBecaOficial,
        'renovacion'
      );

      promedioParaGuardar = evaluacionTrim.promedioTrimestre;
      estatusFinal = evaluacionTrim.apto ? 'Aprobada' : 'Rechazada';
      departamentoFinal =
        estatusFinal === 'Aprobada' ? (ultimaSol.departamento_asignado ?? null) : null;

      observacionSistema = evaluacionTrim.apto
        ? `Renovación automática aprobada (Trimestre ${trimestreAuditado}): promedio trimestral de ${evaluacionTrim.promedioTrimestre.toFixed(
            2
          )} pts cumple el mínimo reglamentario de ${evaluacionTrim.promedioMinimoRequerido.toFixed(
            2
          )} pts para ${tipoBecaOficial} con todas las asignaturas aprobadas.`
        : evaluacionTrim.motivoRechazo ||
          `Suspensión definitiva del beneficio en auditoría del Trimestre ${trimestreAuditado}.`;
    }

    const connection = await db.getConnection();
    let nuevaSolicitudId = 0;

    try {
      await connection.beginTransaction();

      const [recheckRows] = await connection.execute<SolicitudIdRow[]>(
        `SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ? LIMIT 1 FOR UPDATE`,
        [studentId, periodoActualId]
      );

      if (recheckRows.length > 0) {
        await connection.rollback();
        return { processed: false, reason: 'YA_PROCESADO_CONCURRENTE' };
      }

      const [insertRes] = await connection.execute<ResultSetHeader>(
        `
        INSERT INTO solicitudes (
          user_id, periodo_id, email_institucional, tipo_beca,
          promedio_notas, motivo_solicitud, materias_json, estatus,
          observaciones_admin, departamento_asignado,
          foto_carnet, copia_cedula, planilla_inscripcion, constancia_residencia,
          declaracion_manutencion, informe_medico, partida_nacimiento, constancia_club,
          constancia_notas, notas_certificadas, carnet_discapacidad, documentos_filiacion,
          fecha_registro, fecha_decision, revisado_por
        ) VALUES (
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          NOW(), NOW(), 0
        )
        `,
        [
          studentId,
          periodoActualId,
          ultimaSol.email_institucional ?? st.email ?? null,
          tipoBecaDestino,
          promedioParaGuardar.toFixed(2),
          ultimaSol.motivo_solicitud ?? 'Renovación automática por cambio de periodo.',
          materiasJson,
          estatusFinal,
          observacionSistema,
          departamentoFinal,
          ultimaSol.foto_carnet ?? null,
          ultimaSol.copia_cedula ?? null,
          ultimaSol.planilla_inscripcion ?? null,
          ultimaSol.constancia_residencia ?? null,
          ultimaSol.declaracion_manutencion ?? null,
          ultimaSol.informe_medico ?? null,
          ultimaSol.partida_nacimiento ?? null,
          ultimaSol.constancia_club ?? null,
          ultimaSol.constancia_notas ?? null,
          ultimaSol.notas_certificadas ?? null,
          ultimaSol.carnet_discapacidad ?? null,
          ultimaSol.documentos_filiacion ?? null,
        ]
      );

      nuevaSolicitudId = insertRes.insertId;

      if (limpiarRespaldoBase) {
        await connection.execute<ResultSetHeader>(
          `
          UPDATE students
          SET beca_base_respaldo = NULL,
              departamento_base_respaldo = NULL
          WHERE id = ?
          `,
          [studentId]
        );
      }

      if (estatusFinal === 'Rechazada') {
        await connection.execute<ResultSetHeader>(
          `UPDATE students SET beca_perdida = 1 WHERE id = ?`,
          [studentId]
        );
      }

      await connection.commit();
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
    }

    let notificacionRamaB: ParamsCorreoCambioEstatusSolicitud | undefined = undefined;

    if (nuevaSolicitudId > 0) {
      await registrarDecisionEnHistorial(
        nuevaSolicitudId,
        estatusFinal,
        SISTEMA_ADMIN_ID,
        observacionSistema,
        '127.0.0.1',
        'Aprobada',
        departamentoFinal ?? undefined
      );

      const correoPayload: ParamsCorreoCambioEstatusSolicitud = {
        solicitudId: nuevaSolicitudId,
        nuevoEstatus: estatusFinal,
        estatusPrevio: 'Aprobada',
        observaciones: observacionSistema,
        departamentoAsignado: departamentoFinal,
      };

      if (diferirCorreo) {
        notificacionRamaB = correoPayload;
      } else {
        await enviarCorreoCambioEstatusPorSolicitudId(correoPayload);
      }
    }

    return {
      processed: true,
      estatus: estatusFinal,
      becaPerdida: estatusFinal === 'Rechazada',
      nuevoSemestre,
      trimestreAuditado,
      reason: esEgresado ? 'EGRESADO_TRIMESTRE_12' : undefined,
      notificacionCorreo: notificacionRamaB,
    };
  } catch (error) {
    console.error('❌ Error en evaluarYRenovarEstudianteEnCambioPeriodo:', error);
    return { processed: false, reason: 'ERROR_INTERNO' };
  }
}

/**
 * Procesa masivamente al cambiar de periodo:
 * 1. Avanza +1 trimestre a TODOS los estudiantes (hasta 13 = Egresado) y genera su pensum, notas e índice global.
 * 2. Hidrata cualquier estudiante rezagado sin récord académico.
 * 3. Evalúa la última solicitud previa al periodo vigente por estudiante: renueva becados 'Aprobada',
 *    cierra egresados y ceses sin sanción como 'Finalizada' y depura lista de espera.
 * 4. Ejecuta automáticamente la rotación de Beca a la Excelencia Académica en las 8 carreras.
 */
export async function procesarTransicionMasivaDePeriodo(
  periodoActualIdInput?: number
): Promise<{
  totalProcesados: number;
  aprobados: number;
  rechazados: number;
  finalizados: number;
  esperaActualizados: number;
  estudiantesAvanzados: number;
}> {
  try {
    const periodoActualId =
      periodoActualIdInput && Number(periodoActualIdInput) > 0
        ? Number(periodoActualIdInput)
        : Number(await obtenerOCrearPeriodoObjetivo());

    if (!periodoActualId) {
      return {
        totalProcesados: 0,
        aprobados: 0,
        rechazados: 0,
        finalizados: 0,
        esperaActualizados: 0,
        estudiantesAvanzados: 0,
      };
    }

    // 1. Avance automático de trimestre + pensum + notas para TODOS los estudiantes en cambio de periodo
    const { estudiantesAvanzados } =
      await avanzarTodosLosEstudiantesEnCambioPeriodo(periodoActualId);

    // 2. Hidratación automática de cualquier estudiante existente con récord faltante o desincronizado
    await sincronizarTodosLosRecordsFaltantes(300);

    // 3. Sincronizar bloqueo definitivo (Art. 28) para cualquier estudiante con rechazo previo
    await db.execute<ResultSetHeader>(
      `
      UPDATE students st
      SET st.beca_perdida = 1
      WHERE IFNULL(st.beca_perdida, 0) = 0
        AND EXISTS (
          SELECT 1 FROM solicitudes s_rej
          WHERE s_rej.user_id = st.id
            AND LOWER(TRIM(s_rej.estatus)) IN ('rechazada', 'rechazado')
        )
      `
    );

    const candidatos = await queryFresh<UserIdRow[]>(
      `
      SELECT s.user_id
      FROM solicitudes s
      JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        WHERE periodo_id < ?
        GROUP BY user_id
      ) ult ON s.id = ult.last_id
      JOIN students st ON s.user_id = st.id
      WHERE IFNULL(st.beca_perdida, 0) = 0
        AND NOT EXISTS (
          SELECT 1 FROM solicitudes s_act
          WHERE s_act.user_id = s.user_id AND s_act.periodo_id = ?
        )
        AND NOT EXISTS (
          SELECT 1 FROM solicitudes s_rej
          WHERE s_rej.user_id = s.user_id
            AND LOWER(TRIM(s_rej.estatus)) IN ('rechazada', 'rechazado')
        )
        AND (
          (
            LOWER(TRIM(s.estatus)) IN ('aprobada', 'aprobado')
            AND NOT EXISTS (
              SELECT 1 FROM historial_aprobaciones h_fin
              WHERE h_fin.solicitud_id = s.id
                AND h_fin.periodo_id = ?
                AND h_fin.admin_id = 0
                AND h_fin.estatus_nuevo = 'Finalizada'
            )
          )
          OR (
            s.estatus IN ('Pendiente', 'Convocado a Entrevista', 'En Revisión', 'Revisión Especial')
            AND NOT EXISTS (
              SELECT 1 FROM historial_aprobaciones h_upd
              WHERE h_upd.solicitud_id = s.id
                AND h_upd.periodo_id = ?
                AND h_upd.admin_id = 0
            )
          )
        )
      `,
      [periodoActualId, periodoActualId, periodoActualId, periodoActualId]
    );

    let aprobados = 0;
    let rechazados = 0;
    let finalizados = 0;
    let esperaActualizados = 0;
    const correosPendientes: ParamsCorreoCambioEstatusSolicitud[] = [];

    for (const row of candidatos) {
      const res = await evaluarYRenovarEstudianteEnCambioPeriodo(
        Number(row.user_id),
        periodoActualId,
        true
      );
      if (res.processed) {
        if (res.estatus === 'Aprobada') aprobados += 1;
        else if (res.estatus === 'Rechazada') rechazados += 1;
        else if (res.estatus === 'Finalizada') finalizados += 1;
        else esperaActualizados += 1;
        if (res.notificacionCorreo) {
          correosPendientes.push(res.notificacionCorreo);
        }
      }
    }

    // Despacho en lotes paralelos de 5 correos para rapidez sin perder notificaciones
    const TAMANO_LOTE_SMTP = 5;
    for (let i = 0; i < correosPendientes.length; i += TAMANO_LOTE_SMTP) {
      const lote = correosPendientes.slice(i, i + TAMANO_LOTE_SMTP);
      await Promise.allSettled(
        lote.map((payload) => enviarCorreoCambioEstatusPorSolicitudId(payload))
      );
    }

    // 4. Rotación automática de Beca a la Excelencia Académica para las 8 carreras
    const resExcelencia = await ejecutarRotacionExcelenciaEnPeriodo(
      periodoActualId,
      SISTEMA_ADMIN_ID
    );
    if (resExcelencia.success) {
      aprobados += resExcelencia.asignados;
    }

    return {
      totalProcesados: aprobados + rechazados + finalizados + esperaActualizados,
      aprobados,
      rechazados,
      finalizados,
      esperaActualizados,
      estudiantesAvanzados,
    };
  } catch (error) {
    console.error('❌ Error en procesarTransicionMasivaDePeriodo:', error);
    return {
      totalProcesados: 0,
      aprobados: 0,
      rechazados: 0,
      finalizados: 0,
      esperaActualizados: 0,
      estudiantesAvanzados: 0,
    };
  }
}

/**
 * Compatibilidad para renovación manual existente sincronizada con Normativa UNIMAR 2023.
 */
export async function renovarBeca(formData: FormData) {
  let connection;
  try {
    const userId = formData.get('user_id');
    const trimestreSeleccionado = formData.get('trimestre_seleccionado');

    if (!userId) return { error: 'ID de usuario no encontrado.' };

    const userIdNum = parseInt(String(userId), 10);
    const trimestreNum = parseInt(String(trimestreSeleccionado), 10);

    const periodoIdActual = Number(await obtenerOCrearPeriodoObjetivo());

    const materiasCodigos = formData.getAll('materias_codigos[]');
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');

    const nuevasMaterias = materiasCodigos
      .map((codigo, index) => ({
        codigo: String(codigo),
        nombre: String(materiasNombres[index] ?? ''),
        nota: parseFloat(String(materiasNotas[index] ?? '0')) || 0,
      }))
      .filter((m) => m.nombre.trim() !== '');

    if (Number.isNaN(trimestreNum) || trimestreNum < 1 || trimestreNum > 12) {
      return { error: 'Debe seleccionar un trimestre válido (1-12).' };
    }

    if (nuevasMaterias.length === 0) {
      return { error: 'Debe cargar al menos una asignatura para procesar la renovación.' };
    }

    const suma = nuevasMaterias.reduce((acc, curr) => acc + curr.nota, 0);
    const nuevoPromedio = parseFloat((suma / nuevasMaterias.length).toFixed(2));
    const tieneReprobadas = nuevasMaterias.some((m) => m.nota < 10);

    const dataParaGuardar = {
      trimestre: trimestreNum,
      materias: nuevasMaterias,
      fecha_proceso: new Date().toISOString(),
      audit_detecto_reprobadas: tieneReprobadas,
    };
    const materiasJson = JSON.stringify(dataParaGuardar);

    const [checkRenovacion] = await db.execute<SolicitudRenovacionRow[]>(
      'SELECT id, tipo_beca, departamento_asignado FROM solicitudes WHERE user_id = ? AND periodo_id = ? AND estatus = "Renovacion" LIMIT 1',
      [userIdNum, periodoIdActual]
    );

    if (checkRenovacion.length === 0) {
      return { error: 'No hay una solicitud de renovación activa habilitada por el sistema.' };
    }

    const solicitudActual = checkRenovacion[0];
    const minimoExigido = obtenerPromedioMinimoPorTipoBeca(
      solicitudActual.tipo_beca,
      'renovacion',
      trimestreNum + 1
    );

    const estatusFinal: 'Aprobada' | 'Rechazada' =
      tieneReprobadas || nuevoPromedio < minimoExigido ? 'Rechazada' : 'Aprobada';

    const observacion =
      estatusFinal === 'Aprobada'
        ? `Renovación aprobada automáticamente (promedio trimestral ${nuevoPromedio.toFixed(2)} pts >= ${minimoExigido.toFixed(2)} pts sin reprobadas).`
        : tieneReprobadas
          ? 'Suspensión definitiva del beneficio : se detectaron materias reprobadas (< 10 pts) en el trimestre.'
          : `Suspensión definitiva del beneficio : promedio trimestral (${nuevoPromedio.toFixed(2)} pts) inferior al mínimo exigido (${minimoExigido.toFixed(2)} pts).`;

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      await connection.execute<ResultSetHeader>(
        `
        UPDATE solicitudes SET
          materias_json = ?,
          promedio_notas = ?,
          estatus = ?,
          fecha_registro = NOW(),
          fecha_decision = NOW(),
          observaciones_admin = ?
        WHERE id = ?
        `,
        [materiasJson, nuevoPromedio, estatusFinal, observacion, solicitudActual.id]
      );

      if (estatusFinal === 'Rechazada') {
        await connection.execute<ResultSetHeader>(
          'UPDATE students SET beca_perdida = 1 WHERE id = ?',
          [userIdNum]
        );
      }

      await connection.commit();
    } catch (sqlError) {
      await connection.rollback();
      throw sqlError;
    }

    await registrarDecisionEnHistorial(
      solicitudActual.id,
      estatusFinal,
      SISTEMA_ADMIN_ID,
      observacion,
      '127.0.0.1',
      'Renovacion',
      estatusFinal === 'Aprobada' ? (solicitudActual.departamento_asignado ?? undefined) : undefined
    );

    await enviarCorreoCambioEstatusPorSolicitudId({
      solicitudId: Number(solicitudActual.id),
      nuevoEstatus: estatusFinal,
      estatusPrevio: 'Renovacion',
      observaciones: observacion,
      departamentoAsignado:
        estatusFinal === 'Aprobada' ? (solicitudActual.departamento_asignado ?? null) : null,
    });

    await ejecutarRotacionExcelenciaEnPeriodo(periodoIdActual, SISTEMA_ADMIN_ID);

    revalidatePath('/perfil');
    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/validarBeca');

    return { success: true, estatusAsignado: estatusFinal };
  } catch (error: unknown) {
    console.error('❌ Error en Proceso de Renovación:', error);
    return { error: 'Error interno al procesar la carga académica.' };
  } finally {
    if (connection) connection.release();
  }
}