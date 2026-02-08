'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Función auxiliar para guardar archivos
async function guardarArchivo(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const nombreUnico = `${Date.now()}-${file.name.replaceAll(" ", "_")}`
  const rutaRelativa = `/uploads/${nombreUnico}`
  const rutaAbsoluta = path.join(process.cwd(), 'public', 'uploads', nombreUnico)

  try {
    await writeFile(rutaAbsoluta, buffer)
    return rutaRelativa 
  } catch (error) {
    console.error(`Error guardando archivo:`, error)
    return null
  }
}

export async function enviarSolicitud(formData: FormData) {
  try {
    // 1. Extraer datos
    const userId = formData.get('user_id')
    const emailInstitucional = formData.get('email_institucional')
    const tipoBeca = formData.get('tipoBeca')
    const promedio = formData.get('promedio')
    const motivo = formData.get('motivo')

    // 2. Validar antes de procesar archivos (Ahorro de recursos)
    if (!userId || !emailInstitucional || !tipoBeca || !promedio) {
      return { error: "Faltan datos obligatorios." }
    }

    // 3. Procesar Archivos
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    const [rutaFoto, rutaCedula, rutaPlanilla] = await Promise.all([
      guardarArchivo(formData.get('foto_carnet') as File),
      guardarArchivo(formData.get('copia_cedula') as File),
      guardarArchivo(formData.get('planilla_inscripcion') as File)
    ])

    // --- LÓGICA SQL (EL MOTOR HACE EL TRABAJO) ---

    // 4. Sincronizar tabla de estudiantes
    await db.execute(
      "UPDATE students SET email = ?, estatusBeca = 'Pendiente' WHERE id = ?",
      [emailInstitucional, userId]
    )

    // 5. Insertar Solicitud
    await db.execute(`
      INSERT INTO solicitudes (
        user_id, email_institucional, tipo_beca, promedio_notas, 
        motivo_solicitud, estatus, foto_carnet, copia_cedula, planilla_inscripcion
      ) VALUES (?, ?, ?, ?, ?, 'Pendiente', ?, ?, ?)
    `, [userId, emailInstitucional, tipoBeca, promedio, motivo, rutaFoto, rutaCedula, rutaPlanilla])

    // 6. Limpiar caché para que el admin vea los cambios
    revalidatePath('/admin/solicitudes')
    revalidatePath('/admin/estudiantes')
    
    return { success: true }

  } catch (error: any) {
    console.error("❌ Error SQL:", error)
    if (error.code === 'ER_DUP_ENTRY') return { error: "Ya existe una solicitud para este periodo." }
    return { error: "Error al procesar la solicitud en el servidor." }
  }
}