'use server'

import { cookies } from 'next/headers'
import { db } from './db' 
import { unstable_noStore as noStore } from 'next/cache'

export async function getSession() {
  noStore(); // Evita caché para datos de sesión
  
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value
  
  // 1. Verificación básica de existencia
  if (!sessionToken) return { isLoggedIn: false }

  try {
    // 2. Extracción y Validación Numérica de Identidad
    const rawUserId = sessionToken.split('_').pop(); 
    const userId = rawUserId ? parseInt(rawUserId, 10) : null;

    if (!userId || isNaN(userId)) return { isLoggedIn: false };

    // 3. Validación Reales en la DB (Verificar que el usuario exista y obtener su ROL legítimo)
    const [accountRows]: any = await db.execute(
      'SELECT id, role FROM users WHERE id = ?',
      [userId]
    );

    if (accountRows.length === 0) {
      return { isLoggedIn: false };
    }

    const realRole = accountRows[0].role;

    // 4. Recuperación de Datos según el Rol Oficial
    if (realRole === 'estudiante') {
      const queryUser = `
        SELECT 
          st.id as student_pk, 
          st.nombre, 
          st.apellido, 
          st.carrera, 
          st.semestre, 
          st.cedula, 
          st.email, 
          st.indice_global,
          sol.estatus as estatus_reciente,
          sol.materias_json
        FROM students st
        LEFT JOIN (
          SELECT user_id, estatus, materias_json 
          FROM solicitudes 
          WHERE user_id = ? 
          ORDER BY fecha_registro DESC 
          LIMIT 1
        ) sol ON st.id = sol.user_id
        WHERE st.id = ?
      `;

      const [userRows]: any = await db.execute(queryUser, [userId, userId]);
      
      // Si el usuario existe en 'users' pero no tiene perfil en 'students'
      if (userRows.length === 0) {
        return { isLoggedIn: true, role: realRole, id: userId, perfilIncompleto: true };
      }
      
      const s = userRows[0];

      // Parseo seguro del JSON de materias
      let materiasArray = [];
      try {
        materiasArray = s.materias_json ? JSON.parse(s.materias_json) : [];
      } catch (e) {
        materiasArray = [];
      }

      // 5. Retorno de Objeto de Sesión Limpio
      return { 
        isLoggedIn: true, 
        id: userId,
        studentId: s.student_pk,
        role: 'estudiante',
        
        // Datos de Identidad
        nombre: `${s.nombre} ${s.apellido}`,
        cedula: s.cedula,
        email: s.email,
        
        // Datos Académicos Básicos
        carrera: s.carrera,
        trimestre: s.semestre,     // Para compatibilidad
        semestre: s.semestre,
        indiceGlobal: s.indice_global || 0,
        
        // Estado Actual
        estatus: s.estatus_reciente || 'ninguna',
        estatusBeca: s.estatus_reciente || 'ninguna',
        materias: materiasArray
      }
    }

    // Caso Admin u otros roles oficiales
    return { isLoggedIn: true, role: realRole, id: userId }
    
  } catch (error) {
    console.error("❌ Error de sesión:", error)
    return { isLoggedIn: false }
  }
}