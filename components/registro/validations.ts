// Limpia el texto para que solo queden letras y espacios
export const validateLetters = (val: string) => 
  val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");

// Limpia el texto para que solo queden números y respete el largo máximo
export const validateNumbers = (val: string, max: number) => {
  const num = val.replace(/[^0-9]/g, "");
  return num.slice(0, max);
};

// Calcula la fuerza de la contraseña
export const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  return score;
};