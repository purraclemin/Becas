// lib/actionsregistro.ts
'use server'

import { db } from './db'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  // Capturamos los datos del formulario según tu diseño de pasos
  const nombre = formData.get('nombre') as string
  const apellido = formData.get('apellido') as string
  const cedula = formData.get('cedula') as string
  const telefono = formData.get('telefono') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const carrera = formData.get('carrera') as string
  const semestre = formData.get('semestre') as string
console.log("Datos recibidos:", { email, password });
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction(); // Iniciamos transacción para seguridad de datos

    // 1. Insertamos en la tabla de usuarios (Login)
    const [userResult]: any = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, 'estudiante']
    );

    const userId = userResult.insertId;

    // 2. Insertamos en la tabla de estudiantes (Datos UNIMAR)
    await connection.execute(
      'INSERT INTO students (user_id, nombre, apellido, cedula, telefono, carrera, semestre) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, nombre, apellido, cedula, telefono, carrera, semestre]
    );

    await connection.commit();
  } catch (e) {
    if (connection) await connection.rollback();
    console.error("Error en Registro:", e);
    return { error: 'Error: El correo o la cédula ya están registrados en el sistema.' };
  } finally {
    if (connection) connection.release();
  }

  // Si todo sale bien, lo enviamos al login
  redirect('/proceso');
}