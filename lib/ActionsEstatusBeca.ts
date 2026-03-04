'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { validarCuposYRequisitos } from './ActionsBecaValidators'
import { db } from './db'

const ESTATUS_VALIDOS = ['Pendiente', 'En Revisión', 'Aprobada', 'Rechazada'];

/**
 * Acción del Servidor: Orquestador para la actualización de estatus de becas.
 * Gestiona la seguridad, validación de reglamento y persistencia transaccional.
 */
export async function actualizarEstatusBeca(
  id: number, 
  nuevoEstatus: string, 
  observaciones?: string,
  confirmacionEspecial: boolean = false // Flag para permitir excepciones (Doble Confirmación)
) {
  try {
    // 1. SEGURIDAD: Verificación de Rol y Sesión
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    const sessionToken = cookieStore.get('session_token')?.value;
    
    const adminIdRaw = sessionToken?.split('_').pop();
    const adminId = adminIdRaw ? parseInt(adminIdRaw) : null;

    if (role !== 'admin' || adminId === null) {
       return { error: "Acceso denegado: Se requieren permisos de administrador válidos." };
    }

    // 2. VALIDACIÓN DE DATOS DE ENTRADA
    if (!id || !ESTATUS_VALIDOS.includes(nuevoEstatus)) {
        return { error: "Los datos de la solicitud o el estatus proporcionado no son válidos." };
    }

    // 3. LÓGICA DE CUPOS Y REGLAMENTO (Solo si se intenta Aprobar)
    if (nuevoEstatus === 'Aprobada') {
      // Obtenemos el estatus previo y el periodo_id para la validación interna
      const [solRows]: any = await db.execute(
        'SELECT estatus, periodo_id FROM solicitudes WHERE id = ?', 
        [id]
      );

      if (solRows.length > 0) {
        const sol = solRows[0];
        
        /**
         * 🟢 LLAMADA AL VALIDADOR (Sincronizado con tabla students)
         * Si el validador devuelve apto: false, este orquestador debe CORTAR la ejecución
         * a menos que confirmacionEspecial sea true.
         */
        const diagnostico = await validarCuposYRequisitos(id, Number(sol.periodo_id));

        // Prioridad de Renovación: Evita bloqueos si el cupo ya estaba contado para este alumno
        const esRenovacion = sol.estatus === 'Renovacion';
        const saltarValidacionCupo = esRenovacion && diagnostico.codigo === 'CUPO_EXCEDIDO';

        // 🚨 BLOQUEO DE SEGURIDAD: Si no cumple y no hay flag de excepción
        if (!diagnostico.apto && !confirmacionEspecial && !saltarValidacionCupo) {
          return { 
            error: "REGLAMENTO_INCUMPLIDO", 
            code: diagnostico.codigo,
            message: diagnostico.mensaje 
          };
        }
      }
    }

    /**
     * 4. DELEGACIÓN TRANSACCIONAL
     * Una vez superado el reglamento, procedemos al guardado físico e historial.
     */
    const resultado = await registrarDecisionEnHistorial(
      id, 
      nuevoEstatus, 
      adminId, 
      observaciones || null
    );

    // 5. FINALIZACIÓN Y REVALIDACIÓN DE CACHÉ
    if (resultado.success) {
      // Revalidamos todas las rutas que dependen de la lista de solicitudes
      revalidatePath('/admin/solicitudes');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/analiticas');
      revalidatePath('/admin/socioeconomico');

      return { 
        success: true, 
        message: `Estatus actualizado a ${nuevoEstatus} correctamente.`,
        token: resultado.token 
      };
    }

    return { error: "No se pudo procesar la actualización en el servidor." };

  } catch (error: any) {
    console.error("❌ Error crítico en el orquestador de estatus:", error);
    return { 
      error: "Error de comunicación con el motor de base de datos. Intente nuevamente." 
    };
  }
}