'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { registrarDecisionEnHistorial } from './ActionsEstatusBecaSQL'
import { validarCuposYRequisitos } from './ActionsBecaValidators'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { ejecutarRotacionExcelenciaEnPeriodo } from './ActionsGestionEspecial'
import { enviarCorreoCambioEstatusPorSolicitudId } from './EmailNotificacionesBeca'
import { SISTEMA_ADMIN_ID } from './RecordAcademicoUtils'
import { db } from './db'

const ESTATUS_VALIDOS: ReadonlyArray<string> = [
  'Pendiente',
  'Convocado a Entrevista',
  'En Revisión',
  'Aprobada',
  'Rechazada',
  'Finalizada',
];

const EMAIL_SECRETARIA_GENERAL = 'secretariageneral@unimar.edu.ve';

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

/**
 * Acción del Servidor: Orquestador para la actualización de estatus de becas.
 * - Sincroniza automáticamente la Nómina de Excelencia en dictámenes de Aprobada/Rechazada/Finalizada.
 * - Envía notificación institucional por correo al estudiante en CADA cambio de estatus
 *   (y en reasignaciones de departamento) sin revertir la base de datos si el servidor SMTP falla.
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
      return { error: 'Acceso denegado: Se requiere una sesión institucional válida.' };
    }

    const [actorRows] = await db.execute<ActorUsuarioRow[]>(
      'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
      [adminId]
    );

    if (actorRows.length === 0) {
      return { error: 'Acceso denegado: Usuario no encontrado.' };
    }

    const actor = actorRows[0];
    const emailActor = String(actor.email || '').trim().toLowerCase();
    const esSecretariaGeneral =
      actor.role === 'secretaria' || emailActor === EMAIL_SECRETARIA_GENERAL;
    const esCoordinacion = actor.role === 'admin' && !esSecretariaGeneral;

    if (!esSecretariaGeneral && !esCoordinacion) {
      return { error: 'Acceso denegado: Se requieren permisos de Coordinación o Secretaría General.' };
    }

    // 2. VALIDACIÓN DE DATOS DE ENTRADA
    if (!id || !ESTATUS_VALIDOS.includes(nuevoEstatus)) {
      return { error: 'Los datos de la solicitud o el estatus proporcionado no son válidos.' };
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
      return { error: 'La solicitud indicada no existe en el sistema.' };
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
            'Acción restringida: La Coordinación únicamente realiza gestión y auditoría. La aprobación o rechazo corresponde exclusivamente a Secretaría General.',
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
            'Acción restringida: Secretaría General únicamente emite dictámenes de Aprobación o Rechazo.',
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
              'El estudiante posee un rechazo definitivo previo (beca perdida) y no puede optar nuevamente por ninguna beca o ayuda económica.',
          };
        }

        const diagnostico = await validarCuposYRequisitos(Number(id), periodoActualId);

        if (diagnostico.codigo === 'BECA_PERDIDA') {
          return {
            error: diagnostico.mensaje,
            code: diagnostico.codigo,
          };
        }

        // Bloqueo estricto de cupos llenos en el servidor (sin bypass por confirmacionEspecial)
        if (diagnostico.codigo === 'CUPO_EXCEDIDO') {
          return {
            error: diagnostico.mensaje,
            code: diagnostico.codigo,
          };
        }

        if (!diagnostico.apto && !confirmacionEspecial) {
          return {
            error: 'REGLAMENTO_INCUMPLIDO',
            code: diagnostico.codigo,
            message: diagnostico.mensaje,
          };
        }
      }
    }

    // 5. DELEGACIÓN TRANSACCIONAL
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

    // 6. SINCRONIZACIÓN AUTOMÁTICA DE NÓMINA DE EXCELENCIA AL APROBAR, RECHAZAR O FINALIZAR
    if (
      resultado.success &&
      (nuevoEstatus === 'Aprobada' ||
        nuevoEstatus === 'Rechazada' ||
        nuevoEstatus === 'Finalizada')
    ) {
      try {
        await ejecutarRotacionExcelenciaEnPeriodo(periodoActualId, SISTEMA_ADMIN_ID);
      } catch (rotErr) {
        console.error('⚠️ Advertencia sincronizando Nómina de Excelencia tras dictamen:', rotErr);
      }
    }

    // 7. NOTIFICACIÓN AUTOMÁTICA POR CORREO AL ESTUDIANTE EN CADA CAMBIO DE ESTATUS
    let emailEnviado: boolean | undefined = undefined;
    let emailError: string | undefined = undefined;

    if (resultado.success) {
      const envio = await enviarCorreoCambioEstatusPorSolicitudId({
        solicitudId: Number(id),
        nuevoEstatus,
        estatusPrevio: sol.estatus,
        observaciones: resultado.observacionRegistrada ?? observacionesLimpias,
        departamentoAsignado: departamentoAsignado ?? null,
        departamentoAnterior: resultado.departamentoAnterior ?? null,
      });
      emailEnviado = envio.emailEnviado;
      emailError = envio.emailError;
    }

    // 8. REVALIDACIÓN DE CACHÉ
    if (resultado.success) {
      revalidatePath('/admin/solicitudes');
      revalidatePath('/admin/dashboard');
      revalidatePath('/admin/analiticas');
      revalidatePath('/admin/estudiantes');
      revalidatePath('/admin/reportes');
      revalidatePath('/admin/socioeconomico');
      revalidatePath('/admin/validarBeca');
      revalidatePath('/perfil');
      revalidatePath('/');

      const esCambioDepto = sol.estatus === 'Aprobada' && nuevoEstatus === 'Aprobada';
      const mensajeFinal = esCambioDepto
        ? emailEnviado
          ? 'Departamento reasignado y notificado por correo electrónico al estudiante.'
          : 'Departamento reasignado en el sistema, pero no se pudo enviar el correo electrónico.'
        : nuevoEstatus === 'Convocado a Entrevista'
          ? emailEnviado
            ? 'Estudiante convocado y correo de citación enviado correctamente.'
            : 'Estudiante convocado en el sistema, pero no se pudo enviar el correo electrónico.'
          : emailEnviado
            ? `Estatus actualizado a ${nuevoEstatus} y notificado por correo electrónico al estudiante.`
            : `Estatus actualizado a ${nuevoEstatus} en el sistema, pero no se pudo enviar el correo electrónico.`;

      return {
        success: true,
        message: mensajeFinal,
        token: resultado.token,
        emailEnviado,
        emailError,
      };
    }

    return { error: 'No se pudo procesar la actualización en el servidor.' };
  } catch (error: unknown) {
    console.error('❌ Error crítico en el orquestador de estatus:', error);
    return {
      error: 'Error de comunicación con el motor de base de datos. Intente nuevamente.',
    };
  }
}
