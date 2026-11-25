'use server'

import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db, queryFresh } from './db'

export interface ContrasteEstudianteRow extends RowDataPacket {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  sexo: string | null;
  fecha_nacimiento: string | Date | null;
  telefono: string | null;
  carrera: string;
  semestre: number;
  socio_carrera: string | null;
  socio_trimestre: number | null;
  posee_empleo_aspirante: string | null;
  indice_global: number | string | null;
  email: string | null;
  municipio_residencia: string | null;
  socio_lugar_nac: string | null;
  socio_nacionalidad: string | null;
  socio_estado_civil: string | null;
  socio_telf_hab: string | null;
  direccion_completa: string | null;
  socio_trabajo_empresa: string | null;
  socio_trabajo_cargo: string | null;
  socio_trabajo_direccion: string | null;
  socio_trabajo_telefono: string | null;
  socio_condicion_laboral_tipo: string | null;
  socio_condicion_laboral_desc: string | null;
  monto_ingreso_sueldo: number | string | null;
  monto_ingreso_extra: number | string | null;
  monto_ingreso_pension: number | string | null;
  monto_ingreso_ayuda: number | string | null;
  monto_ingreso_familiar: number | string | null;
  monto_ingreso_rentas: number | string | null;
  monto_ingreso_otros: number | string | null;
  socio_ue_procedencia: string | null;
  socio_otros_estudios: string | null;
  socio_fecha_unimar: string | Date | null;
  socio_modalidad: string | null;
  padre_nombre: string | null;
  padre_edad: number | null;
  padre_ocupacion: string | null;
  padre_trabajo: string | null;
  padre_nacionalidad: string | null;
  padre_instruccion: string | null;
  madre_nombre: string | null;
  madre_edad: number | null;
  madre_ocupacion: string | null;
  madre_trabajo: string | null;
  madre_nacionalidad: string | null;
  madre_instruccion: string | null;
  familia_estatus_conyugal: string | null;
  rango_ingreso_familiar: string | null;
  vivienda_tipo: string | null;
  vivienda_estatus: string | null;
  familia_num_hermanos: number | null;
  familia_hermanos_uni: number | null;
  familia_hermanos_uni_sn: string | null;
  familia_nucleo_json: string | null;
  monto_egreso_mercado: number | string | null;
  monto_egreso_vivienda: number | string | null;
  monto_egreso_salud: number | string | null;
  monto_egreso_servicios: number | string | null;
  monto_egreso_suntuarios: number | string | null;
  monto_egreso_estudios: number | string | null;
  monto_egreso_recreacion: number | string | null;
  situacion_laboral_jefe: string | null;
  salud_condicion_especial: string | null;
  serv_internet: string | null;
  serv_agua: string | null;
  serv_gas: string | null;
  serv_aseo: string | null;
  serv_luz: string | null;
  serv_telefono: string | null;
  serv_cloacas: string | null;
  equip_lavadora: string | null;
  equip_nevera: string | null;
  equip_cable: string | null;
  equip_aire: string | null;
  equip_ventilador: string | null;
  equip_tv: string | null;
  equip_cocina: string | null;
  equip_microondas: string | null;
  equip_sonido: string | null;
  equip_computadora: string | null;
  equip_celular: string | null;
  salud_enfermedad_desc: string | null;
  salud_tratamiento: string | null;
  familia_relacion: string | null;
  familia_problema_sn: string | null;
  familia_problema_desc: string | null;
  organizacion_activa: string | null;
  observaciones_solicitante: string | null;
  puntaje_estudiante: number | null;
  puntaje_admin: number | null;
  nivel_admin: string | null;
  estatus_solicitud: string | null;
}

/**
 * Consulta de búsqueda de contraste entre estudiante y administrador (case-insensitive y lectura fresca)
 */
