import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula la edad a partir de una fecha de nacimiento.
 * Reemplaza la dependencia de Solicitud/components/SeccionesEncuestaData
 */
export function calcularEdad(fechaNacimiento: string | Date | null | undefined): number {
  if (!fechaNacimiento) return 0;

  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  
  // Verificación de fecha válida
  if (isNaN(fechaNac.getTime())) return 0;

  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  // Ajuste si el cumpleaños no ha ocurrido este año
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return edad;
}