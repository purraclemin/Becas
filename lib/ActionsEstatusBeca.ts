'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import nodemailer from 'nodemailer'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { validarCuposYRequisitos } from './ActionsBecaValidators'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { db } from './db'

const ESTATUS_VALIDOS = ['Pendiente', 'Convocado a Entrevista', 'En Revisión', 'Aprobada', 'Rechazada'];
const EMAIL_SECRETARIA_GENERAL = 'secretariageneral@unimar.edu.ve';

type MailTransporter = ReturnType<typeof nodemailer.createTransport>;

export interface ResultadoActualizacionEstatus {
  success?: boolean;
  message?: string;
  token?: string;
  emailEnviado?: boolean;
  emailError?: string;
  error?: string;
  code?: string;
}

interface ActorUsuarioRow extends RowDataPacket {
  id: number;
  email: string | null;
  role: string;
}

interface SolicitudEstadoRow extends RowDataPacket {
  user_id: number;
  estatus: string;
  periodo_id: number;
  beca_perdida: number;
}

interface EstudianteCorreoRow extends RowDataPacket {
  email_destino: string | null;
  nombre: string;
  apellido: string;
  tipo_beca: string | null;
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function crearTransporterSMTP(): {
  transporter: MailTransporter | null;
  smtpUser: string;
  errorConfig?: string;
} {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  if (!smtpUser || !smtpPass) {
    return {
      transporter: null,
      smtpUser: '',
      errorConfig:
        'Credenciales SMTP no configuradas en el servidor (verifique SMTP_USER y SMTP_PASS en .env o Vercel).',
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return { transporter, smtpUser };
}

/**
 * Acción del Servidor: Orquestador para la actualización de estatus de becas.
 * Permite gestionar y dictaminar solicitudes en curso sin importar su periodo de origen,
 * evaluando cupos contra el periodo vigente actual y sincronizando la lista de espera.
 */
export async function actualizarEstatusBeca(
  id: number,
  nuevoEstatus: string,
  observaciones?: string,
  confirmacionEspecial: boolean = false,
  departamentoAsignado?: string
): Promise<ResultadoActualizacionEstatus> {
  try {
    // 1. SEGURIDAD: Verificación real del actor en base de datos
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    const matchId = sessionToken?.match(/(\d+)$/);
    const adminId = matchId ? parseInt(matchId[1], 10) : NaN;

    if (!Number.isInteger(adminId) || adminId <= 0) {
      return { error: "Acceso denegado: Se requiere una sesión institucional válida." };
    }

    const [actorRows] = await db.execute<ActorUsuarioRow[]>(
      'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (actorRows.length === 0) {
      return { error: "Acceso denegado: Usuario no encontrado." };
    }

    const actor = actorRows[0];
    const emailActor = String(actor.email || '').trim().toLowerCase();
    const esSecretariaGeneral =
      actor.role === 'secretaria' || emailActor === EMAIL_SECRETARIA_GENERAL;
    const esCoordinacion = actor.role === 'admin' && !esSecretariaGeneral;

    if (!esSecretariaGeneral && !esCoordinacion) {
      return { error: "Acceso denegado: Se requieren permisos de Coordinación o Secretaría General." };
    }

    // 2. VALIDACIÓN DE DATOS DE ENTRADA
    if (!id || !ESTATUS_VALIDOS.includes(nuevoEstatus)) {
      return { error: "Los datos de la solicitud o el estatus proporcionado no son válidos." };
    }

    const observacionesLimpias =
      observaciones && observaciones.trim() !== '' ? observaciones.trim() : null;

    // 3. CONSULTA DEL ESTADO ACTUAL Y PERIODO VIGENTE
    const [solRowsResult, periodoActualRaw] = await Promise.all([
      db.execute<SolicitudEstadoRow[]>(
        `
        SELECT s.user_id, s.estatus, s.periodo_id, IFNULL(st.beca_perdida, 0) AS beca_perdida
        FROM solicitudes s
        JOIN students st ON s.user_id = st.id
        WHERE s.id = ?
        LIMIT 1
        `,
        [Number(id)]
      ),
      obtenerOCrearPeriodoObjetivo(),
    ]);

    const [solRows] = solRowsResult;
    if (solRows.length === 0) {
      return { error: "La solicitud indicada no existe en el sistema." };
    }

    const sol = solRows[0];
    const periodoActualId = Number(periodoActualRaw) || Number(sol.periodo_id);

    if (esCoordinacion) {
      const esSoloReasignacionDepto =
        sol.estatus === 'Aprobada' && nuevoEstatus === 'Aprobada';

      if (
        (nuevoEstatus === 'Aprobada' || nuevoEstatus === 'Rechazada') &&
        !esSoloReasignacionDepto
      ) {
        return {
          error:
            "Acción restringida: La Coordinación únicamente realiza gestión y auditoría. La aprobación o rechazo corresponde exclusivamente a Secretaría General.",
        };
      }
    }

    if (esSecretariaGeneral) {
      if (sol.estatus !== 'En Revisión') {
        return {
          error:
            "Acción restringida: Secretaría General solo puede dictaminar expedientes que se encuentren en estatus 'En Revisión'.",
        };
      }

      if (nuevoEstatus !== 'Aprobada' && nuevoEstatus !== 'Rechazada') {
        return {
          error:
            "Acción restringida: Secretaría General únicamente emite dictámenes de Aprobación o Rechazo.",
        };
      }
    }

    // 4. BLOQUEO DEFINITIVO POR RECHAZO PREVIO Y VALIDACIÓN DE CUPOS EN EL PERIODO VIGENTE
    if (nuevoEstatus === 'Aprobada') {
      const yaEstabaAprobada = sol.estatus === 'Aprobada';

      if (!yaEstabaAprobada) {
        if (Number(sol.beca_perdida) === 1) {
          return {
            error:
              "El estudiante posee un rechazo definitivo previo (beca perdida) y no puede optar nuevamente por ninguna beca o ayuda económica.",
          };
        }

        // Siempre valida contra el periodo actual donde se están habilitando los cupos
        const diagnostico = await validarCuposYRequisitos(Number(id), periodoActualId);

        if (diagnostico.codigo === 'BECA_PERDIDA') {
          return {
            error: diagnostico.mensaje,
          };
        }

        const esRenovacion = sol.estatus === 'Renovacion';
        const saltarValidacionCupo = esRenovacion && diagnostico.codigo === 'CUPO_EXCEDIDO';

        if (!diagnostico.apto && !confirmacionEspecial && !saltarValidacionCupo) {
          return {
            error: "REGLAMENTO_INCUMPLIDO",
            code: diagnostico.codigo,
            message: diagnostico.mensaje,
          };
        }
      }
    }

    // 5. DELEGACIÓN TRANSACCIONAL (promueve solicitudes en cola al periodo vigente si aplica)
    const resultado = await registrarDecisionEnHistorial(
      Number(id),
      nuevoEstatus,
      adminId,
      observacionesLimpias,
      '127.0.0.1',
      undefined,
      departamentoAsignado,
      periodoActualId
    );

    // 6. NOTIFICACIÓN OMNICANAL SI ES CONVOCATORIA A ENTREVISTA
    let emailEnviado: boolean | undefined = undefined;
    let emailError: string | undefined = undefined;

    if (resultado.success && nuevoEstatus === 'Convocado a Entrevista') {
      emailEnviado = false;

      try {
        const { transporter, smtpUser, errorConfig } = crearTransporterSMTP();

        if (!transporter) {
          emailError = errorConfig;
          console.error("⚠️ Advertencia SMTP:", errorConfig);
        } else {
          const [estudianteRows] = await db.execute<EstudianteCorreoRow[]>(
            `
            SELECT 
              IFNULL(NULLIF(TRIM(s.email_institucional), ''), st.email) AS email_destino,
              st.nombre,
              st.apellido,
              s.tipo_beca
            FROM solicitudes s
            JOIN students st ON s.user_id = st.id
            WHERE s.id = ?
            LIMIT 1
            `,
            [Number(id)]
          );

          if (estudianteRows.length === 0) {
            emailError = 'No se encontró el expediente del estudiante para enviar el correo.';
          } else {
            const est = estudianteRows[0];
            const emailDestino = est.email_destino ? est.email_destino.trim() : '';

            if (!emailDestino) {
              emailError = 'El estudiante no tiene un correo electrónico registrado.';
            } else {
              const nombreSeguro = escaparHtml(`${est.nombre} ${est.apellido}`.trim());
              const becaSegura = escaparHtml(est.tipo_beca || 'Beca Institucional');
              const bloqueInstruccionesHtml = observacionesLimpias
                ? `
                  <div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-left: 4px solid #d4a843; padding: 15px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a5f;">
                      Instrucciones de Citación:
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1e293b;">
                      ${escaparHtml(observacionesLimpias).replace(/\r?\n/g, '<br />')}
                    </p>
                  </div>
                `
                : `
                  <div style="background-color: #f8fafc; border-left: 4px solid #d4a843; padding: 15px; margin: 20px 0; border-radius: 6px;">
                    <p style="margin: 0; font-weight: bold; color: #1e3a5f;">
                      Debe presentarse a la brevedad posible en el Departamento de Bienestar Estudiantil para realizar su entrevista socioeconómica.
                    </p>
                  </div>
                `;

              await transporter.sendMail({
                from: `"Comité de Becas UNIMAR" <${smtpUser}>`,
                to: emailDestino,
                subject: 'Convocatoria a Entrevista Socioeconómica - Becas UNIMAR',
                html: `
                  <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e3a5f; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #1e3a5f; border-bottom: 3px solid #d4a843; padding-bottom: 10px; margin-top: 0;">
                      Universidad de Margarita (UNIMAR)
                    </h2>
                    <p style="font-size: 14px;">Estimado/a <strong>${nombreSeguro}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.5;">
                      Su postulación para <strong>${becaSegura}</strong> ha sido seleccionada para la fase de evaluación presencial.
                    </p>
                    ${bloqueInstruccionesHtml}
                    <p style="font-size: 13px; color: #475569; line-height: 1.5;">
                      También puede consultar esta citación e instrucciones ingresando a su perfil estudiantil en el portal de Becas UNIMAR.
                    </p>
                    <p style="margin-top: 28px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                      Atentamente,<br />
                      <strong>Dirección de Bienestar Estudiantil - UNIMAR</strong>
                    </p>
                  </div>
                `,
              });

              emailEnviado = true;
            }
          }
        }
      } catch (err: unknown) {
        const smtpErr = err as Error;
        emailError = smtpErr.message || 'Fallo de autenticación o conexión con el servidor SMTP.';
        console.error(
          "⚠️ Advertencia: No se pudo despachar el correo de convocatoria, pero el estatus cambió en la BD:",
          smtpErr
        );
      }
    }

    // 7. FINALIZACIÓN Y REVALIDACIÓN DE CACHÉ (Admin + Reportes + Portal Estudiante)
    if (resultado.success) {
      revalidatePath('/admin/solicitudes');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/analiticas');
      revalidatePath('/admin/reportes');
      revalidatePath('/admin/socioeconomico');
      revalidatePath('/admin/validarBeca');
      revalidatePath('/perfil');
      revalidatePath('/');

      return {
        success: true,
        message:
          nuevoEstatus === 'Convocado a Entrevista'
            ? emailEnviado
              ? 'Estudiante convocado y correo de citación enviado correctamente.'
              : 'Estudiante convocado en el sistema, pero no se pudo enviar el correo electrónico.'
            : `Estatus actualizado a ${nuevoEstatus} correctamente.`,
        token: resultado.token,
        emailEnviado,
        emailError,
      };
    }

    return { error: "No se pudo procesar la actualización en el servidor." };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("❌ Error crítico en el orquestador de estatus:", err);
    return {
      error: "Error de comunicación con el motor de base de datos. Intente nuevamente.",
    };
  }
}