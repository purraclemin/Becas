'use server'

import { db } from './db'

export async function obtenerTodasLasSolicitudes(filtros: any = {}) {
  try {
    // 1. INICIALIZAMOS LA CLÁUSULA WHERE
    // "WHERE 1=1" es un truco SQL para poder concatenar "AND ..." sin preocuparnos por si es el primer filtro
    let whereClause = ` WHERE 1=1`;
    const params: any[] = [];

    // --- APLICACIÓN DE FILTROS DINÁMICOS ---

    // 1. Búsqueda por Texto (Nombre, Apellido, Cédula)
    if (filtros.search) {
      whereClause += ` AND (st.nombre LIKE ? OR st.apellido LIKE ? OR st.cedula LIKE ?)`;
      const term = `%${filtros.search}%`;
      params.push(term, term, term);
    }

    // 2. Filtro de Estatus (Pendiente, Aprobada, etc.)
    if (filtros.status && filtros.status !== "Todas") {
      whereClause += ` AND s.estatus = ?`;
      params.push(filtros.status);
    }

    // 3. Filtro de Carrera
    if (filtros.carrera) {
      whereClause += ` AND TRIM(st.carrera) = ?`;
      params.push(filtros.carrera);
    }

    // 4. Filtro de Tipo de Beca
    if (filtros.tipoBeca) {
      whereClause += ` AND TRIM(s.tipo_beca) = ?`;
      params.push(filtros.tipoBeca);
    }

    // 5. Filtro de Fecha Específica
    if (filtros.fecha) {
      whereClause += ` AND DATE(s.fecha_registro) = ?`;
      params.push(filtros.fecha);
    }

    // 6. Filtro de Estado del Estudio Socioeconómico
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

    // 7. Filtro de Vulnerabilidad (Puntaje)
    if (filtros.vulnerabilidad) {
      if (filtros.vulnerabilidad === "Alto") {
        whereClause += ` AND e.puntaje >= 60`;
      } else if (filtros.vulnerabilidad === "Medio") {
        whereClause += ` AND e.puntaje BETWEEN 30 AND 59`;
      } else if (filtros.vulnerabilidad === "Bajo") {
        whereClause += ` AND e.puntaje < 30`;
      }
    }

    // 8. Filtro de Rango de Promedio
    if (filtros.filtroPromedio) {
      if (filtros.filtroPromedio === "19-20") {
        whereClause += ` AND s.promedio_notas >= 19`;
      } else if (filtros.filtroPromedio === "16-18") {
        whereClause += ` AND s.promedio_notas BETWEEN 16 AND 18.99`;
      } else if (filtros.filtroPromedio === "10-15") {
        whereClause += ` AND s.promedio_notas BETWEEN 10 AND 15.99`;
      }
    }

    // 9. Ranking Élite (Promedio Alto + Vulnerabilidad Alta)
    if (filtros.rankingElite) {
      whereClause += ` AND s.promedio_notas >= 16.5 AND e.puntaje >= 40`;
    }

    // --- PASO A: CONTAR TOTAL DE REGISTROS (Para la Paginación) ---
    // Usamos EXACTAMENTE los mismos filtros para contar cuántos resultados reales hay
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      ${whereClause}
    `;
    
    // Ejecutamos el conteo con los mismos parámetros
    const [countRows]: any = await db.execute(countQuery, params);
    const totalRegistros = countRows[0].total;

    // --- PASO B: CONSTRUIR LA CONSULTA DE DATOS ---
    let query = `
      SELECT 
        s.id, s.tipo_beca, s.estatus, s.promedio_notas, s.fecha_registro, 
        s.motivo_solicitud, s.foto_carnet, s.copia_cedula, s.planilla_inscripcion,
        st.nombre, st.apellido, st.cedula, st.carrera, st.telefono,
        e.puntaje, e.nivel_riesgo, e.respuestas_json
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      ${whereClause}
    `;

    // --- LÓGICA DE ORDENAMIENTO (ORDER BY) ---
    // Definimos el orden basado en qué filtro está activo para mostrar lo más relevante primero
    if (filtros.rankingElite) {
      query += ` ORDER BY s.promedio_notas DESC, e.puntaje DESC`;
    } 
    else if (filtros.vulnerabilidad) {
      query += ` ORDER BY e.puntaje DESC`;
    }
    else if (filtros.filtroPromedio) {
      query += ` ORDER BY s.promedio_notas DESC`;
    }
    else if (filtros.ordenPromedio) {
       // Ordenamiento manual si el usuario hizo clic en la cabecera de la tabla
       const orden = filtros.ordenPromedio === "ASC" ? "ASC" : "DESC";
       query += ` ORDER BY s.promedio_notas ${orden}`;
    }
    else {
      // Por defecto: Los más recientes primero
      query += ` ORDER BY s.fecha_registro DESC`;
    }

    // --- LÓGICA DE PAGINACIÓN (LIMIT & OFFSET) ---
    // Calculamos qué página mostrar
    const page = Number(filtros.page) || 1;
    const limit = Number(filtros.limit) || 7;
    const offset = (page - 1) * limit;

    // Agregamos el límite a la consulta SQL (IMPORTANTE: Se inyecta directamente porque son números seguros)
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // --- EJECUCIÓN FINAL ---
    const [rows]: any = await db.execute(query, params);

    // Formateamos los datos para el Frontend
    const dataFormatted = rows.map((row: any) => ({
        ...row,
        // Formateamos la fecha para que se vea bonita en la tabla
        fecha: row.fecha_registro 
          ? new Date(row.fecha_registro).toLocaleDateString('es-VE', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            }) 
          : "Sin Fecha",
        // Calculamos un campo extra útil para el frontend
        estatus_estudio: row.puntaje !== null ? 'Hecho' : 'Pendiente'
    }));

    return {
      data: dataFormatted,
      totalPaginas: Math.ceil(totalRegistros / limit), // Calculamos cuántas páginas hay en total
      totalRegistros: totalRegistros
    };

  } catch (error) {
    console.error("❌ Error en obtenerTodasLasSolicitudes:", error);
    return { data: [], totalPaginas: 0, totalRegistros: 0 };
  }
}