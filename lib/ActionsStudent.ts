'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { getModoPruebaStatus } from './ModoPrueba'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'

interface StudentRow extends RowDataPacket {
  id: number;
  indice_global: number | string | null;
  carrera: string | null;
  semestre: number | null;
  ha_tenido_beca: number | null;
  beca_perdida: number | null;
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

interface SolicitudIdRow extends RowDataPacket {
  id: number;
}

/**
 * Función auxiliar para calcular el nombre del periodo ANTERIOR
 */
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
 * REESTRUCTURADO: Maneja el estado académico, sincroniza el récord oficial,
 * expone observacionesAdmin de la solicitud vigente y calcula el Índice Global.
 */
export async function getStudentAcademicStatus(userId: string | number, trimestreManual?: string) {
  try {
    const idNum = typeof userId === 'string' ? parseInt(userId, 10) : Number(userId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return {
        estatus: 'ninguna',
        observacionesAdmin: null,
        materias: [],
        materiasSugeridas: [],
        lastSolicitud: null,
      };
    }

    // 1. Sincronizar récord académico oficial (genera notas persistentes si aplica y actualiza indice_global)
    const recordRes = await sincronizarYObtenerRecordAcademico(idNum);
    const expediente = recordRes.success ? recordRes.data : null;

    const periodoActualId = await obtenerOCrearPeriodoObjetivo();
    const { activo } = await getModoPruebaStatus();

    // 2. Datos maestros del estudiante
    const [studentRows] = await db.execute<StudentRow[]>(
      'SELECT id, indice_global, carrera, semestre, ha_tenido_beca, beca_perdida FROM students WHERE id = ?',
      [idNum]
    );
    const studentData = studentRows[0] || ({} as Partial<StudentRow>);

    // 3. Datos del periodo actual del sistema
    const [periodoRows] = await db.execute<PeriodoActualRow[]>(
      'SELECT id, codigo, nombre, fecha_inicio, fecha_fin FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );
    const pAct = periodoRows[0];

    const semestreReal = Number(studentData.semestre ?? 0);
    const indiceGlobalCalculado = expediente
      ? Number(expediente.indiceGlobal).toFixed(2)
      : Number(studentData.indice_global ?? 0).toFixed(2);

    // 4. Trimestre de referencia para materias del último trimestre cursado
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

    // 5. Obtener solicitud más reciente (para estatus actual y observaciones_admin)
    const [userRows] = await db.execute<SolicitudRecienteRow[]>(
      `
        SELECT sol.*, p.codigo as codigo_periodo_solicitud, p.nombre as nombre_periodo_solicitud
        FROM solicitudes sol
        LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
        WHERE sol.user_id = ?
        ORDER BY sol.fecha_registro DESC LIMIT 1
      `,
      [idNum]
    );

    let s: Partial<SolicitudRecienteRow> = userRows[0] || {};

    // 6. TRIGGER AUTOMÁTICO DE RENOVACIÓN
    if (pAct && s.id && s.estatus === 'Aprobada' && Number(s.periodo_id) !== Number(periodoActualId)) {
      const hoy = new Date();
      const fechaInicioPeriodo = new Date(pAct.fecha_inicio);
      const diffDaysAlInicio = Math.ceil(
        (fechaInicioPeriodo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );

      const ventanaAbierta = activo || (diffDaysAlInicio <= 7 && diffDaysAlInicio >= -15);

      if (ventanaAbierta) {
        const [checkRows] = await db.execute<SolicitudIdRow[]>(
          'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
          [idNum, periodoActualId]
        );

        if (checkRows.length === 0) {
          const estatusPrevio = s.estatus;

          const [insertResult] = await db.execute<ResultSetHeader>(
            `
              INSERT INTO solicitudes (
                user_id, periodo_id, email_institucional, tipo_beca,
                promedio_notas, motivo_solicitud, materias_json,
                estatus, foto_carnet, copia_cedula, fecha_registro, revisado_por
              ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Renovacion', ?, ?, NOW(), 0)
            `,
            [
              idNum,
              periodoActualId,
              s.email_institucional ?? null,
              s.tipo_beca ?? null,
              s.promedio_notas ?? indiceGlobalCalculado,
              s.motivo_solicitud ?? null,
              '[]',
              s.foto_carnet ?? null,
              s.copia_cedula ?? null,
            ]
          );

          const nuevaSolicitudId = insertResult.insertId;

          await registrarDecisionEnHistorial(
            nuevaSolicitudId,
            'Renovacion',
            0,
            "Sistema: Habilitación por ventana de tiempo.",
            '127.0.0.1',
            estatusPrevio || undefined
          );

          const [newRows] = await db.execute<SolicitudRecienteRow[]>(
            `
              SELECT sol.*, p.codigo as codigo_periodo_solicitud, p.nombre as nombre_periodo_solicitud
              FROM solicitudes sol
              LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
              WHERE sol.id = ? AND sol.user_id = ? LIMIT 1
            `,
            [nuevaSolicitudId, idNum]
          );

          if (newRows.length > 0) s = newRows[0];
        }
      }
    }

    // Prioriza el snapshot oficial del último trimestre cursado; si el estudiante es de 1er trimestre
    // o aún no tiene récord, usa las materias de la solicitud si existen.
    let materiasParaPerfil: unknown = expediente?.ultimoTrimestreSnapshot ?? [];
    if (!expediente?.ultimoTrimestreSnapshot && s.materias_json) {
      try {
        materiasParaPerfil = JSON.parse(s.materias_json);
      } catch {
        materiasParaPerfil = [];
      }
    }

    // 7. Estatus UI
    let estatusFinalUI = s.estatus || 'ninguna';
    if (studentData.beca_perdida === 1) {
      estatusFinalUI = 'Rechazada';
    } else if (s.periodo_id !== undefined && Number(s.periodo_id) === Number(periodoActualId)) {
      estatusFinalUI = s.estatus || 'ninguna';
    }

    // 8. Validación de ventana de tiempo para Banner
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

    const observacionesAdmin =
      s.observaciones_admin && String(s.observaciones_admin).trim() !== ''
        ? String(s.observaciones_admin).trim()
        : null;

    return {
      indiceGlobal: indiceGlobalCalculado,
      carrera: studentData.carrera || 'No Definida',
      semestre: semestreReal,
      estatus: estatusFinalUI,
      observacionesAdmin,
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
      observacionesAdmin: null,
      materias: [],
      materiasSugeridas: [],
      lastSolicitud: null,
    };
  }
}