// lib/ActionsSolicitud.ts
'use server'

import { db } from './db'
import { redirect } from 'next/navigation'

export async function enviarSolicitud(formData: FormData) {
  // 1. Extraemos el ID del usuario (esto es lo que faltaba en el INSERT)
  const userId = formData.get('user_id') as string
  const emailPersonal = formData.get('email_personal') as string
  const emailInstitucional = formData.get('email_institucional') as string
  const tipoBeca = formData.get('tipoBeca') as string
  const promedio = formData.get('promedio') as string
  const motivo = formData.get('motivo') as string

  // Validación de seguridad
  if (!userId || !emailPersonal || !emailInstitucional) {
    return { error: 'Error de identificación de usuario. Inicie sesión nuevamente.' }
  }

  try {
    // 2. INSERT corregido con todas las columnas necesarias
    await db.execute(
      `INSERT INTO solicitudes (
        user_id, 
        email_personal, 
        email_institucional, 
        tipo_beca, 
        promedio_notas, 
        motivo_solicitud
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, emailPersonal, emailInstitucional, tipoBeca, promedio, motivo]
    )

    console.log(`✅ Solicitud vinculada al ID: ${userId}`);

  } catch (error: any) {
    console.error("❌ Error en ActionsSolicitud:", error);
    return { error: 'No se pudo guardar la solicitud. Verifique su conexión.' };
  }

  // 3. Redirección fuera del try/catch
  redirect('/becas');
}