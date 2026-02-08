'use server'

import { db } from './db'
import { AnaliticasAvanzadas } from '@/types/reportes'

export async function obtenerAnaliticasAvanzadas(): Promise<AnaliticasAvanzadas> {
  try {
    // 1. MATRIZ
    const [matriz]: any = await db.execute(`
      SELECT 
        st.nombre, st.apellido, st.cedula, st.carrera, 
        CAST(s.promedio_notas AS DECIMAL(10,2)) as promedio,
        COALESCE(e.puntaje, 0) as vulnerabilidad 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id
      WHERE s.estatus != 'Rechazada'
    `);

    // 2. RADAR (Agregamos COALESCE para evitar nulos)
    const [radar]: any = await db.execute(`
      SELECT 
        COALESCE(st.carrera, 'Sin Asignar') as subject,
        CAST(AVG(s.promedio_notas) AS DECIMAL(10,2)) as A,
        20 as fullMark
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      GROUP BY st.carrera
    `);

    // 3. EMBUDO
    const [embudoRaw]: any = await db.execute(`
      SELECT 
        COUNT(*) as total_solicitudes,
        SUM(CASE WHEN s.estatus IN ('En Revisión', 'Aprobada', 'Rechazada') THEN 1 ELSE 0 END) as validados,
        SUM(CASE WHEN s.promedio_notas >= 16 THEN 1 ELSE 0 END) as alto_rendimiento,
        SUM(CASE WHEN s.estatus = 'Aprobada' THEN 1 ELSE 0 END) as aprobados
      FROM solicitudes s
    `);

    const matrizFormat = matriz.map((m: any) => ({
      nombre: m.nombre,
      apellido: m.apellido,
      cedula: m.cedula,
      carrera: m.carrera,
      promedio_notas: Number(m.promedio),
      vulnerabilidad_puntos: Number(m.vulnerabilidad)
    }));

    const radarFormat = radar.map((r: any) => ({
      subject: r.subject, // Aseguramos que el nombre del campo sea 'subject'
      A: Number(r.A),
      fullMark: 20
    }));

    const embudo = [
      { name: 'Solicitadas', value: Number(embudoRaw[0].total_solicitudes) || 0, fill: '#1a2744' },
      { name: 'Documentos OK', value: Number(embudoRaw[0].validados) || 0, fill: '#3b82f6' },
      { name: 'Alto Mérito', value: Number(embudoRaw[0].alto_rendimiento) || 0, fill: '#f59e0b' },
      { name: 'Becas Aprobadas', value: Number(embudoRaw[0].aprobados) || 0, fill: '#10b981' },
    ];

    return { matriz: matrizFormat, radar: radarFormat, embudo };

  } catch (error) {
    console.error("Error Analytics:", error);
    return { matriz: [], radar: [], embudo: [] };
  }
}