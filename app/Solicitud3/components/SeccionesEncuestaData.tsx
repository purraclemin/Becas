/**
 * Lógica para el cálculo de edad automática basada en la fecha de nacimiento.
 */
export const calcularEdad = (fechaNac: string): string => {
  if (!fechaNac) return "0";
  const hoy = new Date();
  const cumpleanos = new Date(fechaNac);
  let edadCalculada = hoy.getFullYear() - cumpleanos.getFullYear();
  const mes = hoy.getMonth() - cumpleanos.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
    edadCalculada--;
  }
  return edadCalculada > 0 ? edadCalculada.toString() : "0";
};

export const OPCIONES_MUNICIPIOS = [
  "Antolín del Campo", "Arismendi", "Díaz", "García", "Gómez", 
  "Maneiro", "Marcano", "Mariño", "Península de Macanao", "Tubores", "Villalba"
].map(m => ({ label: m, value: m }));

export const OPCIONES_CARRERAS = [
  "Ingeniería de Sistemas", "Ingeniería Industrial", "Derecho", 
  "Administración", "Contaduría Pública", "Artes mención Diseño Gráfico", 
  "Idiomas Modernos", "Psicología"
].map(c => ({ label: c, value: c }));

export const OPCIONES_ESTADO_CIVIL = [
  "Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a", "Concubinato"
].map(v => ({ label: v, value: v }));