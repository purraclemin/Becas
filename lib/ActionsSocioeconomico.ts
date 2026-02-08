'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'

// Interfaz para tipado estricto
interface EstudioData {
  student_id: number;
  tipo_vivienda: string;
  tenencia_vivienda: string;
  num_personas_hogar: number;
  ingreso_mensual_familiar: number;
  empleo_jefe_hogar: string;
  equipo_computacion: string;
  acceso_internet: string;
  carga_familiar_discapacidad: string;
  [key: string]: any; 
}

// 1. BUSCAR (Filtrado: Solo estudiantes con Solicitud Activa)
export async function buscarEstudianteConEstudio(termino: string) {
  try {
    if (!termino || termino.trim().length < 3) return [];

    const queryTerm = `%${termino}%`; 

    // MODIFICACIÓN: Agregamos INNER JOIN con 'solicitudes'
    // Esto asegura que solo traiga estudiantes que ya han enviado una solicitud.
    const [rows]: any = await db.execute(
      `SELECT 
         s.id, s.nombre, s.apellido, s.carrera, s.cedula, s.email,
         e.puntaje, e.nivel_riesgo, e.respuestas_json, e.created_at
       FROM students s
       INNER JOIN solicitudes sol ON s.id = sol.user_id
       LEFT JOIN estudios_socioeconomicos e ON s.id = e.student_id
       WHERE 
         (s.cedula LIKE ?) OR 
         (s.email LIKE ?) OR 
         (CONCAT(s.nombre, ' ', s.apellido) LIKE ?)
       LIMIT 10`, 
      [queryTerm, queryTerm, queryTerm]
    )
    
    // Devolvemos el array de coincidencias
    return rows || []; 

  } catch (error) { 
    console.error("❌ Error buscando estudiante:", error);
    return []; 
  }
}

// 2. GUARDAR (Mantiene la lógica de negocio intacta)
export async function guardarOActualizarEstudio(data: EstudioData) {
  let connection;
  try {
    // A. LÓGICA DE NEGOCIO
    let puntaje = 0;

    // Vivienda
    if (data.tipo_vivienda === 'Rancho/Anexo') puntaje += 15;
    if (data.tenencia_vivienda === 'Alquilada') puntaje += 10;
    
    // Hacinamiento
    if (Number(data.num_personas_hogar) >= 5) puntaje += 10;
    
    // Economía
    if (Number(data.ingreso_mensual_familiar) < 100) puntaje += 20; 
    if (data.empleo_jefe_hogar === 'Desempleado') puntaje += 15;
    
    // Tecnología y Salud
    if (data.equipo_computacion === 'No') puntaje += 10;
    if (data.acceso_internet === 'No posee') puntaje += 10;
    if (data.carga_familiar_discapacidad === 'Si') puntaje += 10;

    // Nivel de Riesgo
    let nivel = 'Bajo';
    if (puntaje >= 60) nivel = 'Alto';
    else if (puntaje >= 30) nivel = 'Medio';

    // B. BASE DE DATOS
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Limpiar registro anterior
    await connection.execute('DELETE FROM estudios_socioeconomicos WHERE student_id = ?', [data.student_id]);

    // 2. Insertar estudio
    await connection.execute(
      `INSERT INTO estudios_socioeconomicos 
        (student_id, puntaje, nivel_riesgo, respuestas_json, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [
        data.student_id,
        puntaje,
        nivel,
        JSON.stringify(data)
      ]
    );

    // 3. Actualizar estatus de solicitud a 'En Revisión'
    await connection.execute(
      `UPDATE solicitudes 
       SET estatus = 'En Revisión' 
       WHERE user_id = ? AND estatus = 'Pendiente'`,
      [data.student_id]
    );

    await connection.commit();
    
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/solicitudes');
    
    // Devolvemos dataUpdated para que el frontend se refresque sin recargar
    return { 
        success: true, 
        puntaje, 
        nivel, 
        dataUpdated: { 
            puntaje, 
            nivel_riesgo: nivel, 
            respuestas_json: JSON.stringify(data) 
        } 
    };

  } catch (error: any) { 
    if (connection) await connection.rollback();
    console.error("❌ Error guardando estudio:", error);
    return { success: false, error: "Error al procesar los datos socioeconómicos." };
  } finally {
    if (connection) connection.release();
  }
}

// 3. BORRAR
export async function borrarEstudio(studentId: number) {
  try {
    await db.execute('DELETE FROM estudios_socioeconomicos WHERE student_id = ?', [studentId]);
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) { 
    console.error("❌ Error borrando estudio:", error);
    return { success: false }; 
  }
}