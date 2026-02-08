// lib/ActionsAuth.ts
'use server'

import { db } from './db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

/**
 * Función para iniciar sesión
 * Verifica las credenciales contra la tabla 'users' usando comparación segura
 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // 1. Buscar al usuario por su correo institucional en la tabla de credenciales
    const [rows]: any = await db.execute(
      'SELECT id, password, role FROM users WHERE email = ?',
      [email]
    );

    // 2. Verificar si el usuario existe
    if (rows.length === 0) {
      return { error: 'El correo electrónico no está registrado.' };
    }

    const user = rows[0];

    // 3. VALIDACIÓN SEGURA DE CONTRASEÑA
    // Comparamos la contraseña en texto plano con el hash almacenado en la DB
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: 'La contraseña es incorrecta.' };
    }

    // 4. CREACIÓN DE SESIÓN (Sincronizado con la lógica de registro)
    const cookieStore = await cookies();
    const sessionToken = `session_user_${user.id}`;
    
    // Configuramos la cookie de sesión principal
    cookieStore.set('session_token', sessionToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    // Guardamos el rol para manejar accesos en el middleware o layout
    cookieStore.set('user_role', user.role, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 
    });

    // Devolvemos el éxito y el rol para la redirección en el frontend
    return { success: true, role: user.role };

  } catch (e: any) {
    console.error("Error en autenticación:", e);
    return { error: 'Hubo un error al intentar iniciar sesión.' };
  }
}

/**
 * Función para cerrar sesión
 * Elimina las cookies y redirige al login
 */
export async function logout() {
  const cookieStore = await cookies();
  
  // Eliminamos las cookies de identificación
  cookieStore.delete('session_token');
  cookieStore.delete('user_role');
  
  // Redirigimos al usuario a la página de login
  redirect('/login');
}