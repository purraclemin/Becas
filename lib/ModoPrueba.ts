'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { revalidatePath } from 'next/cache'
import { db } from './db'

const CLAVE_PERIODO_SIMULADO = 'periodo_simulado_codigo'

interface SistemaConfigRow extends RowDataPacket {
  clave: string;
  valor_int: number | null;
  valor_txt: string | null;
}

interface PeriodoActualInfoRow extends RowDataPacket {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ModoPruebaStatus {
  activo: boolean;
  mesSimulado: string | null;
  periodoSimuladoCodigo: string | null;
  periodoActualCodigo: string;
  periodoActualNombre: string;
  siguientePeriodoCodigo: string;
  siguientePeriodoNombre: string;
}

export interface ResultadoAvancePeriodo {
  success: boolean;
  periodoAnteriorCodigo?: string;
  periodoNuevoCodigo?: string;
  periodoNuevoNombre?: string;
  totalProcesados?: number;
  aprobados?: number;
  rechazados?: number;
  finalizados?: number;
  estudiantesAvanzados?: number;
  error?: string;
}

export interface ResultadoRestaurarPeriodo {
  success: boolean;
  periodoActualCodigo?: string;
  periodoActualNombre?: string;
  error?: string;
}

function calcularCodigoCalendarioReal(): { codigo: string; nombre: string } {
  const fecha = new Date();
  const mes = fecha.getMonth() + 1;
  const anio = fecha.getFullYear();

  if (mes === 12 || mes <= 3) {
    const targetAnio = mes === 12 ? anio + 1 : anio;
    return {
      codigo: `${targetAnio}-I`,
      nombre: `Periodo I ${targetAnio} (Ene-Abr)`,
    };
  }

  if (mes >= 4 && mes <= 7) {
    return {
      codigo: `${anio}-II`,
      nombre: `Periodo II ${anio} (May-Ago)`,
    };
  }

  return {
    codigo: `${anio}-III`,
    nombre: `Periodo III ${anio} (Sep-Dic)`,
  };
}

function calcularSiguientePeriodoLocal(codigoActual: string): {
  codigo: string;
  nombre: string;
} {
  const [anioStr, lapso] = String(codigoActual || '').trim().split('-');
  const anio = parseInt(anioStr, 10);
  const anioBase = Number.isInteger(anio) && anio > 0 ? anio : new Date().getFullYear();

  let nuevoLapso = 'I';
  let nuevoAnio = anioBase;

  if (lapso === 'I') {
    nuevoLapso = 'II';
  } else if (lapso === 'II') {
    nuevoLapso = 'III';
  } else if (lapso === 'III') {
    nuevoLapso = 'I';
    nuevoAnio = anioBase + 1;
  }

  const mesesDesc =
    nuevoLapso === 'I' ? 'Ene-Abr' : nuevoLapso === 'II' ? 'May-Ago' : 'Sep-Dic';

  return {
    codigo: `${nuevoAnio}-${nuevoLapso}`,
    nombre: `Periodo ${nuevoLapso} ${nuevoAnio} (${mesesDesc})`,
  };
}

async function upsertConfig(
  clave: string,
  valorInt: number | null,
  valorTxt: string | null
): Promise<void> {
  await db.execute<ResultSetHeader>(
    `
    INSERT INTO sistema_config (clave, valor_int, valor_txt)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      valor_int = VALUES(valor_int),
      valor_txt = VALUES(valor_txt)
    `,
    [clave, valorInt, valorTxt]
  );
}

function revalidarTodoElSistema(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/validarBeca');
  revalidatePath('/admin/reportes');
  revalidatePath('/admin/estudiantes');
  revalidatePath('/admin/analiticas');
  revalidatePath('/perfil');
}

/**
 * Consulta el estado actual del modo prueba y la progresión cronológica de periodos.
 */
export async function getModoPruebaStatus(): Promise<ModoPruebaStatus> {
  const realFallback = calcularCodigoCalendarioReal();

  try {
    const [[configRows], [periodoRows]] = await Promise.all([
      db.execute<SistemaConfigRow[]>(
        'SELECT clave, valor_int, valor_txt FROM sistema_config'
      ),
      db.execute<PeriodoActualInfoRow[]>(
        'SELECT id, codigo, nombre FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
      ),
    ]);

    const bypass = configRows.find((r) => r.clave === 'bypass_reglas')?.valor_int === 1;
    const mes = configRows.find((r) => r.clave === 'mes_simulado')?.valor_txt ?? null;
    const periodoSimuladoRaw =
      configRows.find((r) => r.clave === CLAVE_PERIODO_SIMULADO)?.valor_txt ?? null;
    const periodoSimuladoCodigo =
      periodoSimuladoRaw && periodoSimuladoRaw.trim() !== ''
        ? periodoSimuladoRaw.trim().toUpperCase()
        : null;

    const periodoActualCodigo =
      periodoRows[0]?.codigo?.trim() || periodoSimuladoCodigo || realFallback.codigo;
    const periodoActualNombre =
      periodoRows[0]?.nombre?.trim() || realFallback.nombre;

    const siguiente = calcularSiguientePeriodoLocal(periodoActualCodigo);

    return {
      activo: bypass,
      mesSimulado: mes,
      periodoSimuladoCodigo,
      periodoActualCodigo,
      periodoActualNombre,
      siguientePeriodoCodigo: siguiente.codigo,
      siguientePeriodoNombre: siguiente.nombre,
    };
  } catch {
    const siguiente = calcularSiguientePeriodoLocal(realFallback.codigo);
    return {
      activo: false,
      mesSimulado: null,
      periodoSimuladoCodigo: null,
      periodoActualCodigo: realFallback.codigo,
      periodoActualNombre: realFallback.nombre,
      siguientePeriodoCodigo: siguiente.codigo,
      siguientePeriodoNombre: siguiente.nombre,
    };
  }
}

/**
 * Avanza cronológicamente al siguiente periodo académico sin límite de año
 * (ej. 2026-III → 2027-I → 2027-II → 2027-III → 2028-I ...), persiste
 * `periodo_simulado_codigo` en `sistema_config`, ejecuta la transición masiva
 * y revalida todas las vistas administrativas y estudiantiles.
 */
export async function avanzarAlSiguientePeriodoSimulado(): Promise<ResultadoAvancePeriodo> {
  try {
    const { obtenerOCrearPeriodoObjetivo, obtenerSiguientePeriodoData } = await import(
      './SolicitudAcademic'
    );
    const { procesarTransicionMasivaDePeriodo } = await import('./ActionsRenovacion');

    // Garantizar que exista al menos un periodo activo base antes de calcular el siguiente
    await obtenerOCrearPeriodoObjetivo();

    const [actualRows] = await db.execute<PeriodoActualInfoRow[]>(
      'SELECT id, codigo, nombre FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );
    const codigoBase =
      actualRows[0]?.codigo?.trim() || calcularCodigoCalendarioReal().codigo;

    const siguiente = await obtenerSiguientePeriodoData(codigoBase);

    await upsertConfig('bypass_reglas', 1, null);
    await upsertConfig('mes_simulado', null, null);
    await upsertConfig(CLAVE_PERIODO_SIMULADO, 1, siguiente.codigo);

    const nuevoPeriodoId = Number(await obtenerOCrearPeriodoObjetivo());
    let resumen = {
      totalProcesados: 0,
      aprobados: 0,
      rechazados: 0,
      finalizados: 0,
      esperaActualizados: 0,
      estudiantesAvanzados: 0,
    };

    if (nuevoPeriodoId > 0) {
      resumen = await procesarTransicionMasivaDePeriodo(nuevoPeriodoId);
    }

    revalidarTodoElSistema();

    return {
      success: true,
      periodoAnteriorCodigo: codigoBase,
      periodoNuevoCodigo: siguiente.codigo,
      periodoNuevoNombre: siguiente.nombre,
      totalProcesados: resumen.totalProcesados,
      aprobados: resumen.aprobados,
      rechazados: resumen.rechazados,
      finalizados: resumen.finalizados,
      estudiantesAvanzados: resumen.estudiantesAvanzados,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al avanzar de periodo.';
    console.error('❌ Error en avanzarAlSiguientePeriodoSimulado:', error);
    return { success: false, error: message };
  }
}

/**
 * Restaura el sistema al periodo académico real del calendario del servidor,
 * limpiando la simulación de periodo y revalidando todas las pantallas.
 */
export async function restaurarPeriodoReal(): Promise<ResultadoRestaurarPeriodo> {
  try {
    await upsertConfig('bypass_reglas', 0, null);
    await upsertConfig('mes_simulado', null, null);
    await upsertConfig(CLAVE_PERIODO_SIMULADO, 0, null);

    const { obtenerOCrearPeriodoObjetivo } = await import('./SolicitudAcademic');
    await obtenerOCrearPeriodoObjetivo();

    const [actualRows] = await db.execute<PeriodoActualInfoRow[]>(
      'SELECT id, codigo, nombre FROM periodos_academicos WHERE es_actual = 1 LIMIT 1'
    );
    const realFallback = calcularCodigoCalendarioReal();

    revalidarTodoElSistema();

    return {
      success: true,
      periodoActualCodigo: actualRows[0]?.codigo?.trim() || realFallback.codigo,
      periodoActualNombre: actualRows[0]?.nombre?.trim() || realFallback.nombre,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Error al restaurar periodo real.';
    console.error('❌ Error en restaurarPeriodoReal:', error);
    return { success: false, error: message };
  }
}

/**
 * Activa o desactiva el bypass de reglas conservando la compatibilidad
 * con llamadas heredadas del modo prueba.
 */
export async function toggleModoPrueba(
  activar: boolean,
  mes?: string
): Promise<{ success: boolean }> {
  try {
    await upsertConfig('bypass_reglas', activar ? 1 : 0, null);
    await upsertConfig('mes_simulado', null, activar ? mes || null : null);

    if (!activar) {
      await upsertConfig(CLAVE_PERIODO_SIMULADO, 0, null);
    }

    try {
      const { obtenerOCrearPeriodoObjetivo } = await import('./SolicitudAcademic');
      const { procesarTransicionMasivaDePeriodo } = await import('./ActionsRenovacion');
      const periodoId = Number(await obtenerOCrearPeriodoObjetivo());
      if (activar && periodoId > 0) {
        await procesarTransicionMasivaDePeriodo(periodoId);
      }
    } catch (transicionErr) {
      console.error(
        '⚠️ Advertencia ejecutando transición de periodo en ModoPrueba:',
        transicionErr
      );
    }

    revalidarTodoElSistema();

    return { success: true };
  } catch (error) {
    console.error('Error al cambiar modo prueba:', error);
    return { success: false };
  }
}
