'use server'

import { db } from './db'
import { RowDataPacket } from 'mysql2/promise'
import { aplicarFiltroEstudioAdmin } from '@/app/admin/validarBeca/lib/ValidarEstudioHecho'

interface FiltrosDB {
  search?: string;
  status?: string;
  municipio?: string;
  carrera?: string;
  trimestre?: string;
  tipoBeca?: string;
  vulnerabilidad?: string;
  es_renovacion?: string;
  vulnerabilidadMin?: string;
  tendencia?: string;
  scope?: string;
  estadoEstudio?: string;
  filtroPromedio?: string;
  promedioMin?: string;
  rankingElite?: boolean | string; 
  page?: number | string;
  limit?: number | string;
}

export async function fetchSolicitudesDesdeDB(filtros: FiltrosDB = {}) {
  try {
    const [periodoRes]: any = await db.execute(`SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`);
    const pId = periodoRes?.[0]?.id || 0;

    const [prevPeriodoRes]: any = await db.execute(`
      SELECT id FROM periodos_academicos 
      WHERE id < ? 
      ORDER BY id DESC LIMIT 1
    `, [pId]);
    const prevPId = prevPeriodoRes?.[0]?.id || 0;

    let whereClause = ` WHERE 1=1`;
    const params: any[] = [];

    // --- FILTROS ESTÁNDAR Y DEL EMBUDO (Intactos) ---
    if (filtros.search) {
      whereClause += ` AND (st.nombre LIKE ? OR st.apellido LIKE ? OR st.cedula LIKE ?)`;
      const term = `%${filtros.search}%`;
      params.push(term, term, term);
    }

    if (filtros.status && filtros.status !== "Todas") {
      whereClause += ` AND s.estatus = ?`;
      params.push(filtros.status);
    }

    if (filtros.municipio) {
      whereClause += ` AND st.municipio_residencia = ?`;
      params.push(filtros.municipio);
    }

    if (filtros.carrera) {
      whereClause += ` AND TRIM(st.carrera) = ?`;
      params.push(filtros.carrera);
    }

    if (filtros.trimestre) {
      whereClause += ` AND st.semestre = ?`;
      params.push(filtros.trimestre);
    }

    if (filtros.tipoBeca) {
      whereClause += ` AND TRIM(s.tipo_beca) = ?`;
      params.push(filtros.tipoBeca);
    }

    if (filtros.es_renovacion === 'true' || filtros.vulnerabilidadMin || filtros.tendencia === 'descenso') {
       whereClause += ` AND s.periodo_id = ${pId} AND EXISTS (
        SELECT 1 FROM solicitudes s_old 
        WHERE s_old.user_id = s.user_id 
        AND s_old.estatus = 'Aprobada' 
        AND s_old.periodo_id = ${prevPId}
      )`;
      
      if (filtros.tendencia !== 'descenso') {
        whereClause += ` AND s.promedio_notas >= 16`;
      }
    }

    if (filtros.vulnerabilidad) {
      const riesgo = filtros.vulnerabilidad.toLowerCase();
      if (riesgo === 'critico') whereClause += ` AND e.puntaje >= 70`;
      else if (riesgo === 'alto') whereClause += ` AND e.puntaje BETWEEN 50 AND 69`;
      else if (riesgo === 'medio') whereClause += ` AND e.puntaje BETWEEN 25 AND 49`;
      else if (riesgo === 'bajo') whereClause += ` AND e.puntaje BETWEEN 0 AND 24`;
    }

    if (filtros.vulnerabilidadMin && !filtros.vulnerabilidad) {
      whereClause += ` AND e.puntaje >= ?`;
      params.push(Number(filtros.vulnerabilidadMin));
    }

    if (filtros.tendencia === 'descenso') {
      whereClause += ` AND e.puntaje >= 60 AND s.promedio_notas < (
        SELECT s_ant.promedio_notas 
        FROM solicitudes s_ant 
        WHERE s_ant.user_id = s.user_id 
        AND s_ant.estatus = 'Aprobada'
        AND s_ant.periodo_id = ${prevPId}
        LIMIT 1
      )`;
    }

    if (filtros.scope === 'total_beneficiarios') {
      whereClause += ` AND s.periodo_id = ${pId} AND s.estatus = 'Aprobada' AND (
        EXISTS (
          SELECT 1 FROM solicitudes s_old 
          WHERE s_old.user_id = s.user_id 
          AND s_old.estatus = 'Aprobada' 
          AND s_old.periodo_id = ${prevPId}
        )
        OR 
        NOT EXISTS (
          SELECT 1 FROM solicitudes s_none
          WHERE s_none.user_id = s.user_id 
          AND s_none.periodo_id = ${prevPId}
        )
      )`;
    }

    // --- APLICACIÓN DEL MÓDULO DE ESTUDIO (HECHO / PENDIENTE) ---
    const filtroEstudio = aplicarFiltroEstudioAdmin(filtros.estadoEstudio, pId);
    if (filtroEstudio.condition) {
      whereClause += filtroEstudio.condition;
      params.push(...filtroEstudio.param);
    }

    if (filtros.filtroPromedio && !filtros.promedioMin) {
      if (filtros.filtroPromedio === "19-20") whereClause += ` AND s.promedio_notas >= 19`;
      else if (filtros.filtroPromedio === "16-18") whereClause += ` AND s.promedio_notas BETWEEN 16 AND 18.99`;
      else if (filtros.filtroPromedio === "10-15") whereClause += ` AND s.promedio_notas BETWEEN 10 AND 15.99`;
    }

    // --- CONTEO Y CONSULTA PRINCIPAL ---
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador' AND e.periodo_id = ${pId}
      ${whereClause}
    `;
    const [countRows]: any = await db.execute(countQuery, params);
    const totalRegistros = countRows[0]?.total || 0;

    let query = `
      SELECT 
        s.id, s.user_id, s.tipo_beca, s.estatus, s.promedio_notas, s.fecha_registro, 
        s.motivo_solicitud, s.foto_carnet, s.copia_cedula, s.planilla_inscripcion,
        s.constancia_residencia, s.declaracion_manutencion, s.informe_medico, 
        s.partida_nacimiento, s.constancia_club, s.constancia_notas, 
        s.notas_certificadas, s.carnet_discapacidad, s.documentos_filiacion,
        s.email_institucional, s.periodo_id,
        st.nombre, st.apellido, st.cedula, st.carrera, st.telefono,
        st.semestre, st.municipio_residencia,
        e.puntaje, e.nivel_riesgo, e.monto_ingreso_familiar,
        (
          SELECT ROUND(AVG(promedio_notas), 2) 
          FROM solicitudes 
          WHERE user_id = st.id
        ) as promedio_historico
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador' AND e.periodo_id = ${pId}
      ${whereClause}
    `;

    // 🟢 ORDENAMIENTO INTELIGENTE BASADO EN JERARQUÍA INSTITUCIONAL DE UNIMAR
    query += ` ORDER BY 
      CASE 
        WHEN s.estatus = 'Renovacion' OR s.estatus = 'Renovación' THEN 1
        WHEN s.estatus = 'Pendiente' THEN 2
        WHEN s.estatus = 'En Revisión' OR s.estatus = 'En revision' THEN 3
        WHEN s.estatus = 'Revisión Especial' OR s.estatus = 'Revision especial' THEN 4
        WHEN s.estatus = 'Aprobada' OR s.estatus = 'Aprobado' THEN 5
        WHEN s.estatus = 'Rechazada' THEN 6
        ELSE 7 
      END ASC, 
      s.promedio_notas DESC, 
      s.id DESC`;

    const page = Math.max(1, Number(filtros.page) || 1);
    const limit = Math.max(1, Number(filtros.limit) || 7);
    const offset = (page - 1) * limit;
    
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows]: any = await db.execute(query, params);

    return { rows, totalRegistros, limit };

  } catch (error) {
    console.error("❌ Error en fetchSolicitudesDesdeDB:", error);
    throw error;
  }
}