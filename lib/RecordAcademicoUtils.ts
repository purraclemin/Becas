// lib/RecordAcademicoUtils.ts

export const NOTA_MINIMA_APROBATORIA = 10;
export const PROMEDIO_MINIMO_BECA = 16;
export const PROMEDIO_MINIMO_EXCELENCIA = 18;
export const TRIMESTRE_MINIMO_EXCELENCIA = 4;
export const SISTEMA_ADMIN_ID = 0;

export type PerfilAcademicoAleatorio =
  | "APTO"
  | "PROMEDIO_BAJO"
  | "CON_REPROBADA";

export type CategoriaRechazoAcademico =
  | "MATERIA_REPROBADA"
  | "PROMEDIO_BAJO"
  | null;

export type FaseEvaluacionBeca = "ingreso" | "renovacion";

/**
 * 8 modalidades habilitadas para postulación directa del estudiante en /postulacion
 */
export const MODALIDADES_POSTULABLES_ESTUDIANTE = [
  "BECA APRENDIZAJE",
  "BECA POR DISCAPACIDAD",
  "AYUDA ECONÓMICA",
  "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES",
  "AYUDA ECONÓMICA A TRABAJADORES",
  "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES",
  "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES",
  "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN",
] as const;

export type ModalidadPostulableEstudiante =
  (typeof MODALIDADES_POSTULABLES_ESTUDIANTE)[number];

/**
 * 2 modalidades de gestión institucional exclusiva (NO se solicitan en /postulacion):
 * - BECA A LA EXCELENCIA ACADÉMICA (Art. 8 y 32: automática por mayor Índice Global >= 18 por carrera)
 * - BECA SOCIAL APRENDIZAJE (Art. 6, 11-13 y 33: concurso anual registrado por Coordinación)
 */
export const MODALIDADES_INSTITUCIONALES = [
  "BECA A LA EXCELENCIA ACADÉMICA",
  "BECA SOCIAL APRENDIZAJE",
] as const;

export type ModalidadInstitucional =
  (typeof MODALIDADES_INSTITUCIONALES)[number];

/**
 * Catálogo maestro oficial completo (10 modalidades — Normativa UNIMAR Octubre 2023)
 */
export const MODALIDADES_BECA_OFICIALES = [
  "BECA SOCIAL APRENDIZAJE",
  "BECA APRENDIZAJE",
  "BECA POR DISCAPACIDAD",
  "BECA A LA EXCELENCIA ACADÉMICA",
  "AYUDA ECONÓMICA",
  "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES",
  "AYUDA ECONÓMICA A TRABAJADORES",
  "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES",
  "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES",
  "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN",
] as const;

export type ModalidadBecaOficial = (typeof MODALIDADES_BECA_OFICIALES)[number];

/**
 * Catálogo unificado de departamentos institucionales para asignación de becarios
 */
export const DEPARTAMENTOS_UNIMAR_OFICIALES = [
  "Bienestar Estudiantil",
  "Secretaría General",
  "Control de Estudios",
  "Servicio Comunitario",
  "Biblioteca",
  "Centro de Salud",
] as const;

export type DepartamentoUnimarOficial =
  (typeof DEPARTAMENTOS_UNIMAR_OFICIALES)[number];

export interface IReglaTipoBeca {
  cupoMaximo: number | null;
  cupoAnualNuevos?: number | null;
  indiceMinimo: number;
  indiceIngresoPrimerTrimestre: number;
  indiceMantenimiento: number;
  trimestreMinimo: number;
  usaIndiceAcumulado: boolean;
  esPostulablePorEstudiante: boolean;
  requiereEstudioSocioeconomico: boolean;
}

/**
 * Reglamento oficial UNIMAR (Reunión Ordinaria N° 007-2023, 13 de octubre 2023):
 * - Beca a la Excelencia Académica: única modalidad evaluada por Índice Global Acumulado >= 18 (Art. 8).
 * - Resto de modalidades: evaluadas por Promedio del Trimestre Inmediatamente Anterior >= 16 y cero reprobadas (< 10).
 */