export async function getContrasteEstudianteSQL(
  queryTerm: string
): Promise<ContrasteEstudianteRow[]> {
  const searchTerm = queryTerm.toLowerCase();

  const rows = await queryFresh<ContrasteEstudianteRow[]>(
    `SELECT 
        s.id, s.nombre, s.apellido, s.cedula, s.sexo, s.fecha_nacimiento, s.telefono, 
        s.carrera, s.semestre,
        s.carrera AS socio_carrera,
        s.semestre AS socio_trimestre,
        s.indice_global, s.email, s.municipio_residencia,
        IFNULL(adm.socio_lugar_nac, est.socio_lugar_nac) AS socio_lugar_nac,
        IFNULL(adm.socio_nacionalidad, est.socio_nacionalidad) AS socio_nacionalidad,
        IFNULL(adm.socio_estado_civil, est.socio_estado_civil) AS socio_estado_civil,
        IFNULL(adm.socio_telf_hab, est.socio_telf_hab) AS socio_telf_hab,
        IFNULL(adm.direccion_completa, est.direccion_completa) AS direccion_completa,
        IFNULL(adm.socio_trabajo_empresa, est.socio_trabajo_empresa) AS socio_trabajo_empresa,
        IFNULL(adm.socio_trabajo_cargo, est.socio_trabajo_cargo) AS socio_trabajo_cargo,
        IFNULL(adm.socio_trabajo_direccion, est.socio_trabajo_direccion) AS socio_trabajo_direccion,
        IFNULL(adm.socio_trabajo_telefono, est.socio_trabajo_telefono) AS socio_trabajo_telefono,
        IFNULL(adm.socio_condicion_laboral_tipo, est.socio_condicion_laboral_tipo) AS socio_condicion_laboral_tipo,
        IFNULL(adm.socio_condicion_laboral_desc, est.socio_condicion_laboral_desc) AS socio_condicion_laboral_desc,
        IFNULL(adm.monto_ingreso_sueldo, est.monto_ingreso_sueldo) AS monto_ingreso_sueldo,
        IFNULL(adm.monto_ingreso_extra, est.monto_ingreso_extra) AS monto_ingreso_extra,
        IFNULL(adm.monto_ingreso_pension, est.monto_ingreso_pension) AS monto_ingreso_pension,
        IFNULL(adm.monto_ingreso_ayuda, est.monto_ingreso_ayuda) AS monto_ingreso_ayuda,
        IFNULL(adm.monto_ingreso_familiar, est.monto_ingreso_familiar) AS monto_ingreso_familiar,
        IFNULL(adm.monto_ingreso_rentas, est.monto_ingreso_rentas) AS monto_ingreso_rentas,
        IFNULL(adm.monto_ingreso_otros, est.monto_ingreso_otros) AS monto_ingreso_otros,
        IFNULL(adm.socio_ue_procedencia, est.socio_ue_procedencia) AS socio_ue_procedencia,
        IFNULL(adm.socio_otros_estudios, est.socio_otros_estudios) AS socio_otros_estudios,
        IFNULL(adm.socio_fecha_unimar, est.socio_fecha_unimar) AS socio_fecha_unimar,
        IFNULL(adm.socio_modalidad, est.socio_modalidad) AS socio_modalidad,
        IFNULL(adm.padre_nombre, est.padre_nombre) AS padre_nombre,
        IFNULL(adm.padre_edad, est.padre_edad) AS padre_edad,
        IFNULL(adm.padre_ocupacion, est.padre_ocupacion) AS padre_ocupacion,
        IFNULL(adm.padre_trabajo, est.padre_trabajo) AS padre_trabajo,
        IFNULL(adm.padre_nacionalidad, est.padre_nacionalidad) AS padre_nacionalidad,
        IFNULL(adm.padre_instruccion, est.padre_instruccion) AS padre_instruccion,
        IFNULL(adm.madre_nombre, est.madre_nombre) AS madre_nombre,
        IFNULL(adm.madre_edad, est.madre_edad) AS madre_edad,
        IFNULL(adm.madre_ocupacion, est.madre_ocupacion) AS madre_ocupacion,
        IFNULL(adm.madre_trabajo, est.madre_trabajo) AS madre_trabajo,
        IFNULL(adm.madre_nacionalidad, est.madre_nacionalidad) AS madre_nacionalidad,
        IFNULL(adm.madre_instruccion, est.madre_instruccion) AS madre_instruccion,
        IFNULL(adm.familia_estatus_conyugal, est.familia_estatus_conyugal) AS familia_estatus_conyugal,
        IFNULL(adm.rango_ingreso_familiar, est.rango_ingreso_familiar) AS rango_ingreso_familiar,
        IFNULL(adm.vivienda_tipo, est.vivienda_tipo) AS vivienda_tipo,
        IFNULL(adm.vivienda_estatus, est.vivienda_estatus) AS vivienda_estatus,
        IFNULL(adm.familia_num_hermanos, est.familia_num_hermanos) AS familia_num_hermanos,
        IFNULL(adm.familia_hermanos_uni, est.familia_hermanos_uni) AS familia_hermanos_uni,
        IFNULL(adm.familia_hermanos_uni_sn, est.familia_hermanos_uni_sn) AS familia_hermanos_uni_sn,
        IFNULL(adm.familia_nucleo_json, est.familia_nucleo_json) AS familia_nucleo_json,
        IFNULL(adm.monto_egreso_mercado, est.monto_egreso_mercado) AS monto_egreso_mercado,
        IFNULL(adm.monto_egreso_vivienda, est.monto_egreso_vivienda) AS monto_egreso_vivienda,
        IFNULL(adm.monto_egreso_salud, est.monto_egreso_salud) AS monto_egreso_salud,
        IFNULL(adm.monto_egreso_servicios, est.monto_egreso_servicios) AS monto_egreso_servicios,
        IFNULL(adm.monto_egreso_suntuarios, est.monto_egreso_suntuarios) AS monto_egreso_suntuarios,
        IFNULL(adm.monto_egreso_estudios, est.monto_egreso_estudios) AS monto_egreso_estudios,
        IFNULL(adm.monto_egreso_recreacion, est.monto_egreso_recreacion) AS monto_egreso_recreacion,
        IFNULL(adm.situacion_laboral_jefe, est.situacion_laboral_jefe) AS situacion_laboral_jefe,
        IFNULL(adm.situacion_laboral_jefe, est.situacion_laboral_jefe) AS posee_empleo_aspirante,
        IFNULL(adm.salud_condicion_especial, est.salud_condicion_especial) AS salud_condicion_especial,
        IFNULL(adm.serv_internet, est.serv_internet) AS serv_internet,
        IFNULL(adm.serv_agua, est.serv_agua) AS serv_agua,
        IFNULL(adm.serv_gas, est.serv_gas) AS serv_gas,
        IFNULL(adm.serv_aseo, est.serv_aseo) AS serv_aseo,
        IFNULL(adm.serv_luz, est.serv_luz) AS serv_luz,
        IFNULL(adm.serv_telefono, est.serv_telefono) AS serv_telefono,
        IFNULL(adm.serv_cloacas, est.serv_cloacas) AS serv_cloacas,
        IFNULL(adm.equip_lavadora, est.equip_lavadora) AS equip_lavadora,
        IFNULL(adm.equip_nevera, est.equip_nevera) AS equip_nevera,
        IFNULL(adm.equip_cable, est.equip_cable) AS equip_cable,
        IFNULL(adm.equip_aire, est.equip_aire) AS equip_aire,
        IFNULL(adm.equip_ventilador, est.equip_ventilador) AS equip_ventilador,
        IFNULL(adm.equip_tv, est.equip_tv) AS equip_tv,
        IFNULL(adm.equip_cocina, est.equip_cocina) AS equip_cocina,
        IFNULL(adm.equip_microondas, est.equip_microondas) AS equip_microondas,
        IFNULL(adm.equip_sonido, est.equip_sonido) AS equip_sonido,
        IFNULL(adm.equip_computadora, est.equip_computadora) AS equip_computadora,
        IFNULL(adm.equip_celular, est.equip_celular) AS equip_celular,
        IFNULL(adm.salud_enfermedad_desc, est.salud_enfermedad_desc) AS salud_enfermedad_desc,
        IFNULL(adm.salud_tratamiento, est.salud_tratamiento) AS salud_tratamiento,
        IFNULL(adm.familia_relacion, est.familia_relacion) AS familia_relacion,
        IFNULL(adm.familia_problema_sn, est.familia_problema_sn) AS familia_problema_sn,
        IFNULL(adm.familia_problema_desc, est.familia_problema_desc) AS familia_problema_desc,
        IFNULL(adm.organizacion_activa, est.organizacion_activa) AS organizacion_activa,
        IFNULL(NULLIF(TRIM(adm.observaciones_solicitante), ''), est.observaciones_solicitante) AS observaciones_solicitante,
        est.puntaje AS puntaje_estudiante,
        adm.puntaje AS puntaje_admin, 
        adm.nivel_riesgo AS nivel_admin,
        (SELECT estatus FROM solicitudes WHERE user_id = s.id ORDER BY fecha_registro DESC LIMIT 1) AS estatus_solicitud
     FROM students s
     LEFT JOIN estudios_socioeconomicos est ON s.id = est.student_id AND est.tipo = 'estudiante'
     LEFT JOIN estudios_socioeconomicos adm ON s.id = adm.student_id AND adm.tipo = 'administrador'
     WHERE EXISTS (
        SELECT 1 FROM solicitudes sol WHERE sol.user_id = s.id
     )
     AND (
        LOWER(s.cedula) LIKE ? OR
        LOWER(s.email) LIKE ? OR
        LOWER(s.nombre) LIKE ? OR
        LOWER(s.apellido) LIKE ?
     )
     ORDER BY s.apellido ASC
     LIMIT 10`,
    [searchTerm, searchTerm, searchTerm, searchTerm]
  );

  return rows || [];
}

export async function deleteEstudioSQL(studentId: number): Promise<ResultSetHeader> {
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM estudios_socioeconomicos WHERE student_id = ? AND tipo = 'administrador'",
    [Number(studentId)]
  );
  return result;
}