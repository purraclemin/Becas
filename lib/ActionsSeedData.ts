'use server'

import { randomUUID } from 'crypto'
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { revalidatePath } from 'next/cache'
import { db } from './db'
import {
  DEPARTAMENTOS_UNIMAR_OFICIALES,
  MODALIDADES_POSTULABLES_ESTUDIANTE,
  REGLAMENTO_TIPOS_BECA,
  SISTEMA_ADMIN_ID,
  construirUltimoTrimestreSnapshot,
  evaluarElegibilidadAcademica,
  generarNotasAleatoriasPorPerfil,
  obtenerPromedioMinimoPorTipoBeca,
  obtenerVariantesTipoBeca,
  type IMateriaGenerada,
  type IMateriaPensumBase,
  type IRegistroRecordAcademico,
  type PerfilAcademicoAleatorio,
} from './RecordAcademicoUtils'
import { calcularPuntajeUnificado } from './MotorBaremoUnificado'
import { ejecutarRotacionExcelenciaEnPeriodo } from './ActionsGestionEspecial'

// Hash bcrypt fijo correspondiente a la contraseña "123456"
const PASSWORD_HASH_SEED =
  '$2b$10$3o3FgCxBEZsl2sU3Qgy/seA5CBzAwc8LHYLkMd9Mt6J0qAnr8AhMi'

const LIMITE_TOTAL_ESTUDIANTES_SEED = 1000
const TAMANO_BLOQUE_SEED = 100
const CANTIDAD_SIN_SOLICITUD = 20
const MAXIMO_EN_REVISION_SEED = 20

type EstatusSeed =
  | 'Pendiente'
  | 'Convocado a Entrevista'
  | 'En Revisión'
  | 'Aprobada'
  | 'Rechazada'

const ESTATUS_CON_SOLICITUD: ReadonlyArray<EstatusSeed> = [
  'Pendiente',
  'Convocado a Entrevista',
  'En Revisión',
  'Aprobada',
  'Rechazada',
]

interface PeriodoActualRow extends RowDataPacket {
  id: number;
  codigo: string;
}

interface CarreraRow extends RowDataPacket {
  id: number;
  nombre: string;
}

interface PensumDeduplicadoRow extends RowDataPacket {
  carrera_id: number;
  trimestre_ubicacion: number;
  codigo_materia: string;
  pensum_materia_id: number;
  nombre_materia: string;
  unidades_credito: number;
}

interface UserIdSeedRow extends RowDataPacket {
  id: number;
}

interface EmailExistenteSeedRow extends RowDataPacket {
  email: string;
}

interface ActorSeedRow extends RowDataPacket {
  id: number;
  role: string;
  email: string | null;
}

interface CountSeedRow extends RowDataPacket {
  total: number;
}

interface PerfilSocioSeed {
  rangoIngreso: string;
  sueldo: number;
  extra: number;
  pension: number;
  ayuda: number;
  familiar: number;
  rentas: number;
  otros: number;
  egresoMercado: number;
  egresoVivienda: number;
  egresoSalud: number;
  egresoServicios: number;
  egresoSuntuarios: number;
  egresoEstudios: number;
  egresoRecreacion: number;
  viviendaTipo: string;
  viviendaEstatus: string;
  poseeEmpleo: 'Si' | 'No';
  condicionLaboralTipo: string;
  empresa: string;
  cargo: string;
  estatusConyugal: string;
  numHermanos: number;
  hermanosUni: number;
  saludCondicion: 'Si' | 'No';
  saludDesc: string;
  saludTratamiento: string;
  familiaRelacion: 'Buena' | 'Regular' | 'Mala';
  familiaProblemaSn: 'Si' | 'No';
  familiaProblemaDesc: string | null;
  servAgua: 'on' | 'off';
  servLuz: 'on' | 'off';
  servGas: 'on' | 'off';
  servAseo: 'on' | 'off';
  servTelefono: 'on' | 'off';
  servCloacas: 'on' | 'off';
  servInternet: 'on' | 'off';
  equipNevera: 'on' | 'off';
  equipAire: 'on' | 'off';
  equipVentilador: 'on' | 'off';
  equipTv: 'on' | 'off';
  equipCocina: 'on' | 'off';
  equipMicroondas: 'on' | 'off';
  equipLavadora: 'on' | 'off';
  equipSonido: 'on' | 'off';
  equipComputadora: 'on' | 'off';
  equipCelular: 'on' | 'off';
  equipCable: 'on' | 'off';
}

export interface EstadoLoteSeed {
  totalEsperado: number;
  tamanoBloque: number;
  creadosActuales: number;
  restantes: number;
  completado: boolean;
  proximoRangoInicio: number | null;
  proximoRangoFin: number | null;
}

const MUNICIPIOS_SEED = [
  'Arismendi',
  'Antolín del Campo',
  'Díaz',
  'García',
  'Gómez',
  'Maneiro',
  'Marcano',
  'Mariño',
  'Península de Macanao',
  'Tubores',
  'Villalba',
] as const;

const LUGARES_NAC_SEED = [
  'Porlamar, Nueva Esparta',
  'La Asunción, Nueva Esparta',
  'Juan Griego, Nueva Esparta',
  'Pampatar, Nueva Esparta',
  'Caracas, Distrito Capital',
  'Cumaná, Sucre',
] as const;

const UES_SEED = [
  'U.E. Dr. Francisco Antonio Rísquez',
  'U.E. Colegio Virgen del Valle',
  'U.E.N. Creación Valle Verde',
  'U.E. Colegio Guayamurí',
  'U.E.P. Instituto Nueva Esparta',
] as const;

const OTROS_ESTUDIOS_SEED = [
  'Ninguno',
  'Curso Básico de Inglés Técnico',
  'Certificación en Ofimática y Hojas de Cálculo',
  'Diplomado Introductorio en Gestión Administrativa',
] as const;

const ORGANIZACIONES_SEED = [
  'Ninguna',
  'Deportiva',
  'Cultural',
  'Vecinal',
  'Religiosa',
] as const;

const MODALIDADES_ESTUDIO_SEED = ['P', 'S', 'V'] as const;

