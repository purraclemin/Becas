'use server'

import { db } from './db'
import { getModoPruebaStatus } from './ModoPrueba'

/**
 * 🟢 LÓGICA DE CÁLCULO DE ÍNDICE GLOBAL
 * Corregido para soportar la nueva estructura del JSON de materias
 */
export async function actualizarIndiceGlobal(userId: number, materiasActuales: any[]) {
  try {
    const [solicitudes]: any = await db.execute(
      'SELECT materias_json FROM solicitudes WHERE user_id = ? AND estatus IN ("Aprobada", "Revision Especial", "Pendiente")',
      [userId]
    );

    let sumaNotas = 0;
    let totalMaterias = 0;

    solicitudes.forEach((sol: any) => {
      if (sol.materias_json) {
        try {
          const parsedData = JSON.parse(sol.materias_json);
          
          /**
           * 🟢 CORRECCIÓN:
           * Verificamos si los datos vienen en el nuevo formato (parsedData.materias)
           * o en el formato antiguo (si parsedData es un array directamente).
           */
          const listaMaterias = Array.isArray(parsedData) 
            ? parsedData 
            : (parsedData.materias || []);

          listaMaterias.forEach((m: any) => {
            const nota = parseFloat(m.nota);
            if (!isNaN(nota)) {
              sumaNotas += nota;
              totalMaterias++;
            }
          });
        } catch (e) {
          console.error("Error al parsear materias del historial:", e);
        }
      }
    });

    // Sumar las materias que el usuario está enviando en la solicitud actual
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
      await db.execute(
        'UPDATE students SET indice_global = ? WHERE id = ?',
        [nuevoIndice, userId]
      );
    }
  } catch (error) {
    console.error("❌ Error recalculando índice global:", error);
  }
}

/**
 * 🟢 LÓGICA DE PERIODO AUTOMÁTICO (CON SOPORTE PARA MODO PRUEBA)
 * Restaurada y optimizada para no romper la renovación.
 */
export async function obtenerOCrearPeriodoObjetivo() {
  const { activo, mesSimulado } = await getModoPruebaStatus();
  const fecha = new Date();
  
  const mes = (activo && mesSimulado) ? parseInt(mesSimulado) : (fecha.getMonth() + 1);
  const anio = fecha.getFullYear();

  let codigo = "";
  let nombre = "";
  let f_inicio = "";
  let f_fin = "";

  // Determinamos cuál debería ser el periodo actual según el calendario
  if (mes === 12 || mes <= 3) {
    const targetAnio = (mes === 12) ? anio + 1 : anio;
    codigo = `${targetAnio}-I`;
    nombre = `Periodo I ${targetAnio} (Ene-Abr)`;
    f_inicio = `${targetAnio}-01-01`;
    f_fin = `${targetAnio}-04-30`;
  } else if (mes >= 4 && mes <= 7) {
    codigo = `${anio}-II`;
    nombre = `Periodo II ${anio} (May-Ago)`;
    f_inicio = `${anio}-05-01`;
    f_fin = `${anio}-08-31`;
  } else {
    codigo = `${anio}-III`;
    nombre = `Periodo III ${anio} (Sep-Dic)`;
    f_inicio = `${anio}-09-01`;
    f_fin = `${anio}-12-31`;
  }

  const fechaInicioObj = new Date(f_inicio + "T00:00:00");
  const fechaLimiteObj = new Date(fechaInicioObj);
  fechaLimiteObj.setDate(fechaInicioObj.getDate() + 14); 
  const f_limite = fechaLimiteObj.toISOString().split('T')[0];

  // Buscamos si el periodo calculado ya existe
  const [rows]: any = await db.execute(
    'SELECT id, es_actual FROM periodos_academicos WHERE codigo = ? LIMIT 1',
    [codigo]
  );

  let periodId;

  if (rows.length > 0) {
    periodId = rows[0].id;
    // Si existe pero no está marcado como actual, o si queremos asegurar la fecha límite
    if (rows[0].es_actual === 0) {
        await db.execute('UPDATE periodos_academicos SET es_actual = 0');
        await db.execute(
            'UPDATE periodos_academicos SET fecha_limite_solicitud = ?, es_actual = 1 WHERE id = ?',
            [f_limite, periodId]
        );
    }
  } else {
    // Si no existe el periodo cronológico, lo creamos como el nuevo actual
    await db.execute('UPDATE periodos_academicos SET es_actual = 0');
    const [result]: any = await db.execute(`
      INSERT INTO periodos_academicos 
      (codigo, nombre, fecha_inicio, fecha_fin, fecha_limite_solicitud, es_actual) 
      VALUES (?, ?, ?, ?, ?, 1)
    `, [codigo, nombre, f_inicio, f_fin, f_limite]);
    periodId = result.insertId;
  }
  
  return periodId;
}

/**
 * 🟢 LÓGICA AUXILIAR PARA CÁLCULO DE FECHAS
 */
export async function obtenerSiguientePeriodoData(codigoActual: string) {
  const [anioStr, lapso] = codigoActual.split('-');
  let anio = parseInt(anioStr);
  let nuevoLapso = '';
  let nuevoAnio = anio;

  if (lapso === 'I') {
    nuevoLapso = 'II';
  } else if (lapso === 'II') {
    nuevoLapso = 'III';
  } else if (lapso === 'III') {
    nuevoLapso = 'I';
    nuevoAnio = anio + 1;
  } else {
    nuevoLapso = 'I';
  }

  const nuevoCodigo = `${nuevoAnio}-${nuevoLapso}`;
  const mesesDesc = nuevoLapso === 'I' ? 'Ene-Abr' : nuevoLapso === 'II' ? 'May-Ago' : 'Sep-Dic';
  
  const mesInicio = nuevoLapso === 'I' ? '01-01' : nuevoLapso === 'II' ? '05-01' : '09-01';
  const mesFin = nuevoLapso === 'I' ? '04-30' : nuevoLapso === 'II' ? '08-31' : '12-31';

  return { 
    codigo: nuevoCodigo, 
    nombre: `Periodo ${nuevoLapso} ${nuevoAnio} (${mesesDesc})`,
    inicio: `${nuevoAnio}-${mesInicio}`,
    fin: `${nuevoAnio}-${mesFin}`
  };
}