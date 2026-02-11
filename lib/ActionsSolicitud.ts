'use server'

import { db } from './db'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { mkdir } from 'fs/promises'
import { guardarArchivo } from './SolicitudUtils'
import { actualizarIndiceGlobal, obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'

/**
 * PROCESO DE ENVÍO DE SOLICITUD
 * Orquesta la validación, almacenamiento de archivos y guardado en BD.
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

    // Verificación de veto
    const [statusRows]: any = await db.execute(
      'SELECT beca_perdida FROM students WHERE id = ?',
      [userIdNum]
    );
    if (statusRows[0]?.beca_perdida === 1) {
      return { error: "Solicitud Denegada: Usted ha sido inhabilitado para optar a beneficios." };
    }

    // Procesamiento de materias
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');
    
    const materiasArray = materiasNombres.map((nombre, index) => ({
        nombre: nombre as string,
        nota: parseFloat(materiasNotas[index] as string || "0")
    })).filter(m => m.nombre && m.nombre.trim() !== ""); 

    // Bloqueo por reprobadas
    if (materiasArray.some(m => m.nota < 10)) {
        return { error: "Solicitud Denegada: No puede optar a una beca con materias reprobadas." };
    }

    const materiasJsonString = JSON.stringify(materiasArray);
    const numPromedio = parseFloat(promedio as string);
    
    // Determinamos estatus inicial
    const estatusFinal = numPromedio < 16.50 ? 'Revisión Especial' : 'Pendiente';

    // 🟢 LÓGICA DE PERIODO INTELIGENTE:
    // Obtenemos el periodo objetivo calculado por el sistema.
    let periodoId = await obtenerOCrearPeriodoObjetivo();

    // 🟢 PROTECCIÓN DE HISTORIAL: 
    // Buscamos si el usuario ya tiene una solicitud APROBADA en este periodo específico.
    const [checkAprobada]: any = await db.execute(
      'SELECT id FROM solicitudes WHERE user_id = ? AND periodo_id = ? AND estatus = "Aprobada"',
      [userIdNum, periodoId]
    );

    // Si ya existe una aprobada para el periodo que el sistema cree que es el actual,
    // significa que el estudiante está intentando renovar para el SIGUIENTE.
    // Por lo tanto, no debemos hacer UPDATE, sino dejar que la lógica de INSERT cree un nuevo registro.
    // (La lógica de obtenerOCrearPeriodoObjetivo debería manejar la progresión, 
    // pero aquí ponemos un seguro para no sobreescribir jamás una 'Aprobada').

    // PROCESAR ARCHIVOS
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {})
    
    const [rutaFoto, rutaCedula] = await Promise.all([
      guardarArchivo(formData.get('foto_carnet') as File),
      guardarArchivo(formData.get('copia_cedula') as File)
    ])

    const ingresoTotal = (parseFloat(formData.get('monto_ingreso_sueldo') as string || "0") + 
                         parseFloat(formData.get('monto_ingreso_extra') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_pension') as string || "0") +
                         parseFloat(formData.get('monto_ingreso_ayuda') as string || "0"));

    // 🟢 LÓGICA DE GUARDADO ACTUALIZADA
    // Solo permitimos UPDATE si la solicitud existe Y NO ha sido Aprobada/Rechazada.
    const [solicitudPeriodo]: any = await db.execute(
        'SELECT id, estatus FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
        [userIdNum, periodoId]
    );

    if (solicitudPeriodo.length > 0 && solicitudPeriodo[0].estatus !== 'Aprobada' && solicitudPeriodo[0].estatus !== 'Rechazada') {
        const existente = solicitudPeriodo[0];

        let updateQuery = `
            UPDATE solicitudes SET 
                email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
                motivo_solicitud = ?, materias_json = ?, ingreso_familiar_total = ?, 
                estatus = ?, fecha_registro = NOW()
        `;
        const updateParams: any[] = [emailInstitucional, tipoBeca, numPromedio, motivo, materiasJsonString, ingresoTotal, estatusFinal];

        if (rutaFoto) { updateQuery += `, foto_carnet = ?`; updateParams.push(rutaFoto); }
        if (rutaCedula) { updateQuery += `, copia_cedula = ?`; updateParams.push(rutaCedula); }

        updateQuery += ` WHERE id = ?`;
        updateParams.push(existente.id);

        await db.execute(updateQuery, updateParams);
    } else if (solicitudPeriodo.length > 0 && (solicitudPeriodo[0].estatus === 'Aprobada' || solicitudPeriodo[0].estatus === 'Rechazada')) {
        // Si ya hay una decisión final para este periodo, devolvemos error para evitar duplicidad técnica
        return { error: "Ya existe una decisión final para este periodo académico en el sistema." };
    } else {
        // 🟢 INSERT: Si no existe solicitud para este periodo, creamos una nueva (Kardex limpio)
        await db.execute(`
          INSERT INTO solicitudes (
            user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
            motivo_solicitud, materias_json, ingreso_familiar_total, estatus, 
            foto_carnet, copia_cedula, fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [userIdNum, periodoId, emailInstitucional, tipoBeca, numPromedio, motivo, materiasJsonString, ingresoTotal, estatusFinal, rutaFoto, rutaCedula]);
    }

    // ACTUALIZAR ENCUESTA
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

    // Recalcular índice global
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