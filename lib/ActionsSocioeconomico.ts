'use server'

import { revalidatePath } from 'next/cache'
import {
  getContrasteEstudianteSQL,
  deleteEstudioSQL,
  type ContrasteEstudianteRow
} from './ActionsSocioeconomicoSQL'
import {
  procesarGuardadoEstudio,
  type EstudioSocioeconomicoInput
} from './ActionsSocioeconomicoActions'

/**
 * 1. BUSCAR ESTUDIANTE (Interfaz Pública)
 */
export async function buscarEstudianteConEstudio(
  termino: string
): Promise<ContrasteEstudianteRow[]> {
  try {
    if (!termino || termino.trim().length < 3) return [];
    return await getContrasteEstudianteSQL(`%${termino.trim()}%`);
  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
    return [];
  }
}

/**
 * 2. GUARDAR / ACTUALIZAR (Interfaz Pública)
 */
export async function guardarOActualizarEstudio(data: EstudioSocioeconomicoInput) {
  try {
    const result = await procesarGuardadoEstudio(data);
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/socioeconomico');
    revalidatePath('/admin/estudio-socioeconomico');
    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/reportes');
    revalidatePath('/perfil');
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al procesar el estudio.";
    console.error("❌ Error en guardado:", error);
    return { success: false, error: message };
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
    revalidatePath('/admin/estudio-socioeconomico');
    revalidatePath('/admin/validarBeca');
    return { success: true };
  } catch (error) {
    console.error("❌ Error borrando estudio:", error);
    return { success: false };
  }
}