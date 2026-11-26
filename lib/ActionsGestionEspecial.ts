'use server'

import { randomUUID } from 'crypto'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { db, queryFresh } from './db'
import { getSession } from './ActionsSession'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'
import {
  DEPARTAMENTOS_UNIMAR_OFICIALES,
  PROMEDIO_MINIMO_EXCELENCIA,
  TRIMESTRE_MINIMO_EXCELENCIA,
  calcularDatosTrimestreAnterior,
  construirSnapshotDeTrimestre,
  esBecaExcelenciaAcademica,
  evaluarElegibilidadTrimestre,
  normalizarTipoBecaOficial,
  obtenerVariantesTipoBeca,
} from './RecordAcademicoUtils'

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
  carrera: string;
  semestre: number;
  beca_base_respaldo: string | null;
  departamento_base_respaldo: string | null;
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
  becaActual: string | null;
  estatusActual: string | null;
  becaBaseRespaldo: string | null;
  esGanadorActual: boolean;
}

export interface NominaCarreraExcelenciaUI {
  carreraId: number;
  carrera: string;
  empateTecnico: boolean;
  titularActual: CandidatoExcelenciaUI | null;
  candidatosTop: CandidatoExcelenciaUI[];
  otrosElegibles: CandidatoExcelenciaUI[];
}

export interface ResultadoRotacionExcelencia {
  success: boolean;
  asignados: number;
  promovidosConRespaldo: number;
  retornadosABecaBase: number;
  liberadosSinBase: number;
  empatesPendientes: number;
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
 * Desplaza a un titular previo de Beca a la Excelencia Académica en el periodo vigente:
 * - Si tiene beca_base_respaldo: audita su trimestre anterior (>= 16 y 0 reprobadas) y lo devuelve
 *   automáticamente a su beca original (o lo rechaza por Art. 26 si bajó de 16 / reprobó).
 * - Si NO tiene beca_base_respaldo: libera la plaza de Excelencia sin aplicar sanción ni beca_perdida.
 */
async function procesarDesplazamientoTitularActual(
  connection: PoolConnection,
  holder: HolderExcelenciaActualRow,
  periodoActualId: number,
  adminId: number,
  motivoDesplazamiento: string
): Promise<'retornado_base' | 'rechazado_base' | 'liberado_sin_base'> {
  const becaBase = holder.beca_base_respaldo
    ? normalizarTipoBecaOficial(holder.beca_base_respaldo) || holder.beca_base_respaldo
    : null;
  const deptoBase = holder.departamento_base_respaldo ?? null;

  if (becaBase) {
    const recordRes = await sincronizarYObtenerRecordAcademico(
      holder.student_id,
      undefined,
      becaBase
    );
    const expediente = recordRes.success ? recordRes.data : null;
    const trimestreAuditado = Math.max(1, Number(holder.semestre || 2) - 1);

    const evalBase = expediente
      ? evaluarElegibilidadTrimestre(
          trimestreAuditado,
          expediente.recordCompleto,
          becaBase,
          'renovacion'
        )
      : null;

    const cumpleBase = evalBase ? evalBase.apto : true;
    const promedioTrim = evalBase ? evalBase.promedioTrimestre : 16;
    const indiceGlobal = expediente ? expediente.indiceGlobal : 16;

    const snapshot = expediente
      ? construirSnapshotDeTrimestre(expediente.recordCompleto, trimestreAuditado)
      : null;
    const materiasJson = JSON.stringify(
      snapshot ?? {
        trimestre: trimestreAuditado,
        materias: [],
        fecha_proceso: new Date().toISOString(),
      }
    );

    if (cumpleBase) {
      const obsRetorno = `${motivoDesplazamiento} Retorno automático a su beca base (${becaBase}) por mantener promedio trimestral de ${promedioTrim.toFixed(2)} pts sin asignaturas reprobadas.`;

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
          promedioTrim,
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
          promedioTrim,
          holder.semestre,
          becaBase,
          obsRetorno,
          materiasJson,
          indiceGlobal,
          randomUUID(),
        ]
      );

      return 'retornado_base';
    }

