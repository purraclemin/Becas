'use server'

import { db } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { isBypassOtpEnabled, validateMasterOtp } from '../components/registro/bypass-otp'
import {
  personalStepSchema,
  academicStepSchema,
  securityStepSchema,
} from '../components/registro/validations'
import { sincronizarYObtenerRecordAcademico } from './ActionsRecordAcademico'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface DatabaseError {
  code?: string;
  errno?: number;
  message?: string;
}

function isDatabaseError(error: unknown): error is DatabaseError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export async function checkExistence(cedula: string, email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCedula = cedula.trim();

    const [emailRows] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1',
      [normalizedEmail]
    );

    if (emailRows.length > 0) {
      return {
        exists: true,
        field: 'email',
        error: "Este correo electrónico ya está registrado.",
      };
    }

    const [cedulaRows] = await db.execute<RowDataPacket[]>(
      'SELECT id FROM students WHERE cedula = ? LIMIT 1',
      [normalizedCedula]
    );

    if (cedulaRows.length > 0) {
      return {
        exists: true,
        field: 'cedula',
        error: "Esta cédula ya está registrada en el sistema.",
      };
    }

    return { exists: false };
  } catch (e: unknown) {
    console.error("Error validando existencia:", e);
    return { exists: false };
  }
}

/**
 * Enviar Código de Verificación OTP al Email Institucional
 */
