'use server'

import { randomUUID } from 'crypto'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { revalidatePath } from 'next/cache'
import { db, queryFresh } from './db'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { ejecutarRotacionExcelenciaEnPeriodo } from './ActionsGestionEspecial'
import {
  PROMEDIO_MINIMO_EXCELENCIA,
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
}

/**
 * MOTOR AUTOMÁTICO DE CAMBIO DE PERIODO POR ESTUDIANTE (Normativa UNIMAR 2023):
 * 1. Bloqueo definitivo (Art. 28): si tiene beca_perdida = 1 o rechazo previo, no vuelve a procesarse.
 * 2. Lista de espera ('Pendiente', 'Convocado a Entrevista', 'En Revisión', 'Revisión Especial'):
 *    - Conserva la misma solicitud (cero duplicidad), avanza semestre (+1), genera notas de (semestre - 1)
 *      y audita >= 16 con cero reprobadas (< 10) en ese trimestre.
 * 3. Becado vigente ('Aprobada'):
 *    - Si era BECA A LA EXCELENCIA ACADÉMICA:
 *      * Si sigue siendo #1 de su carrera (Índice Global >= 18 y 0 reprobadas en el trimestre anterior) -> renueva Excelencia.
 *      * Si perdió Excelencia (otro lo superó o bajó de 18) y tiene beca_base_respaldo -> retorna a su beca base
 *        si cumple >= 16 y 0 reprobadas en el trimestre anterior (o pasa a Rechazada si incumple su beca base).
 *      * Si perdió Excelencia y NO tenía beca_base_respaldo -> finaliza Excelencia SIN penalización (beca_perdida = 0).
 *    - Resto de modalidades (Aprendizaje, Social, Discapacidad, Ayudas):
 *      * Evalúa promedio del trimestre anterior >= 16 y cero reprobadas (< 10).
 */
