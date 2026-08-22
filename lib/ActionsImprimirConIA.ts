"use server"

import { GoogleGenAI } from "@google/genai";

// Inicializa el SDK de Gemini usando la variable de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- INTERFACES ESTRICTAS (Cero 'any' por seguridad) ---
export interface DashboardStats {
  porEstatus?: { estatus: string; total: number }[];
  porCarrera?: { carrera: string; total: number }[];
  porTipo?: { tipo_beca: string; total: number }[];
  [key: string]: unknown;
}

export interface RankingItem {
  id?: number | string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  carrera?: string;
  promedio_notas?: number | string;
  vulnerabilidad_puntos?: number | string;
  origen_puntaje?: 'admin' | 'estudiante';
  [key: string]: unknown;
}

export interface IActividad {
  id: number | string;
  cedula: string;
  fecha_registro: string;
  nombre: string;
  apellido: string;
  carrera: string;
  tipo_beca: string;
  promedio_notas: string;
  estatus: string;
}

// 1. FUNCIÓN DE DASHBOARD (Tu lógica y prompt original intactos)
export async function generarReporteIA(statsData: DashboardStats, rankingData: RankingItem[]) {
  try {
    const prompt = `
      Eres el Asistente Ejecutivo de Inteligencia Artificial del Sistema de Gestión de Becas de la Universidad de Margarita (UNIMAR).
      Genera un informe institucional, formal y analítico basado en los siguientes datos operativos actuales del sistema:
      
      - Estadísticas del Sistema (Estatus, Carreras, Programas): ${JSON.stringify(statsData)}
      - Top de Estudiantes en Ranking Prioritario (considerando el baremo verificado por administración o autogestionado): ${JSON.stringify(rankingData?.slice(0, 5))}

      Estructura obligatoria del informe ejecutivo:
      00. No hables del indice de merito.
      0. Como sera para imprimir quiero que coloques le fecha actual: ${new Date().toLocaleDateString('es-VE')}. 
      1. Diagnóstico del Rendimiento Operativo Actual.
      2. Análisis de Distribución Académica (Carreras y Tipos de Beca).
      3. Conclusiones y Recomendaciones Estratégicas para la Coordinación de Becas.
      4. NO utilices asteriscos, negritas (**, *) ni guiones (-). Devuelve estrictamente texto plano.
      5. Evita redundancias o repetir el nombre completo del estudiante de forma innecesaria en el texto si ya se nombra en la introducción.

      Mantén un tono estrictamente formal, ejecutivo y académico, ideal para una auditoría institucional o presentación de tesis de grado. No utilices saludos informales ni introducciones largas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return {
      success: true,
      reporte: response.text || "No se pudo generar el contenido analítico."
    };
  } catch (error) {
    console.error("Error al generar reporte con Gemini IA:", error);
    return {
      success: false,
      reporte: "Error en el motor de Inteligencia Artificial. Verifique la conexión o credenciales de la API."
    };
  }
}

// 2. FUNCIÓN DE ACTIVIDADES (Añadida limpiamente manteniendo el mismo modelo y estándar)
export async function generarReporteActividadIA(actividadData: IActividad[]) {
  try {
    const prompt = `
      Eres el Auditor Interno de Inteligencia Artificial del Sistema de Gestión de Becas de la Universidad de Margarita (UNIMAR).
      Genera un informe de auditoría institucional, formal y analítico basado en la siguiente bitácora de actividad reciente del sistema:
      
      - Bitácora de Movimientos y Solicitudes Recientes: ${JSON.stringify(actividadData)}

      Estructura obligatoria del informe de auditoría:
      0. Como sera para imprimir quiero que coloques le fecha actual: ${new Date().toLocaleDateString('es-VE')}. 
      1. Diagnóstico del Estado Actual de la Bitácora y Movimientos Recientes.
      2. Análisis de Tendencias y Comportamiento de los Aspirantes en la Actividad Operativa.
      3. Conclusiones y Recomendaciones Estratégicas para la Coordinación de Becas.
      4. NO utilices asteriscos, negritas (**, *) ni guiones (-). Devuelve estrictamente texto plano.
      5. Evita redundancias o repetir nombres completos de forma innecesaria en el texto.

      Mantén un tono estrictamente formal, ejecutivo y académico, ideal para una auditoría institucional o presentación de tesis de grado. No utilices saludos informales ni introducciones largas.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return {
      success: true,
      reporte: response.text || "No se pudo generar el contenido de auditoría."
    };
  } catch (error) {
    console.error("Error al generar auditoría con Gemini IA:", error);
    return {
      success: false,
      reporte: "Error en el motor de Inteligencia Artificial. Verifique la conexión o credenciales de la API."
    };
  }
}