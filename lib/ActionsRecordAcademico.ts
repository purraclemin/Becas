"use server";

import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { unstable_noStore as noStore } from "next/cache";
import { db, queryFresh } from "@/lib/db";
import { obtenerOCrearPeriodoObjetivo } from "@/lib/SolicitudAcademic";
import {
  agruparRecordPorTrimestre,
  construirUltimoTrimestreSnapshot,
  evaluarElegibilidadAcademica,
  generarNotasAleatoriasPorPerfil,
  obtenerPromedioMinimoPorTipoBeca,
  type IExpedienteAcademicoOficial,
  type IMateriaPensumBase,
  type IRegistroRecordAcademico,
  type PerfilAcademicoAleatorio,
} from "@/lib/RecordAcademicoUtils";

const MAX_TRIMESTRE_PENSUM = 12;

interface StudentCarreraRow extends RowDataPacket {
  student_id: number;
  carrera: string;
  semestre: number;
  indice_global: number | string;
  carrera_id: number;
}

interface StudentSimulacionRow extends RowDataPacket {
  id: number;
  cedula: string;
  telefono: string | null;
  carrera: string;
  semestre: number;
  municipio_residencia: string | null;
}

interface EstudioSimulacionRow extends RowDataPacket {
  id: number;
  socio_lugar_nac: string | null;
  socio_nacionalidad: string | null;
  socio_estado_civil: string | null;
  socio_telf_hab: string | null;
  direccion_completa: string | null;
  socio_ue_procedencia: string | null;
  socio_otros_estudios: string | null;
  socio_fecha_unimar: Date | string | null;
  socio_modalidad: string | null;
}

interface RecordAcademicoRow extends RowDataPacket {
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

interface PensumMateriaRow extends RowDataPacket {
  pensum_materia_id: number;
  trimestre_ubicacion: number;
  codigo_materia: string;
  nombre_materia: string;
  unidades_credito: number;
}

interface SolicitudVigenteSyncRow extends RowDataPacket {
  id: number;
  promedio_notas: number | string | null;
  materias_json: string | null;
}

interface EstudianteDesincronizadoRow extends RowDataPacket {
  id: number;
  tipo_beca_activa: string | null;
}

export interface IResultadoRecordAcademico {
  success: boolean;
  data: IExpedienteAcademicoOficial | null;
  error?: string;
}

const LUGARES_NACIMIENTO = [
  "La Asunción, Nueva Esparta",
  "Porlamar, Nueva Esparta",
  "Juan Griego, Nueva Esparta",
  "Pampatar, Nueva Esparta",
  "Caracas, Distrito Capital",
  "Puerto La Cruz, Anzoátegui",
  "Cumaná, Sucre",
];

const NACIONALIDADES = ["Venezolano/a", "Venezolano/a", "Venezolano/a", "Extranjero/a"];
const ESTADOS_CIVILES = ["Soltero/a", "Soltero/a", "Casado/a", "Concubinato"];
const CALLES_SECTOR = [
  "Av. Bolívar, Residencias El Morro",
  "Calle Igualdad, Sector Conejeros",
  "Urb. Playa El Ángel, Calle 3",
  "Sector El Valle, Calle Urdaneta",
  "Av. 4 de Mayo, Conjunto Residencial Caribe",
  "Sector Los Robles, Calle Principal",
];
const UES_PROCEDENCIA = [
  "U.E. Colegio Virgen del Valle",
  "U.E.N. Creación Valle Verde",
  "U.E. Dr. Francisco Antonio Rísquez",
  "U.E. Colegio Guayamurí",
  "U.E.P. Instituto Nueva Esparta",
];
const OTROS_ESTUDIOS = [
  "Ninguno",
  "Certificación en Ofimática y Hojas de Cálculo",
  "Curso Básico de Inglés Técnico",
  "Diplomado Introductorio en Gestión Administrativa",
];
const MODALIDADES_UNI = ["P", "S", "V"];

function elegirAleatorio<T>(lista: ReadonlyArray<T>): T {
  const idx = Math.floor(Math.random() * lista.length);
  return lista[idx];
}

function enteroEnRango(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatearFechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generarFechaIngresoUnimarISO(semestreActual: number): string {
  const hoy = new Date();
  const trimestresCursados = Math.max(
    0,
    Math.min(MAX_TRIMESTRE_PENSUM, Number(semestreActual || 1) - 1)
  );
  const mesesAtras = Math.max(2, trimestresCursados * 4 + enteroEnRango(0, 2));
  const fecha = new Date(
    hoy.getFullYear(),
    hoy.getMonth() - mesesAtras,
    enteroEnRango(1, 28)
  );

  const fechaMinima = new Date(2005, 0, 1);
  if (fecha < fechaMinima) {
    return formatearFechaISO(fechaMinima);
  }
  if (fecha > hoy) {
    return formatearFechaISO(hoy);
  }
  return formatearFechaISO(fecha);
}

function generarTelefonoFijo(): string {
  return `0295${enteroEnRango(2600000, 2999999)}`;
}

function generarTelefonoCelular(): string {
  const prefijos = ["0412", "0414", "0416", "0424", "0426"];
  const prefijo = elegirAleatorio(prefijos);
  return `${prefijo}${enteroEnRango(1000000, 9999999)}`;
}

function estaVacio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true;
  const texto = String(valor).trim();
  return texto === "" || texto.toLowerCase() === "no declarado";
}

function mapearFilaRecord(row: RecordAcademicoRow): IRegistroRecordAcademico {
  const fechaIso =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at ?? "");

