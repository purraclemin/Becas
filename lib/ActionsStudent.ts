'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db, queryFresh } from './db'
import { getSession } from './ActionsSession'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { getModoPruebaStatus } from './ModoPrueba'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'
import { evaluarYRenovarEstudianteEnCambioPeriodo } from './ActionsRenovacion'
import { esBecaExcelenciaAcademica } from './RecordAcademicoUtils'

const SEMESTRE_EGRESADO = 13
const OBSERVACION_EGRESADO = 'Acabó su periodo académico'

interface StudentRow extends RowDataPacket {
  id: number;
  indice_global: number | string | null;
  carrera: string | null;
  semestre: number | null;
  ha_tenido_beca: number | null;
  beca_perdida: number | null;
  beca_base_respaldo: string | null;
  departamento_base_respaldo: string | null;
}

interface PeriodoActualRow extends RowDataPacket {
  id: number;
  codigo: string;
  nombre: string;
  fecha_inicio: Date | string;
  fecha_fin: Date | string;
}

interface SolicitudRecienteRow extends RowDataPacket {
  id: number;
  user_id: number;
  periodo_id: number | null;
  email_institucional: string | null;
  tipo_beca: string | null;
  promedio_notas: number | string | null;
  motivo_solicitud: string | null;
  materias_json: string | null;
  estatus: string | null;
  observaciones_admin: string | null;
  departamento_asignado: string | null;
  foto_carnet: string | null;
  copia_cedula: string | null;
  fecha_registro: Date | string;
  codigo_periodo_solicitud: string | null;
  nombre_periodo_solicitud: string | null;
}

interface RechazoPrevioRow extends RowDataPacket {
  id: number;
  observaciones_admin: string | null;
}

interface EstadoLigeroSQLRow extends RowDataPacket {
  semestre: number | null;
  beca_perdida: number | null;
  solicitud_id: number | null;
  estatus: string | null;
  tipo_beca: string | null;
  observaciones_admin: string | null;
  departamento_asignado: string | null;
  periodo_id: number | null;
  periodo_actual_id: number | null;
  periodo_actual_codigo: string | null;
  tiene_rechazo_historico: number | null;
  observacion_rechazo: string | null;
}

export interface EstadoLigeroEstudianteResponse {
  ok: boolean;
  estatus: string;
  observacionesAdmin: string | null;
  departamentoAsignado: string | null;
  semestre: number;
  becaPerdida: boolean;
  esEgresado: boolean;
  periodoActual: string;
  tipoBeca: string | null;
}

function obtenerNombrePeriodoAnterior(codigo: string): string {
  if (!codigo || !codigo.includes('-')) return "Periodo Anterior";
  const partes = codigo.split('-');
  const anio = parseInt(partes[0], 10);
  const lapso = partes[1];

  if (lapso === 'I') return `Periodo III ${anio - 1} (Sep-Dic)`;
  if (lapso === 'II') return `Periodo I ${anio} (Ene-Abr)`;
  if (lapso === 'III') return `Periodo II ${anio} (May-Ago)`;

  return "Periodo Anterior";
}

/**
 * Maneja el estado académico del estudiante separando:
 * - indiceGlobal (Índice Acumulado de toda la carrera)
 * - promedioUltimoTrimestre (Promedio del trimestre inmediatamente anterior)
 * - estatus vigente en el periodo actual (distinguiendo Finalizada por egreso vs. rotación de Excelencia sin sanción)
 */
