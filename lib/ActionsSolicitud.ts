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
 * LÓGICA DE PERIODO AUTOMÁTICO
 * Calcula el periodo académico destino según la fecha actual.
 */
async function obtenerOCrearPeriodoObjetivo() {
  const fecha = new Date();
  const mes = fecha.getMonth() + 1; // 1-12
  const anio = fecha.getFullYear();

  let codigo = "";
  let nombre = "";

  // Lógica: La beca se solicita para el periodo SIGUIENTE al actual
  if (mes >= 1 && mes <= 4) {
    codigo = `${anio}-II`;
    nombre = `Periodo II ${anio} (May-Ago)`;
  } else if (mes >= 5 && mes <= 8) {
    codigo = `${anio}-III`;
    nombre = `Periodo III ${anio} (Sep-Dic)`;
  } else {
    codigo = `${anio + 1}-I`;
    nombre = `Periodo I ${anio + 1} (Ene-Abr)`;
  }

  // 1. Buscar si ya existe el periodo
  const [rows]: any = await db.execute(
    'SELECT id FROM periodos_academicos WHERE codigo = ? LIMIT 1',
    [codigo]
  );

  if (rows.length > 0) return rows[0].id;

  // 2. Si no existe, crearlo automáticamente
  const [result]: any = await db.execute(
    'INSERT INTO periodos_academicos (codigo, nombre, es_actual) VALUES (?, ?, 0)',
    [codigo, nombre]
  );
  
  return result.insertId;
}

/**
 * PROCESO DE ENVÍO DE SOLICITUD (VERSIÓN FINAL: EDICIÓN Y ACTUALIZACIÓN)
 */