export async function evaluarYRenovarEstudianteEnCambioPeriodo(
  studentIdInput: number | string,
  periodoActualIdInput?: number
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

    // 1. Verificar datos maestros del estudiante (incluyendo respaldo de beca base)
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

    // 2. REGLA DE BLOQUEO PERMANENTE (Art. 28)
    const rechazoHistoricoRows = await queryFresh<SolicitudIdRow[]>(
      `SELECT id FROM solicitudes WHERE user_id = ? AND estatus = 'Rechazada' LIMIT 1`,
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

    // 3. Idempotencia: si ya tiene solicitud en el periodo actual, no duplicar
    const existentesPeriodoActual = await queryFresh<SolicitudIdRow[]>(
      `SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ? LIMIT 1`,
      [studentId, periodoActualId]
    );

    if (existentesPeriodoActual.length > 0) {
      return { processed: false, reason: 'YA_PROCESADO_EN_PERIODO' };
    }

    // 4. Consultar última solicitud de un periodo anterior
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
    const semestreAnterior = Math.max(1, Number(st.semestre || 1));

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

      const nuevoSemestre = semestreAnterior < 12 ? semestreAnterior + 1 : 12;
      const trimestreAuditado = Math.max(1, nuevoSemestre - 1);

      if (nuevoSemestre !== semestreAnterior) {
        await db.execute<ResultSetHeader>(
          `UPDATE students SET semestre = ? WHERE id = ?`,
          [nuevoSemestre, studentId]
        );
      }

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

        if (evaluacionTrim.apto) {
          await connection.execute<ResultSetHeader>(
            `
            UPDATE solicitudes
            SET promedio_notas = ?,
                materias_json = ?,
                tipo_beca = ?
            WHERE id = ?
            `,
            [
              evaluacionTrim.promedioTrimestre,
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
              evaluacionTrim.promedioTrimestre,
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
              expediente.indiceGlobal,
              randomUUID(),
            ]
          );

          await connection.commit();
          return {
            processed: true,
            estatus: estatusPrevio,
            becaPerdida: false,
            nuevoSemestre,
            trimestreAuditado,
          };
        }

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
            evaluacionTrim.promedioTrimestre,
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
            evaluacionTrim.promedioTrimestre,
            nuevoSemestre,
            puntajeBaremo,
            nivelRiesgo,
            tipoBecaOficial,
            estatusPrevio,
            motivoRechazo,
            materiasJson,
            expediente.indiceGlobal,
            randomUUID(),
          ]
        );

        await connection.commit();
        return {
          processed: true,
          estatus: 'Rechazada',
          becaPerdida: true,
          nuevoSemestre,
          trimestreAuditado,
        };
      } catch (sqlErr) {
        await connection.rollback();
        throw sqlErr;
      } finally {
        connection.release();
      }
    }

    // =========================================================================
    // RAMA B: BECADO VIGENTE ('Aprobada' en periodo anterior)
    // =========================================================================
    if (estatusPrevio !== 'Aprobada') {
      return { processed: false, reason: 'ESTATUS_NO_ELEGIBLE_PARA_TRANSICION' };
    }

    if (semestreAnterior >= 12) {
      return { processed: false, reason: 'EGRESADO_TRIMESTRE_12' };
    }

    const eraExcelencia = esBecaExcelenciaAcademica(tipoBecaOficial);

    // Idempotencia para ex-titular de Excelencia que cesó sin beca base en este periodo
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

    const nuevoSemestre = semestreAnterior + 1;
    const trimestreAuditado = Math.max(1, nuevoSemestre - 1);

    await db.execute<ResultSetHeader>(
      `UPDATE students SET semestre = ? WHERE id = ?`,
      [nuevoSemestre, studentId]
    );

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
    let estatusFinal: 'Aprobada' | 'Rechazada' = 'Aprobada';
    let observacionSistema = '';
    let departamentoFinal: string | null = ultimaSol.departamento_asignado ?? null;
    let limpiarRespaldoBase = false;
    let promedioParaGuardar = expediente.promedioUltimoTrimestre;

    if (eraExcelencia) {
      const evalEx = evaluarElegibilidadTrimestre(
        trimestreAuditado,
        expediente.recordCompleto,
        'BECA A LA EXCELENCIA ACADÉMICA',
        'renovacion'
      );
      promedioParaGuardar = evalEx.promedioTrimestre;

      // Verificar si algún otro estudiante de la misma carrera supera su Índice Global
      const rivalRows = await queryFresh<RivalSuperiorRow[]>(
        `
        SELECT EXISTS (
          SELECT 1
          FROM students st_r
          WHERE st_r.id != ?
            AND LOWER(TRIM(st_r.carrera)) = LOWER(TRIM(?))
            AND st_r.semestre >= ?
            AND IFNULL(st_r.beca_perdida, 0) = 0
            AND IFNULL(st_r.indice_global, 0) > ?
            AND NOT EXISTS (
              SELECT 1
              FROM record_academico ra_r
              WHERE ra_r.student_id = st_r.id
                AND ra_r.trimestre_cursado = GREATEST(1, st_r.semestre - 1)
                AND (ra_r.nota < 10 OR ra_r.aprobada = 0)
            )
        ) AS hay_superior
        `,
        [
          studentId,
          st.carrera,
          TRIMESTRE_MINIMO_EXCELENCIA,
          Number(expediente.indiceGlobal.toFixed(2)),
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
        observacionSistema = `Renovación automática de Beca a la Excelencia Académica (Art. 8): mantiene el mayor Índice Global Acumulado (${expediente.indiceGlobal.toFixed(2)} pts) en ${st.carrera} sin asignaturas reprobadas en el Trimestre ${trimestreAuditado}.`;
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
          : `Su Índice Global (${expediente.indiceGlobal.toFixed(2)} pts) dejó de cumplir el umbral de 18.00 pts para Excelencia.`;

        if (evalBase.apto) {
          estatusFinal = 'Aprobada';
          departamentoFinal = st.departamento_base_respaldo ?? null;
          observacionSistema = `${motivoCambio} Retorno automático a su beca base (${becaBaseOficial}): su promedio del Trimestre ${trimestreAuditado} (${evalBase.promedioTrimestre.toFixed(2)} pts) cumple el mínimo de ${evalBase.promedioMinimoRequerido.toFixed(2)} pts sin reprobadas.`;
        } else {
          estatusFinal = 'Rechazada';
          departamentoFinal = null;
          observacionSistema = `${motivoCambio} Tampoco cumple el mantenimiento de su beca base (${becaBaseOficial}): ${evalBase.motivoRechazo}`;
        }
      } else {
        // Perdió Excelencia y NO tenía beca base: NO se sanciona ni se marca beca_perdida = 1
        const motivoCese = fueSuperadoPorOtro
          ? `Cese sin sanción de Beca a la Excelencia Académica en el Trimestre ${trimestreAuditado}: otro estudiante de ${st.carrera} alcanzó un Índice Global superior.`
          : `Cese sin sanción de Beca a la Excelencia Académica en el Trimestre ${trimestreAuditado}: Índice Global (${expediente.indiceGlobal.toFixed(2)} pts) inferior a 18.00 pts o asignatura reprobada. Habilitado para optar a otras modalidades si cumple los requisitos.`;

        await db.execute<ResultSetHeader>(
          `
          INSERT INTO historial_aprobaciones (
            solicitud_id, user_id, periodo_id, admin_id,
            promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
            tipo_beca_snapshot, estatus_previo, estatus_nuevo,
            observacion_admin, materias_snapshot_json, indice_global_snapshot,
            fecha_aprobacion, token_verificacion, ip_accion
          ) VALUES (?, ?, ?, 0, ?, ?, 0, 'Bajo', 'BECA A LA EXCELENCIA ACADÉMICA', 'Aprobada', 'Finalizada', ?, ?, ?, NOW(), ?, '127.0.0.1')
          `,
          [
            ultimaSol.id,
            studentId,
            periodoActualId,
            evalEx.promedioTrimestre,
            nuevoSemestre,
            motivoCese,
            materiasJson,
            expediente.indiceGlobal,
            randomUUID(),
          ]
        );

        return {
          processed: true,
          estatus: 'Finalizada',
          becaPerdida: false,
          nuevoSemestre,
          trimestreAuditado,
          reason: 'EXCELENCIA_CESADA_SIN_SANCION',
        };
      }
    } else {
      // Renovación estándar (Aprendizaje, Social Aprendizaje, Discapacidad, Ayudas):
      // Promedio del Trimestre Anterior >= 16 y cero reprobadas (< 10)
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
          promedioParaGuardar,
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

    if (nuevaSolicitudId > 0) {
      await registrarDecisionEnHistorial(
        nuevaSolicitudId,
        estatusFinal,
        0,
        observacionSistema,
        '127.0.0.1',
        'Aprobada',
        departamentoFinal ?? undefined
      );
    }

    return {
      processed: true,
      estatus: estatusFinal,
      becaPerdida: estatusFinal === 'Rechazada',
      nuevoSemestre,
      trimestreAuditado,
    };
  } catch (error) {
    console.error('❌ Error en evaluarYRenovarEstudianteEnCambioPeriodo:', error);
    return { processed: false, reason: 'ERROR_INTERNO' };
  }
}

