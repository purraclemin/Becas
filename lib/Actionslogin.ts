// lib/Actionslogin.ts
'use server'

import { db } from './db'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  let userFound = null;

  try {
    const [rows]: any = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    userFound = rows[0]
  } catch (e) {
    console.error("Error de base de datos:", e)
    return { error: 'Error al conectar con la base de datos.' }
  }

  // Verificamos credenciales
  if (userFound && userFound.password === password) {
    const cookieStore = await cookies() 
    
    // 1. Establecemos las cookies
    cookieStore.set('session_token', 'active_session_' + userFound.id, { 
      path: '/', // IMPORTANTE: Para que sea accesible en todas las rutas
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 
    })
    
    cookieStore.set('user_role', userFound.role, { 
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })

    // 2. Determinamos la ruta según el rol
    let targetPath = '/Solicitud'
    if (userFound.role === 'admin') {
      targetPath = '/admin/dashboard'
    }

    // 3. Redirección final
    // NOTA: redirect() debe ser lo ÚLTIMO que se ejecute y estar fuera de bloques try/catch
    redirect(targetPath)

  } else {
    return { error: 'Correo o contraseña incorrectos.' }
  }
}