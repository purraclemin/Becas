'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { unstable_noStore as noStore } from 'next/cache'
import { queryFresh } from './db'

export interface FiltrosRanking {
  carrera?: string;
  tipoBeca?: string;
}

export interface EstudianteRankingRow {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  carrera: string;
  tipo_beca: string;
  promedio_notas: number;
  vulnerabilidad_puntos: number;
  origen_puntaje: 'admin' | 'estudiante';
  indice_merito: number;
}

interface RankingPrioridadSQLRow extends RowDataPacket {
  id: number;
  nombre: string | null;
  apellido: string | null;
  cedula: string | number | null;
  carrera: string | null;
  tipo_beca: string | null;
  promedio_notas: number | string | null;
  vulnerabilidad_puntos: number | string | null;
  origen_puntaje: 'admin' | 'estudiante' | null;
  indice_merito: number | string | null;
}

export async function obtenerRankingPrioridad(
  filtros: FiltrosRanking = {}
): Promise<EstudianteRankingRow[]> {
  noStore();

  try {
    const condiciones: string[] = [
      "(s.estatus = 'Pendiente' OR s.estatus = 'En Revisión')",
      "s.promedio_notas >= 16.49"
    ];
    const parametros: Array<string | number> = [];

    if (filtros.carrera && filtros.carrera.trim() !== "") {
      condiciones.push("LOWER(TRIM(st.carrera)) = ?");
      parametros.push(filtros.carrera.trim().toLowerCase());
    }

    if (filtros.tipoBeca && filtros.tipoBeca.trim() !== "") {
      condiciones.push("LOWER(TRIM(s.tipo_beca)) = ?");
      parametros.push(filtros.tipoBeca.trim().toLowerCase());
    }

    const whereClause = `WHERE ${condiciones.join(' AND ')}`;

    const query = `
      SELECT
        s.id,
        st.nombre,
        st.apellido,
        st.cedula,
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS carrera,
        COALESCE(NULLIF(TRIM(s.tipo_beca), ''), 'No especificado') AS tipo_beca,
        s.promedio_notas,
        COALESCE(e_adm.puntaje, e_est.puntaje, 0) AS vulnerabilidad_puntos,
        CASE
          WHEN e_adm.id IS NOT NULL THEN 'admin'
          ELSE 'estudiante'
        END AS origen_puntaje,
        (
          (CAST(s.promedio_notas AS DECIMAL(10,2)) * 100) +
          (COALESCE(e_adm.puntaje, e_est.puntaje, 0) * 1.5)
        ) AS indice_merito
      FROM solicitudes s
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        GROUP BY user_id
      ) ult ON s.id = ult.last_id
      INNER JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e_adm
        ON e_adm.id = (
          SELECT MAX(es1.id)
          FROM estudios_socioeconomicos es1
          WHERE es1.student_id = st.id
            AND es1.tipo = 'administrador'
        )
      LEFT JOIN estudios_socioeconomicos e_est
        ON e_est.id = (
          SELECT MAX(es2.id)
          FROM estudios_socioeconomicos es2
          WHERE es2.student_id = st.id
            AND es2.tipo = 'estudiante'
        )
      ${whereClause}
      ORDER BY indice_merito DESC
      LIMIT 6
    `;

    const rows = await queryFresh<RankingPrioridadSQLRow[]>(query, parametros);

    return rows.map((row) => ({
      id: Number(row.id),
      cedula: String(row.cedula ?? '').trim(),
      nombre: String(row.nombre ?? '').trim(),
      apellido: String(row.apellido ?? '').trim(),
      carrera: String(row.carrera ?? 'Sin Asignar').trim(),
      tipo_beca: String(row.tipo_beca ?? 'No especificado').trim(),
      promedio_notas: Number(row.promedio_notas) || 0,
      vulnerabilidad_puntos: Number(row.vulnerabilidad_puntos) || 0,
      origen_puntaje: row.origen_puntaje === 'admin' ? 'admin' : 'estudiante',
      indice_merito: Number(row.indice_merito) || 0,
    }));
  } catch (error) {
    console.error('❌ Error calculando Ranking de Prioridad:', error);
    return [];
  }
}