/**
 * Procesa masivamente al cambiar de periodo:
 * 1. Renovaciones automáticas de becados 'Aprobada' (con semestre < 12) y retorno a beca base si aplica.
 * 2. Actualización de notas y depuración académica de la lista de espera.
 * 3. Rotación automática de Beca a la Excelencia Académica en las 8 carreras (Art. 8 y 32).
 */
export async function procesarTransicionMasivaDePeriodo(
  periodoActualIdInput?: number
): Promise<{
  totalProcesados: number;
  aprobados: number;
  rechazados: number;
  esperaActualizados: number;
}> {
  try {
    const periodoActualId =
      periodoActualIdInput && Number(periodoActualIdInput) > 0
        ? Number(periodoActualIdInput)
        : Number(await obtenerOCrearPeriodoObjetivo());

    if (!periodoActualId) {
      return { totalProcesados: 0, aprobados: 0, rechazados: 0, esperaActualizados: 0 };
    }

    // Sincronizar bloqueo definitivo (Art. 28) para cualquier estudiante con rechazo previo
    await db.execute<ResultSetHeader>(
      `
      UPDATE students st
      SET st.beca_perdida = 1
      WHERE IFNULL(st.beca_perdida, 0) = 0
        AND EXISTS (
          SELECT 1 FROM solicitudes s_rej
          WHERE s_rej.user_id = st.id AND s_rej.estatus = 'Rechazada'
        )
      `
    );

    const candidatos = await queryFresh<UserIdRow[]>(
      `
      SELECT DISTINCT s.user_id
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.periodo_id < ?
        AND IFNULL(st.beca_perdida, 0) = 0
        AND NOT EXISTS (
          SELECT 1 FROM solicitudes s_act
          WHERE s_act.user_id = s.user_id AND s_act.periodo_id = ?
        )
        AND NOT EXISTS (
          SELECT 1 FROM solicitudes s_rej
          WHERE s_rej.user_id = s.user_id AND s_rej.estatus = 'Rechazada'
        )
        AND (
          (
            s.estatus = 'Aprobada'
            AND IFNULL(st.semestre, 1) < 12
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
    let esperaActualizados = 0;

    for (const row of candidatos) {
      const res = await evaluarYRenovarEstudianteEnCambioPeriodo(
        Number(row.user_id),
        periodoActualId
      );
      if (res.processed) {
        if (res.estatus === 'Aprobada') aprobados += 1;
        else if (res.estatus === 'Rechazada') rechazados += 1;
        else esperaActualizados += 1;
      }
    }

    // Ejecutar rotación automática de Beca a la Excelencia Académica para las 8 carreras
    const resExcelencia = await ejecutarRotacionExcelenciaEnPeriodo(periodoActualId, 0);
    if (resExcelencia.success) {
      aprobados += resExcelencia.asignados;
    }

    return {
      totalProcesados: aprobados + rechazados + esperaActualizados,
      aprobados,
      rechazados,
      esperaActualizados,
    };
  } catch (error) {
    console.error('❌ Error en procesarTransicionMasivaDePeriodo:', error);
    return { totalProcesados: 0, aprobados: 0, rechazados: 0, esperaActualizados: 0 };
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

    if (!userId) return { error: "ID de usuario no encontrado." };

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
      return { error: "Debe seleccionar un trimestre válido (1-12)." };
    }

    if (nuevasMaterias.length === 0) {
      return { error: "Debe cargar al menos una asignatura para procesar la renovación." };
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
      return { error: "No hay una solicitud de renovación activa habilitada por el sistema." };
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
          ? "Suspensión definitiva del beneficio (Art. 28): se detectaron materias reprobadas (< 10 pts) en el trimestre."
          : `Suspensión definitiva del beneficio (Art. 26 y 28): promedio trimestral (${nuevoPromedio.toFixed(2)} pts) inferior al mínimo exigido (${minimoExigido.toFixed(2)} pts).`;

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
      0,
      observacion,
      '127.0.0.1',
      'Renovacion',
      estatusFinal === 'Aprobada' ? (solicitudActual.departamento_asignado ?? undefined) : undefined
    );

    revalidatePath('/perfil');
    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/validarBeca');

    return { success: true, estatusAsignado: estatusFinal };
  } catch (error: unknown) {
    console.error("❌ Error en Proceso de Renovación:", error);
    return { error: "Error interno al procesar la carga académica." };
  } finally {
    if (connection) connection.release();
  }
}