  return {
    id: Number(row.id),
    student_id: Number(row.student_id),
    pensum_materia_id: Number(row.pensum_materia_id),
    trimestre_cursado: Number(row.trimestre_cursado),
    codigo_materia: String(row.codigo_materia),
    nombre_materia: String(row.nombre_materia),
    unidades_credito: Number(row.unidades_credito),
    nota: Number(row.nota),
    aprobada: Number(row.aprobada) === 1,
    created_at: fechaIso,
  };
}

async function consultarRecordPersistido(
  studentId: number
): Promise<IRegistroRecordAcademico[]> {
  const rows = await queryFresh<RecordAcademicoRow[]>(
    `
      SELECT
        ra.id,
        ra.student_id,
        ra.pensum_materia_id,
        ra.trimestre_cursado,
        ra.codigo_materia,
        ra.nombre_materia,
        ra.unidades_credito,
        ra.nota,
        ra.aprobada,
        ra.created_at
      FROM record_academico ra
      WHERE ra.student_id = ?
      ORDER BY ra.trimestre_cursado ASC, ra.codigo_materia ASC
    `,
    [studentId]
  );

  return rows.map(mapearFilaRecord);
}

function extraerTrimestreDeMateriasJson(raw: string | null): number | null {
  if (!raw || raw.trim() === "") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "trimestre" in parsed &&
      (parsed as { trimestre?: unknown }).trimestre !== null &&
      (parsed as { trimestre?: unknown }).trimestre !== undefined
    ) {
      const n = Number((parsed as { trimestre: unknown }).trimestre);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Genera y persiste una sola vez en base de datos los datos simulados de
 * StepEncuestaPersonal y StepEncuestaInfoUni para que no lleguen null ni vacíos
 * al envío ni a la auditoría administrativa.
 */
export async function asegurarDatosSocioeconomicosSimulados(
  studentIdInput: number | string
): Promise<void> {
  noStore();
  const studentId = Number(studentIdInput);
  if (!Number.isInteger(studentId) || studentId <= 0) return;

  try {
    const studentRows = await queryFresh<StudentSimulacionRow[]>(
      `
        SELECT id, cedula, telefono, carrera, semestre, municipio_residencia
        FROM students
        WHERE id = ?
        LIMIT 1
      `,
      [studentId]
    );

    if (studentRows.length === 0) return;
    const st = studentRows[0];

    let telefonoFinal = st.telefono;
    if (estaVacio(telefonoFinal)) {
      telefonoFinal = generarTelefonoCelular();
      await db.execute<ResultSetHeader>(
        `UPDATE students SET telefono = ? WHERE id = ?`,
        [telefonoFinal, studentId]
      );
    }

    const periodoId = await obtenerOCrearPeriodoObjetivo();

    const estudioRows = await queryFresh<EstudioSimulacionRow[]>(
      `
        SELECT
          id,
          socio_lugar_nac,
          socio_nacionalidad,
          socio_estado_civil,
          socio_telf_hab,
          direccion_completa,
          socio_ue_procedencia,
          socio_otros_estudios,
          socio_fecha_unimar,
          socio_modalidad
        FROM estudios_socioeconomicos
        WHERE student_id = ? AND tipo = 'estudiante'
        ORDER BY created_at DESC
        LIMIT 1
      `,
      [studentId]
    );

    const existente = estudioRows[0];
    const municipioTexto = st.municipio_residencia
      ? `, Mun. ${st.municipio_residencia}`
      : "";

    const nacionalidad = !estaVacio(existente?.socio_nacionalidad)
      ? String(existente.socio_nacionalidad)
      : elegirAleatorio(NACIONALIDADES);

    const lugarNac = !estaVacio(existente?.socio_lugar_nac)
      ? String(existente.socio_lugar_nac)
      : elegirAleatorio(LUGARES_NACIMIENTO);

    const estadoCivil = !estaVacio(existente?.socio_estado_civil)
      ? String(existente.socio_estado_civil)
      : elegirAleatorio(ESTADOS_CIVILES);

    const direccionCompleta = !estaVacio(existente?.direccion_completa)
      ? String(existente.direccion_completa)
      : `${elegirAleatorio(CALLES_SECTOR)}${municipioTexto}`;

    const telfHab = !estaVacio(existente?.socio_telf_hab)
      ? String(existente.socio_telf_hab)
      : generarTelefonoFijo();

    const ueProcedencia = !estaVacio(existente?.socio_ue_procedencia)
      ? String(existente.socio_ue_procedencia)
      : elegirAleatorio(UES_PROCEDENCIA);

    let fechaUnimarStr = "";
    if (existente?.socio_fecha_unimar) {
      if (existente.socio_fecha_unimar instanceof Date) {
        fechaUnimarStr = formatearFechaISO(existente.socio_fecha_unimar);
      } else {
        const rawFecha = String(existente.socio_fecha_unimar).trim();
        fechaUnimarStr = rawFecha.includes("T") ? rawFecha.split("T")[0] : rawFecha;
      }
    }
    if (estaVacio(fechaUnimarStr)) {
      fechaUnimarStr = generarFechaIngresoUnimarISO(Number(st.semestre || 1));
    }

    const otrosEstudios = !estaVacio(existente?.socio_otros_estudios)
      ? String(existente.socio_otros_estudios)
      : elegirAleatorio(OTROS_ESTUDIOS);

    const modalidad = !estaVacio(existente?.socio_modalidad)
      ? String(existente.socio_modalidad)
      : elegirAleatorio(MODALIDADES_UNI);

    if (!existente) {
      await db.execute<ResultSetHeader>(
        `
          INSERT IGNORE INTO estudios_socioeconomicos (
            student_id,
            periodo_id,
            tipo,
            socio_lugar_nac,
            socio_nacionalidad,
            socio_estado_civil,
            socio_telf_hab,
            direccion_completa,
            socio_ue_procedencia,
            socio_otros_estudios,
            socio_fecha_unimar,
            socio_modalidad,
            puntaje,
            nivel_riesgo
          ) VALUES (?, ?, 'estudiante', ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'Bajo')
        `,
        [
          studentId,
          periodoId,
          lugarNac,
          nacionalidad,
          estadoCivil,
          telfHab,
          direccionCompleta,
          ueProcedencia,
          otrosEstudios,
          fechaUnimarStr,
          modalidad,
        ]
      );
    } else {
      const huboCambios =
        estaVacio(existente.socio_lugar_nac) ||
        estaVacio(existente.socio_nacionalidad) ||
        estaVacio(existente.socio_estado_civil) ||
        estaVacio(existente.socio_telf_hab) ||
        estaVacio(existente.direccion_completa) ||
        estaVacio(existente.socio_ue_procedencia) ||
        estaVacio(existente.socio_otros_estudios) ||
        estaVacio(existente.socio_fecha_unimar) ||
        estaVacio(existente.socio_modalidad);

      if (huboCambios) {
        await db.execute<ResultSetHeader>(
          `
            UPDATE estudios_socioeconomicos
            SET
              socio_lugar_nac = ?,
              socio_nacionalidad = ?,
              socio_estado_civil = ?,
              socio_telf_hab = ?,
              direccion_completa = ?,
              socio_ue_procedencia = ?,
              socio_otros_estudios = ?,
              socio_fecha_unimar = ?,
              socio_modalidad = ?
            WHERE id = ?
          `,
          [
            lugarNac,
            nacionalidad,
            estadoCivil,
            telfHab,
            direccionCompleta,
            ueProcedencia,
            otrosEstudios,
            fechaUnimarStr,
            modalidad,
            existente.id,
          ]
        );
      }
    }
  } catch (error) {
    console.error("Error en asegurarDatosSocioeconomicosSimulados:", error);
  }
}

/**
 * Sincroniza de forma idempotente el récord académico oficial del estudiante (Única Fuente de Verdad):
 * 1. Semestre 1: habilitado sin materias universitarias precargadas.
 * 2. Semestre > 1 (hasta egresado 13): genera y persiste automáticamente las asignaturas faltantes
 *    de los trimestres cursados (1 hasta min(12, semestre - 1)) desde `pensum_materias` deduplicado.
 * 3. Actualiza `students.indice_global` con el promedio exacto acumulado de `record_academico`.
 * 4. Alinea la solicitud activa del periodo vigente (`solicitudes.promedio_notas` y `materias_json`)
 *    con el promedio y materias del último trimestre cursado para eliminar cualquier desfase.
 */
export async function sincronizarYObtenerRecordAcademico(
  studentIdInput: number | string,
  perfilForzado?: PerfilAcademicoAleatorio,
  tipoBecaObjetivo?: string | null
): Promise<IResultadoRecordAcademico> {
  noStore();
  const studentId = Number(studentIdInput);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return {
      success: false,
      data: null,
      error: "Identificador de estudiante inválido.",
    };
  }

  try {
    await asegurarDatosSocioeconomicosSimulados(studentId);

    const studentRows = await queryFresh<StudentCarreraRow[]>(
      `
        SELECT
          st.id AS student_id,
          st.carrera AS carrera,
          st.semestre AS semestre,
          IFNULL(st.indice_global, 0.00) AS indice_global,
          IFNULL(c.id, 0) AS carrera_id
        FROM students st
        LEFT JOIN carreras c
          ON LOWER(TRIM(st.carrera)) = LOWER(TRIM(c.nombre))
        WHERE st.id = ?
        LIMIT 1
      `,
      [studentId]
    );

    if (studentRows.length === 0) {
      return {
        success: false,
        data: null,
        error: "Estudiante no encontrado en el padrón institucional.",
      };
    }

    const student = studentRows[0];
    const semestreActual = Number(student.semestre);
    const semestreEfectivoRecord = Math.min(MAX_TRIMESTRE_PENSUM + 1, semestreActual);
    const carreraId = Number(student.carrera_id);
    const indiceGuardado = Number(student.indice_global);
    const promedioMinimoObjetivo = obtenerPromedioMinimoPorTipoBeca(
      tipoBecaObjetivo,
      "ingreso",
      semestreEfectivoRecord
    );

    if (semestreActual <= 1) {
      const evaluacion = evaluarElegibilidadAcademica(
        semestreActual,
        [],
        tipoBecaObjetivo
      );
      return {
        success: true,
        data: {
          studentId,
          carrera: String(student.carrera),
          semestreActual,
          indiceGlobal: 0,
          promedioUltimoTrimestre: 0,
          trimestreUltimoCursado: 0,
          recienGenerado: false,
          evaluacion,
          recordCompleto: [],
          historialPorTrimestre: [],
          ultimoTrimestreSnapshot: null,
        },
      };
    }

    let recordCompleto = await consultarRecordPersistido(studentId);
    let recienGenerado = false;

    if (carreraId > 0) {
      const pensumRows = await queryFresh<PensumMateriaRow[]>(
        `
          SELECT
            MIN(pm.id) AS pensum_materia_id,
            pm.trimestre_ubicacion,
            pm.codigo_materia,
            MIN(pm.nombre_materia) AS nombre_materia,
            MAX(IFNULL(pm.unidades_credito, 3)) AS unidades_credito
          FROM pensum_materias pm
          WHERE pm.carrera_id = ?
            AND pm.trimestre_ubicacion < ?
            AND pm.trimestre_ubicacion <= ?
          GROUP BY pm.trimestre_ubicacion, pm.codigo_materia
          ORDER BY pm.trimestre_ubicacion ASC, pm.codigo_materia ASC
        `,
        [carreraId, semestreEfectivoRecord, MAX_TRIMESTRE_PENSUM]
      );

      const existentesKey = new Set<string>(
        recordCompleto.map(
          (r) => `${r.trimestre_cursado}-${r.codigo_materia.toUpperCase()}`
        )
      );

      const materiasFaltantes: IMateriaPensumBase[] = pensumRows
        .filter(
          (p) =>
            !existentesKey.has(
              `${Number(p.trimestre_ubicacion)}-${String(
                p.codigo_materia
              ).toUpperCase()}`
            )
        )
        .map((p) => ({
          pensum_materia_id: Number(p.pensum_materia_id),
          trimestre_ubicacion: Number(p.trimestre_ubicacion),
          codigo_materia: String(p.codigo_materia),
          nombre_materia: String(p.nombre_materia),
          unidades_credito: Number(p.unidades_credito),
        }));

      if (materiasFaltantes.length > 0) {
        const materiasGeneradas = generarNotasAleatoriasPorPerfil(
          materiasFaltantes,
          perfilForzado,
          promedioMinimoObjetivo
        );

        const placeholders: string[] = [];
        const values: Array<number | string> = [];

        for (const item of materiasGeneradas) {
          placeholders.push("(?, ?, ?, ?, ?, ?, ?, ?)");
          values.push(
            studentId,
            item.pensum_materia_id,
            item.trimestre_ubicacion,
            item.codigo_materia,
            item.nombre_materia,
            item.unidades_credito,
            item.nota,
            item.aprobada
          );
        }

        await db.execute<ResultSetHeader>(
          `
            INSERT IGNORE INTO record_academico (
              student_id,
              pensum_materia_id,
              trimestre_cursado,
              codigo_materia,
              nombre_materia,
              unidades_credito,
              nota,
              aprobada
            ) VALUES ${placeholders.join(", ")}
          `,
          values
        );

        recordCompleto = await consultarRecordPersistido(studentId);
        recienGenerado = true;
      }
    }

    const evaluacion = evaluarElegibilidadAcademica(
      semestreEfectivoRecord,
      recordCompleto,
      tipoBecaObjetivo
    );

    if (
      recienGenerado ||
      Math.abs(indiceGuardado - evaluacion.promedioGlobal) > 0.009
    ) {
      await db.execute<ResultSetHeader>(
        `
          UPDATE students
          SET indice_global = ?
          WHERE id = ?
        `,
        [evaluacion.promedioGlobal.toFixed(2), studentId]
      );
    }

    const historialPorTrimestre = agruparRecordPorTrimestre(recordCompleto);
    const ultimoTrimestreSnapshot = construirUltimoTrimestreSnapshot(
      recordCompleto,
      semestreEfectivoRecord
    );

    // Sincronizar la solicitud del periodo vigente con el promedio y snapshot exacto del último trimestre cursado
    if (ultimoTrimestreSnapshot && ultimoTrimestreSnapshot.materias.length > 0) {
      const solActualRows = await queryFresh<SolicitudVigenteSyncRow[]>(
        `
          SELECT s.id, s.promedio_notas, s.materias_json
          FROM solicitudes s
          JOIN periodos_academicos p ON s.periodo_id = p.id
          WHERE s.user_id = ?
            AND p.es_actual = 1
          ORDER BY s.id DESC
          LIMIT 1
        `,
        [studentId]
      );

      if (solActualRows.length > 0) {
        const solActual = solActualRows[0];
        const promGuardado = Number(solActual.promedio_notas ?? 0);
        const trimGuardado = extraerTrimestreDeMateriasJson(solActual.materias_json);
        const difPromedio = Math.abs(promGuardado - evaluacion.promedioTrimestreAnterior) > 0.009;
        const difTrimestre = trimGuardado !== ultimoTrimestreSnapshot.trimestre;

        if (recienGenerado || difPromedio || difTrimestre) {
          await db.execute<ResultSetHeader>(
            `
              UPDATE solicitudes
              SET promedio_notas = ?,
                  materias_json = ?
              WHERE id = ?
            `,
            [
              evaluacion.promedioTrimestreAnterior.toFixed(2),
              JSON.stringify(ultimoTrimestreSnapshot),
              solActual.id,
            ]
          );
        }
      }
    }

    return {
      success: true,
      data: {
        studentId,
        carrera: String(student.carrera),
        semestreActual,
        indiceGlobal: evaluacion.promedioGlobal,
        promedioUltimoTrimestre: evaluacion.promedioTrimestreAnterior,
        trimestreUltimoCursado: evaluacion.trimestreAuditado,
        recienGenerado,
        evaluacion,
        recordCompleto,
        historialPorTrimestre,
        ultimoTrimestreSnapshot,
      },
    };
  } catch (error) {
    console.error("Error en sincronizarYObtenerRecordAcademico:", error);
    return {
      success: false,
      data: null,
      error: "No fue posible sincronizar el récord académico del estudiante.",
    };
  }
}

