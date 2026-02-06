// lib/ActionsSession.ts
'use server'

import { cookies } from 'next/headers'
import { db } from './db' // Asegúrate de tener tu conexión a BD

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session_token')?.value
  const role = cookieStore.get('user_role')?.value
  
  if (!session) return { isLoggedIn: false }

  try {
    // Si es estudiante, buscamos sus datos específicos
    if (role === 'estudiante') {
      // Extraemos el ID del token (suponiendo que guardaste 'active_session_ID')
      const userId = session.split('_')[2] 
      
      const [rows]: any = await db.execute(
        'SELECT nombre, apellido, carrera, semestre FROM students WHERE id = ?',
        [userId]
      )

      if (rows.length > 0) {
        return { 
          isLoggedIn: true, 
          role,
          nombre: `${rows[0].nombre} ${rows[0].apellido}`,
          carrera: rows[0].carrera,
          trimestre: rows[0].semestre
        }
      }
    }

    return { isLoggedIn: true, role }
  } catch (error) {
    return { isLoggedIn: true, role }
  }
}