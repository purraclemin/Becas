export interface MateriaPensum {
  id?: string | number;
  nombre?: string;
  codigo?: string;
  nombre_materia?: string;
  codigo_materia?: string;
  unidades_credito?: number;
}

export interface MateriaGuardada {
  materia_id?: string | number;
  codigo?: string;
  nombre?: string;
  nota?: string | number;
}

export interface MiembroNucleoFamiliar {
  nombre: string;
  edad: string;
  sexo: string;
  parentesco: string;
  instruccion: string;
  ocupacion: string;
}

export interface PostulacionUser {
  id?: number | string;
  studentId?: number;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  sexo?: 'M' | 'F' | string | null;
  fecha_nacimiento?: string | null;
  telefono?: string;
  carrera?: string;
  semestre?: number;
  indice_global?: number | string;
  email?: string | null;
  correo?: string | null;
  email_institucional?: string | null;
  municipio_residencia?: string | null;
  promedio_notas?: number | string;
  tipo_beca?: string;
  motivo_solicitud?: string;
  observaciones_beca?: string | null;
  observaciones_estudio?: string;
  observaciones_solicitante?: string;
  materias_registradas?: MateriaGuardada[];
  // Encuesta socioeconómica
  socio_estado_civil?: string;
  estado_civil?: string;
  edo_civil?: string;
  socio_nacionalidad?: string;
  socio_lugar_nac?: string;
  direccion_completa?: string;
  socio_telf_hab?: string;
  socio_celular?: string;
  socio_carrera?: string;
  socio_trimestre?: string | number;
  socio_ue_procedencia?: string;
  socio_fecha_unimar?: string;
  socio_otros_estudios?: string;
  socio_modalidad?: string;
  // Área Familiar
  padre_nombre?: string;
  padre_edad?: string | number;
  padre_ocupacion?: string;
  padre_trabajo?: string;
  padre_nacionalidad?: string;
  padre_instruccion?: string;
  madre_nombre?: string;
  madre_edad?: string | number;
  madre_ocupacion?: string;
  madre_trabajo?: string;
  madre_nacionalidad?: string;
  madre_instruccion?: string;
  familia_estatus_conyugal?: string;
  familia_num_hermanos?: string | number;
  familia_hermanos_uni?: string | number;
  familia_hermanos_uni_sn?: string;
  familia_nucleo_json?: string;
  familia_relacion?: string;
  familia_problema_sn?: string;
  familia_problema_desc?: string;
  organizacion_activa?: string;
  // Situación Laboral
  situacion_laboral_jefe?: string;
  posee_empleo_aspirante?: string;
  socio_trabajo_empresa?: string;
  socio_trabajo_cargo?: string;
  socio_trabajo_direccion?: string;
  socio_trabajo_telefono?: string;
  socio_condicion_laboral_tipo?: string;
  socio_condicion_laboral_desc?: string;
  // Área Económica
  monto_ingreso_sueldo?: string | number;
  rango_ingreso_familiar?: string;
  monto_ingreso_familiar?: string | number;
  monto_ingreso_extra?: string | number;
  monto_ingreso_pension?: string | number;
  monto_ingreso_ayuda?: string | number;
  monto_ingreso_rentas?: string | number;
  monto_ingreso_otros?: string | number;
  monto_egreso_mercado?: string | number;
  monto_egreso_vivienda?: string | number;
  monto_egreso_salud?: string | number;
  monto_egreso_servicios?: string | number;
  monto_egreso_suntuarios?: string | number;
  monto_egreso_estudios?: string | number;
  monto_egreso_recreacion?: string | number;
  // Vivienda, Servicios y Equipamiento
  vivienda_tipo?: string;
  vivienda_estatus?: string;
  serv_agua?: string;
  serv_luz?: string;
  serv_gas?: string;
  serv_aseo?: string;
  serv_internet?: string;
  serv_telefono?: string;
  serv_cloacas?: string;
  equip_nevera?: string;
  equip_lavadora?: string;
  equip_cable?: string;
  equip_aire?: string;
  equip_ventilador?: string;
  equip_tv?: string;
  equip_cocina?: string;
  equip_microondas?: string;
  equip_sonido?: string;
  equip_computadora?: string;
  equip_celular?: string;
  // Salud
  salud_condicion_especial?: string;
  salud_enfermedad_desc?: string;
  salud_tratamiento?: string;
  [key: string]: string | number | boolean | null | undefined | MateriaGuardada[] | File;
}