/**
 * Hidrata automáticamente en bloque a TODOS los estudiantes (semestre > 1) que tengan
 * `record_academico` vacío/incompleto, `indice_global = 0.00`, o `solicitudes.promedio_notas`
 * desalineado respecto al último trimestre cursado (acotado al máximo real de 12 trimestres).
 */
export async function sincronizarTodosLosRecordsFaltantes(
  limiteLote: number = 300
): Promise<{ sincronizados: number }> {
  noStore();

  try {
    const limiteSeguro = Math.max(1, Math.min(500, Math.floor(Number(limiteLote) || 300)));

    const pendientes = await queryFresh<EstudianteDesincronizadoRow[]>(
      `
        SELECT
          st.id,
          (
            SELECT s_ult.tipo_beca
            FROM solicitudes s_ult
            WHERE s_ult.user_id = st.id
            ORDER BY s_ult.periodo_id DESC, s_ult.id DESC
            LIMIT 1
          ) AS tipo_beca_activa
        FROM students st
        JOIN carreras c
          ON LOWER(TRIM(st.carrera)) = LOWER(TRIM(c.nombre))
        WHERE st.semestre > 1
          AND EXISTS (
            SELECT 1
            FROM pensum_materias pm
            WHERE pm.carrera_id = c.id
              AND pm.trimestre_ubicacion = LEAST(${MAX_TRIMESTRE_PENSUM}, st.semestre - 1)
          )
          AND (
            NOT EXISTS (
              SELECT 1
              FROM record_academico ra
              WHERE ra.student_id = st.id
                AND ra.trimestre_cursado = LEAST(${MAX_TRIMESTRE_PENSUM}, st.semestre - 1)
            )
            OR IFNULL(st.indice_global, 0) = 0
            OR EXISTS (
              SELECT 1
              FROM solicitudes s_act
              JOIN periodos_academicos p_act ON s_act.periodo_id = p_act.id
              WHERE s_act.user_id = st.id
                AND p_act.es_actual = 1
                AND ABS(
                  IFNULL(s_act.promedio_notas, 0) - IFNULL((
                    SELECT ROUND(AVG(ra_t.nota), 2)
                    FROM record_academico ra_t
                    WHERE ra_t.student_id = st.id
                      AND ra_t.trimestre_cursado = LEAST(${MAX_TRIMESTRE_PENSUM}, st.semestre - 1)
                  ), 0)
                ) > 0.01
            )
          )
        ORDER BY st.id ASC
        LIMIT ${limiteSeguro}
      `
    );

    if (pendientes.length === 0) {
      return { sincronizados: 0 };
    }

    let sincronizados = 0;
    for (const row of pendientes) {
      const res = await sincronizarYObtenerRecordAcademico(
        Number(row.id),
        undefined,
        row.tipo_beca_activa
      );
      if (res.success) {
        sincronizados += 1;
      }
    }

    return { sincronizados };
  } catch (error) {
    console.error("Error en sincronizarTodosLosRecordsFaltantes:", error);
    return { sincronizados: 0 };
  }
}

export async function obtenerRecordParaPostulacion(
  studentIdInput: number | string
): Promise<IResultadoRecordAcademico> {
  return await sincronizarYObtenerRecordAcademico(studentIdInput);
}

export async function regenerarRecordAcademicoConPerfil(
  studentIdInput: number | string,
  perfil: PerfilAcademicoAleatorio
): Promise<IResultadoRecordAcademico> {
  const studentId = Number(studentIdInput);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return {
      success: false,
      data: null,
      error: "Identificador de estudiante inválido.",
    };
  }

  try {
    await db.execute<ResultSetHeader>(
      `DELETE FROM record_academico WHERE student_id = ?`,
      [studentId]
    );

    return await sincronizarYObtenerRecordAcademico(studentId, perfil);
  } catch (error) {
    console.error("Error en regenerarRecordAcademicoConPerfil:", error);
    return {
      success: false,
      data: null,
      error: "No fue posible regenerar el récord académico.",
    };
  }
}