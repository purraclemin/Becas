'use server'

import { randomUUID } from 'crypto'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { db } from './db'
import { getSession } from './ActionsSession'
import { obtenerOCrearPeriodoObjetivo } from './SolicitudAcademic'
import { calcularPuntajeUnificado } from './MotorBaremoUnificado'
import { enviarCorreoCambioEstatusPorSolicitudId } from './EmailNotificacionesBeca'

interface SolicitudConvocadaRow extends RowDataPacket {
  id: number;
  periodo_id: number;
  promedio_notas: number | string | null;
  tipo_beca: string | null;
  materias_json: string | null;
  semestre: number | null;
  indice_global: number | string | null;
}

export interface EstudioSocioeconomicoInput {
  student_id?: number | string | null;
  socio_lugar_nac?: string | null;
  socio_nacionalidad?: string | null;
  socio_estado_civil?: string | null;
  socio_telf_hab?: string | null;
  direccion_completa?: string | null;
  socio_trabajo_empresa?: string | null;
  socio_trabajo_cargo?: string | null;
  socio_trabajo_direccion?: string | null;
  socio_trabajo_telefono?: string | null;
  socio_condicion_laboral_tipo?: string | null;
  socio_condicion_laboral_desc?: string | null;
  monto_ingreso_sueldo?: number | string | null;
  monto_ingreso_extra?: number | string | null;
  monto_ingreso_pension?: number | string | null;
  monto_ingreso_ayuda?: number | string | null;
  monto_ingreso_familiar?: number | string | null;
  monto_ingreso_rentas?: number | string | null;
  monto_ingreso_otros?: number | string | null;
  socio_ue_procedencia?: string | null;
  socio_otros_estudios?: string | null;
  socio_fecha_unimar?: string | Date | null;
  socio_modalidad?: string | null;
  padre_nombre?: string | null;
  padre_edad?: number | string | null;
  padre_ocupacion?: string | null;
  padre_trabajo?: string | null;
  padre_nacionalidad?: string | null;
  padre_instruccion?: string | null;
  madre_nombre?: string | null;
  madre_edad?: number | string | null;
  madre_ocupacion?: string | null;
  madre_trabajo?: string | null;
  madre_nacionalidad?: string | null;
  madre_instruccion?: string | null;
  familia_estatus_conyugal?: string | null;
  rango_ingreso_familiar?: string | null;
  vivienda_tipo?: string | null;
  vivienda_estatus?: string | null;
  familia_num_hermanos?: number | string | null;
  familia_hermanos_uni?: number | string | null;
  familia_hermanos_uni_sn?: string | null;
  familia_nucleo_json?: string | null;
  monto_egreso_mercado?: number | string | null;
  monto_egreso_vivienda?: number | string | null;
  monto_egreso_salud?: number | string | null;
  monto_egreso_servicios?: number | string | null;
  monto_egreso_suntuarios?: number | string | null;
  monto_egreso_estudios?: number | string | null;
  monto_egreso_recreacion?: number | string | null;
  posee_empleo_aspirante?: string | null;
  situacion_laboral_jefe?: string | null;
  carga_familiar_discapacidad?: string | null;
  salud_condicion_especial?: string | null;
  serv_internet?: string | boolean | null;
  serv_agua?: string | boolean | null;
  serv_gas?: string | boolean | null;
  serv_aseo?: string | boolean | null;
  serv_luz?: string | boolean | null;
  serv_telefono?: string | boolean | null;
  serv_cloacas?: string | boolean | null;
  equip_lavadora?: string | boolean | null;
  equip_nevera?: string | boolean | null;
  equip_cable?: string | boolean | null;
  equip_aire?: string | boolean | null;
  equip_ventilador?: string | boolean | null;
  equip_tv?: string | boolean | null;
  equip_cocina?: string | boolean | null;
  equip_microondas?: string | boolean | null;
  equip_sonido?: string | boolean | null;
  equip_computadora?: string | boolean | null;
  equip_celular?: string | boolean | null;
  salud_enfermedad_desc?: string | null;
  salud_tratamiento?: string | null;
  familia_relacion?: string | null;
  socio_relacion_fam?: string | null;
  familia_problema_sn?: string | null;
  familia_problema_desc?: string | null;
  organizacion_activa?: string | null;
  observaciones_solicitante?: string | null;
  observaciones_estudio?: string | null;
  [key: string]: unknown;
}

const normalizeSwitch = (val: unknown): 'on' | 'off' =>
  val === true || val === 'Posee' || val === 'Si' || val === 'Sí' || val === 'on' || val === 'on_true'
    ? 'on'
    : 'off';

const normalizeModalidad = (val: string | null | undefined): string => {
  const limpio = (val || 'P').trim();
  const upper = limpio.toUpperCase();
  if (upper === 'PRESENCIAL' || upper === 'P') return 'P';
  if (upper === 'SEMIPRESENCIAL' || upper === 'S') return 'S';
  if (upper === 'VIRTUAL' || upper === 'V') return 'V';
  return limpio.slice(0, 20) || 'P';
};

const normalizeNumber = (val: number | string | null | undefined): number => {
  if (val === null || val === undefined || val === '') return 0;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 ? num : 0;
};

const normalizeFechaISO = (val: string | Date | null | undefined): string | null => {
  if (!val) return null;
  if (val instanceof Date) {
    return Number.isNaN(val.getTime()) ? null : val.toISOString().split('T')[0];
  }
  const trimmed = String(val).trim();
  if (trimmed === '') return null;
  return trimmed.includes('T') ? trimmed.split('T')[0] : trimmed;
};

const normalizeTexto = (val: string | null | undefined, fallback: string): string => {
  if (!val) return fallback;
  const trimmed = String(val).trim();
  return trimmed !== '' ? trimmed : fallback;
};

const normalizeTextoNullable = (val: string | null | undefined): string | null => {
  if (!val) return null;
  const trimmed = String(val).trim();
  return trimmed !== '' ? trimmed : null;
};

/**
 * Obtiene el estudio socioeconómico para el panel de administración.
 * Prioriza el registro de tipo 'administrador' si ya fue editado/auditado en el periodo actual,
 * de lo contrario, hereda y carga automáticamente el último registro de tipo 'estudiante'
 * disponible (independientemente del periodo) para evitar datos en blanco.
 */
export async function obtenerEstudioSocioeconomico(studentId: number) {
  const session = await getSession();
  if (!session || !('id' in session) || !session.id) {
    throw new Error("Sesión no válida.");
  }

  const periodoIdActual = await obtenerOCrearPeriodoObjetivo();
  const connection = await db.getConnection();

  try {
    const [rowsAdmin] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM estudios_socioeconomicos WHERE student_id = ? AND periodo_id = ? AND tipo = 'administrador' LIMIT 1`,
      [studentId, periodoIdActual]
    );

    if (rowsAdmin && rowsAdmin.length > 0) {
      return { data: rowsAdmin[0], origen: 'administrador' as const };
    }

    const [rowsEstudiante] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM estudios_socioeconomicos WHERE student_id = ? AND tipo = 'estudiante' ORDER BY created_at DESC LIMIT 1`,
      [studentId]
    );

    if (rowsEstudiante && rowsEstudiante.length > 0) {
      return { data: rowsEstudiante[0], origen: 'estudiante' as const };
    }

    return { data: null, origen: 'ninguno' as const };
  } catch (error) {
    console.error("❌ Error al obtener estudio socioeconómico:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

/**
 * Lógica de negocio para procesar y guardar el estudio socioeconómico (Auditoría Admin)
 */
export async function procesarGuardadoEstudio(data: EstudioSocioeconomicoInput) {
  const session = await getSession();
  const adminId = session && 'id' in session ? session.id : null;
  if (adminId === null || adminId === undefined) {
    throw new Error("Sesión no válida.");
  }

  const studentIdNum = Number(data.student_id);
  if (!Number.isInteger(studentIdNum) || studentIdNum <= 0) {
    throw new Error("Identificador de estudiante inválido.");
  }

  const periodoIdActual = await obtenerOCrearPeriodoObjetivo();

  // Normalización centralizada para garantizar 100% de paridad entre MotorBaremoUnificado y SQL
  const poseeEmpleoFinal = normalizeTexto(
    data.posee_empleo_aspirante || data.situacion_laboral_jefe,
    'No'
  );
  const condicionLaboralTipoFinal = normalizeTexto(data.socio_condicion_laboral_tipo, 'No aplica');
  const saludCondicionFinal = normalizeTexto(
    data.salud_condicion_especial || data.carga_familiar_discapacidad,
    'No'
  );
  const familiaRelacionFinal = normalizeTexto(
    data.familia_relacion || data.socio_relacion_fam,
    'Buena'
  );
  const familiaProblemaSnFinal = data.familia_problema_sn === 'Si' ? 'Si' : 'No';
  const familiaEstatusConyugalFinal = normalizeTexto(data.familia_estatus_conyugal, 'Matrimonio Civil');
  const familiaNucleoJsonFinal = normalizeTexto(data.familia_nucleo_json, '[]');
  const rangoIngresoFinal = normalizeTexto(data.rango_ingreso_familiar, '1');
  const viviendaTipoFinal = normalizeTexto(data.vivienda_tipo, '');
  const viviendaEstatusFinal = normalizeTexto(data.vivienda_estatus, '');

  const numHermanosFinal = normalizeNumber(data.familia_num_hermanos);
  const hermanosUniNum = normalizeNumber(data.familia_hermanos_uni);
  const hermanosUniSnFinal =
    data.familia_hermanos_uni_sn === 'Si' || hermanosUniNum > 0 ? 'Si' : 'No';

  // Ingresos y Egresos normalizados
  const montoSueldo = normalizeNumber(data.monto_ingreso_sueldo);
  const montoExtra = normalizeNumber(data.monto_ingreso_extra);
  const montoPension = normalizeNumber(data.monto_ingreso_pension);
  const montoAyuda = normalizeNumber(data.monto_ingreso_ayuda);
  const montoFamiliar = normalizeNumber(data.monto_ingreso_familiar);
  const montoRentas = normalizeNumber(data.monto_ingreso_rentas);
  const montoOtros = normalizeNumber(data.monto_ingreso_otros);

  const egresoMercado = normalizeNumber(data.monto_egreso_mercado);
  const egresoVivienda = normalizeNumber(data.monto_egreso_vivienda);
  const egresoSalud = normalizeNumber(data.monto_egreso_salud);
  const egresoServicios = normalizeNumber(data.monto_egreso_servicios);
  const egresoSuntuarios = normalizeNumber(data.monto_egreso_suntuarios);
  const egresoEstudios = normalizeNumber(data.monto_egreso_estudios);
  const egresoRecreacion = normalizeNumber(data.monto_egreso_recreacion);

  // 7 Servicios Básicos y 11 Equipamientos normalizados
  const servAgua = normalizeSwitch(data.serv_agua);
  const servLuz = normalizeSwitch(data.serv_luz);
  const servGas = normalizeSwitch(data.serv_gas);
  const servAseo = normalizeSwitch(data.serv_aseo);
  const servTelefono = normalizeSwitch(data.serv_telefono);
  const servCloacas = normalizeSwitch(data.serv_cloacas);
  const servInternet = normalizeSwitch(data.serv_internet);

  const equipNevera = normalizeSwitch(data.equip_nevera);
  const equipAire = normalizeSwitch(data.equip_aire);
  const equipVentilador = normalizeSwitch(data.equip_ventilador);
  const equipTv = normalizeSwitch(data.equip_tv);
  const equipCocina = normalizeSwitch(data.equip_cocina);
  const equipMicroondas = normalizeSwitch(data.equip_microondas);
  const equipLavadora = normalizeSwitch(data.equip_lavadora);
  const equipSonido = normalizeSwitch(data.equip_sonido);
  const equipComputadora = normalizeSwitch(data.equip_computadora);
  const equipCelular = normalizeSwitch(data.equip_celular);
  const equipCable = normalizeSwitch(data.equip_cable);

  // 1. Ejecución del motor con los datos auditados completos
  const resultadoMotor = await calcularPuntajeUnificado({
    rango_ingreso_familiar: rangoIngresoFinal,
    monto_ingreso_sueldo: montoSueldo,
    monto_ingreso_extra: montoExtra,
    monto_ingreso_pension: montoPension,
    monto_ingreso_ayuda: montoAyuda,
    monto_ingreso_familiar: montoFamiliar,
    monto_ingreso_rentas: montoRentas,
    monto_ingreso_otros: montoOtros,
    monto_egreso_mercado: egresoMercado,
    monto_egreso_vivienda: egresoVivienda,
    monto_egreso_salud: egresoSalud,
    monto_egreso_servicios: egresoServicios,
    monto_egreso_suntuarios: egresoSuntuarios,
    monto_egreso_estudios: egresoEstudios,
    monto_egreso_recreacion: egresoRecreacion,
    vivienda_tipo: viviendaTipoFinal,
    vivienda_estatus: viviendaEstatusFinal,
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
    posee_empleo_aspirante: poseeEmpleoFinal,
    socio_condicion_laboral_tipo: condicionLaboralTipoFinal,
    familia_estatus_conyugal: familiaEstatusConyugalFinal,
    familia_num_hermanos: numHermanosFinal,
    familia_hermanos_uni: hermanosUniNum,
    familia_nucleo_json: familiaNucleoJsonFinal,
    salud_condicion_especial: saludCondicionFinal,
    familia_relacion: familiaRelacionFinal,
    familia_problema_sn: familiaProblemaSnFinal,
  });

  const puntaje = resultadoMotor?.puntaje ?? 0;
  const nivel = resultadoMotor?.nivelRiesgo ?? 'Bajo';

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const camposAdmin: ReadonlyArray<readonly [string, string | number | null]> = [
      ['student_id', studentIdNum],
      ['periodo_id', periodoIdActual],
      ['evaluador_id', Number(adminId)],
      ['tipo', 'administrador'],
      ['socio_lugar_nac', normalizeTexto(data.socio_lugar_nac, '')],
      ['socio_nacionalidad', normalizeTexto(data.socio_nacionalidad, '')],
      ['socio_estado_civil', normalizeTexto(data.socio_estado_civil, '')],
      ['socio_telf_hab', normalizeTexto(data.socio_telf_hab, '')],
      ['direccion_completa', normalizeTexto(data.direccion_completa, '')],
      ['socio_trabajo_empresa', normalizeTexto(data.socio_trabajo_empresa, 'NO')],
      ['socio_trabajo_cargo', normalizeTexto(data.socio_trabajo_cargo, 'NO')],
      ['socio_trabajo_direccion', normalizeTexto(data.socio_trabajo_direccion, 'NO')],
      ['socio_trabajo_telefono', normalizeTexto(data.socio_trabajo_telefono, 'NO')],
      ['socio_condicion_laboral_tipo', condicionLaboralTipoFinal],
      ['socio_condicion_laboral_desc', normalizeTexto(data.socio_condicion_laboral_desc, 'NO')],
      ['monto_ingreso_sueldo', montoSueldo],
      ['monto_ingreso_extra', montoExtra],
      ['monto_ingreso_pension', montoPension],
      ['monto_ingreso_ayuda', montoAyuda],
      ['monto_ingreso_familiar', montoFamiliar],
      ['monto_ingreso_rentas', montoRentas],
      ['monto_ingreso_otros', montoOtros],
      ['socio_ue_procedencia', normalizeTexto(data.socio_ue_procedencia, '')],
      ['socio_otros_estudios', normalizeTexto(data.socio_otros_estudios, 'Ninguno')],
      ['socio_fecha_unimar', normalizeFechaISO(data.socio_fecha_unimar)],
      ['socio_modalidad', normalizeModalidad(data.socio_modalidad)],
      ['padre_nombre', normalizeTexto(data.padre_nombre, '')],
      ['padre_edad', normalizeNumber(data.padre_edad)],
      ['padre_ocupacion', normalizeTexto(data.padre_ocupacion, '')],
      ['padre_trabajo', normalizeTexto(data.padre_trabajo, '')],
      ['padre_nacionalidad', normalizeTexto(data.padre_nacionalidad, 'Venezolano/a')],
      ['padre_instruccion', normalizeTexto(data.padre_instruccion, '')],
      ['madre_nombre', normalizeTexto(data.madre_nombre, '')],
      ['madre_edad', normalizeNumber(data.madre_edad)],
      ['madre_ocupacion', normalizeTexto(data.madre_ocupacion, '')],
      ['madre_trabajo', normalizeTexto(data.madre_trabajo, '')],
      ['madre_nacionalidad', normalizeTexto(data.madre_nacionalidad, 'Venezolano/a')],
      ['madre_instruccion', normalizeTexto(data.madre_instruccion, '')],
      ['familia_estatus_conyugal', familiaEstatusConyugalFinal],
      ['rango_ingreso_familiar', rangoIngresoFinal],
      ['vivienda_tipo', viviendaTipoFinal],
      ['vivienda_estatus', viviendaEstatusFinal],
      ['serv_internet', servInternet],
      ['familia_num_hermanos', numHermanosFinal],
      ['familia_hermanos_uni', hermanosUniNum],
      ['familia_hermanos_uni_sn', hermanosUniSnFinal],
      ['familia_nucleo_json', familiaNucleoJsonFinal],
      ['monto_egreso_mercado', egresoMercado],
      ['monto_egreso_vivienda', egresoVivienda],
      ['monto_egreso_salud', egresoSalud],
      ['monto_egreso_servicios', egresoServicios],
      ['monto_egreso_suntuarios', egresoSuntuarios],
      ['monto_egreso_estudios', egresoEstudios],
      ['monto_egreso_recreacion', egresoRecreacion],
      ['situacion_laboral_jefe', poseeEmpleoFinal],
      ['salud_condicion_especial', saludCondicionFinal],
      ['serv_agua', servAgua],
      ['serv_gas', servGas],
      ['serv_aseo', servAseo],
      ['serv_luz', servLuz],
      ['serv_telefono', servTelefono],
      ['serv_cloacas', servCloacas],
      ['equip_lavadora', equipLavadora],
      ['equip_nevera', equipNevera],
      ['equip_cable', equipCable],
      ['equip_aire', equipAire],
      ['equip_ventilador', equipVentilador],
      ['equip_tv', equipTv],
      ['equip_cocina', equipCocina],
      ['equip_microondas', equipMicroondas],
      ['equip_sonido', equipSonido],
      ['equip_computadora', equipComputadora],
      ['equip_celular', equipCelular],
      ['salud_enfermedad_desc', normalizeTexto(data.salud_enfermedad_desc, 'NO')],
      ['salud_tratamiento', normalizeTexto(data.salud_tratamiento, 'NO')],
      ['familia_relacion', familiaRelacionFinal],
      ['familia_problema_sn', familiaProblemaSnFinal],
      ['familia_problema_desc', normalizeTextoNullable(data.familia_problema_desc)],
      ['organizacion_activa', normalizeTexto(data.organizacion_activa, 'Ninguna')],
      [
        'observaciones_solicitante',
        normalizeTextoNullable(data.observaciones_solicitante || data.observaciones_estudio),
      ],
      ['puntaje', puntaje],
      ['nivel_riesgo', nivel],
    ];

    const columnasSql = camposAdmin.map(([col]) => `\`${col}\``).join(', ');
    const placeholdersSql = camposAdmin.map(() => '?').join(', ');
    const updateSql = camposAdmin
      .filter(([col]) => col !== 'student_id' && col !== 'tipo')
      .map(([col]) => `\`${col}\` = VALUES(\`${col}\`)`)
      .join(', ');
    const valoresAdmin = camposAdmin.map(([, val]) => val);

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO estudios_socioeconomicos (${columnasSql}, \`created_at\`)
        VALUES (${placeholdersSql}, NOW())
        ON DUPLICATE KEY UPDATE ${updateSql}, \`created_at\` = NOW()
      `,
      valoresAdmin
    );

    const [convocadasRows] = await connection.execute<SolicitudConvocadaRow[]>(
      `
      SELECT
        s.id,
        s.periodo_id,
        s.promedio_notas,
        s.tipo_beca,
        s.materias_json,
        st.semestre,
        IFNULL(st.indice_global, 0.00) AS indice_global
      FROM solicitudes s
      JOIN students st ON s.user_id = st.id
      WHERE s.user_id = ?
        AND s.estatus = 'Convocado a Entrevista'
      ORDER BY s.id DESC
      `,
      [studentIdNum]
    );

    const [updSolicitudRes] = await connection.execute<ResultSetHeader>(
      `UPDATE solicitudes SET estatus = 'En Revisión', fecha_revision = NOW() WHERE user_id = ? AND estatus = 'Convocado a Entrevista'`,
      [studentIdNum]
    );

    const observacionTransicion =
      'Estudio socioeconómico registrado en entrevista; expediente remitido a Secretaría General (En Revisión).';

    if (convocadasRows.length > 0 && updSolicitudRes.affectedRows > 0) {
      const sesionActual = await getSession();
      const adminActorId =
        sesionActual.isLoggedIn && 'id' in sesionActual && Number(sesionActual.id) > 0
          ? Number(sesionActual.id)
          : 0;
      const periodoActualId = Number(await obtenerOCrearPeriodoObjetivo());

      for (const solConv of convocadasRows) {
        const materiasSnap =
          typeof solConv.materias_json === 'string'
            ? solConv.materias_json
            : JSON.stringify(solConv.materias_json || []);

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
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Convocado a Entrevista', 'En Revisión', ?, ?, ?, NOW(), ?, '127.0.0.1')
          `,
          [
            Number(solConv.id),
            studentIdNum,
            periodoActualId > 0 ? periodoActualId : Number(solConv.periodo_id),
            adminActorId,
            solConv.promedio_notas,
            solConv.semestre ?? 1,
            puntaje,
            nivel,
            solConv.tipo_beca,
            observacionTransicion,
            materiasSnap,
            solConv.indice_global ?? 0.0,
            randomUUID(),
          ]
        );
      }
    }

    await connection.commit();

    // Notificación automática por correo al pasar de Convocado a Entrevista -> En Revisión
    let emailEnviado: boolean | undefined = undefined;
    let emailError: string | undefined = undefined;

    if (convocadasRows.length > 0 && updSolicitudRes.affectedRows > 0) {
      const envio = await enviarCorreoCambioEstatusPorSolicitudId({
        solicitudId: Number(convocadasRows[0].id),
        nuevoEstatus: 'En Revisión',
        estatusPrevio: 'Convocado a Entrevista',
        observaciones: observacionTransicion,
      });
      emailEnviado = envio.emailEnviado;
      emailError = envio.emailError;
    }

    return {
      success: true,
      puntaje,
      nivel,
      pasoARevision: convocadasRows.length > 0 && updSolicitudRes.affectedRows > 0,
      emailEnviado,
      emailError,
    };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error en procesarGuardadoEstudio:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}