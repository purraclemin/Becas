'use server'

import { randomUUID } from 'crypto'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { db, queryFresh } from './db'
import { getSession } from './ActionsSession'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { sincronizarTodosLosRecordsFaltantes } from './ActionsRecordAcademico'
import {
  DEPARTAMENTOS_UNIMAR_OFICIALES,
  PROMEDIO_MINIMO_BECA,
  PROMEDIO_MINIMO_EXCELENCIA,
  SISTEMA_ADMIN_ID,
  TRIMESTRE_MINIMO_EXCELENCIA,
  calcularDatosTrimestreAnterior,
  calcularPromedioAritmetico,
  construirSnapshotDeTrimestre,
  esBecaExcelenciaAcademica,
  evaluarElegibilidadTrimestre,
  normalizarTipoBecaOficial,
  obtenerVariantesTipoBeca,
  type IRegistroRecordAcademico,
} from './RecordAcademicoUtils'

const SEMESTRE_EGRESADO = 13
const OBSERVACION_EGRESADO = 'Acabó su periodo académico'

interface CarreraRow extends RowDataPacket {
  id: number;
  nombre: string;
}

interface CandidatoExcelenciaRow extends RowDataPacket {
  student_id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string | null;
  carrera: string;
  semestre: number;
  indice_global: number | string;
  promedio_ultimo_trim: number | string;
  beca_base_respaldo: string | null;
  departamento_base_respaldo: string | null;
  solicitud_actual_id: number | null;
  tipo_beca_actual: string | null;
  estatus_actual: string | null;
  departamento_actual: string | null;
  reprobadas_ultimo_trim: number;
}

interface HolderExcelenciaActualRow extends RowDataPacket {
  solicitud_id: number;
  student_id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string | null;
  carrera: string;
  semestre: number;
  indice_global: number | string;
  beca_base_respaldo: string | null;
  departamento_base_respaldo: string | null;
}

interface RecordAcademicoTxRow extends RowDataPacket {
  id: number;
  student_id: number;
  pensum_materia_id: number;
  trimestre_cursado: number;
  codigo_materia: string;
  nombre_materia: string;
  unidades_credito: number;
  nota: number | string;
  aprobada: number;
  created_at: Date | string;
}

interface StudentBusquedaSocialRow extends RowDataPacket {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string | null;
  telefono: string | null;
  sexo: string | null;
  fecha_nacimiento: Date | string | null;
  municipio_residencia: string | null;
  carrera: string;
  semestre: number;
  beca_perdida: number;
  solicitud_actual_id: number | null;
  estatus_actual: string | null;
  tipo_beca_actual: string | null;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface PeriodoAnioRow extends RowDataPacket {
  anio: number;
  codigo: string;
  nombre: string;
}

interface ExistingIdRow extends RowDataPacket {
  id: number;
}

interface PensumSeedRow extends RowDataPacket {
  pensum_materia_id: number;
  trimestre_ubicacion: number;
  codigo_materia: string;
  nombre_materia: string;
  unidades_credito: number;
}

export interface CandidatoExcelenciaUI {
  studentId: number;
  nombre: string;
  apellido: string;
  cedula: string;
  email: string;
  carrera: string;
  semestre: number;
  indiceGlobal: number;
  promedioUltimoTrim: number;
  becaActual: string | null;
  estatusActual: string | null;
  becaBaseRespaldo: string | null;
  esGanadorActual: boolean;
}

export interface NominaCarreraExcelenciaUI {
  carreraId: number;
  carrera: string;
  desempateAutomatico: boolean;
  criterioDesempate: string | null;
  titularActual: CandidatoExcelenciaUI | null;
  candidatosTop: CandidatoExcelenciaUI[];
  otrosElegibles: CandidatoExcelenciaUI[];
}

export interface ResultadoRotacionExcelencia {
  success: boolean;
  huboCambios: boolean;
  asignados: number;
  promovidosConRespaldo: number;
  retornadosABecaBase: number;
  rechazadosPorRendimiento: number;
  liberadosSinBase: number;
  message?: string;
  error?: string;
}

export interface InputRegistroConcursoSocial {
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  sexo: 'M' | 'F';
  fecha_nacimiento: string;
  municipio_residencia: string;
  carrera: string;
  promedio_bachillerato: number;
  ue_procedencia: string;
  departamento_asignado: string;
  observaciones_concurso?: string;
}

async function verificarCoordinacion(): Promise<{
  autorizado: boolean;
  adminId: number;
  error?: string;
}> {
  const session = await getSession();
  if (!session || !session.isLoggedIn || !('id' in session) || !session.id) {
    return { autorizado: false, adminId: 0, error: 'Sesión no válida.' };
  }

  const esSecretaria = Boolean(
    'esSecretariaGeneral' in session && session.esSecretariaGeneral
  );

  if (session.role !== 'admin' || esSecretaria) {
    return {
      autorizado: false,
      adminId: 0,
      error: 'Acción exclusiva de Coordinación de Bienestar Estudiantil.',
    };
  }

  return { autorizado: true, adminId: Number(session.id) };
}

function redondearDos(valor: number | string | null | undefined): number {
  const n = Number(valor ?? 0);
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
}

/**
 * Orden determinístico y 100% automático para seleccionar al #1 de cada carrera:
 * 1° Mayor Índice Global Acumulado (>= 18.00)
 * 2° Mayor Promedio del Trimestre Inmediatamente Anterior
 * 3° Mayor trayectoria (trimestre más alto)
 * 4° Continuidad (si ya posee Excelencia aprobada en el periodo vigente)
 * 5° Antigüedad de registro (menor student_id)
 */
function compararCandidatosExcelencia(
  a: CandidatoExcelenciaRow,
  b: CandidatoExcelenciaRow
): number {
  const diffGlobal = redondearDos(b.indice_global) - redondearDos(a.indice_global);
  if (Math.abs(diffGlobal) >= 0.005) return diffGlobal;

  const diffTrim =
    redondearDos(b.promedio_ultimo_trim) - redondearDos(a.promedio_ultimo_trim);
  if (Math.abs(diffTrim) >= 0.005) return diffTrim;

  const diffSem = Number(b.semestre) - Number(a.semestre);
  if (diffSem !== 0) return diffSem;

  const aTitular =
    a.estatus_actual === 'Aprobada' && esBecaExcelenciaAcademica(a.tipo_beca_actual)
      ? 1
      : 0;
  const bTitular =
    b.estatus_actual === 'Aprobada' && esBecaExcelenciaAcademica(b.tipo_beca_actual)
      ? 1
      : 0;
  if (bTitular !== aTitular) return bTitular - aTitular;

  return Number(a.student_id) - Number(b.student_id);
}

/**
 * Lee el récord académico completo usando la MISMA conexión de la transacción activa
 * para garantizar consistencia sin riesgo de bloqueos (deadlocks) en el pool.
 */
async function leerRecordEnTransaccion(
  connection: PoolConnection,
  studentId: number
): Promise<IRegistroRecordAcademico[]> {
  const [rows] = await connection.execute<RecordAcademicoTxRow[]>(
    `
    SELECT
      id,
      student_id,
      pensum_materia_id,
      trimestre_cursado,
      codigo_materia,
      nombre_materia,
      unidades_credito,
      nota,
      aprobada,
      created_at
    FROM record_academico
    WHERE student_id = ?
    ORDER BY trimestre_cursado ASC, codigo_materia ASC
    `,
    [studentId]
  );

  return rows.map((row) => ({
    id: Number(row.id),
    student_id: Number(row.student_id),
    pensum_materia_id: Number(row.pensum_materia_id),
    trimestre_cursado: Number(row.trimestre_cursado),
    codigo_materia: String(row.codigo_materia),
    nombre_materia: String(row.nombre_materia),
    unidades_credito: Number(row.unidades_credito),
    nota: Number(row.nota),
    aprobada: Number(row.aprobada) === 1,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? ''),
  }));
}

/**
 * Desplaza automáticamente a un titular previo de Beca a la Excelencia Académica en el periodo vigente:
 * - Si el titular egresó (`semestre >= 13`) -> cierra su solicitud como `'Finalizada'` con `"Acabó su periodo académico"`.
 * - Si tiene `beca_base_respaldo` (ej. Beca Aprendizaje / Discapacidad):
 *   * Si mantiene todas las materias aprobadas y promedio trimestral >= 16.00 -> retorna automáticamente a su beca base.
 *   * Si reprobó o bajó de 16.00 -> pasa a `'Rechazada'` (`beca_perdida = 1`).
 * - Si NO tiene `beca_base_respaldo`:
 *   * Si reprobó materia (< 10) o bajó de 16.00 en el trimestre anterior -> pasa a `'Rechazada'` (`beca_perdida = 1`).
 *   * Si mantiene >= 16.00 y 0 reprobadas (solo fue superado por un promedio global más alto) -> cierra como `'Finalizada'`
 *     sin sanción (`beca_perdida = 0`), conservando trazabilidad en `solicitudes` y `historial_aprobaciones`.
 */