export async function sendVerificationCode(email: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.endsWith('@unimar.edu.ve')) {
      return { success: false, error: "Correo institucional inválido" };
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    await db.execute<ResultSetHeader>(
      `INSERT INTO email_verifications (email, codigo, verified, expires_at) 
       VALUES (?, ?, 0, DATE_ADD(NOW(), INTERVAL 15 MINUTE)) 
       ON DUPLICATE KEY UPDATE codigo = ?, verified = 0, expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE)`,
      [normalizedEmail, codigo, codigo]
    );

    try {
      await transporter.sendMail({
        from: `"Sistema de Becas UNIMAR" <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
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
    } catch (mailError: unknown) {
      console.error("⚠️ Error enviando correo real (Modo Respaldo Consola):", mailError);
      console.log(`🔑 [CÓDIGO OTP PARA ${normalizedEmail}]: ${codigo}`);
    }

    return { success: true, message: "Código enviado con éxito" };
  } catch (e: unknown) {
    console.error("❌ Error en sendVerificationCode:", e);
    return { success: false, error: "No se pudo enviar el código de verificación" };
  }
}

/**
 * Verificar el Código OTP ingresado por el usuario (Incluye soporte de Código Maestro de Bypass)
 */
export async function verifyEmailCode(email: string, codigo: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanCode = codigo.trim();

    if (validateMasterOtp(cleanCode)) {
      await db.execute<ResultSetHeader>(
        `INSERT INTO email_verifications (email, codigo, verified, expires_at) 
         VALUES (?, ?, 1, DATE_ADD(NOW(), INTERVAL 30 MINUTE)) 
         ON DUPLICATE KEY UPDATE verified = 1, expires_at = DATE_ADD(NOW(), INTERVAL 30 MINUTE)`,
        [normalizedEmail, cleanCode]
      );
      return { success: true };
    }

    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT id FROM email_verifications 
       WHERE LOWER(email) = ? AND codigo = ? AND expires_at > NOW() LIMIT 1`,
      [normalizedEmail, cleanCode]
    );

    if (rows.length === 0) {
      return { success: false, error: "Código incorrecto o expirado" };
    }

    await db.execute<ResultSetHeader>(
      `UPDATE email_verifications SET verified = 1 WHERE LOWER(email) = ?`,
      [normalizedEmail]
    );

    return { success: true };
  } catch (e: unknown) {
    console.error("❌ Error verificando código:", e);
    return { success: false, error: "Error al validar el código" };
  }
}

/**
 * Registra al estudiante y sincroniza automáticamente su récord académico oficial
 * e índice global al instante (sin esperar a que abra su Perfil o Kardex).
 */
export async function register(formData: FormData) {
  const rawPayload = {
    nombre: (formData.get('nombre') as string)?.trim() || "",
    apellido: (formData.get('apellido') as string)?.trim() || "",
    cedula: (formData.get('cedula') as string)?.trim() || "",
    sexo: (formData.get('sexo') as string)?.trim() || "",
    fecha_nacimiento: (formData.get('fecha_nacimiento') as string)?.trim() || "",
    municipio: (formData.get('municipio') as string)?.trim() || "",
    telefono: (formData.get('telefono') as string)?.trim() || "",
    email: (formData.get('email') as string)?.trim().toLowerCase() || "",
    carrera: (formData.get('carrera') as string)?.trim() || "",
    semestre: (formData.get('semestre') as string)?.trim() || "",
    password: (formData.get('password') as string) || "",
    confirmPassword: (formData.get('password') as string) || "",
    aceptaTerminos: true as const,
  };

  const personalCheck = personalStepSchema.safeParse(rawPayload);
  if (!personalCheck.success) {
    return { error: personalCheck.error.issues[0]?.message || "Datos personales inválidos." };
  }

  const academicCheck = academicStepSchema.safeParse(rawPayload);
  if (!academicCheck.success) {
    return { error: academicCheck.error.issues[0]?.message || "Datos académicos inválidos." };
  }

  const securityCheck = securityStepSchema.safeParse(rawPayload);
  if (!securityCheck.success) {
    return { error: securityCheck.error.issues[0]?.message || "Contraseña inválida." };
  }

  let connection;
  let userId = 0;

  try {
    connection = await db.getConnection();

    if (!isBypassOtpEnabled()) {
      const [verifRows] = await connection.execute<RowDataPacket[]>(
        `SELECT id FROM email_verifications WHERE LOWER(email) = ? AND verified = 1 LIMIT 1`,
        [rawPayload.email]
      );
      if (verifRows.length === 0) {
        return { error: "Debe verificar su correo institucional antes de completar el registro." };
      }
    }

    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(rawPayload.password, 10);

    const [userResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [rawPayload.email, hashedPassword, 'estudiante']
    );

    userId = Number(userResult.insertId);

    await connection.execute<ResultSetHeader>(
      `INSERT INTO students (
        id, nombre, apellido, cedula, sexo, fecha_nacimiento, 
        telefono, carrera, semestre, email, municipio_residencia, indice_global
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        rawPayload.nombre,
        rawPayload.apellido,
        rawPayload.cedula,
        rawPayload.sexo || null,
        rawPayload.fecha_nacimiento || null,
        rawPayload.telefono,
        rawPayload.carrera,
        Number(rawPayload.semestre),
        rawPayload.email,
        rawPayload.municipio,
        0.0,
      ]
    );

    await connection.execute<ResultSetHeader>(
      'DELETE FROM email_verifications WHERE LOWER(email) = ?',
      [rawPayload.email]
    );

    await connection.commit();
  } catch (e: unknown) {
    if (connection) await connection.rollback();

    if (isDatabaseError(e) && e.code === 'ER_DUP_ENTRY') {
      return { error: 'Error: El usuario o la cédula ya existen.' };
    }

    console.error("❌ Error crítico en registro:", e);
    return { error: 'Error interno del servidor. No se pudo completar el registro.' };
  } finally {
    if (connection) connection.release();
  }

  // Generación automática e inmediata del récord académico e índice global desde el nacimiento del estudiante
  if (userId > 0) {
    try {
      await sincronizarYObtenerRecordAcademico(userId);
    } catch (syncError) {
      console.error("⚠️ Advertencia sincronizando récord académico inicial en registro:", syncError);
    }
  }

  const cookieStore = await cookies();
  const sessionToken = `active_session_${userId}`;

  cookieStore.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  cookieStore.set('user_role', 'estudiante', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return { success: true };
}