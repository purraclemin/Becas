'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { cookies } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { queryFresh } from './db'

export type UserRole = 'estudiante' | 'admin' | 'secretaria'
export type PerfilAutoridad = 'estudiante' | 'coordinacion' | 'secretaria_general'

const EMAIL_SECRETARIA_GENERAL = 'secretariageneral@unimar.edu.ve'

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
}

interface LatestSolicitudRow extends RowDataPacket {
  estatus_reciente: string | null;
  materias_json: string | null;
  observaciones_admin: string | null;
}

export async function getSession() {
  noStore(); // Evita caché para datos de sesión

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session_token')?.value;

  // 1. Verificación básica de existencia
  if (!sessionToken) return { isLoggedIn: false as const };

  try {
    // 2. Extracción y Validación Numérica de Identidad
    const matchId = sessionToken.match(/(\d+)$/);
    const userId = matchId ? parseInt(matchId[1], 10) : NaN;

    if (!Number.isInteger(userId) || userId < 0) {
      return { isLoggedIn: false as const };
    }

    // 3. Validación real en la DB (Verificar existencia, correo y ROL legítimo)
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

    // 4. Recuperación de Datos según el Rol Oficial
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
            IFNULL(st.indice_global, 0.00) AS indice_global
          FROM students st
          WHERE st.id = ?
          LIMIT 1
        `,
        [userId]
      );

      // Si el usuario existe en 'users' pero no tiene perfil en 'students'
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

      // Consulta aislada de la última solicitud para no invalidar la sesión ante fallos secundarios
      let estatusReciente = 'ninguna';
      let materiasArray: unknown = [];
      let observacionesAdmin: string | null = null;

      try {
        const solRows = await queryFresh<LatestSolicitudRow[]>(
          `
            SELECT estatus AS estatus_reciente, materias_json, observaciones_admin
            FROM solicitudes
            WHERE user_id = ?
            ORDER BY fecha_registro DESC
            LIMIT 1
          `,
          [userId]
        );

        if (solRows.length > 0) {
          estatusReciente = solRows[0].estatus_reciente || 'ninguna';
          observacionesAdmin = solRows[0].observaciones_admin
            ? String(solRows[0].observaciones_admin).trim()
            : null;
          if (solRows[0].materias_json) {
            materiasArray = JSON.parse(solRows[0].materias_json);
          }
        }
      } catch (solError) {
        console.error('⚠️ Advertencia leyendo solicitud reciente en sesión:', solError);
      }

      // 5. Retorno de Objeto de Sesión Limpio (Estudiante)
      return {
        isLoggedIn: true as const,
        id: userId,
        studentId: Number(s.student_pk),
        role: 'estudiante' as const,
        perfilAutoridad: 'estudiante' as const,
        esSecretariaGeneral: false,

        // Datos de Identidad
        nombre: `${s.nombre} ${s.apellido}`,
        cedula: s.cedula,
        email: s.email ?? '',

        // Datos Académicos Básicos
        carrera: s.carrera,
        trimestre: Number(s.semestre),
        semestre: Number(s.semestre),
        indiceGlobal: Number(s.indice_global ?? 0),

        // Estado Actual
        estatus: estatusReciente,
        estatusBeca: estatusReciente,
        observacionesAdmin,
        materias: materiasArray,
      };
    }

    // Caso Autoridades Institucionales (Coordinación o Secretaría General)
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