function enteroEnRango(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function elegirAleatorio<T>(lista: ReadonlyArray<T>): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

function construirPerfilSocioeconomico(indice: number): PerfilSocioSeed {
  const variante = indice % 4;

  // Variante 0: Vulnerabilidad Crítica (70+ pts)
  if (variante === 0) {
    return {
      rangoIngreso: '1',
      sueldo: 0,
      extra: enteroEnRango(20, 60),
      pension: 0,
      ayuda: enteroEnRango(20, 50),
      familiar: enteroEnRango(60, 120),
      rentas: 0,
      otros: 0,
      egresoMercado: enteroEnRango(140, 200),
      egresoVivienda: enteroEnRango(80, 130),
      egresoSalud: enteroEnRango(40, 80),
      egresoServicios: enteroEnRango(35, 65),
      egresoSuntuarios: 0,
      egresoEstudios: enteroEnRango(40, 80),
      egresoRecreacion: 0,
      viviendaTipo: 'Vivienda rural',
      viviendaEstatus: 'Alquilada',
      poseeEmpleo: 'No',
      condicionLaboralTipo: 'No aplica',
      empresa: 'NO',
      cargo: 'NO',
      estatusConyugal: 'Separados',
      numHermanos: enteroEnRango(3, 5),
      hermanosUni: enteroEnRango(1, 2),
      saludCondicion: 'Si',
      saludDesc: 'Asma bronquial crónica',
      saludTratamiento: 'Control ambulatorio con inhalador',
      familiaRelacion: 'Regular',
      familiaProblemaSn: 'Si',
      familiaProblemaDesc: 'Dificultad económica persistente en el grupo familiar',
      servAgua: 'off',
      servLuz: 'on',
      servGas: 'off',
      servAseo: 'off',
      servTelefono: 'off',
      servCloacas: 'off',
      servInternet: 'off',
      equipNevera: 'on',
      equipAire: 'off',
      equipVentilador: 'on',
      equipTv: 'off',
      equipCocina: 'on',
      equipMicroondas: 'off',
      equipLavadora: 'off',
      equipSonido: 'off',
      equipComputadora: 'off',
      equipCelular: 'on',
      equipCable: 'off',
    };
  }

  // Variante 1: Vulnerabilidad Alta (50-69 pts)
  if (variante === 1) {
    return {
      rangoIngreso: '1',
      sueldo: enteroEnRango(80, 140),
      extra: enteroEnRango(20, 50),
      pension: 0,
      ayuda: enteroEnRango(10, 40),
      familiar: enteroEnRango(100, 160),
      rentas: 0,
      otros: 0,
      egresoMercado: enteroEnRango(150, 210),
      egresoVivienda: enteroEnRango(60, 100),
      egresoSalud: enteroEnRango(25, 50),
      egresoServicios: enteroEnRango(30, 55),
      egresoSuntuarios: 0,
      egresoEstudios: enteroEnRango(30, 60),
      egresoRecreacion: 0,
      viviendaTipo: 'Casa',
      viviendaEstatus: 'Alquilada',
      poseeEmpleo: 'Si',
      condicionLaboralTipo: 'Economía Informal',
      empresa: 'Comercio Local',
      cargo: 'Auxiliar',
      estatusConyugal: 'Concubinato',
      numHermanos: enteroEnRango(2, 4),
      hermanosUni: 1,
      saludCondicion: 'No',
      saludDesc: 'NO',
      saludTratamiento: 'NO',
      familiaRelacion: 'Regular',
      familiaProblemaSn: 'No',
      familiaProblemaDesc: null,
      servAgua: 'on',
      servLuz: 'on',
      servGas: 'on',
      servAseo: 'off',
      servTelefono: 'off',
      servCloacas: 'on',
      servInternet: 'off',
      equipNevera: 'on',
      equipAire: 'off',
      equipVentilador: 'on',
      equipTv: 'on',
      equipCocina: 'on',
      equipMicroondas: 'off',
      equipLavadora: 'off',
      equipSonido: 'off',
      equipComputadora: 'off',
      equipCelular: 'on',
      equipCable: 'off',
    };
  }

  // Variante 2: Vulnerabilidad Media (25-49 pts)
  if (variante === 2) {
    return {
      rangoIngreso: '2',
      sueldo: enteroEnRango(180, 260),
      extra: enteroEnRango(40, 80),
      pension: 0,
      ayuda: 0,
      familiar: enteroEnRango(180, 260),
      rentas: 0,
      otros: 0,
      egresoMercado: enteroEnRango(170, 230),
      egresoVivienda: enteroEnRango(40, 80),
      egresoSalud: enteroEnRango(20, 40),
      egresoServicios: enteroEnRango(35, 60),
      egresoSuntuarios: enteroEnRango(0, 20),
      egresoEstudios: enteroEnRango(40, 70),
      egresoRecreacion: enteroEnRango(0, 20),
      viviendaTipo: 'Casa',
      viviendaEstatus: 'Pagándose',
      poseeEmpleo: 'No',
      condicionLaboralTipo: 'No aplica',
      empresa: 'NO',
      cargo: 'NO',
      estatusConyugal: 'Matrimonio Civil',
      numHermanos: enteroEnRango(1, 2),
      hermanosUni: 1,
      saludCondicion: 'No',
      saludDesc: 'NO',
      saludTratamiento: 'NO',
      familiaRelacion: 'Buena',
      familiaProblemaSn: 'No',
      familiaProblemaDesc: null,
      servAgua: 'on',
      servLuz: 'on',
      servGas: 'on',
      servAseo: 'on',
      servTelefono: 'off',
      servCloacas: 'on',
      servInternet: 'on',
      equipNevera: 'on',
      equipAire: 'off',
      equipVentilador: 'on',
      equipTv: 'on',
      equipCocina: 'on',
      equipMicroondas: 'on',
      equipLavadora: 'on',
      equipSonido: 'off',
      equipComputadora: 'on',
      equipCelular: 'on',
      equipCable: 'off',
    };
  }

  // Variante 3: Vulnerabilidad Baja (0-24 pts)
  return {
    rangoIngreso: '3',
    sueldo: enteroEnRango(350, 500),
    extra: enteroEnRango(80, 150),
    pension: 0,
    ayuda: 0,
    familiar: enteroEnRango(400, 600),
    rentas: 0,
    otros: 0,
    egresoMercado: enteroEnRango(180, 240),
    egresoVivienda: enteroEnRango(30, 60),
    egresoSalud: enteroEnRango(20, 40),
    egresoServicios: enteroEnRango(40, 70),
    egresoSuntuarios: enteroEnRango(20, 40),
    egresoEstudios: enteroEnRango(50, 90),
    egresoRecreacion: enteroEnRango(20, 40),
    viviendaTipo: 'Apartamento',
    viviendaEstatus: 'Propia',
    poseeEmpleo: 'Si',
    condicionLaboralTipo: 'Empleado',
    empresa: 'Servicios Corporativos Margarita',
    cargo: 'Asistente Administrativo',
    estatusConyugal: 'Matrimonio Civil',
    numHermanos: 1,
    hermanosUni: 0,
    saludCondicion: 'No',
    saludDesc: 'NO',
    saludTratamiento: 'NO',
    familiaRelacion: 'Buena',
    familiaProblemaSn: 'No',
    familiaProblemaDesc: null,
    servAgua: 'on',
    servLuz: 'on',
    servGas: 'on',
    servAseo: 'on',
    servTelefono: 'on',
    servCloacas: 'on',
    servInternet: 'on',
    equipNevera: 'on',
    equipAire: 'on',
    equipVentilador: 'on',
    equipTv: 'on',
    equipCocina: 'on',
    equipMicroondas: 'on',
    equipLavadora: 'on',
    equipSonido: 'on',
    equipComputadora: 'on',
    equipCelular: 'on',
    equipCable: 'on',
  };
}

function construirFechaIngresoUnimar(semestre: number): string {
  const hoy = new Date();
  const mesesAtras = Math.max(2, (semestre - 1) * 4 + enteroEnRango(0, 2));
  const fecha = new Date(
    hoy.getFullYear(),
    hoy.getMonth() - mesesAtras,
    enteroEnRango(1, 28)
  );
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function obtenerIndicesExistentesSeed(
  connection: PoolConnection
): Promise<Set<number>> {
  const [rows] = await connection.execute<EmailExistenteSeedRow[]>(
    `
    SELECT LOWER(TRIM(email)) AS email
    FROM users
    WHERE LOWER(TRIM(email)) REGEXP '^prueba([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|1000)@unimar\\\\.edu\\\\.ve$'
    `
  );

  const existentes = new Set<number>();
  for (const r of rows) {
    const match = String(r.email || '').match(/^prueba(\d+)@unimar\.edu\.ve$/);
    if (match) {
      const idx = parseInt(match[1], 10);
      if (idx >= 1 && idx <= LIMITE_TOTAL_ESTUDIANTES_SEED) {
        existentes.add(idx);
      }
    }
  }
  return existentes;
}

/**
 * Consulta el progreso del lote de 1,000 estudiantes (prueba1..prueba1000)
 * y el siguiente bloque de 100 que se generará al pulsar el botón.
 */
export async function obtenerEstadoLoteSeed(): Promise<EstadoLoteSeed> {
  const connection = await db.getConnection();
  try {
    const existentes = await obtenerIndicesExistentesSeed(connection);
    const faltantes: number[] = [];
    for (let i = 1; i <= LIMITE_TOTAL_ESTUDIANTES_SEED; i++) {
      if (!existentes.has(i)) {
        faltantes.push(i);
      }
    }

    const bloque = faltantes.slice(0, TAMANO_BLOQUE_SEED);
    return {
      totalEsperado: LIMITE_TOTAL_ESTUDIANTES_SEED,
      tamanoBloque: TAMANO_BLOQUE_SEED,
      creadosActuales: existentes.size,
      restantes: faltantes.length,
      completado: faltantes.length === 0,
      proximoRangoInicio: bloque.length > 0 ? bloque[0] : null,
      proximoRangoFin: bloque.length > 0 ? bloque[bloque.length - 1] : null,
    };
  } finally {
    connection.release();
  }
}

/**
 * SEEDER PROGRESIVO DE 100 EN 100 HASTA 1,000 ESTUDIANTES (prueba1..prueba1000@unimar.edu.ve):
 * - Clave: 123456 (hash fijo).
 * - Primeros 20 (prueba1..prueba20): SIN ninguna solicitud y SIN estudio socioeconómico.
 * - Resto (prueba21..prueba1000):
 *   * Pendiente: solo estudio socioeconómico de tipo 'estudiante'.
 *   * Convocado a Entrevista: solo estudio socioeconómico de tipo 'estudiante'.
 *   * En Revisión: ambos estudios ('estudiante' y 'administrador'), limitado a los primeros 20
 *     en este estatus para no saturar envíos ni remisiones.
 *   * Aprobada: ambos estudios ('estudiante' y 'administrador'), respetando elegibilidad y cupos.
 *   * Rechazada: ambos estudios ('estudiante' y 'administrador'), con rechazos reales/normativos.
 */
export async function seedDatabase(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  let connection: PoolConnection | undefined;

  try {
    connection = await db.getConnection();

    const existentesSet = await obtenerIndicesExistentesSeed(connection);
    const indicesFaltantes: number[] = [];
    for (let i = 1; i <= LIMITE_TOTAL_ESTUDIANTES_SEED; i++) {
      if (!existentesSet.has(i)) {
        indicesFaltantes.push(i);
      }
    }

    if (indicesFaltantes.length === 0) {
      return {
        success: false,
        error: `Ya se completaron los ${LIMITE_TOTAL_ESTUDIANTES_SEED} estudiantes (prueba1@unimar.edu.ve a prueba${LIMITE_TOTAL_ESTUDIANTES_SEED}@unimar.edu.ve). Use Limpiar para reiniciar desde cero.`,
      };
    }

    const bloqueIndices = indicesFaltantes.slice(0, TAMANO_BLOQUE_SEED);

    const [periodoRes] = await connection.execute<PeriodoActualRow[]>(
      `SELECT id, codigo FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const periodoActual = periodoRes[0];

    if (!periodoActual?.id) {
      return {
        success: false,
        error:
          'No se encontró ningún periodo académico activo (es_actual = 1) en la base de datos.',
      };
    }

    const periodoId = Number(periodoActual.id);

    // Contar cuántos estudiantes de prueba ya están en 'En Revisión' para respetar el tope de 20
    const [enRevisionActualRows] = await connection.execute<CountSeedRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM solicitudes s
      JOIN users u ON s.user_id = u.id
      WHERE s.periodo_id = ?
        AND s.estatus = 'En Revisión'
        AND LOWER(TRIM(u.email)) REGEXP '^prueba([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|1000)@unimar\\\\.edu\\\\.ve$'
      `,
      [periodoId]
    );
    let cupoEnRevisionRestante = Math.max(
      0,
      MAXIMO_EN_REVISION_SEED - Number(enRevisionActualRows[0]?.total ?? 0)
    );

    // Resolver IDs válidos en `users` para trazabilidad limpia
    const [actoresRows] = await connection.execute<ActorSeedRow[]>(
      `SELECT id, role, email FROM users WHERE role IN ('admin', 'secretaria') OR id = 0`
    );

    const coordinadorRow = actoresRows.find(
      (u) => u.role === 'admin' && Number(u.id) > 0
    );
    const secretariaRow = actoresRows.find(
      (u) =>
        u.role === 'secretaria' ||
        String(u.email || '').trim().toLowerCase() === 'secretariageneral@unimar.edu.ve'
    );
    const sistemaRow = actoresRows.find((u) => Number(u.id) === SISTEMA_ADMIN_ID);

    const coordinacionId = coordinadorRow ? Number(coordinadorRow.id) : SISTEMA_ADMIN_ID;
    const secretariaId = secretariaRow ? Number(secretariaRow.id) : coordinacionId;
    const sistemaId = sistemaRow ? Number(sistemaRow.id) : coordinacionId;

    const [carrerasDB] = await connection.execute<CarreraRow[]>(
      `SELECT id, nombre FROM carreras ORDER BY id ASC`
    );
    if (carrerasDB.length === 0) {
      return {
        success: false,
        error: 'No existen carreras registradas en la base de datos.',
      };
    }

    // Cargar pensum deduplicado en memoria una sola vez
    const [pensumRows] = await connection.execute<PensumDeduplicadoRow[]>(
      `
      SELECT
        carrera_id,
        trimestre_ubicacion,
        codigo_materia,
        MIN(id) AS pensum_materia_id,
        MIN(nombre_materia) AS nombre_materia,
        MAX(IFNULL(unidades_credito, 3)) AS unidades_credito
      FROM pensum_materias
      GROUP BY carrera_id, trimestre_ubicacion, codigo_materia
      ORDER BY carrera_id ASC, trimestre_ubicacion ASC, codigo_materia ASC
      `
    );

    const pensumPorCarrera = new Map<number, IMateriaPensumBase[]>();
    for (const row of pensumRows) {
      const cId = Number(row.carrera_id);
      const lista = pensumPorCarrera.get(cId) ?? [];
      lista.push({
        pensum_materia_id: Number(row.pensum_materia_id),
        trimestre_ubicacion: Number(row.trimestre_ubicacion),
        codigo_materia: String(row.codigo_materia),
        nombre_materia: String(row.nombre_materia),
        unidades_credito: Number(row.unidades_credito ?? 3),
      });
      pensumPorCarrera.set(cId, lista);
    }

    // Contadores de cupos vigentes por modalidad en el periodo actual
    const conteoAprobadosPorModalidad = new Map<string, number>();
    for (const modalidad of MODALIDADES_POSTULABLES_ESTUDIANTE) {
      const variantes = obtenerVariantesTipoBeca(modalidad);
      if (variantes.length === 0) continue;
      const placeholders = variantes.map(() => '?').join(', ');
      const [cRows] = await connection.execute<CountSeedRow[]>(
        `
        SELECT COUNT(*) AS total
        FROM solicitudes
        WHERE periodo_id = ?
          AND LOWER(TRIM(tipo_beca)) IN (${placeholders})
          AND estatus IN ('Aprobada', 'Renovacion', 'Renovación')
        `,
        [periodoId, ...variantes]
      );
      conteoAprobadosPorModalidad.set(modalidad, Number(cRows[0]?.total ?? 0));
    }

    const modalidadesPostulables = [...MODALIDADES_POSTULABLES_ESTUDIANTE];
    const sexosPosibles: ReadonlyArray<'M' | 'F'> = ['M', 'F'];

    let totalSinSolicitud = 0;
    const conteoEstatus: Record<EstatusSeed, number> = {
      Pendiente: 0,
      'Convocado a Entrevista': 0,
      'En Revisión': 0,
      Aprobada: 0,
      Rechazada: 0,
    };

    const recordBulkPlaceholders: string[] = [];
    const recordBulkValues: Array<number | string> = [];
    const estudiosBulkPlaceholders: string[] = [];
    const estudiosBulkValues: Array<string | number | null> = [];
    const historialBulkPlaceholders: string[] = [];
    const historialBulkValues: Array<string | number | null> = [];

    const flushRecordsBulk = async (): Promise<void> => {
      if (recordBulkPlaceholders.length === 0) return;
      await connection!.execute<ResultSetHeader>(
        `
        INSERT IGNORE INTO record_academico (
          student_id, pensum_materia_id, trimestre_cursado,
          codigo_materia, nombre_materia, unidades_credito, nota, aprobada
        ) VALUES ${recordBulkPlaceholders.join(', ')}
        `,
        recordBulkValues
      );
      recordBulkPlaceholders.length = 0;
      recordBulkValues.length = 0;
    };

    const flushEstudiosBulk = async (): Promise<void> => {
      if (estudiosBulkPlaceholders.length === 0) return;
      await connection!.execute<ResultSetHeader>(
        `
        INSERT INTO estudios_socioeconomicos (
          student_id, periodo_id, tipo, evaluador_id,
          socio_lugar_nac, socio_nacionalidad, socio_estado_civil, socio_telf_hab, direccion_completa,
          socio_trabajo_empresa, socio_trabajo_cargo, socio_trabajo_direccion, socio_trabajo_telefono,
          socio_condicion_laboral_tipo, socio_condicion_laboral_desc,
          monto_ingreso_sueldo, monto_ingreso_extra, monto_ingreso_pension, monto_ingreso_ayuda,
          monto_ingreso_familiar, monto_ingreso_rentas, monto_ingreso_otros,
          socio_ue_procedencia, socio_otros_estudios, socio_fecha_unimar, socio_modalidad,
          padre_nombre, padre_edad, padre_ocupacion, padre_trabajo, padre_nacionalidad, padre_instruccion,
          madre_nombre, madre_edad, madre_ocupacion, madre_trabajo, madre_nacionalidad, madre_instruccion,
          familia_estatus_conyugal, familia_num_hermanos, familia_hermanos_uni, familia_hermanos_uni_sn,
          familia_nucleo_json, rango_ingreso_familiar, vivienda_tipo, vivienda_estatus,
          monto_egreso_mercado, monto_egreso_vivienda, monto_egreso_salud, monto_egreso_servicios,
          monto_egreso_suntuarios, monto_egreso_estudios, monto_egreso_recreacion,
          situacion_laboral_jefe, salud_condicion_especial, salud_enfermedad_desc, salud_tratamiento,
          serv_agua, serv_luz, serv_gas, serv_aseo, serv_telefono, serv_cloacas, serv_internet,
          equip_nevera, equip_aire, equip_ventilador, equip_tv, equip_cocina, equip_microondas,
          equip_lavadora, equip_sonido, equip_computadora, equip_celular, equip_cable,
          familia_relacion, familia_problema_sn, familia_problema_desc,
          organizacion_activa, observaciones_solicitante, puntaje, nivel_riesgo, created_at
        ) VALUES ${estudiosBulkPlaceholders.join(', ')}
        `,
        estudiosBulkValues
      );
      estudiosBulkPlaceholders.length = 0;
      estudiosBulkValues.length = 0;
    };

    const flushHistorialBulk = async (): Promise<void> => {
      if (historialBulkPlaceholders.length === 0) return;
      await connection!.execute<ResultSetHeader>(
        `
        INSERT INTO historial_aprobaciones (
          solicitud_id, user_id, periodo_id, admin_id,
          promedio_ciclo, trimestre, puntaje_baremo_, nivel_riesgo,
          tipo_beca_snapshot, estatus_previo, estatus_nuevo,
          observacion_admin, materias_snapshot_json, indice_global_snapshot,
          fecha_aprobacion, token_verificacion, ip_accion
        ) VALUES ${historialBulkPlaceholders.join(', ')}
        `,
        historialBulkValues
      );
      historialBulkPlaceholders.length = 0;
      historialBulkValues.length = 0;
    };

    await connection.beginTransaction();

    try {
      for (const i of bloqueIndices) {
        const esSinSolicitud = i <= CANTIDAD_SIN_SOLICITUD;
        const cedula = String(30000000 + i);
        const email = `prueba${i}@unimar.edu.ve`;
        const nombre = `Estudiante${i}`;
        const apellido = `Prueba${i}`;

        const semestreNum = esSinSolicitud
          ? ((i - 1) % 10) + 1
          : i % 10 === 0
            ? 1
            : ((i - 1) % 11) + 2;

        const carreraObj = carrerasDB[(i - 1) % carrerasDB.length];
        const carreraId = Number(carreraObj.id);
        const carreraNombre = carreraObj.nombre;
        const tipoBecaActual =
          modalidadesPostulables[(i - 1) % modalidadesPostulables.length];
        const municipio = elegirAleatorio(MUNICIPIOS_SEED);
        const sexoAleatorio = sexosPosibles[i % 2];
        const telefono = `0412${String(1000000 + ((i * 7919) % 8999999)).padStart(7, '0')}`;

        const anioNacimiento = 2026 - enteroEnRango(18, 25);
        const mesNacimiento = String(enteroEnRango(1, 12)).padStart(2, '0');
        const diaNacimiento = String(enteroEnRango(1, 28)).padStart(2, '0');
        const fechaNacimiento = `${anioNacimiento}-${mesNacimiento}-${diaNacimiento}`;

        // Elegir estatus aleatorio entre los 5 posibles, respetando el tope de 20 en 'En Revisión'
        let estatusCandidato: EstatusSeed = esSinSolicitud
          ? 'Pendiente'
          : elegirAleatorio(ESTATUS_CON_SOLICITUD);

        if (!esSinSolicitud && estatusCandidato === 'En Revisión') {
          if (cupoEnRevisionRestante > 0) {
            cupoEnRevisionRestante -= 1;
          } else {
            estatusCandidato = i % 2 === 0 ? 'Pendiente' : 'Convocado a Entrevista';
          }
        }

        // 1. Insertar credenciales en `users`
        const [userRes] = await connection.execute<ResultSetHeader>(
          `INSERT INTO users (email, password, role) VALUES (?, ?, 'estudiante')`,
          [email, PASSWORD_HASH_SEED]
        );
        const userId = Number(userRes.insertId);

        // 2. Generar récord académico para trimestres cursados (1 .. semestre - 1)
        const pensumCarrera = pensumPorCarrera.get(carreraId) ?? [];
        const materiasGeneradasTotales: IMateriaGenerada[] = [];

        if (semestreNum > 1) {
          const trimAnterior = semestreNum - 1;
          const materiasPrevias = pensumCarrera.filter(
            (m) => m.trimestre_ubicacion < trimAnterior
          );
          const materiasUltimoTrim = pensumCarrera.filter(
            (m) => m.trimestre_ubicacion === trimAnterior
          );

          const perfilUltimoTrim: PerfilAcademicoAleatorio =
            !esSinSolicitud && estatusCandidato === 'Rechazada'
              ? i % 2 === 0
                ? 'PROMEDIO_BAJO'
                : 'CON_REPROBADA'
              : 'APTO';

          const minimoObjetivo = esSinSolicitud
            ? 16
            : obtenerPromedioMinimoPorTipoBeca(
                tipoBecaActual,
                'ingreso',
                semestreNum
              );

          if (materiasPrevias.length > 0) {
            materiasGeneradasTotales.push(
              ...generarNotasAleatoriasPorPerfil(materiasPrevias, 'APTO', 16)
            );
          }

          if (materiasUltimoTrim.length > 0) {
            materiasGeneradasTotales.push(
              ...generarNotasAleatoriasPorPerfil(
                materiasUltimoTrim,
                perfilUltimoTrim,
                minimoObjetivo
              )
            );
          }
        }

        const nowIso = new Date().toISOString();
        const recordEnMemoria: IRegistroRecordAcademico[] =
          materiasGeneradasTotales.map((m, idx) => ({
            id: idx + 1,
            student_id: userId,
            pensum_materia_id: m.pensum_materia_id,
            trimestre_cursado: m.trimestre_ubicacion,
            codigo_materia: m.codigo_materia,
            nombre_materia: m.nombre_materia,
            unidades_credito: m.unidades_credito,
            nota: m.nota,
            aprobada: m.aprobada === 1,
            created_at: nowIso,
          }));

        const evaluacion = evaluarElegibilidadAcademica(
          semestreNum,
          recordEnMemoria,
          esSinSolicitud ? undefined : tipoBecaActual
        );

        let estatusFinal: EstatusSeed = estatusCandidato;
        if (!esSinSolicitud && semestreNum > 1 && !evaluacion.apto) {
          estatusFinal = 'Rechazada';
        }

        // Si se eligió 'Aprobada' pero el cupo de la modalidad ya está lleno, pasa a 'Pendiente'
        if (!esSinSolicitud && estatusFinal === 'Aprobada') {
          const reglaMod = REGLAMENTO_TIPOS_BECA[tipoBecaActual];
          const ocupadosActuales = conteoAprobadosPorModalidad.get(tipoBecaActual) ?? 0;
          if (reglaMod.cupoMaximo !== null && ocupadosActuales >= reglaMod.cupoMaximo) {
            estatusFinal = 'Pendiente';
          } else {
            conteoAprobadosPorModalidad.set(tipoBecaActual, ocupadosActuales + 1);
          }
        }

        const indiceGlobalExacto = evaluacion.promedioGlobal;
        const promedioTrimestralExacto = evaluacion.promedioTrimestreAnterior;
        const haTenidoBecaFlag = !esSinSolicitud && estatusFinal === 'Aprobada' ? 1 : 0;
        const becaPerdidaFlag = !esSinSolicitud && estatusFinal === 'Rechazada' ? 1 : 0;

        // 3. Insertar expediente en `students`
        await connection.execute<ResultSetHeader>(
          `
          INSERT INTO students (
            id, nombre, apellido, cedula, sexo, fecha_nacimiento,
            telefono, carrera, semestre, indice_global, email,
            municipio_residencia, ha_tenido_beca, beca_perdida
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            userId,
            nombre,
            apellido,
            cedula,
            sexoAleatorio,
            fechaNacimiento,
            telefono,
            carreraNombre,
            semestreNum,
            indiceGlobalExacto.toFixed(2),
            email,
            municipio,
            haTenidoBecaFlag,
            becaPerdidaFlag,
          ]
        );

        // 4. Acumular asignaturas para inserción multi-fila en `record_academico`
        for (const mat of materiasGeneradasTotales) {
          recordBulkPlaceholders.push('(?, ?, ?, ?, ?, ?, ?, ?)');
          recordBulkValues.push(
            userId,
            mat.pensum_materia_id,
            mat.trimestre_ubicacion,
            mat.codigo_materia,
            mat.nombre_materia,
            mat.unidades_credito,
            mat.nota,
            mat.aprobada
          );
        }

        // Los primeros 20 estudiantes (prueba1..prueba20) quedan sin solicitud ni estudio socioeconómico
        if (esSinSolicitud) {
          totalSinSolicitud += 1;
          continue;
        }

        conteoEstatus[estatusFinal] += 1;

        // 5. Construir snapshot del trimestre anterior (`semestre - 1`) para `solicitudes`
        const snapshotTrim = construirUltimoTrimestreSnapshot(
          recordEnMemoria,
          semestreNum
        );
        const materiasJsonString = JSON.stringify(
          snapshotTrim ?? {
            trimestre: 1,
            materias: [],
            fecha_proceso: nowIso,
          }
        );

        const fotoCarnet = `/uploads/mock_foto_carnet_${i}.png`;
        const copiaCedula = `/uploads/mock_cedula_${i}.png`;
        const constanciaResidencia =
          tipoBecaActual === 'BECA APRENDIZAJE' ||
          tipoBecaActual === 'BECA POR DISCAPACIDAD'
            ? `/uploads/mock_residencia_${i}.pdf`
            : null;
        const declaracionManutencion = constanciaResidencia
          ? `/uploads/mock_manutencion_${i}.pdf`
          : null;
        const informeMedico =
          tipoBecaActual === 'BECA POR DISCAPACIDAD'
            ? `/uploads/mock_informe_medico_${i}.pdf`
            : null;
        const carnetDiscapacidad =
          tipoBecaActual === 'BECA POR DISCAPACIDAD'
            ? `/uploads/mock_carnet_disc_${i}.png`
            : null;
        const documentosFiliacion =
          tipoBecaActual ===
            'AYUDA ECONÓMICA PARA ESTUDIANTES CON FAMILIARES' ||
          tipoBecaActual === 'AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES'
            ? `/uploads/mock_filiacion_${i}.pdf`
            : null;
        const constanciaClub =
          tipoBecaActual ===
          'AYUDA ECONÓMICA POR ACTIVIDADES DEPORTIVAS, CULTURALES Y ORFEÓN'
            ? `/uploads/mock_club_${i}.pdf`
            : null;
        const constanciaNotas =
          tipoBecaActual === 'BECA APRENDIZAJE'
            ? `/uploads/mock_constancia_notas_${i}.pdf`
            : null;
        const notasCertificadas =
          semestreNum === 1 && tipoBecaActual === 'BECA POR DISCAPACIDAD'
            ? `/uploads/mock_notas_certificadas_${i}.pdf`
            : null;

        const departamentoAsignado: string | null =
          estatusFinal === 'Aprobada'
            ? elegirAleatorio(DEPARTAMENTOS_UNIMAR_OFICIALES)
            : null;

        let observacionSol: string | null = null;
        let revisadoPor: number | null = null;
        let estatusPrevioHistorial: string | null = null;
        let adminIdHistorial: number | null = null;

        if (estatusFinal === 'Convocado a Entrevista') {
          observacionSol =
            'Convocado a entrevista socioeconómica presencial en el Departamento de Bienestar Estudiantil.';
          revisadoPor = coordinacionId;
          estatusPrevioHistorial = 'Pendiente';
          adminIdHistorial = coordinacionId;
        } else if (estatusFinal === 'En Revisión') {
          observacionSol =
            'Estudio socioeconómico auditado y remitido a Secretaría General para dictamen final.';
          revisadoPor = coordinacionId;
          estatusPrevioHistorial = 'Convocado a Entrevista';
          adminIdHistorial = coordinacionId;
        } else if (estatusFinal === 'Aprobada') {
          observacionSol = `Beneficio aprobado por Secretaría General. Asignado a ${departamentoAsignado}.`;
          revisadoPor = secretariaId;
          estatusPrevioHistorial = 'En Revisión';
          adminIdHistorial = secretariaId;
        } else if (estatusFinal === 'Rechazada') {
          const esRechazoAcademicoAuto = semestreNum > 1 && !evaluacion.apto;
          observacionSol = esRechazoAcademicoAuto
            ? evaluacion.motivoRechazo ||
              'Rechazo automático por incumplimiento de reglamento académico.'
            : 'Solicitud no admitida en dictamen final por evaluación socioeconómica y normativa.';
          revisadoPor = esRechazoAcademicoAuto ? sistemaId : secretariaId;
          estatusPrevioHistorial = esRechazoAcademicoAuto ? 'Nueva' : 'En Revisión';
          adminIdHistorial = esRechazoAcademicoAuto ? sistemaId : secretariaId;
        }

        const exprFechaConvocatoria =
          estatusFinal === 'Convocado a Entrevista'
            ? 'DATE_ADD(NOW(), INTERVAL 3 DAY)'
            : 'NULL';
        const exprFechaRevision =
          estatusFinal === 'En Revisión' || estatusFinal === 'Aprobada'
            ? 'NOW()'
            : 'NULL';
        const exprFechaDecision =
          estatusFinal === 'Aprobada' || estatusFinal === 'Rechazada'
            ? 'NOW()'
            : 'NULL';

        // 6. Insertar solicitud sincronizada
        const [solIns] = await connection.execute<ResultSetHeader>(
          `
          INSERT INTO solicitudes (
            user_id, periodo_id, email_institucional, tipo_beca, promedio_notas,
            motivo_solicitud, departamento_asignado, materias_json, estatus, observaciones_admin,
            fecha_convocatoria, fecha_revision, fecha_decision, revisado_por,
            foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion,
            informe_medico, constancia_club, constancia_notas, notas_certificadas,
            carnet_discapacidad, documentos_filiacion, fecha_registro
          ) VALUES (
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?,
            ${exprFechaConvocatoria}, ${exprFechaRevision}, ${exprFechaDecision}, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, NOW()
          )
          `,
          [
            userId,
            periodoId,
            email,
            tipoBecaActual,
            promedioTrimestralExacto.toFixed(2),
            'Postulación estudiantil registrada para validación integral de becas UNIMAR.',
            departamentoAsignado,
            materiasJsonString,
            estatusFinal,
            observacionSol,
            revisadoPor,
            fotoCarnet,
            copiaCedula,
            constanciaResidencia,
            declaracionManutencion,
            informeMedico,
            constanciaClub,
            constanciaNotas,
            notasCertificadas,
            carnetDiscapacidad,
            documentosFiliacion,
          ]
        );

        const nuevaSolicitudId = Number(solIns.insertId);

        // 7. Construir y calcular estudio socioeconómico del estudiante (`tipo = 'estudiante'`)
        const perfilSocio = construirPerfilSocioeconomico(i);
        const nucleoFamiliar = JSON.stringify([
          {
            nombre: `Representante ${i}`,
            edad: String(enteroEnRango(42, 62)),
            sexo: 'F',
            parentesco: 'Madre',
            instruccion: 'Bachiller',
            ocupacion: 'Comerciante',
          },
          {
            nombre: `Familiar ${i}`,
            edad: String(enteroEnRango(14, 24)),
            sexo: 'M',
            parentesco: 'Hermano',
            instruccion: 'Estudiante',
            ocupacion: 'Estudiante',
          },
        ]);

        const ingresoTotal =
          perfilSocio.sueldo +
          perfilSocio.extra +
          perfilSocio.pension +
          perfilSocio.ayuda +
          perfilSocio.familiar +
          perfilSocio.rentas +
          perfilSocio.otros;

        const baremoEstudiante = await calcularPuntajeUnificado({
          ingresoTotal,
          rango_ingreso_familiar: perfilSocio.rangoIngreso,
          monto_ingreso_sueldo: perfilSocio.sueldo,
          monto_ingreso_extra: perfilSocio.extra,
          monto_ingreso_pension: perfilSocio.pension,
          monto_ingreso_ayuda: perfilSocio.ayuda,
          monto_ingreso_familiar: perfilSocio.familiar,
          monto_ingreso_rentas: perfilSocio.rentas,
          monto_ingreso_otros: perfilSocio.otros,
          monto_egreso_mercado: perfilSocio.egresoMercado,
          monto_egreso_vivienda: perfilSocio.egresoVivienda,
          monto_egreso_salud: perfilSocio.egresoSalud,
          monto_egreso_servicios: perfilSocio.egresoServicios,
          monto_egreso_suntuarios: perfilSocio.egresoSuntuarios,
          monto_egreso_estudios: perfilSocio.egresoEstudios,
          monto_egreso_recreacion: perfilSocio.egresoRecreacion,
          viviendaTipo: perfilSocio.viviendaTipo,
          viviendaEstatus: perfilSocio.viviendaEstatus,
          serv_agua: perfilSocio.servAgua,
          serv_luz: perfilSocio.servLuz,
          serv_gas: perfilSocio.servGas,
          serv_aseo: perfilSocio.servAseo,
          serv_telefono: perfilSocio.servTelefono,
          serv_cloacas: perfilSocio.servCloacas,
          serv_internet: perfilSocio.servInternet,
          equip_nevera: perfilSocio.equipNevera,
          equip_aire: perfilSocio.equipAire,
          equip_ventilador: perfilSocio.equipVentilador,
          equip_tv: perfilSocio.equipTv,
          equip_cocina: perfilSocio.equipCocina,
          equip_microondas: perfilSocio.equipMicroondas,
          equip_lavadora: perfilSocio.equipLavadora,
          equip_sonido: perfilSocio.equipSonido,
          equip_computadora: perfilSocio.equipComputadora,
          equip_celular: perfilSocio.equipCelular,
          equip_cable: perfilSocio.equipCable,
          poseeEmpleo: perfilSocio.poseeEmpleo,
          socio_condicion_laboral_tipo: perfilSocio.condicionLaboralTipo,
          familia_estatus_conyugal: perfilSocio.estatusConyugal,
          numHermanos: perfilSocio.numHermanos,
          familia_hermanos_uni: perfilSocio.hermanosUni,
          familia_nucleo_json: nucleoFamiliar,
          saludCondicion: perfilSocio.saludCondicion,
          familiaRelacion: perfilSocio.familiaRelacion,
          familia_problema_sn: perfilSocio.familiaProblemaSn,
        });

        const lugarNac = elegirAleatorio(LUGARES_NAC_SEED);
        const telfHab = `0295${enteroEnRango(2600000, 2999999)}`;
        const direccion = `Sector ${municipio}, Calle Principal #${i}`;
        const dirTrabajo = perfilSocio.poseeEmpleo === 'Si' ? `Av. Principal, ${municipio}` : 'NO';
        const telfTrabajo = perfilSocio.poseeEmpleo === 'Si' ? '02952610000' : 'NO';
        const descLaboral = perfilSocio.poseeEmpleo === 'Si' ? perfilSocio.cargo : 'NO';
        const ueProcedencia = elegirAleatorio(UES_SEED);
        const otrosEstudios = elegirAleatorio(OTROS_ESTUDIOS_SEED);
        const fechaUnimar = construirFechaIngresoUnimar(semestreNum);
        const modalidadEst = elegirAleatorio(MODALIDADES_ESTUDIO_SEED);
        const padreEdad = enteroEnRango(45, 65);
        const madreEdad = enteroEnRango(40, 60);
        const hermanosUniSn = perfilSocio.hermanosUni > 0 ? 'Si' : 'No';
        const orgActiva = elegirAleatorio(ORGANIZACIONES_SEED);

        const placeholderEstudio =
          '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())';

        const valoresBaseEstudio: Array<string | number | null> = [
          lugarNac,
          'Venezolano/a',
          'Soltero/a',
          telfHab,
          direccion,
          perfilSocio.empresa,
          perfilSocio.cargo,
          dirTrabajo,
          telfTrabajo,
          perfilSocio.condicionLaboralTipo,
          descLaboral,
          perfilSocio.sueldo,
          perfilSocio.extra,
          perfilSocio.pension,
          perfilSocio.ayuda,
          perfilSocio.familiar,
          perfilSocio.rentas,
          perfilSocio.otros,
          ueProcedencia,
          otrosEstudios,
          fechaUnimar,
          modalidadEst,
          `Padre Prueba ${i}`,
          padreEdad,
          'Comerciante',
          'Independiente',
          'Venezolano/a',
          'Bachiller',
          `Madre Prueba ${i}`,
          madreEdad,
          'Docente',
          'Institución Educativa',
          'Venezolano/a',
          'Universitario',
          perfilSocio.estatusConyugal,
          perfilSocio.numHermanos,
          perfilSocio.hermanosUni,
          hermanosUniSn,
          nucleoFamiliar,
          perfilSocio.rangoIngreso,
          perfilSocio.viviendaTipo,
          perfilSocio.viviendaEstatus,
          perfilSocio.egresoMercado,
          perfilSocio.egresoVivienda,
          perfilSocio.egresoSalud,
          perfilSocio.egresoServicios,
          perfilSocio.egresoSuntuarios,
          perfilSocio.egresoEstudios,
          perfilSocio.egresoRecreacion,
          perfilSocio.poseeEmpleo,
          perfilSocio.saludCondicion,
          perfilSocio.saludDesc,
          perfilSocio.saludTratamiento,
          perfilSocio.servAgua,
          perfilSocio.servLuz,
          perfilSocio.servGas,
          perfilSocio.servAseo,
          perfilSocio.servTelefono,
          perfilSocio.servCloacas,
          perfilSocio.servInternet,
          perfilSocio.equipNevera,
          perfilSocio.equipAire,
          perfilSocio.equipVentilador,
          perfilSocio.equipTv,
          perfilSocio.equipCocina,
          perfilSocio.equipMicroondas,
          perfilSocio.equipLavadora,
          perfilSocio.equipSonido,
          perfilSocio.equipComputadora,
          perfilSocio.equipCelular,
          perfilSocio.equipCable,
          perfilSocio.familiaRelacion,
          perfilSocio.familiaProblemaSn,
          perfilSocio.familiaProblemaDesc,
          orgActiva,
        ];

        // Estudio del estudiante (siempre presente para solicitudes creadas)
        estudiosBulkPlaceholders.push(placeholderEstudio);
        estudiosBulkValues.push(
          userId,
          periodoId,
          'estudiante',
          null,
          ...valoresBaseEstudio,
          'Información declarada por el estudiante al momento de su postulación.',
          baremoEstudiante.puntaje,
          baremoEstudiante.nivelRiesgo
        );

        // Para 'En Revisión', 'Aprobada' y 'Rechazada': incluir también el estudio de 'administrador'
        const incluirEstudioAdmin =
          estatusFinal === 'En Revisión' ||
          estatusFinal === 'Aprobada' ||
          estatusFinal === 'Rechazada';

        let puntajeReferencia = baremoEstudiante.puntaje;
        let riesgoReferencia: string = baremoEstudiante.nivelRiesgo;

        if (incluirEstudioAdmin) {
          const baremoAdmin = await calcularPuntajeUnificado({
            ingresoTotal,
            rango_ingreso_familiar: perfilSocio.rangoIngreso,
            monto_ingreso_sueldo: perfilSocio.sueldo,
            monto_ingreso_extra: perfilSocio.extra,
            monto_ingreso_pension: perfilSocio.pension,
            monto_ingreso_ayuda: perfilSocio.ayuda,
            monto_ingreso_familiar: perfilSocio.familiar,
            monto_ingreso_rentas: perfilSocio.rentas,
            monto_ingreso_otros: perfilSocio.otros,
            monto_egreso_mercado: perfilSocio.egresoMercado,
            monto_egreso_vivienda: perfilSocio.egresoVivienda,
            monto_egreso_salud: perfilSocio.egresoSalud,
            monto_egreso_servicios: perfilSocio.egresoServicios,
            monto_egreso_suntuarios: perfilSocio.egresoSuntuarios,
            monto_egreso_estudios: perfilSocio.egresoEstudios,
            monto_egreso_recreacion: perfilSocio.egresoRecreacion,
            viviendaTipo: perfilSocio.viviendaTipo,
            viviendaEstatus: perfilSocio.viviendaEstatus,
            serv_agua: perfilSocio.servAgua,
            serv_luz: perfilSocio.servLuz,
            serv_gas: perfilSocio.servGas,
            serv_aseo: perfilSocio.servAseo,
            serv_telefono: perfilSocio.servTelefono,
            serv_cloacas: perfilSocio.servCloacas,
            serv_internet: perfilSocio.servInternet,
            equip_nevera: perfilSocio.equipNevera,
            equip_aire: perfilSocio.equipAire,
            equip_ventilador: perfilSocio.equipVentilador,
            equip_tv: perfilSocio.equipTv,
            equip_cocina: perfilSocio.equipCocina,
            equip_microondas: perfilSocio.equipMicroondas,
            equip_lavadora: perfilSocio.equipLavadora,
            equip_sonido: perfilSocio.equipSonido,
            equip_computadora: perfilSocio.equipComputadora,
            equip_celular: perfilSocio.equipCelular,
            equip_cable: perfilSocio.equipCable,
            poseeEmpleo: perfilSocio.poseeEmpleo,
            socio_condicion_laboral_tipo: perfilSocio.condicionLaboralTipo,
            familia_estatus_conyugal: perfilSocio.estatusConyugal,
            numHermanos: perfilSocio.numHermanos,
            familia_hermanos_uni: perfilSocio.hermanosUni,
            familia_nucleo_json: nucleoFamiliar,
            saludCondicion: perfilSocio.saludCondicion,
            familiaRelacion: perfilSocio.familiaRelacion,
            familia_problema_sn: perfilSocio.familiaProblemaSn,
          });

          puntajeReferencia = baremoAdmin.puntaje;
          riesgoReferencia = baremoAdmin.nivelRiesgo;

          estudiosBulkPlaceholders.push(placeholderEstudio);
          estudiosBulkValues.push(
            userId,
            periodoId,
            'administrador',
            coordinacionId,
            ...valoresBaseEstudio,
            'Verificación socioeconómica contrastada y validada por Bienestar Estudiantil.',
            baremoAdmin.puntaje,
            baremoAdmin.nivelRiesgo
          );
        }

        // 8. Acumular trazabilidad en `historial_aprobaciones` para estatus gestionados
        if (estatusPrevioHistorial !== null && adminIdHistorial !== null) {
          historialBulkPlaceholders.push(
            '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)'
          );
          historialBulkValues.push(
            nuevaSolicitudId,
            userId,
            periodoId,
            adminIdHistorial,
            promedioTrimestralExacto.toFixed(2),
            Math.max(1, semestreNum - 1),
            puntajeReferencia,
            riesgoReferencia,
            tipoBecaActual,
            estatusPrevioHistorial,
            estatusFinal,
            observacionSol || `Cambio de estatus registrado a ${estatusFinal}.`,
            materiasJsonString,
            indiceGlobalExacto.toFixed(2),
            randomUUID(),
            '127.0.0.1'
          );
        }

        // Volcar por lotes de 25 registros en tablas hijas para optimizar memoria y pool
        if (
          recordBulkPlaceholders.length >= 150 ||
          estudiosBulkPlaceholders.length >= 40
        ) {
          await flushRecordsBulk();
          await flushEstudiosBulk();
          await flushHistorialBulk();
        }
      }

      await flushRecordsBulk();
      await flushEstudiosBulk();
      await flushHistorialBulk();

      await connection.commit();
    } catch (sqlError) {
      await connection.rollback();
      throw sqlError;
    }

    await ejecutarRotacionExcelenciaEnPeriodo(periodoId, SISTEMA_ADMIN_ID);

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');
    revalidatePath('/admin/estudio-socioeconomico');

    const totalCreadosAhora = existentesSet.size + bloqueIndices.length;
    const pendientesRestantes = LIMITE_TOTAL_ESTUDIANTES_SEED - totalCreadosAhora;
    const inicioLote = bloqueIndices[0];
    const finLote = bloqueIndices[bloqueIndices.length - 1];

    return {
      success: true,
      message: `Bloque de ${bloqueIndices.length} estudiantes creado (prueba${inicioLote}..prueba${finLote}@unimar.edu.ve | clave: 123456) en ${periodoActual.codigo} — Progreso: ${totalCreadosAhora}/${LIMITE_TOTAL_ESTUDIANTES_SEED} (${
        pendientesRestantes > 0
          ? `pulse nuevamente para los próximos ${Math.min(TAMANO_BLOQUE_SEED, pendientesRestantes)}`
          : 'lote completo de 1,000 finalizado'
      }). Sin solicitud: ${totalSinSolicitud} | Pendiente: ${conteoEstatus.Pendiente} | Convocado: ${conteoEstatus['Convocado a Entrevista']} | En Revisión: ${conteoEstatus['En Revisión']} | Aprobada: ${conteoEstatus.Aprobada} | Rechazada: ${conteoEstatus.Rechazada}.`,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido en Seeding.';
    console.error('❌ Error en Seeding:', error);
    return { success: false, error: message };
  } finally {
    if (connection) connection.release();
  }
}

/**
 * LIMPIEZA DE DATOS: Borra ordenadamente todos los estudiantes de prueba
 * (`prueba1..prueba1000@unimar.edu.ve` y legados `test_user*@unimar.edu.ve`)
 * junto con su historial, estudios socioeconómicos, récord académico y solicitudes.
 */
export async function cleanSeedData(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  let connection: PoolConnection | undefined;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [rows] = await connection.execute<UserIdSeedRow[]>(
        `
        SELECT id
        FROM users
        WHERE (
          LOWER(TRIM(email)) REGEXP '^prueba([1-9]|[1-9][0-9]|[1-9][0-9][0-9]|1000)@unimar\\\\.edu\\\\.ve$'
          OR LOWER(TRIM(email)) LIKE 'test_user%@unimar.edu.ve'
        )
          AND id NOT IN (10, 12)
        `
      );

      const idsToDelete = rows.map((r) => Number(r.id));

      if (idsToDelete.length === 0) {
        await connection.commit();
        return {
          success: true,
          message: 'No se encontraron registros de prueba para eliminar.',
        };
      }

      const chunkSize = 200;
      for (let start = 0; start < idsToDelete.length; start += chunkSize) {
        const loteIds = idsToDelete.slice(start, start + chunkSize);
        const placeholders = loteIds.map(() => '?').join(',');

        await connection.execute<ResultSetHeader>(
          `DELETE FROM historial_aprobaciones WHERE user_id IN (${placeholders})`,
          loteIds
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM estudios_socioeconomicos WHERE student_id IN (${placeholders})`,
          loteIds
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM record_academico WHERE student_id IN (${placeholders})`,
          loteIds
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM solicitudes WHERE user_id IN (${placeholders})`,
          loteIds
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM students WHERE id IN (${placeholders})`,
          loteIds
        );
        await connection.execute<ResultSetHeader>(
          `DELETE FROM users WHERE id IN (${placeholders})`,
          loteIds
        );
      }

      await connection.commit();
    } catch (sqlError) {
      await connection.rollback();
      throw sqlError;
    }

    await ejecutarRotacionExcelenciaEnPeriodo(undefined, SISTEMA_ADMIN_ID);

    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes');
    revalidatePath('/admin/estudio-socioeconomico');

    return {
      success: true,
      message:
        'Todos los registros de prueba (prueba1..prueba1000 y lotes anteriores), sus récords académicos, solicitudes, historial y estudios socioeconómicos fueron eliminados correctamente.',
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido en Limpieza.';
    console.error('❌ Error en Limpieza:', error);
    return { success: false, error: message };
  } finally {
    if (connection) connection.release();
  }
}