    const obsRechazo =
      evalBase?.motivoRechazo ||
      `${motivoDesplazamiento} No cumple el mantenimiento reglamentario para retornar a ${becaBase}.`;

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
        promedioTrim,
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
        promedioTrim,
        holder.semestre,
        becaBase,
        obsRechazo,
        materiasJson,
        indiceGlobal,
        randomUUID(),
      ]
    );

    return 'rechazado_base';
  }

  // Sin beca base: liberar plaza sin sanción (beca_perdida permanece en 0)
  await connection.execute<ResultSetHeader>(
    `DELETE FROM historial_aprobaciones WHERE solicitud_id = ? AND periodo_id = ?`,
    [holder.solicitud_id, periodoActualId]
  );

  await connection.execute<ResultSetHeader>(
    `DELETE FROM solicitudes WHERE id = ?`,
    [holder.solicitud_id]
  );

  return 'liberado_sin_base';
}

/**
 * Otorga Beca a la Excelencia Académica a un ganador específico dentro de una transacción abierta.
 * Si ya poseía una beca aprobada (ej. Discapacidad o Aprendizaje), la respalda en students.beca_base_respaldo.
 */
async function otorgarExcelenciaAGanador(
  connection: PoolConnection,
  ganador: CandidatoExcelenciaRow,
  periodoActualId: number,
  adminId: number,
  esResolucionEmpate: boolean = false
): Promise<{ asignado: boolean; promovidoConRespaldo: boolean }> {
  const yaEsExcelenciaAprobada =
    ganador.solicitud_actual_id !== null &&
    ganador.estatus_actual === 'Aprobada' &&
    esBecaExcelenciaAcademica(ganador.tipo_beca_actual);

  if (yaEsExcelenciaAprobada) {
    return { asignado: false, promovidoConRespaldo: false };
  }

  const recordRes = await sincronizarYObtenerRecordAcademico(
    ganador.student_id,
    undefined,
    'BECA A LA EXCELENCIA ACADÉMICA'
  );
  const expediente = recordRes.success ? recordRes.data : null;
  const trimestreAuditado = Math.max(1, Number(ganador.semestre || 4) - 1);

  const datosTrim = expediente
    ? calcularDatosTrimestreAnterior(expediente.recordCompleto, Number(ganador.semestre || 4))
    : null;
  const promedioTrim = datosTrim && datosTrim.promedioTrimestre > 0
    ? datosTrim.promedioTrimestre
    : redondearDos(ganador.indice_global);
  const indiceGlobalReal = expediente && expediente.indiceGlobal > 0
    ? expediente.indiceGlobal
    : redondearDos(ganador.indice_global);

  const snapshot = expediente
    ? construirSnapshotDeTrimestre(expediente.recordCompleto, trimestreAuditado)
    : null;
  const materiasJson = JSON.stringify(
    snapshot ?? {
      trimestre: trimestreAuditado,
      materias: [],
      fecha_proceso: new Date().toISOString(),
    }
  );

  let promovidoConRespaldo = false;
  let textoRespaldo = '';

  // Si ya tenía otra beca aprobada en el periodo actual (ej. Discapacidad), resguardarla en beca_base_respaldo
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
    textoRespaldo = ` Se resguarda su beneficio base (${becaBaseActual}) en caso de rotación futura.`;
  }

  const observacion = esResolucionEmpate
    ? `Otorgamiento de Beca a la Excelencia Académica (Art. 8 — resolución de empate técnico) con Índice Global de ${indiceGlobalReal.toFixed(2)} pts en ${ganador.carrera}.${textoRespaldo}`
    : `Asignación automática de Beca a la Excelencia Académica (Art. 8 y 32): mayor Índice Académico Acumulado (${indiceGlobalReal.toFixed(2)} pts) en ${ganador.carrera}.${textoRespaldo}`;

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
      [promedioTrim, materiasJson, observacion, adminId, solicitudIdFinal]
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
        ?, 'Asignación automática por mayor Índice Académico Acumulado de la carrera (Art. 8 y 32).',
        ?, 'Aprobada',
        ?, NULL,
        NOW(), NOW(), ?
      )
      `,
      [
        ganador.student_id,
        periodoActualId,
        ganador.email ?? null,
        promedioTrim,
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
      promedioTrim,
      ganador.semestre,
      estatusPrevio,
      observacion,
      materiasJson,
      indiceGlobalReal,
      randomUUID(),
    ]
  );

  return { asignado: true, promovidoConRespaldo };
}

/**
 * Consulta la nómina en vivo de Beca a la Excelencia Académica por las 8 carreras (Art. 8 y 32).
 * Evalúa estrictamente: semestre >= 4, Índice Global >= 18.00, beca_perdida = 0 y cero reprobadas (< 10)
 * en el trimestre inmediatamente anterior.
 */
export async function obtenerNominaExcelenciaAcademica(
  periodoIdInput?: number
): Promise<{
  success: boolean;
  periodoCodigo: string;
  periodoNombre: string;
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
        nomina: [],
        error: auth.error,
      };
    }

    const periodoActualId =
      periodoIdInput && Number(periodoIdInput) > 0
        ? Number(periodoIdInput)
        : Number(await obtenerOCrearPeriodoObjetivo());

    const [periodoInfoRows, carreras, candidatos] = await Promise.all([
      queryFresh<PeriodoAnioRow[]>(
        `SELECT YEAR(fecha_inicio) AS anio, codigo, nombre FROM periodos_academicos WHERE id = ? LIMIT 1`,
        [periodoActualId]
      ),
      queryFresh<CarreraRow[]>(`SELECT id, nombre FROM carreras ORDER BY nombre ASC`),
      queryFresh<CandidatoExcelenciaRow[]>(
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
              AND ra.trimestre_cursado = GREATEST(1, st.semestre - 1)
              AND (ra.nota < 10 OR ra.aprobada = 0)
          ) AS reprobadas_ultimo_trim
        FROM students st
        LEFT JOIN solicitudes s_act
          ON s_act.user_id = st.id AND s_act.periodo_id = ?
        WHERE st.semestre >= ?
          AND IFNULL(st.beca_perdida, 0) = 0
          AND IFNULL(st.indice_global, 0) >= ?
        ORDER BY st.indice_global DESC, st.semestre DESC, st.id ASC
        `,
        [periodoActualId, TRIMESTRE_MINIMO_EXCELENCIA, PROMEDIO_MINIMO_EXCELENCIA]
      ),
    ]);

    const elegiblesLimpios = candidatos.filter(
      (c) => Number(c.reprobadas_ultimo_trim || 0) === 0
    );

    const nomina: NominaCarreraExcelenciaUI[] = carreras.map((carreraRow) => {
      const claveCarrera = carreraRow.nombre.trim().toLowerCase();
      const listaCarrera = elegiblesLimpios
        .filter((c) => c.carrera.trim().toLowerCase() === claveCarrera)
        .map<CandidatoExcelenciaUI>((c) => ({
          studentId: Number(c.student_id),
          nombre: c.nombre,
          apellido: c.apellido,
          cedula: c.cedula,
          email: c.email || '',
          carrera: c.carrera,
          semestre: Number(c.semestre),
          indiceGlobal: redondearDos(c.indice_global),
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
          empateTecnico: false,
          titularActual,
          candidatosTop: [],
          otrosElegibles: [],
        };
      }

      const maxIndice = listaCarrera[0].indiceGlobal;
      const candidatosTop = listaCarrera.filter(
        (c) => Math.abs(c.indiceGlobal - maxIndice) < 0.005
      );
      const otrosElegibles = listaCarrera.filter(
        (c) => Math.abs(c.indiceGlobal - maxIndice) >= 0.005
      );

      return {
        carreraId: Number(carreraRow.id),
        carrera: carreraRow.nombre,
        empateTecnico: candidatosTop.length > 1,
        titularActual,
        candidatosTop,
        otrosElegibles,
      };
    });

    return {
      success: true,
      periodoCodigo: periodoInfoRows[0]?.codigo || 'Vigente',
      periodoNombre: periodoInfoRows[0]?.nombre || 'Periodo Actual',
      nomina,
    };
  } catch (error) {
    console.error('❌ Error en obtenerNominaExcelenciaAcademica:', error);
    return {
      success: false,
      periodoCodigo: '',
      periodoNombre: '',
      nomina: [],
      error: 'No se pudo consultar la nómina de Excelencia Académica.',
    };
  }
}

