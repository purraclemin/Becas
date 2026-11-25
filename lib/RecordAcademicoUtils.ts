// lib/RecordAcademicoUtils.ts

export const NOTA_MINIMA_APROBATORIA = 10;
export const PROMEDIO_MINIMO_BECA = 16;
export const SISTEMA_ADMIN_ID = 0;

export type PerfilAcademicoAleatorio =
  | "APTO"
  | "PROMEDIO_BAJO"
  | "CON_REPROBADA";

export type CategoriaRechazoAcademico =
  | "MATERIA_REPROBADA"
  | "PROMEDIO_BAJO"
  | null;

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
  promedioGlobal: number;
  totalMaterias: number;
  totalAprobadas: number;
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
  recienGenerado: boolean;
  evaluacion: IEvaluacionAcademica;
  recordCompleto: IRegistroRecordAcademico[];
  historialPorTrimestre: ITrimestreHistorial[];
  ultimoTrimestreSnapshot: IMateriasSnapshotJSON | null;
}

/**
 * Entero aleatorio inclusivo entre min y max.
 */
function enteroAleatorio(min: number, max: number): number {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

/**
 * Sortea un perfil académico realista para generar el expediente inicial:
 * - 65% APTO (sin reprobadas y promedio aritmético >= 16.00)
 * - 20% PROMEDIO_BAJO (todas aprobadas 10..15, promedio < 16.00)
 * - 15% CON_REPROBADA (1 o 2 materias reprobadas < 10 en la carrera)
 */
export function sortearPerfilAcademico(): PerfilAcademicoAleatorio {
  const r = Math.random();
  if (r < 0.65) return "APTO";
  if (r < 0.85) return "PROMEDIO_BAJO";
  return "CON_REPROBADA";
}

/**
 * Calcula el promedio aritmético simple con 2 decimales.
 */
export function calcularPromedioAritmetico(notas: number[]): number {
  if (notas.length === 0) return 0;
  const suma = notas.reduce((acc, nota) => acc + nota, 0);
  return Number((suma / notas.length).toFixed(2));
}

/**
 * Genera calificaciones aleatorias persistibles para una lista de materias del pensum
 * respetando estrictamente el perfil sorteado.
 */
export function generarNotasAleatoriasPorPerfil(
  materias: IMateriaPensumBase[],
  perfilForzado?: PerfilAcademicoAleatorio
): IMateriaGenerada[] {
  if (materias.length === 0) return [];

  const perfil = perfilForzado ?? sortearPerfilAcademico();

  if (perfil === "APTO") {
    const poolApto = [15, 16, 16, 17, 17, 18, 18, 19, 19, 20];
    const generadas: IMateriaGenerada[] = materias.map((m) => {
      const nota = poolApto[enteroAleatorio(0, poolApto.length - 1)];
      return {
        ...m,
        nota,
        aprobada: 1,
      };
    });

    // Garantía matemática de que el promedio aritmético simple sea >= 16.00
    let promedio = calcularPromedioAritmetico(generadas.map((g) => g.nota));
    let iteraciones = 0;
    while (promedio < PROMEDIO_MINIMO_BECA && iteraciones < generadas.length * 5) {
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
    return materias.map((m) => {
      const nota = enteroAleatorio(10, 15);
      return {
        ...m,
        nota,
        aprobada: 1,
      };
    });
  }

  // Perfil CON_REPROBADA: materias aprobadas normales + 1 o 2 materias reprobadas (< 10)
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
 * Evalúa el récord académico completo de un estudiante aplicando las reglas oficiales:
 * 1. Semestre 1 (nuevo ingreso): habilitado sin materias precargadas.
 * 2. Semestre > 1: cero materias reprobadas (< 10) en toda la carrera.
 * 3. Semestre > 1: promedio aritmético simple >= 16.00.
 */
export function evaluarElegibilidadAcademica(
  semestreActual: number,
  record: IRegistroRecordAcademico[]
): IEvaluacionAcademica {
  if (semestreActual <= 1) {
    return {
      apto: true,
      esNuevoIngreso: true,
      semestreActual,
      promedioGlobal: 0,
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
  const materiasReprobadas = record.filter(
    (item) => Number(item.nota) < NOTA_MINIMA_APROBATORIA || !item.aprobada
  );
  const totalReprobadas = materiasReprobadas.length;
  const totalAprobadas = record.length - totalReprobadas;

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
      promedioGlobal < PROMEDIO_MINIMO_BECA
        ? ` Adicionalmente, su promedio acumulado (${promedioGlobal.toFixed(
            2
          )} pts) es inferior al mínimo de ${PROMEDIO_MINIMO_BECA.toFixed(2)} puntos.`
        : "";

    return {
      apto: false,
      esNuevoIngreso: false,
      semestreActual,
      promedioGlobal,
      totalMaterias: record.length,
      totalAprobadas,
      totalReprobadas,
      materiasReprobadas,
      categoriaRechazo: "MATERIA_REPROBADA",
      motivoRechazo: `Rechazo automático por reglamento académico: posee ${totalReprobadas} materia(s) reprobada(s) en su trayectoria universitaria (${detalleMaterias}).${detallePromedio}`,
    };
  }

  if (promedioGlobal < PROMEDIO_MINIMO_BECA) {
    return {
      apto: false,
      esNuevoIngreso: false,
      semestreActual,
      promedioGlobal,
      totalMaterias: record.length,
      totalAprobadas,
      totalReprobadas: 0,
      materiasReprobadas: [],
      categoriaRechazo: "PROMEDIO_BAJO",
      motivoRechazo: `Rechazo automático por reglamento académico: su promedio aritmético acumulado (${promedioGlobal.toFixed(
        2
      )} pts) es inferior al mínimo exigido de ${PROMEDIO_MINIMO_BECA.toFixed(
        2
      )} puntos.`,
    };
  }

  return {
    apto: true,
    esNuevoIngreso: false,
    semestreActual,
    promedioGlobal,
    totalMaterias: record.length,
    totalAprobadas,
    totalReprobadas: 0,
    materiasReprobadas: [],
    categoriaRechazo: null,
    motivoRechazo: null,
  };
}

/**
 * Agrupa el récord académico por trimestre cursado en orden descendente
 * (del trimestre más reciente al trimestre 1) con su promedio aritmético simple.
 */
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

/**
 * Construye el snapshot JSON del último trimestre cursado (semestreActual - 1),
 * compatible con solicitudes.materias_json, GradesHistory, ProfileStatus y ValidarBecaAcademicHistory.
 */
export function construirUltimoTrimestreSnapshot(
  record: IRegistroRecordAcademico[],
  semestreActual: number
): IMateriasSnapshotJSON | null {
  if (semestreActual <= 1 || record.length === 0) return null;

  const trimestreObjetivo = semestreActual - 1;
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