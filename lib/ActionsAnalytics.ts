'use server'

import { db } from './db'
import { AnaliticasAvanzadas } from '@/types/reportes'

export async function obtenerAnaliticasAvanzadas(): Promise<AnaliticasAvanzadas> {
  try {
    // 🚀 OPTIMIZACIÓN: Definimos las promesas SIN await para lanzarlas en paralelo
    
    // 1. MATRIZ (Dispersión: Promedio vs Vulnerabilidad)
    const promesaMatriz = db.execute(`
      SELECT 
        st.nombre, st.apellido, st.cedula, st.carrera, 
        CAST(s.promedio_notas AS DECIMAL(10,2)) as promedio,
        COALESCE(e.puntaje, 0) as vulnerabilidad 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      WHERE s.estatus != 'Rechazada'
      LIMIT 1000 -- Limitamos por seguridad de rendimiento en el gráfico
    `);

    // 2. RADAR (Promedio por Carrera)
    const promesaRadar = db.execute(`
      SELECT 
        COALESCE(NULLIF(TRIM(st.carrera), ''), 'Sin Asignar') as subject,
        CAST(AVG(s.promedio_notas) AS DECIMAL(10,2)) as A,
        20 as fullMark
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      GROUP BY st.carrera
      ORDER BY A DESC
    `);

    // 3. EMBUDO (KPIs de Conversión)
    // El cálculo se hace 100% en SQL para no iterar arrays en JS
    const promesaEmbudo = db.execute(`
      SELECT 
        COUNT(*) as total_solicitudes,
        SUM(CASE WHEN s.estatus IN ('En Revisión', 'Aprobada', 'Rechazada') THEN 1 ELSE 0 END) as validados,
        SUM(CASE WHEN s.promedio_notas >= 16 THEN 1 ELSE 0 END) as alto_rendimiento,
        SUM(CASE WHEN s.estatus = 'Aprobada' THEN 1 ELSE 0 END) as aprobados
      FROM solicitudes s
    `);

    // ⚡ EJECUCIÓN PARALELA: Esperamos a que las 3 terminen a la vez
    const [resMatriz, resRadar, resEmbudo] = await Promise.all([
        promesaMatriz, 
        promesaRadar, 
        promesaEmbudo
    ]);

    // Extraemos las filas de la respuesta de MariaDB [rows, fields]
    const filasMatriz: any = resMatriz[0];
    const filasRadar: any = resRadar[0];
    const filasEmbudo: any = resEmbudo[0];

    // --- FORMATEO DE DATOS (Ligero y rápido) ---

    const matrizFormat = filasMatriz.map((m: any) => ({
      nombre: m.nombre,
      apellido: m.apellido,
      cedula: m.cedula,
      carrera: m.carrera,
      promedio_notas: Number(m.promedio),
      vulnerabilidad_puntos: Number(m.vulnerabilidad)
    }));

    const radarFormat = filasRadar.map((r: any) => ({
      subject: r.subject,
      A: Number(r.A),
      fullMark: 20
    }));

    // Aseguramos que existan datos en el embudo, si no, devolvemos 0
    const datosEmbudo = filasEmbudo[0] || {};
    const embudo = [
      { name: 'Solicitadas', value: Number(datosEmbudo.total_solicitudes) || 0, fill: '#1a2744' },
      { name: 'Documentos OK', value: Number(datosEmbudo.validados) || 0, fill: '#3b82f6' }, // Azul
      { name: 'Alto Mérito', value: Number(datosEmbudo.alto_rendimiento) || 0, fill: '#f59e0b' }, // Ambar
      { name: 'Becas Aprobadas', value: Number(datosEmbudo.aprobados) || 0, fill: '#10b981' }, // Esmeralda
    ];

    return { matriz: matrizFormat, radar: radarFormat, embudo };

  } catch (error) {
    console.error("❌ Error en Analytics (DB):", error);
    // Retornamos estructura vacía para no romper el dashboard si falla la DB
    return { matriz: [], radar: [], embudo: [] };
  }
}