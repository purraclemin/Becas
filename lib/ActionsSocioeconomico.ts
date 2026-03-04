'use server'

import { revalidatePath } from 'next/cache'
import { getContrasteEstudianteSQL, deleteEstudioSQL } from './ActionsSocioeconomicoSQL'
import { procesarGuardadoEstudio } from './ActionsSocioeconomicoActions'

/**
 * 1. BUSCAR ESTUDIANTE (Interfaz Pública)
 */
export async function buscarEstudianteConEstudio(termino: string) {
  try {
    if (!termino || termino.trim().length < 3) return [];
    return await getContrasteEstudianteSQL(`%${termino}%`);
  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
    return [];
  }
}

/**
 * 2. GUARDAR / ACTUALIZAR (Interfaz Pública)
 */
export async function guardarOActualizarEstudio(data: any) {
  try {
    const result = await procesarGuardadoEstudio(data);
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/socioeconomico');
    return result;
  } catch (error: any) {
    console.error("❌ Error en guardado:", error);
    return { success: false, error: error.message || "Error al procesar el estudio." };
  }
}

/**
 * 3. BORRAR (Interfaz Pública)
 */
export async function borrarEstudio(studentId: number) {
  try {
    await deleteEstudioSQL(studentId);
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/socioeconomico');
    return { success: true };
  } catch (error) {
    console.error("❌ Error borrando estudio:", error);
    return { success: false };
  }
}