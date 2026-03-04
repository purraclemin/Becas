'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'

export async function renovarBeca(formData: FormData) {
  let connection;
  try {
    const userId = formData.get('user_id');
    const trimestreSeleccionado = formData.get('trimestre_seleccionado'); 
    
    if (!userId) return { error: "ID de usuario no encontrado." };

    const userIdNum = parseInt(userId as string);
    const trimestreNum = parseInt(trimestreSeleccionado as string);

    // 1. Sincronización de Periodo
    const periodoIdActual = await obtenerOCrearPeriodoObjetivo();

    // 2. Procesar las materias enviadas (Incluyendo reprobadas ahora)
    const materiasCodigos = formData.getAll('materias_codigos[]'); 
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const nuevasMaterias = materiasCodigos.map((codigo, index) => ({
        codigo: codigo as string,
        nombre: materiasNombres[index] as string,
        nota: parseFloat(materiasNotas[index] as string || "0")
    })).filter(m => m.nombre && m.nombre.trim() !== ""); 

    // VALIDACIONES BÁSICAS
    if (isNaN(trimestreNum) || trimestreNum < 1 || trimestreNum > 12) {
        return { error: "Debe seleccionar un trimestre válido (1-12)." };
    }

    if (nuevasMaterias.length === 0) {
        return { error: "Debe cargar al menos una asignatura para procesar la renovación." };
    }

    // Calculamos el promedio incluyendo todas las notas (aprobadas y reprobadas)
    const suma = nuevasMaterias.reduce((acc, curr) => acc + curr.nota, 0);
    const nuevoPromedio = parseFloat((suma / nuevasMaterias.length).toFixed(2));

    // Verificamos si existen materias reprobadas para determinar el estatus inicial
    const tieneReprobadas = nuevasMaterias.some(m => m.nota < 10);

    // Estructura para el JSON de materias
    const dataParaGuardar = {
        trimestre: trimestreNum,
        materias: nuevasMaterias,
        fecha_proceso: new Date().toISOString(),
        audit_detecto_reprobadas: tieneReprobadas // Bandera para el historial
    };
    const materiasJson = JSON.stringify(dataParaGuardar);

    // 3. BUSCAR EL REGISTRO 'RENOVACION' EXISTENTE
    const [checkRenovacion]: any = await db.execute(
        'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ? AND estatus = "Renovacion"',
        [userIdNum, periodoIdActual]
    );

    if (checkRenovacion.length === 0) {
        return { error: "No hay una solicitud de renovación activa habilitada por el sistema." };
    }

    const solicitudId = checkRenovacion[0].id;

    /**
     * LÓGICA DE ESTATUS AUTOMÁTICO:
     * - Si tiene reprobadas: 'Revisión Especial' (Independientemente del promedio).
     * - Si promedio < 16: 'Revisión Especial'.
     * - Si todo está bien: 'Pendiente' (Para aprobación del admin).
     */
    let estatusFinal = 'Pendiente';
    if (tieneReprobadas || nuevoPromedio < 16) {
        estatusFinal = 'Revisión Especial';
    }

    // 4. GESTIÓN DE CONEXIÓN Y TRANSACCIÓN
    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Actualizamos la solicitud con la nueva "fotografía" académica
        await connection.execute(`
          UPDATE solicitudes SET 
            materias_json = ?, 
            promedio_notas = ?, 
            estatus = ?, 
            fecha_registro = NOW(),
            observaciones_admin = ?
          WHERE id = ?
        `, [
            materiasJson, 
            nuevoPromedio, 
            estatusFinal, 
            tieneReprobadas ? "Sistema: Se detectaron materias reprobadas." : null,
            solicitudId
        ]);

        // Actualizamos el índice global del estudiante
        await connection.execute(
            'UPDATE students SET indice_global = ? WHERE id = ?',
            [nuevoPromedio, userIdNum]
        );

        await connection.commit();
    } catch (sqlError) {
        await connection.rollback();
        throw sqlError;
    }

    revalidatePath('/perfil');
    revalidatePath('/admin/solicitudes');
    
    return { success: true, estatusAsignado: estatusFinal };

  } catch (error: any) {
    console.error("❌ Error en Proceso de Renovación:", error);
    return { error: "Error interno al procesar la carga académica." };
  } finally {
    if (connection) connection.release();
  }
}