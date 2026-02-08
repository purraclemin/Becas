'use server'

import { db } from './db'

export async function obtenerTodasLasSolicitudes(filtros?: any) {
  try {
    // 1. CONSTRUIMOS EL WHERE DINÁMICO
    // Lo separamos para poder usarlo tanto en el CONTEO como en la BÚSQUEDA final
    let whereClause = ` WHERE 1=1`;
    const params: any[] = [];

    if (filtros) {
      // 1. Filtro de Búsqueda (Texto)
      if (filtros.search) {
        whereClause += ` AND (st.nombre LIKE ? OR st.apellido LIKE ? OR st.cedula LIKE ?)`;
        const term = `%${filtros.search}%`;
        params.push(term, term, term);
      }

      // 2. Filtro de Estatus de Solicitud
      if (filtros.status && filtros.status !== "Todas") {
        whereClause += ` AND s.estatus = ?`;
        params.push(filtros.status);
      }

      // 3. Filtro de Carrera (Optimizado con TRIM para precisión)
      if (filtros.carrera) {
        whereClause += ` AND TRIM(st.carrera) = ?`;
        params.push(filtros.carrera);
      }

      // --- 🟢 FILTRO DE TIPO DE BECA (Optimizado con TRIM para precisión) ---
      if (filtros.tipoBeca) {
        whereClause += ` AND TRIM(s.tipo_beca) = ?`;
        params.push(filtros.tipoBeca);
      }
      // -------------------------------------------------------

      // 4. Filtro de Fecha
      if (filtros.fecha) {
        whereClause += ` AND DATE(s.fecha_registro) = ?`;
        params.push(filtros.fecha);
      }

      // 5. Filtros de Estado de Estudio
      if (filtros.estadoEstudio) {
        switch (filtros.estadoEstudio) {
          case "Hecho-Pendiente": 
            whereClause += ` AND e.id IS NOT NULL AND s.estatus = 'Pendiente'`; 
            break;
          case "Hecho-Revision": 
            whereClause += ` AND e.id IS NOT NULL AND s.estatus = 'En Revisión'`; 
            break;
          case "Sin-Pendiente": 
            whereClause += ` AND e.id IS NULL AND s.estatus = 'Pendiente'`; 
            break;
          case "Hecho": 
            whereClause += ` AND e.id IS NOT NULL`; 
            break;
          case "Pendiente": 
            whereClause += ` AND e.id IS NULL`; 
            break;
        }
      }

      // 6. FILTRO DE VULNERABILIDAD
      if (filtros.vulnerabilidad) {
        if (filtros.vulnerabilidad === "Alto") {
          whereClause += ` AND e.puntaje >= 60`;
        } else if (filtros.vulnerabilidad === "Medio") {
          whereClause += ` AND e.puntaje BETWEEN 30 AND 59`;
        } else if (filtros.vulnerabilidad === "Bajo") {
          whereClause += ` AND e.puntaje < 30`;
        }
      }

      // 7. Ordenamiento y Ranking Élite (Filtro en el WHERE)
      if (filtros.rankingElite) {
        whereClause += ` AND s.promedio_notas >= 16.5 AND e.puntaje >= 40`;
      } 
    }

    // --- PASO A: CONSULTA DE CONTEO (Total de páginas) ---
    // Usamos el mismo whereClause y params para contar cuántos registros existen en total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      ${whereClause}
    `;
    const [countRows]: any = await db.execute(countQuery, params);
    const totalRegistros = countRows[0].total;


    // --- PASO B: CONSULTA DE DATOS (Paginada) ---
    let query = `
      SELECT 
        -- Datos de la Solicitud
        s.id, 
        s.tipo_beca, 
        s.estatus, 
        s.promedio_notas, 
        s.fecha_registro, 
        s.motivo_solicitud,
        s.foto_carnet, 
        s.copia_cedula, 
        s.planilla_inscripcion,
        
        -- Datos del Estudiante (Tabla students)
        st.nombre, 
        st.apellido, 
        st.cedula, 
        st.carrera, 
        st.telefono,
        
        -- Datos del Estudio (Tabla estudios_socioeconomicos)
        e.puntaje, 
        e.nivel_riesgo, 
        e.respuestas_json
        
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      ${whereClause}
    `;

    // 8. LÓGICA DE ORDENAMIENTO (ORDER BY)
    if (filtros && filtros.rankingElite) {
      query += ` ORDER BY s.promedio_notas DESC, e.puntaje DESC`;
    } 
    // --- 🟢 ORDEN POR PROMEDIO ---
    else if (filtros && filtros.ordenPromedio) {
      const orden = filtros.ordenPromedio === "ASC" ? "ASC" : "DESC";
      query += ` ORDER BY s.promedio_notas ${orden}`;
    } 
    // ------------------------------------
    else {
      query += ` ORDER BY s.fecha_registro DESC`;
    }

    // 9. LÓGICA DE PAGINACIÓN (LIMIT Y OFFSET)
    // Esto es lo que hace que los botones "Siguiente" funcionen de verdad
    const page = Number(filtros?.page) || 1;
    const limit = Number(filtros?.limit) || 7;
    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Ejecutamos la consulta final
    const [rows]: any = await db.execute(query, params);
    
    // Retornamos el objeto estructurado con los datos formateados y el total de páginas
    return {
      data: rows.map((row: any) => ({
        ...row,
        fecha: row.fecha_registro 
          ? new Date(row.fecha_registro).toLocaleDateString('es-VE', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            }) 
          : "Sin Fecha",
        estatus_estudio: row.puntaje !== null ? 'Hecho' : 'Pendiente'
      })),
      totalPaginas: Math.ceil(totalRegistros / limit),
      totalRegistros: totalRegistros
    };

  } catch (error) {
    console.error("❌ Error en servidor:", error);
    // Retornamos estructura vacía segura en caso de error
    return { data: [], totalPaginas: 0, totalRegistros: 0 } as any; 
  }
}