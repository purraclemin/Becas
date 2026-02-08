'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'

// 1. BUSCAR (Mantiene tu diseño original)
export async function buscarEstudianteConEstudio(cedula: string) {
  try {
    const [rows]: any = await db.execute(
      `SELECT s.id, s.nombre, s.apellido, s.carrera, s.cedula,
              e.puntaje, e.nivel_riesgo, e.respuestas_json, e.created_at
       FROM students s
       LEFT JOIN estudios_socioeconomicos e ON s.id = e.student_id
       WHERE s.cedula = ?`,
      [cedula]
    )
    return rows[0] || null
  } catch (error) { 
    console.error("Error buscando:", error);
    return null 
  }
}

// 2. GUARDAR (Optimizado: El motor SQL hace el cálculo y cambia el estatus)
export async function guardarOActualizarEstudio(data: any) {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // PASO 1: Limpieza (Mismo diseño de borrar e insertar)
    await connection.execute('DELETE FROM estudios_socioeconomicos WHERE student_id = ?', [data.student_id]);

    // PASO 2: Insertar con Lógica de Negocio en MySQL
    // El motor SQL calcula el Score y el Nivel automáticamente
    await connection.execute(`
      INSERT INTO estudios_socioeconomicos (student_id, puntaje, nivel_riesgo, respuestas_json)
      SELECT 
        ?, 
        @s := (
          CASE WHEN ? = 'Rancho/Anexo' THEN 15 ELSE 0 END + 
          CASE WHEN ? = 'Alquilada' THEN 10 ELSE 0 END + 
          CASE WHEN CAST(? AS UNSIGNED) >= 5 THEN 10 ELSE 0 END + 
          CASE WHEN CAST(? AS DECIMAL(10,2)) < 100 THEN 20 ELSE 0 END + 
          CASE WHEN ? = 'Desempleado' THEN 15 ELSE 0 END + 
          CASE WHEN ? = 'No' THEN 10 ELSE 0 END + 
          CASE WHEN ? = 'No posee' THEN 10 ELSE 0 END + 
          CASE WHEN ? = 'Si' THEN 10 ELSE 0 END
        ),
        CASE WHEN @s >= 60 THEN 'Alto' WHEN @s >= 30 THEN 'Medio' ELSE 'Bajo' END,
        ?
    `, [
      data.student_id,
      data.tipo_vivienda,
      data.tenencia_vivienda,
      data.num_personas_hogar,
      data.ingreso_mensual_familiar,
      data.empleo_jefe_hogar,
      data.equipo_computacion,
      data.acceso_internet,
      data.carga_familiar_discapacidad,
      JSON.stringify(data)
    ]);

    // PASO 3: Actualizar Estatus a 'En Revisión' automáticamente
    // Corregido: Solo actualizamos la tabla 'solicitudes' que sí tiene la columna 'estatus'
    await connection.execute(
      "UPDATE solicitudes SET estatus = 'En Revisión' WHERE user_id = ? AND estatus = 'Pendiente'",
      [data.student_id]
    );

    await connection.commit();
    
    // Refrescar las vistas involucradas
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/socioeconomico');
    
    return { success: true };

  } catch (error: any) { 
    if (connection) await connection.rollback();
    console.error("Error en procesamiento SQL:", error);
    return { success: false };
  } finally {
    if (connection) connection.release();
  }
}

// 3. BORRAR MANUAL
export async function borrarEstudio(studentId: number) {
  try {
    await db.execute('DELETE FROM estudios_socioeconomicos WHERE student_id = ?', [studentId]);
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/socioeconomico');
    return { success: true };
  } catch (error) { 
    console.error("Error al borrar estudio:", error);
    return { success: false }; 
  }
}