/**
 * Motor determinístico e idempotente de rotación automática de Beca a la Excelencia Académica
 * para las 8 carreras en el periodo vigente (invocable en transición de periodo o por Coordinación).
 */
export async function ejecutarRotacionExcelenciaEnPeriodo(
  periodoIdInput?: number,
  adminIdEjecutor: number = 0
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
        asignados: 0,
        promovidosConRespaldo: 0,
        retornadosABecaBase: 0,
        liberadosSinBase: 0,
        empatesPendientes: 0,
        error: 'No hay periodo académico activo.',
      };
    }

    const variantesExcelencia = obtenerVariantesTipoBeca('BECA A LA EXCELENCIA ACADÉMICA');
    const placeholdersEx = variantesExcelencia.map(() => '?').join(', ');

    const [carreras, candidatosRaw, holdersActuales] = await Promise.all([
      queryFresh<CarreraRow[]>(`SELECT id, nombre FROM carreras ORDER BY nombre ASC`),
      queryFresh<CandidatoExcelenciaRow[]>(
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
              AND ra.trimestre_cursado = GREATEST(1, st.semestre - 1)
              AND (ra.nota < 10 OR ra.aprobada = 0)
          ) AS reprobadas_ultimo_trim
        FROM students st
        LEFT JOIN solicitudes s_act
          ON s_act.user_id = st.id AND s_act.periodo_id = ?
        WHERE st.semestre >= ?
          AND IFNULL(st.beca_perdida, 0) = 0
          AND IFNULL(st.indice_global, 0) >= ?
        ORDER BY st.indice_global DESC, st.semestre DESC, st.id ASC
        `,
        [periodoActualId, TRIMESTRE_MINIMO_EXCELENCIA, PROMEDIO_MINIMO_EXCELENCIA]
      ),
      queryFresh<HolderExcelenciaActualRow[]>(
        `
        SELECT
          s.id AS solicitud_id,
          st.id AS student_id,
          st.nombre,
          st.apellido,
          st.cedula,
          st.carrera,
          st.semestre,
          st.beca_base_respaldo,
          st.departamento_base_respaldo
        FROM solicitudes s
        JOIN students st ON s.user_id = st.id
        WHERE s.periodo_id = ?
          AND s.estatus = 'Aprobada'
          AND LOWER(TRIM(s.tipo_beca)) IN (${placeholdersEx})
        `,
        [periodoActualId, ...variantesExcelencia]
      ),
    ]);

    const elegibles = candidatosRaw.filter(
      (c) => Number(c.reprobadas_ultimo_trim || 0) === 0
    );

    let asignados = 0;
    let promovidosConRespaldo = 0;
    let retornadosABecaBase = 0;
    let liberadosSinBase = 0;
    let empatesPendientes = 0;

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const carreraRow of carreras) {
        const claveCarrera = carreraRow.nombre.trim().toLowerCase();
        const candidatosCarrera = elegibles.filter(
          (c) => c.carrera.trim().toLowerCase() === claveCarrera
        );
        const holdersCarrera = holdersActuales.filter(
          (h) => h.carrera.trim().toLowerCase() === claveCarrera
        );

        if (candidatosCarrera.length === 0) {
          // Ningún estudiante califica >= 18 en esta carrera: desplazar titular previo si existía
          for (const holder of holdersCarrera) {
            const resDesp = await procesarDesplazamientoTitularActual(
              connection,
              holder,
              periodoActualId,
              adminIdEjecutor,
              'Cese de Beca a la Excelencia Académica por no cumplir requisito mínimo de 18.00 pts.'
            );
            if (resDesp === 'retornado_base') retornadosABecaBase += 1;
            else if (resDesp === 'liberado_sin_base') liberadosSinBase += 1;
          }
          continue;
        }

        const maxIndice = redondearDos(candidatosCarrera[0].indice_global);
        const empatados = candidatosCarrera.filter(
          (c) => Math.abs(redondearDos(c.indice_global) - maxIndice) < 0.005
        );

        if (empatados.length > 1) {
          // Si ya hay un titular entre los empatados, se respeta hasta que Coordinación/Consejo resuelva
          const yaResuelto = holdersCarrera.some((h) =>
            empatados.some((e) => Number(e.student_id) === Number(h.student_id))
          );
          if (!yaResuelto) {
            empatesPendientes += 1;
          }
          continue;
        }

        const ganador = empatados[0];

        // 1. Desplazar titulares anteriores de esta carrera distintos al nuevo ganador
        for (const holder of holdersCarrera) {
          if (Number(holder.student_id) === Number(ganador.student_id)) continue;

          const resDesp = await procesarDesplazamientoTitularActual(
            connection,
            holder,
            periodoActualId,
            adminIdEjecutor,
            `Rotación de Beca a la Excelencia Académica en ${carreraRow.nombre}: otro estudiante obtuvo un Índice Global superior (${maxIndice.toFixed(2)} pts).`
          );
          if (resDesp === 'retornado_base') retornadosABecaBase += 1;
          else if (resDesp === 'liberado_sin_base') liberadosSinBase += 1;
        }

        // 2. Otorgar Excelencia al ganador #1 de la carrera
        const resGanador = await otorgarExcelenciaAGanador(
          connection,
          ganador,
          periodoActualId,
          adminIdEjecutor,
          false
        );

        if (resGanador.asignado) asignados += 1;
        if (resGanador.promovidoConRespaldo) promovidosConRespaldo += 1;
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
      asignados,
      promovidosConRespaldo,
      retornadosABecaBase,
      liberadosSinBase,
      empatesPendientes,
      message: `Rotación completada: ${asignados} asignado(s), ${promovidosConRespaldo} con beca base resguardada, ${retornadosABecaBase} retornado(s) a beca base, ${empatesPendientes} empate(s) por resolver.`,
    };
  } catch (error) {
    console.error('❌ Error en ejecutarRotacionExcelenciaEnPeriodo:', error);
    return {
      success: false,
      asignados: 0,
      promovidosConRespaldo: 0,
      retornadosABecaBase: 0,
      liberadosSinBase: 0,
      empatesPendientes: 0,
      error: 'Error interno al ejecutar la rotación de Excelencia Académica.',
    };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Acción invocada desde el panel de Coordinación para ejecutar/sincronizar la nómina automática.
 */
export async function sincronizarNominaExcelenciaCoordinacion(): Promise<ResultadoRotacionExcelencia> {
  const auth = await verificarCoordinacion();
  if (!auth.autorizado) {
    return {
      success: false,
      asignados: 0,
      promovidosConRespaldo: 0,
      retornadosABecaBase: 0,
      liberadosSinBase: 0,
      empatesPendientes: 0,
      error: auth.error,
    };
  }

  const res = await ejecutarRotacionExcelenciaEnPeriodo(undefined, auth.adminId);
  if (res.success) {
    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');
    revalidatePath('/perfil');
  }
  return res;
}

/**
 * Resuelve manualmente un empate técnico (Art. 8) asignando la Beca a la Excelencia Académica
 * al estudiante designado por Secretaría General / Consejo Superior para esa carrera.
 */
export async function resolverEmpateExcelenciaAcademica(
  studentIdInput: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  const auth = await verificarCoordinacion();
  if (!auth.autorizado) {
    return { success: false, error: auth.error };
  }

  const studentId = Number(studentIdInput);
  if (!Number.isInteger(studentId) || studentId <= 0) {
    return { success: false, error: 'Estudiante inválido.' };
  }

  let connection: PoolConnection | undefined;

  try {
    const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());
    const variantesExcelencia = obtenerVariantesTipoBeca('BECA A LA EXCELENCIA ACADÉMICA');
    const placeholdersEx = variantesExcelencia.map(() => '?').join(', ');

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
            AND ra.trimestre_cursado = GREATEST(1, st.semestre - 1)
            AND (ra.nota < 10 OR ra.aprobada = 0)
        ) AS reprobadas_ultimo_trim
      FROM students st
      LEFT JOIN solicitudes s_act
        ON s_act.user_id = st.id AND s_act.periodo_id = ?
      WHERE st.id = ?
      LIMIT 1
      `,
      [periodoActualId, studentId]
    );

    if (rows.length === 0) {
      return { success: false, error: 'Estudiante no encontrado.' };
    }

    const elegido = rows[0];
    if (
      Number(elegido.semestre) < TRIMESTRE_MINIMO_EXCELENCIA ||
      redondearDos(elegido.indice_global) < PROMEDIO_MINIMO_EXCELENCIA ||
      Number(elegido.reprobadas_ultimo_trim || 0) > 0
    ) {
      return {
        success: false,
        error: 'El estudiante no cumple con los requisitos de Art. 8 (>= 4° trimestre, Índice Global >= 18 y cero reprobadas en el último trimestre).',
      };
    }

    const holdersCarrera = await queryFresh<HolderExcelenciaActualRow[]>(
      `
      SELECT
        s.id AS solicitud_id,
        st.id AS student_id,
        st.nombre,
        st.apellido,
        st.cedula,
        st.carrera,
        st.semestre,
        st.beca_base_respaldo,
        st.departamento_base_respaldo
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.periodo_id = ?
        AND s.estatus = 'Aprobada'
        AND LOWER(TRIM(s.tipo_beca)) IN (${placeholdersEx})
        AND LOWER(TRIM(st.carrera)) = LOWER(TRIM(?))
      `,
      [periodoActualId, ...variantesExcelencia, elegido.carrera]
    );

    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const holder of holdersCarrera) {
        if (Number(holder.student_id) === Number(elegido.student_id)) continue;
        await procesarDesplazamientoTitularActual(
          connection,
          holder,
          periodoActualId,
          auth.adminId,
          `Resolución de empate técnico en ${elegido.carrera} por Secretaría General / Consejo Superior.`
        );
      }

      await otorgarExcelenciaAGanador(
        connection,
        elegido,
        periodoActualId,
        auth.adminId,
        true
      );

      await connection.commit();
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
      connection = undefined;
    }

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');
    revalidatePath('/perfil');

    return {
      success: true,
      message: `Beca a la Excelencia Académica otorgada a ${elegido.nombre} ${elegido.apellido} en ${elegido.carrera}.`,
    };
  } catch (error) {
    console.error('❌ Error en resolverEmpateExcelenciaAcademica:', error);
    return { success: false, error: 'Error al resolver el empate técnico.' };
  } finally {
    if (connection) connection.release();
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
 * Registra directamente a un beneficiario seleccionado en el Concurso Anual de Beca Social Aprendizaje
 * (ya evaluado por Secretaría General y Consejo Superior).
 * - Si el estudiante no tiene cuenta, crea users + students (1er trimestre) con clave inicial = su cédula.
 * - Valida cupo anual (máx. 10 nuevos ingresos) y tope activo (máx. 60).
 * - Registra la solicitud directamente en estatus 'Aprobada' con su departamento asignado.
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
      error: 'La Beca Social Aprendizaje exige promedio de bachillerato entre 18.00 y 20.00 puntos (Art. 6 y 11).',
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
        error: 'Cupo máximo alcanzado: ya existen 60 beneficiarios activos de Beca Social Aprendizaje en este periodo (Art. 6 Par. 2°).',
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
        error: `Cupo anual de concurso agotado: ya se registraron 10 nuevas Becas Sociales Aprendizaje en ${anioActual} (Art. 6 Par. 2°).`,
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
        if (Number(st.beca_perdida) === 1) {
          await connection.rollback();
          return {
            success: false,
            error: 'El estudiante posee una suspensión definitiva previa (Art. 28) y no puede ser registrado.',
          };
        }
        if (st.solicitud_actual_id !== null) {
          await connection.rollback();
          return {
            success: false,
            error: `El estudiante ya posee una solicitud en el periodo vigente (${st.tipo_beca_actual} — ${st.estatus_actual}).`,
          };
        }
        studentId = Number(st.id);

        await connection.execute<ResultSetHeader>(
          `UPDATE students SET ha_tenido_beca = 1 WHERE id = ?`,
          [studentId]
        );
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
          ? `Concurso Anual Beca Social Aprendizaje (Art. 6): ${input.observaciones_concurso.trim()} | Plantel: ${ueProcedencia} | Prom. Bachillerato: ${promedioBachillerato.toFixed(2)} pts.`
          : `Beneficiario seleccionado por Concurso Anual de Beca Social Aprendizaje (Art. 6, aprobado por Secretaría General y Consejo Superior). Plantel de procedencia: ${ueProcedencia}. Promedio de bachillerato: ${promedioBachillerato.toFixed(2)} pts.`;

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

      // Registrar ficha socioeconómica base con la U.E. Pública de procedencia
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
 * Precarga 24 estudiantes élite (3 por cada una de las 8 carreras, trimestres 4° a 9°)
 * con récords académicos reales entre 18.20 y 19.60 para demostrar:
 * - Selección automática de Beca a la Excelencia Académica por carrera.
 * - Promoción de un becario previo (Discapacidad / Aprendizaje) con respaldo de beca base.
 * - Rotación y retorno automático al cambiar de periodo.
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
    const passwordHash = await bcrypt.hash('estudiante123', 10);

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

        // 3 perfiles por carrera:
        // Slot 0: Candidato #1 (nota base 19-20) SIN beca previa o con BECA POR DISCAPACIDAD en carreras pares
        // Slot 1: Candidato #2 (nota base 18-19) con BECA APRENDIZAJE aprobada
        // Slot 2: Candidato #3 (nota base 18-19) sin beca previa
        const perfiles = [
          {
            semestre: 6 + (cIdx % 3),
            poolNotas: [19, 19, 20, 19, 20],
            becaInicial: cIdx % 2 === 0 ? 'BECA POR DISCAPACIDAD' : null,
            deptoInicial: cIdx % 2 === 0 ? 'Biblioteca' : null,
          },
          {
            semestre: 5 + (cIdx % 3),
            poolNotas: [18, 19, 19, 18, 19],
            becaInicial: 'BECA APRENDIZAJE',
            deptoInicial: 'Bienestar Estudiantil',
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

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      creados,
      message:
        creados > 0
          ? `Se precargaron ${creados} estudiantes élite distribuidos en las ${carreras.length} carreras (incluyendo becarios base para probar promoción y retorno).`
          : 'Los 24 estudiantes élite de las 8 carreras ya se encontraban precargados.',
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
 * Elimina únicamente los estudiantes precargados de Excelencia (`excelencia_c%@unimar.edu.ve`).
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
    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.execute<ExistingIdRow[]>(
        `SELECT id FROM users WHERE LOWER(email) LIKE 'excelencia_c%@unimar.edu.ve'`
      );
      const ids = rows.map((r) => Number(r.id));

      if (ids.length === 0) {
        await connection.commit();
        return {
          success: true,
          eliminados: 0,
          message: 'No hay estudiantes élite de prueba para eliminar.',
        };
      }

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

      await connection.commit();

      revalidatePath('/admin/validarBeca');
      revalidatePath('/admin/dashboard');

      return {
        success: true,
        eliminados: ids.length,
        message: `Se eliminaron ${ids.length} estudiantes élite de prueba correctamente.`,
      };
    } catch (sqlErr) {
      await connection.rollback();
      throw sqlErr;
    } finally {
      connection.release();
      connection = undefined;
    }
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