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

/**
 * Estructura de la encuesta exportada para el componente StepEncuesta
 */
export const OPCIONES_ENCUESTA = {
  vivienda: [
    { name: "tipo_vivienda", label: "Tipo de Vivienda", opciones: ["Quinta", "Casa", "Apartamento", "Habitación", "Rancho"] },
    { name: "tenencia_vivienda", label: "Tenencia", opciones: ["Propia", "Alquilada", "Prestada", "Pagándose"] },
    { name: "condiciones_vivienda", label: "Condiciones", opciones: ["Excelente", "Buena", "Regular", "Mala"] },
    { name: "zona_vivienda", label: "Zona de Ubicación", opciones: ["Urbanización", "Caserío", "Barrio", "Zona Comercial"] }
  ],
  familia: [
    { name: "vive_con", label: "Usted vive con", opciones: ["Padres", "Solo Madre", "Solo Padre", "Otros Familiares", "Solo/a"] },
    { name: "cantidad_personas_hogar", label: "Personas en el hogar", opciones: ["1-2", "3-4", "5-6", "Más de 6"] },
    { name: "estado_civil_padres", label: "Estado Civil de los Padres", opciones: ["Casados", "Divorciados", "Concubinos", "Viudo/a"] }
  ],
  salud: [
    { name: "padece_enfermedad", label: "¿Padece alguna enfermedad?", opciones: ["Si", "No"] },
    { name: "discapacidad", label: "¿Posee alguna discapacidad?", opciones: ["Si", "No"] },
    { name: "seguro_medico", label: "¿Posee seguro médico?", opciones: ["Si", "No"] }
  ]
};