'use server'

import { db } from './db'

/**
 * 🟢 LÓGICA DE CÁLCULO DE ÍNDICE GLOBAL (AUTOMATIZADA)
 * Suma el historial ya aprobado en BD + las materias que se están enviando AHORA.
 */
export async function actualizarIndiceGlobal(userId: number, materiasActuales: any[]) {
  try {
    // 1. Buscamos materias de solicitudes YA aprobadas anteriormente (Historial)
    const [solicitudes]: any = await db.execute(
      'SELECT materias_json FROM solicitudes WHERE user_id = ? AND estatus = "Aprobada"',
      [userId]
    );

    let sumaNotas = 0;
    let totalMaterias = 0;

    // Procesamos el historial aprobado
    solicitudes.forEach((sol: any) => {
      if (sol.materias_json) {
        try {
          const materiasHistorial = JSON.parse(sol.materias_json);
          materiasHistorial.forEach((m: any) => {
            const nota = parseFloat(m.nota);
            if (!isNaN(nota)) {
              sumaNotas += nota;
              totalMaterias++;
            }
          });
        } catch (e) {}
      }
    });

    // 2. Sumamos las materias de la solicitud ACTUAL
    if (materiasActuales && materiasActuales.length > 0) {
      materiasActuales.forEach((m: any) => {
        const nota = parseFloat(m.nota);
        if (!isNaN(nota)) {
          sumaNotas += nota;
          totalMaterias++;
        }
      });
    }

    if (totalMaterias > 0) {
      const nuevoIndice = (sumaNotas / totalMaterias).toFixed(2);
      
      // Actualizamos el campo en la tabla de estudiantes
      await db.execute(
        'UPDATE students SET indice_global = ? WHERE id = ?',
        [nuevoIndice, userId]
      );
    }
  } catch (error) {
    console.error("❌ Error recalculando índice global automáticamente:", error);
  }
}

/**
 * 🟢 LÓGICA DE PERIODO AUTOMÁTICO CON FECHAS (TOTALMENTE AUTOMATIZADA)
 * Calcula el periodo objetivo y asegura la sincronización de la bandera 'es_actual'.
 */
export async function obtenerOCrearPeriodoObjetivo() {
  const fecha = new Date();
  const mes = fecha.getMonth() + 1; // 1-12
  const anio = fecha.getFullYear();

  let codigo = "";
  let nombre = "";
  let f_inicio = "";
  let f_fin = "";
  let f_limite = "";

  // Lógica UNIMAR para determinar el periodo al que se postula según la fecha actual
  if (mes === 12 || mes <= 3) {
    // Periodo I (Ene-Abr)
    const targetAnio = (mes === 12) ? anio + 1 : anio;
    codigo = `${targetAnio}-I`;
    nombre = `Periodo I ${targetAnio} (Ene-Abr)`;
    f_inicio = `${targetAnio}-01-01`;
    f_fin = `${targetAnio}-04-30`;
    f_limite = `${targetAnio}-01-31`;
  } else if (mes >= 4 && mes <= 7) {
    // Periodo II (May-Ago)
    codigo = `${anio}-II`;
    nombre = `Periodo II ${anio} (May-Ago)`;
    f_inicio = `${anio}-05-01`;
    f_fin = `${anio}-08-31`;
    f_limite = `${anio}-05-31`;
  } else {
    // Periodo III (Sep-Dic)
    codigo = `${anio}-III`;
    nombre = `Periodo III ${anio} (Sep-Dic)`;
    f_inicio = `${anio}-09-01`;
    f_fin = `${anio}-12-31`;
    f_limite = `${anio}-09-30`;
  }

  // 1. Verificar si el periodo ya existe
  const [rows]: any = await db.execute(
    'SELECT id FROM periodos_academicos WHERE codigo = ? LIMIT 1',
    [codigo]
  );

  let periodId;
  if (rows.length > 0) {
    periodId = rows[0].id;
  } else {
    // 2. Si no existe, lo insertamos con las fechas calculadas
    const [result]: any = await db.execute(`
      INSERT INTO periodos_academicos 
      (codigo, nombre, fecha_inicio, fecha_fin, fecha_limite_solicitud, es_actual) 
      VALUES (?, ?, ?, ?, ?, 1)
    `, [codigo, nombre, f_inicio, f_fin, f_limite]);
    periodId = result.insertId;
  }

  // 3. AUTOMATIZACIÓN DE BANDERA: Sincronizar 'es_actual'
  // Ponemos todos en 0 y solo el periodo vigente en 1 para que el Perfil se actualice.
  await db.execute('UPDATE periodos_academicos SET es_actual = 0');
  await db.execute('UPDATE periodos_academicos SET es_actual = 1 WHERE id = ?', [periodId]);
  
  return periodId;
}