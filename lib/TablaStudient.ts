import { queryFresh } from "./db";

/**
 * Interfaz que refleja exactamente la estructura de la tabla 'students'
 * según el volcado SQL de unimar_becas.
 */
export interface Student {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  sexo: 'M' | 'F' | null;
  fecha_nacimiento: string | null;
  telefono: string;
  carrera: string;
  semestre: number;
  indice_global: number;
  email: string | null;
  municipio_residencia: string | null;
  ha_tenido_beca: number; // tinyint 0 o 1
  beca_perdida: number;   // tinyint 0 o 1
  motivo_exclusion: string | null;
}

/**
 * Obtiene un estudiante por su ID utilizando queryFresh para evitar desfases de caché.
 */
export async function getStudentById(id: number): Promise<Student | null> {
  try {
    const sql = `SELECT * FROM students WHERE id = ?`;
    const rows = await queryFresh(sql, [id]) as Student[];

    if (rows.length === 0) return null;

    return rows[0];
  } catch (error) {
    console.error("Error en TablaStudient - getStudentById:", error);
    throw error;
  }
}

/**
 * Obtiene un estudiante por su número de cédula.
 */
export async function getStudentByCedula(cedula: string): Promise<Student | null> {
  try {
    const sql = `SELECT * FROM students WHERE cedula = ?`;
    const rows = await queryFresh(sql, [cedula]) as Student[];

    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error("Error en TablaStudient - getStudentByCedula:", error);
    throw error;
  }
}

/**
 * Obtiene todos los estudiantes registrados ordenados por apellido.
 */
export async function getAllStudents(): Promise<Student[]> {
  try {
    const sql = `SELECT * FROM students ORDER BY apellido ASC, nombre ASC`;
    const rows = await queryFresh(sql) as Student[];
    return rows;
  } catch (error) {
    console.error("Error en TablaStudient - getAllStudents:", error);
    throw error;
  }
}