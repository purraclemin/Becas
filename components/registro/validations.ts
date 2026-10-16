import { z } from "zod";

// 1. Listas oficiales sincronizadas con la Base de Datos
export const CARRERAS_UNIMAR_LIST = [
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Derecho",
  "Administración",
  "Contaduría Pública",
  "Artes mención Diseño Gráfico",
  "Idiomas Modernos",
  "Psicología",
] as const;

export const TRIMESTRES_UNIMAR_LIST = [
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
] as const;

export const MUNICIPIOS_MARGARITA_LIST = [
  "Antolín del Campo",
  "Arismendi",
  "Díaz",
  "García",
  "Gómez",
  "Maneiro",
  "Marcano",
  "Mariño",
  "Península de Macanao",
  "Tubores",
  "Villalba",
] as const;

// 2. Helpers de Limpieza de Inputs
export const validateLetters = (val: string): string =>
  val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

export const validateNumbers = (val: string, max: number): string => {
  const num = val.replace(/[^0-9]/g, "");
  return num.slice(0, max);
};

export const getPasswordStrength = (pass: string): number => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  return score;
};

// 3. Esquema Zod para el Paso 1 (Datos Personales + Correo Institucional)
export const personalStepSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio"),
  apellido: z.string().min(2, "El apellido es obligatorio"),
  cedula: z.string().regex(/^\d{7,8}$/, "Cédula inválida (7 u 8 dígitos)"),
  sexo: z.enum(["M", "F"], { message: "Selecciona el sexo" }),
  fecha_nacimiento: z.string().min(1, "La fecha de nacimiento es obligatoria"),
  municipio: z.string().min(1, "Selecciona tu municipio"),
  telefono: z.string().regex(/^04\d{9}$/, "Teléfono inválido (Ej: 04121234567)"),
  email: z
    .string()
    .email("Correo inválido")
    .refine((val) => val.endsWith("@unimar.edu.ve"), {
      message: "Debe usar estrictamente su correo institucional @unimar.edu.ve",
    }),
});

// 4. Esquema Zod para el Paso 2 (Académico)
export const academicStepSchema = z.object({
  carrera: z.enum(CARRERAS_UNIMAR_LIST, {
    message: "Selecciona una carrera oficial válida",
  }),
  semestre: z.enum(TRIMESTRES_UNIMAR_LIST, {
    message: "Selecciona el trimestre actual (1 al 12)",
  }),
});

// 5. Esquema Zod para el Paso 3 (Seguridad)
export const securityStepSchema = z
  .object({
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z.string(),
    aceptaTerminos: z.literal(true, {
      errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });