'use server'

import type { RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { getSession } from './ActionsSession'
import { aplicarFiltroEstudioAdmin } from '@/app/admin/validarBeca/lib/ValidarEstudioHecho'

export interface FiltrosDB {
  search?: string;
  status?: string;
  municipio?: string;
  carrera?: string;
  trimestre?: string;
  tipoBeca?: string;
  vulnerabilidad?: string;
  es_renovacion?: string;
  vulnerabilidadMin?: string;
  tendencia?: string;
  scope?: string;
  estadoEstudio?: string;
  filtroPromedio?: string;
  promedioMin?: string;
  rankingElite?: boolean | string;
  page?: number | string;
  limit?: number | string;
}

interface PeriodoIdRow extends RowDataPacket {
  id: number;
}

interface TotalCountRow extends RowDataPacket {
  total: number;
}

export interface SolicitudDBRow extends RowDataPacket {
  id: number;
  user_id: number;
  tipo_beca: string | null;
  estatus: string | null;
  observaciones_admin: string | null;
  promedio_notas: number | string | null;
  fecha_registro: Date | string | null;
  motivo_solicitud: string | null;
  foto_carnet: string | null;
  copia_cedula: string | null;
  planilla_inscripcion: string | null;
  constancia_residencia: string | null;
  declaracion_manutencion: string | null;
  informe_medico: string | null;
  partida_nacimiento: string | null;
  constancia_club: string | null;
  constancia_notas: string | null;
  notas_certificadas: string | null;
  carnet_discapacidad: string | null;
  documentos_filiacion: string | null;
  email_institucional: string | null;
  periodo_id: number | null;
  departamento_asignado: string | null;
  nombre: string;
  apellido: string;
  cedula: string;
  carrera: string;
  telefono: string | null;
  semestre: number;
  municipio_residencia: string | null;
  sexo: string | null;
  fecha_nacimiento: Date | string | null;
  indice_global: number | string | null;
  puntaje: number | null;
  nivel_riesgo: string | null;
  monto_ingreso_familiar: number | string | null;
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
  monto_ingreso_rentas: number | string | null;
  monto_ingreso_otros: number | string | null;
  socio_ue_procedencia: string | null;
  socio_otros_estudios: string | null;
  socio_fecha_unimar: Date | string | null;
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
  serv_internet: string | null;
  familia_num_hermanos: number | null;
  familia_hermanos_uni: number | null;
  familia_hermanos_uni_sn: string | null;
  familia_nucleo_json: string | null;
  familia_relacion: string | null;
  familia_problema_sn: string | null;
  familia_problema_desc: string | null;
  organizacion_activa: string | null;
  observaciones_solicitante: string | null;
  monto_egreso_mercado: number | string | null;
  monto_egreso_vivienda: number | string | null;
  monto_egreso_salud: number | string | null;
  monto_egreso_servicios: number | string | null;
  monto_egreso_suntuarios: number | string | null;
  monto_egreso_estudios: number | string | null;
  monto_egreso_recreacion: number | string | null;
  situacion_laboral_jefe: string | null;
  salud_condicion_especial: string | null;
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
  promedio_historico: number | string | null;
}

export async function fetchSolicitudesDesdeDB(filtros: FiltrosDB = {}): Promise<{
  rows: SolicitudDBRow[];
  totalRegistros: number;
  limit: number;
}> {
  try {
    // Detección de autoridad en servidor: Secretaría General solo ve solicitudes 'En Revisión'
    const session = await getSession();
    const esSecretariaGeneral = Boolean(
      session.isLoggedIn &&
      'esSecretariaGeneral' in session &&
      session.esSecretariaGeneral
    );

    const [periodoRes] = await db.execute<PeriodoIdRow[]>(
      `SELECT id FROM periodos_academicos WHERE es_actual = 1 LIMIT 1`
    );
    const pId = Number(periodoRes?.[0]?.id || 0);

    const [prevPeriodoRes] = await db.execute<PeriodoIdRow[]>(
      `
        SELECT id FROM periodos_academicos 
        WHERE id < ? 
        ORDER BY id DESC LIMIT 1
      `,
      [pId]
    );
    const prevPId = Number(prevPeriodoRes?.[0]?.id || 0);

    let whereClause = ` WHERE 1=1`;
    const params: Array<string | number> = [];

    // --- FILTROS ESTÁNDAR Y DEL EMBUDO (Búsquedas insensibles a mayúsculas) ---
    if (filtros.search) {
      whereClause += ` AND (LOWER(st.nombre) LIKE ? OR LOWER(st.apellido) LIKE ? OR LOWER(st.cedula) LIKE ?)`;
      const term = `%${filtros.search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    // Bloqueo SQL estricto para Secretaría General
    if (esSecretariaGeneral) {
      whereClause += ` AND s.estatus = 'En Revisión'`;
    } else if (filtros.status && filtros.status !== "Todas") {
      whereClause += ` AND s.estatus = ?`;
      params.push(filtros.status);
    }

    if (filtros.municipio) {
      whereClause += ` AND st.municipio_residencia = ?`;
      params.push(filtros.municipio);
    }

    if (filtros.carrera) {
      whereClause += ` AND LOWER(TRIM(st.carrera)) = ?`;
      params.push(filtros.carrera.trim().toLowerCase());
    }

    if (filtros.trimestre) {
      whereClause += ` AND st.semestre = ?`;
      params.push(Number(filtros.trimestre));
    }

    if (filtros.tipoBeca) {
      whereClause += ` AND LOWER(TRIM(s.tipo_beca)) = ?`;
      params.push(filtros.tipoBeca.trim().toLowerCase());
    }

    if (filtros.es_renovacion === 'true' || filtros.vulnerabilidadMin || filtros.tendencia === 'descenso') {
      whereClause += ` AND s.periodo_id = ${pId} AND EXISTS (
        SELECT 1 FROM solicitudes s_old 
        WHERE s_old.user_id = s.user_id 
        AND s_old.estatus = 'Aprobada' 
        AND s_old.periodo_id = ${prevPId}
      )`;

      if (filtros.tendencia !== 'descenso') {
        whereClause += ` AND s.promedio_notas >= 16`;
      }
    }

    if (filtros.vulnerabilidad) {
      const riesgo = filtros.vulnerabilidad.toLowerCase();
      if (riesgo === 'critico') whereClause += ` AND e.puntaje >= 70`;
      else if (riesgo === 'alto') whereClause += ` AND e.puntaje BETWEEN 50 AND 69`;
      else if (riesgo === 'medio') whereClause += ` AND e.puntaje BETWEEN 25 AND 49`;
      else if (riesgo === 'bajo') whereClause += ` AND e.puntaje BETWEEN 0 AND 24`;
    }

    if (filtros.vulnerabilidadMin && !filtros.vulnerabilidad) {
      whereClause += ` AND e.puntaje >= ?`;
      params.push(Number(filtros.vulnerabilidadMin));
    }

    if (filtros.tendencia === 'descenso') {
      whereClause += ` AND e.puntaje >= 60 AND s.promedio_notas < (
        SELECT s_ant.promedio_notas 
        FROM solicitudes s_ant 
        WHERE s_ant.user_id = s.user_id 
        AND s_ant.estatus = 'Aprobada'
        AND s_ant.periodo_id = ${prevPId}
        LIMIT 1
      )`;
    }

    if (!esSecretariaGeneral && filtros.scope === 'total_beneficiarios') {
      whereClause += ` AND s.periodo_id = ${pId} AND s.estatus = 'Aprobada' AND (
        EXISTS (
          SELECT 1 FROM solicitudes s_old 
          WHERE s_old.user_id = s.user_id 
          AND s_old.estatus = 'Aprobada' 
          AND s_old.periodo_id = ${prevPId}
        )
        OR 
        NOT EXISTS (
          SELECT 1 FROM solicitudes s_none
          WHERE s_none.user_id = s.user_id 
          AND s_none.periodo_id = ${prevPId}
        )
      )`;
    }

    // --- APLICACIÓN DEL MÓDULO DE ESTUDIO (HECHO / PENDIENTE) ---
    const filtroEstudio = aplicarFiltroEstudioAdmin(filtros.estadoEstudio, pId);
    if (filtroEstudio.condition) {
      whereClause += filtroEstudio.condition;
      params.push(...(filtroEstudio.param as Array<string | number>));
    }

    if (filtros.filtroPromedio && !filtros.promedioMin) {
      if (filtros.filtroPromedio === "19-20") whereClause += ` AND s.promedio_notas >= 19`;
      else if (filtros.filtroPromedio === "16-18") whereClause += ` AND s.promedio_notas BETWEEN 16 AND 18.99`;
      else if (filtros.filtroPromedio === "10-15") whereClause += ` AND s.promedio_notas BETWEEN 10 AND 15.99`;
    }

    // --- CONTEO Y CONSULTA PRINCIPAL ---
    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador' AND e.periodo_id = ${pId}
      ${whereClause}
    `;
    const [countRows] = await db.execute<TotalCountRow[]>(countQuery, params);
    const totalRegistros = Number(countRows[0]?.total || 0);

    let query = `
      SELECT 
        s.id, s.user_id, s.tipo_beca, s.estatus, s.observaciones_admin, s.promedio_notas, s.fecha_registro, 
        s.motivo_solicitud, s.foto_carnet, s.copia_cedula, s.planilla_inscripcion,
        s.constancia_residencia, s.declaracion_manutencion, s.informe_medico, 
        s.partida_nacimiento, s.constancia_club, s.constancia_notas, 
        s.notas_certificadas, s.carnet_discapacidad, s.documentos_filiacion,
        s.email_institucional, s.periodo_id, s.departamento_asignado,
        st.nombre, st.apellido, st.cedula, st.carrera, st.telefono,
        st.semestre, st.municipio_residencia, st.sexo, st.fecha_nacimiento, st.indice_global,
        e.puntaje, e.nivel_riesgo, e.monto_ingreso_familiar,
        e.socio_lugar_nac, e.socio_nacionalidad, e.socio_estado_civil, e.socio_telf_hab,
        e.direccion_completa, e.socio_trabajo_empresa, e.socio_trabajo_cargo,
        e.socio_trabajo_direccion, e.socio_trabajo_telefono, e.socio_condicion_laboral_tipo, e.socio_condicion_laboral_desc,
        e.monto_ingreso_sueldo, e.monto_ingreso_extra, e.monto_ingreso_pension, e.monto_ingreso_ayuda,
        e.monto_ingreso_rentas, e.monto_ingreso_otros,
        e.socio_ue_procedencia, e.socio_otros_estudios, e.socio_fecha_unimar, e.socio_modalidad,
        e.padre_nombre, e.padre_edad, e.padre_ocupacion, e.padre_trabajo, e.padre_nacionalidad, e.padre_instruccion,
        e.madre_nombre, e.madre_edad, e.madre_ocupacion, e.madre_trabajo, e.madre_nacionalidad, e.madre_instruccion,
        e.familia_estatus_conyugal, e.rango_ingreso_familiar, e.vivienda_tipo, e.vivienda_estatus, e.serv_internet,
        e.familia_num_hermanos, e.familia_hermanos_uni, e.familia_hermanos_uni_sn, e.familia_nucleo_json,
        e.familia_relacion, e.familia_problema_sn, e.familia_problema_desc, e.organizacion_activa,
        IFNULL(
          NULLIF(TRIM(e.observaciones_solicitante), ''),
          (
            SELECT est_obs.observaciones_solicitante
            FROM estudios_socioeconomicos est_obs
            WHERE est_obs.student_id = st.id AND est_obs.tipo = 'estudiante'
            ORDER BY est_obs.created_at DESC
            LIMIT 1
          )
        ) AS observaciones_solicitante,
        e.monto_egreso_mercado, e.monto_egreso_vivienda, e.monto_egreso_salud, e.monto_egreso_servicios,
        e.monto_egreso_suntuarios, e.monto_egreso_estudios, e.monto_egreso_recreacion,
        e.situacion_laboral_jefe, e.salud_condicion_especial,
        e.serv_agua, e.serv_gas, e.serv_aseo, e.serv_luz, e.serv_telefono, e.serv_cloacas,
        e.equip_lavadora, e.equip_nevera, e.equip_cable, e.equip_aire, e.equip_ventilador,
        e.equip_tv, e.equip_cocina, e.equip_microondas, e.equip_sonido, e.equip_computadora, e.equip_celular,
        e.salud_enfermedad_desc, e.salud_tratamiento,
        (
          SELECT ROUND(AVG(promedio_notas), 2) 
          FROM solicitudes 
          WHERE user_id = st.id
        ) AS promedio_historico
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      LEFT JOIN estudios_socioeconomicos e ON st.id = e.student_id AND e.tipo = 'administrador' AND e.periodo_id = ${pId}
      ${whereClause}
    `;

    // ORDENAMIENTO BASADO EN JERARQUÍA INSTITUCIONAL DE UNIMAR
    query += ` ORDER BY 
      CASE 
        WHEN s.estatus = 'Renovacion' OR s.estatus = 'Renovación' THEN 1
        WHEN s.estatus = 'Pendiente' THEN 2
        WHEN s.estatus = 'Convocado a Entrevista' THEN 3
        WHEN s.estatus = 'En Revisión' OR s.estatus = 'En revision' THEN 4
        WHEN s.estatus = 'Revisión Especial' OR s.estatus = 'Revision especial' THEN 5
        WHEN s.estatus = 'Aprobada' OR s.estatus = 'Aprobado' THEN 6
        WHEN s.estatus = 'Rechazada' THEN 7
        ELSE 8 
      END ASC, 
      s.promedio_notas DESC, 
      s.id DESC`;

    const page = Math.max(1, Number(filtros.page) || 1);
    const limit = Math.max(1, Number(filtros.limit) || 7);
    const offset = (page - 1) * limit;

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.execute<SolicitudDBRow[]>(query, params);

    return { rows, totalRegistros, limit };
  } catch (error) {
    console.error("❌ Error en fetchSolicitudesDesdeDB:", error);
    throw error;
  }
}