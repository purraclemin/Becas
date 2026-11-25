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
  type IExpedienteAcademicoOficial,
  type IMateriaPensumBase,
  type IRegistroRecordAcademico,
  type PerfilAcademicoAleatorio,
} from "@/lib/RecordAcademicoUtils";

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
  const trimestresCursados = Math.max(0, Number(semestreActual || 1) - 1);
  const mesesAtras = Math.max(2, trimestresCursados * 4 + enteroEnRango(0, 2));
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - mesesAtras, enteroEnRango(1, 28));

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
    const municipioTexto = st.municipio_residencia ? `, Mun. ${st.municipio_residencia}` : "";

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
 * Sincroniza de forma idempotente el récord académico oficial del estudiante:
 * - Semestre 1: queda habilitado sin materias precargadas.
 * - Semestre > 1: genera y persiste una sola vez las notas aleatorias de los
 *   trimestres cursados (1 hasta semestre - 1) y sincroniza students.indice_global.
 */
export async function sincronizarYObtenerRecordAcademico(
  studentIdInput: number | string,
  perfilForzado?: PerfilAcademicoAleatorio
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

    // 1. Obtener ficha del estudiante y cruzar su carrera de forma insensible a mayúsculas
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
    const carreraId = Number(student.carrera_id);
    const indiceGuardado = Number(student.indice_global);

    // 2. Regla de 1er Trimestre (nuevo ingreso): habilitado sin materias precargadas
    if (semestreActual <= 1) {
      const evaluacion = evaluarElegibilidadAcademica(semestreActual, []);
      return {
        success: true,
        data: {
          studentId,
          carrera: String(student.carrera),
          semestreActual,
          indiceGlobal: 0,
          recienGenerado: false,
          evaluacion,
          recordCompleto: [],
          historialPorTrimestre: [],
          ultimoTrimestreSnapshot: null,
        },
      };
    }

    // 3. Consultar materias ya persistidas en record_academico
    let recordCompleto = await consultarRecordPersistido(studentId);
    let recienGenerado = false;

    // 4. Obtener pensum cursado (< semestreActual) deduplicado con GROUP BY estricto
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
          GROUP BY pm.trimestre_ubicacion, pm.codigo_materia
          ORDER BY pm.trimestre_ubicacion ASC, pm.codigo_materia ASC
        `,
        [carreraId, semestreActual]
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

      // 5. Generar e insertar notas aleatorias solo para materias aún no persistidas
      if (materiasFaltantes.length > 0) {
        const materiasGeneradas = generarNotasAleatoriasPorPerfil(
          materiasFaltantes,
          perfilForzado
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

    // 6. Evaluar elegibilidad reglamentaria y sincronizar students.indice_global
    const evaluacion = evaluarElegibilidadAcademica(
      semestreActual,
      recordCompleto
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
        [evaluacion.promedioGlobal, studentId]
      );
    }

    const historialPorTrimestre = agruparRecordPorTrimestre(recordCompleto);
    const ultimoTrimestreSnapshot = construirUltimoTrimestreSnapshot(
      recordCompleto,
      semestreActual
    );

    return {
      success: true,
      data: {
        studentId,
        carrera: String(student.carrera),
        semestreActual,
        indiceGlobal: evaluacion.promedioGlobal,
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
 * Obtiene el expediente sincronizado del estudiante para el flujo de postulación
 * (materias del último trimestre cursado y evaluación completa de toda la carrera).
 */
export async function obtenerRecordParaPostulacion(
  studentIdInput: number | string
): Promise<IResultadoRecordAcademico> {
  return await sincronizarYObtenerRecordAcademico(studentIdInput);
}

/**
 * Utilidad opcional de soporte/pruebas para regenerar el récord de un estudiante
 * con un perfil específico (APTO, PROMEDIO_BAJO o CON_REPROBADA).
 */
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