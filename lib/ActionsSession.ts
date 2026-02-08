'use server'

import { cookies } from 'next/headers'
import { db } from './db' 
import { unstable_noStore as noStore } from 'next/cache'

export async function getSession() {
  noStore(); // Asegura que los cambios de estatus se vean al refrescar
  
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value
  const role = cookieStore.get('user_role')?.value
  
  if (!sessionToken) return { isLoggedIn: false }

  try {
    // Extraemos el ID del token (formato: active_session_ID)
    const userId = sessionToken.split('_').pop(); 

    if (!userId) return { isLoggedIn: false };

    if (role === 'estudiante') {
      /**
       * OPTIMIZACIÓN: Una sola consulta para traer todo.
       * Usamos LEFT JOIN con una subconsulta para obtener solo la solicitud más reciente.
       */
      const query = `
        SELECT 
          st.nombre, st.apellido, st.carrera, st.semestre, st.cedula, st.email,
          sol.estatus as estatus_reciente
        FROM students st
        LEFT JOIN (
          SELECT user_id, estatus 
          FROM solicitudes 
          WHERE user_id = ? 
          ORDER BY fecha_registro DESC 
          LIMIT 1
        ) sol ON st.id = sol.user_id
        WHERE st.id = ?
      `;

      const [rows]: any = await db.execute(query, [userId, userId]);
      
      if (rows.length > 0) {
        const s = rows[0];
        const estatusReal = s.estatus_reciente;

        return { 
          isLoggedIn: true, 
          id: userId,
          role: 'estudiante',
          nombre: `${s.nombre} ${s.apellido}`,
          carrera: s.carrera,
          
          // Compatibilidad con diferentes componentes
          trimestre: s.semestre,
          semestre: s.semestre,
          
          cedula: s.cedula,
          email: s.email,

          // Compatibilidad de estatus
          estatus: estatusReal,
          estatusBeca: estatusReal || 'ninguna'
        }
      }
    }

    // Si es Admin o no se encontró perfil de estudiante, devolvemos sesión básica
    return { isLoggedIn: true, role, id: userId }
    
  } catch (error) {
    console.error("❌ Error crítico en getSession:", error)
    return { isLoggedIn: false }
  }
}