async function procesarDesplazamientoTitularActual(
  connection: PoolConnection,
  holder: HolderExcelenciaActualRow,
  periodoActualId: number,
  adminId: number,
  motivoDesplazamiento: string
): Promise<'retornado_base' | 'rechazado' | 'liberado_sin_base'> {
  const becaBase = holder.beca_base_respaldo
    ? normalizarTipoBecaOficial(holder.beca_base_respaldo) || holder.beca_base_respaldo
    : null;
  const deptoBase = holder.departamento_base_respaldo ?? null;

  const recordCompleto = await leerRecordEnTransaccion(connection, holder.student_id);
  const semestreHolder = Number(holder.semestre || 2);
  const trimestreAuditado = Math.min(12, Math.max(1, semestreHolder - 1));
  const indiceGlobal =
    recordCompleto.length > 0
      ? calcularPromedioAritmetico(recordCompleto.map((r) => Number(r.nota)))
      : redondearDos(holder.indice_global);

  const snapshot = construirSnapshotDeTrimestre(recordCompleto, trimestreAuditado);
  const materiasJson = JSON.stringify(
    snapshot ?? {
      trimestre: trimestreAuditado,
      materias: [],
      fecha_proceso: new Date().toISOString(),
    }
  );

  // Caso especial: titular egresado (semestre >= 13) -> cierre limpio como 'Finalizada'
  if (semestreHolder >= SEMESTRE_EGRESADO) {
    const datosTrim = calcularDatosTrimestreAnterior(recordCompleto, semestreHolder);
    const promedioTrimFinal =
      datosTrim.promedioTrimestre > 0 ? datosTrim.promedioTrimestre : indiceGlobal;

    await connection.execute<ResultSetHeader>(
      `
      UPDATE solicitudes
      SET estatus = 'Finalizada',
          promedio_notas = ?,
          materias_json = ?,
          departamento_asignado = NULL,
          observaciones_admin = ?,
          fecha_decision = NOW(),
          revisado_por = ?
      WHERE id = ?
      `,
      [
        promedioTrimFinal.toFixed(2),
        materiasJson,
        OBSERVACION_EGRESADO,
        adminId,
        holder.solicitud_id,
      ]
    );

    if (becaBase || deptoBase) {
      await connection.execute<ResultSetHeader>(
        `
        UPDATE students
        SET beca_base_respaldo = NULL,
            departamento_base_respaldo = NULL
        WHERE id = ?
        `,
        [holder.student_id]
      );
    }

    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO historial_aprobaciones (
        solicitud_id, user_id, periodo_id, admin_id,
        promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
        tipo_beca_snapshot, estatus_previo, estatus_nuevo,
        observacion_admin, materias_snapshot_json, indice_global_snapshot,
        fecha_aprobacion, token_verificacion, ip_accion
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'Bajo', 'BECA A LA EXCELENCIA ACADÉMICA', 'Aprobada', 'Finalizada', ?, ?, ?, NOW(), ?, '127.0.0.1')
      `,
      [
        holder.solicitud_id,
        holder.student_id,
        periodoActualId,
        adminId,
        promedioTrimFinal.toFixed(2),
        semestreHolder,
        OBSERVACION_EGRESADO,
        materiasJson,
        indiceGlobal.toFixed(2),
        randomUUID(),
      ]
    );

    return 'liberado_sin_base';
  }

  if (becaBase) {
    const evalBase = evaluarElegibilidadTrimestre(
      trimestreAuditado,
      recordCompleto,
      becaBase,
      'renovacion'
    );

    const cumpleBase = recordCompleto.length > 0 ? evalBase.apto : true;
    const promedioTrim =
      recordCompleto.length > 0 ? evalBase.promedioTrimestre : PROMEDIO_MINIMO_BECA;

    if (cumpleBase) {
      const obsRetorno = `${motivoDesplazamiento} Retorno automático a su beca base (${becaBase}) por mantener promedio trimestral de ${promedioTrim.toFixed(
        2
      )} pts sin asignaturas reprobadas.`;

      await connection.execute<ResultSetHeader>(
        `
        UPDATE solicitudes
        SET tipo_beca = ?,
            estatus = 'Aprobada',
            promedio_notas = ?,
            materias_json = ?,
            departamento_asignado = ?,
            observaciones_admin = ?,
            fecha_decision = NOW(),
            revisado_por = ?
        WHERE id = ?
        `,
        [
          becaBase,
          promedioTrim.toFixed(2),
          materiasJson,
          deptoBase,
          obsRetorno,
          adminId,
          holder.solicitud_id,
        ]
      );

      await connection.execute<ResultSetHeader>(
        `
        UPDATE students
        SET beca_base_respaldo = NULL,
            departamento_base_respaldo = NULL
        WHERE id = ?
        `,
        [holder.student_id]
      );

      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO historial_aprobaciones (
          solicitud_id, user_id, periodo_id, admin_id,
          promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
          tipo_beca_snapshot, estatus_previo, estatus_nuevo,
          observacion_admin, materias_snapshot_json, indice_global_snapshot,
          fecha_aprobacion, token_verificacion, ip_accion
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 'Bajo', ?, 'Aprobada', 'Aprobada', ?, ?, ?, NOW(), ?, '127.0.0.1')
        `,
        [
          holder.solicitud_id,
          holder.student_id,
          periodoActualId,
          adminId,
          promedioTrim.toFixed(2),
          semestreHolder,
          becaBase,
          obsRetorno,
          materiasJson,
          indiceGlobal.toFixed(2),
          randomUUID(),
        ]
      );

      return 'retornado_base';
    }

    const obsRechazo =
      evalBase.motivoRechazo ||
      `${motivoDesplazamiento} No cumple el mantenimiento reglamentario (>= 16.00 pts y 0 reprobadas) para retornar a ${becaBase}.`;

    await connection.execute<ResultSetHeader>(
      `
      UPDATE solicitudes
      SET tipo_beca = ?,
          estatus = 'Rechazada',
          promedio_notas = ?,
          materias_json = ?,
          departamento_asignado = NULL,
          observaciones_admin = ?,
          fecha_decision = NOW(),
          revisado_por = ?
      WHERE id = ?
      `,
      [
        becaBase,
        promedioTrim.toFixed(2),
        materiasJson,
        obsRechazo,
        adminId,
        holder.solicitud_id,
      ]
    );

    await connection.execute<ResultSetHeader>(
      `
      UPDATE students
      SET beca_perdida = 1,
          beca_base_respaldo = NULL,
          departamento_base_respaldo = NULL
      WHERE id = ?
      `,
      [holder.student_id]
    );

    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO historial_aprobaciones (
        solicitud_id, user_id, periodo_id, admin_id,
        promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
        tipo_beca_snapshot, estatus_previo, estatus_nuevo,
        observacion_admin, materias_snapshot_json, indice_global_snapshot,
        fecha_aprobacion, token_verificacion, ip_accion
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'Bajo', ?, 'Aprobada', 'Rechazada', ?, ?, ?, NOW(), ?, '127.0.0.1')
      `,
      [
        holder.solicitud_id,
        holder.student_id,
        periodoActualId,
        adminId,
        promedioTrim.toFixed(2),
        semestreHolder,
        becaBase,
        obsRechazo,
        materiasJson,
        indiceGlobal.toFixed(2),
        randomUUID(),
      ]
    );

    return 'rechazado';
  }

  // Sin beca base: verificar si perdió por bajo rendimiento (< 16 o reprobada) o solo por rotación
  const evalMinimo = evaluarElegibilidadTrimestre(
    trimestreAuditado,
    recordCompleto,
    'AYUDA ECONÓMICA',
    'renovacion'
  );

  if (recordCompleto.length > 0 && !evalMinimo.apto) {
    const obsRechazoSinBase =
      evalMinimo.motivoRechazo ||
      `${motivoDesplazamiento} Incumplimiento académico en el Trimestre ${trimestreAuditado}.`;

    await connection.execute<ResultSetHeader>(
      `
      UPDATE solicitudes
      SET estatus = 'Rechazada',
          promedio_notas = ?,
          materias_json = ?,
          departamento_asignado = NULL,
          observaciones_admin = ?,
          fecha_decision = NOW(),
          revisado_por = ?
      WHERE id = ?
      `,
      [
        evalMinimo.promedioTrimestre.toFixed(2),
        materiasJson,
        obsRechazoSinBase,
        adminId,
        holder.solicitud_id,
      ]
    );

    await connection.execute<ResultSetHeader>(
      `UPDATE students SET beca_perdida = 1 WHERE id = ?`,
      [holder.student_id]
    );

    await connection.execute<ResultSetHeader>(
      `
      INSERT INTO historial_aprobaciones (
        solicitud_id, user_id, periodo_id, admin_id,
        promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
        tipo_beca_snapshot, estatus_previo, estatus_nuevo,
        observacion_admin, materias_snapshot_json, indice_global_snapshot,
        fecha_aprobacion, token_verificacion, ip_accion
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 'Bajo', 'BECA A LA EXCELENCIA ACADÉMICA', 'Aprobada', 'Rechazada', ?, ?, ?, NOW(), ?, '127.0.0.1')
      `,
      [
        holder.solicitud_id,
        holder.student_id,
        periodoActualId,
        adminId,
        evalMinimo.promedioTrimestre.toFixed(2),
        semestreHolder,
        obsRechazoSinBase,
        materiasJson,
        indiceGlobal.toFixed(2),
        randomUUID(),
      ]
    );

    return 'rechazado';
  }

  // Mantuvo buen rendimiento (>= 16 y 0 reprobadas) pero otro estudiante alcanzó mayor Índice Global:
  // marcar como 'Finalizada' sin sanción (beca_perdida = 0) preservando la trazabilidad completa
  const promedioSinSancion =
    recordCompleto.length > 0 ? evalMinimo.promedioTrimestre : indiceGlobal;
  const obsFinalizada = `${motivoDesplazamiento} Finalización sin sanción de Beca a la Excelencia Académica manteniendo promedio trimestral de ${promedioSinSancion.toFixed(
    2
  )} pts sin asignaturas reprobadas.`;

  await connection.execute<ResultSetHeader>(
    `
    UPDATE solicitudes
    SET estatus = 'Finalizada',
        promedio_notas = ?,
        materias_json = ?,
        departamento_asignado = NULL,
        observaciones_admin = ?,
        fecha_decision = NOW(),
        revisado_por = ?
    WHERE id = ?
    `,
    [
      promedioSinSancion.toFixed(2),
      materiasJson,
      obsFinalizada,
      adminId,
      holder.solicitud_id,
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
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 'Bajo', 'BECA A LA EXCELENCIA ACADÉMICA', 'Aprobada', 'Finalizada', ?, ?, ?, NOW(), ?, '127.0.0.1')
    `,
    [
      holder.solicitud_id,
      holder.student_id,
      periodoActualId,
      adminId,
      promedioSinSancion.toFixed(2),
      semestreHolder,
      obsFinalizada,
      materiasJson,
      indiceGlobal.toFixed(2),
      randomUUID(),
    ]
  );

  return 'liberado_sin_base';
}

