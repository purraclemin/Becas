'use server'

import { db } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export async function checkExistence(cedula: string, email: string) {
  try {
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

export async function register(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const cedula = formData.get('cedula') as string
  const telefono = formData.get('telefono') as string
  const carrera = formData.get('carrera') as string
  const semestre = formData.get('semestre') as string
  
  // 🟢 Extraer nuevos campos
  const sexo = formData.get('sexo') as string
  const fecha_nacimiento = formData.get('fecha_nacimiento') as string
  const municipio = formData.get('municipio') as string

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Crear el usuario en la tabla de autenticación
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'estudiante']
    );

    const userId = userResult.insertId;

    // 2. 🟢 Crear el expediente académico en la tabla students
    // Inicializamos indice_global en 0.00 para asegurar que el perfil 
    // pueda leer el registro aunque aún no haya enviado solicitudes.
    await connection.execute(
      `INSERT INTO students (
        id, nombre, apellido, cedula, sexo, fecha_nacimiento, 
        telefono, carrera, semestre, email, municipio_residencia, indice_global
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, nombre, apellido, cedula, sexo, fecha_nacimiento, 
        telefono, carrera, semestre, email, municipio, 0.00
      ]
    );

    await connection.commit();

    const cookieStore = await cookies();
    const sessionToken = `active_session_${userId}`;
    
    cookieStore.set('session_token', sessionToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 
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
    
    if (e.code === 'ER_DUP_ENTRY') {
      return { error: 'Error: El usuario o la cédula ya existen.' };
    }
    
    console.error("❌ Error crítico en registro:", e);
    return { error: 'Error del servidor. Intente más tarde.' };
  } finally {
    if (connection) connection.release();
  }
}