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
  // 1. EXTRACCIÓN DE DATOS CON LIMPIEZA INICIAL
  const nombre = (formData.get('nombre') as string)?.trim() || ""
  const apellido = (formData.get('apellido') as string)?.trim() || ""
  const email = (formData.get('email') as string)?.trim() || ""
  const password = formData.get('password') as string || ""
  const cedula = (formData.get('cedula') as string)?.trim() || ""
  const telefono = (formData.get('telefono') as string)?.trim() || ""
  const carrera = (formData.get('carrera') as string)?.trim() || ""
  const semestre = (formData.get('semestre') as string) || "1"
  
  // 🟢 TRATAMIENTO CRÍTICO: Convertir cadenas vacías en null real para MySQL
  // Esto evita que si llega un "" (vacío) desde el cliente, se guarde así en la BD
  const sexoRaw = formData.get('sexo') as string
  const sexo = (sexoRaw && sexoRaw.trim() !== "") ? sexoRaw.trim() : null

  const fechaRaw = formData.get('fecha_nacimiento') as string
  const fecha_nacimiento = (fechaRaw && fechaRaw.trim() !== "") ? fechaRaw : null

  const municipioRaw = formData.get('municipio') as string
  const municipio = (municipioRaw && municipioRaw.trim() !== "") ? municipioRaw.trim() : ""

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Crear el usuario en la tabla de autenticación (users)
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'estudiante']
    );

    const userId = userResult.insertId;

    // 2. Crear el expediente en la tabla students
    // Se mapea 'municipio' a 'municipio_residencia' y se inicializa el índice
    await connection.execute(
      `INSERT INTO students (
        id, nombre, apellido, cedula, sexo, fecha_nacimiento, 
        telefono, carrera, semestre, email, municipio_residencia, indice_global
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        nombre, 
        apellido, 
        cedula, 
        sexo, // M, F o NULL
        fecha_nacimiento, 
        telefono, 
        carrera, 
        semestre, 
        email, 
        municipio, 
        0.00
      ]
    );

    await connection.commit();

    // 3. Crear Cookies de sesión
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
    return { error: 'Error interno del servidor. No se pudo completar el registro.' };
  } finally {
    if (connection) connection.release();
  }
}