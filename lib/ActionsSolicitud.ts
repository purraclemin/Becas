'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * Función auxiliar para guardar archivos físicamente en el servidor
 */
async function guardarArchivo(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const nombreUnico = `${Date.now()}-${file.name.replaceAll(" ", "_")}`
  const rutaRelativa = `/uploads/${nombreUnico}`
  const rutaAbsoluta = path.join(process.cwd(), 'public', 'uploads', nombreUnico)

  try {
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    await writeFile(rutaAbsoluta, buffer)
    return rutaRelativa 
  } catch (error) {
    console.error(`Error guardando archivo:`, error)
    return null
  }
}

/**
 * 🟢 LÓGICA DE CÁLCULO DE ÍNDICE GLOBAL (AUTOMATIZADA)
 * Suma el historial ya aprobado en BD + las materias que se están enviando AHORA.
 */
async function actualizarIndiceGlobal(userId: number, materiasActuales: any[]) {
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
        const materiasHistorial = JSON.parse(sol.materias_json);
        materiasHistorial.forEach((m: any) => {
          sumaNotas += parseFloat(m.nota);
          totalMaterias++;
        });
      }
    });

    // 2. Sumamos las materias de la solicitud ACTUAL (que aún no está aprobada pero cuenta para el índice actual)
    if (materiasActuales && materiasActuales.length > 0) {
      materiasActuales.forEach((m: any) => {
        sumaNotas += parseFloat(m.nota);
        totalMaterias++;
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
 * 🟢 LÓGICA DE PERIODO AUTOMÁTICO CON FECHAS
 * Calcula el código y las fechas exactas de inicio/fin/límite para insertar en la BD.
 */
async function obtenerOCrearPeriodoObjetivo() {
  const fecha = new Date();
  const mes = fecha.getMonth() + 1; // 1-12
  const anio = fecha.getFullYear();

  let codigo = "";
  let nombre = "";
  let f_inicio = "";
  let f_fin = "";
  let f_limite = "";

  // Lógica de asignación de periodos y fechas UNIMAR
  if (mes === 12 || mes <= 3) {
    // Periodo I (Ene-Abr)
    const targetAnio = mes === 12 ? anio + 1 : anio;
    codigo = `${targetAnio}-I`;
    nombre = `Periodo I ${targetAnio} (Ene-Abr)`;
    f_inicio = `${targetAnio}-01-01`;
    f_fin = `${targetAnio}-04-30`;
    f_limite = `${targetAnio}-01-31`; // Ejemplo: Límite 31 de Enero
  } else if (mes >= 4 && mes <= 7) {
    // Periodo II (May-Ago)
    codigo = `${anio}-II`;
    nombre = `Periodo II ${anio} (May-Ago)`;
    f_inicio = `${anio}-05-01`;
    f_fin = `${anio}-08-31`;
    f_limite = `${anio}-05-31`; // Ejemplo: Límite 31 de Mayo
  } else {
    // Periodo III (Sep-Dic)
    codigo = `${anio}-III`;
    nombre = `Periodo III ${anio} (Sep-Dic)`;
    f_inicio = `${anio}-09-01`;
    f_fin = `${anio}-12-31`;
    f_limite = `${anio}-09-30`; // Ejemplo: Límite 30 de Septiembre
  }

  // 1. Verificar si el periodo ya existe
  const [rows]: any = await db.execute(
    'SELECT id FROM periodos_academicos WHERE codigo = ? LIMIT 1',
    [codigo]
  );

  if (rows.length > 0) return rows[0].id;

  // 2. Si no existe, lo insertamos con TODAS las fechas calculadas
  const [result]: any = await db.execute(`
    INSERT INTO periodos_academicos 
    (codigo, nombre, fecha_inicio, fecha_fin, fecha_limite_solicitud, es_actual) 
    VALUES (?, ?, ?, ?, ?, 0)
  `, [codigo, nombre, f_inicio, f_fin, f_limite]);
  
  return result.insertId;
}

/**
 * PROCESO DE ENVÍO DE SOLICITUD (VERSIÓN HISTORIAL Y RENOVACIÓN)
 */
export async function enviarSolicitud(formData: FormData) {
  try {
    // 1. EXTRAER DATOS
    const userId = formData.get('user_id')
    const emailInstitucional = formData.get('email_institucional')
    const tipoBeca = formData.get('tipoBeca')
    const promedio = formData.get('promedio')
    const motivo = formData.get('motivo')

    if (!userId || !emailInstitucional || !tipoBeca || !promedio) {
      return { error: "Faltan datos obligatorios." }
    }

    const userIdNum = parseInt(userId as string);

    // 🟢 VERIFICACIÓN DE VETO
    const [statusRows]: any = await db.execute(
      'SELECT ha_tenido_beca, beca_perdida FROM students WHERE id = ?',
      [userIdNum]
    );
    const status = statusRows[0];
    
    if (status?.beca_perdida === 1) {
      return { error: "Solicitud Denegada: Usted ha sido inhabilitado para optar a beneficios según el reglamento." };
    }

    // 🟢 PROCESAMIENTO DE MATERIAS
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const materiasArray = materiasNombres.map((nombre, index) => {
        const nota = parseFloat(materiasNotas[index] as string || "0");
        return { nombre: nombre as string, nota: nota };
    }).filter(m => m.nombre && m.nombre.trim() !== ""); 

    // Bloqueo por reprobadas
    const tieneReprobadas = materiasArray.some(m => m.nota < 10);
    if (tieneReprobadas) {
        return { error: "Solicitud Denegada: No puede optar a una beca con materias reprobadas." };
    }

    const materiasJsonString = JSON.stringify(materiasArray);
    const numPromedio = parseFloat(promedio as string);
    
    // Determinamos estatus inicial
    const estatusFinal = numPromedio < 16.50 ? 'Revisión Especial' : 'Pendiente';

    // 🟢 OBTENER PERIODO DESTINO (CON FECHAS AUTOMÁTICAS)
    const periodoId = await obtenerOCrearPeriodoObjetivo();

    // PROCESAR ARCHIVOS
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    const [rutaFoto, rutaCedula] = await Promise.all([
      guardarArchivo(formData.get('foto_carnet') as File),
      guardarArchivo(formData.get('copia_cedula') as File)
    ])

    const ingresoTotal = parseFloat(formData.get('monto_ingreso_sueldo') as string || "0") + 
                         parseFloat(formData.get('monto_ingreso_extra') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_pension') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_ayuda') as string || "0");

    /**
     * 🔴 LÓGICA DE HISTORIAL
     */
    const [solicitudPeriodo]: any = await db.execute(
        'SELECT id, estatus FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
        [userIdNum, periodoId]
    );

    if (solicitudPeriodo.length > 0) {
        const existente = solicitudPeriodo[0];
        
        if (existente.estatus === 'Aprobada' || existente.estatus === 'Rechazada') {
            return { error: "Ya existe una decisión final para este periodo académico." };
        }

        // UPDATE
        let updateQuery = `
            UPDATE solicitudes SET 
                email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
                motivo_solicitud = ?, materias_json = ?, ingreso_familiar_total = ?, 
                estatus = ?, fecha_registro = NOW()
        `;
        const updateParams: any[] = [
            emailInstitucional, tipoBeca, numPromedio, motivo, 
            materiasJsonString, ingresoTotal, estatusFinal
        ];

        if (rutaFoto) { updateQuery += `, foto_carnet = ?`; updateParams.push(rutaFoto); }
        if (rutaCedula) { updateQuery += `, copia_cedula = ?`; updateParams.push(rutaCedula); }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(existente.id);

        await db.execute(updateQuery, updateParams);

    } else {
        // INSERT
        await db.execute(`
          INSERT INTO solicitudes (
            user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
            motivo_solicitud, materias_json, ingreso_familiar_total, estatus, 
            foto_carnet, copia_cedula, fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            userIdNum, periodoId, emailInstitucional, tipoBeca, numPromedio, 
            motivo, materiasJsonString, ingresoTotal, estatusFinal, rutaFoto, rutaCedula
        ]);
    }

    // 🟢 ACTUALIZAR ENCUESTA
    const respuestasEncuesta = {
      identificacion: {
        nombres: formData.get('socio_nombres'),
        apellidos: formData.get('socio_apellidos'),
        cedula: formData.get('socio_cedula'),
        fecha_nac: formData.get('socio_fecha_nac'),
        lugar_nac: formData.get('socio_lugar_nac'),
        edad: formData.get('socio_edad'),
        nacionalidad: formData.get('socio_nacionalidad'),
        estado_civil: formData.get('socio_estado_civil'),
        sexo: formData.get('socio_sexo'),
        direccion: formData.get('socio_direccion'),
        municipio: formData.get('socio_municipio'),
        telf_hab: formData.get('socio_telf_hab'),
        celular: formData.get('socio_celular'),
        email_institucional: formData.get('socio_Institucional')
      },
      laboral: { empresa: formData.get('socio_trabajo_empresa'), direccion: formData.get('socio_trabajo_dir'), cargo: formData.get('socio_trabajo_cargo'), sueldo: formData.get('socio_trabajo_sueldo') },
      academico: { ue_procedencia: formData.get('socio_ue_procedencia'), otros_estudios: formData.get('socio_otros_estudios'), fecha_unimar: formData.get('socio_fecha_unimar'), carrera: formData.get('socio_carrera'), trimestre: formData.get('socio_trimestre'), modalidad: formData.get('socio_modalidad') },
      familiar: { padre: { nombre: formData.get('padre_nombre'), edad: formData.get('padre_edad'), ocupacion: formData.get('padre_ocupacion'), trabajo: formData.get('padre_trabajo') }, madre: { nombre: formData.get('madre_nombre'), edad: formData.get('madre_edad'), ocupacion: formData.get('madre_ocupacion'), trabajo: formData.get('madre_trabajo') }, num_hermanos: formData.get('familia_num_hermanos'), hermanos_uni: formData.get('familia_hermanos_uni'), relacion_fam: formData.get('socio_relacion_fam') },
      economico: { rango_ingreso: formData.get('rango_ingreso_familiar'), ingresos: { sueldo: formData.get('monto_ingreso_sueldo'), extra: formData.get('monto_ingreso_extra'), pension: formData.get('monto_ingreso_pension'), ayuda: formData.get('monto_ingreso_ayuda') }, egresos: { mercado: formData.get('monto_egreso_mercado'), vivienda: formData.get('monto_egreso_vivienda'), salud: formData.get('monto_egreso_salud'), servicios: formData.get('monto_egreso_servicios') } },
      vivienda: { tipo: formData.get('vivienda_tipo'), estatus: formData.get('vivienda_estatus'), servicios: { agua: formData.get('serv_agua') === 'on', luz: formData.get('serv_luz') === 'on', gas: formData.get('serv_gas') === 'on', aseo: formData.get('serv_aseo') === 'on', internet: formData.get('serv_internet') === 'on' }, equipamiento: { lavadora: formData.get('equip_lavadora') === 'on', nevera: formData.get('equip_nevera') === 'on', cable: formData.get('equip_cable') === 'on' } },
      salud: { enfermedad: formData.get('salud_enfermedad_desc'), tratamiento: formData.get('salud_tratamiento') }
    };

    await db.execute(`
      INSERT INTO estudios_socioeconomicos (student_id, tipo, respuestas_json, puntaje, nivel_riesgo, created_at)
      VALUES (?, 'estudiante', ?, 0, 'Pendiente', NOW())
      ON DUPLICATE KEY UPDATE respuestas_json = VALUES(respuestas_json), created_at = NOW()
    `, [userIdNum, JSON.stringify(respuestasEncuesta)]);

    // 🟢 Recalcular Índice Global pasando las materias de ESTA solicitud
    await actualizarIndiceGlobal(userIdNum, materiasArray);

    revalidatePath('/admin/solicitudes')
    revalidatePath('/Solicitud')
    revalidatePath('/perfil')
    
    return { success: true }

  } catch (error: any) {
    console.error("❌ Error en Proceso de Solicitud:", error)
    return { error: "Error crítico al procesar la solicitud." }
  }
}