'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { unstable_noStore as noStore } from 'next/cache'
import { db } from './db'
import type { AnaliticasAvanzadas, DatosEmbudo, DatosMatriz, DatosRadar } from '../types/analitica'

interface PeriodoIdRow extends RowDataPacket {
  id: number;
}

interface DinamicaEmbudoRow extends RowDataPacket {
  supervivencia_academica: number | string | null;
  prioridad_critica: number | string | null;
  alerta_descenso: number | string | null;
  renovacion_garantizada: number | string | null;
  viejos: number | string | null;
  nuevos: number | string | null;
}

interface MatrizMeritoRow extends RowDataPacket {
  nombre: string | null;
  apellido: string | null;
  carrera: string | null;
  cedula: string | number | null;
  promedio_notas: number | string | null;
  vulnerabilidad_puntos: number | string | null;
}

interface RadarCarreraRow extends RowDataPacket {
  subject: string | null;
  A: number | string | null;
  fullMark: number | string | null;
}

export async function obtenerAnaliticasAvanzadas(): Promise<AnaliticasAvanzadas> {
  noStore();

  try {
    // 0. Obtener Periodo Actual
    const [periodoRes] = await db.execute<PeriodoIdRow[]>(
      `SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const pId = Number(periodoRes[0]?.id ?? 0);

    // 0.1 Obtener Periodo Anterior Estricto (para validar continuidad inmediata)
    const [prevPeriodoRes] = await db.execute<PeriodoIdRow[]>(
      `
      SELECT id
      FROM periodos_academicos
      WHERE id < ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [pId]
    );
    const prevPId = Number(prevPeriodoRes[0]?.id ?? 0);

    // 1. MONITOR DE CONTINUIDAD (Comparativa histórica periodo actual vs periodo anterior)
    const promesaDinamica = db.execute<DinamicaEmbudoRow[]>(
      `
      SELECT
        -- BARRA 1: SUPERVIVENCIA ACADÉMICA
        (SELECT COUNT(DISTINCT s1.user_id)
         FROM solicitudes s1
         WHERE s1.periodo_id = ?
           AND s1.promedio_notas >= 16
           AND EXISTS (
             SELECT 1 FROM solicitudes s_old
             WHERE s_old.user_id = s1.user_id
               AND s_old.estatus = 'Aprobada'
               AND s_old.periodo_id = ?
           )) AS supervivencia_academica,

        -- BARRA 2: PRIORIDAD CRÍTICA
        (SELECT COUNT(DISTINCT s2.user_id)
         FROM solicitudes s2
         INNER JOIN estudios_socioeconomicos e2
           ON e2.id = (
             SELECT MAX(e2_max.id)
             FROM estudios_socioeconomicos e2_max
             WHERE e2_max.student_id = s2.user_id
               AND e2_max.tipo = 'administrador'
           )
         WHERE s2.periodo_id = ?
           AND s2.promedio_notas >= 16
           AND e2.puntaje >= 60
           AND EXISTS (
             SELECT 1 FROM solicitudes s_old2
             WHERE s_old2.user_id = s2.user_id
               AND s_old2.estatus = 'Aprobada'
               AND s_old2.periodo_id = ?
           )) AS prioridad_critica,

        -- BARRA 3: ALERTA DE DESCENSO
        (SELECT COUNT(DISTINCT s_act.user_id)
         FROM solicitudes s_act
         INNER JOIN estudios_socioeconomicos e_v
           ON e_v.id = (
             SELECT MAX(ev_max.id)
             FROM estudios_socioeconomicos ev_max
             WHERE ev_max.student_id = s_act.user_id
               AND ev_max.tipo = 'administrador'
           )
         WHERE s_act.periodo_id = ?
           AND e_v.puntaje >= 60
           AND EXISTS (
             SELECT 1 FROM solicitudes s_val
             WHERE s_val.user_id = s_act.user_id
               AND s_val.estatus = 'Aprobada'
               AND s_val.periodo_id = ?
           )
           AND s_act.promedio_notas < (
             SELECT s_ant.promedio_notas
             FROM solicitudes s_ant
             WHERE s_ant.user_id = s_act.user_id
               AND s_ant.estatus = 'Aprobada'
               AND s_ant.periodo_id = ?
             LIMIT 1
           )) AS alerta_descenso,

        -- BARRA 4: RENOVACIÓN GARANTIZADA (Supervivientes aprobados hoy)
        (SELECT COUNT(DISTINCT s_ren.user_id)
         FROM solicitudes s_ren
         WHERE s_ren.periodo_id = ?
           AND s_ren.estatus IN ('Aprobada', 'Renovacion')
           AND s_ren.promedio_notas >= 16
           AND EXISTS (
             SELECT 1 FROM solicitudes s_old3
             WHERE s_old3.user_id = s_ren.user_id
               AND s_old3.estatus = 'Aprobada'
               AND s_old3.periodo_id = ?
           )) AS renovacion_garantizada,

        -- BARRA 5: BENEFICIARIOS TOTALES (Bicolor: Viejos vs Nuevos)
        (SELECT COUNT(DISTINCT s_v.user_id)
         FROM solicitudes s_v
         WHERE s_v.periodo_id = ?
           AND s_v.estatus IN ('Aprobada', 'Renovacion')
           AND EXISTS (
             SELECT 1 FROM solicitudes s_old4
             WHERE s_old4.user_id = s_v.user_id
               AND s_old4.estatus = 'Aprobada'
               AND s_old4.periodo_id = ?
           )) AS viejos,

        (SELECT COUNT(DISTINCT s_n.user_id)
         FROM solicitudes s_n
         WHERE s_n.periodo_id = ?
           AND s_n.estatus IN ('Aprobada', 'Renovacion')
           AND NOT EXISTS (
             SELECT 1 FROM solicitudes s_old5
             WHERE s_old5.user_id = s_n.user_id
               AND s_old5.estatus = 'Aprobada'
               AND s_old5.periodo_id = ?
           )) AS nuevos
      `,
      [
        pId, prevPId,
        pId, prevPId,
        pId, prevPId, prevPId,
        pId, prevPId,
        pId, prevPId,
        pId, prevPId
      ]
    );

    // 2. MATRIZ DE MÉRITO: deduplicada por última solicitud no rechazada y último estudio admin
    const promesaMatriz = db.execute<MatrizMeritoRow[]>(
      `
      SELECT
        st.nombre,
        st.apellido,
        st.carrera,
        st.cedula,
        CAST(s.promedio_notas AS DECIMAL(10,2)) AS promedio_notas,
        COALESCE(e.puntaje, 0) AS vulnerabilidad_puntos
      FROM solicitudes s
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        WHERE estatus != 'Rechazada'
        GROUP BY user_id
      ) last_s ON s.id = last_s.last_id
      INNER JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e
        ON e.id = (
          SELECT MAX(e_max.id)
          FROM estudios_socioeconomicos e_max
          WHERE e_max.student_id = st.id
            AND e_max.tipo = 'administrador'
        )
      LIMIT 1000
      `
    );

    // 3. RADAR DE CARRERAS: deduplicado con MAX(id) por user_id para evitar sesgo histórico
    const promesaRadar = db.execute<RadarCarreraRow[]>(
      `
      SELECT
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') AS subject,
        CAST(AVG(s.promedio_notas) AS DECIMAL(10,2)) AS A,
        20 AS fullMark
      FROM solicitudes s
      INNER JOIN (
        SELECT user_id, MAX(id) AS last_id
        FROM solicitudes
        GROUP BY user_id
      ) last_s ON s.id = last_s.last_id
      INNER JOIN students st ON s.user_id = st.id
      GROUP BY COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar')
      ORDER BY A DESC
      `
    );

    const [[filasMatriz], [filasRadar], [filasDinamica]] = await Promise.all([
      promesaMatriz,
      promesaRadar,
      promesaDinamica
    ]);

    const dD = filasDinamica[0];
    const cantViejos = Number(dD?.viejos) || 0;
    const cantNuevos = Number(dD?.nuevos) || 0;

    const embudo: DatosEmbudo[] = [
      { name: 'SUPERVIVENCIA ACADÉMICA', value: Number(dD?.supervivencia_academica) || 0 },
      { name: 'PRIORIDAD CRÍTICA', value: Number(dD?.prioridad_critica) || 0 },
      { name: 'ALERTA DE DESCENSO', value: Number(dD?.alerta_descenso) || 0 },
      { name: 'RENOVACIÓN GARANTIZADA', value: Number(dD?.renovacion_garantizada) || 0 },
      {
        name: 'BENEFICIARIOS TOTALES',
        value: cantViejos + cantNuevos,
        viejos: cantViejos,
        nuevos: cantNuevos
      },
    ];

    const matriz: DatosMatriz[] = filasMatriz.map((m) => ({
      nombre: String(m.nombre ?? ''),
      apellido: String(m.apellido ?? ''),
      carrera: String(m.carrera ?? ''),
      cedula: String(m.cedula ?? ''),
      promedio_notas: Number(m.promedio_notas) || 0,
      vulnerabilidad_puntos: Number(m.vulnerabilidad_puntos) || 0,
    }));

    const radar: DatosRadar[] = filasRadar.map((r) => ({
      subject: String(r.subject ?? 'Sin Asignar'),
      A: Number(r.A) || 0,
      fullMark: Number(r.fullMark) || 20,
    }));

    return {
      matriz,
      radar,
      embudo,
    };
  } catch (error) {
    console.error('❌ Error en Analytics:', error);
    return { matriz: [], radar: [], embudo: [] };
  }
}
