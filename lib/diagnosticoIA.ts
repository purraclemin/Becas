'use server'

import { db } from './db'
import { getSession } from './ActionsSession'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { GoogleGenAI } from '@google/genai';

// Inicializar el cliente de Google Gen AI usando la variable de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Acción dedicada para invocar la API real de Gemini y generar el diagnóstico ejecutivo
 */
export async function generarAnalisisIaEstudio(studentId: number) {
  const session = await getSession();
  if (!session || !session.id) throw new Error("Sesión no válida.");

  const periodoIdActual = await obtenerOCrearPeriodoObjetivo();
  const connection = await db.getConnection();

  try {
    // 1. Extraer datos del estudio socioeconómico
    const [rows]: any = await connection.execute(
      `SELECT * FROM estudios_socioeconomicos WHERE student_id = ? AND periodo_id = ? ORDER BY (tipo = 'administrador') DESC LIMIT 1`,
      [studentId, periodoIdActual]
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: "No se encontró un estudio socioeconómico registrado para analizar." };
    }

    const estudio = rows[0];

    // 2. Extraer datos personales del estudiante directamente de la tabla `students`
    const [rowsStudent]: any = await connection.execute(
      `SELECT nombre, apellido, cedula, carrera FROM students WHERE id = ? LIMIT 1`,
      [studentId]
    );

    const estudiante = rowsStudent?.[0] || { nombre: "Estudiante", apellido: "", cedula: "N/A", carrera: "N/A" };

    // 3. Extraer el motivo de la solicitud de la tabla `solicitudes`
    const [rowsSolicitud]: any = await connection.execute(
      `SELECT motivo_solicitud FROM solicitudes WHERE user_id = ? AND periodo_id = ? LIMIT 1`,
      [studentId, periodoIdActual]
    );

    const motivoSolicitud = rowsSolicitud?.[0]?.motivo_solicitud || "No se especificó un motivo textual.";

    // 4. Consolidar el paquete de contexto estructurado con base en las tablas reales
    const contextoAnalitico = `
      - Estudiante: ${estudiante.nombre} ${estudiante.apellido} (C.I: V-${estudiante.cedula})
      - Carrera: ${estudiante.carrera}
      - Puntaje Total de Vulnerabilidad (Baremo): ${estudio.puntaje} puntos
      - Nivel de Riesgo: ${estudio.nivel_riesgo}
      - Ingresos Familiares Mensuales: $${estudio.monto_ingreso_familiar}
      - Egresos en Mercado: $${estudio.monto_egreso_mercado}
      - Egresos en Vivienda: $${estudio.monto_egreso_vivienda}
      - Tipo y Estatus de Vivienda: ${estudio.vivienda_tipo} (${estudio.vivienda_estatus})
      - Carga Familiar / Hermanos Universitarios: ${estudio.familia_num_hermanos} hermanos (${estudio.familia_hermanos_uni} en la universidad)
      - Condición de Salud Especial: ${estudio.salud_condicion_especial}
      - Motivo de la Solicitud Declarado por el Estudiante: "${motivoSolicitud}"
    `;

    // 5. Prompt institucional de la IA para el comité de becas
    const promptSistema = `
      Actúa como un analista socioeconómico y trabajador social universitario experto en la gestión de becas de la Universidad de Margarita (UNIMAR).
      Tu tarea es redactar un informe o diagnóstico ejecutivo institucional formal, sobrio y profesional dirigido al comité de becas evaluando al estudiante.
      
      REGLAS DE FORMATO OBLIGATORIAS:
      1. NO utilices asteriscos, negritas (**, *) ni guiones (-). Devuelve estrictamente texto plano.
      2. Evita redundancias o repetir el nombre completo del estudiante de forma innecesaria en el texto si ya se nombra en la introducción.
      3. Escribe EXACTAMENTE dos párrafos separados por un salto de línea doble (un espacio en blanco entre ellos). Cada párrafo no debe superar las 5 líneas de extensión.
      4. Analiza la correlación entre las métricas cuantitativas del baremo socioeconómico y el motivo de postulación expresado por el alumno. Evita saludos informales.

      Datos del caso:
      ${contextoAnalitico}
    `;

    // Actualizado al modelo actual recomendado
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptSistema,
    });

    const analisisGenerado = response.text || "No se pudo generar el diagnóstico ejecutivo en este momento.";

    return { 
      success: true, 
      analisis: analisisGenerado 
    };

  } catch (error: any) {
    console.error("❌ Error al invocar la API de Gemini:", error);
    return { success: false, error: error.message || "Error al procesar la inteligencia artificial." };
  } finally {
    if (connection) connection.release();
  }
}