export async function getStudentAcademicStatus(userId: string | number, trimestreManual?: string) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return {
        estatus: 'ninguna',
        becaPerdida: false,
        esEgresado: false,
        puedePostular: false,
        becaBaseRespaldo: null,
        indiceGlobal: '0.00',
        promedioUltimoTrimestre: '0.00',
        observacionesAdmin: null,
        materias: [],
        materiasSugeridas: [],
        lastSolicitud: null,
      };
    }

    const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());

    // 1. Ejecutar transición automática de periodo si aplica
    await evaluarYRenovarEstudianteEnCambioPeriodo(idNum, periodoActualId);

    // 2. Obtener solicitud más reciente del estudiante
    const [userRows] = await db.execute<SolicitudRecienteRow[]>(
      `
        SELECT sol.*, p.codigo AS codigo_periodo_solicitud, p.nombre AS nombre_periodo_solicitud
        FROM solicitudes sol
        LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
        WHERE sol.user_id = ?
        ORDER BY sol.periodo_id DESC, sol.fecha_registro DESC, sol.id DESC
        LIMIT 1
      `,
      [idNum]
    );
    const s: Partial<SolicitudRecienteRow> = userRows[0] || {};

    // 3. Sincronizar récord académico oficial
    const recordRes = await sincronizarYObtenerRecordAcademico(idNum, undefined, s.tipo_beca);
    const expediente = recordRes.success ? recordRes.data : null;

    const { activo } = await getModoPruebaStatus();

    // 4. Datos maestros del estudiante (incluye respaldo de beca base)
    const [studentRows] = await db.execute<StudentRow[]>(
      `
        SELECT
          id,
          indice_global,
          carrera,
          semestre,
          ha_tenido_beca,
          IFNULL(beca_perdida, 0) AS beca_perdida,
          beca_base_respaldo,
          departamento_base_respaldo
        FROM students
        WHERE id = ?
        LIMIT 1
      `,
      [idNum]
    );
    const studentData = studentRows[0] || ({} as Partial<StudentRow>);

    // 5. Datos del periodo actual del sistema
    const [periodoRows] = await db.execute<PeriodoActualRow[]>(
      'SELECT id, codigo, nombre, fecha_inicio, fecha_fin FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );
    const pAct = periodoRows[0];

    const semestreReal = Number(studentData.semestre ?? 0);
    const esEgresado = semestreReal >= SEMESTRE_EGRESADO;

    const indiceGlobalCalculado = expediente
      ? Number(expediente.indiceGlobal).toFixed(2)
      : Number(studentData.indice_global ?? 0).toFixed(2);

    const promedioUltimoTrimestreCalculado = expediente
      ? Number(expediente.promedioUltimoTrimestre).toFixed(2)
      : Number(s.promedio_notas ?? 0).toFixed(2);

    // 6. Verificar rechazo histórico definitivo (bloqueo permanente Art. 28 — nunca aplica a 'Finalizada')
    const [rechazoRows] = await db.execute<RechazoPrevioRow[]>(
      `
        SELECT id, observaciones_admin
        FROM solicitudes
        WHERE user_id = ?
          AND LOWER(TRIM(estatus)) IN ('rechazada', 'rechazado')
        ORDER BY id DESC
        LIMIT 1
      `,
      [idNum]
    );

    const becaPerdida =
      Number(studentData.beca_perdida) === 1 || rechazoRows.length > 0;

    if (becaPerdida && Number(studentData.beca_perdida) !== 1) {
      await db.execute<ResultSetHeader>(
        'UPDATE students SET beca_perdida = 1 WHERE id = ?',
        [idNum]
      );
    }

    // 7. Trimestre de referencia (acotado al máximo real de 12 trimestres)
    const trimestreSugerido = Math.min(12, Math.max(1, semestreReal - 1));
    const trimestreABuscar = trimestreManual
      ? Math.min(12, Math.max(1, parseInt(trimestreManual, 10) || trimestreSugerido))
      : trimestreSugerido;

    let materiasSugeridas: Array<{
      codigo_materia: string;
      nombre_materia: string;
      unidades_credito: number;
    }> = [];

    if (expediente && expediente.recordCompleto.length > 0 && trimestreABuscar > 0) {
      const delTrimestre = expediente.recordCompleto.filter(
        (m) => m.trimestre_cursado === trimestreABuscar
      );
      const fuenteMaterias =
        delTrimestre.length > 0
          ? delTrimestre
          : expediente.ultimoTrimestreSnapshot?.materias.map((m) => ({
              codigo_materia: m.codigo,
              nombre_materia: m.nombre,
              unidades_credito: m.creditos,
            })) ?? [];

      materiasSugeridas = fuenteMaterias.map((m) => ({
        codigo_materia: m.codigo_materia,
        nombre_materia: m.nombre_materia,
        unidades_credito: Number(m.unidades_credito ?? 3),
      }));
    }

    let materiasParaPerfil: unknown = expediente?.ultimoTrimestreSnapshot ?? [];
    if (!expediente?.ultimoTrimestreSnapshot && s.materias_json) {
      try {
        materiasParaPerfil = JSON.parse(s.materias_json);
      } catch {
        materiasParaPerfil = [];
      }
    }

    // 8. Estatus UI final:
    // - Si beca_perdida = 1 -> 'Rechazada' irreversible.
    // - Si estatus = 'Finalizada' -> conserva 'Finalizada' (egresado queda bloqueado para postular;
    //   ex-titular de Excelencia sin sanción con semestre <= 12 queda habilitado para volver a postular).
    // - Si su última solicitud fue Beca a la Excelencia de un periodo anterior sin cerrar -> 'Finalizada'.
    let estatusFinalUI = s.estatus || 'ninguna';
    const esExcelenciaDePeriodoPasado =
      s.estatus === 'Aprobada' &&
      esBecaExcelenciaAcademica(s.tipo_beca) &&
      s.periodo_id !== undefined &&
      s.periodo_id !== null &&
      Number(s.periodo_id) !== Number(periodoActualId);

    if (becaPerdida) {
      estatusFinalUI = 'Rechazada';
    } else if (esExcelenciaDePeriodoPasado) {
      estatusFinalUI = 'Finalizada';
    } else if (s.periodo_id !== undefined && Number(s.periodo_id) === Number(periodoActualId)) {
      estatusFinalUI = s.estatus || 'ninguna';
    }

    const puedePostular =
      !becaPerdida &&
      !esEgresado &&
      (estatusFinalUI === 'ninguna' || estatusFinalUI === 'Finalizada');

    // 9. Validación de ventana de tiempo
    let esPeriodoRenovacion = false;
    if (pAct) {
      const hoy = new Date();
      const fechaInicio = new Date(pAct.fecha_inicio);
      const diffDaysAlInicio = Math.ceil(
        (fechaInicio.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (activo || (diffDaysAlInicio <= 7 && diffDaysAlInicio >= -15)) esPeriodoRenovacion = true;
    }

    const etiquetaPeriodoNotas = expediente?.ultimoTrimestreSnapshot
      ? `Trimestre ${expediente.ultimoTrimestreSnapshot.trimestre}`
      : s.codigo_periodo_solicitud
        ? obtenerNombrePeriodoAnterior(s.codigo_periodo_solicitud)
        : "";

    let observacionFuente =
      s.observaciones_admin && String(s.observaciones_admin).trim() !== ''
        ? String(s.observaciones_admin).trim()
        : rechazoRows[0]?.observaciones_admin
          ? String(rechazoRows[0].observaciones_admin).trim()
          : null;

    if (!observacionFuente && esEgresado && estatusFinalUI === 'Finalizada') {
      observacionFuente = OBSERVACION_EGRESADO;
    }

    return {
      indiceGlobal: indiceGlobalCalculado,
      promedioUltimoTrimestre: promedioUltimoTrimestreCalculado,
      carrera: studentData.carrera || 'No Definida',
      semestre: semestreReal,
      esEgresado,
      puedePostular,
      estatus: estatusFinalUI,
      becaPerdida,
      becaBaseRespaldo: studentData.beca_base_respaldo ?? null,
      observacionesAdmin: observacionFuente,
      esPeriodoRenovacion,
      periodoActual: pAct?.codigo || "S/N",
      periodoActualNombre: pAct?.nombre || "",
      periodoActualId: periodoActualId,
      periodoNotas: etiquetaPeriodoNotas,
      materias: materiasParaPerfil,
      materiasSugeridas: materiasSugeridas,
      trimestreSugerido: trimestreSugerido,
      evaluacionAcademica: expediente?.evaluacion ?? null,
      lastSolicitud: s,
    };
  } catch (error) {
    console.error("❌ Error en getStudentAcademicStatus:", error);
    return {
      estatus: 'ninguna',
      becaPerdida: false,
      esEgresado: false,
      puedePostular: false,
      becaBaseRespaldo: null,
      indiceGlobal: '0.00',
      promedioUltimoTrimestre: '0.00',
      observacionesAdmin: null,
      materias: [],
      materiasSugeridas: [],
      lastSolicitud: null,
    };
  }
}

/**
 * Consulta ultraligera de solo lectura para polling en tiempo real en `/perfil`
 * (compatible con Next.js + XAMPP + Vercel sin WebSockets externos).
 * Valida la sesión del propio estudiante en el servidor y ejecuta un único SELECT rápido.
 */
export async function verificarEstadoLigeroEstudiante(): Promise<EstadoLigeroEstudianteResponse> {
  const vacio: EstadoLigeroEstudianteResponse = {
    ok: false,
    estatus: 'ninguna',
    observacionesAdmin: null,
    departamentoAsignado: null,
    semestre: 0,
    becaPerdida: false,
    esEgresado: false,
    periodoActual: 'S/N',
    tipoBeca: null,
  };

  try {
    const session = await getSession();
    if (!session.isLoggedIn || session.role !== 'estudiante') {
      return vacio;
    }

    const studentId = Number('id' in session ? session.id : 0);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return vacio;
    }

    const rows = await queryFresh<EstadoLigeroSQLRow[]>(
      `
      SELECT
        IFNULL(st.semestre, 0) AS semestre,
        IFNULL(st.beca_perdida, 0) AS beca_perdida,
        s.id AS solicitud_id,
        s.estatus,
        s.tipo_beca,
        s.observaciones_admin,
        NULLIF(TRIM(s.departamento_asignado), '') AS departamento_asignado,
        s.periodo_id,
        (SELECT p_a.id FROM periodos_academicos p_a WHERE p_a.es_actual = 1 LIMIT 1) AS periodo_actual_id,
        (SELECT p_c.codigo FROM periodos_academicos p_c WHERE p_c.es_actual = 1 LIMIT 1) AS periodo_actual_codigo,
        EXISTS (
          SELECT 1 FROM solicitudes s_rj
          WHERE s_rj.user_id = st.id
            AND LOWER(TRIM(s_rj.estatus)) IN ('rechazada', 'rechazado')
        ) AS tiene_rechazo_historico,
        (
          SELECT s_ro.observaciones_admin
          FROM solicitudes s_ro
          WHERE s_ro.user_id = st.id
            AND LOWER(TRIM(s_ro.estatus)) IN ('rechazada', 'rechazado')
          ORDER BY s_ro.id DESC
          LIMIT 1
        ) AS observacion_rechazo
      FROM students st
      LEFT JOIN solicitudes s
        ON s.id = (
          SELECT s_u.id
          FROM solicitudes s_u
          LEFT JOIN periodos_academicos p_u ON s_u.periodo_id = p_u.id
          WHERE s_u.user_id = st.id
            AND (
              p_u.fecha_inicio IS NULL
              OR p_u.fecha_inicio <= IFNULL(
                (SELECT p_lim.fecha_inicio FROM periodos_academicos p_lim WHERE p_lim.es_actual = 1 LIMIT 1),
                '9999-12-31'
              )
            )
          ORDER BY s_u.periodo_id DESC, s_u.fecha_registro DESC, s_u.id DESC
          LIMIT 1
        )
      WHERE st.id = ?
      LIMIT 1
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return vacio;
    }

    const row = rows[0];
    const semestre = Number(row.semestre ?? 0);
    const esEgresado = semestre >= SEMESTRE_EGRESADO;
    const becaPerdida =
      Number(row.beca_perdida ?? 0) === 1 || Number(row.tiene_rechazo_historico ?? 0) === 1;
    const periodoActualId = Number(row.periodo_actual_id ?? 0);

    let estatusFinal = row.estatus ? String(row.estatus).trim() : 'ninguna';
    const esExcelenciaDePeriodoPasado =
      estatusFinal === 'Aprobada' &&
      esBecaExcelenciaAcademica(row.tipo_beca) &&
      row.periodo_id !== null &&
      periodoActualId > 0 &&
      Number(row.periodo_id) !== periodoActualId;

    if (becaPerdida) {
      estatusFinal = 'Rechazada';
    } else if (esExcelenciaDePeriodoPasado) {
      estatusFinal = 'Finalizada';
    }

    let observacionesAdmin =
      row.observaciones_admin && String(row.observaciones_admin).trim() !== ''
        ? String(row.observaciones_admin).trim()
        : row.observacion_rechazo && String(row.observacion_rechazo).trim() !== ''
          ? String(row.observacion_rechazo).trim()
          : null;

    if (!observacionesAdmin && esEgresado && estatusFinal === 'Finalizada') {
      observacionesAdmin = OBSERVACION_EGRESADO;
    }

    return {
      ok: true,
      estatus: estatusFinal,
      observacionesAdmin,
      departamentoAsignado: row.departamento_asignado
        ? String(row.departamento_asignado).trim()
        : null,
      semestre,
      becaPerdida,
      esEgresado,
      periodoActual: row.periodo_actual_codigo
        ? String(row.periodo_actual_codigo).trim()
        : 'S/N',
      tipoBeca: row.tipo_beca ? String(row.tipo_beca).trim() : null,
    };
  } catch (error) {
    console.error('⚠️ Error en verificarEstadoLigeroEstudiante:', error);
    return vacio;
  }
}