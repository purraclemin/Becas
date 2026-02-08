// lib/actionsregistro.ts
'use server'

import { db } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

/**
 * FUNCIÓN 1: Validación en tiempo real (Paso 1)
 * Verifica disponibilidad de Cédula y Email por separado para identificar el duplicado
 */
export async function checkExistence(cedula: string, email: string) {
  try {
    // 1. Verificar Correo Institucional
    const [emailRows]: any = await db.execute(
      'SELECT id FROM students WHERE email = ? LIMIT 1',
      [email]
    );

    if (emailRows.length > 0) {
      return { 
        exists: true, 
        field: 'email',
        error: "Este correo electrónico ya se encuentra registrado." 
      };
    }

    // 2. Verificar Cédula de Identidad
    const [cedulaRows]: any = await db.execute(
      'SELECT id FROM students WHERE cedula = ? LIMIT 1',
      [cedula]
    );

    if (cedulaRows.length > 0) {
      return { 
        exists: true, 
        field: 'cedula',
        error: "Esta cédula de identidad ya se encuentra registrada." 
      };
    }

    return { exists: false };
  } catch (e) {
    console.error("Error validando existencia:", e);
    return { exists: false };
  }
}

/**
 * FUNCIÓN 2: Registro Final (Paso 3)
 * Encripta contraseña con bcryptjs y guarda los datos en tablas users y students
 */
export async function register(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cedula = formData.get('cedula') as string
  const telefono = formData.get('telefono') as string
  const carrera = formData.get('carrera') as string
  const semestre = formData.get('semestre') as string

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. SEGURIDAD: Encriptamos la contraseña antes de guardarla
    // El '10' es el nivel de salt (balance óptimo entre seguridad y rendimiento)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insertar en tabla de credenciales (users)
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'estudiante']
    );

    const userId = userResult.insertId;

    // 3. Insertar en tabla de perfiles (students) vinculando por el ID generado
    await connection.execute(
      'INSERT INTO students (id, nombre, apellido, cedula, telefono, carrera, semestre, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, nombre, apellido, cedula, telefono, carrera, semestre, email]
    );

    await connection.commit();

    // 4. CONFIGURACIÓN DE SESIÓN: Logueo automático tras registro exitoso
    const cookieStore = await cookies();
    const sessionToken = `session_user_${userId}`;
    
    // Cookie de sesión principal
    cookieStore.set('session_token', sessionToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 // Expira en 24 horas
    });

    // Cookie de rol para control de accesos
    cookieStore.set('user_role', 'estudiante', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 
    });

    return { success: true };

  } catch (e: any) {
    // Revertimos cambios si alguna de las inserciones falla
    if (connection) await connection.rollback();
    
    // Manejo de error por duplicidad en el momento del envío final
    if (e.code === 'ER_DUP_ENTRY') {
      return { error: 'Error: Los datos ya existen en el sistema.' };
    }
    
    console.error("Error crítico en el proceso de registro:", e);
    return { error: 'No se pudo completar el registro. Intente más tarde.' };
  } finally {
    // Liberamos la conexión al pool de base de datos
    if (connection) connection.release();
  }
}