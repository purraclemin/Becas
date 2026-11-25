'use server'

import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { randomUUID } from 'crypto'
import { db } from './db'
import { revalidatePath } from 'next/cache'
import path from 'path'
import { mkdir } from 'fs/promises'
import { guardarArchivo } from './SolicitudUtils'
import { actualizarIndiceGlobal, obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import {
  asegurarDatosSocioeconomicosSimulados,
  obtenerRecordParaPostulacion,
} from './ActionsRecordAcademico'
import { SISTEMA_ADMIN_ID } from './RecordAcademicoUtils'
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

interface MiembroNucleoSanitizado {
  nombre: string;
  edad: string;
  sexo: string;
  parentesco: string;
  instruccion: string;
  ocupacion: string;
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
  const limpio = trimmed.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s/]/g, "").trim();
  return limpio !== "" ? limpio : trimmed;
};

const sanitizarTextoSeguro = (
  val: FormDataEntryValue | null,
  maxLength = 250,
  permitirNo = false
): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  if (permitirNo && trimmed.toUpperCase() === "NO") return "NO";
  const limpio = trimmed
    .replace(/[<>]/g, "")
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¡!¿?()\-/#&"]/g, "")
    .trim()
    .slice(0, maxLength);
  return limpio !== "" ? limpio : null;
};

const sanitizarTelefono = (val: FormDataEntryValue | null, maxLength = 20): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  if (trimmed.toUpperCase() === "NO") return "NO";
  const limpio = trimmed.replace(/[^0-9+\-\s]/g, "").trim().slice(0, maxLength);
  return limpio !== "" ? limpio : null;
};

const sanitizarNucleoFamiliarJson = (val: FormDataEntryValue | null): string => {
  if (typeof val !== "string" || val.trim() === "") return "[]";
  try {
    const parsed: unknown = JSON.parse(val);
    if (!Array.isArray(parsed)) return "[]";
    const limpio: MiembroNucleoSanitizado[] = parsed
      .slice(0, 20)
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        nombre: sanitizarTextoSeguro(String(item.nombre ?? ""), 100) || "",
        edad: String(item.edad ?? "").replace(/\D/g, "").slice(0, 3),
        sexo: String(item.sexo ?? "").trim().toUpperCase() === "M"
          ? "M"
          : String(item.sexo ?? "").trim().toUpperCase() === "F"
            ? "F"
            : "",
        parentesco: sanitizarTextoSeguro(String(item.parentesco ?? ""), 50) || "",
        instruccion: sanitizarTextoSeguro(String(item.instruccion ?? ""), 80) || "",
        ocupacion: sanitizarTextoSeguro(String(item.ocupacion ?? ""), 80) || "",
      }))
      .filter((m) => m.nombre !== "" || m.parentesco !== "" || m.ocupacion !== "");
    return JSON.stringify(limpio);
  } catch {
    return "[]";
  }
};

const getStringOrNull = (val: FormDataEntryValue | null): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed !== "" ? trimmed : null;
};

const getSwitchOnOff = (formData: FormData, key: string): 'on' | 'off' => {
  return formData.get(key) === 'on' ? 'on' : 'off';
};

const construirObservacionRechazo = (
  materiasReprobadas: MateriaEnviada[],
  numPromedio: number,
  tipoBeca: string,
  incumpleExcelencia18: boolean
): string | null => {
  const tieneReprobadas = materiasReprobadas.length > 0;
  const esPromedioBajo = numPromedio < 16;

  if (!tieneReprobadas && !esPromedioBajo && !incumpleExcelencia18) return null;

  const listadoReprobadas = materiasReprobadas
    .map((m) => `${m.nombre} (${m.nota.toFixed(2)} pts)`)
    .join(", ");

  if (tieneReprobadas && esPromedioBajo) {
    return `Solicitud no procedente: no cumple con los requisitos académicos mínimos exigidos por la normativa institucional. Se registró calificación reprobatoria en ${listadoReprobadas} y un promedio general de ${numPromedio.toFixed(2)} pts (mínimo requerido: 16.00 pts).`;
  }

  if (tieneReprobadas) {
    return `Solicitud no procedente: según la normativa académica vigente, es requisito indispensable haber aprobado la totalidad de las unidades curriculares inscritas (calificación mínima de 10 puntos). Se registró calificación reprobatoria en: ${listadoReprobadas}.`;
  }

  if (esPromedioBajo) {
    return `Solicitud no procedente: su promedio académico del período (${numPromedio.toFixed(2)} pts) se encuentra por debajo del índice mínimo requerido (16.00 puntos) para optar al programa de becas.`;
  }

  return `Solicitud no procedente: la modalidad "${tipoBeca}" exige un promedio académico igual o superior a 18.00 puntos según la normativa institucional vigente (promedio registrado: ${numPromedio.toFixed(2)} pts).`;
};