/**
 * Otorga automáticamente Beca a la Excelencia Académica al ganador #1 de la carrera
 * dentro de la transacción activa. Si ya poseía otra beca aprobada (ej. Beca Aprendizaje),
 * resguarda esa beca original en `students.beca_base_respaldo` y `departamento_base_respaldo`.
 */
async function otorgarExcelenciaAGanador(
  connection: PoolConnection,
  ganador: CandidatoExcelenciaRow,
  periodoActualId: number,
  adminId: number,
  notaDesempate: string | null = null
): Promise<{ asignado: boolean; promovidoConRespaldo: boolean }> {
  const yaEsExcelenciaAprobada =
    ganador.solicitud_actual_id !== null &&
    ganador.estatus_actual === 'Aprobada' &&
    esBecaExcelenciaAcademica(ganador.tipo_beca_actual);

  if (yaEsExcelenciaAprobada) {
    return { asignado: false, promovidoConRespaldo: false };
  }

  const recordCompleto = await leerRecordEnTransaccion(connection, ganador.student_id);
  const semestreGanador = Number(ganador.semestre || 4);
  const trimestreAuditado = Math.min(12, Math.max(1, semestreGanador - 1));

  const datosTrim = calcularDatosTrimestreAnterior(recordCompleto, semestreGanador);
  const promedioTrim =
    datosTrim.promedioTrimestre > 0
      ? datosTrim.promedioTrimestre
      : redondearDos(ganador.promedio_ultimo_trim || ganador.indice_global);
  const indiceGlobalReal =
    recordCompleto.length > 0
      ? calcularPromedioAritmetico(recordCompleto.map((r) => Number(r.nota)))
      : redondearDos(ganador.indice_global);

  const snapshot = construirSnapshotDeTrimestre(recordCompleto, trimestreAuditado);
  const materiasJson = JSON.stringify(
    snapshot ?? {
      trimestre: trimestreAuditado,
      materias: [],
      fecha_proceso: new Date().toISOString(),
    }
  );

  let promovidoConRespaldo = false;
  let textoRespaldo = '';

  const tieneOtraBecaAprobadaActual =
    ganador.solicitud_actual_id !== null &&
    ganador.estatus_actual === 'Aprobada' &&
    ganador.tipo_beca_actual !== null &&
    !esBecaExcelenciaAcademica(ganador.tipo_beca_actual);

  if (tieneOtraBecaAprobadaActual) {
    const becaBaseActual =
      normalizarTipoBecaOficial(ganador.tipo_beca_actual) ||
      String(ganador.tipo_beca_actual);
    const deptoBaseActual = ganador.departamento_actual ?? null;

    if (!ganador.beca_base_respaldo) {
      await connection.execute<ResultSetHeader>(
        `
        UPDATE students
        SET beca_base_respaldo = ?,
            departamento_base_respaldo = ?
        WHERE id = ?
        `,
        [becaBaseActual, deptoBaseActual, ganador.student_id]
      );
    }

    promovidoConRespaldo = true;
    textoRespaldo = ` Se resguarda su beneficio base (${becaBaseActual}) para retorno automático si cambia el ranking.`;
  }

  const detalleDesempate = notaDesempate ? ` (${notaDesempate})` : '';
  const observacion = `Asignación automática de Beca a la Excelencia Académica : mayor Índice Académico Acumulado (${indiceGlobalReal.toFixed(
    2
  )} pts) en ${ganador.carrera}${detalleDesempate}.${textoRespaldo}`;

  let solicitudIdFinal = 0;
  let estatusPrevio = 'Automática';

  if (ganador.solicitud_actual_id !== null) {
    solicitudIdFinal = Number(ganador.solicitud_actual_id);
    estatusPrevio = String(ganador.estatus_actual || 'Pendiente');

    await connection.execute<ResultSetHeader>(
      `
      UPDATE solicitudes
      SET tipo_beca = 'BECA A LA EXCELENCIA ACADÉMICA',
          promedio_notas = ?,
          materias_json = ?,
          estatus = 'Aprobada',
          departamento_asignado = NULL,
          observaciones_admin = ?,
          fecha_decision = NOW(),
          revisado_por = ?
      WHERE id = ?
      `,
      [promedioTrim.toFixed(2), materiasJson, observacion, adminId, solicitudIdFinal]
    );
  } else {
    const [insRes] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO solicitudes (
        user_id, periodo_id, email_institucional, tipo_beca,
        promedio_notas, motivo_solicitud, materias_json, estatus,
        observaciones_admin, departamento_asignado,
        fecha_registro, fecha_decision, revisado_por
      ) VALUES (
        ?, ?, ?, 'BECA A LA EXCELENCIA ACADÉMICA',
        ?, 'Asignación automática por mayor Índice Académico Acumulado de la carrera.',
        ?, 'Aprobada',
        ?, NULL,
        NOW(), NOW(), ?
      )
      `,
      [
        ganador.student_id,
        periodoActualId,
        ganador.email ?? null,
        promedioTrim.toFixed(2),
        materiasJson,
        observacion,
        adminId,
      ]
    );
    solicitudIdFinal = Number(insRes.insertId);
  }

  await connection.execute<ResultSetHeader>(
    `UPDATE students SET ha_tenido_beca = 1 WHERE id = ?`,
    [ganador.student_id]
  );

  await connection.execute<ResultSetHeader>(
    `
    INSERT INTO historial_aprobaciones (
      solicitud_id, user_id, periodo_id, admin_id,
      promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
      tipo_beca_snapshot, estatus_previo, estatus_nuevo,
      observacion_admin, materias_snapshot_json, indice_global_snapshot,
      fecha_aprobacion, token_verificacion, ip_accion
    ) VALUES (?, ?, ?, ?, ?, ?, 0, 'Bajo', 'BECA A LA EXCELENCIA ACADÉMICA', ?, 'Aprobada', ?, ?, ?, NOW(), ?, '127.0.0.1')
    `,
    [
      solicitudIdFinal,
      ganador.student_id,
      periodoActualId,
      adminId,
      promedioTrim.toFixed(2),
      semestreGanador,
      estatusPrevio,
      observacion,
      materiasJson,
      indiceGlobalReal.toFixed(2),
      randomUUID(),
    ]
  );

  return { asignado: true, promovidoConRespaldo };
}

/**
 * Consulta base unificada de elegibles para Beca a la Excelencia Académica en el periodo vigente:
 * - semestre >= 4 y semestre < 13 (excluye egresados)
 * - Índice Global >= 18.00
 * - beca_perdida = 0 y sin ninguna solicitud 'Rechazada'
 * - Cero asignaturas reprobadas (< 10) en el trimestre inmediatamente anterior (semestre - 1)
 */
async function consultarCandidatosElegiblesExcelencia(
  periodoActualId: number
): Promise<CandidatoExcelenciaRow[]> {
  const rows = await queryFresh<CandidatoExcelenciaRow[]>(
    `
    SELECT
      st.id AS student_id,
      st.nombre,
      st.apellido,
      st.cedula,
      st.email,
      st.carrera,
      st.semestre,
      IFNULL(st.indice_global, 0.00) AS indice_global,
      IFNULL((
        SELECT ROUND(AVG(ra_p.nota), 2)
        FROM record_academico ra_p
        WHERE ra_p.student_id = st.id
          AND ra_p.trimestre_cursado = LEAST(12, GREATEST(1, st.semestre - 1))
      ), IFNULL(st.indice_global, 0.00)) AS promedio_ultimo_trim,
      st.beca_base_respaldo,
      st.departamento_base_respaldo,
      s_act.id AS solicitud_actual_id,
      s_act.tipo_beca AS tipo_beca_actual,
      s_act.estatus AS estatus_actual,
      s_act.departamento_asignado AS departamento_actual,
      (
        SELECT COUNT(*)
        FROM record_academico ra
        WHERE ra.student_id = st.id
          AND ra.trimestre_cursado = LEAST(12, GREATEST(1, st.semestre - 1))
          AND (ra.nota < 10 OR ra.aprobada = 0)
      ) AS reprobadas_ultimo_trim
    FROM students st
    LEFT JOIN solicitudes s_act
      ON s_act.user_id = st.id AND s_act.periodo_id = ?
    WHERE st.semestre >= ?
      AND st.semestre < ?
      AND IFNULL(st.beca_perdida, 0) = 0
      AND IFNULL(st.indice_global, 0) >= ?
      AND NOT EXISTS (
        SELECT 1
        FROM solicitudes s_rej
        WHERE s_rej.user_id = st.id
          AND LOWER(TRIM(s_rej.estatus)) IN ('rechazada', 'rechazado')
      )
    `,
    [
      periodoActualId,
      TRIMESTRE_MINIMO_EXCELENCIA,
      SEMESTRE_EGRESADO,
      PROMEDIO_MINIMO_EXCELENCIA,
    ]
  );

  return rows
    .filter((c) => Number(c.reprobadas_ultimo_trim || 0) === 0)
    .sort(compararCandidatosExcelencia);
}

/**
 * Motor 100% automático, determinístico e idempotente de Beca a la Excelencia Académica.
 * - Si las 8 carreras ya están exactamente sincronizadas con su ganador #1, retorna al instante
 *   sin abrir transacción ni escribir en disco.
 * - Si detecta un nuevo #1 (por cambio de periodo, precarga, nuevo aprobado o variación de promedio),
 *   promueve automáticamente al nuevo ganador (resguardando su beca base si tenía otra beca aprobada)
 *   y retorna automáticamente al titular anterior a su beca base si cumple >= 16 y 0 reprobadas,
 *   o lo cierra como 'Finalizada' sin sanción si no tenía beca base.
 */
export async function ejecutarRotacionExcelenciaEnPeriodo(
  periodoIdInput?: number,
  adminIdEjecutor: number = SISTEMA_ADMIN_ID
): Promise<ResultadoRotacionExcelencia> {
  let connection: PoolConnection | undefined;

  try {
    const periodoActualId =
      periodoIdInput && Number(periodoIdInput) > 0
        ? Number(periodoIdInput)
        : Number(await obtenerOCrearPeriodoObjetivo());

    if (!periodoActualId) {
      return {
        success: false,
        huboCambios: false,
        asignados: 0,
        promovidosConRespaldo: 0,
        retornadosABecaBase: 0,
        rechazadosPorRendimiento: 0,
        liberadosSinBase: 0,
        error: 'No hay periodo académico activo.',
      };
    }

    // 1. Verificación ligera antes de sincronizar veto Art. 28 o récords faltantes (fast-path idempotente)
    const [chequeoSyncRows] = await db.execute<
      Array<RowDataPacket & { hay_vetos: number; hay_sin_record: number }>
    >(
      `
      SELECT
        EXISTS (
          SELECT 1
          FROM students st
          WHERE IFNULL(st.beca_perdida, 0) = 0
            AND EXISTS (
              SELECT 1
              FROM solicitudes s_rej
              WHERE s_rej.user_id = st.id
                AND LOWER(TRIM(s_rej.estatus)) IN ('rechazada', 'rechazado')
            )
        ) AS hay_vetos,
        EXISTS (
          SELECT 1
          FROM students st
          JOIN carreras c ON LOWER(TRIM(st.carrera)) = LOWER(TRIM(c.nombre))
          WHERE st.semestre >= ?
            AND st.semestre < 13
            AND IFNULL(st.beca_perdida, 0) = 0
            AND EXISTS (
              SELECT 1
              FROM pensum_materias pm
              WHERE pm.carrera_id = c.id
                AND pm.trimestre_ubicacion = LEAST(12, st.semestre - 1)
            )
            AND NOT EXISTS (
              SELECT 1
              FROM record_academico ra
              WHERE ra.student_id = st.id
                AND ra.trimestre_cursado = LEAST(12, st.semestre - 1)
            )
        ) AS hay_sin_record
      `,
      [TRIMESTRE_MINIMO_EXCELENCIA]
    );

    if (Number(chequeoSyncRows[0]?.hay_vetos ?? 0) === 1) {
      await db.execute<ResultSetHeader>(
        `
        UPDATE students st
        SET st.beca_perdida = 1
        WHERE IFNULL(st.beca_perdida, 0) = 0
          AND EXISTS (
            SELECT 1
            FROM solicitudes s_rej
            WHERE s_rej.user_id = st.id
              AND LOWER(TRIM(s_rej.estatus)) IN ('rechazada', 'rechazado')
          )
        `
      );
    }

    if (Number(chequeoSyncRows[0]?.hay_sin_record ?? 0) === 1) {
      await sincronizarTodosLosRecordsFaltantes(300);
    }

    const variantesExcelencia = obtenerVariantesTipoBeca('BECA A LA EXCELENCIA ACADÉMICA');
    const placeholdersEx = variantesExcelencia.map(() => '?').join(', ');

    const [carreras, elegibles, holdersActuales] = await Promise.all([
      queryFresh<CarreraRow[]>(`SELECT id, nombre FROM carreras ORDER BY nombre ASC`),
      consultarCandidatosElegiblesExcelencia(periodoActualId),
      queryFresh<HolderExcelenciaActualRow[]>(
        `
        SELECT
          s.id AS solicitud_id,
          st.id AS student_id,
          st.nombre,
          st.apellido,
          st.cedula,
          st.email,
          st.carrera,
          st.semestre,
          IFNULL(st.indice_global, 0.00) AS indice_global,
          st.beca_base_respaldo,
          st.departamento_base_respaldo
        FROM solicitudes s
        JOIN students st ON s.user_id = st.id
        WHERE s.periodo_id = ?
          AND LOWER(TRIM(s.estatus)) IN ('aprobada', 'aprobado')
          AND LOWER(TRIM(s.tipo_beca)) IN (${placeholdersEx})
        `,
        [periodoActualId, ...variantesExcelencia]
      ),
    ]);

    // 2. Planificación en memoria y verificación rápida de idempotencia (cero escrituras si todo coincide)
    interface PlanCarrera {
      carrera: string;
      ganador: CandidatoExcelenciaRow | null;
      holdersADesplazar: HolderExcelenciaActualRow[];
      requiereAsignarGanador: boolean;
      notaDesempate: string | null;
    }

    const planesConCambios: PlanCarrera[] = [];

    for (const carreraRow of carreras) {
      const claveCarrera = carreraRow.nombre.trim().toLowerCase();
      const candidatosCarrera = elegibles
        .filter((c) => c.carrera.trim().toLowerCase() === claveCarrera)
        .sort(compararCandidatosExcelencia);
      const holdersCarrera = holdersActuales.filter(
        (h) => h.carrera.trim().toLowerCase() === claveCarrera
      );

      const ganador = candidatosCarrera[0] ?? null;

      if (!ganador) {
        if (holdersCarrera.length > 0) {
          planesConCambios.push({
            carrera: carreraRow.nombre,
            ganador: null,
            holdersADesplazar: holdersCarrera,
            requiereAsignarGanador: false,
            notaDesempate: null,
          });
        }
        continue;
      }

      const holdersADesplazar = holdersCarrera.filter(
        (h) => Number(h.student_id) !== Number(ganador.student_id)
      );
      const yaEsTitular = holdersCarrera.some(
        (h) => Number(h.student_id) === Number(ganador.student_id)
      );

      if (holdersADesplazar.length > 0 || !yaEsTitular) {
        const segundo = candidatosCarrera[1] ?? null;
        let notaDesempate: string | null = null;
        if (
          segundo &&
          Math.abs(
            redondearDos(ganador.indice_global) - redondearDos(segundo.indice_global)
          ) < 0.005
        ) {
          notaDesempate = `desempate automático por prom. trim. ${redondearDos(
            ganador.promedio_ultimo_trim
          ).toFixed(2)} pts / ${ganador.semestre}° trim.`;
        }

        planesConCambios.push({
          carrera: carreraRow.nombre,
          ganador,
          holdersADesplazar,
          requiereAsignarGanador: !yaEsTitular,
          notaDesempate,
        });
      }
    }

    // Fast-path: todas las carreras ya están sincronizadas con su titular #1
    if (planesConCambios.length === 0) {
      return {
        success: true,
        huboCambios: false,
        asignados: 0,
        promovidosConRespaldo: 0,
        retornadosABecaBase: 0,
        rechazadosPorRendimiento: 0,
        liberadosSinBase: 0,
        message: 'Nómina de Excelencia Académica sincronizada al día.',
      };
    }

    let asignados = 0;
    let promovidosConRespaldo = 0;
    let retornadosABecaBase = 0;
    let rechazadosPorRendimiento = 0;
    let liberadosSinBase = 0;

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const plan of planesConCambios) {
        const motivoDesplazamiento = plan.ganador
          ? `Rotación automática de Beca a la Excelencia Académica en ${plan.carrera}: otro estudiante alcanzó un mejor posicionamiento (${redondearDos(
              plan.ganador.indice_global
            ).toFixed(2)} pts).`
          : `Cese automático de Beca a la Excelencia Académica en ${plan.carrera} por dejar de cumplir el umbral mínimo de 18.00 pts o presentar asignatura reprobada.`;

        for (const holder of plan.holdersADesplazar) {
          const resDesp = await procesarDesplazamientoTitularActual(
            connection,
            holder,
            periodoActualId,
            adminIdEjecutor,
            motivoDesplazamiento
          );
          if (resDesp === 'retornado_base') retornadosABecaBase += 1;
          else if (resDesp === 'rechazado') rechazadosPorRendimiento += 1;
          else liberadosSinBase += 1;
        }

        if (plan.ganador && plan.requiereAsignarGanador) {
          const resGanador = await otorgarExcelenciaAGanador(
            connection,
            plan.ganador,
            periodoActualId,
            adminIdEjecutor,
            plan.notaDesempate
          );
          if (resGanador.asignado) asignados += 1;
          if (resGanador.promovidoConRespaldo) promovidosConRespaldo += 1;
        }
      }

      await connection.commit();
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
      connection = undefined;
    }

    return {
      success: true,
      huboCambios: true,
      asignados,
      promovidosConRespaldo,
      retornadosABecaBase,
      rechazadosPorRendimiento,
      liberadosSinBase,
      message: `Sincronización automática completada: ${asignados} otorgada(s), ${promovidosConRespaldo} con beca base resguardada, ${retornadosABecaBase} retornado(s) a su beca base, ${liberadosSinBase} finalizada(s) sin sanción.`,
    };
  } catch (error) {
    console.error('❌ Error en ejecutarRotacionExcelenciaEnPeriodo:', error);
    return {
      success: false,
      huboCambios: false,
      asignados: 0,
      promovidosConRespaldo: 0,
      retornadosABecaBase: 0,
      rechazadosPorRendimiento: 0,
      liberadosSinBase: 0,
      error: 'Error interno al sincronizar la Beca a la Excelencia Académica.',
    };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Consulta la Nómina Automática en vivo de las 8 carreras, garantizando primero
 * que la rotación automática haya sincronizado los beneficiarios aprobados del periodo vigente.
 */
export async function obtenerNominaExcelenciaAcademica(
  periodoIdInput?: number
): Promise<{
  success: boolean;
  periodoCodigo: string;
  periodoNombre: string;
  huboCambios: boolean;
  nomina: NominaCarreraExcelenciaUI[];
  error?: string;
}> {
  try {
    const auth = await verificarCoordinacion();
    if (!auth.autorizado) {
      return {
        success: false,
        periodoCodigo: '',
        periodoNombre: '',
        huboCambios: false,
        nomina: [],
        error: auth.error,
      };
    }

    const periodoActualId =
      periodoIdInput && Number(periodoIdInput) > 0
        ? Number(periodoIdInput)
        : Number(await obtenerOCrearPeriodoObjetivo());

    // Sincronización automática garantizada antes de devolver la vista
    const syncRes = await ejecutarRotacionExcelenciaEnPeriodo(
      periodoActualId,
      SISTEMA_ADMIN_ID
    );

    const [periodoInfoRows, carreras, elegibles] = await Promise.all([
      queryFresh<PeriodoAnioRow[]>(
        `SELECT YEAR(fecha_inicio) AS anio, codigo, nombre FROM periodos_academicos WHERE id = ? LIMIT 1`,
        [periodoActualId]
      ),
      queryFresh<CarreraRow[]>(`SELECT id, nombre FROM carreras ORDER BY nombre ASC`),
      consultarCandidatosElegiblesExcelencia(periodoActualId),
    ]);

    const nomina: NominaCarreraExcelenciaUI[] = carreras.map((carreraRow) => {
      const claveCarrera = carreraRow.nombre.trim().toLowerCase();
      const listaCarrera = elegibles
        .filter((c) => c.carrera.trim().toLowerCase() === claveCarrera)
        .sort(compararCandidatosExcelencia)
        .map<CandidatoExcelenciaUI>((c) => ({
          studentId: Number(c.student_id),
          nombre: c.nombre,
          apellido: c.apellido,
          cedula: c.cedula,
          email: c.email || '',
          carrera: c.carrera,
          semestre: Number(c.semestre),
          indiceGlobal: redondearDos(c.indice_global),
          promedioUltimoTrim: redondearDos(c.promedio_ultimo_trim),
          becaActual: c.tipo_beca_actual
            ? normalizarTipoBecaOficial(c.tipo_beca_actual) || c.tipo_beca_actual
            : null,
          estatusActual: c.estatus_actual,
          becaBaseRespaldo: c.beca_base_respaldo,
          esGanadorActual:
            c.estatus_actual === 'Aprobada' &&
            esBecaExcelenciaAcademica(c.tipo_beca_actual),
        }));

      const titularActual = listaCarrera.find((c) => c.esGanadorActual) ?? null;

      if (listaCarrera.length === 0) {
        return {
          carreraId: Number(carreraRow.id),
          carrera: carreraRow.nombre,
          desempateAutomatico: false,
          criterioDesempate: null,
          titularActual,
          candidatosTop: [],
          otrosElegibles: [],
        };
      }

      const maxIndice = listaCarrera[0].indiceGlobal;
      const empatadosEnGlobal = listaCarrera.filter(
        (c) => Math.abs(c.indiceGlobal - maxIndice) < 0.005
      );
      const desempateAutomatico = empatadosEnGlobal.length > 1;
      const criterioDesempate = desempateAutomatico
        ? `Desempate automático: Prom. Trim. ${listaCarrera[0].promedioUltimoTrim.toFixed(
            2
          )} pts • ${listaCarrera[0].semestre}° Trim.`
        : null;

      return {
        carreraId: Number(carreraRow.id),
        carrera: carreraRow.nombre,
        desempateAutomatico,
        criterioDesempate,
        titularActual,
        candidatosTop: [listaCarrera[0]],
        otrosElegibles: listaCarrera.slice(1),
      };
    });

    return {
      success: true,
      periodoCodigo: periodoInfoRows[0]?.codigo || 'Vigente',
      periodoNombre: periodoInfoRows[0]?.nombre || 'Periodo Actual',
      huboCambios: Boolean(syncRes.huboCambios),
      nomina,
    };
  } catch (error) {
    console.error('❌ Error en obtenerNominaExcelenciaAcademica:', error);
    return {
      success: false,
      periodoCodigo: '',
      periodoNombre: '',
      huboCambios: false,
      nomina: [],
      error: 'No se pudo consultar la nómina de Excelencia Académica.',
    };
  }
}

/**
 * Busca por cédula un estudiante existente antes de registrarlo en el Concurso de Beca Social Aprendizaje.
 */
export async function buscarEstudianteParaConcursoSocial(cedulaInput: string): Promise<{
  success: boolean;
  encontrado: boolean;
  estudiante?: {
    id: number;
    nombre: string;
    apellido: string;
    cedula: string;
    email: string;
    telefono: string;
    sexo: string;
    fecha_nacimiento: string;
    municipio_residencia: string;
    carrera: string;
    semestre: number;
    beca_perdida: boolean;
    yaTieneSolicitudActual: boolean;
    estatusActual: string | null;
    tipoBecaActual: string | null;
  };
  cupos?: {
    nuevosEsteAnio: number;
    maxNuevosAnual: number;
    activosPeriodo: number;
    maxActivosPeriodo: number;
  };
  error?: string;
}> {
  const auth = await verificarCoordinacion();
  if (!auth.autorizado) {
    return { success: false, encontrado: false, error: auth.error };
  }

  try {
    const cedulaLimpia = cedulaInput.replace(/\D/g, '').trim();
    const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());
    const variantesSocial = obtenerVariantesTipoBeca('BECA SOCIAL APRENDIZAJE');
    const placeholdersSoc = variantesSocial.map(() => '?').join(', ');

    const [periodoAnioRows, activosRows] = await Promise.all([
      queryFresh<PeriodoAnioRow[]>(
        `SELECT YEAR(fecha_inicio) AS anio, codigo, nombre FROM periodos_academicos WHERE id = ? LIMIT 1`,
        [periodoActualId]
      ),
      queryFresh<CountRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM solicitudes
        WHERE periodo_id = ?
          AND LOWER(TRIM(tipo_beca)) IN (${placeholdersSoc})
          AND estatus IN ('Aprobada', 'Renovacion', 'Renovación')
        `,
        [periodoActualId, ...variantesSocial]
      ),
    ]);

    const anioActual = Number(periodoAnioRows[0]?.anio || new Date().getFullYear());

    const nuevosAnioRows = await queryFresh<CountRow[]>(
      `
      SELECT COUNT(DISTINCT s.user_id) AS total
      FROM solicitudes s
      JOIN periodos_academicos p ON s.periodo_id = p.id
      WHERE LOWER(TRIM(s.tipo_beca)) IN (${placeholdersSoc})
        AND s.estatus IN ('Aprobada', 'Renovacion', 'Renovación')
        AND YEAR(p.fecha_inicio) = ?
        AND NOT EXISTS (
          SELECT 1
          FROM solicitudes s_prev
          JOIN periodos_academicos p_prev ON s_prev.periodo_id = p_prev.id
          WHERE s_prev.user_id = s.user_id
            AND LOWER(TRIM(s_prev.tipo_beca)) IN (${placeholdersSoc})
            AND s_prev.estatus = 'Aprobada'
            AND YEAR(p_prev.fecha_inicio) < ?
        )
      `,
      [...variantesSocial, anioActual, ...variantesSocial, anioActual]
    );

    const cupos = {
      nuevosEsteAnio: Number(nuevosAnioRows[0]?.total || 0),
      maxNuevosAnual: 10,
      activosPeriodo: Number(activosRows[0]?.total || 0),
      maxActivosPeriodo: 60,
    };

    if (cedulaLimpia.length < 6) {
      return { success: true, encontrado: false, cupos };
    }

    const rows = await queryFresh<StudentBusquedaSocialRow[]>(
      `
      SELECT
        st.id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.email,
        st.telefono,
        st.sexo,
        st.fecha_nacimiento,
        st.municipio_residencia,
        st.carrera,
        st.semestre,
        IFNULL(st.beca_perdida, 0) AS beca_perdida,
        s_act.id AS solicitud_actual_id,
        s_act.estatus AS estatus_actual,
        s_act.tipo_beca AS tipo_beca_actual
      FROM students st
      LEFT JOIN solicitudes s_act
        ON s_act.user_id = st.id AND s_act.periodo_id = ?
      WHERE LOWER(TRIM(st.cedula)) = ?
      LIMIT 1
      `,
      [periodoActualId, cedulaLimpia.toLowerCase()]
    );

    if (rows.length === 0) {
      return { success: true, encontrado: false, cupos };
    }

    const st = rows[0];
    const fechaNacIso = st.fecha_nacimiento
      ? st.fecha_nacimiento instanceof Date
        ? st.fecha_nacimiento.toISOString().split('T')[0]
        : String(st.fecha_nacimiento).split('T')[0]
      : '';

    return {
      success: true,
      encontrado: true,
      cupos,
      estudiante: {
        id: Number(st.id),
        nombre: st.nombre,
        apellido: st.apellido,
        cedula: st.cedula,
        email: st.email || '',
        telefono: st.telefono || '',
        sexo: st.sexo || 'M',
        fecha_nacimiento: fechaNacIso,
        municipio_residencia: st.municipio_residencia || 'García',
        carrera: st.carrera,
        semestre: Number(st.semestre || 1),
        beca_perdida: Number(st.beca_perdida) === 1,
        yaTieneSolicitudActual: st.solicitud_actual_id !== null,
        estatusActual: st.estatus_actual,
        tipoBecaActual: st.tipo_beca_actual,
      },
    };
  } catch (error) {
    console.error('❌ Error en buscarEstudianteParaConcursoSocial:', error);
    return {
      success: false,
      encontrado: false,
      error: 'Error al consultar la cédula del aspirante.',
    };
  }
}

