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
  // 🟢 IMPORTANTE: infoEncuesta ya no es un JSON string, es el objeto de la fila SQL
  const data = infoEncuesta || {};
  
  let materiasArray = [];
  try {
      const rawMaterias = infoSolicitud?.materias_json;
      if (Array.isArray(rawMaterias)) {
          materiasArray = rawMaterias;
      } else if (typeof rawMaterias === 'string') {
          const parsed = JSON.parse(rawMaterias);
          // Soportamos ambos formatos: array directo o { materias: [] }
          materiasArray = Array.isArray(parsed) ? parsed : (parsed.materias || []);
      }
      if (!Array.isArray(materiasArray)) materiasArray = [];
  } catch (error) {
      console.error("Error parseando materias JSON:", error);
      materiasArray = [];
  }

  // Normalización de Sexo base
  const sexoNormalizado = (
    studentRaw?.sexo === 'M' || studentRaw?.sexo === 'Masculino' ? 'Masculino' : 
    studentRaw?.sexo === 'F' || studentRaw?.sexo === 'Femenino' ? 'Femenino' : 
    studentRaw?.sexo || ""
  );

  // 1. Mapeo de la Encuesta Existente usando las nuevas columnas de la tabla
  const datosEncuesta = {
    // Identificación y Laboral
    socio_lugar_nac: data.socio_lugar_nac || "",
    socio_nacionalidad: data.socio_nacionalidad || "Venezolano/a",
    socio_estado_civil: data.socio_estado_civil || "",
    socio_telf_hab: data.socio_telf_hab || "",
    socio_trabajo_empresa: data.socio_trabajo_empresa || "",
    socio_trabajo_cargo: data.socio_trabajo_cargo || "",
    monto_ingreso_sueldo: data.monto_ingreso_sueldo || "",
    
    // Académico
    socio_ue_procedencia: data.socio_ue_procedencia || "",
    socio_otros_estudios: data.socio_otros_estudios || "",
    socio_fecha_unimar: data.socio_fecha_unimar ? formatearFechaParaInput(data.socio_fecha_unimar) : "",
    socio_modalidad: data.socio_modalidad || "P",
    
    // Familiar
    padre_nombre: data.padre_nombre || "",
    padre_edad: data.padre_edad || "",
    padre_ocupacion: data.padre_ocupacion || "",
    padre_trabajo: data.padre_trabajo || "",
    madre_nombre: data.madre_nombre || "",
    madre_edad: data.madre_edad || "",
    madre_ocupacion: data.madre_ocupacion || "",
    madre_trabajo: data.madre_trabajo || "",
    familia_num_hermanos: data.familia_num_hermanos || "",
    familia_hermanos_uni: data.familia_hermanos_uni || "",
    socio_relacion_fam: data.familia_relacion || "",
    
    // Económico
    rango_ingreso_familiar: data.rango_ingreso_familiar || "",
    monto_ingreso_familiar: data.monto_ingreso_familiar || "",
    monto_ingreso_extra: data.monto_ingreso_extra || "",
    monto_ingreso_pension: data.monto_ingreso_pension || "",
    monto_ingreso_ayuda: data.monto_ingreso_ayuda || "",
    monto_egreso_mercado: data.monto_egreso_mercado || "",
    monto_egreso_vivienda: data.monto_egreso_vivienda || "",
    monto_egreso_salud: data.monto_egreso_salud || "",
    monto_egreso_servicios: data.monto_egreso_servicios || "",
    
    // Vivienda
    vivienda_tipo: data.vivienda_tipo || "",
    vivienda_estatus: data.vivienda_estatus || "",
    serv_agua: data.serv_agua || "off",
    serv_luz: data.serv_luz || "off",
    serv_gas: data.serv_gas || "off",
    serv_aseo: data.serv_aseo || "off",
    serv_internet: data.serv_internet || "off",
    equip_lavadora: data.equip_lavadora || "off",
    equip_nevera: data.equip_nevera || "off",
    equip_cable: data.equip_cable || "off",
    
    // Salud y Empleo (Sincronización de Radios)
    salud_enfermedad_desc: data.salud_enfermedad_desc || "",
    salud_tratamiento: data.salud_tratamiento || "",
    posee_enfermedad_aspirante: data.salud_condicion_especial || "No",
    posee_empleo_aspirante: data.situacion_laboral_jefe || "No"
  };

  // 2. Combinación final
  return {
    ...user,
    // Sincronización con Datos Maestros (Students)
    socio_nombres: studentRaw?.nombre || "",
    socio_apellidos: studentRaw?.apellido || "",
    socio_cedula: studentRaw?.cedula || "",
    socio_sexo: sexoNormalizado,
    socio_carrera: studentRaw?.carrera || "",
    socio_trimestre: studentRaw?.semestre?.toString() || "",
    socio_fecha_nac: studentRaw?.fecha_nacimiento ? formatearFechaParaInput(studentRaw.fecha_nacimiento) : "",
    socio_municipio: studentRaw?.municipio_residencia || "",
    socio_celular: studentRaw?.telefono || "",
    socio_edad: studentRaw?.fecha_nacimiento ? calcularEdad(studentRaw.fecha_nacimiento) : "",
    socio_Institucional: studentRaw?.email || user?.email || "",

    // Estatus e Info de la solicitud
    tieneDatosRegistro: !!studentRaw,
    estatusBeca: infoSolicitud?.estatus || 'ninguna',
    tipo_beca: infoSolicitud?.tipo_beca || "",
    promedio_notas: infoSolicitud?.promedio_notas || "",
    materias_registradas: materiasArray,

    ...datosEncuesta // Inyecta todos los valores cargados de la tabla socioeconómica
  };
}