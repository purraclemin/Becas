'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { getModoPruebaStatus } from './ModoPrueba'

interface RecordPromedioRow extends RowDataPacket {
  promedio: number | string | null;
  total: number;
}

interface SolicitudMateriasRow extends RowDataPacket {
  materias_json: string | null;
}

interface PeriodoExistenteRow extends RowDataPacket {
  id: number;
  es_actual: number;
}

export interface MateriaNotaEntrada {
  nota: number | string;
}

interface MetadatosPeriodo {
  codigo: string;
  nombre: string;
  inicio: string;
  fin: string;
}

function construirMetadatosPorCodigo(codigoRaw: string): MetadatosPeriodo | null {
  const limpio = String(codigoRaw || '').trim().toUpperCase();
  const match = /^(\d{4})-(I|II|III)$/.exec(limpio);
  if (!match) return null;

  const anio = parseInt(match[1], 10);
  const lapso = match[2];

  if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) return null;

  const mesesDesc =
    lapso === 'I' ? 'Ene-Abr' : lapso === 'II' ? 'May-Ago' : 'Sep-Dic';
  const mesInicio =
    lapso === 'I' ? '01-01' : lapso === 'II' ? '05-01' : '09-01';
  const mesFin =
    lapso === 'I' ? '04-30' : lapso === 'II' ? '08-31' : '12-31';

  return {
    codigo: `${anio}-${lapso}`,
    nombre: `Periodo ${lapso} ${anio} (${mesesDesc})`,
    inicio: `${anio}-${mesInicio}`,
    fin: `${anio}-${mesFin}`,
  };
}

function construirMetadatosPorCalendario(mes: number, anio: number): MetadatosPeriodo {
  if (mes === 12 || mes <= 3) {
    const targetAnio = mes === 12 ? anio + 1 : anio;
    return {
      codigo: `${targetAnio}-I`,
      nombre: `Periodo I ${targetAnio} (Ene-Abr)`,
      inicio: `${targetAnio}-01-01`,
      fin: `${targetAnio}-04-30`,
    };
  }

  if (mes >= 4 && mes <= 7) {
    return {
      codigo: `${anio}-II`,
      nombre: `Periodo II ${anio} (May-Ago)`,
      inicio: `${anio}-05-01`,
      fin: `${anio}-08-31`,
    };
  }

  return {
    codigo: `${anio}-III`,
    nombre: `Periodo III ${anio} (Sep-Dic)`,
    inicio: `${anio}-09-01`,
    fin: `${anio}-12-31`,
  };
}

/**
 * Recalcula students.indice_global priorizando siempre `record_academico`
 * como Única Fuente de Verdad. Solo recurre a `solicitudes.materias_json`
 * si el estudiante aún no posee filas en `record_academico`.
 */
export async function actualizarIndiceGlobal(
  userId: number,
  materiasActuales: ReadonlyArray<MateriaNotaEntrada> = []
): Promise<void> {
  try {
    const idNum = Number(userId);
    if (!Number.isInteger(idNum) || idNum <= 0) return;

    const [recordRows] = await db.execute<RecordPromedioRow[]>(
      `
      SELECT
        ROUND(AVG(nota), 2) AS promedio,
        COUNT(*) AS total
      FROM record_academico
      WHERE student_id = ?
      `,
      [idNum]
    );

    const totalRecord = Number(recordRows[0]?.total ?? 0);
    if (totalRecord > 0) {
      const promedioRecord = Number(recordRows[0]?.promedio ?? 0);
      if (Number.isFinite(promedioRecord)) {
        await db.execute<ResultSetHeader>(
          'UPDATE students SET indice_global = ? WHERE id = ?',
          [promedioRecord.toFixed(2), idNum]
        );
      }
      return;
    }

    const [solicitudes] = await db.execute<SolicitudMateriasRow[]>(
      `
      SELECT materias_json
      FROM solicitudes
      WHERE user_id = ?
        AND estatus IN ('Aprobada', 'Revisión Especial', 'Revision Especial', 'Pendiente')
      `,
      [idNum]
    );

    let sumaNotas = 0;
    let totalMaterias = 0;

    for (const sol of solicitudes) {
      if (!sol.materias_json) continue;
      try {
        const parsedData: unknown = JSON.parse(sol.materias_json);
        const listaMaterias: unknown[] = Array.isArray(parsedData)
          ? parsedData
          : parsedData &&
              typeof parsedData === 'object' &&
              'materias' in parsedData &&
              Array.isArray((parsedData as { materias?: unknown }).materias)
            ? ((parsedData as { materias: unknown[] }).materias)
            : [];

        for (const item of listaMaterias) {
          if (item && typeof item === 'object' && 'nota' in item) {
            const nota = parseFloat(String((item as { nota?: unknown }).nota ?? ''));
            if (Number.isFinite(nota)) {
              sumaNotas += nota;
              totalMaterias += 1;
            }
          }
        }
      } catch (e) {
        console.error('Error al parsear materias del historial:', e);
      }
    }

    for (const m of materiasActuales) {
      const nota = parseFloat(String(m.nota));
      if (Number.isFinite(nota)) {
        sumaNotas += nota;
        totalMaterias += 1;
      }
    }

    if (totalMaterias > 0) {
      const nuevoIndice = (sumaNotas / totalMaterias).toFixed(2);
      await db.execute<ResultSetHeader>(
        'UPDATE students SET indice_global = ? WHERE id = ?',
        [nuevoIndice, idNum]
      );
    }
  } catch (error) {
    console.error('❌ Error recalculando índice global:', error);
  }
}

