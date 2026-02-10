/**
 * Utilidades para mapear y transformar datos de la solicitud
 */

export const formatearFechaParaInput = (fecha: any) => {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split('T')[0]; 
}

export const calcularEdad = (fechaNac: string) => {
  if (!fechaNac) return "";
  const hoy = new Date();
  const cumple = new Date(fechaNac);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const mes = hoy.getMonth() - cumple.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < cumple.getDate())) {
    edad--;
  }
  return edad.toString();
}

export function mapSolicitudData(user: any, studentRaw: any, infoSolicitud: any, infoEncuesta: any) {
  const encuestaData = (typeof infoEncuesta === 'string') ? JSON.parse(infoEncuesta) : infoEncuesta;
  
  let materiasArray = [];
  try {
      const rawMaterias = infoSolicitud?.materias_json;
      if (Array.isArray(rawMaterias)) {
          materiasArray = rawMaterias;
      } else if (typeof rawMaterias === 'string') {
          materiasArray = JSON.parse(rawMaterias);
      }
      if (!Array.isArray(materiasArray)) materiasArray = [];
  } catch (error) {
      console.error("Error parseando materias JSON:", error);
      materiasArray = [];
  }

  const encuestaPlana = encuestaData ? {
    socio_nombres: encuestaData.identificacion?.nombres || "",
    socio_apellidos: encuestaData.identificacion?.apellidos || "",
    socio_cedula: encuestaData.identificacion?.cedula || "",
    socio_fecha_nac: encuestaData.identificacion?.fecha_nac || "",
    socio_lugar_nac: encuestaData.identificacion?.lugar_nac || "",
    socio_edad: encuestaData.identificacion?.edad || "",
    socio_nacionalidad: encuestaData.identificacion?.nacionalidad || "",
    socio_estado_civil: encuestaData.identificacion?.estado_civil || "",
    socio_sexo: encuestaData.identificacion?.sexo || "",
    socio_direccion: encuestaData.identificacion?.direccion || "",
    socio_municipio: encuestaData.identificacion?.municipio || "",
    socio_telf_hab: encuestaData.identificacion?.telf_hab || "",
    socio_celular: encuestaData.identificacion?.celular || "",
    socio_Institucional: encuestaData.identificacion?.email_institucional || "",
    socio_trabajo_empresa: encuestaData.laboral?.empresa || "",
    socio_trabajo_dir: encuestaData.laboral?.direccion || "",
    socio_trabajo_cargo: encuestaData.laboral?.cargo || "",
    socio_trabajo_sueldo: encuestaData.laboral?.sueldo || "",
    socio_ue_procedencia: encuestaData.academico?.ue_procedencia || "",
    socio_otros_estudios: encuestaData.academico?.otros_estudios || "",
    socio_fecha_unimar: encuestaData.academico?.fecha_unimar || "",
    socio_carrera: encuestaData.academico?.carrera || "",
    socio_trimestre: encuestaData.academico?.trimestre || "",
    socio_modalidad: encuestaData.academico?.modalidad || "",
    padre_nombre: encuestaData.familiar?.padre?.nombre || "",
    padre_edad: encuestaData.familiar?.padre?.edad || "",
    padre_ocupacion: encuestaData.familiar?.padre?.ocupacion || "",
    padre_trabajo: encuestaData.familiar?.padre?.trabajo || "",
    madre_nombre: encuestaData.familiar?.madre?.nombre || "",
    madre_edad: encuestaData.familiar?.madre?.edad || "",
    madre_ocupacion: encuestaData.familiar?.madre?.ocupacion || "",
    madre_trabajo: encuestaData.familiar?.madre?.trabajo || "",
    familia_num_hermanos: encuestaData.familiar?.num_hermanos || "",
    familia_hermanos_uni: encuestaData.familiar?.hermanos_uni || "",
    socio_relacion_fam: encuestaData.familiar?.relacion_fam || "",
    rango_ingreso_familiar: encuestaData.economico?.rango_ingreso || "",
    monto_ingreso_sueldo: encuestaData.economico?.ingresos?.sueldo || "",
    monto_ingreso_extra: encuestaData.economico?.ingresos?.extra || "",
    monto_ingreso_pension: encuestaData.economico?.ingresos?.pension || "",
    monto_ingreso_ayuda: encuestaData.economico?.ingresos?.ayuda || "",
    monto_egreso_mercado: encuestaData.economico?.egresos?.mercado || "",
    monto_egreso_vivienda: encuestaData.economico?.egresos?.vivienda || "",
    monto_egreso_salud: encuestaData.economico?.egresos?.salud || "",
    monto_egreso_servicios: encuestaData.economico?.egresos?.servicios || "",
    vivienda_tipo: encuestaData.vivienda?.tipo || "",
    vivienda_estatus: encuestaData.vivienda?.estatus || "",
    serv_agua: encuestaData.vivienda?.servicios?.agua ? "on" : "",
    serv_luz: encuestaData.vivienda?.servicios?.luz ? "on" : "",
    serv_gas: encuestaData.vivienda?.servicios?.gas ? "on" : "",
    serv_aseo: encuestaData.vivienda?.servicios?.aseo ? "on" : "",
    serv_internet: encuestaData.vivienda?.servicios?.internet ? "on" : "",
    equip_lavadora: encuestaData.vivienda?.equipamiento?.lavadora ? "on" : "",
    equip_nevera: encuestaData.vivienda?.equipamiento?.nevera ? "on" : "",
    equip_cable: encuestaData.vivienda?.equipamiento?.cable ? "on" : "",
    salud_enfermedad_desc: encuestaData.salud?.enfermedad || "",
    salud_tratamiento: encuestaData.salud?.tratamiento || ""
  } : {};

  return {
    ...user,
    nombre: studentRaw?.nombre || "",
    apellido: studentRaw?.apellido || "",
    cedula: studentRaw?.cedula || "",
    sexo: studentRaw?.sexo || "",
    fecha_nac: formatearFechaParaInput(studentRaw?.fecha_nacimiento), 
    edad: calcularEdad(studentRaw?.fecha_nacimiento),
    municipio: studentRaw?.municipio_residencia || "",
    telefono: studentRaw?.telefono || "",
    carrera: studentRaw?.carrera || "",
    trimestre: studentRaw?.semestre || "",
    email_institucional: studentRaw?.email || user.email || "",
    tieneDatosRegistro: !!studentRaw,
    estatusBeca: infoSolicitud?.estatus || 'ninguna',
    observaciones_admin: infoSolicitud?.observaciones_admin || null,
    tipo_beca: infoSolicitud?.tipo_beca || "",
    promedio_notas: infoSolicitud?.promedio_notas || "",
    motivo_solicitud: infoSolicitud?.motivo_solicitud || "",
    foto_url: infoSolicitud?.foto_carnet || null,
    cedula_url: infoSolicitud?.copia_cedula || null,
    planilla_url: infoSolicitud?.planilla_inscripcion || null,
    materias_registradas: materiasArray,
    ...encuestaPlana
  };
}