'use server'

import type { PoolConnection, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { mkdir } from 'fs/promises'
import { guardarArchivo } from './SolicitudUtils'
import { actualizarIndiceGlobal, obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
// MOTOR UNIFICADO CON LÓGICA DE INGRESO RESIDUAL
import { calcularPuntajeUnificado } from './MotorBaremoUnificado'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);
const DOC_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/jpg", "image/png"]);

const MODALIDADES_REQUIEREN_18 = new Set([
  "BECA SOCIAL",
  "BECA A LA EXCELENCIA",
  "BECA A LA EXCELENCIA ACADÉMICA"
]);

const PROMEDIO_MINIMO_EXCELENCIA = 18;
const REGEX_NOTA_DECIMAL = /^\d{1,2}(\.\d{1,2})?$/;

type DocumentoColumna =
  | "foto_carnet"
  | "copia_cedula"
  | "constancia_residencia"
  | "declaracion_manutencion"
  | "informe_medico"
  | "partida_nacimiento"
  | "constancia_club"
  | "constancia_notas"
  | "notas_certificadas"
  | "carnet_discapacidad"
  | "documentos_filiacion";

interface StudentStatusRow extends RowDataPacket {
  beca_perdida: number;
  semestre: number | null;
}

interface SolicitudExistenteRow extends RowDataPacket {
  id: number;
  estatus: string;
  foto_carnet: string | null;
  copia_cedula: string | null;
  constancia_residencia: string | null;
  declaracion_manutencion: string | null;
  informe_medico: string | null;
  partida_nacimiento: string | null;
  constancia_club: string | null;
  constancia_notas: string | null;
  notas_certificadas: string | null;
  carnet_discapacidad: string | null;
  documentos_filiacion: string | null;
}

interface MateriaEnviada {
  codigo: string;
  nombre: string;
  nota: number;
}

const ETIQUETAS_DOCUMENTOS: Record<DocumentoColumna, string> = {
  foto_carnet: "Foto Tipo Carnet",
  copia_cedula: "Cédula de Identidad Ampliada",
  constancia_residencia: "Constancia de Residencia",
  declaracion_manutencion: "Declaración de Manutención",
  informe_medico: "Informe Médico",
  partida_nacimiento: "Partida de Nacimiento",
  constancia_club: "Constancia de Pertenencia",
  constancia_notas: "Constancia de Notas",
  notas_certificadas: "Notas Certificadas",
  carnet_discapacidad: "Carnet de Discapacidad",
  documentos_filiacion: "Documentos de Filiación"
};

const obtenerArchivoForm = (formData: FormData, key: DocumentoColumna): File | null => {
  const entry = formData.get(key);
  if (entry instanceof File && entry.size > 0) {
    return entry;
  }
  return null;
};

const validarArchivoSubido = (file: File | null, key: DocumentoColumna): string | null => {
  if (!file) return null;
  const soloImagen = key === "foto_carnet";
  const permitidos = soloImagen ? IMAGE_MIME_TYPES : DOC_MIME_TYPES;

  if (!permitidos.has(file.type)) {
    return `${ETIQUETAS_DOCUMENTOS[key]}: formato inválido (${soloImagen ? "solo JPG o PNG" : "solo PDF, JPG o PNG"}).`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `${ETIQUETAS_DOCUMENTOS[key]}: supera el límite máximo permitido de 2 MB.`;
  }
  return null;
};

const obtenerDocumentosRequeridos = (tipoBeca: string, semestre: number): DocumentoColumna[] => {
  const esPrimerTrimestre = semestre === 1;
  const requeridos: DocumentoColumna[] = ["foto_carnet", "copia_cedula"];

  if (tipoBeca === "BECA APRENDIZAJE") {
    requeridos.push("constancia_notas");
  } else if (tipoBeca === "BECA SOCIAL") {
    if (esPrimerTrimestre) requeridos.push("notas_certificadas");
  } else if (tipoBeca === "BECA POR DISCAPACIDAD") {
    if (esPrimerTrimestre) requeridos.push("notas_certificadas");
    requeridos.push("informe_medico", "carnet_discapacidad");
  } else if (tipoBeca === "BECA A LA EXCELENCIA" || tipoBeca === "BECA A LA EXCELENCIA ACADÉMICA") {
    requeridos.push("constancia_notas");
  } else if (tipoBeca === "Ayuda Económica Familiar" || tipoBeca === "Ayuda Económica para Hijos de Trabajadores") {
    requeridos.push("documentos_filiacion");
  } else if (tipoBeca === "Ayuda Económica por Actividades Extracurriculares") {
    requeridos.push("constancia_club");
  }

  return requeridos;
};

const parseEnteroNoNegativoEstricto = (val: FormDataEntryValue | null): number | null => {
  if (val === null || typeof val !== "string") return 0;
  const trimmed = val.trim();
  if (trimmed === "") return 0;
  if (!/^\d+$/.test(trimmed)) return null;
  const num = parseInt(trimmed, 10);
  return Number.isSafeInteger(num) && num >= 0 ? num : null;
};

const sanitizarSoloLetras = (val: FormDataEntryValue | null, permitirNo = false): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  if (permitirNo && trimmed.toUpperCase() === "NO") return "NO";
  const limpio = trimmed.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").trim();
  return limpio !== "" ? limpio : null;
};

