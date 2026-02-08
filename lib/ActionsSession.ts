// lib/ActionsSession.ts
'use server'

import { cookies } from 'next/headers'
import { db } from './db' 

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session_token')?.value
  const role = cookieStore.get('user_role')?.value
  
  if (!sessionToken) return { isLoggedIn: false }

  try {
    const parts = sessionToken.split('_')
    const userId = parts[parts.length - 1] 

    if (role === 'estudiante') {
      
      // 1. Buscamos el ESTATUS en la tabla solicitudes (usando user_id)
      const [solicitudes]: any = await db.execute(
        'SELECT estatus FROM solicitudes WHERE user_id = ? ORDER BY fecha_registro DESC LIMIT 1', 
        [userId]
      )
      const estatusReal = solicitudes.length > 0 ? solicitudes[0].estatus : null

      // 2. Buscamos al ESTUDIANTE en su tabla (usando id = userId)
      // Agregamos 'cedula' y 'email' que son vitales para la página de Solicitud
      const [students]: any = await db.execute(
        'SELECT nombre, apellido, carrera, semestre, cedula, email FROM students WHERE id = ?', 
        [userId]
      )
      
      if (students.length > 0) {
        const s = students[0]
        
        return { 
          isLoggedIn: true, 
          id: userId,
          role: 'estudiante',
          nombre: `${s.nombre} ${s.apellido}`,
          carrera: s.carrera,
          
          // Enviamos el semestre con DOS nombres para que nadie se queje
          trimestre: s.semestre, // Para el Navbar
          semestre: s.semestre,  // Para otras páginas
          
          cedula: s.cedula,      // ¡Vital para la solicitud!
          email: s.email,        // ¡Vital para la solicitud!

          // Enviamos el estatus con DOS nombres también
          estatus: estatusReal,      // Para el Navbar nuevo (UserActions.tsx)
          estatusBeca: estatusReal || 'ninguna' // Para la página de Solicitud antigua
        }
      }
    }

    return { isLoggedIn: true, role, id: userId }
    
  } catch (error) {
    console.error("❌ Error en getSession:", error)
    return { isLoggedIn: false }
  }
}