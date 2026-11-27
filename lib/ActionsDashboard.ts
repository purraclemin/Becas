'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { unstable_noStore as noStore } from 'next/cache'
import { db } from './db'
import { ejecutarRotacionExcelenciaEnPeriodo } from './ActionsGestionEspecial'
import { SISTEMA_ADMIN_ID } from './RecordAcademicoUtils'

export interface EstadisticaEstatus {
  estatus: string;
  total: number;
}

export interface EstadisticaTipoBeca {
  tipo_beca: string;
  total: number;
  [key: string]: unknown;
}

export interface EstadisticaCarrera {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface EstadisticasBecasResponse {
  porEstatus: EstadisticaEstatus[];
  porTipo: EstadisticaTipoBeca[];
  promedio: number;
  porCarrera: EstadisticaCarrera[];
}

interface PeriodoActualRow extends RowDataPacket {
  id: number;
  fecha_inicio: Date | string | null;
}

interface EstatusCountRow extends RowDataPacket {
  estatus: string | null;
  total: number | string;
}

interface TotalCountRow extends RowDataPacket {
  total: number | string;
}

interface TipoBecaCountRow extends RowDataPacket {
  tipo_beca: string | null;
  total: number | string;
}

interface PromedioGeneralRow extends RowDataPacket {
  promedio: number | string | null;
}

interface CarreraCountRow extends RowDataPacket {
  name: string | null;
  value: number | string;
}

const ORDEN_ESTATUS: Readonly<Record<string, number>> = {
  Pendiente: 1,
  'Convocado a Entrevista': 2,
  'En Revisión': 3,
  Aprobada: 4,
  Rechazada: 5,
  Finalizada: 6,
};

function normalizarFechaSql(fecha: Date | string | null | undefined): string {
  if (!fecha) return '';
  if (fecha instanceof Date) {
    return Number.isNaN(fecha.getTime()) ? '' : fecha.toISOString().split('T')[0];
  }
  const s = String(fecha).trim();
  return s.includes('T') ? s.split('T')[0] : s.slice(0, 10);
}

export async function obtenerEstadisticasBecas(): Promise<EstadisticasBecasResponse> {
  noStore();

  try {
    // Sincronización automática (fast-path idempotente) de la Nómina de Excelencia Académica
    try {
      await ejecutarRotacionExcelenciaEnPeriodo(undefined, SISTEMA_ADMIN_ID);
    } catch (rotErr) {
      console.error('⚠️ Advertencia sincronizando Excelencia en Dashboard:', rotErr);
    }

    // 0. Obtener el periodo académico vigente (es_actual = 1) y su fecha de inicio cronológica
    const [periodoRows] = await db.execute<PeriodoActualRow[]>(
      `SELECT id, fecha_inicio FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const periodoActualId = Number(periodoRows[0]?.id ?? 0);
    const fechaInicioActual = normalizarFechaSql(periodoRows[0]?.fecha_inicio);
    const usarCorteCronologico = periodoActualId > 0 && fechaInicioActual !== '';

    // Subconsulta deduplicada por estudiante acotada cronológicamente al periodo activo (<= es_actual),
    // evitando que periodos futuros creados con el DEV PANEL contaminen los KPIs al regresar al periodo real.
    const joinUltimaSolicitud = usarCorteCronologico
      ? `
        INNER JOIN (
          SELECT s_u.user_id, MAX(s_u.id) AS last_id
          FROM solicitudes s_u
          INNER JOIN periodos_academicos p_u ON s_u.periodo_id = p_u.id
          WHERE p_u.fecha_inicio <= ?
          GROUP BY s_u.user_id
        ) ult ON s.id = ult.last_id
        INNER JOIN students st ON s.user_id = st.id
      `
      : `
        INNER JOIN (
          SELECT user_id, MAX(id) AS last_id
          FROM solicitudes
          GROUP BY user_id
        ) ult ON s.id = ult.last_id
        INNER JOIN students st ON s.user_id = st.id
      `;

    const paramsCorte: Array<string | number> = usarCorteCronologico
      ? [fechaInicioActual]
      : [];

    // 1A. Conteo exacto 1:1 de 'Aprobada' en el periodo activo (paridad exacta con Reportes y ValidarBeca)
    const promesaAprobadasActivas =
      periodoActualId > 0
        ? db.execute<TotalCountRow[]>(
            `
            SELECT COUNT(*) AS total
            FROM solicitudes s
            INNER JOIN students st ON s.user_id = st.id
            WHERE s.periodo_id = ?
              AND LOWER(TRIM(s.estatus)) = 'aprobada'
            `,
            [periodoActualId]
          )
        : db.execute<TotalCountRow[]>(
            `
            SELECT COUNT(*) AS total
            FROM solicitudes s
            ${joinUltimaSolicitud}
            WHERE LOWER(TRIM(s.estatus)) = 'aprobada'
            `,
            paramsCorte
          );

    // 1B. Resto de estatus deduplicados hasta el periodo activo (sin doble conteo respecto a Aprobadas activas)
    const promesaOtrosEstatus =
      periodoActualId > 0
        ? db.execute<EstatusCountRow[]>(
            `
            SELECT s.estatus, COUNT(*) AS total
            FROM solicitudes s
            ${joinUltimaSolicitud}
            WHERE LOWER(TRIM(s.estatus)) <> 'aprobada'
              AND NOT EXISTS (
                SELECT 1
                FROM solicitudes s_ap
                WHERE s_ap.user_id = s.user_id
                  AND s_ap.periodo_id = ?
                  AND LOWER(TRIM(s_ap.estatus)) = 'aprobada'
              )
            GROUP BY s.estatus
            `,
            [...paramsCorte, periodoActualId]
          )
        : db.execute<EstatusCountRow[]>(
            `
            SELECT s.estatus, COUNT(*) AS total
            FROM solicitudes s
            ${joinUltimaSolicitud}
            WHERE LOWER(TRIM(s.estatus)) <> 'aprobada'
            GROUP BY s.estatus
            `,
            paramsCorte
          );

    // 2. Total por tipo de beca (deduplicado hasta el periodo activo)
    const promesaTipos = db.execute<TipoBecaCountRow[]>(
      `
      SELECT
        COALESCE(NULLIF(TRIM(s.tipo_beca), ''), 'Sin Especificar') AS tipo_beca,
        COUNT(*) AS total
      FROM solicitudes s
      ${joinUltimaSolicitud}
      GROUP BY COALESCE(NULLIF(TRIM(s.tipo_beca), ''), 'Sin Especificar')
      ORDER BY total DESC
      `,
      paramsCorte
    );

    // 3. Promedio general académico de la última solicitud hasta el periodo activo
    const promesaPromedio = db.execute<PromedioGeneralRow[]>(
      `
      SELECT AVG(s.promedio_notas) AS promedio
      FROM solicitudes s
      ${joinUltimaSolicitud}
      `,
      paramsCorte
    );

    // 4. Total por Carrera (deduplicado hasta el periodo activo, ordenado por mayor demanda)
    const promesaCarrera = db.execute<CarreraCountRow[]>(
      `
      SELECT
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS name,
        COUNT(s.id) AS value
      FROM solicitudes s
      ${joinUltimaSolicitud}
      GROUP BY COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar')
      ORDER BY value DESC
      `,
      paramsCorte
    );

    const [
      [rowsAprobadas],
      [rowsOtrosEstatus],
      [rowsTipos],
      [rowsPromedio],
      [rowsCarrera],
    ] = await Promise.all([
      promesaAprobadasActivas,
      promesaOtrosEstatus,
      promesaTipos,
      promesaPromedio,
      promesaCarrera,
    ]);

    const totalAprobadas = Number(rowsAprobadas[0]?.total) || 0;
    const porEstatusCombinado: EstadisticaEstatus[] = rowsOtrosEstatus.map((row) => ({
      estatus: String(row.estatus ?? ''),
      total: Number(row.total) || 0,
    }));

    if (totalAprobadas > 0) {
      porEstatusCombinado.push({ estatus: 'Aprobada', total: totalAprobadas });
    }

    porEstatusCombinado.sort((a, b) => {
      const ordenA = ORDEN_ESTATUS[a.estatus] ?? 99;
      const ordenB = ORDEN_ESTATUS[b.estatus] ?? 99;
      return ordenA - ordenB;
    });

    return {
      porEstatus: porEstatusCombinado,
      porTipo: rowsTipos.map((row) => ({
        tipo_beca: String(row.tipo_beca ?? 'Sin Especificar'),
        total: Number(row.total) || 0,
      })),
      promedio: Number(rowsPromedio[0]?.promedio) || 0,
      porCarrera: rowsCarrera.map((row) => ({
        name: String(row.name ?? 'Sin Asignar'),
        value: Number(row.value) || 0,
      })),
    };
  } catch (error) {
    console.error('❌ Error Crítico en Dashboard KPIs:', error);
    return {
      porEstatus: [],
      porTipo: [],
      promedio: 0,
      porCarrera: [],
    };
  }
}
