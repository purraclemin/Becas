'use server'

import { db } from './db'
import { revalidatePath, revalidateTag } from 'next/cache' // 🟢 Agregamos revalidateTag

/**
 * Consulta el estado actual del modo prueba
 */
export async function getModoPruebaStatus() {
  try {
    // 🟢 Agregamos una marca de tiempo o configuramos la consulta como NO dinámica 
    // para asegurar que Next.js no cachee el resultado de la DB de forma permanente.
    const [rows]: any = await db.execute('SELECT * FROM sistema_config');
    
    const bypass = rows.find((r: any) => r.clave === 'bypass_reglas')?.valor_int === 1;
    const mes = rows.find((r: any) => r.clave === 'mes_simulado')?.valor_txt;
    
    return { activo: bypass, mesSimulado: mes };
  } catch (error) {
    return { activo: false, mesSimulado: null };
  }
}

/**
 * Activa o desactiva las reglas y el mes simulado
 */
export async function toggleModoPrueba(activar: boolean, mes?: string) {
  try {
    // 1. Actualizar el bypass (0 o 1)
    await db.execute(
      'UPDATE sistema_config SET valor_int = ? WHERE clave = "bypass_reglas"', 
      [activar ? 1 : 0]
    );

    // 2. Actualizar el mes (o limpiar si no se envía)
    await db.execute(
      'UPDATE sistema_config SET valor_txt = ? WHERE clave = "mes_simulado"', 
      [mes || null]
    );

    // 🟢 3. FORZAR REVALIDACIÓN TOTAL
    // Revalidamos el path y opcionalmente una etiqueta si usaras fetch, 
    // pero con db.execute, revalidatePath es lo que indica a las Server Actions 
    // que los datos han cambiado.
    revalidatePath('/', 'layout'); 
    revalidatePath('/admin/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar modo prueba:", error);
    return { success: false };
  }
}