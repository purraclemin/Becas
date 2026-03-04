'use server'

import { db } from './db'
import { AnaliticasAvanzadas } from '../types/analitica'

export async function obtenerAnaliticasAvanzadas(): Promise<AnaliticasAvanzadas> {
  try {
    // 0. Obtener Periodo Actual
    const [periodoRes]: any = await db.execute(`SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`);
    const pId = periodoRes?.[0]?.id || 0;

    // 0.1 Obtener Periodo Anterior Estricto (para validar continuidad inmediata)
    const [prevPeriodoRes]: any = await db.execute(`
      SELECT id FROM periodos_academicos 
      WHERE id < ? 
      ORDER BY id DESC LIMIT 1
    `, [pId]);
    const prevPId = prevPeriodoRes?.[0]?.id || 0;

    // 🚀 DINÁMICA DE EMBUDO (Lógica Quirúrgica)
    const promesaDinamica = db.execute(`
      SELECT 
        -- BARRA 1: SUPERVIVENCIA ACADÉMICA
        (SELECT COUNT(DISTINCT s1.user_id) 
         FROM solicitudes s1 
         WHERE s1.periodo_id = ${pId}
         AND s1.promedio_notas >= 16 
         AND EXISTS (
            SELECT 1 FROM solicitudes s_old 
            WHERE s_old.user_id = s1.user_id AND s_old.estatus = 'Aprobada' AND s_old.periodo_id = ${prevPId}
         )) as supervivencia_academica,

        -- BARRA 2: PRIORIDAD CRÍTICA
        (SELECT COUNT(DISTINCT s2.user_id) 
         FROM solicitudes s2
         JOIN estudios_socioeconomicos e2 ON s2.user_id = e2.student_id AND e2.tipo = 'administrador'
         WHERE s2.periodo_id = ${pId}
         AND s2.promedio_notas >= 16 AND e2.puntaje >= 60
         AND EXISTS (
            SELECT 1 FROM solicitudes s_old2 
            WHERE s_old2.user_id = s2.user_id AND s_old2.estatus = 'Aprobada' AND s_old2.periodo_id = ${prevPId}
         )) as prioridad_critica,

        -- BARRA 3: ALERTA DE DESCENSO
        (SELECT COUNT(DISTINCT s_act.user_id)
         FROM solicitudes s_act
         JOIN estudios_socioeconomicos e_v ON s_act.user_id = e_v.student_id AND e_v.tipo = 'administrador'
         WHERE s_act.periodo_id = ${pId}
         AND e_v.puntaje >= 60 
         AND EXISTS (
            SELECT 1 FROM solicitudes s_val 
            WHERE s_val.user_id = s_act.user_id AND s_val.estatus = 'Aprobada' AND s_val.periodo_id = ${prevPId}
         )
         AND s_act.promedio_notas < (
            SELECT s_ant.promedio_notas FROM solicitudes s_ant 
            WHERE s_ant.user_id = s_act.user_id AND s_ant.estatus = 'Aprobada' AND s_ant.periodo_id = ${prevPId}
            LIMIT 1
         )) as alerta_descenso,

        -- BARRA 4: RENOVACIÓN GARANTIZADA (Supervivientes aprobados hoy)
        (SELECT COUNT(DISTINCT s_ren.user_id)
         FROM solicitudes s_ren
         WHERE s_ren.periodo_id = ${pId}
         AND s_ren.estatus IN ('Aprobada', 'Renovacion')
         AND s_ren.promedio_notas >= 16
         AND EXISTS (
            SELECT 1 FROM solicitudes s_old3 
            WHERE s_old3.user_id = s_ren.user_id AND s_old3.estatus = 'Aprobada' AND s_old3.periodo_id = ${prevPId}
         )
        ) as renovacion_garantizada,

        -- BARRA 5: BENEFICIARIOS TOTALES (Bicolor: Viejos vs Nuevos)
        (SELECT COUNT(DISTINCT s_v.user_id)
         FROM solicitudes s_v
         WHERE s_v.periodo_id = ${pId}
         AND s_v.estatus IN ('Aprobada', 'Renovacion')
         AND EXISTS (
            SELECT 1 FROM solicitudes s_old4 
            WHERE s_old4.user_id = s_v.user_id AND s_old4.estatus = 'Aprobada' AND s_old4.periodo_id = ${prevPId}
         )) as viejos,
         
        (SELECT COUNT(DISTINCT s_n.user_id)
         FROM solicitudes s_n
         WHERE s_n.periodo_id = ${pId}
         AND s_n.estatus IN ('Aprobada', 'Renovacion')
         AND NOT EXISTS (
            SELECT 1 FROM solicitudes s_old5 
            WHERE s_old5.user_id = s_n.user_id AND s_old5.estatus = 'Aprobada' AND s_old5.periodo_id = ${prevPId}
         )) as nuevos
    `);

    // 🎯 MATRIZ DE MÉRITO: Lógica para evitar duplicados y obtener cédula para filtrado
    const promesaMatriz = db.execute(`
      SELECT 
        st.nombre, 
        st.apellido, 
        st.carrera, 
        st.cedula,
        CAST(s.promedio_notas AS DECIMAL(10,2)) as promedio_notas, 
        COALESCE(e.puntaje, 0) as vulnerabilidad_puntos 
      FROM solicitudes s 
      JOIN (
          SELECT user_id, MAX(id) as last_id 
          FROM solicitudes 
          WHERE estatus != 'Rechazada'
          GROUP BY user_id
      ) last_s ON s.id = last_s.last_id
      JOIN students st ON s.user_id = st.id 
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador'
      LIMIT 1000
    `);

    const promesaRadar = db.execute(`SELECT COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') as subject, CAST(AVG(s.promedio_notas) AS DECIMAL(10,2)) as A, 20 as fullMark FROM solicitudes s JOIN students st ON s.user_id = st.id GROUP BY st.carrera ORDER BY A DESC`);

    const [resMatriz, resRadar, resDinamica]: any[] = await Promise.all([
        promesaMatriz, 
        promesaRadar, 
        promesaDinamica
    ]);

    const filasMatriz = resMatriz[0];
    const filasRadar = resRadar[0];
    const dD = resDinamica[0][0] || {};

    const dinamicaFormat = [
      { name: 'SUPERVIVENCIA ACADÉMICA', value: Number(dD.supervivencia_academica) || 0 },
      { name: 'PRIORIDAD CRÍTICA', value: Number(dD.prioridad_critica) || 0 },
      { name: 'ALERTA DE DESCENSO', value: Number(dD.alerta_descenso) || 0 },
      { name: 'RENOVACIÓN GARANTIZADA', value: Number(dD.renovacion_garantizada) || 0 },
      { 
        name: 'BENEFICIARIOS TOTALES', 
        value: (Number(dD.viejos) || 0) + (Number(dD.nuevos) || 0),
        viejos: Number(dD.viejos) || 0,
        nuevos: Number(dD.nuevos) || 0 
      },
    ];

    return { 
      matriz: filasMatriz.map((m: any) => ({ ...m, promedio_notas: Number(m.promedio_notas), vulnerabilidad_puntos: Number(m.vulnerabilidad_puntos) })),
      radar: filasRadar.map((r: any) => ({ ...r, A: Number(r.A) })),
      embudo: dinamicaFormat 
    };

  } catch (error) {
    console.error("❌ Error en Analytics:", error);
    return { matriz: [], radar: [], embudo: [] };
  }
}