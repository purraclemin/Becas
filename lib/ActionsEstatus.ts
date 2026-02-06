// lib/ActionsEstatus.ts
'use server' // <-- ESTA LÍNEA ES OBLIGATORIA

import { db } from './db'
import { revalidatePath } from 'next/cache'

/**
 * Actualiza el estatus de una solicitud de beca.
 */
export async function actualizarEstatusBeca(id: number, nuevoEstatus: string) {
  try {
    // Validamos que el ID sea un número válido
    if (!id) throw new Error("ID de solicitud no proporcionado");

    await db.execute(
      'UPDATE solicitudes SET estatus = ? WHERE id = ?',
      [nuevoEstatus, id]
    );
    
    // Forzamos a Next.js a refrescar los datos en la ruta del admin
    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error al actualizar estatus:", error);
    return { error: error.message || "No se pudo actualizar el estatus." };
  }
}