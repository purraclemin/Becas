'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { obtenerOCrearPeriodoObjetivo, actualizarIndiceGlobal } from './SolicitudAcademic'

/**
 * 🟢 ACCIÓN ACTUALIZADA: RENOVAR BECA (PASO 4)
 * Esta función ya no crea periodos ni registros nuevos desde cero.
 * Busca la solicitud física en estatus 'Renovacion' generada por el sistema
 * y la actualiza con las nuevas notas cargadas por el estudiante.
 */
export async function renovarBeca(formData: FormData) {
  try {
    const userId = formData.get('user_id');
    if (!userId) return { error: "ID de usuario no encontrado." };

    const userIdNum = parseInt(userId as string);

    // 1. Sincronización de Periodo (Asegura el Paso 2: limpieza de duplicados)
    // Esto garantiza que trabajemos siempre sobre el ID del periodo vigente.
    const periodoIdActual = await obtenerOCrearPeriodoObjetivo();

    // 2. Procesar las nuevas materias enviadas desde el Banner del Perfil
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const nuevasMaterias = materiasNombres.map((nombre, index) => ({
        nombre: nombre as string,
        nota: parseFloat(materiasNotas[index] as string || "0")
    })).filter(m => m.nombre && m.nombre.trim() !== ""); 

    // Validación de carga mínima
    if (nuevasMaterias.length < 4) {
        return { error: "Debe registrar al menos 4 materias para procesar la renovación académica." };
    }

    // Validación de reprobadas: Mantenemos tu regla de no permitir notas < 10
    if (nuevasMaterias.some(m => m.nota < 10)) {
        return { error: "No se puede procesar la renovación con asignaturas reprobadas." };
    }

    const suma = nuevasMaterias.reduce((acc, curr) => acc + curr.nota, 0);
    const nuevoPromedio = parseFloat((suma / nuevasMaterias.length).toFixed(2));
    const materiasJson = JSON.stringify(nuevasMaterias);

    // 🟢 3. ACTUALIZACIÓN INTELIGENTE: BUSCAR EL REGISTRO 'RENOVACION' EXISTENTE
    // En lugar de hacer un INSERT (que crearía duplicados), buscamos la fila morada
    // que el sistema creó automáticamente en el Paso 3.
    const [checkRenovacion]: any = await db.execute(
        'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ? AND estatus = "Renovacion"',
        [userIdNum, periodoIdActual]
    );

    if (checkRenovacion.length === 0) {
        return { error: "No se encontró un registro de renovación disponible para este periodo. El sistema debe generar el estatus morado primero." };
    }

    const solicitudId = checkRenovacion[0].id;
    const estatusFinal = nuevoPromedio < 16.50 ? 'Revisión Especial' : 'Pendiente';

    // 4. UPDATE: Guardamos las notas y cambiamos el estatus de 'Renovacion' a 'Pendiente/Especial'
    // Esto hace que el administrador vea físicamente el cambio en su panel.
    await db.execute(`
      UPDATE solicitudes SET 
        materias_json = ?, 
        promedio_notas = ?, 
        estatus = ?, 
        fecha_registro = NOW() 
      WHERE id = ?
    `, [materiasJson, nuevoPromedio, estatusFinal, solicitudId]);

    // 5. Actualizamos el índice global maestro en la ficha del estudiante (Tabla students)
    await actualizarIndiceGlobal(userIdNum, nuevasMaterias);

    // Revalidamos la ruta para que el perfil cambie de Violeta a Amarillo/Naranja al instante
    revalidatePath('/perfil');
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ Error en Proceso de Renovación:", error);
    return { error: "Error de sistema al actualizar el registro de renovación académica." };
  }
}