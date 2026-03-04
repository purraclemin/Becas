'use server'

import { toggleModoPrueba, getModoPruebaStatus } from './ModoPrueba'
import { revalidatePath } from 'next/cache'

/**
 * Acción para actualizar la configuración del modo desarrollador
 * @param formData - Datos del formulario (estado del switch y mes seleccionado)
 */
export async function actualizarConfiguracionPruebas(formData: FormData) {
  // 1. Obtenemos los valores del formulario
  const modoActivo = formData.get('modo_prueba') === 'on';
  const mesSeleccionado = formData.get('mes_simulado') as string;

  try {
    // 2. Ejecutamos la actualización en la base de datos
    await toggleModoPrueba(modoActivo, modoActivo ? mesSeleccionado : undefined);

    // 3. REVALIDACIÓN AGRESIVA
    // Usamos el modo 'layout' para forzar a que todos los componentes hijos 
    // (como los gráficos y el banner del estudiante) se enteren del cambio.
    revalidatePath('/', 'layout'); 
    
    // Específicamente para las rutas donde el impacto es crítico
    revalidatePath('/admin/dashboard');
    revalidatePath('/perfil');

    return { 
      success: true, 
      message: "Configuración de pruebas actualizada correctamente." 
    };
  } catch (error) {
    console.error("❌ Error en ActionsAdmin:", error);
    return { 
      success: false, 
      error: "No se pudo sincronizar la configuración con el servidor." 
    };
  }
}

/**
 * Función auxiliar para obtener el estado actual
 * Usada por el useEffect del componente cliente para la carga inicial
 */
export async function obtenerConfiguracionActual() {
  // Forzamos que esta consulta no sea cacheada por la acción
  return await getModoPruebaStatus();
}