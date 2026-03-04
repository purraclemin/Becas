'use server'

import { db } from './db'

/**
 * Procesa la lógica de construcción de query y filtros para MariaDB.
 * Sincronizado con la lógica de Beneficiarios Totales (Viejos vs Nuevos).
 */
export async function fetchSolicitudesDesdeDB(filtros: any = {}) {
  try {
    // 0. Obtener Periodo Actual y Anterior Estricto
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

    // --- FILTROS DINÁMICOS ESTÁNDAR ---
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

    // --- LÓGICA QUIRÚRGICA DEL EMBUDO ---

    // 1. SUPERVIVENCIA: Periodo anterior aprobado + Promedio actual >= 16
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

    // 2. PRIORIDAD CRÍTICA: Vulnerabilidad actual >= 60
    if (filtros.vulnerabilidadMin) {
      whereClause += ` AND e.puntaje >= ?`;
      params.push(Number(filtros.vulnerabilidadMin));
    }

    // 3. ALERTA DE DESCENSO: Comparación con promedio anterior aprobado
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

    // 4. BENEFICIARIOS TOTALES (Barra 5): Continuidad y Nuevos Aprobados
    if (filtros.scope === 'total_beneficiarios') {
      whereClause += ` AND s.periodo_id = ${pId} AND s.estatus = 'Aprobada' AND (
        -- Caso A: Estudiantes con periodo anterior aprobado
        EXISTS (
          SELECT 1 FROM solicitudes s_old 
          WHERE s_old.user_id = s.user_id 
          AND s_old.estatus = 'Aprobada' 
          AND s_old.periodo_id = ${prevPId}
        )
        OR 
        -- Caso B: Estudiantes sin registro en el periodo anterior (Nuevos)
        NOT EXISTS (
          SELECT 1 FROM solicitudes s_none
          WHERE s_none.user_id = s.user_id 
          AND s_none.periodo_id = ${prevPId}
        )
      )`;
    }

    // --- FILTROS DE INTERFAZ ORIGINALES ---
    if (filtros.estadoEstudio) {
      switch (filtros.estadoEstudio) {
        case "Hecho": whereClause += ` AND e.id IS NOT NULL`; break;
        case "Pendiente": whereClause += ` AND e.id IS NULL`; break;
      }
    }

    if (filtros.filtroPromedio && !filtros.promedioMin) {
      if (filtros.filtroPromedio === "19-20") whereClause += ` AND s.promedio_notas >= 19`;
      else if (filtros.filtroPromedio === "16-18") whereClause += ` AND s.promedio_notas BETWEEN 16 AND 18.99`;
      else if (filtros.filtroPromedio === "10-15") whereClause += ` AND s.promedio_notas BETWEEN 10 AND 15.99`;
    }

    // --- CONTEO PARA PAGINACIÓN ---
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador'
      ${whereClause}
    `;
    const [countRows]: any = await db.execute(countQuery, params);
    const totalRegistros = countRows[0]?.total || 0;

    // --- CONSULTA DE DATOS ---
    let query = `
      SELECT 
        s.id, s.user_id, s.tipo_beca, s.estatus, s.promedio_notas, s.fecha_registro, 
        s.motivo_solicitud, s.foto_carnet, s.copia_cedula, s.planilla_inscripcion,
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
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador'
      ${whereClause}
    `;

    query += ` ORDER BY s.fecha_registro DESC`;

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