export const REGLAMENTO_TIPOS_BECA: Record<ModalidadBecaOficial, IReglaTipoBeca> = {
  "BECA APRENDIZAJE": {
    cupoMaximo: 25,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 18,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "BECA SOCIAL APRENDIZAJE": {
    cupoMaximo: 60,
    cupoAnualNuevos: 10,
    indiceMinimo: 18,
    indiceIngresoPrimerTrimestre: 18,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: false,
    requiereEstudioSocioeconomico: false,
  },
  "BECA POR DISCAPACIDAD": {
    cupoMaximo: 20,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "BECA A LA EXCELENCIA ACADÉMICA": {
    cupoMaximo: 1,
    indiceMinimo: 18,
    indiceIngresoPrimerTrimestre: 18,
    indiceMantenimiento: 18,
    trimestreMinimo: 4,
    usaIndiceAcumulado: true,
    esPostulablePorEstudiante: false,
    requiereEstudioSocioeconomico: false,
  },
  "AYUDA ECONÓMICA": {
    cupoMaximo: 30,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "AYUDA ECONÓMICA A TRABAJADORES": {
    cupoMaximo: null,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES": {
    cupoMaximo: null,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES": {
    cupoMaximo: 6,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES": {
    cupoMaximo: null,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
  "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN": {
    cupoMaximo: null,
    indiceMinimo: 16,
    indiceIngresoPrimerTrimestre: 16,
    indiceMantenimiento: 16,
    trimestreMinimo: 1,
    usaIndiceAcumulado: false,
    esPostulablePorEstudiante: true,
    requiereEstudioSocioeconomico: true,
  },
};

const ALIAS_MODALIDADES: Record<string, ModalidadBecaOficial> = {
  "beca social": "BECA SOCIAL APRENDIZAJE",
  "beca social aprendizaje": "BECA SOCIAL APRENDIZAJE",
  "beca aprendizaje": "BECA APRENDIZAJE",
  "beca por discapacidad": "BECA POR DISCAPACIDAD",
  "beca a la excelencia": "BECA A LA EXCELENCIA ACADÉMICA",
  "beca a la excelencia academica": "BECA A LA EXCELENCIA ACADÉMICA",
  "ayuda economica": "AYUDA ECONÓMICA",
  "ayuda economica general": "AYUDA ECONÓMICA",
  "ayuda economica familiar": "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES",
  "ayuda economica familiar becas": "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES",
  "ayuda economica para estudiantes con familiares": "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES",
  "ayuda economica a trabajadores": "AYUDA ECONÓMICA A TRABAJADORES",
  "ayuda economica para trabajadores": "AYUDA ECONÓMICA A TRABAJADORES",
  "ayuda economica para hijos de trabajadores": "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES",
  "ayuda economica para estudiantes preparadores": "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES",
  "ayuda economica para estudiantes preparadoresl": "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES",
  "ayuda economica por actividades extracurriculares": "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN",
  "ayuda economica por actividades deportivas, culturales y orfeon": "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN",
};

const VARIANTES_POR_OFICIAL: Record<ModalidadBecaOficial, ReadonlyArray<string>> = {
  "BECA SOCIAL APRENDIZAJE": ["beca social aprendizaje", "beca social"],
  "BECA APRENDIZAJE": ["beca aprendizaje"],
  "BECA POR DISCAPACIDAD": ["beca por discapacidad"],
  "BECA A LA EXCELENCIA ACADÉMICA": [
    "beca a la excelencia académica",
    "beca a la excelencia academica",
    "beca a la excelencia",
  ],
  "AYUDA ECONÓMICA": [
    "ayuda económica",
    "ayuda economica",
    "ayuda económica general",
    "ayuda economica general",
  ],
  "AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES": [
    "ayuda económica para estudiantes con familiares",
    "ayuda economica para estudiantes con familiares",
    "ayuda económica familiar",
    "ayuda economica familiar",
    "ayuda económica familiar becas",
    "ayuda economica familiar becas",
  ],
  "AYUDA ECONÓMICA A TRABAJADORES": [
    "ayuda económica a trabajadores",
    "ayuda economica a trabajadores",
    "ayuda económica para trabajadores",
    "ayuda economica para trabajadores",
  ],
  "AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES": [
    "ayuda económica para hijos de trabajadores",
    "ayuda economica para hijos de trabajadores",
  ],
  "AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES": [
    "ayuda económica para estudiantes preparadores",
    "ayuda economica para estudiantes preparadores",
    "ayuda económica para estudiantes preparadoresl",
    "ayuda economica para estudiantes preparadoresl",
  ],
  "AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN": [
    "ayuda económica por actividades deportivas, culturales y orfeón",
    "ayuda economica por actividades deportivas, culturales y orfeon",
    "ayuda económica por actividades extracurriculares",
    "ayuda economica por actividades extracurriculares",
  ],
};

function limpiarClaveModalidad(texto: string | null | undefined): string {
  return String(texto ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function normalizarTipoBeca(tipoBeca: string | null | undefined): string {
  return String(tipoBeca ?? "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizarTipoBecaOficial(
  tipoBeca: string | null | undefined
): ModalidadBecaOficial | "" {
  const clave = limpiarClaveModalidad(tipoBeca);
  if (!clave) return "";
  return ALIAS_MODALIDADES[clave] ?? "";
}

export function obtenerVariantesTipoBeca(tipoBeca: string | null | undefined): string[] {
  const oficial = normalizarTipoBecaOficial(tipoBeca);
  if (oficial) {
    return [...VARIANTES_POR_OFICIAL[oficial]];
  }
  const limpio = String(tipoBeca ?? "").trim().toLowerCase();
  return limpio ? [limpio] : [];
}

export function obtenerReglaPorTipoBeca(
  tipoBeca: string | null | undefined
): IReglaTipoBeca | null {
  const oficial = normalizarTipoBecaOficial(tipoBeca);
  if (!oficial) return null;
  return REGLAMENTO_TIPOS_BECA[oficial];
}

export function esModalidadPostulableEstudiante(
  tipoBeca: string | null | undefined
): boolean {
  const regla = obtenerReglaPorTipoBeca(tipoBeca);
  return Boolean(regla?.esPostulablePorEstudiante);
}

export function esModalidadInstitucional(
  tipoBeca: string | null | undefined
): boolean {
  const oficial = normalizarTipoBecaOficial(tipoBeca);
  return (
    oficial === "BECA A LA EXCELENCIA ACADÉMICA" ||
    oficial === "BECA SOCIAL APRENDIZAJE"
  );
}

export function esBecaExcelenciaAcademica(
  tipoBeca: string | null | undefined
): boolean {
  return normalizarTipoBecaOficial(tipoBeca) === "BECA A LA EXCELENCIA ACADÉMICA";
}

export function esBecaSocialAprendizaje(
  tipoBeca: string | null | undefined
): boolean {
  return normalizarTipoBecaOficial(tipoBeca) === "BECA SOCIAL APRENDIZAJE";
}

export function obtenerPromedioMinimoPorTipoBeca(
  tipoBeca: string | null | undefined,
  fase: FaseEvaluacionBeca = "ingreso",
  semestreActual?: number
): number {
  const oficial = normalizarTipoBecaOficial(tipoBeca);
  if (!oficial) return PROMEDIO_MINIMO_BECA;

  const regla = REGLAMENTO_TIPOS_BECA[oficial];
  if (fase === "renovacion") {
    return regla.indiceMantenimiento;
  }

  if (semestreActual !== undefined && Number(semestreActual) <= 1) {
    return regla.indiceIngresoPrimerTrimestre;
  }

  return regla.indiceMinimo;
}

export interface IMateriaPensumBase {
  pensum_materia_id: number;
  trimestre_ubicacion: number;
  codigo_materia: string;
  nombre_materia: string;
  unidades_credito: number;
}

export interface IMateriaGenerada extends IMateriaPensumBase {
  nota: number;
  aprobada: 0 | 1;
}

export interface IRegistroRecordAcademico {
  id: number;
  student_id: number;
  pensum_materia_id: number;
  trimestre_cursado: number;
  codigo_materia: string;
  nombre_materia: string;
  unidades_credito: number;
  nota: number;
  aprobada: boolean;
  created_at: string;
}

export interface IMateriaSnapshotItem {
  codigo: string;
  nombre: string;
  creditos: number;
  nota: number;
}

export interface IMateriasSnapshotJSON {
  trimestre: number;
  materias: IMateriaSnapshotItem[];
  fecha_proceso: string;
}

export interface ITrimestreHistorial {
  trimestre: number;
  promedioTrimestre: number;
  totalMaterias: number;
  materiasReprobadas: number;
  materias: IRegistroRecordAcademico[];
}

export interface IEvaluacionAcademica {
  apto: boolean;
  esNuevoIngreso: boolean;
  semestreActual: number;
  trimestreAuditado: number;
  promedioGlobal: number;
  promedioTrimestreAnterior: number;
  promedioEvaluado: number;
  usaIndiceAcumulado: boolean;
  promedioMinimoRequerido: number;
  totalMaterias: number;
  totalAprobadas: number;
  totalReprobadas: number;
  materiasReprobadas: IRegistroRecordAcademico[];
  categoriaRechazo: CategoriaRechazoAcademico;
  motivoRechazo: string | null;
}

export interface IEvaluacionTrimestre {
  apto: boolean;
  trimestreAuditado: number;
  promedioTrimestre: number;
  promedioGlobal: number;
  promedioEvaluado: number;
  usaIndiceAcumulado: boolean;
  promedioMinimoRequerido: number;
  totalMaterias: number;
  totalReprobadas: number;
  materiasReprobadas: IRegistroRecordAcademico[];
  categoriaRechazo: CategoriaRechazoAcademico;
  motivoRechazo: string | null;
}

export interface IExpedienteAcademicoOficial {
  studentId: number;
  carrera: string;
  semestreActual: number;
  indiceGlobal: number;
  promedioUltimoTrimestre: number;
  trimestreUltimoCursado: number;
  recienGenerado: boolean;
  evaluacion: IEvaluacionAcademica;
  recordCompleto: IRegistroRecordAcademico[];
  historialPorTrimestre: ITrimestreHistorial[];
  ultimoTrimestreSnapshot: IMateriasSnapshotJSON | null;
}

function enteroAleatorio(min: number, max: number): number {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export function sortearPerfilAcademico(): PerfilAcademicoAleatorio {
  const r = Math.random();
  if (r < 0.65) return "APTO";
  if (r < 0.85) return "PROMEDIO_BAJO";
  return "CON_REPROBADA";
}

export function calcularPromedioAritmetico(notas: number[]): number {
  if (notas.length === 0) return 0;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return Number((suma / notas.length).toFixed(2));
}

/**
 * Extrae las materias y el promedio aritmético del trimestre inmediatamente anterior (semestreActual - 1).
 */
export function calcularDatosTrimestreAnterior(
  record: IRegistroRecordAcademico[],
  semestreActual: number
): {
  trimestreAuditado: number;
  promedioTrimestre: number;
  materiasTrimestre: IRegistroRecordAcademico[];
} {
  if (semestreActual <= 1 || record.length === 0) {
    return {
      trimestreAuditado: 0,
      promedioTrimestre: 0,
      materiasTrimestre: [],
    };
  }

  const trimestreObjetivo = Math.max(1, semestreActual - 1);
  let materiasTrimestre = record.filter(
    (item) => Number(item.trimestre_cursado) === trimestreObjetivo
  );
  let trimestreFinal = trimestreObjetivo;

  if (materiasTrimestre.length === 0) {
    trimestreFinal = Math.max(...record.map((item) => Number(item.trimestre_cursado)));
    materiasTrimestre = record.filter(
      (item) => Number(item.trimestre_cursado) === trimestreFinal
    );
  }

  const promedioTrimestre = calcularPromedioAritmetico(
    materiasTrimestre.map((m) => Number(m.nota))
  );

  return {
    trimestreAuditado: trimestreFinal,
    promedioTrimestre,
    materiasTrimestre,
  };
}

export function generarNotasAleatoriasPorPerfil(
  materias: IMateriaPensumBase[],
  perfilForzado?: PerfilAcademicoAleatorio,
  promedioMinimoObjetivo: number = PROMEDIO_MINIMO_BECA
): IMateriaGenerada[] {
  if (materias.length === 0) return [];

  const perfil = perfilForzado ?? sortearPerfilAcademico();
  const minimoObjetivo = Math.max(PROMEDIO_MINIMO_BECA, Math.min(20, promedioMinimoObjetivo));

  if (perfil === "APTO") {
    const poolApto =
      minimoObjetivo >= 18
        ? [17, 18, 18, 18, 19, 19, 19, 20, 20]
        : [15, 16, 16, 17, 17, 18, 18, 19, 19, 20];

    const generadas: IMateriaGenerada[] = materias.map((m) => {
      const nota = poolApto[enteroAleatorio(0, poolApto.length - 1)];
      return {
        ...m,
        nota,
        aprobada: 1,
      };
    });

    let promedio = calcularPromedioAritmetico(generadas.map((g) => g.nota));
    let iteraciones = 0;
    while (promedio < minimoObjetivo && iteraciones < generadas.length * 6) {
      let idxMenor = 0;
      for (let i = 1; i < generadas.length; i++) {
        if (generadas[i].nota < generadas[idxMenor].nota) {
          idxMenor = i;
        }
      }
      if (generadas[idxMenor].nota < 20) {
        generadas[idxMenor].nota += 1;
      }
      promedio = calcularPromedioAritmetico(generadas.map((g) => g.nota));
      iteraciones += 1;
    }

    return generadas;
  }

  if (perfil === "PROMEDIO_BAJO") {
    const techoNota = Math.max(NOTA_MINIMA_APROBATORIA, Math.floor(minimoObjetivo) - 1);
    return materias.map((m) => {
      const nota = enteroAleatorio(NOTA_MINIMA_APROBATORIA, techoNota);
      return {
        ...m,
        nota,
        aprobada: 1,
      };
    });
  }

  const generadas: IMateriaGenerada[] = materias.map((m) => {
    const nota = enteroAleatorio(13, 19);
    return {
      ...m,
      nota,
      aprobada: 1,
    };
  });

  const cantidadReprobadas =
    generadas.length === 1 ? 1 : enteroAleatorio(1, Math.min(2, generadas.length));
  const indicesElegidos = new Set<number>();

  while (indicesElegidos.size < cantidadReprobadas) {
    indicesElegidos.add(enteroAleatorio(0, generadas.length - 1));
  }

  indicesElegidos.forEach((idx) => {
    const notaReprobada = enteroAleatorio(5, 9);
    generadas[idx] = {
      ...generadas[idx],
      nota: notaReprobada,
      aprobada: 0,
    };
  });

  return generadas;
}

/**
 * Evalúa la elegibilidad académica oficial:
 * 1. Semestre 1 (nuevo ingreso): habilitado sin historial previo en UNIMAR.
 * 2. Semestre > 1:
 *    - Cero materias reprobadas (< 10) en el TRIMESTRE INMEDIATAMENTE ANTERIOR (semestre - 1).
 *    - BECA A LA EXCELENCIA ACADÉMICA: Índice Global Acumulado >= 18.00 (Art. 8).
 *    - Todas las demás modalidades: Promedio del Trimestre Anterior >= 16.00 (o mínimo reglamentario).
 */
export function evaluarElegibilidadAcademica(
  semestreActual: number,
  record: IRegistroRecordAcademico[],
  tipoBeca?: string | null
): IEvaluacionAcademica {
  const oficial = normalizarTipoBecaOficial(tipoBeca);
  const regla = oficial ? REGLAMENTO_TIPOS_BECA[oficial] : null;
  const usaIndiceAcumulado = Boolean(regla?.usaIndiceAcumulado);
  const promedioMinimoRequerido = obtenerPromedioMinimoPorTipoBeca(
    tipoBeca,
    "ingreso",
    semestreActual
  );

  if (semestreActual <= 1) {
    return {
      apto: true,
      esNuevoIngreso: true,
      semestreActual,
      trimestreAuditado: 0,
      promedioGlobal: 0,
      promedioTrimestreAnterior: 0,
      promedioEvaluado: 0,
      usaIndiceAcumulado,
      promedioMinimoRequerido,
      totalMaterias: 0,
      totalAprobadas: 0,
      totalReprobadas: 0,
      materiasReprobadas: [],
      categoriaRechazo: null,
      motivoRechazo: null,
    };
  }

  const promedioGlobal = calcularPromedioAritmetico(
    record.map((item) => Number(item.nota))
  );
  const {
    trimestreAuditado,
    promedioTrimestre: promedioTrimestreAnterior,
    materiasTrimestre,
  } = calcularDatosTrimestreAnterior(record, semestreActual);

  const promedioEvaluado = usaIndiceAcumulado
    ? promedioGlobal
    : promedioTrimestreAnterior;

  // Auditoría estricta de materias reprobadas únicamente en el trimestre inmediatamente anterior
  const materiasReprobadas = materiasTrimestre.filter(
    (item) => Number(item.nota) < NOTA_MINIMA_APROBATORIA || !item.aprobada
  );
  const totalReprobadas = materiasReprobadas.length;
  const totalAprobadas = materiasTrimestre.length - totalReprobadas;

  if (totalReprobadas > 0) {
    const detalleMaterias = materiasReprobadas
      .map(
        (m) =>
          `${m.codigo_materia} - ${m.nombre_materia} (T-${m.trimestre_cursado}: ${Number(
            m.nota
          ).toFixed(2)} pts)`
      )
      .join(", ");

    const detallePromedio =
      promedioEvaluado < promedioMinimoRequerido
        ? ` Adicionalmente, su ${
            usaIndiceAcumulado
              ? "índice académico acumulado"
              : `promedio del Trimestre ${trimestreAuditado}`
          } (${promedioEvaluado.toFixed(
            2
          )} pts) es inferior al mínimo exigido de ${promedioMinimoRequerido.toFixed(2)} puntos.`
        : "";

    return {
      apto: false,
      esNuevoIngreso: false,
      semestreActual,
      trimestreAuditado,
      promedioGlobal,
      promedioTrimestreAnterior,
      promedioEvaluado,
      usaIndiceAcumulado,
      promedioMinimoRequerido,
      totalMaterias: materiasTrimestre.length,
      totalAprobadas,
      totalReprobadas,
      materiasReprobadas,
      categoriaRechazo: "MATERIA_REPROBADA",
      motivoRechazo: `Rechazo automático por reglamento académico: registró ${totalReprobadas} asignatura(s) reprobada(s) (< 10 pts) en el Trimestre ${trimestreAuditado} (${detalleMaterias}).${detallePromedio}`,
    };
  }

  if (promedioEvaluado < promedioMinimoRequerido) {
    return {
      apto: false,
      esNuevoIngreso: false,
      semestreActual,
      trimestreAuditado,
      promedioGlobal,
      promedioTrimestreAnterior,
      promedioEvaluado,
      usaIndiceAcumulado,
      promedioMinimoRequerido,
      totalMaterias: materiasTrimestre.length,
      totalAprobadas,
      totalReprobadas: 0,
      materiasReprobadas: [],
      categoriaRechazo: "PROMEDIO_BAJO",
      motivoRechazo: `Rechazo automático por reglamento académico: su ${
        usaIndiceAcumulado
          ? "índice académico acumulado (Global)"
          : `promedio del Trimestre ${trimestreAuditado}`
      } (${promedioEvaluado.toFixed(
        2
      )} pts) es inferior al mínimo exigido de ${promedioMinimoRequerido.toFixed(2)} puntos.`,
    };
  }

  return {
    apto: true,
    esNuevoIngreso: false,
    semestreActual,
    trimestreAuditado,
    promedioGlobal,
    promedioTrimestreAnterior,
    promedioEvaluado,
    usaIndiceAcumulado,
    promedioMinimoRequerido,
    totalMaterias: materiasTrimestre.length,
    totalAprobadas,
    totalReprobadas: 0,
    materiasReprobadas: [],
    categoriaRechazo: null,
    motivoRechazo: null,
  };
}

/**
 * Audita el trimestre recién culminado (semestre - 1) al cambiar de periodo según Normativa UNIMAR 2023:
 * - Cero materias reprobadas (< 10) en el trimestre auditado.
 * - Promedio del trimestre >= 16.00 (o Índice Global Acumulado >= 18.00 en Beca a la Excelencia Académica Art. 8).
 */
export function evaluarElegibilidadTrimestre(
  trimestreAuditado: number,
  record: IRegistroRecordAcademico[],
  tipoBeca?: string | null,
  fase: FaseEvaluacionBeca = "renovacion"
): IEvaluacionTrimestre {
  const oficial = normalizarTipoBecaOficial(tipoBeca);
  const regla = oficial ? REGLAMENTO_TIPOS_BECA[oficial] : null;
  const usaIndiceAcumulado = Boolean(regla?.usaIndiceAcumulado);
  const promedioMinimoRequerido = obtenerPromedioMinimoPorTipoBeca(tipoBeca, fase);
  const tipoBecaEtiqueta = oficial || normalizarTipoBeca(tipoBeca) || "BENEFICIO INSTITUCIONAL";

  const materiasTrimestre = record.filter(
    (item) => Number(item.trimestre_cursado) === Number(trimestreAuditado)
  );
  const materiasEvaluadas =
    materiasTrimestre.length > 0 ? materiasTrimestre : record;

  const promedioTrimestre = calcularPromedioAritmetico(
    materiasEvaluadas.map((item) => Number(item.nota))
  );
  const promedioGlobal = calcularPromedioAritmetico(
    record.map((item) => Number(item.nota))
  );
  const promedioEvaluado = usaIndiceAcumulado ? promedioGlobal : promedioTrimestre;

  const materiasReprobadas = materiasEvaluadas.filter(
    (item) => Number(item.nota) < NOTA_MINIMA_APROBATORIA || !item.aprobada
  );
  const totalReprobadas = materiasReprobadas.length;

  if (totalReprobadas > 0) {
    const detalleMaterias = materiasReprobadas
      .map(
        (m) =>
          `${m.codigo_materia} - ${m.nombre_materia} (${Number(m.nota).toFixed(2)} pts)`
      )
      .join(", ");

    const detallePromedio =
      promedioEvaluado < promedioMinimoRequerido
        ? ` Además, su ${
            usaIndiceAcumulado ? "índice académico acumulado" : "promedio del trimestre"
          } (${promedioEvaluado.toFixed(
            2
          )} pts) quedó por debajo del mínimo de ${promedioMinimoRequerido.toFixed(
            2
          )} pts exigido para ${tipoBecaEtiqueta}.`
        : "";

    return {
      apto: false,
      trimestreAuditado,
      promedioTrimestre,
      promedioGlobal,
      promedioEvaluado,
      usaIndiceAcumulado,
      promedioMinimoRequerido,
      totalMaterias: materiasEvaluadas.length,
      totalReprobadas,
      materiasReprobadas,
      categoriaRechazo: "MATERIA_REPROBADA",
      motivoRechazo: `Suspensión definitiva del beneficio (Art. 26 y 28) en auditoría del Trimestre ${trimestreAuditado}: reprobó ${totalReprobadas} asignatura(s) (${detalleMaterias}).${detallePromedio}`,
    };
  }

  if (promedioEvaluado < promedioMinimoRequerido) {
    return {
      apto: false,
      trimestreAuditado,
      promedioTrimestre,
      promedioGlobal,
      promedioEvaluado,
      usaIndiceAcumulado,
      promedioMinimoRequerido,
      totalMaterias: materiasEvaluadas.length,
      totalReprobadas: 0,
      materiasReprobadas: [],
      categoriaRechazo: "PROMEDIO_BAJO",
      motivoRechazo: `Suspensión definitiva del beneficio (Art. 26 y 28) en auditoría del Trimestre ${trimestreAuditado}: su ${
        usaIndiceAcumulado ? "índice académico acumulado" : "promedio del trimestre"
      } (${promedioEvaluado.toFixed(2)} pts) bajó del mínimo exigido de ${promedioMinimoRequerido.toFixed(
        2
      )} pts para ${tipoBecaEtiqueta}.`,
    };
  }

  return {
    apto: true,
    trimestreAuditado,
    promedioTrimestre,
    promedioGlobal,
    promedioEvaluado,
    usaIndiceAcumulado,
    promedioMinimoRequerido,
    totalMaterias: materiasEvaluadas.length,
    totalReprobadas: 0,
    materiasReprobadas: [],
    categoriaRechazo: null,
    motivoRechazo: null,
  };
}

export function agruparRecordPorTrimestre(
  record: IRegistroRecordAcademico[]
): ITrimestreHistorial[] {
  const mapa = new Map<number, IRegistroRecordAcademico[]>();

  for (const item of record) {
    const lista = mapa.get(item.trimestre_cursado) ?? [];
    lista.push(item);
    mapa.set(item.trimestre_cursado, lista);
  }

  const trimestresOrdenados = Array.from(mapa.keys()).sort((a, b) => b - a);

  return trimestresOrdenados.map((trimestre) => {
    const materias = mapa.get(trimestre) ?? [];
    const promedioTrimestre = calcularPromedioAritmetico(
      materias.map((m) => Number(m.nota))
    );
    const materiasReprobadas = materias.filter(
      (m) => Number(m.nota) < NOTA_MINIMA_APROBATORIA || !m.aprobada
    ).length;

    return {
      trimestre,
      promedioTrimestre,
      totalMaterias: materias.length,
      materiasReprobadas,
      materias,
    };
  });
}

export function construirSnapshotDeTrimestre(
  record: IRegistroRecordAcademico[],
  trimestreObjetivo: number
): IMateriasSnapshotJSON | null {
  if (record.length === 0) return null;

  let materiasTrimestre = record.filter(
    (m) => m.trimestre_cursado === trimestreObjetivo
  );

  let trimestreFinal = trimestreObjetivo;
  if (materiasTrimestre.length === 0) {
    trimestreFinal = Math.max(...record.map((m) => m.trimestre_cursado));
    materiasTrimestre = record.filter(
      (m) => m.trimestre_cursado === trimestreFinal
    );
  }

  return {
    trimestre: trimestreFinal,
    materias: materiasTrimestre.map((m) => ({
      codigo: m.codigo_materia,
      nombre: m.nombre_materia,
      creditos: Number(m.unidades_credito ?? 3),
      nota: Number(m.nota),
    })),
    fecha_proceso: new Date().toISOString(),
  };
}

export function construirUltimoTrimestreSnapshot(
  record: IRegistroRecordAcademico[],
  semestreActual: number
): IMateriasSnapshotJSON | null {
  if (semestreActual <= 1 || record.length === 0) return null;
  return construirSnapshotDeTrimestre(record, semestreActual - 1);
}