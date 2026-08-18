// lib/ActionsPostulacion.ts

import { db } from "@/lib/db";

// 1. INTERFACES ESTRICTAS (Cero 'any')
// Define los campos conocidos de tu tabla 'estudios_socioeconomicos'
export interface IEncuestaPrevia {
  id: number;
  student_id: number;
  tipo: string;
  socio_lugar_nac?: string;
  socio_fecha_unimar?: string | Date;
  socio_ue_procedencia?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  // Agrega aquí otras columnas de tu tabla según sea necesario
}

// Interfaz para asegurar la respuesta de la función
export interface IEncuestaResponse extends Partial<IEncuestaPrevia> {
  socio_fecha_unimar?: string | Date; // Permite tanto el Date original de MySQL como el string formateado
}

/**
 * Obtiene la última encuesta socioeconómica del estudiante y formatea sus datos.
 * @param userId ID del estudiante autenticado
 * @returns Datos de la encuesta tipados o un objeto vacío en caso de error o inexistencia
 */
export async function getEncuestaPrevia(userId: number): Promise<IEncuestaResponse> {
  try {
    // 2. EJECUCIÓN DE LA CONSULTA
    // Usamos aserción de tipo a una tupla para respetar el retorno de mysql2/promise sin usar 'any'
    const [rows] = await db.execute(
      `SELECT * FROM estudios_socioeconomicos 
       WHERE student_id = ? AND tipo = 'estudiante' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    ) as [IEncuestaPrevia[], unknown];

    const encuesta = rows[0];

    // Si no hay registro previo, retornamos un objeto vacío de forma segura
    if (!encuesta) {
      return {}; 
    }

    // 3. AISLAMIENTO DE LÓGICA Y FORMATEO
    // Formateamos la fecha aquí en el backend, no en la interfaz
    let formattedFechaUnimar = undefined;
    if (encuesta.socio_fecha_unimar) {
      const d = new Date(encuesta.socio_fecha_unimar);
      // Validamos que la fecha sea válida antes de formatear
      if (!isNaN(d.getTime())) {
        formattedFechaUnimar = d.toISOString().split('T')[0];
      }
    }

    // Retornamos el registro combinando los datos crudos con los campos formateados
    return {
      ...encuesta,
      ...(formattedFechaUnimar && { socio_fecha_unimar: formattedFechaUnimar }),
    };

  } catch (error) {
    // 4. MANEJO DE ERRORES LIMPIO
    console.error("[ActionsPostulacion] Error en la base de datos al obtener encuesta previa:", error);
    
    // Retornamos un objeto vacío para no romper el flujo principal de Postulación
    return {};
  }
}