// lib/Actionsestudiantes.ts
'use server'

import { db } from './db'

/**
 * Obtiene la lista completa de estudiantes registrados en el sistema de becas.
 * Se ordena alfabéticamente por apellido para facilitar la búsqueda administrativa.
 */
export async function obtenerTodosLosEstudiantes() {
  try {
    const [rows]: any = await db.execute(`
      SELECT 
        id,
        nombre,
        apellido,
        cedula,
        email,
        telefono,
        carrera,
        semestre,
        fecha_registro
      FROM students
      ORDER BY apellido ASC
    `);

    return rows;
  } catch (error) {
    console.error("❌ Error en Actionsestudiantes:", error);
    return [];
  }
}