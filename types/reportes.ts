// types/analitica.ts

/**
 * Datos para la Matriz de Justicia Social (Scatter Plot)
 * Muestra la relación entre el rendimiento académico y la situación económica.
 */
export interface DatosMatriz {
  nombre: string;
  apellido: string;
  carrera: string;
  promedio: number;      // Nota del 0 al 20
  vulnerabilidad: number; // Puntaje del 0 al 100
}

/**
 * Datos para el Radar de Facultades (Radar Chart)
 * Compara el desempeño académico promedio entre las distintas carreras.
 */
export interface DatosRadar {
  subject: string;   // Nombre de la carrera
  A: number;         // Promedio de notas (Eje del radar)
  fullMark: number;  // El valor máximo posible (ej: 20)
}

/**
 * Datos para el Embudo de Conversión (Funnel Chart)
 * Mide la eficiencia del proceso de selección de becas.
 */
export interface DatosEmbudo {
  name: string;      // Etapa del proceso (ej: "Solicitadas", "Aprobadas")
  value: number;     // Cantidad de estudiantes en esa etapa
}

/**
 * Objeto global que devuelve la Server Action de analiticas
 */
export interface AnaliticasAvanzadas {
  matriz: DatosMatriz[];
  radar: DatosRadar[];
  embudo: DatosEmbudo[];
}