'use server'

import type { RowDataPacket } from 'mysql2/promise'
import nodemailer from 'nodemailer'
import { db } from './db'

type MailTransporter = ReturnType<typeof nodemailer.createTransport>

interface EstudianteCorreoRow extends RowDataPacket {
  email_destino: string | null;
  nombre: string;
  apellido: string;
  tipo_beca: string | null;
  departamento_asignado: string | null;
}

interface PlantillaCorreoEstatus {
  asunto: string;
  html: string;
}

export interface ResultadoEnvioCorreoEstatus {
  emailEnviado: boolean;
  emailError?: string;
}

export interface ParamsCorreoCambioEstatusDirecto {
  emailDestino: string;
  nombreCompleto: string;
  tipoBeca: string;
  nuevoEstatus: string;
  estatusPrevio: string;
  observaciones?: string | null;
  departamentoAsignado?: string | null;
  departamentoAnterior?: string | null;
}

export interface ParamsCorreoCambioEstatusSolicitud {
  solicitudId: number;
  nuevoEstatus: string;
  estatusPrevio: string;
  observaciones?: string | null;
  departamentoAsignado?: string | null;
  departamentoAnterior?: string | null;
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
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return { transporter, smtpUser };
}

function construirPlantillaCorreoEstatus(params: {
  nombreCompleto: string;
  tipoBeca: string;
  nuevoEstatus: string;
  estatusPrevio: string;
  observaciones: string | null;
  departamentoAsignado: string | null;
  departamentoAnterior: string | null;
}): PlantillaCorreoEstatus {
  const nombreSeguro = escaparHtml(params.nombreCompleto || 'Estudiante');
  const becaSegura = escaparHtml(params.tipoBeca || 'Beca Institucional');
  const estatusSeguro = escaparHtml(params.nuevoEstatus);
  const obsLimpias = params.observaciones ? params.observaciones.trim() : '';
  const deptoLimpio = params.departamentoAsignado
    ? params.departamentoAsignado.trim()
    : '';
  const deptoAnteriorLimpio = params.departamentoAnterior
    ? params.departamentoAnterior.trim()
    : '';
  const esReasignacionDepto =
    params.estatusPrevio === 'Aprobada' && params.nuevoEstatus === 'Aprobada';

  let asunto = `Actualización de Solicitud (${params.nuevoEstatus}) — Becas UNIMAR`;
  let badgeBg = '#e2e8f0';
  let badgeColor = '#1e3a5f';
  let tituloObservaciones = 'Observaciones de Bienestar Estudiantil';
  let cuerpoPrincipal = `Le informamos que el estatus de su solicitud para <strong>${becaSegura}</strong> ha sido actualizado a <strong>${estatusSeguro}</strong>.`;
  let bloqueAdicionalHtml = '';

  switch (params.nuevoEstatus) {
    case 'Pendiente': {
      asunto = 'Solicitud en Cola de Evaluación (Pendiente) — Becas UNIMAR';
      badgeBg = '#fef3c7';
      badgeColor = '#92400e';
      tituloObservaciones = 'Observaciones de Coordinación';
      cuerpoPrincipal = `Su postulación para <strong>${becaSegura}</strong> se encuentra registrada en estatus <strong>Pendiente</strong> de evaluación inicial por parte de la Dirección de Bienestar Estudiantil.`;
      break;
    }

    case 'Convocado a Entrevista': {
      asunto = 'Convocatoria a Entrevista Socioeconómica — Becas UNIMAR';
      badgeBg = '#ffedd5';
      badgeColor = '#9a3412';
      tituloObservaciones = 'Instrucciones de Citación';
      cuerpoPrincipal = `Su postulación para <strong>${becaSegura}</strong> ha sido seleccionada para la fase de <strong>evaluación presencial (Entrevista Socioeconómica)</strong>.`;
      if (!obsLimpias) {
        bloqueAdicionalHtml = `
          <div style="background-color: #f8fafc; border-left: 4px solid #d4a843; padding: 14px 16px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; font-weight: bold; color: #1e3a5f; line-height: 1.5;">
              Debe presentarse a la brevedad posible en el Departamento de Bienestar Estudiantil para realizar su entrevista socioeconómica.
            </p>
          </div>
        `;
      }
      break;
    }

    case 'En Revisión': {
      asunto = 'Expediente Remitido a Secretaría General (En Revisión) — Becas UNIMAR';
      badgeBg = '#dbeafe';
      badgeColor = '#1e40af';
      tituloObservaciones = 'Observaciones de Auditoría';
      cuerpoPrincipal = `Su expediente para <strong>${becaSegura}</strong> completó la evaluación socioeconómica en Bienestar Estudiantil y ha sido remitido en estatus <strong>En Revisión</strong> a <strong>Secretaría General</strong> para su dictamen final.`;
      break;
    }

    case 'Aprobada': {
      asunto = esReasignacionDepto
        ? 'Actualización de Departamento Asignado — Becas UNIMAR'
        : '¡Felicitaciones! Su Beca ha sido Aprobada — Becas UNIMAR';
      badgeBg = esReasignacionDepto ? '#e0e7ff' : '#d1fae5';
      badgeColor = esReasignacionDepto ? '#3730a3' : '#065f46';
      tituloObservaciones = esReasignacionDepto
        ? 'Detalles de la Reasignación'
        : 'Observaciones del Dictamen';
      cuerpoPrincipal = esReasignacionDepto
        ? `Le informamos que se ha actualizado el departamento de adscripción correspondiente a su beneficio vigente en <strong>${becaSegura}</strong>.`
        : `Nos complace informarle que su postulación para <strong>${becaSegura}</strong> ha sido <strong>APROBADA</strong> oficialmente para el periodo académico vigente.`;

      if (esReasignacionDepto && deptoLimpio) {
        bloqueAdicionalHtml = `
          <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; border-left: 4px solid #4338ca; padding: 14px 16px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #3730a3;">
              Reasignación de Departamento Institucional:
            </p>
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1e3a5f;">
              ${escaparHtml(deptoAnteriorLimpio || 'Sin asignar')} &rarr; ${escaparHtml(deptoLimpio)}
            </p>
          </div>
        `;
      } else if (deptoLimpio) {
        bloqueAdicionalHtml = `
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-left: 4px solid #059669; padding: 14px 16px; margin: 18px 0; border-radius: 6px;">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #065f46;">
              Departamento de Adscripción Asignado:
            </p>
            <p style="margin: 0; font-size: 15px; font-weight: bold; color: #1e3a5f;">
              ${escaparHtml(deptoLimpio)}
            </p>
          </div>
        `;
      }
      break;
    }

    case 'Rechazada': {
      asunto = 'Resultado de Postulación / Beneficio (No Favorable) — Becas UNIMAR';
      badgeBg = '#ffe4e6';
      badgeColor = '#9f1239';
      tituloObservaciones = 'Motivo / Observaciones del Dictamen';
      cuerpoPrincipal = `Le informamos que su expediente correspondiente a <strong>${becaSegura}</strong> ha recibido estatus <strong>Rechazada</strong> conforme a la evaluación institucional vigente.`;
      break;
    }

    case 'Finalizada': {
      asunto = 'Cierre de Ciclo Académico del Beneficio (Finalizada) — Becas UNIMAR';
      badgeBg = '#ccfbf1';
      badgeColor = '#115e59';
      tituloObservaciones = 'Motivo de Finalización';
      cuerpoPrincipal = `Le informamos que su beneficio correspondiente a <strong>${becaSegura}</strong> ha sido marcado como <strong>Finalizada</strong> (cierre formal sin sanción académica ni disciplinaria).`;
      break;
    }
  }

  const bloqueObservacionesHtml = obsLimpias
    ? `
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #d4a843; padding: 14px 16px; margin: 18px 0; border-radius: 6px;">
        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #1e3a5f;">
          ${escaparHtml(tituloObservaciones)}:
        </p>
        <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #1e293b;">
          ${escaparHtml(obsLimpias).replace(/\r?\n/g, '<br />')}
        </p>
      </div>
    `
    : '';

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 620px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #1e3a5f; padding: 20px 24px; border-bottom: 4px solid #d4a843;">
        <h2 style="margin: 0; color: #ffffff; font-size: 18px;">Universidad de Margarita (UNIMAR)</h2>
        <p style="margin: 5px 0 0 0; color: #d4a843; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em;">
          Dirección de Bienestar Estudiantil — Sistema de Gestión de Becas
        </p>
      </div>

      <div style="padding: 24px;">
        <p style="font-size: 14px; margin-top: 0;">Estimado/a <strong>${nombreSeguro}</strong>,</p>

        <div style="margin: 14px 0 18px 0;">
          <span style="display: inline-block; padding: 5px 12px; border-radius: 999px; background-color: ${badgeBg}; color: ${badgeColor}; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">
            Estatus actual: ${estatusSeguro}
          </span>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          ${cuerpoPrincipal}
        </p>

        ${bloqueAdicionalHtml}
        ${bloqueObservacionesHtml}

        <p style="font-size: 13px; color: #475569; line-height: 1.5; margin-top: 18px;">
          Puede verificar el detalle actualizado de su expediente ingresando a su perfil estudiantil en la Plataforma de Becas UNIMAR.
        </p>

        <p style="margin-top: 26px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Atentamente,<br />
          <strong>Dirección de Bienestar Estudiantil — Universidad de Margarita</strong>
        </p>
      </div>
    </div>
  `;

  return { asunto, html };
}

/**
 * Envía el correo institucional al estudiante con datos directos (no bloqueante: nunca lanza excepción).
 */
export async function enviarCorreoCambioEstatusDirecto(
  params: ParamsCorreoCambioEstatusDirecto
): Promise<ResultadoEnvioCorreoEstatus> {
  try {
    const emailDestino = (params.emailDestino || '').trim();
    if (!emailDestino) {
      return {
        emailEnviado: false,
        emailError: 'El estudiante no tiene un correo electrónico registrado.',
      };
    }

    const { transporter, smtpUser, errorConfig } = crearTransporterSMTP();
    if (!transporter) {
      return {
        emailEnviado: false,
        emailError: errorConfig,
      };
    }

    const plantilla = construirPlantillaCorreoEstatus({
      nombreCompleto: params.nombreCompleto,
      tipoBeca: params.tipoBeca,
      nuevoEstatus: params.nuevoEstatus,
      estatusPrevio: params.estatusPrevio,
      observaciones: params.observaciones ?? null,
      departamentoAsignado: params.departamentoAsignado ?? null,
      departamentoAnterior: params.departamentoAnterior ?? null,
    });

    await transporter.sendMail({
      from: `"Comité de Becas UNIMAR" <${smtpUser}>`,
      to: emailDestino,
      subject: plantilla.asunto,
      html: plantilla.html,
    });

    return { emailEnviado: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : 'Fallo de autenticación o conexión con el servidor SMTP.';
    console.error(
      `⚠️ Advertencia SMTP al notificar estatus "${params.nuevoEstatus}":`,
      err
    );
    return {
      emailEnviado: false,
      emailError: message,
    };
  }
}

/**
 * Busca los datos del expediente por `solicitudId` y envía la notificación institucional
 * por correo electrónico al estudiante. Nunca revierte la BD ante fallos SMTP.
 */
export async function enviarCorreoCambioEstatusPorSolicitudId(
  params: ParamsCorreoCambioEstatusSolicitud
): Promise<ResultadoEnvioCorreoEstatus> {
  try {
    const [estudianteRows] = await db.execute<EstudianteCorreoRow[]>(
      `
      SELECT 
        IFNULL(NULLIF(TRIM(s.email_institucional), ''), st.email) AS email_destino,
        st.nombre,
        st.apellido,
        s.tipo_beca,
        s.departamento_asignado
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [Number(params.solicitudId)]
    );

    if (estudianteRows.length === 0) {
      return {
        emailEnviado: false,
        emailError: 'No se encontró el expediente del estudiante para enviar el correo.',
      };
    }

    const est = estudianteRows[0];
    const deptoEfectivo =
      (params.departamentoAsignado && params.departamentoAsignado.trim() !== ''
        ? params.departamentoAsignado.trim()
        : est.departamento_asignado?.trim()) || null;

    return await enviarCorreoCambioEstatusDirecto({
      emailDestino: est.email_destino ? est.email_destino.trim() : '',
      nombreCompleto: `${est.nombre} ${est.apellido}`.trim(),
      tipoBeca: est.tipo_beca || 'Beca Institucional',
      nuevoEstatus: params.nuevoEstatus,
      estatusPrevio: params.estatusPrevio,
      observaciones: params.observaciones ?? null,
      departamentoAsignado: deptoEfectivo,
      departamentoAnterior: params.departamentoAnterior ?? null,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error consultando destinatario del correo.';
    console.error('⚠️ Advertencia en enviarCorreoCambioEstatusPorSolicitudId:', err);
    return {
      emailEnviado: false,
      emailError: message,
    };
  }
}
