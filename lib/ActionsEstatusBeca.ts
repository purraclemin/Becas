'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// Definimos los únicos estados permitidos para proteger la integridad de la BD
const ESTATUS_VALIDOS = ['Pendiente', 'En Revisión', 'Aprobada', 'Rechazada'];

export async function actualizarEstatusBeca(id: number, nuevoEstatus: string, observaciones?: string) {
  let connection;
  try {
    // 1. SEGURIDAD: Verificamos que quien llama sea ADMIN y obtenemos su ID
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    const sessionToken = cookieStore.get('session_token')?.value;
    
    // Extraemos el ID del administrador desde el token de sesión (active_session_ID)
    const adminId = sessionToken?.replace('active_session_', '');

    if (role !== 'admin' || !adminId) {
       console.warn(`Intento de cambio de estatus no autorizado o sesión inválida.`);
       return { error: "Acceso denegado: Se requieren permisos de administrador." };
    }

    // 2. VALIDACIÓN DE ENTRADA
    if (!id) return { error: "ID de solicitud no válido." };
    
    if (!ESTATUS_VALIDOS.includes(nuevoEstatus)) {
        return { error: `El estatus '${nuevoEstatus}' no es válido.` };
    }

    // 3. INICIO DE TRANSACCIÓN (Para asegurar consistencia en ambas tablas)
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 4. PREPARACIÓN DE LA CONSULTA DE AUDITORÍA
    // Dependiendo del estatus, actualizamos fecha_revision o fecha_decision
    let query = 'UPDATE solicitudes SET estatus = ?, revisado_por = ?, observaciones_admin = ?';
    const params: any[] = [nuevoEstatus, adminId, observaciones || null];

    if (nuevoEstatus === 'En Revisión') {
      query += ', fecha_revision = NOW()';
    } else if (nuevoEstatus === 'Aprobada' || nuevoEstatus === 'Rechazada') {
      query += ', fecha_decision = NOW()';
    }

    query += ' WHERE id = ?';
    params.push(id);

    // 5. EJECUCIÓN EN TABLA SOLICITUDES
    const [result]: any = await connection.execute(query, params);

    if (result.affectedRows === 0) {
        await connection.rollback();
        return { error: "No se encontró la solicitud o no hubo cambios." };
    }

    // 6. LÓGICA DE "BALA DE PLATA" (Si se aprueba, marcamos al estudiante)
    if (nuevoEstatus === 'Aprobada') {
      await connection.execute(`
        UPDATE students st
        JOIN solicitudes s ON st.id = s.user_id
        SET st.ha_tenido_beca = 1
        WHERE s.id = ?
      `, [id]);
    }

    // 7. FINALIZAR TRANSACCIÓN
    await connection.commit();
    
    // 8. REFRESCAR CACHÉ
    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/analitica'); 

    return { success: true };

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("❌ Error crítico al actualizar estatus:", error);
    return { error: "Error de conexión con la base de datos. Intente más tarde." };
  } finally {
    if (connection) connection.release();
  }
}