/**
 * Registra directamente a un beneficiario seleccionado en el Concurso Anual de Beca Social Aprendizaje.
 */
export async function registrarBecarioConcursoSocial(
  input: InputRegistroConcursoSocial
): Promise<{
  success: boolean;
  creoUsuario?: boolean;
  claveInicial?: string;
  message?: string;
  error?: string;
}> {
  const auth = await verificarCoordinacion();
  if (!auth.autorizado) {
    return { success: false, error: auth.error };
  }

  const cedula = input.cedula.replace(/\D/g, '').trim();
  const nombre = input.nombre.trim();
  const apellido = input.apellido.trim();
  const email = input.email.trim().toLowerCase();
  const telefono = input.telefono.replace(/\D/g, '').trim() || '04120000000';
  const sexo: 'M' | 'F' = input.sexo === 'F' ? 'F' : 'M';
  const fechaNacimiento = input.fecha_nacimiento.trim() || '2007-01-15';
  const municipio = input.municipio_residencia.trim() || 'García';
  const carrera = input.carrera.trim();
  const promedioBachillerato = Number(input.promedio_bachillerato);
  const ueProcedencia = input.ue_procedencia.trim();
  const departamento = input.departamento_asignado.trim();

  if (cedula.length < 7 || cedula.length > 8) {
    return { success: false, error: 'La cédula debe tener 7 u 8 dígitos.' };
  }
  if (nombre.length < 2 || apellido.length < 2) {
    return { success: false, error: 'Debe ingresar nombre y apellido válidos.' };
  }
  if (!email.endsWith('@unimar.edu.ve')) {
    return { success: false, error: 'El correo debe pertenecer al dominio @unimar.edu.ve.' };
  }
  if (!carrera) {
    return { success: false, error: 'Debe seleccionar la carrera asignada.' };
  }
  if (!Number.isFinite(promedioBachillerato) || promedioBachillerato < 18 || promedioBachillerato > 20) {
    return {
      success: false,
      error: 'La Beca Social Aprendizaje exige promedio de bachillerato entre 18.00 y 20.00 puntos.',
    };
  }
  if (ueProcedencia.length < 3) {
    return { success: false, error: 'Debe indicar la Unidad Educativa Pública de procedencia.' };
  }
  if (!(DEPARTAMENTOS_UNIMAR_OFICIALES as readonly string[]).includes(departamento)) {
    return { success: false, error: 'Debe asignar un departamento institucional válido.' };
  }

  let connection: PoolConnection | undefined;

  try {
    const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());
    const variantesSocial = obtenerVariantesTipoBeca('BECA SOCIAL APRENDIZAJE');
    const placeholdersSoc = variantesSocial.map(() => '?').join(', ');

    const [periodoInfoRows, activosRows] = await Promise.all([
      queryFresh<PeriodoAnioRow[]>(
        `SELECT YEAR(fecha_inicio) AS anio, codigo, nombre FROM periodos_academicos WHERE id = ? LIMIT 1`,
        [periodoActualId]
      ),
      queryFresh<CountRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM solicitudes
        WHERE periodo_id = ?
          AND LOWER(TRIM(tipo_beca)) IN (${placeholdersSoc})
          AND estatus IN ('Aprobada', 'Renovacion', 'Renovación')
        `,
        [periodoActualId, ...variantesSocial]
      ),
    ]);

    const anioActual = Number(periodoInfoRows[0]?.anio || new Date().getFullYear());

    if (Number(activosRows[0]?.total || 0) >= 60) {
      return {
        success: false,
        error: 'Cupo máximo alcanzado: ya existen 60 beneficiarios activos de Beca Social Aprendizaje en este periodo.',
      };
    }

    const nuevosAnioRows = await queryFresh<CountRow[]>(
      `
      SELECT COUNT(DISTINCT s.user_id) AS total
      FROM solicitudes s
      JOIN periodos_academicos p ON s.periodo_id = p.id
      WHERE LOWER(TRIM(s.tipo_beca)) IN (${placeholdersSoc})
        AND s.estatus IN ('Aprobada', 'Renovacion', 'Renovación')
        AND YEAR(p.fecha_inicio) = ?
        AND NOT EXISTS (
          SELECT 1
          FROM solicitudes s_prev
          JOIN periodos_academicos p_prev ON s_prev.periodo_id = p_prev.id
          WHERE s_prev.user_id = s.user_id
            AND LOWER(TRIM(s_prev.tipo_beca)) IN (${placeholdersSoc})
            AND s_prev.estatus = 'Aprobada'
            AND YEAR(p_prev.fecha_inicio) < ?
        )
      `,
      [...variantesSocial, anioActual, ...variantesSocial, anioActual]
    );

    if (Number(nuevosAnioRows[0]?.total || 0) >= 10) {
      return {
        success: false,
        error: `Cupo anual de concurso agotado: ya se registraron 10 nuevas Becas Sociales Aprendizaje en ${anioActual}.`,
      };
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    let studentId = 0;
    let creoUsuario = false;
    let claveInicial: string | undefined = undefined;

    try {
      const [existStRows] = await connection.execute<StudentBusquedaSocialRow[]>(
        `
        SELECT
          st.id, st.nombre, st.apellido, st.cedula, st.email, st.telefono,
          st.sexo, st.fecha_nacimiento, st.municipio_residencia, st.carrera,
          st.semestre, IFNULL(st.beca_perdida, 0) AS beca_perdida,
          s_act.id AS solicitud_actual_id,
          s_act.estatus AS estatus_actual,
          s_act.tipo_beca AS tipo_beca_actual
        FROM students st
        LEFT JOIN solicitudes s_act
          ON s_act.user_id = st.id AND s_act.periodo_id = ?
        WHERE LOWER(TRIM(st.cedula)) = ?
        LIMIT 1 FOR UPDATE
        `,
        [periodoActualId, cedula.toLowerCase()]
      );

      if (existStRows.length > 0) {
        const st = existStRows[0];
        await connection.rollback();
        return {
          success: false,
          error: `Registro bloqueado: la cédula V-${st.cedula} ya existe en la base de datos (${st.nombre} ${st.apellido} — ${st.carrera}). El Concurso Social es exclusivo para nuevos ingresos sin registro previo.`,
        };
      } else {
        const [emailDup] = await connection.execute<ExistingIdRow[]>(
          `SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1`,
          [email]
        );
        if (emailDup.length > 0) {
          await connection.rollback();
          return {
            success: false,
            error: 'El correo institucional ingresado ya pertenece a otro usuario registrado.',
          };
        }

        claveInicial = cedula;
        const hash = await bcrypt.hash(claveInicial, 10);

        const [userIns] = await connection.execute<ResultSetHeader>(
          `INSERT INTO users (email, password, role) VALUES (?, ?, 'estudiante')`,
          [email, hash]
        );
        studentId = Number(userIns.insertId);
        creoUsuario = true;

        await connection.execute<ResultSetHeader>(
          `
          INSERT INTO students (
            id, nombre, apellido, cedula, sexo, fecha_nacimiento,
            telefono, carrera, semestre, indice_global, email,
            municipio_residencia, ha_tenido_beca, beca_perdida
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 1, 0)
          `,
          [
            studentId,
            nombre,
            apellido,
            cedula,
            sexo,
            fechaNacimiento,
            telefono,
            carrera,
            promedioBachillerato.toFixed(2),
            email,
            municipio,
          ]
        );
      }

      const observacionConcurso =
        input.observaciones_concurso && input.observaciones_concurso.trim() !== ''
          ? `Concurso Anual Beca Social Aprendizaje (A: ${input.observaciones_concurso.trim()} | Plantel: ${ueProcedencia} | Prom. Bachillerato: ${promedioBachillerato.toFixed(2)} pts.`
          : `Beneficiario seleccionado por Concurso Anual de Beca Social Aprendizaje, aprobado por Secretaría General y Consejo Superior). Plantel de procedencia: ${ueProcedencia}. Promedio de bachillerato: ${promedioBachillerato.toFixed(2)} pts.`;

      const materiasJson = JSON.stringify({
        trimestre: 1,
        materias: [],
        fecha_proceso: new Date().toISOString(),
        origen_concurso_social: true,
        promedio_bachillerato: promedioBachillerato,
      });

      const [solIns] = await connection.execute<ResultSetHeader>(
        `
        INSERT INTO solicitudes (
          user_id, periodo_id, email_institucional, tipo_beca,
          promedio_notas, motivo_solicitud, materias_json, estatus,
          observaciones_admin, departamento_asignado,
          fecha_registro, fecha_decision, revisado_por
        ) VALUES (
          ?, ?, ?, 'BECA SOCIAL APRENDIZAJE',
          ?, ?, ?, 'Aprobada',
          ?, ?,
          NOW(), NOW(), ?
        )
        `,
        [
          studentId,
          periodoActualId,
          email,
          promedioBachillerato.toFixed(2),
          `Ingreso por Concurso Anual de Beca Social Aprendizaje — ${ueProcedencia}.`,
          materiasJson,
          observacionConcurso,
          departamento,
          auth.adminId,
        ]
      );

      const nuevaSolicitudId = Number(solIns.insertId);

      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO estudios_socioeconomicos (
          student_id, periodo_id, tipo, socio_ue_procedencia,
          socio_nacionalidad, socio_estado_civil, socio_modalidad,
          puntaje, nivel_riesgo, created_at
        ) VALUES (?, ?, 'estudiante', ?, 'Venezolano/a', 'Soltero/a', 'P', 0, 'Bajo', NOW())
        ON DUPLICATE KEY UPDATE
          socio_ue_procedencia = VALUES(socio_ue_procedencia),
          created_at = NOW()
        `,
        [studentId, periodoActualId, ueProcedencia]
      );

      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO historial_aprobaciones (
          solicitud_id, user_id, periodo_id, admin_id,
          promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
          tipo_beca_snapshot, estatus_previo, estatus_nuevo,
          observacion_admin, materias_snapshot_json, indice_global_snapshot,
          fecha_aprobacion, token_verificacion, ip_accion
        ) VALUES (?, ?, ?, ?, ?, 1, 0, 'Bajo', 'BECA SOCIAL APRENDIZAJE', 'Concurso Anual', 'Aprobada', ?, ?, ?, NOW(), ?, '127.0.0.1')
        `,
        [
          nuevaSolicitudId,
          studentId,
          periodoActualId,
          auth.adminId,
          promedioBachillerato.toFixed(2),
          observacionConcurso,
          materiasJson,
          promedioBachillerato.toFixed(2),
          randomUUID(),
        ]
      );

      await connection.commit();
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
      connection = undefined;
    }

    await ejecutarRotacionExcelenciaEnPeriodo(periodoActualId, SISTEMA_ADMIN_ID);

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');
    revalidatePath('/perfil');

    return {
      success: true,
      creoUsuario,
      claveInicial,
      message: creoUsuario
        ? `Beneficiario ${nombre} ${apellido} registrado y aprobado en Beca Social Aprendizaje. Usuario creado (${email} / clave inicial: ${claveInicial}).`
        : `Beneficiario ${nombre} ${apellido} vinculado y aprobado directamente en Beca Social Aprendizaje.`,
    };
  } catch (error) {
    console.error('❌ Error en registrarBecarioConcursoSocial:', error);
    return {
      success: false,
      error: 'Error interno al registrar el beneficiario del concurso social.',
    };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Precarga 24 estudiantes élite (3 por cada una de las 8 carreras, varios con beca base aprobada)
 * y ejecuta de inmediato la sincronización automática de Beca a la Excelencia Académica.
 */
export async function precargarEstudiantesExcelencia(): Promise<{
  success: boolean;
  creados: number;
  message?: string;
  error?: string;
}> {
  const auth = await verificarCoordinacion();
  if (!auth.autorizado) {
    return { success: false, creados: 0, error: auth.error };
  }

  let connection: PoolConnection | undefined;

  try {
    const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());
    const carreras = await queryFresh<CarreraRow[]>(
      `SELECT id, nombre FROM carreras ORDER BY id ASC`
    );

    if (carreras.length === 0) {
      return { success: false, creados: 0, error: 'No existen carreras registradas en la base de datos.' };
    }

    const nombresEjemplo = [
      'Valentina', 'Santiago', 'Camila', 'Sebastián', 'Sofía', 'Mateo',
      'Isabella', 'Alejandro', 'Mariana', 'Diego', 'Gabriela', 'Andrés',
      'Lucía', 'Daniel', 'Victoria', 'Carlos', 'Andrea', 'Fernando',
      'Paula', 'Ricardo', 'Daniela', 'Luis', 'Natalia', 'Miguel',
    ];
    const apellidosEjemplo = [
      'Salazar', 'Marcano', 'Velásquez', 'Quijada', 'Rodríguez', 'Mendoza',
      'Fermín', 'Lárez', 'Cedeño', 'Brito', 'Rojas', 'Gómez',
      'Hernández', 'Martínez', 'Caraballo', 'Mata', 'Ramos', 'Silva',
      'Díaz', 'Patiño', 'Guerra', 'Millán', 'Vásquez', 'Navarro',
    ];
    const municipios = [
      'Maneiro', 'Mariño', 'García', 'Arismendi', 'Gómez', 'Díaz', 'Marcano', 'Antolín del Campo',
    ];
    const passwordHash =
      '$2b$10$3o3FgCxBEZsl2sU3Qgy/seA5CBzAwc8LHYLkMd9Mt6J0qAnr8AhMi';

    let creados = 0;

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (let cIdx = 0; cIdx < carreras.length; cIdx++) {
        const carrera = carreras[cIdx];

        const [pensumCarrera] = await connection.execute<PensumSeedRow[]>(
          `
          SELECT
            MIN(id) AS pensum_materia_id,
            trimestre_ubicacion,
            codigo_materia,
            MIN(nombre_materia) AS nombre_materia,
            MAX(IFNULL(unidades_credito, 3)) AS unidades_credito
          FROM pensum_materias
          WHERE carrera_id = ?
            AND trimestre_ubicacion <= 8
          GROUP BY trimestre_ubicacion, codigo_materia
          ORDER BY trimestre_ubicacion ASC, codigo_materia ASC
          `,
          [carrera.id]
        );

        const perfiles = [
          {
            semestre: 6 + (cIdx % 3),
            poolNotas: [19, 19, 20, 19, 20],
            becaInicial: cIdx % 2 === 0 ? 'BECA APRENDIZAJE' : 'BECA POR DISCAPACIDAD',
            deptoInicial: cIdx % 2 === 0 ? 'Bienestar Estudiantil' : 'Biblioteca',
          },
          {
            semestre: 5 + (cIdx % 3),
            poolNotas: [18, 19, 19, 18, 19],
            becaInicial: 'BECA APRENDIZAJE',
            deptoInicial: 'Control de Estudios',
          },
          {
            semestre: 4 + (cIdx % 3),
            poolNotas: [18, 18, 19, 18, 18],
            becaInicial: null,
            deptoInicial: null,
          },
        ];

        for (let slot = 0; slot < perfiles.length; slot++) {
          const perfil = perfiles[slot];
          const globalIdx = cIdx * 3 + slot;
          const cedula = String(29800000 + (cIdx + 1) * 10 + (slot + 1));
          const email = `excelencia_c${carrera.id}_${slot + 1}@unimar.edu.ve`;

          const [yaExiste] = await connection.execute<ExistingIdRow[]>(
            `SELECT id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1`,
            [email]
          );
          if (yaExiste.length > 0) continue;

          const nombre = nombresEjemplo[globalIdx % nombresEjemplo.length];
          const apellido = apellidosEjemplo[globalIdx % apellidosEjemplo.length];
          const sexo = globalIdx % 2 === 0 ? 'F' : 'M';
          const municipio = municipios[(cIdx + slot) % municipios.length];

          const [userIns] = await connection.execute<ResultSetHeader>(
            `INSERT INTO users (email, password, role) VALUES (?, ?, 'estudiante')`,
            [email, passwordHash]
          );
          const studentId = Number(userIns.insertId);

          const materiasCursadas = pensumCarrera.filter(
            (m) => Number(m.trimestre_ubicacion) < perfil.semestre
          );

          let sumaTotal = 0;
          let sumaUltimoTrim = 0;
          let countUltimoTrim = 0;
          const ultimoTrim = Math.max(1, perfil.semestre - 1);
          const materiasUltimoJson: Array<{
            codigo: string;
            nombre: string;
            creditos: number;
            nota: number;
          }> = [];

          const recordValues: Array<number | string> = [];
          const recordPlaceholders: string[] = [];

          materiasCursadas.forEach((m, mIdx) => {
            const nota = perfil.poolNotas[(mIdx + cIdx + slot) % perfil.poolNotas.length];
            sumaTotal += nota;
            if (Number(m.trimestre_ubicacion) === ultimoTrim) {
              sumaUltimoTrim += nota;
              countUltimoTrim += 1;
              materiasUltimoJson.push({
                codigo: m.codigo_materia,
                nombre: m.nombre_materia,
                creditos: Number(m.unidades_credito || 3),
                nota,
              });
            }
            recordPlaceholders.push('(?, ?, ?, ?, ?, ?, ?, 1)');
            recordValues.push(
              studentId,
              m.pensum_materia_id,
              m.trimestre_ubicacion,
              m.codigo_materia,
              m.nombre_materia,
              m.unidades_credito,
              nota
            );
          });

          const indiceGlobal =
            materiasCursadas.length > 0
              ? Number((sumaTotal / materiasCursadas.length).toFixed(2))
              : Number((19.5 - slot * 0.4).toFixed(2));

          const promedioUltimoTrim =
            countUltimoTrim > 0
              ? Number((sumaUltimoTrim / countUltimoTrim).toFixed(2))
              : indiceGlobal;

          await connection.execute<ResultSetHeader>(
            `
            INSERT INTO students (
              id, nombre, apellido, cedula, sexo, fecha_nacimiento,
              telefono, carrera, semestre, indice_global, email,
              municipio_residencia, ha_tenido_beca, beca_perdida
            ) VALUES (?, ?, ?, ?, ?, '2004-05-12', '04125550000', ?, ?, ?, ?, ?, ?, 0)
            `,
            [
              studentId,
              nombre,
              apellido,
              cedula,
              sexo,
              carrera.nombre,
              perfil.semestre,
              indiceGlobal.toFixed(2),
              email,
              municipio,
              perfil.becaInicial ? 1 : 0,
            ]
          );

          if (recordPlaceholders.length > 0) {
            await connection.execute<ResultSetHeader>(
              `
              INSERT IGNORE INTO record_academico (
                student_id, pensum_materia_id, trimestre_cursado,
                codigo_materia, nombre_materia, unidades_credito, nota, aprobada
              ) VALUES ${recordPlaceholders.join(', ')}
              `,
              recordValues
            );
          }

          if (perfil.becaInicial) {
            const materiasJsonStr = JSON.stringify({
              trimestre: ultimoTrim,
              materias: materiasUltimoJson,
              fecha_proceso: new Date().toISOString(),
            });

            await connection.execute<ResultSetHeader>(
              `
              INSERT INTO solicitudes (
                user_id, periodo_id, email_institucional, tipo_beca,
                promedio_notas, motivo_solicitud, materias_json, estatus,
                observaciones_admin, departamento_asignado,
                fecha_registro, fecha_decision, revisado_por
              ) VALUES (
                ?, ?, ?, ?,
                ?, 'Beca base precargada para validación de promoción y retorno de Excelencia Académica.',
                ?, 'Aprobada',
                'Beca base activa de prueba.', ?,
                NOW(), NOW(), ?
              )
              `,
              [
                studentId,
                periodoActualId,
                email,
                perfil.becaInicial,
                promedioUltimoTrim.toFixed(2),
                materiasJsonStr,
                perfil.deptoInicial,
                auth.adminId,
              ]
            );
          }

          creados += 1;
        }
      }

      await connection.commit();
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
      connection = undefined;
    }

    // Sincronización automática inmediata tras precarga (sin pasos manuales)
    const resRot = await ejecutarRotacionExcelenciaEnPeriodo(
      periodoActualId,
      SISTEMA_ADMIN_ID
    );

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');

    return {
      success: true,
      creados,
      message:
        creados > 0
          ? `Se precargaron ${creados} estudiantes élite (clave: 123456) y la Nómina Automática asignó de inmediato ${resRot.asignados} Beca(s) a la Excelencia Académica (${resRot.promovidosConRespaldo} con beca base resguardada).`
          : 'Los 24 estudiantes élite ya estaban precargados y la Nómina Automática se encuentra sincronizada.',
    };
  } catch (error) {
    console.error('❌ Error en precargarEstudiantesExcelencia:', error);
    return {
      success: false,
      creados: 0,
      error: 'Error interno al precargar los estudiantes élite.',
    };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Elimina únicamente los estudiantes precargados de Excelencia (`excelencia_c%@unimar.edu.ve`)
 * y vuelve a sincronizar automáticamente la nómina con los estudiantes restantes.
 */
export async function limpiarEstudiantesExcelencia(): Promise<{
  success: boolean;
  eliminados: number;
  message?: string;
  error?: string;
}> {
  const auth = await verificarCoordinacion();
  if (!auth.autorizado) {
    return { success: false, eliminados: 0, error: auth.error };
  }

  let connection: PoolConnection | undefined;

  try {
    const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());
    connection = await db.getConnection();
    await connection.beginTransaction();

    let eliminados = 0;

    try {
      const [rows] = await connection.execute<ExistingIdRow[]>(
        `SELECT id FROM users WHERE LOWER(email) LIKE 'excelencia_c%@unimar.edu.ve'`
      );
      const ids = rows.map((r) => Number(r.id));

      if (ids.length > 0) {
        const placeholders = ids.map(() => '?').join(',');

        await connection.execute<ResultSetHeader>(
          `DELETE FROM historial_aprobaciones WHERE user_id IN (${placeholders})`,
          ids
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM estudios_socioeconomicos WHERE student_id IN (${placeholders})`,
          ids
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM record_academico WHERE student_id IN (${placeholders})`,
          ids
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM solicitudes WHERE user_id IN (${placeholders})`,
          ids
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM students WHERE id IN (${placeholders})`,
          ids
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM users WHERE id IN (${placeholders})`,
          ids
        );
        eliminados = ids.length;
      }

      await connection.commit();
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
      connection = undefined;
    }

    // Recalcular automáticamente la nómina con los estudiantes que permanecen en la base de datos
    await ejecutarRotacionExcelenciaEnPeriodo(periodoActualId, SISTEMA_ADMIN_ID);

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');

    return {
      success: true,
      eliminados,
      message:
        eliminados > 0
          ? `Se eliminaron ${eliminados} estudiantes élite y se resincronizó automáticamente la Nómina de Excelencia.`
          : 'No hay estudiantes élite de prueba para eliminar.',
    };
  } catch (error) {
    console.error('❌ Error en limpiarEstudiantesExcelencia:', error);
    return {
      success: false,
      eliminados: 0,
      error: 'Error interno al limpiar estudiantes élite de prueba.',
    };
  } finally {
    if (connection) connection.release();
  }
}