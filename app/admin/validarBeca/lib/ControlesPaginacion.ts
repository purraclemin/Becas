/**
 * 📐 Utilidad matemática y lógica para el control de paginación responsiva (Unimar Fluid Scale)
 */

/**
 * Calcula de forma dinámica cuántas filas se pueden mostrar en la tabla 
 * según la altura actual de la ventana del navegador (evita scroll vertical innecesario).
 */
export function calcularFilasPorAltura(windowHeight?: number): number {
  if (typeof window === "undefined" && !windowHeight) return 7;
  const alturaVentana = windowHeight ?? window.innerHeight;
  const filasPosibles = Math.floor((alturaVentana - 360) / 55);
  return Math.max(6, filasPosibles);
}

/**
 * Valida y asegura que la página actual se mantenga dentro de los límites válidos
 * establecidos entre 1 y el total de páginas disponibles.
 */
export function validarPagina(paginaDeseada: number, totalPaginas: number): number {
  if (totalPaginas <= 0) return 1;
  return Math.max(1, Math.min(totalPaginas, paginaDeseada));
}