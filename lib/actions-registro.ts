'use server'

import { db } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

/**
 * FUNCIÓN 1: Validación en tiempo real
 * Se usa para que el formulario se ponga rojo antes de enviar.
 */
export async function checkExistence(cedula: string, email: string) {
  try {
    // 1. Verificar Email en la tabla USERS (la fuente de verdad para el login)
    const [emailRows]: any = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (emailRows.length > 0) {
      return { 
        exists: true, 
        field: 'email',
        error: "Este correo electrónico ya está registrado." 
      };
    }

    // 2. Verificar Cédula en la tabla STUDENTS
    const [cedulaRows]: any = await db.execute(
      'SELECT id FROM students WHERE cedula = ? LIMIT 1',
      [cedula]
    );

    if (cedulaRows.length > 0) {
      return { 
        exists: true, 
        field: 'cedula',
        error: "Esta cédula ya está registrada en el sistema." 
      };
    }

    return { exists: false };
  } catch (e) {
    console.error("Error validando existencia:", e);
    return { exists: false };
  }
}

/**
 * FUNCIÓN 2: Registro Transaccional (Todo o Nada)
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

    // 1. HASH: Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. INSERTAR USUARIO (Genera el ID Automático)
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'estudiante']
    );

    const userId = userResult.insertId; // Ej: 45

    // 3. INSERTAR ESTUDIANTE (Usando el MISMO ID)
    // Aquí es donde ocurre la magia de la relación 1 a 1 estricta
    await connection.execute(
      'INSERT INTO students (id, nombre, apellido, cedula, telefono, carrera, semestre, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, nombre, apellido, cedula, telefono, carrera, semestre, email]
    );

    await connection.commit();

    // 4. AUTO-LOGIN (Crear sesión inmediatamente)
    const cookieStore = await cookies();
    
    // Usamos 'active_session_' para mantener consistencia con ActionsAuth.ts
    const sessionToken = `active_session_${userId}`;
    
    cookieStore.set('session_token', sessionToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 horas
    });

    cookieStore.set('user_role', 'estudiante', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 
    });

    return { success: true };

  } catch (e: any) {
    if (connection) await connection.rollback();
    
    // Error específico de duplicados (por si alguien envió el formulario dos veces muy rápido)
    if (e.code === 'ER_DUP_ENTRY') {
      return { error: 'Error: El usuario o la cédula ya existen.' };
    }
    
    console.error("❌ Error crítico en registro:", e);
    return { error: 'Error del servidor. Intente más tarde.' };
  } finally {
    if (connection) connection.release();
  }
}