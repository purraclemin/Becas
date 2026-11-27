'use server'

import { revalidatePath } from 'next/cache'
import {
  toggleModoPrueba,
  getModoPruebaStatus,
  avanzarAlSiguientePeriodoSimulado,
  restaurarPeriodoReal,
  type ModoPruebaStatus,
  type ResultadoAvancePeriodo,
  type ResultadoRestaurarPeriodo,
} from './ModoPrueba'

function revalidarVistasAdmin(): void {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/dashboard');
  revalidatePath('/admin/validarBeca');
  revalidatePath('/admin/reportes');
  revalidatePath('/admin/estudiantes');
  revalidatePath('/admin/analiticas');
  revalidatePath('/perfil');
}

/**
 * Acción para activar/desactivar el bypass de reglas de pruebas.
 */
export async function actualizarConfiguracionPruebas(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const modoActivo = formData.get('modo_prueba') === 'on';
  const mesRaw = formData.get('mes_simulado');
  const mesSeleccionado = typeof mesRaw === 'string' && mesRaw.trim() !== '' ? mesRaw.trim() : undefined;

  try {
    await toggleModoPrueba(modoActivo, modoActivo ? mesSeleccionado : undefined);
    revalidarVistasAdmin();

    return {
      success: true,
      message: 'Configuración de pruebas actualizada correctamente.',
    };
  } catch (error) {
    console.error('❌ Error en ActionsAdmin:', error);
    return {
      success: false,
      error: 'No se pudo sincronizar la configuración con el servidor.',
    };
  }
}

/**
 * Avanza secuencialmente al siguiente periodo académico en el DEV PANEL
 * (2026-III → 2027-I → 2027-II → 2027-III → ...).
 */
export async function avanzarSiguientePeriodoPruebas(): Promise<ResultadoAvancePeriodo> {
  const res = await avanzarAlSiguientePeriodoSimulado();
  if (res.success) {
    revalidarVistasAdmin();
  }
  return res;
}

/**
 * Restaura el periodo académico real según el calendario del servidor.
 */
export async function restaurarPeriodoRealPruebas(): Promise<ResultadoRestaurarPeriodo> {
  const res = await restaurarPeriodoReal();
  if (res.success) {
    revalidarVistasAdmin();
  }
  return res;
}

/**
 * Consulta la configuración vigente del DEV PANEL y el periodo activo/siguiente.
 */
export async function obtenerConfiguracionActual(): Promise<ModoPruebaStatus> {
  return await getModoPruebaStatus();
}
