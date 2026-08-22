'use server'

import { db } from './db'
import { RowDataPacket } from 'mysql2/promise'

/**
 * Consulta de búsqueda de contraste entre estudiante y administrador
 */
export async function getContrasteEstudianteSQL(queryTerm: string) {
  const searchTerm = queryTerm.toLowerCase();

  const [rows] = await db.execute<RowDataPacket[]>(
    `SELECT 
        s.id, s.nombre, s.apellido, s.cedula, s.sexo, s.fecha_nacimiento, s.telefono, 
        s.carrera, s.semestre, s.indice_global, s.email, s.municipio_residencia,
        IFNULL(adm.socio_lugar_nac, est.socio_lugar_nac) as socio_lugar_nac,
        IFNULL(adm.socio_nacionalidad, est.socio_nacionalidad) as socio_nacionalidad,
        IFNULL(adm.socio_estado_civil, est.socio_estado_civil) as socio_estado_civil,
        IFNULL(adm.socio_telf_hab, est.socio_telf_hab) as socio_telf_hab,
        IFNULL(adm.direccion_completa, est.direccion_completa) as direccion_completa,
        IFNULL(adm.socio_trabajo_empresa, est.socio_trabajo_empresa) as socio_trabajo_empresa,
        IFNULL(adm.socio_trabajo_cargo, est.socio_trabajo_cargo) as socio_trabajo_cargo,
        IFNULL(adm.monto_ingreso_sueldo, est.monto_ingreso_sueldo) as monto_ingreso_sueldo,
        IFNULL(adm.monto_ingreso_extra, est.monto_ingreso_extra) as monto_ingreso_extra,
        IFNULL(adm.monto_ingreso_pension, est.monto_ingreso_pension) as monto_ingreso_pension,
        IFNULL(adm.monto_ingreso_ayuda, est.monto_ingreso_ayuda) as monto_ingreso_ayuda,
        IFNULL(adm.monto_ingreso_familiar, est.monto_ingreso_familiar) as monto_ingreso_familiar,
        IFNULL(adm.socio_ue_procedencia, est.socio_ue_procedencia) as socio_ue_procedencia,
        IFNULL(adm.socio_otros_estudios, est.socio_otros_estudios) as socio_otros_estudios,
        IFNULL(adm.socio_fecha_unimar, est.socio_fecha_unimar) as socio_fecha_unimar,
        IFNULL(adm.socio_modalidad, est.socio_modalidad) as socio_modalidad,
        IFNULL(adm.padre_nombre, est.padre_nombre) as padre_nombre,
        IFNULL(adm.padre_edad, est.padre_edad) as padre_edad,
        IFNULL(adm.padre_ocupacion, est.padre_ocupacion) as padre_ocupacion,
        IFNULL(adm.padre_trabajo, est.padre_trabajo) as padre_trabajo,
        IFNULL(adm.madre_nombre, est.madre_nombre) as madre_nombre,
        IFNULL(adm.madre_edad, est.madre_edad) as madre_edad,
        IFNULL(adm.madre_ocupacion, est.madre_ocupacion) as madre_ocupacion,
        IFNULL(adm.madre_trabajo, est.madre_trabajo) as madre_trabajo,
        IFNULL(adm.rango_ingreso_familiar, est.rango_ingreso_familiar) as rango_ingreso_familiar,
        IFNULL(adm.vivienda_tipo, est.vivienda_tipo) as vivienda_tipo,
        IFNULL(adm.vivienda_estatus, est.vivienda_estatus) as vivienda_estatus,
        IFNULL(adm.familia_num_hermanos, est.familia_num_hermanos) as familia_num_hermanos,
        IFNULL(adm.familia_hermanos_uni, est.familia_hermanos_uni) as familia_hermanos_uni,
        IFNULL(adm.monto_egreso_mercado, est.monto_egreso_mercado) as monto_egreso_mercado,
        IFNULL(adm.monto_egreso_vivienda, est.monto_egreso_vivienda) as monto_egreso_vivienda,
        IFNULL(adm.monto_egreso_salud, est.monto_egreso_salud) as monto_egreso_salud,
        IFNULL(adm.monto_egreso_servicios, est.monto_egreso_servicios) as monto_egreso_servicios,
        IFNULL(adm.situacion_laboral_jefe, est.situacion_laboral_jefe) as situacion_laboral_jefe,
        IFNULL(adm.salud_condicion_especial, est.salud_condicion_especial) as salud_condicion_especial,
        IFNULL(adm.serv_internet, est.serv_internet) as serv_internet,
        IFNULL(adm.serv_agua, est.serv_agua) as serv_agua,
        IFNULL(adm.serv_gas, est.serv_gas) as serv_gas,
        IFNULL(adm.serv_aseo, est.serv_aseo) as serv_aseo,
        IFNULL(adm.equip_lavadora, est.equip_lavadora) as equip_lavadora,
        IFNULL(adm.equip_nevera, est.equip_nevera) as equip_nevera,
        IFNULL(adm.serv_luz, est.serv_luz) as serv_luz,
        IFNULL(adm.equip_cable, est.equip_cable) as equip_cable,
        IFNULL(adm.salud_enfermedad_desc, est.salud_enfermedad_desc) as salud_enfermedad_desc,
        IFNULL(adm.salud_tratamiento, est.salud_tratamiento) as salud_tratamiento,
        IFNULL(adm.familia_relacion, est.familia_relacion) as familia_relacion,
        est.puntaje as puntaje_estudiante,
        adm.puntaje as puntaje_admin, 
        adm.nivel_riesgo as nivel_admin,
        (SELECT estatus FROM solicitudes WHERE user_id = s.id ORDER BY fecha_registro DESC LIMIT 1) as estatus_solicitud
     FROM students s
     LEFT JOIN estudios_socioeconomicos est ON s.id = est.student_id AND est.tipo = 'estudiante'
     LEFT JOIN estudios_socioeconomicos adm ON s.id = adm.student_id AND adm.tipo = 'administrador'
     WHERE EXISTS (
        SELECT 1 FROM solicitudes sol WHERE sol.user_id = s.id
     )
     AND (s.cedula LIKE ? OR LOWER(s.email) LIKE ? OR LOWER(s.nombre) LIKE ? OR LOWER(s.apellido) LIKE ?)
     ORDER BY s.apellido ASC
     LIMIT 10`,
    [queryTerm, searchTerm, searchTerm, searchTerm]
  );
  return rows || [];
}

export async function deleteEstudioSQL(studentId: number) {
  return await db.execute(
    "DELETE FROM estudios_socioeconomicos WHERE student_id = ? AND tipo = 'administrador'",
    [studentId]
  );
}