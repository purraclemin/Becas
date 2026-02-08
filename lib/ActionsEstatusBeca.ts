'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Definimos los únicos estados permitidos para proteger la integridad de la BD
const ESTATUS_VALIDOS = ['Pendiente', 'En Revisión', 'Aprobada', 'Rechazada'];

export async function actualizarEstatusBeca(id: number, nuevoEstatus: string) {
  try {
    // 1. SEGURIDAD: Verificamos que quien llama sea ADMIN
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;

    if (role !== 'admin') {
       console.warn(`Intento de cambio de estatus no autorizado. IP o Usuario sospechoso.`);
       return { error: "Acceso denegado: Se requieren permisos de administrador." };
    }

    // 2. VALIDACIÓN DE ENTRADA
    if (!id) return { error: "ID de solicitud no válido." };
    
    if (!ESTATUS_VALIDOS.includes(nuevoEstatus)) {
        return { error: `El estatus '${nuevoEstatus}' no es válido.` };
    }

    // 3. EJECUCIÓN EN BASE DE DATOS
    const [result]: any = await db.execute(
      'UPDATE solicitudes SET estatus = ? WHERE id = ?',
      [nuevoEstatus, id]
    );

    // 4. VERIFICACIÓN DE RESULTADO
    if (result.affectedRows === 0) {
        return { error: "No se encontró la solicitud o ya tenía ese estatus." };
    }
    
    // 5. REFRESCAR CACHÉ
    // Esto actualiza instantáneamente las tablas y contadores del dashboard
    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/reportes'); // También actualizamos los reportes por si acaso

    return { success: true };

  } catch (error: any) {
    console.error("❌ Error crítico al actualizar estatus:", error);
    return { error: "Error de conexión con la base de datos. Intente más tarde." };
  }
}