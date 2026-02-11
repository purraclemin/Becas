'use server'

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * Función auxiliar para guardar archivos físicamente en el servidor
 */
export async function guardarArchivo(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const nombreUnico = `${Date.now()}-${file.name.replaceAll(" ", "_")}`
  const rutaRelativa = `/uploads/${nombreUnico}`
  const rutaAbsoluta = path.join(process.cwd(), 'public', 'uploads', nombreUnico)

  try {
    // Aseguramos que la carpeta exista antes de escribir
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    await writeFile(rutaAbsoluta, buffer)
    return rutaRelativa 
  } catch (error) {
    console.error(`Error guardando archivo:`, error)
    return null
  }
}