const getStringOrNull = (val: FormDataEntryValue | null): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed !== "" ? trimmed : null;
};

const construirObservacionRechazo = (
  materiasReprobadas: MateriaEnviada[],
  numPromedio: number
): string | null => {
  const tieneReprobadas = materiasReprobadas.length > 0;
  const esPromedioBajo = numPromedio < 16;

  if (!tieneReprobadas && !esPromedioBajo) return null;

  const listadoReprobadas = materiasReprobadas
    .map((m) => `${m.nombre} (${m.nota} pts)`)
    .join(", ");

  if (tieneReprobadas && esPromedioBajo) {
    return `Solicitud no procedente: no cumple con los requisitos académicos mínimos exigidos por la normativa institucional. Se registró calificación reprobatoria en ${listadoReprobadas} y un promedio general de ${numPromedio.toFixed(2)} pts (mínimo requerido: 16.00 pts).`;
  }

  if (tieneReprobadas) {
    return `Solicitud no procedente: según la normativa académica vigente, es requisito indispensable haber aprobado la totalidad de las unidades curriculares inscritas (calificación mínima de 10 puntos). Se registró calificación reprobatoria en: ${listadoReprobadas}.`;
  }

  return `Solicitud no procedente: su promedio académico del período (${numPromedio.toFixed(2)} pts) se encuentra por debajo del índice mínimo requerido (16.00 puntos) para optar al programa de becas.`;
};

/**
 * Procesa el envío de la solicitud de beca, valida integridad de datos y documentos,
 * calcula el baremo institucional y sincroniza las tablas de solicitudes y estudios socioeconómicos.
 */