/**
 * Procesa el envío de la solicitud de beca, valida integridad de datos y documentos,
 * calcula el baremo institucional y sincroniza las tablas de solicitudes, historial y estudios socioeconómicos.
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

    // Garantizar datos simulados persistidos y sincronizar récord académico oficial
    await asegurarDatosSocioeconomicosSimulados(userIdNum);
    const recordRes = await obtenerRecordParaPostulacion(userIdNum);
    const expediente = recordRes.success ? recordRes.data : null;

    // 3. PROCESAMIENTO DE MATERIAS Y PROMEDIO (AUTORIDAD DEL RÉCORD OFICIAL SI APLICA)
    let materiasArray: MateriaEnviada[] = [];
    let numPromedio = 0;
    let materiasReprobadas: MateriaEnviada[] = [];
    let trimestreSnapshot = isNaN(trimestreNum) ? semestreEstudiante : trimestreNum;

    if (semestreEstudiante > 1 && expediente && expediente.recordCompleto.length > 0) {
      const trimestreObjetivo =
        expediente.ultimoTrimestreSnapshot?.trimestre ?? Math.max(1, semestreEstudiante - 1);
      trimestreSnapshot = trimestreObjetivo;

      const materiasUltimoTrimestre = expediente.recordCompleto.filter(
        (m) => m.trimestre_cursado === trimestreObjetivo
      );
      const fuenteUltimo =
        materiasUltimoTrimestre.length > 0
          ? materiasUltimoTrimestre
          : expediente.recordCompleto;

      materiasArray = fuenteUltimo.map((m) => ({
        codigo: m.codigo_materia,
        nombre: m.nombre_materia,
        nota: Number(Number(m.nota).toFixed(2)),
      }));

      numPromedio = Number(Number(expediente.indiceGlobal).toFixed(2));
      materiasReprobadas = expediente.evaluacion.materiasReprobadas.map((m) => ({
        codigo: m.codigo_materia,
        nombre: m.nombre_materia,
        nota: Number(Number(m.nota).toFixed(2)),
      }));
    } else if (semestreEstudiante <= 1) {
      materiasArray = [];
      numPromedio = 0;
      materiasReprobadas = [];
      trimestreSnapshot = 1;
    } else {
      const materiasCodigos = formData.getAll('materias_codigos[]');
      const materiasNombres = formData.getAll('materias_nombres[]');
      const materiasNotas = formData.getAll('materias_notas[]');

      for (let index = 0; index < materiasCodigos.length; index++) {
        const nombre = String(materiasNombres[index] ?? "").trim();
        if (nombre === "") continue;

        const notaStr = String(materiasNotas[index] ?? "").trim().replace(",", ".");
        if (!REGEX_NOTA_DECIMAL.test(notaStr)) {
          return { error: "Todas las calificaciones deben ser números positivos entre 1 y 20 (máximo 2 decimales)." };
        }

        const notaDecimal = Number(parseFloat(notaStr).toFixed(2));
        if (!Number.isFinite(notaDecimal) || notaDecimal < 0 || notaDecimal > 20) {
          return { error: "Las calificaciones deben estar estrictamente entre 0 y 20 puntos." };
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

      const sumaNotas = materiasArray.reduce((acc, m) => acc + m.nota, 0);
      numPromedio = Number((sumaNotas / materiasArray.length).toFixed(2));
      materiasReprobadas = materiasArray.filter(m => m.nota < 10);
    }

    const materiasJsonString = JSON.stringify({
      trimestre: trimestreSnapshot,
      materias: materiasArray,
      fecha_proceso: new Date().toISOString()
    });

    const tieneReprobadas = materiasReprobadas.length > 0;
    const incumpleCriterioRegular = semestreEstudiante > 1 && (numPromedio < 16 || tieneReprobadas);
    const incumpleExcelencia18 =
      semestreEstudiante > 1 &&
      MODALIDADES_REQUIEREN_18.has(tipo_beca) &&
      numPromedio < PROMEDIO_MINIMO_EXCELENCIA;

    const debeRechazarAutomatico = incumpleCriterioRegular || incumpleExcelencia18;
    const estatusFinal = debeRechazarAutomatico ? 'Rechazada' : 'Pendiente';

    const observacionAutomatica = debeRechazarAutomatico
      ? (incumpleCriterioRegular && expediente?.evaluacion.motivoRechazo
          ? expediente.evaluacion.motivoRechazo
          : construirObservacionRechazo(
              materiasReprobadas,
              numPromedio,
              tipo_beca,
              incumpleExcelencia18
            ))
      : null;

    // 4. VALIDACIÓN ESTRICTA DE ENTEROS NO NEGATIVOS (INGRESOS, EGRESOS, EDADES Y HERMANOS)
    const sueldoReal = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_sueldo'));
    const montoFamiliarExtra = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_familiar'));
    const montoExtra = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_extra'));
    const montoPension = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_pension'));
    const montoAyuda = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_ayuda'));
    const montoRentas = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_rentas'));
    const montoOtrosIngresos = parseEnteroNoNegativoEstricto(formData.get('monto_ingreso_otros'));

    const egresoMercado = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_mercado'));
    const egresoVivienda = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_vivienda'));
    const egresoSalud = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_salud'));
    const egresoServicios = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_servicios'));
    const egresoSuntuarios = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_suntuarios'));
    const egresoEstudios = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_estudios'));
    const egresoRecreacion = parseEnteroNoNegativoEstricto(formData.get('monto_egreso_recreacion'));

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
      montoRentas === null ||
      montoOtrosIngresos === null ||
      egresoMercado === null ||
      egresoVivienda === null ||
      egresoSalud === null ||
      egresoServicios === null ||
      egresoSuntuarios === null ||
      egresoEstudios === null ||
      egresoRecreacion === null ||
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

    const viviendaTipoFinal = sanitizarTextoSeguro(formData.get('vivienda_tipo'), 50) || "Casa";
    const viviendaEstatusFinal = sanitizarTextoSeguro(formData.get('vivienda_estatus'), 50) || "Propia";
    const poseeEmpleoFinal = getStringOrNull(formData.get('posee_empleo_aspirante')) || "No";
    const condicionLaboralTipoFinal = sanitizarTextoSeguro(formData.get('socio_condicion_laboral_tipo'), 60) || "No aplica";
    const rangoIngresoFinal = getStringOrNull(formData.get('rango_ingreso_familiar')) || "1";
    const familiaEstatusConyugalFinal = sanitizarTextoSeguro(formData.get('familia_estatus_conyugal'), 60) || "Matrimonio Civil";
    const familiaNucleoJsonFinal = sanitizarNucleoFamiliarJson(formData.get('familia_nucleo_json'));
    const saludCondicionFinal = getStringOrNull(formData.get('salud_condicion_especial')) || "No";
    const familiaRelacionFinal = getStringOrNull(formData.get('familia_relacion')) || "Buena";
    const familiaProblemaSnFinal = getStringOrNull(formData.get('familia_problema_sn')) === "Si" ? "Si" : "No";
    const familiaProblemaDescFinal =
      familiaProblemaSnFinal === "Si"
        ? (sanitizarTextoSeguro(formData.get('familia_problema_desc'), 300) || "No especificado")
        : null;
    const organizacionActivaFinal = sanitizarTextoSeguro(formData.get('organizacion_activa'), 100) || "Ninguna";
    const observacionesSolicitanteFinal = sanitizarTextoSeguro(
      formData.get('observaciones_solicitante') ?? formData.get('observaciones_estudio'),
      500
    );

    const hermanosUniSnFinal =
      getStringOrNull(formData.get('familia_hermanos_uni_sn')) === "Si" || hermanosUni > 0
        ? "Si"
        : "No";

    // Switches de 7 Servicios Básicos y 11 Equipamientos del Hogar
    const servAgua = getSwitchOnOff(formData, 'serv_agua');
    const servLuz = getSwitchOnOff(formData, 'serv_luz');
    const servGas = getSwitchOnOff(formData, 'serv_gas');
    const servAseo = getSwitchOnOff(formData, 'serv_aseo');
    const servTelefono = getSwitchOnOff(formData, 'serv_telefono');
    const servCloacas = getSwitchOnOff(formData, 'serv_cloacas');
    const servInternet = getSwitchOnOff(formData, 'serv_internet');

    const equipNevera = getSwitchOnOff(formData, 'equip_nevera');
    const equipAire = getSwitchOnOff(formData, 'equip_aire');
    const equipVentilador = getSwitchOnOff(formData, 'equip_ventilador');
    const equipTv = getSwitchOnOff(formData, 'equip_tv');
    const equipCocina = getSwitchOnOff(formData, 'equip_cocina');
    const equipMicroondas = getSwitchOnOff(formData, 'equip_microondas');
    const equipLavadora = getSwitchOnOff(formData, 'equip_lavadora');
    const equipSonido = getSwitchOnOff(formData, 'equip_sonido');
    const equipComputadora = getSwitchOnOff(formData, 'equip_computadora');
    const equipCelular = getSwitchOnOff(formData, 'equip_celular');
    const equipCable = getSwitchOnOff(formData, 'equip_cable');

    const ingresoTotal =
      sueldoReal +
      montoExtra +
      montoPension +
      montoAyuda +
      montoFamiliarExtra +
      montoRentas +
      montoOtrosIngresos;

    // 8. MOTOR DE BAREMO UNIFICADO (sincronizado al 100% con todas las áreas, servicios y equipamiento)
    const { puntaje: puntajeCalculado, nivelRiesgo } = await calcularPuntajeUnificado({
      ingresoTotal,
      rango_ingreso_familiar: rangoIngresoFinal,
      monto_ingreso_sueldo: sueldoReal,
      monto_ingreso_extra: montoExtra,
      monto_ingreso_pension: montoPension,
      monto_ingreso_ayuda: montoAyuda,
      monto_ingreso_familiar: montoFamiliarExtra,
      monto_ingreso_rentas: montoRentas,
      monto_ingreso_otros: montoOtrosIngresos,
      monto_egreso_mercado: egresoMercado,
      monto_egreso_vivienda: egresoVivienda,
      monto_egreso_salud: egresoSalud,
      monto_egreso_servicios: egresoServicios,
      monto_egreso_suntuarios: egresoSuntuarios,
      monto_egreso_estudios: egresoEstudios,
      monto_egreso_recreacion: egresoRecreacion,
      viviendaTipo: viviendaTipoFinal,
      viviendaEstatus: viviendaEstatusFinal,
      serv_agua: servAgua,
      serv_luz: servLuz,
      serv_gas: servGas,
      serv_aseo: servAseo,
      serv_telefono: servTelefono,
      serv_cloacas: servCloacas,
      serv_internet: servInternet,
      equip_nevera: equipNevera,
      equip_aire: equipAire,
      equip_ventilador: equipVentilador,
      equip_tv: equipTv,
      equip_cocina: equipCocina,
      equip_microondas: equipMicroondas,
      equip_lavadora: equipLavadora,
      equip_sonido: equipSonido,
      equip_computadora: equipComputadora,
      equip_celular: equipCelular,
      equip_cable: equipCable,
      poseeEmpleo: poseeEmpleoFinal,
      socio_condicion_laboral_tipo: condicionLaboralTipoFinal,
      familia_estatus_conyugal: familiaEstatusConyugalFinal,
      numHermanos,
      familia_hermanos_uni: hermanosUni,
      familia_nucleo_json: familiaNucleoJsonFinal,
      saludCondicion: saludCondicionFinal,
      familiaRelacion: familiaRelacionFinal,
      familia_problema_sn: familiaProblemaSnFinal,
    });

    // 9. TRANSACCIÓN DE GUARDADO
    connection = await db.getConnection();
    await connection.beginTransaction();

    let solicitudIdFinal = 0;
    let estatusPrevioHistorial = 'Nueva';

    try {
      const [solicitudExistente] = await connection.execute<SolicitudExistenteRow[]>(
        'SELECT id, estatus, foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion, informe_medico, partida_nacimiento, constancia_club, constancia_notas, notas_certificadas, carnet_discapacidad, documentos_filiacion FROM solicitudes WHERE user_id = ? AND periodo_id = ?',
        [userIdNum, periodoId]
      );

      if (solicitudExistente.length > 0) {
        const existente = solicitudExistente[0];
        solicitudIdFinal = Number(existente.id);
        estatusPrevioHistorial = String(existente.estatus || 'Pendiente');

        await connection.execute<ResultSetHeader>(
          `
            UPDATE solicitudes SET 
              email_institucional = ?, tipo_beca = ?, promedio_notas = ?, 
              motivo_solicitud = ?, materias_json = ?, estatus = ?, observaciones_admin = ?,
              foto_carnet = ?, copia_cedula = ?, 
              constancia_residencia = ?, declaracion_manutencion = ?, informe_medico = ?, 
              partida_nacimiento = ?, constancia_club = ?, constancia_notas = ?, 
              notas_certificadas = ?, carnet_discapacidad = ?, documentos_filiacion = ?, 
              fecha_registro = NOW()
            WHERE id = ?
          `,
          [
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
          ]
        );
      } else {
        const [insertSolResult] = await connection.execute<ResultSetHeader>(
          `
            INSERT INTO solicitudes (
              user_id, periodo_id, email_institucional, tipo_beca, promedio_notas, 
              motivo_solicitud, materias_json, estatus, observaciones_admin,
              foto_carnet, copia_cedula, constancia_residencia, declaracion_manutencion, 
              informe_medico, partida_nacimiento, constancia_club, constancia_notas, 
              notas_certificadas, carnet_discapacidad, documentos_filiacion, fecha_registro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `,
          [
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
          ]
        );

        solicitudIdFinal = Number(insertSolResult.insertId);
      }

      // 10. GUARDADO COMPLETO EN TABLA SOCIOECONÓMICA (COLUMNAS BASE + 30 COLUMNAS NUEVAS)
      const camposSocio: ReadonlyArray<readonly [string, string | number | null]> = [
        ['student_id', userIdNum],
        ['periodo_id', periodoId],
        ['tipo', 'estudiante'],
        ['socio_lugar_nac', sanitizarTextoSeguro(formData.get('socio_lugar_nac'), 100) || "Porlamar, Nueva Esparta"],
        ['socio_nacionalidad', getStringOrNull(formData.get('socio_nacionalidad')) || "Venezolano/a"],
        ['socio_estado_civil', getStringOrNull(formData.get('socio_estado_civil')) || "Soltero/a"],
        ['socio_telf_hab', sanitizarTelefono(formData.get('socio_telf_hab'), 20) || "02952600000"],
        ['direccion_completa', sanitizarTextoSeguro(formData.get('direccion_completa'), 255) || "No registrada"],
        ['socio_trabajo_empresa', sanitizarTextoSeguro(formData.get('socio_trabajo_empresa'), 150, true) || "NO"],
        ['socio_trabajo_cargo', sanitizarSoloLetras(formData.get('socio_trabajo_cargo'), true) || "NO"],
        ['socio_trabajo_direccion', sanitizarTextoSeguro(formData.get('socio_trabajo_direccion'), 255, true) || "NO"],
        ['socio_trabajo_telefono', sanitizarTelefono(formData.get('socio_trabajo_telefono'), 30) || "NO"],
        ['socio_condicion_laboral_tipo', condicionLaboralTipoFinal],
        ['socio_condicion_laboral_desc', sanitizarTextoSeguro(formData.get('socio_condicion_laboral_desc'), 255, true) || "NO"],
        ['monto_ingreso_sueldo', sueldoReal],
        ['socio_ue_procedencia', sanitizarTextoSeguro(formData.get('socio_ue_procedencia'), 150) || "No registrada"],
        ['socio_otros_estudios', sanitizarTextoSeguro(formData.get('socio_otros_estudios'), 150) || "Ninguno"],
        ['socio_fecha_unimar', getStringOrNull(formData.get('socio_fecha_unimar'))],
        ['socio_modalidad', getStringOrNull(formData.get('socio_modalidad')) || "P"],
        ['padre_nombre', sanitizarSoloLetras(formData.get('padre_nombre')) || "No declarado"],
        ['padre_edad', padreEdad],
        ['padre_ocupacion', sanitizarSoloLetras(formData.get('padre_ocupacion')) || "No declarado"],
        ['padre_trabajo', sanitizarTextoSeguro(formData.get('padre_trabajo'), 150) || "No declarado"],
        ['padre_nacionalidad', sanitizarSoloLetras(formData.get('padre_nacionalidad')) || "Venezolano/a"],
        ['padre_instruccion', sanitizarTextoSeguro(formData.get('padre_instruccion'), 100) || "No declarado"],
        ['madre_nombre', sanitizarSoloLetras(formData.get('madre_nombre')) || "No declarado"],
        ['madre_edad', madreEdad],
        ['madre_ocupacion', sanitizarSoloLetras(formData.get('madre_ocupacion')) || "No declarado"],
        ['madre_trabajo', sanitizarTextoSeguro(formData.get('madre_trabajo'), 150) || "No declarado"],
        ['madre_nacionalidad', sanitizarSoloLetras(formData.get('madre_nacionalidad')) || "Venezolano/a"],
        ['madre_instruccion', sanitizarTextoSeguro(formData.get('madre_instruccion'), 100) || "No declarado"],
        ['familia_estatus_conyugal', familiaEstatusConyugalFinal],
        ['familia_num_hermanos', numHermanos],
        ['familia_hermanos_uni', hermanosUni],
        ['familia_hermanos_uni_sn', hermanosUniSnFinal],
        ['familia_nucleo_json', familiaNucleoJsonFinal],
        ['rango_ingreso_familiar', rangoIngresoFinal],
        ['monto_ingreso_extra', montoExtra],
        ['monto_ingreso_pension', montoPension],
        ['monto_ingreso_ayuda', montoAyuda],
        ['monto_ingreso_familiar', montoFamiliarExtra],
        ['monto_ingreso_rentas', montoRentas],
        ['monto_ingreso_otros', montoOtrosIngresos],
        ['monto_egreso_mercado', egresoMercado],
        ['monto_egreso_vivienda', egresoVivienda],
        ['monto_egreso_salud', egresoSalud],
        ['monto_egreso_servicios', egresoServicios],
        ['monto_egreso_suntuarios', egresoSuntuarios],
        ['monto_egreso_estudios', egresoEstudios],
        ['monto_egreso_recreacion', egresoRecreacion],
        ['vivienda_tipo', viviendaTipoFinal],
        ['vivienda_estatus', viviendaEstatusFinal],
        ['serv_internet', servInternet],
        ['serv_luz', servLuz],
        ['serv_agua', servAgua],
        ['serv_gas', servGas],
        ['serv_aseo', servAseo],
        ['serv_telefono', servTelefono],
        ['serv_cloacas', servCloacas],
        ['equip_nevera', equipNevera],
        ['equip_lavadora', equipLavadora],
        ['equip_cable', equipCable],
        ['equip_aire', equipAire],
        ['equip_ventilador', equipVentilador],
        ['equip_tv', equipTv],
        ['equip_cocina', equipCocina],
        ['equip_microondas', equipMicroondas],
        ['equip_sonido', equipSonido],
        ['equip_computadora', equipComputadora],
        ['equip_celular', equipCelular],
        ['salud_condicion_especial', saludCondicionFinal],
        ['salud_enfermedad_desc', sanitizarTextoSeguro(formData.get('salud_enfermedad_desc'), 180, true) || 'NO'],
        ['salud_tratamiento', sanitizarTextoSeguro(formData.get('salud_tratamiento'), 180, true) || 'NO'],
        ['situacion_laboral_jefe', poseeEmpleoFinal],
        ['familia_relacion', familiaRelacionFinal],
        ['familia_problema_sn', familiaProblemaSnFinal],
        ['familia_problema_desc', familiaProblemaDescFinal],
        ['organizacion_activa', organizacionActivaFinal],
        ['observaciones_solicitante', observacionesSolicitanteFinal],
        ['puntaje', puntajeCalculado || 0],
        ['nivel_riesgo', nivelRiesgo || 'Bajo'],
      ];

      const columnasSql = camposSocio.map(([col]) => `\`${col}\``).join(', ');
      const placeholdersSql = camposSocio.map(() => '?').join(', ');
      const updateSql = camposSocio
        .filter(([col]) => col !== 'student_id' && col !== 'tipo')
        .map(([col]) => `\`${col}\` = VALUES(\`${col}\`)`)
        .join(', ');
      const valoresSocio = camposSocio.map(([, val]) => val);

      await connection.execute<ResultSetHeader>(
        `
          INSERT INTO estudios_socioeconomicos (${columnasSql}, \`created_at\`)
          VALUES (${placeholdersSql}, NOW())
          ON DUPLICATE KEY UPDATE ${updateSql}, \`created_at\` = NOW()
        `,
        valoresSocio
      );

      // 11. TRAZABILIDAD EN HISTORIAL DE APROBACIONES SI EL SISTEMA RECHAZA AUTOMÁTICAMENTE
      if (estatusFinal === 'Rechazada' && solicitudIdFinal > 0) {
        await connection.execute<ResultSetHeader>(
          `
            INSERT INTO historial_aprobaciones (
              solicitud_id,
              user_id,
              periodo_id,
              admin_id,
              promedio_ciclo,
              trimestre,
              puntaje_baremo_,
              nivel_riesgo,
              tipo_beca_snapshot,
              estatus_previo,
              estatus_nuevo,
              observacion_admin,
              materias_snapshot_json,
              indice_global_snapshot,
              fecha_aprobacion,
              token_verificacion,
              ip_accion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
          `,
          [
            solicitudIdFinal,
            userIdNum,
            periodoId,
            SISTEMA_ADMIN_ID,
            numPromedio,
            trimestreSnapshot,
            puntajeCalculado || 0,
            nivelRiesgo || 'Bajo',
            tipo_beca,
            estatusPrevioHistorial,
            'Rechazada',
            observacionAutomatica || 'Rechazo automático por reglamento académico.',
            materiasJsonString,
            numPromedio,
            randomUUID(),
            '127.0.0.1'
          ]
        );
      }

      await connection.commit();
    } catch (sqlError) {
      if (connection) await connection.rollback();
      throw sqlError;
    } finally {
      if (connection) connection.release();
    }

    if (materiasArray.length > 0) {
      await actualizarIndiceGlobal(userIdNum, materiasArray);
    }

    revalidatePath('/admin/solicitudes');
    revalidatePath('/admin/validarBeca');
    revalidatePath('/admin/estudio-socioeconomico');
    revalidatePath('/admin/Historial-Aprobaciones');
    revalidatePath('/perfil');

    return { success: true };

  } catch (error: unknown) {
    console.error("❌ Error en Proceso de Solicitud:", error);
    return { error: "Error crítico al procesar la solicitud institucional." };
  }
}