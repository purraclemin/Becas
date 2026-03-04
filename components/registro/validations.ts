import { z } from "zod";

// 1. Esquema de Carreras Oficiales (Debe coincidir con la Base de Datos)
export const CarrerasUnimar = z.enum([
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Derecho",
  "Administración",
  "Contaduría Pública",
  "Artes mención Diseño Gráfico",
  "Idiomas Modernos",
  "Psicología"
]);

// 2. Funciones de limpieza que ya tenías (se mantienen igual)
export const validateLetters = (val: string) => 
  val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

export const validateNumbers = (val: string, max: number) => {
  const num = val.replace(/[^0-9]/g, "");
  return num.slice(0, max);
};

export const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  return score;
};

/**
 * 3. ESQUEMA DE VALIDACIÓN DEL REGISTRO (Integración final)
 * Asegúrate de que el objeto de validación de tu Step 2 use CarrerasUnimar
 */
export const academicStepSchema = z.object({
  carrera: CarrerasUnimar,
  semestre: z.string().min(1, "El trimestre es obligatorio"),
});