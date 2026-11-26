'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { getModoPruebaStatus } from './ModoPrueba'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'
import { evaluarYRenovarEstudianteEnCambioPeriodo } from './ActionsRenovacion'
import { esBecaExcelenciaAcademica } from './RecordAcademicoUtils'

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
 * - estatus vigente en el periodo actual (respetando rotación sin penalización de Excelencia Académica)
 */
export async function getStudentAcademicStatus(userId: string | number, trimestreManual?: string) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return {
        estatus: 'ninguna',
        becaPerdida: false,
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
    const indiceGlobalCalculado = expediente
      ? Number(expediente.indiceGlobal).toFixed(2)
      : Number(studentData.indice_global ?? 0).toFixed(2);

    const promedioUltimoTrimestreCalculado = expediente
      ? Number(expediente.promedioUltimoTrimestre).toFixed(2)
      : Number(s.promedio_notas ?? 0).toFixed(2);

    // 6. Verificar rechazo histórico definitivo (bloqueo permanente Art. 28)
    const [rechazoRows] = await db.execute<RechazoPrevioRow[]>(
      `SELECT id, observaciones_admin FROM solicitudes WHERE user_id = ? AND estatus = 'Rechazada' ORDER BY id DESC LIMIT 1`,
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

    // 7. Trimestre de referencia (semestre - 1)
    const trimestreSugerido = Math.max(1, semestreReal - 1);
    const trimestreABuscar = trimestreManual ? parseInt(trimestreManual, 10) : trimestreSugerido;

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
    // - Si beca_perdida = 1 -> Rechazada irreversible.
    // - Si su última solicitud fue Beca a la Excelencia de un periodo ANTERIOR (y no renovó ni volvió a beca base) -> 'ninguna' (habilitado sin sanción).
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
      estatusFinalUI = 'ninguna';
    } else if (s.periodo_id !== undefined && Number(s.periodo_id) === Number(periodoActualId)) {
      estatusFinalUI = s.estatus || 'ninguna';
    }

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

    const observacionFuente =
      s.observaciones_admin && String(s.observaciones_admin).trim() !== ''
        ? String(s.observaciones_admin).trim()
        : rechazoRows[0]?.observaciones_admin
          ? String(rechazoRows[0].observaciones_admin).trim()
          : null;

    return {
      indiceGlobal: indiceGlobalCalculado,
      promedioUltimoTrimestre: promedioUltimoTrimestreCalculado,
      carrera: studentData.carrera || 'No Definida',
      semestre: semestreReal,
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