export async function enviarSolicitud(formData: FormData) {
  let connection: PoolConnection | undefined;

  try {
    // 1. EXTRAER DATOS BÁSICOS
    const userId = getStringOrNull(formData.get('user_id'));
    const emailInstitucional = getStringOrNull(formData.get('email_institucional'));
    const tipo_beca = getStringOrNull(formData.get('tipo_beca'));
    const motivo = getStringOrNull(formData.get('motivo_solicitud'));
    const trimestreSeleccionado = getStringOrNull(formData.get('trimestre_seleccionado'));

    if (!userId || !emailInstitucional || !tipo_beca) {
      return { error: "Faltan datos obligatorios en la sección de beneficios." };
    }

    if (!motivo || motivo.length < 20) {
      return { error: "La exposición de motivos debe contener al menos 20 caracteres." };
    }

    const userIdNum = parseInt(userId, 10);
    const trimestreNum = trimestreSeleccionado ? parseInt(trimestreSeleccionado, 10) : 1;

    if (isNaN(userIdNum) || userIdNum <= 0) {
      return { error: "Identificador de estudiante inválido." };
    }

    // 2. VERIFICACIÓN DE VETO Y SEMESTRE REAL DEL ESTUDIANTE
    const [statusRows] = await db.execute<StudentStatusRow[]>(
      'SELECT beca_perdida, semestre FROM students WHERE id = ?',
      [userIdNum]
    );
    if (statusRows.length === 0) {
      return { error: "No se encontró el registro académico del estudiante." };
    }
    if (statusRows[0].beca_perdida === 1) {
      return { error: "Solicitud Denegada: Su beneficio ha sido revocado permanentemente." };
    }

    const semestreEstudiante = Number(statusRows[0].semestre || trimestreNum || 1);

    // 3. PROCESAMIENTO Y VALIDACIÓN ESTRICTA DE MATERIAS (POSITIVOS 1.00 - 20.00, HASTA 2 DECIMALES)
    const materiasCodigos = formData.getAll('materias_codigos[]');
    const materiasNombres = formData.getAll('materias_nombres[]');
    const materiasNotas = formData.getAll('materias_notas[]');

    const materiasArray: MateriaEnviada[] = [];

    for (let index = 0; index < materiasCodigos.length; index++) {
      const nombre = String(materiasNombres[index] ?? "").trim();
      if (nombre === "") continue;

      const notaStr = String(materiasNotas[index] ?? "").trim().replace(",", ".");
      if (!REGEX_NOTA_DECIMAL.test(notaStr)) {
        return { error: "Todas las calificaciones deben ser números positivos entre 1 y 20 (máximo 2 decimales)." };
      }

      const notaDecimal = Number(parseFloat(notaStr).toFixed(2));
      if (!Number.isFinite(notaDecimal) || notaDecimal < 1 || notaDecimal > 20) {
        return { error: "Las calificaciones deben estar estrictamente entre 1 y 20 puntos." };
      }

      materiasArray.push({
        codigo: String(materiasCodigos[index] ?? "").trim(),
        nombre,
        nota: notaDecimal
      });
    }

    if (materiasArray.length === 0) {
      return { error: "Debe registrar al menos una unidad curricular con su calificación." };
    }

    // Recálculo seguro del promedio en el servidor
    const sumaNotas = materiasArray.reduce((acc, m) => acc + m.nota, 0);
    const numPromedio = Number((sumaNotas / materiasArray.length).toFixed(2));

    // Regla de negocio: Beca Social y Beca a la Excelencia exigen promedio >= 18.00
    if (MODALIDADES_REQUIEREN_18.has(tipo_beca) && numPromedio < PROMEDIO_MINIMO_EXCELENCIA) {
      return {
        error: `La modalidad "${tipo_beca}" requiere un promedio igual o superior a 18.00 puntos (su promedio actual es ${numPromedio.toFixed(2)}).`
      };
    }

    const materiasJsonString = JSON.stringify({
      trimestre: isNaN(trimestreNum) ? semestreEstudiante : trimestreNum,
      materias: materiasArray,
      fecha_proceso: new Date().toISOString()
    });

    // Evaluación de rechazo automático (permite guardar todo el expediente en BD con observación formal)
    const materiasReprobadas = materiasArray.filter(m => m.nota < 10);
    const tieneReprobadas = materiasReprobadas.length > 0;
    const estatusFinal = (numPromedio < 16 || tieneReprobadas) ? 'Rechazada' : 'Pendiente';
    const observacionAutomatica = construirObservacionRechazo(materiasReprobadas, numPromedio);

    // 4. VALIDACIÓN ESTRICTA DE ENTEROS NO NEGATIVOS (INGRESOS, EGRESOS, EDADES Y HERMANOS)
    const sueldoReal = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_sueldo'));
    const montoFamiliarExtra = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_familiar'));
    const montoExtra = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_extra'));
    const montoPension = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_pension'));
    const montoAyuda = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_ayuda'));

    const egresoMercado = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_mercado'));
    const egresoVivienda = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_vivienda'));
    const egresoSalud = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_salud'));
    const egresoServicios = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_servicios'));

    const padreEdad = parseEnteroNoNegativoEstricto(formData.get('padre_edad'));
    const madreEdad = parseEnteroNoNegativoEstricto(formData.get('madre_edad'));
    const numHermanos = parseEnteroNoNegativoEstricto(formData.get('familia_num_hermanos'));
    const hermanosUni = parseEnteroNoNegativoEstricto(formData.get('familia_hermanos_uni'));

    if (
      sueldoReal === null ||
      montoFamiliarExtra === null ||
      montoExtra === null ||
      montoPension === null ||
      montoAyuda === null ||
      egresoMercado === null ||
      egresoVivienda === null ||
      egresoSalud === null ||
      egresoServicios === null ||
      padreEdad === null ||
      madreEdad === null ||
      numHermanos === null ||
      hermanosUni === null
    ) {
      return { error: "Todos los montos, edades y cantidades deben ser números enteros sin signos negativos." };
    }

    if ((padreEdad !== 0 && padreEdad > 120) || (madreEdad !== 0 && madreEdad > 120)) {
      return { error: "Las edades de los padres deben ser valores enteros entre 1 y 120 años." };
    }

    if (hermanosUni > numHermanos) {
      return { error: "La cantidad de hermanos universitarios no puede superar el total de hermanos." };
    }

    // 5. VALIDACIÓN DE ARCHIVOS EN MEMORIA ANTES DE ESCRIBIR EN DISCO
    const archivosEntrantes: Record<DocumentoColumna, File | null> = {
      foto_carnet: obtenerArchivoForm(formData, 'foto_carnet'),
      copia_cedula: obtenerArchivoForm(formData, 'copia_cedula'),
      constancia_residencia: obtenerArchivoForm(formData, 'constancia_residencia'),
      declaracion_manutencion: obtenerArchivoForm(formData, 'declaracion_manutencion'),
      informe_medico: obtenerArchivoForm(formData, 'informe_medico'),
      partida_nacimiento: obtenerArchivoForm(formData, 'partida_nacimiento'),
      constancia_club: obtenerArchivoForm(formData, 'constancia_club'),
      constancia_notas: obtenerArchivoForm(formData, 'constancia_notas'),
      notas_certificadas: obtenerArchivoForm(formData, 'notas_certificadas'),
      carnet_discapacidad: obtenerArchivoForm(formData, 'carnet_discapacidad'),
      documentos_filiacion: obtenerArchivoForm(formData, 'documentos_filiacion')
    };

    for (const key of Object.keys(archivosEntrantes) as DocumentoColumna[]) {
      const errorArchivo = validarArchivoSubido(archivosEntrantes[key], key);
      if (errorArchivo) {
        return { error: errorArchivo };
      }
    }

    // 6. SINCRONIZACIÓN DE PERIODO
    const periodoId = await obtenerOCrearPeriodoObjetivo();

    // Verificación previa de solicitud existente para validar documentos obligatorios antes de escribir archivos
    const [prevSolicitudRows] = await db.execute<SolicitudExistenteRow[]>(
      'SELECT id, estatus, foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion, informe_medico, partida_nacimiento, constancia_club, constancia_notas, notas_certificadas, carnet_discapacidad, documentos_filiacion FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
      [userIdNum, periodoId]
    );
    const solicitudPrevia = prevSolicitudRows[0] ?? null;

    const docsRequeridos = obtenerDocumentosRequeridos(tipo_beca, semestreEstudiante);
    for (const docKey of docsRequeridos) {
      const tieneNuevo = archivosEntrantes[docKey] !== null;
      const tieneGuardado = Boolean(solicitudPrevia?.[docKey]);
      if (!tieneNuevo && !tieneGuardado) {
        return { error: `Documentación incompleta: debe adjuntar obligatoriamente "${ETIQUETAS_DOCUMENTOS[docKey]}".` };
      }
    }

    // 7. CARGA DE ARCHIVOS (Base + Documentos institucionales)
    await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true }).catch(() => {});

    const [
      rutaFoto,
      rutaCedula,
      rutaConstanciaResidencia,
      rutaDeclaracionManutencion,
      rutaInformeMedico,
      rutaPartidaNacimiento,
      rutaConstanciaClub,
      rutaConstanciaNotas,
      rutaNotasCertificadas,
      rutaCarnetDiscapacidad,
      rutaDocumentosFiliacion
    ] = await Promise.all([
      archivosEntrantes.foto_carnet ? guardarArchivo(archivosEntrantes.foto_carnet) : Promise.resolve(null),
      archivosEntrantes.copia_cedula ? guardarArchivo(archivosEntrantes.copia_cedula) : Promise.resolve(null),
      archivosEntrantes.constancia_residencia ? guardarArchivo(archivosEntrantes.constancia_residencia) : Promise.resolve(null),
      archivosEntrantes.declaracion_manutencion ? guardarArchivo(archivosEntrantes.declaracion_manutencion) : Promise.resolve(null),
      archivosEntrantes.informe_medico ? guardarArchivo(archivosEntrantes.informe_medico) : Promise.resolve(null),
      archivosEntrantes.partida_nacimiento ? guardarArchivo(archivosEntrantes.partida_nacimiento) : Promise.resolve(null),
      archivosEntrantes.constancia_club ? guardarArchivo(archivosEntrantes.constancia_club) : Promise.resolve(null),
      archivosEntrantes.constancia_notas ? guardarArchivo(archivosEntrantes.constancia_notas) : Promise.resolve(null),
      archivosEntrantes.notas_certificadas ? guardarArchivo(archivosEntrantes.notas_certificadas) : Promise.resolve(null),
      archivosEntrantes.carnet_discapacidad ? guardarArchivo(archivosEntrantes.carnet_discapacidad) : Promise.resolve(null),
      archivosEntrantes.documentos_filiacion ? guardarArchivo(archivosEntrantes.documentos_filiacion) : Promise.resolve(null),
    ]);

    // --- CÁLCULO DE INGRESOS (Sincronizado con nombres reales de columnas) ---
    const ingresoTotal =
      sueldoReal +
      montoExtra +
      montoPension +
      montoAyuda +
      montoFamiliarExtra;

    // 8. MOTOR DE BAREMO UNIFICADO
    const { puntaje: puntajeCalculado, nivelRiesgo } = await calcularPuntajeUnificado({
      ingresoTotal,
      monto_ingreso_sueldo: sueldoReal,
      monto_ingreso_extra: montoExtra,
      monto_ingreso_pension: montoPension,
      monto_ingreso_ayuda: montoAyuda,
      monto_ingreso_familiar: montoFamiliarExtra,
      monto_egreso_mercado: egresoMercado,
      monto_egreso_vivienda: egresoVivienda,
      monto_egreso_salud: egresoSalud,
      monto_egreso_servicios: egresoServicios,
      viviendaTipo: getStringOrNull(formData.get('vivienda_tipo')) || "",
      viviendaEstatus: getStringOrNull(formData.get('vivienda_estatus')) || "",
      numHermanos,
      poseeEmpleo: getStringOrNull(formData.get('posee_empleo_aspirante')) || "No",
      saludCondicion: getStringOrNull(formData.get('salud_condicion_especial')) || "No",
      servInternet: formData.get('serv_internet') === 'on' ? 'on' : 'off',
      equipNevera: formData.get('equip_nevera') === 'on' ? 'on' : 'off',
      equipLavadora: formData.get('equip_lavadora') === 'on' ? 'on' : 'off'
    });

    // 9. TRANSACCIÓN DE GUARDADO
    connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      const [solicitudExistente] = await connection.execute<SolicitudExistenteRow[]>(
        'SELECT id, estatus, foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion, informe_medico, partida_nacimiento, constancia_club, constancia_notas, notas_certificadas, carnet_discapacidad, documentos_filiacion FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
        [userIdNum, periodoId]
      );

      if (solicitudExistente.length > 0) {
        const existente = solicitudExistente[0];
        await connection.execute(`
          UPDATE solicitudes SET 
            email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
            motivo_solicitud = ?, materias_json = ?, estatus = ?, observaciones_admin = ?,
            foto_carnet = ?, copia_cedula = ?, 
            constancia_residencia = ?, declaracion_manutencion = ?, informe_medico = ?, 
            partida_nacimiento = ?, constancia_club = ?, constancia_notas = ?, 
            notas_certificadas = ?, carnet_discapacidad = ?, documentos_filiacion = ?, 
            fecha_registro = NOW()
          WHERE id = ?
        `, [
          emailInstitucional,
          tipo_beca,
          numPromedio,
          motivo,
          materiasJsonString,
          estatusFinal,
          observacionAutomatica,
          rutaFoto || existente.foto_carnet,
          rutaCedula || existente.copia_cedula,
          rutaConstanciaResidencia || existente.constancia_residencia,
          rutaDeclaracionManutencion || existente.declaracion_manutencion,
          rutaInformeMedico || existente.informe_medico,
          rutaPartidaNacimiento || existente.partida_nacimiento,
          rutaConstanciaClub || existente.constancia_club,
          rutaConstanciaNotas || existente.constancia_notas,
          rutaNotasCertificadas || existente.notas_certificadas,
          rutaCarnetDiscapacidad || existente.carnet_discapacidad,
          rutaDocumentosFiliacion || existente.documentos_filiacion,
          existente.id
        ]);
      } else {
        await connection.execute(`
          INSERT INTO solicitudes (
            user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
            motivo_solicitud, materias_json, estatus, observaciones_admin,
            foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion, 
            informe_medico, partida_nacimiento, constancia_club, constancia_notas, 
            notas_certificadas, carnet_discapacidad, documentos_filiacion, fecha_registro
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          userIdNum,
          periodoId,
          emailInstitucional,
          tipo_beca,
          numPromedio,
          motivo,
          materiasJsonString,
          estatusFinal,
          observacionAutomatica,
          rutaFoto || null,
          rutaCedula || null,
          rutaConstanciaResidencia || null,
          rutaDeclaracionManutencion || null,
          rutaInformeMedico || null,
          rutaPartidaNacimiento || null,
          rutaConstanciaClub || null,
          rutaConstanciaNotas || null,
          rutaNotasCertificadas || null,
          rutaCarnetDiscapacidad || null,
          rutaDocumentosFiliacion || null
        ]);
      }

      // 10. GUARDADO EN TABLA SOCIOECONÓMICA
      await connection.execute(`
        INSERT INTO estudios_socioeconomicos (
          student_id, periodo_id, tipo,
          socio_lugar_nac, socio_nacionalidad, socio_estado_civil, socio_telf_hab, direccion_completa,
          socio_trabajo_empresa, socio_trabajo_cargo, monto_ingreso_sueldo,
          socio_ue_procedencia, socio_otros_estudios, socio_fecha_unimar, socio_modalidad,
          padre_nombre, padre_edad, padre_ocupacion, padre_trabajo,
          madre_nombre, madre_edad, madre_ocupacion, madre_trabajo,
          familia_num_hermanos, familia_hermanos_uni,
          rango_ingreso_familiar, monto_ingreso_extra, monto_ingreso_pension, monto_ingreso_ayuda, monto_ingreso_familiar,
          monto_egreso_mercado, monto_egreso_vivienda, monto_egreso_salud, monto_egreso_servicios,
          vivienda_tipo, vivienda_estatus, 
          serv_internet, serv_luz, serv_agua, serv_gas, serv_aseo,
          equip_nevera, equip_lavadora, equip_cable,
          salud_condicion_especial, salud_enfermedad_desc, salud_tratamiento,
          situacion_laboral_jefe, familia_relacion,
          puntaje, nivel_riesgo, created_at
        ) VALUES (
          ?, ?, 'estudiante', 
          ?, ?, ?, ?, ?,
          ?, ?, ?, 
          ?, ?, ?, ?, 
          ?, ?, ?, ?, 
          ?, ?, ?, ?, 
          ?, ?, 
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, 
          ?, ?, 
          ?, ?, ?, ?, ?, 
          ?, ?, ?, 
          ?, ?, ?, 
          ?, ?,
          ?, ?, NOW()
        )
        ON DUPLICATE KEY UPDATE 
          socio_telf_hab = VALUES(socio_telf_hab),
          direccion_completa = VALUES(direccion_completa),
          monto_ingreso_sueldo = VALUES(monto_ingreso_sueldo),
          monto_ingreso_familiar = VALUES(monto_ingreso_familiar),
          monto_ingreso_extra = VALUES(monto_ingreso_extra),
          monto_egreso_mercado = VALUES(monto_egreso_mercado),
          monto_egreso_vivienda = VALUES(monto_egreso_vivienda),
          monto_egreso_salud = VALUES(monto_egreso_salud),
          monto_egreso_servicios = VALUES(monto_egreso_servicios),
          familia_relacion = VALUES(familia_relacion),
          puntaje = VALUES(puntaje),
          nivel_riesgo = VALUES(nivel_riesgo),
          created_at = NOW()
      `, [
        userIdNum,
        periodoId,
        sanitizarSoloLetras(formData.get('socio_lugar_nac')),
        getStringOrNull(formData.get('socio_nacionalidad')),
        getStringOrNull(formData.get('socio_estado_civil')),
        getStringOrNull(formData.get('socio_telf_hab')),
        getStringOrNull(formData.get('direccion_completa')),
        sanitizarSoloLetras(formData.get('socio_trabajo_empresa'), true),
        sanitizarSoloLetras(formData.get('socio_trabajo_cargo'), true),
        sueldoReal,
        sanitizarSoloLetras(formData.get('socio_ue_procedencia')),
        sanitizarSoloLetras(formData.get('socio_otros_estudios')),
        getStringOrNull(formData.get('socio_fecha_unimar')),
        getStringOrNull(formData.get('socio_modalidad')),
        sanitizarSoloLetras(formData.get('padre_nombre')),
        padreEdad,
        sanitizarSoloLetras(formData.get('padre_ocupacion')),
        sanitizarSoloLetras(formData.get('padre_trabajo')),
        sanitizarSoloLetras(formData.get('madre_nombre')),
        madreEdad,
        sanitizarSoloLetras(formData.get('madre_ocupacion')),
        sanitizarSoloLetras(formData.get('madre_trabajo')),
        numHermanos,
        hermanosUni,
        getStringOrNull(formData.get('rango_ingreso_familiar')),
        montoExtra,
        montoPension,
        montoAyuda,
        montoFamiliarExtra,
        egresoMercado,
        egresoVivienda,
        egresoSalud,
        egresoServicios,
        getStringOrNull(formData.get('vivienda_tipo')),
        getStringOrNull(formData.get('vivienda_estatus')),
        formData.get('serv_internet') === 'on' ? 'on' : 'off',
        formData.get('serv_luz') === 'on' ? 'on' : 'off',
        formData.get('serv_agua') === 'on' ? 'on' : 'off',
        formData.get('serv_gas') === 'on' ? 'on' : 'off',
        formData.get('serv_aseo') === 'on' ? 'on' : 'off',
        formData.get('equip_nevera') === 'on' ? 'on' : 'off',
        formData.get('equip_lavadora') === 'on' ? 'on' : 'off',
        formData.get('equip_cable') === 'on' ? 'on' : 'off',
        getStringOrNull(formData.get('salud_condicion_especial')) || 'No',
        getStringOrNull(formData.get('salud_enfermedad_desc')),
        getStringOrNull(formData.get('salud_tratamiento')),
        getStringOrNull(formData.get('posee_empleo_aspirante')) || 'No',
        getStringOrNull(formData.get('familia_relacion')) || 'Buena',
        puntajeCalculado || 0,
        nivelRiesgo || 'Bajo'
      ]);

      await connection.commit();
    } catch (sqlError) {
      if (connection) await connection.rollback();
      throw sqlError;
    } finally {
      if (connection) connection.release();
    }

    await actualizarIndiceGlobal(userIdNum, materiasArray);
    revalidatePath('/admin/solicitudes');
    revalidatePath('/perfil');

    return { success: true };

  } catch (error: unknown) {
    console.error("❌ Error en Proceso de Solicitud:", error);
    return { error: "Error crítico al procesar la solicitud institucional." };
  }
}