'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { actualizarIndiceGlobal, obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'

/**
 * ACCIÓN DE SERVIDOR: RENOVAR BECA DESDE EL PERFIL
 * Crea una nueva solicitud basada en la anterior pero con notas actualizadas.
 */
export async function renovarBeca(formData: FormData) {
  try {
    const userId = formData.get('user_id');
    if (!userId) return { error: "ID de usuario no encontrado." };

    const userIdNum = parseInt(userId as string);

    // 1. OBTENER LA ÚLTIMA SOLICITUD APROBADA (Para clonar sus datos)
    const [solicitudRows]: any = await db.execute(
      `SELECT * FROM solicitudes 
       WHERE user_id = ? AND estatus = 'Aprobada' 
       ORDER BY fecha_registro DESC LIMIT 1`,
      [userIdNum]
    );

    if (solicitudRows.length === 0) {
      return { error: "No se encontró una beca previa aprobada para renovar." };
    }

    const anterior = solicitudRows[0];

    // 2. PROCESAR LAS NUEVAS MATERIAS Y CALCULAR PROMEDIO
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const nuevasMaterias = materiasNombres.map((nombre, index) => ({
        nombre: nombre as string,
        // Si la nota está vacía o no es número, asumimos 0 por seguridad
        nota: parseFloat(materiasNotas[index] as string || "0")
    })).filter(m => m.nombre && m.nombre.trim() !== ""); 

    if (nuevasMaterias.length < 4) {
        return { error: "Debe registrar al menos 4 materias para la renovación." };
    }

    // Validación de reprobadas (Regla: Todas deben estar aprobadas)
    if (nuevasMaterias.some(m => m.nota < 10)) {
        return { error: "No puede renovar el beneficio si tiene materias reprobadas." };
    }

    const suma = nuevasMaterias.reduce((acc, curr) => acc + curr.nota, 0);
    const nuevoPromedio = parseFloat((suma / nuevasMaterias.length).toFixed(2));
    const materiasJson = JSON.stringify(nuevasMaterias);

    // 3. DETERMINAR EL NUEVO PERIODO OBJETIVO
    const periodoId = await obtenerOCrearPeriodoObjetivo();

    // 4. VERIFICAR QUE NO EXISTA YA UNA SOLICITUD PARA ESTE NUEVO PERIODO
    const [checkExistente]: any = await db.execute(
        'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
        [userIdNum, periodoId]
    );

    if (checkExistente.length > 0) {
        return { error: "Ya existe un proceso de solicitud o renovación en curso para este periodo." };
    }

    // 5. INSERTAR NUEVA SOLICITUD (CLONACIÓN + ACTUALIZACIÓN)
    // Copiamos email, tipo de beca, motivo, ingresos y archivos de la anterior.
    // Insertamos el nuevo periodo, nuevo promedio y las nuevas materias.
    const estatusInicial = nuevoPromedio < 16.50 ? 'Revisión Especial' : 'Pendiente';

    await db.execute(`
      INSERT INTO solicitudes (
        user_id, 
        periodo_id, 
        email_institucional, 
        tipo_beca, 
        promedio_notas, 
        motivo_solicitud, 
        materias_json, 
        ingreso_familiar_total, 
        estatus, 
        foto_carnet, 
        copia_cedula, 
        fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
        userIdNum, 
        periodoId, 
        anterior.email_institucional, 
        anterior.tipo_beca, 
        nuevoPromedio, 
        anterior.motivo_solicitud, 
        materiasJson, 
        anterior.ingreso_familiar_total, 
        estatusInicial, 
        anterior.foto_carnet, 
        anterior.copia_cedula
    ]);

    // 6. ACTUALIZAR EL ÍNDICE GLOBAL DEL ESTUDIANTE
    // Esto suma las notas de todas las solicitudes aprobadas + la que acabamos de crear
    await actualizarIndiceGlobal(userIdNum, nuevasMaterias);

    // 7. REVALIDAR RUTAS PARA ACTUALIZAR LA UI
    revalidatePath('/perfil');
    revalidatePath('/Solicitud');
    
    return { success: true, message: "Renovación procesada exitosamente." };

  } catch (error: any) {
    console.error("❌ Error en ActionsRenovacion:", error);
    return { error: "Error interno al procesar la renovación." };
  }
}