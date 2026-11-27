'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { queryFresh } from './db'

export type UserRole = 'estudiante' | 'admin' | 'secretaria'
export type PerfilAutoridad = 'estudiante' | 'coordinacion' | 'secretaria_general'

const EMAIL_SECRETARIA_GENERAL = 'secretariageneral@unimar.edu.ve'
const SEMESTRE_EGRESADO = 13
const OBSERVACION_EGRESADO = 'Acabó su periodo académico'

interface AccountRoleRow extends RowDataPacket {
  id: number;
  email: string | null;
  role: UserRole;
}

interface StudentSessionRow extends RowDataPacket {
  student_pk: number;
  nombre: string;
  apellido: string;
  carrera: string;
  semestre: number;
  cedula: string;
  email: string | null;
  indice_global: number | string | null;
  beca_perdida: number;
}

interface LatestSolicitudRow extends RowDataPacket {
  estatus_reciente: string | null;
  materias_json: string | null;
  observaciones_admin: string | null;
  departamento_asignado: string | null;
  tipo_beca: string | null;
}

interface RechazoPrevioRow extends RowDataPacket {
  id: number;
  observaciones_admin: string | null;
}

export async function getSession() {
  noStore();

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) return { isLoggedIn: false as const };

  try {
    const matchId = sessionToken.match(/(\d+)$/);
    const userId = matchId ? parseInt(matchId[1], 10) : NaN;

    if (!Number.isInteger(userId) || userId < 0) {
      return { isLoggedIn: false as const };
    }

    const accountRows = await queryFresh<AccountRoleRow[]>(
      'SELECT id, email, role FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (accountRows.length === 0) {
      return { isLoggedIn: false as const };
    }

    const account = accountRows[0];
    const realRole = account.role;
    const emailNormalizado = String(account.email || '').trim().toLowerCase();
    const esSecretariaGeneral =
      realRole === 'secretaria' || emailNormalizado === EMAIL_SECRETARIA_GENERAL;

    if (realRole === 'estudiante' && !esSecretariaGeneral) {
      const userRows = await queryFresh<StudentSessionRow[]>(
        `
          SELECT
            st.id AS student_pk,
            st.nombre,
            st.apellido,
            st.carrera,
            st.semestre,
            st.cedula,
            st.email,
            IFNULL(st.indice_global, 0.00) AS indice_global,
            IFNULL(st.beca_perdida, 0) AS beca_perdida
          FROM students st
          WHERE st.id = ?
          LIMIT 1
        `,
        [userId]
      );

      if (userRows.length === 0) {
        return {
          isLoggedIn: true as const,
          role: realRole,
          perfilAutoridad: 'estudiante' as const,
          esSecretariaGeneral: false,
          email: account.email ?? '',
          id: userId,
          perfilIncompleto: true,
        };
      }

      const s = userRows[0];
      const semestreNum = Number(s.semestre);
      const esEgresado = semestreNum >= SEMESTRE_EGRESADO;

      let estatusReciente = 'ninguna';
      let materiasArray: unknown = [];
      let observacionesAdmin: string | null = null;
      let departamentoAsignado: string | null = null;
      let tipoBeca: string | null = null;
      let becaPerdida = Number(s.beca_perdida) === 1;

      try {
        const [solRows, rechazoRows] = await Promise.all([
          queryFresh<LatestSolicitudRow[]>(
            `
              SELECT
                sol.estatus AS estatus_reciente,
                sol.materias_json,
                sol.observaciones_admin,
                NULLIF(TRIM(sol.departamento_asignado), '') AS departamento_asignado,
                sol.tipo_beca
              FROM solicitudes sol
              LEFT JOIN periodos_academicos p ON sol.periodo_id = p.id
              WHERE sol.user_id = ?
                AND (
                  p.fecha_inicio IS NULL
                  OR p.fecha_inicio <= IFNULL(
                    (SELECT p_lim.fecha_inicio FROM periodos_academicos p_lim WHERE p_lim.es_actual = 1 LIMIT 1),
                    '9999-12-31'
                  )
                )
              ORDER BY sol.periodo_id DESC, sol.fecha_registro DESC, sol.id DESC
              LIMIT 1
            `,
            [userId]
          ),
          queryFresh<RechazoPrevioRow[]>(
            `
              SELECT id, observaciones_admin
              FROM solicitudes
              WHERE user_id = ?
                AND LOWER(TRIM(estatus)) IN ('rechazada', 'rechazado')
              ORDER BY id DESC
              LIMIT 1
            `,
            [userId]
          ),
        ]);

        if (solRows.length > 0) {
          estatusReciente = solRows[0].estatus_reciente || 'ninguna';
          observacionesAdmin = solRows[0].observaciones_admin
            ? String(solRows[0].observaciones_admin).trim()
            : null;
          departamentoAsignado = solRows[0].departamento_asignado
            ? String(solRows[0].departamento_asignado).trim()
            : null;
          tipoBeca = solRows[0].tipo_beca
            ? String(solRows[0].tipo_beca).trim()
            : null;
          if (solRows[0].materias_json) {
            materiasArray = JSON.parse(solRows[0].materias_json);
          }
        }

        if (becaPerdida || rechazoRows.length > 0) {
          becaPerdida = true;
          estatusReciente = 'Rechazada';
          departamentoAsignado = null;
          if (!observacionesAdmin && rechazoRows[0]?.observaciones_admin) {
            observacionesAdmin = String(rechazoRows[0].observaciones_admin).trim();
          }
        } else if (esEgresado && estatusReciente === 'Finalizada' && !observacionesAdmin) {
          observacionesAdmin = OBSERVACION_EGRESADO;
        }
      } catch (solError) {
        console.error('⚠️ Advertencia leyendo solicitud reciente en sesión:', solError);
      }

      const puedePostular =
        !becaPerdida &&
        !esEgresado &&
        (estatusReciente === 'ninguna' || estatusReciente === 'Finalizada');

      return {
        isLoggedIn: true as const,
        id: userId,
        studentId: Number(s.student_pk),
        role: 'estudiante' as const,
        perfilAutoridad: 'estudiante' as const,
        esSecretariaGeneral: false,

        nombre: `${s.nombre} ${s.apellido}`,
        cedula: s.cedula,
        email: s.email ?? '',

        carrera: s.carrera,
        trimestre: semestreNum,
        semestre: semestreNum,
        esEgresado,
        puedePostular,
        indiceGlobal: Number(s.indice_global ?? 0),

        estatus: estatusReciente,
        estatusBeca: estatusReciente,
        becaPerdida,
        observacionesAdmin,
        departamentoAsignado,
        tipoBeca,
        materias: materiasArray,
      };
    }

    const perfilAutoridad: PerfilAutoridad = esSecretariaGeneral
      ? 'secretaria_general'
      : 'coordinacion';

    return {
      isLoggedIn: true as const,
      role: realRole,
      perfilAutoridad,
      esSecretariaGeneral,
      email: account.email ?? '',
      id: userId,
    };
  } catch (error) {
    console.error('❌ Error de sesión:', error);
    return { isLoggedIn: false as const };
  }
}