'use server'

import { db } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { validateMasterOtp } from '../components/registro/bypass-otp' // 🟢 Importamos el validador de bypass

// Configuración del transporter de Nodemailer (Gmail gratuito)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function checkExistence(cedula: string, email: string) {
  try {
    const [emailRows] = await db.execute<RowDataPacket[]>(
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

    const [cedulaRows] = await db.execute<RowDataPacket[]>(
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
 * Enviar Código de Verificación OTP al Email Institucional
 */
export async function sendVerificationCode(email: string) {
  try {
    if (!email || !email.endsWith('@unimar.edu.ve')) {
      return { success: false, error: "Correo institucional inválido" };
    }

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Expiración en 15 minutos
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // Guardar o actualizar el código en la tabla email_verifications (Upsert)
    await db.execute(
      `INSERT INTO email_verifications (email, codigo, verified, expires_at) 
       VALUES (?, ?, 0, ?) 
       ON DUPLICATE KEY UPDATE codigo = ?, verified = 0, expires_at = ?`,
      [email, codigo, expiresAt, codigo, expiresAt]
    );

    // Enviar correo electrónico
    try {
      await transporter.sendMail({
        from: `"Sistema de Becas UNIMAR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Código de Verificación - Registro de Becas UNIMAR",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e3a5f; background-color: #f8fafc; border-radius: 8px;">
            <h2 style="color: #1e3a5f; border-bottom: 2px solid #d4a843; padding-bottom: 10px;">Universidad de Margarita</h2>
            <p>Has solicitado tu registro en el <b>Sistema de Gestión de Becas</b>.</p>
            <p>Tu código de verificación de 6 dígitos es:</p>
            <div style="background-color: #1e3a5f; color: #d4a843; font-size: 28px; font-weight: bold; text-align: center; padding: 15px; border-radius: 6px; letter-spacing: 5px; margin: 20px 0;">
              ${codigo}
            </div>
            <p style="font-size: 12px; color: #6b7280;">Este código expirará en 15 minutos. Si no solicitaste este código, puedes ignorar este mensaje.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("⚠️ Error enviando correo real (Modo Respaldo Consola):", mailError);
      console.log(`🔑 [CÓDIGO OTP PARA ${email}]: ${codigo}`);
    }

    return { success: true, message: "Código enviado con éxito" };
  } catch (e) {
    console.error("❌ Error en sendVerificationCode:", e);
    return { success: false, error: "No se pudo enviar el código de verificación" };
  }
}

/**
 * Verificar el Código OTP ingresado por el usuario (Incluye soporte de Código Maestro de Bypass)
 */
export async function verifyEmailCode(email: string, codigo: string) {
  try {
    // 🟢 1. Validar si se está usando el Código Maestro de Bypass (Modo Beta)
    if (validateMasterOtp(codigo)) {
      return { success: true };
    }

    // 2. Validación tradicional contra la base de datos
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM email_verifications 
       WHERE email = ? AND codigo = ? AND expires_at > NOW() LIMIT 1`,
      [email, codigo]
    );

    if (rows.length === 0) {
      return { success: false, error: "Código incorrecto o expirado" };
    }

    // Marcar como verificado
    await db.execute(
      `UPDATE email_verifications SET verified = 1 WHERE email = ?`,
      [email]
    );

    return { success: true };
  } catch (e) {
    console.error("❌ Error verificando código:", e);
    return { success: false, error: "Error al validar el código" };
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
    const [userResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, 'estudiante']
    );

    const userId = userResult.insertId;

    // 2. Crear el expediente en la tabla students
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

    // 3. Limpiar el registro de verificación de la tabla temporal tras registro exitoso
    await connection.execute(
      'DELETE FROM email_verifications WHERE email = ?',
      [email]
    );

    await connection.commit();

    // 4. Crear Cookies de sesión
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