/**
 * Determina, crea o activa el periodo académico objetivo:
 * 1) Si existe un periodo cronológico simulado activo (`periodo_simulado_codigo`, ej. 2027-I, 2027-II...),
 *    lo respeta sin retroceder al año calendario del servidor.
 * 2) Compatibilidad con `mes_simulado` heredado si no hay código secuencial definido.
 * 3) En modo normal, activa el periodo real correspondiente al calendario actual.
 */
export async function obtenerOCrearPeriodoObjetivo(): Promise<number> {
  const { activo, mesSimulado, periodoSimuladoCodigo } = await getModoPruebaStatus();
  const fecha = new Date();

  let meta: MetadatosPeriodo | null = null;

  if (activo && periodoSimuladoCodigo) {
    meta = construirMetadatosPorCodigo(periodoSimuladoCodigo);
  }

  if (!meta) {
    const mes =
      activo && mesSimulado ? parseInt(mesSimulado, 10) : fecha.getMonth() + 1;
    const mesValido = Number.isInteger(mes) && mes >= 1 && mes <= 12
      ? mes
      : fecha.getMonth() + 1;
    meta = construirMetadatosPorCalendario(mesValido, fecha.getFullYear());
  }

  const fechaInicioObj = new Date(`${meta.inicio}T00:00:00`);
  const fechaLimiteObj = new Date(fechaInicioObj);
  fechaLimiteObj.setDate(fechaInicioObj.getDate() + 14);
  const fLimite = fechaLimiteObj.toISOString().split('T')[0];

  const [rows] = await db.execute<PeriodoExistenteRow[]>(
    'SELECT id, es_actual FROM periodos_academicos WHERE codigo = ? LIMIT 1',
    [meta.codigo]
  );

  let periodId = 0;

  if (rows.length > 0) {
    periodId = Number(rows[0].id);
    if (Number(rows[0].es_actual) === 0) {
      await db.execute<ResultSetHeader>('UPDATE periodos_academicos SET es_actual = 0');
      await db.execute<ResultSetHeader>(
        'UPDATE periodos_academicos SET fecha_limite_solicitud = ?, es_actual = 1 WHERE id = ?',
        [fLimite, periodId]
      );
    }
  } else {
    await db.execute<ResultSetHeader>('UPDATE periodos_academicos SET es_actual = 0');
    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO periodos_academicos
        (codigo, nombre, fecha_inicio, fecha_fin, fecha_limite_solicitud, es_actual)
      VALUES (?, ?, ?, ?, ?, 1)
      `,
      [meta.codigo, meta.nombre, meta.inicio, meta.fin, fLimite]
    );
    periodId = Number(result.insertId);
  }

  return periodId;
}

/**
 * Calcula los metadatos del siguiente periodo académico a partir de un código (ej. 2026-III -> 2027-I).
 */
export async function obtenerSiguientePeriodoData(codigoActual: string): Promise<{
  codigo: string;
  nombre: string;
  inicio: string;
  fin: string;
}> {
  const [anioStr, lapso] = codigoActual.split('-');
  const anio = parseInt(anioStr, 10);
  const anioBase = Number.isInteger(anio) && anio > 0 ? anio : new Date().getFullYear();
  let nuevoLapso = '';
  let nuevoAnio = anioBase;

  if (lapso === 'I') {
    nuevoLapso = 'II';
  } else if (lapso === 'II') {
    nuevoLapso = 'III';
  } else if (lapso === 'III') {
    nuevoLapso = 'I';
    nuevoAnio = anioBase + 1;
  } else {
    nuevoLapso = 'I';
  }

  const nuevoCodigo = `${nuevoAnio}-${nuevoLapso}`;
  const mesesDesc =
    nuevoLapso === 'I' ? 'Ene-Abr' : nuevoLapso === 'II' ? 'May-Ago' : 'Sep-Dic';

  const mesInicio =
    nuevoLapso === 'I' ? '01-01' : nuevoLapso === 'II' ? '05-01' : '09-01';
  const mesFin =
    nuevoLapso === 'I' ? '04-30' : nuevoLapso === 'II' ? '08-31' : '12-31';

  return {
    codigo: nuevoCodigo,
    nombre: `Periodo ${nuevoLapso} ${nuevoAnio} (${mesesDesc})`,
    inicio: `${nuevoAnio}-${mesInicio}`,
    fin: `${nuevoAnio}-${mesFin}`,
  };
}
