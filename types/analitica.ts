// types/analitica.ts

/**
 * Datos para la Matriz de Justicia Social (Scatter Plot)
 * Muestra la relación entre el rendimiento académico y la situación socioeconómica.
 */
export interface DatosMatriz {
  cedula: string;
  nombre: string;
  apellido: string;
  carrera: string;
  promedio_notas: number;        // Nota del 0 al 20
  vulnerabilidad_puntos: number; // Puntaje del 0 al 100
  [key: string]: unknown;
}

/**
 * Datos para el Radar de Facultades (Radar Chart)
 * Compara el desempeño académico promedio entre las distintas carreras.
 */
export interface DatosRadar {
  subject: string;   // Nombre de la carrera
  A: number;         // Promedio de notas (Eje del radar)
  fullMark: number;  // Valor máximo posible (20)
}

/**
 * Datos para el Monitor de Continuidad (Bar Chart)
 * Mide la continuidad y evolución de beneficiarios entre periodos.
 */
export interface DatosEmbudo {
  name: string;      // Indicador del monitor
  value: number;     // Cantidad total de estudiantes en el indicador
  viejos?: number;   // Becarios históricos (solo en BENEFICIARIOS TOTALES)
  nuevos?: number;   // Nuevos ingresos (solo en BENEFICIARIOS TOTALES)
  [key: string]: unknown;
}

/**
 * Objeto global que devuelve la Server Action de analíticas
 */
export interface AnaliticasAvanzadas {
  matriz: DatosMatriz[];
  radar: DatosRadar[];
  embudo: DatosEmbudo[];
}
