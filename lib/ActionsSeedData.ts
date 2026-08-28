'use server'

import { db } from './db'
import bcrypt from 'bcryptjs'

/**
 * 🚀 SEEDER DE DATOS: Genera 100 estudiantes y solicitudes de prueba.
 * Respeta la integridad referencial: Users -> Students -> Solicitudes.
 */
export async function seedDatabase() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // 🟢 Obtener dinámicamente el periodo académico activo actual
    const [periodoRes]: any = await connection.execute(
      `SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const periodoId = periodoRes?.[0]?.id;

    if (!periodoId) {
      throw new Error("No se encontró ningún periodo académico activo (es_actual = 1) en la base de datos.");
    }

    const municipios = [
      "Arismendi", "Antolín del Campo", "Díaz", "García", "Gómez", 
      "Maneiro", "Marcano", "Mariño", "Península de Macanao", "Tubores", "Villalba"
    ];

    const carreras = [
      "Ingeniería de Sistemas", "Ingeniería Industrial", "Artes mención Diseño Gráfico",
      "Idiomas Modernos", "Administración", "Contaduría Pública", "Derecho", "Psicología"
    ];

    const tiposBeca = ["BECA SOCIAL", "BECA APRENDIZAJE", "BECA A LA EXCELENCIA"];
    const estatusPosibles = ["Pendiente", "En Revisión", "Aprobada", "Rechazada"];
    
    const passwordHash = await bcrypt.hash("estudiante123", 10);

    console.log(`⏳ Iniciando inserción de 100 registros en el periodo ID: ${periodoId}...`);

    for (let i = 1; i <= 100; i++) {
      const cedula = (30000000 + i).toString();
      const email = `test_user${i}@unimar.edu.ve`;
      const nombre = `Estudiante${i}`;
      const apellido = `Prueba${i}`;

      const [userRes]: any = await connection.execute(
        `INSERT INTO users (email, password, role) VALUES (?, ?, 'estudiante')`,
        [email, passwordHash]
      );
      const userId = userRes.insertId;

      await connection.execute(
        `INSERT INTO students (id, nombre, apellido, cedula, telefono, carrera, semestre, municipio_residencia, email) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          nombre, 
          apellido, 
          cedula, 
          "04120000000", 
          carreras[Math.floor(Math.random() * carreras.length)],
          Math.floor(Math.random() * 12) + 1,
          municipios[Math.floor(Math.random() * municipios.length)],
          email
        ]
      );

      const promedio = (Math.random() * (20 - 10) + 10).toFixed(2);
      const estatus = estatusPosibles[Math.floor(Math.random() * estatusPosibles.length)];

      await connection.execute(
        `INSERT INTO solicitudes (user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, estatus, motivo_solicitud) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          periodoId, 
          email, 
          tiposBeca[Math.floor(Math.random() * tiposBeca.length)],
          promedio,
          estatus,
          "Solicitud generada automáticamente para pruebas de carga y rendimiento del sistema."
        ]
      );
    }

    await connection.commit();
    return { success: true, message: `100 estudiantes y solicitudes creados exitosamente en el periodo actual (ID: ${periodoId})` };

  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en Seeding:", error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

/**
 * 🧹 LIMPIEZA DE DATOS: Borra los estudiantes, estudios socioeconómicos y solicitudes de prueba.
 * Excluye explícitamente los IDs 10 y 12 para proteger registros manuales.
 */
export async function cleanSeedData() {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    console.log("⏳ Iniciando limpieza de datos de prueba...");

    // 1. Identificar IDs de usuarios de prueba (test_user%) excluyendo IDs manuales (10 y 12)
    const [rows]: any = await connection.execute(
      `SELECT id FROM users 
       WHERE email LIKE 'test_user%' 
       AND id NOT IN (10, 12)`
    );

    const idsToDelete = rows.map((r: any) => r.id);

    if (idsToDelete.length === 0) {
      return { success: true, message: "No se encontraron registros de prueba para eliminar." };
    }

    const placeholders = idsToDelete.map(() => '?').join(',');

    // 2. Borrar primero los estudios socioeconómicos asociados estrictamente a estos IDs de prueba
    await connection.execute(
      `DELETE FROM estudios_socioeconomicos WHERE student_id IN (${placeholders})`,
      idsToDelete
    );

    // 3. Borrar de la tabla USERS (por cascada eliminará students y solicitudes de prueba)
    await connection.execute(
      `DELETE FROM users WHERE id IN (${placeholders})`,
      idsToDelete
    );

    await connection.commit();
    return { success: true, message: `${idsToDelete.length} registros de prueba y sus estudios socioeconómicos fueron eliminados correctamente (IDs 10 y 12 protegidos).` };

  } catch (error: any) {
    await connection.rollback();
    console.error("❌ Error en Limpieza:", error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}