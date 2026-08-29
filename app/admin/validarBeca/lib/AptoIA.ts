'use server'

import { db } from '@/lib/db' 
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// 🟢 Interfaz estricta actualizada con el estatus de la solicitud (Cero any)
interface CandidatoBase {
  id: number | string;
  cedula: string;
  nombre: string;
  apellido?: string;
  carrera: string;
  promedio: number;
  puntajeVulnerabilidad: number;
  municipio: string;
  motivoSolicitud: string;
  estatus: string; // 👈 Añadido para mostrar el estatus en letra en la UI
}

interface EstudianteAnalisisIA extends CandidatoBase {
  analisisIA: string;
}

export async function generarRankingAptoIA(): Promise<{ success: boolean; data: EstudianteAnalisisIA[]; error?: string }> {
  try {
    const [periodoRes]: any = await db.execute(`SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`);
    const pId = periodoRes?.[0]?.id || 0;

    let query = `
      SELECT 
        s.id, s.user_id, s.tipo_beca, s.estatus, s.promedio_notas, s.motivo_solicitud,
        st.nombre, st.apellido, st.cedula, st.carrera, st.municipio_residencia,
        e.puntaje, e.nivel_riesgo
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador' AND e.periodo_id = ?
      WHERE s.periodo_id = ? 
        AND s.promedio_notas >= 10 
        AND s.estatus IN ('Pendiente', 'En Revisión', 'Revisión Especial')
      ORDER BY s.promedio_notas DESC
      LIMIT 30;
    `;

    const [rows]: any = await db.execute(query, [pId, pId]);

    if (!rows || rows.length === 0) {
      return { success: true, data: [] };
    }

    // 🟢 Mapeo tipado estrictamente incluyendo el estatus de la base de datos
    const candidatos: CandidatoBase[] = rows.map((r: {
      id: number | string;
      cedula: string;
      nombre: string;
      apellido: string;
      carrera: string;
      promedio_notas: number | string;
      puntaje: number | string;
      municipio_residencia: string;
      motivo_solicitud: string;
      estatus: string;
    }) => ({
      id: r.id,
      cedula: r.cedula,
      nombre: `${r.nombre} ${r.apellido}`,
      carrera: r.carrera,
      promedio: Number(r.promedio_notas) || 0,
      puntajeVulnerabilidad: Number(r.puntaje) || 0,
      municipio: r.municipio_residencia || "No especificado",
      motivoSolicitud: r.motivo_solicitud || "Sin motivo detallado",
      estatus: r.estatus || "Pendiente" // 👈 Captura limpia del estatus
    }));

    const prompt = `
      Actúa como el Comité de Becas y Ayudas Económicas de la Universidad de Margarita (Unimar). 
      Analiza la siguiente lista de estudiantes aspirantes a becas. 
      
      Debes ordenarlos y evaluarlos aplicando estrictamente esta ponderación jerárquica:
      1. PRIMERO: El mayor índice académico (promedio de notas).
      2. SEGUNDO: El puntaje de vulnerabilidad socioeconómica y el análisis cualitativo del motivo de solicitud.
      3. TERCERO: La lejanía geográfica del municipio de residencia con respecto al campus universitario (ubicado en El Valle del Espíritu Santo).

      REGLA ESTRICTA DE DISEÑO: En el campo "analisisIA", NO menciones ni escribas el número del promedio de notas (ej. evita decir "19.91" o "con promedio de..."), ya que ese dato se muestra en otra sección de la tarjeta y sería redundante. Céntrate en destacar su mérito general, su vulnerabilidad y su lejanía.

      Devuelve la respuesta EXCLUSIVAMENTE en un formato JSON válido (un arreglo de objetos), sin texto adicional antes ni después:
      [
        {
          "cedula": "string",
          "analisisIA": "Breve justificación institucional de máximo 2 líneas."
        }
      ]

      Datos de los estudiantes a evaluar:
      ${JSON.stringify(candidatos, null, 2)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash', // Cambiado a modelo estable optimizado para evitar errores 503 de alta demanda
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    const respuestaTexto = response.text;
    if (!respuestaTexto) {
      throw new Error("No se obtuvo respuesta del motor de inteligencia artificial.");
    }

    const analisisParseado: Array<{ cedula: string; analisisIA: string }> = JSON.parse(respuestaTexto);

    const resultadoFinal: EstudianteAnalisisIA[] = candidatos.map((cand: CandidatoBase) => {
      const encontrado = analisisParseado.find(a => a.cedula === cand.cedula);
      return {
        ...cand,
        analisisIA: encontrado?.analisisIA || "Evaluado bajo criterios estándar de excelencia y necesidad socioeconómica."
      };
    });

    resultadoFinal.sort((a, b) => b.promedio - a.promedio || b.puntajeVulnerabilidad - a.puntajeVulnerabilidad);

    return { success: true, data: resultadoFinal };

  } catch (error) {
    console.error("❌ Error en generarRankingAptoIA:", error);
    return { success: false, data: [], error: "Error al procesar el ranking inteligente por IA." };
  }
}