export async function enviarSolicitud(formData: FormData) {
  try {
    // 1. EXTRAER Y VALIDAR DATOS BÁSICOS
    const userId = formData.get('user_id')
    const emailInstitucional = formData.get('email_institucional')
    const tipoBeca = formData.get('tipoBeca')
    const promedio = formData.get('promedio')
    const motivo = formData.get('motivo')

    if (!userId || !emailInstitucional || !tipoBeca || !promedio) {
      return { error: "Faltan datos obligatorios del formulario principal." }
    }

    // 🟢 REGLA DE ORO: VERIFICACIÓN DE VETO Y BECA ÚNICA
    const [statusRows]: any = await db.execute(
      'SELECT ha_tenido_beca, beca_perdida FROM students WHERE id = ?',
      [userId]
    );
    const status = statusRows[0];
    
    if (status?.ha_tenido_beca === 1 || status?.beca_perdida === 1) {
      // Nota: Si ya tiene una solicitud pendiente, permitimos pasar para editarla.
      // Si no tiene pendiente y está vetado, lo bloqueamos.
      const [pendientes]: any = await db.execute(
          'SELECT id FROM solicitudes WHERE user_id = ? AND estatus = "Pendiente"', 
          [userId]
      );
      
      if (pendientes.length === 0) {
          return { 
            error: "Solicitud Denegada: El reglamento establece que solo se puede optar por una beca en toda la carrera o usted ha sido inhabilitado." 
          };
      }
    }

    // 🟢 PROCESAMIENTO DE MATERIAS A JSON
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    // Convertimos los arrays paralelos en un único array de objetos limpio
    const materiasArray = materiasNombres.map((nombre, index) => {
        const nota = parseFloat(materiasNotas[index] as string || "0");
        return {
            nombre: nombre as string,
            nota: nota
        };
    }).filter(m => m.nombre && m.nombre.trim() !== ""); 

    // Validación de materias reprobadas
    const tieneReprobadas = materiasArray.some(m => m.nota < 10);
    if (tieneReprobadas) {
        return { error: "Solicitud Denegada: No puede optar a una beca si tiene materias reprobadas en el ciclo actual." };
    }

    const materiasJsonString = JSON.stringify(materiasArray);

    // Validación de Promedio
    const numPromedio = parseFloat(promedio as string);
    if (numPromedio < 16.50) {
      return { error: `Su promedio actual (${numPromedio}) no cumple con el mínimo requerido de 16.50.` }
    }

    // VALIDACIÓN DE SEGURIDAD PARA ENCUESTA
    const nombresSocio = formData.get('socio_nombres');
    const cedulaSocio = formData.get('socio_cedula');
    
    if (!nombresSocio || !cedulaSocio) {
        return { error: "Por favor, complete los datos obligatorios de la Encuesta." }
    }

    // 2. OBTENER PERIODO OBJETIVO
    const periodoId = await obtenerOCrearPeriodoObjetivo();

    // 3. PROCESAR ARCHIVOS
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    const [rutaFoto, rutaCedula] = await Promise.all([
      guardarArchivo(formData.get('foto_carnet') as File),
      guardarArchivo(formData.get('copia_cedula') as File)
    ])

    // EXTRACCIÓN DE DATOS PARA REPORTES
    const ingresoTotal = parseFloat(formData.get('monto_ingreso_sueldo') as string || "0") + 
                         parseFloat(formData.get('monto_ingreso_extra') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_pension') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_ayuda') as string || "0");

    // 🔴 LÓGICA DE ACTUALIZACIÓN VS INSERCIÓN
    // Buscamos si ya existe una solicitud PENDIENTE para este usuario
    const [solicitudExistente]: any = await db.execute(
        'SELECT id FROM solicitudes WHERE user_id = ? AND estatus = "Pendiente"',
        [userId]
    );

    let solicitudIdFinal;

    if (solicitudExistente.length > 0) {
        // ==> MODO EDICIÓN: Actualizamos la existente
        solicitudIdFinal = solicitudExistente[0].id;
        
        // Construimos la query de actualización dinámica (solo actualizamos archivos si se subieron nuevos)
        let updateQuery = `
            UPDATE solicitudes SET 
                email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
                motivo_solicitud = ?, materias_json = ?, ingreso_familiar_total = ?, 
                fecha_registro = NOW()
        `;
        const updateParams: any[] = [
            emailInstitucional, tipoBeca, numPromedio, motivo, 
            materiasJsonString, ingresoTotal
        ];

        if (rutaFoto) {
            updateQuery += `, foto_carnet = ?`;
            updateParams.push(rutaFoto);
        }
        if (rutaCedula) {
            updateQuery += `, copia_cedula = ?`;
            updateParams.push(rutaCedula);
        }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(solicitudIdFinal);

        await db.execute(updateQuery, updateParams);

    } else {
        // ==> MODO CREACIÓN: Insertamos nueva
        const [resultSolicitud]: any = await db.execute(`
          INSERT INTO solicitudes (
            user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
            motivo_solicitud, materias_json, ingreso_familiar_total, estatus, 
            foto_carnet, copia_cedula, fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?, ?, NOW())
        `, [
            userId, periodoId, emailInstitucional, tipoBeca, numPromedio, 
            motivo, materiasJsonString, ingresoTotal, rutaFoto, rutaCedula
        ]);
        solicitudIdFinal = resultSolicitud.insertId;
    }

    // 5. PROCESAR ENCUESTA SOCIOECONÓMICA
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
      laboral: {
        empresa: formData.get('socio_trabajo_empresa'),
        direccion: formData.get('socio_trabajo_dir'),
        cargo: formData.get('socio_trabajo_cargo'),
        sueldo: formData.get('socio_trabajo_sueldo')
      },
      academico: {
        ue_procedencia: formData.get('socio_ue_procedencia'),
        otros_estudios: formData.get('socio_otros_estudios'),
        fecha_unimar: formData.get('socio_fecha_unimar'),
        carrera: formData.get('socio_carrera'),
        trimestre: formData.get('socio_trimestre'),
        modalidad: formData.get('socio_modalidad')
      },
      familiar: {
        padre: { nombre: formData.get('padre_nombre'), edad: formData.get('padre_edad'), ocupacion: formData.get('padre_ocupacion'), trabajo: formData.get('padre_trabajo') },
        madre: { nombre: formData.get('madre_nombre'), edad: formData.get('madre_edad'), ocupacion: formData.get('madre_ocupacion'), trabajo: formData.get('madre_trabajo') },
        num_hermanos: formData.get('familia_num_hermanos'),
        hermanos_uni: formData.get('familia_hermanos_uni'),
        relacion_fam: formData.get('socio_relacion_fam')
      },
      economico: {
        rango_ingreso: formData.get('rango_ingreso_familiar'),
        ingresos: { sueldo: formData.get('monto_ingreso_sueldo'), extra: formData.get('monto_ingreso_extra'), pension: formData.get('monto_ingreso_pension'), ayuda: formData.get('monto_ingreso_ayuda') },
        egresos: { mercado: formData.get('monto_egreso_mercado'), vivienda: formData.get('monto_egreso_vivienda'), salud: formData.get('monto_egreso_salud'), servicios: formData.get('monto_egreso_servicios') }
      },
      vivienda: {
        tipo: formData.get('vivienda_tipo'),
        estatus: formData.get('vivienda_estatus'),
        servicios: { 
            agua: formData.get('serv_agua') === 'on', 
            luz: formData.get('serv_luz') === 'on', 
            gas: formData.get('serv_gas') === 'on', 
            aseo: formData.get('serv_aseo') === 'on', 
            internet: formData.get('serv_internet') === 'on' 
        },
        equipamiento: { 
            lavadora: formData.get('equip_lavadora') === 'on', 
            nevera: formData.get('equip_nevera') === 'on', 
            cable: formData.get('equip_cable') === 'on' 
        }
      },
      salud: { 
        enfermedad: formData.get('salud_enfermedad_desc'), 
        // 🟢 CORRECCIÓN: Se asegura que el nombre coincida con el input
        tratamiento: formData.get('salud_tratamiento') 
      }
    };

    // 6. UPSERT DE ENCUESTA (Crear o Actualizar)
    await db.execute(`
      INSERT INTO estudios_socioeconomicos (
        student_id, tipo, respuestas_json, puntaje, nivel_riesgo, created_at
      ) VALUES (?, 'estudiante', ?, 0, 'Pendiente', NOW())
      ON DUPLICATE KEY UPDATE 
        respuestas_json = VALUES(respuestas_json),
        created_at = NOW()
    `, [userId, JSON.stringify(respuestasEncuesta)]);

    // 7. REVALIDAR RUTAS
    revalidatePath('/admin/solicitudes')
    revalidatePath('/Solicitud')
    
    return { success: true }

  } catch (error: any) {
    console.error("❌ Error en Proceso de Solicitud:", error)
    return { error: "Error crítico al procesar la solicitud." }
  }
}