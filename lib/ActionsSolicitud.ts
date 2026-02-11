'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { mkdir } from 'fs/promises'
import { guardarArchivo } from './SolicitudUtils'
import { actualizarIndiceGlobal, obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'

export async function enviarSolicitud(formData: FormData) {
  try {
    // 1. EXTRAER DATOS BÁSICOS
    const userId = formData.get('user_id')
    const emailInstitucional = formData.get('email_institucional')
    const tipo_beca = formData.get('tipo_beca')
    const promedio = formData.get('promedio')
    const motivo = formData.get('motivo_solicitud')

    if (!userId || !emailInstitucional || !tipo_beca || !promedio) {
      return { error: "Faltan datos obligatorios en la sección de beneficios." }
    }

    const userIdNum = parseInt(userId as string);

    // 2. VERIFICACIÓN DE VETO
    const [statusRows]: any = await db.execute(
      'SELECT beca_perdida FROM students WHERE id = ?',
      [userIdNum]
    );
    if (statusRows[0]?.beca_perdida === 1) {
      return { error: "Solicitud Denegada: Su beneficio ha sido revocado permanentemente." };
    }

    // 3. PROCESAMIENTO DE MATERIAS Y PROMEDIO
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const materiasArray = materiasNombres.map((nombre, index) => ({
        nombre: nombre as string,
        nota: parseFloat(materiasNotas[index] as string || "0")
    })).filter(m => m.nombre && m.nombre.trim() !== ""); 

    if (materiasArray.some(m => m.nota < 10)) {
        return { error: "Solicitud Denegada: No se permiten materias reprobadas." };
    }

    const materiasJsonString = JSON.stringify(materiasArray);
    const numPromedio = parseFloat(promedio as string);
    const estatusFinal = numPromedio < 16.50 ? 'Revisión Especial' : 'Pendiente';

    // 🟢 4. SINCRONIZACIÓN DE PERIODO (Usando el blindaje anti-duplicados)
    let periodoId = await obtenerOCrearPeriodoObjetivo();

    // 5. PROCESAR ARCHIVOS
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    const [rutaFoto, rutaCedula] = await Promise.all([
      guardarArchivo(formData.get('foto_carnet') as File),
      guardarArchivo(formData.get('copia_cedula') as File)
    ])

    const ingresoTotal = (parseFloat(formData.get('monto_ingreso_sueldo') as string || "0") + 
                         parseFloat(formData.get('monto_ingreso_extra') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_pension') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_ayuda') as string || "0"));

    // 🟢 6. LÓGICA DE GUARDADO INTELIGENTE (UPDATE O INSERT)
    const [solicitudExistente]: any = await db.execute(
        'SELECT id, estatus, foto_carnet, copia_cedula FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
        [userIdNum, periodoId]
    );

    if (solicitudExistente.length > 0) {
        const existente = solicitudExistente[0];

        if (existente.estatus !== 'Aprobada' && existente.estatus !== 'Rechazada') {
            // Si no envió archivos nuevos, mantenemos los que ya tenía el registro morado
            const fotoFinal = rutaFoto || existente.foto_carnet;
            const cedulaFinal = rutaCedula || existente.copia_cedula;

            await db.execute(`
                UPDATE solicitudes SET 
                    email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
                    motivo_solicitud = ?, materias_json = ?, ingreso_familiar_total = ?, 
                    estatus = ?, foto_carnet = ?, copia_cedula = ?, fecha_registro = NOW()
                WHERE id = ?
            `, [emailInstitucional, tipo_beca, numPromedio, motivo, materiasJsonString, ingresoTotal, estatusFinal, fotoFinal, cedulaFinal, existente.id]);
        } else {
            return { error: "Ya existe una decisión final para este periodo." };
        }
    } else {
        // Registro nuevo (Postulación inicial)
        await db.execute(`
          INSERT INTO solicitudes (
            user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
            motivo_solicitud, materias_json, ingreso_familiar_total, estatus, 
            foto_carnet, copia_cedula, fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [userIdNum, periodoId, emailInstitucional, tipo_beca, numPromedio, motivo, materiasJsonString, ingresoTotal, estatusFinal, rutaFoto, rutaCedula]);
    }

    // 7. ACTUALIZAR ENCUESTA (Mantenemos tu lógica de ON DUPLICATE KEY)
    // ... (Aquí va todo tu objeto respuestasEncuesta tal cual lo tienes)
    const respuestasEncuesta = { /* ... tus datos ... */ };

    await db.execute(`
      INSERT INTO estudios_socioeconomicos (student_id, tipo, respuestas_json, puntaje, nivel_riesgo, created_at)
      VALUES (?, 'estudiante', ?, 0, 'Pendiente', NOW())
      ON DUPLICATE KEY UPDATE respuestas_json = VALUES(respuestas_json), created_at = NOW()
    `, [userIdNum, JSON.stringify(respuestasEncuesta)]);

    // 8. RECALCULAR ÍNDICE Y REVALIDAR
    await actualizarIndiceGlobal(userIdNum, materiasArray);

    revalidatePath('/admin/solicitudes')
    revalidatePath('/perfil')
    
    return { success: true }

  } catch (error: any) {
    console.error("❌ Error en Proceso de Solicitud:", error)
    return { error: "Error crítico al procesar la solicitud." }
  }
}