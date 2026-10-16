'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { validarCuposYRequisitos } from './ActionsBecaValidators'
import { db } from './db'
import nodemailer from 'nodemailer'

const ESTATUS_VALIDOS = ['Pendiente', 'Convocado a Entrevista', 'En Revisión', 'Aprobada', 'Rechazada'];

// Configuración de transporte de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Acción del Servidor: Orquestador para la actualización de estatus de becas.
 * Gestiona la seguridad, validación de reglamento, persistencia transaccional y notificaciones omnicanal.
 */
export async function actualizarEstatusBeca(
  id: number, 
  nuevoEstatus: string, 
  observaciones?: string,
  confirmacionEspecial: boolean = false, // Flag para permitir excepciones (Doble Confirmación)
  departamentoAsignado?: string // 🟢 Recibe el departamento seleccionado en la UI
) {
  try {
    // 1. SEGURIDAD: Verificación de Rol y Sesión
    const cookieStore = await cookies();
    const role = cookieStore.get('user_role')?.value;
    const sessionToken = cookieStore.get('session_token')?.value;
    
    const adminIdRaw = sessionToken?.split('_').pop();
    const adminId = adminIdRaw ? parseInt(adminIdRaw, 10) : null;

    if (role !== 'admin' || adminId === null) {
       return { error: "Acceso denegado: Se requieren permisos de administrador válidos." };
    }

    // 2. VALIDACIÓN DE DATOS DE ENTRADA
    if (!id || !ESTATUS_VALIDOS.includes(nuevoEstatus)) {
        return { error: "Los datos de la solicitud o el estatus proporcionado no son válidos." };
    }

    // 3. LÓGICA DE CUPOS Y REGLAMENTO (Solo si se intenta Aprobar)
    if (nuevoEstatus === 'Aprobada') {
      const [solRows] = await db.execute(
        'SELECT estatus, periodo_id FROM solicitudes WHERE id = ?', 
        [id]
      ) as [Array<{ estatus: string; periodo_id: number }>, unknown];

      if (solRows.length > 0) {
        const sol = solRows[0];
        
        // 🟢 EXCEPCIÓN INTELIGENTE: Si la solicitud YA ESTABA APROBADA previamente,
        // significa que solo se está reasignando el departamento. Omitimos la validación de cupos.
        const yaEstabaAprobada = sol.estatus === 'Aprobada';

        if (!yaEstabaAprobada) {
          const diagnostico = await validarCuposYRequisitos(id, Number(sol.periodo_id));

          const esRenovacion = sol.estatus === 'Renovacion';
          const saltarValidacionCupo = esRenovacion && diagnostico.codigo === 'CUPO_EXCEDIDO';

          if (!diagnostico.apto && !confirmacionEspecial && !saltarValidacionCupo) {
            return { 
              error: "REGLAMENTO_INCUMPLIDO", 
              code: diagnostico.codigo,
              message: diagnostico.mensaje 
            };
          }
        }
      }
    }

    /**
     * 4. DELEGACIÓN TRANSACCIONAL
     * Una vez superado el reglamento (o omitido por ya estar aprobado), procedemos al guardado.
     */
    const resultado = await registrarDecisionEnHistorial(
      id, 
      nuevoEstatus, 
      adminId, 
      observaciones || null,
      '127.0.0.1',
      undefined,
      departamentoAsignado // 🟢 Propagamos el departamento hacia la capa SQL
    );

    // 5. NOTIFICACIÓN OMNICANAL ADICIONAL SI ES CONVOCATORIA A ENTREVISTA
    if (resultado.success && nuevoEstatus === 'Convocado a Entrevista') {
      try {
        const [estudianteRows] = await db.execute(`
          SELECT s.email_institucional, st.nombre, st.apellido 
          FROM solicitudes s
          JOIN students st ON s.user_id = st.id
          WHERE s.id = ?
        `, [id]) as [Array<{ email_institucional: string; nombre: string; apellido: string }>, unknown];

        if (estudianteRows.length > 0) {
          const est = estudianteRows[0];
          const emailDestino = est.email_institucional;
          const nombreCompleto = `${est.nombre} ${est.apellido}`;

          if (emailDestino) {
            await transporter.sendMail({
              from: `"Comité de Becas UNIMAR" <${process.env.SMTP_USER || 'soporte@unimar.edu.ve'}>`,
              to: emailDestino,
              subject: 'Convocatoria a Entrevista Socioeconómica - Becas UNIMAR',
              html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e3a5f;">
                  <h2 style="color: #1e3a5f; border-bottom: 2px solid #d4a843; padding-bottom: 10px;">Universidad de Margarita (UNIMAR)</h2>
                  <p>Estimado/a <strong>${nombreCompleto}</strong>,</p>
                  <p>Su postulación a la beca institucional ha sido seleccionada para la fase de evaluación presencial.</p>
                  <div style="background-color: #f8fafc; border-left: 4px solid #d4a843; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">Debe presentarse a la brevedad posible en el Departamento de Bienestar Estudiantil para realizar su entrevista socioeconómica.</p>
                  </div>
                  <p>Por favor, acuda con los recaudos solicitados en el portal.</p>
                  <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Atentamente,<br><strong>Dirección de Bienestar Estudiantil - UNIMAR</strong></p>
                </div>
              `,
            });
          }
        }
      } catch (emailError) {
        console.error("⚠️ Advertencia: No se pudo despachar el correo de convocatoria, pero el estatus cambió en la BD:", emailError);
      }
    }

    // 6. FINALIZACIÓN Y REVALIDACIÓN DE CACHÉ
    if (resultado.success) {
      revalidatePath('/admin/solicitudes');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/analiticas');
      revalidatePath('/admin/socioeconomico');
      revalidatePath('/admin/validarBeca');

      return { 
        success: true, 
        message: `Estatus actualizado a ${nuevoEstatus} correctamente.`,
        token: resultado.token 
      };
    }

    return { error: "No se pudo procesar la actualización en el servidor." };

  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Error crítico en el orquestador de estatus:", err);
    return { 
      error: "Error de comunicación con el motor de base de datos. Intente nuevamente." 
    };
  }
}