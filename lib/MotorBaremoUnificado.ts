'use server'

export interface BaremoInputData {
  // Área Económica
  ingresoTotal?: number | string | null;
  rango_ingreso_familiar?: string | null;
  rangoIngresoFamiliar?: string | null;
  monto_ingreso_sueldo?: number | string | null;
  monto_ingreso_extra?: number | string | null;
  monto_ingreso_pension?: number | string | null;
  monto_ingreso_ayuda?: number | string | null;
  monto_ingreso_remesa?: number | string | null;
  monto_ingreso_familiar?: number | string | null;
  monto_ingreso_rentas?: number | string | null;
  monto_ingreso_otros?: number | string | null;
  monto_egreso_mercado?: number | string | null;
  monto_egreso_vivienda?: number | string | null;
  monto_egreso_salud?: number | string | null;
  monto_egreso_servicios?: number | string | null;
  monto_egreso_suntuarios?: number | string | null;
  monto_egreso_estudios?: number | string | null;
  monto_egreso_recreacion?: number | string | null;

  // Área Físico Ambiental (Vivienda)
  viviendaTipo?: string | null;
  vivienda_tipo?: string | null;
  viviendaEstatus?: string | null;
  vivienda_estatus?: string | null;

  // 7 Servicios Básicos
  servAgua?: string | boolean | null;
  serv_agua?: string | boolean | null;
  servLuz?: string | boolean | null;
  serv_luz?: string | boolean | null;
  servGas?: string | boolean | null;
  serv_gas?: string | boolean | null;
  servAseo?: string | boolean | null;
  serv_aseo?: string | boolean | null;
  servTelefono?: string | boolean | null;
  serv_telefono?: string | boolean | null;
  servCloacas?: string | boolean | null;
  serv_cloacas?: string | boolean | null;
  servInternet?: string | boolean | null;
  serv_internet?: string | boolean | null;

  // 11 Equipamientos del Hogar
  equipNevera?: string | boolean | null;
  equip_nevera?: string | boolean | null;
  equipAire?: string | boolean | null;
  equip_aire?: string | boolean | null;
  equipVentilador?: string | boolean | null;
  equip_ventilador?: string | boolean | null;
  equipTv?: string | boolean | null;
  equip_tv?: string | boolean | null;
  equipCocina?: string | boolean | null;
  equip_cocina?: string | boolean | null;
  equipMicroondas?: string | boolean | null;
  equip_microondas?: string | boolean | null;
  equipLavadora?: string | boolean | null;
  equip_lavadora?: string | boolean | null;
  equipSonido?: string | boolean | null;
  equip_sonido?: string | boolean | null;
  equipComputadora?: string | boolean | null;
  equip_computadora?: string | boolean | null;
  equipCelular?: string | boolean | null;
  equip_celular?: string | boolean | null;
  equipCable?: string | boolean | null;
  equip_cable?: string | boolean | null;

  // Área Laboral y Familiar
  poseeEmpleo?: string | null;
  posee_empleo_aspirante?: string | null;
  posee_empleo?: string | null;
  situacion_laboral_jefe?: string | null;
  socio_condicion_laboral_tipo?: string | null;
  familia_estatus_conyugal?: string | null;
  numHermanos?: number | string | null;
  familia_num_hermanos?: number | string | null;
  familia_hermanos_uni?: number | string | null;
  familia_nucleo_json?: string | null;

  // Área Salud y Socio-Psicológica
  saludCondicion?: string | null;
  salud_condicion_especial?: string | null;
  carga_familiar_discapacidad?: string | null;
  familiaRelacion?: string | null;
  familia_relacion?: string | null;
  familia_problema_sn?: string | null;
}

export interface BaremoResultado {
  puntaje: number;
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  detallesFinancieros: {
    ingresosBrutos: number;
    egresosTotales: number;
    egresosEsenciales: number;
    residual: number;
    residualEsencial: number;
  };
}

const ESTRUCTURAS_ESTANDAR_CONFORT = new Set(['Quinta', 'Casa', 'Apartamento']);
const TENENCIAS_PROPIAS = new Set(['Propia', 'Pagándose']);

const parseMonto = (valor: number | string | null | undefined): number => {
  if (valor === null || valor === undefined || valor === '') return 0;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;

  const stringLimpio = String(valor).replace(/[^\d.,]/g, '');
  if (!stringLimpio) return 0;

  if (stringLimpio.includes(',') && stringLimpio.indexOf(',') > stringLimpio.indexOf('.')) {
    const parsed = parseFloat(stringLimpio.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = parseFloat(stringLimpio.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const checkPosee = (val: string | boolean | null | undefined): boolean => {
  if (typeof val === 'boolean') return val;
  if (typeof val !== 'string') return false;
  const normalizado = val.trim().toLowerCase();
  return normalizado === 'on' || normalizado === 'posee' || normalizado === 'si' || normalizado === 'sí' || normalizado === '1';
};

const contarIntegrantesNucleo = (jsonStr: string | null | undefined): number => {
  if (!jsonStr || jsonStr.trim() === '') return 0;
  try {
    const parsed: unknown = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

/**
 * MOTOR DE BAREMO UNIFICADO (ESCALA 0 - 100)
 * Ponderación integral sincronizada con el estudio socioeconómico completo:
 * - A. Capacidad económica y balance de egresos: 0 a 35 pts
 * - B. Vivienda, 7 servicios básicos y 11 equipamientos: 0 a 25 pts
 * - C. Situación laboral y carga familiar: 0 a 25 pts
 * - D. Salud y entorno socio-psicológico: 0 a 15 pts
 * Total máximo: 100 pts (acotado estrictamente entre 0 y 100).
 */
export async function calcularPuntajeUnificado(data: BaremoInputData): Promise<BaremoResultado> {
  // 1. Ingresos totales mensuales (7 rubros)
  const monto_sueldo = parseMonto(data.monto_ingreso_sueldo);
  const monto_extra = parseMonto(data.monto_ingreso_extra);
  const monto_pension = parseMonto(data.monto_ingreso_pension);
  const monto_ayuda = parseMonto(data.monto_ingreso_ayuda ?? data.monto_ingreso_remesa);
  const monto_familiar = parseMonto(data.monto_ingreso_familiar);
  const monto_rentas = parseMonto(data.monto_ingreso_rentas);
  const monto_otros = parseMonto(data.monto_ingreso_otros);

  const sumaRubrosIngreso =
    monto_sueldo +
    monto_extra +
    monto_pension +
    monto_ayuda +
    monto_familiar +
    monto_rentas +
    monto_otros;

  const ingresosBrutos =
    sumaRubrosIngreso > 0 ? sumaRubrosIngreso : parseMonto(data.ingresoTotal);

  // 2. Egresos esenciales vs. egresos complementarios/suntuarios (7 rubros)
  const egreso_mercado = parseMonto(data.monto_egreso_mercado);
  const egreso_vivienda = parseMonto(data.monto_egreso_vivienda);
  const egreso_salud = parseMonto(data.monto_egreso_salud);
  const egreso_servicios = parseMonto(data.monto_egreso_servicios);
  const egreso_suntuarios = parseMonto(data.monto_egreso_suntuarios);
  const egreso_estudios = parseMonto(data.monto_egreso_estudios);
  const egreso_recreacion = parseMonto(data.monto_egreso_recreacion);

  const egresosEsenciales =
    egreso_mercado + egreso_vivienda + egreso_salud + egreso_servicios;

  const egresosTotales =
    egresosEsenciales + egreso_suntuarios + egreso_estudios + egreso_recreacion;

  const residualEsencial = ingresosBrutos - egresosEsenciales;
  const residual = ingresosBrutos - egresosTotales;

  // =========================================================================
  // A. CAPACIDAD ECONÓMICA Y BALANCE DE EGRESOS (0 a 35 pts)
  // =========================================================================
  let puntosEconomia = 0;

  // A1. Residual esencial (0 a 27 pts)
  if (residualEsencial < 0) {
    puntosEconomia += 27;
  } else if (residualEsencial <= 60) {
    puntosEconomia += 21;
  } else if (residualEsencial <= 150) {
    puntosEconomia += 15;
  } else if (residualEsencial <= 300) {
    puntosEconomia += 8;
  } else {
    puntosEconomia += 2;
  }

  // A2. Presión de egresos totales incluyendo estudios/suntuarios/recreación (0 a 3 pts)
  if (residual < 0) {
    puntosEconomia += 3;
  } else if (residual <= 40) {
    puntosEconomia += 1;
  }

  // A3. Rango de ingreso mensual familiar declarado (0 a 5 pts)
  const rangoIngreso = (data.rango_ingreso_familiar || data.rangoIngresoFamiliar || '').trim();
  if (rangoIngreso === '1') {
    puntosEconomia += 5;
  } else if (rangoIngreso === '2') {
    puntosEconomia += 2;
  }

  puntosEconomia = Math.min(35, puntosEconomia);

  // =========================================================================
  // B. VIVIENDA, SERVICIOS BÁSICOS Y EQUIPAMIENTO (0 a 25 pts)
  // =========================================================================
  let puntosViviendaServicios = 0;
  const vTipo = (data.viviendaTipo || data.vivienda_tipo || '').trim();
  const vEstatus = (data.viviendaEstatus || data.vivienda_estatus || '').trim();

  // B1. Tipo de vivienda (0 a 6 pts)
  if (
    vTipo === 'Vivienda rural' ||
    vTipo === 'Habitación' ||
    vTipo === 'Otro' ||
    (vTipo !== '' && !ESTRUCTURAS_ESTANDAR_CONFORT.has(vTipo))
  ) {
    puntosViviendaServicios += 6;
  } else if (vTipo === 'Casa') {
    puntosViviendaServicios += 2;
  }

  // B2. Tenencia de la vivienda (0 a 5 pts)
  if (
    vEstatus === 'Alquilada' ||
    vEstatus === 'Residencia' ||
    vEstatus === 'Prestada / Cedida' ||
    (vEstatus !== '' && !TENENCIAS_PROPIAS.has(vEstatus))
  ) {
    puntosViviendaServicios += 5;
  } else if (vEstatus === 'Pagándose') {
    puntosViviendaServicios += 2;
  }

  // B3. 7 Servicios Básicos (suma máxima exacta: 7.00 pts)
  let puntosServicios = 0;
  if (!checkPosee(data.servAgua ?? data.serv_agua)) puntosServicios += 1.5;
  if (!checkPosee(data.servLuz ?? data.serv_luz)) puntosServicios += 1.5;
  if (!checkPosee(data.servGas ?? data.serv_gas)) puntosServicios += 1.0;
  if (!checkPosee(data.servCloacas ?? data.serv_cloacas)) puntosServicios += 1.0;
  if (!checkPosee(data.servAseo ?? data.serv_aseo)) puntosServicios += 0.75;
  if (!checkPosee(data.servInternet ?? data.serv_internet)) puntosServicios += 0.75;
  if (!checkPosee(data.servTelefono ?? data.serv_telefono)) puntosServicios += 0.5;

  // B4. 11 Equipamientos del Hogar (suma máxima exacta: 7.00 pts)
  let puntosEquipamiento = 0;
  if (!checkPosee(data.equipNevera ?? data.equip_nevera)) puntosEquipamiento += 1.25;
  if (!checkPosee(data.equipCocina ?? data.equip_cocina)) puntosEquipamiento += 1.0;
  if (!checkPosee(data.equipComputadora ?? data.equip_computadora)) puntosEquipamiento += 1.0;
  if (!checkPosee(data.equipLavadora ?? data.equip_lavadora)) puntosEquipamiento += 0.75;
  if (!checkPosee(data.equipCelular ?? data.equip_celular)) puntosEquipamiento += 0.5;
  if (!checkPosee(data.equipAire ?? data.equip_aire)) puntosEquipamiento += 0.5;
  if (!checkPosee(data.equipVentilador ?? data.equip_ventilador)) puntosEquipamiento += 0.5;
  if (!checkPosee(data.equipMicroondas ?? data.equip_microondas)) puntosEquipamiento += 0.5;
  if (!checkPosee(data.equipTv ?? data.equip_tv)) puntosEquipamiento += 0.35;
  if (!checkPosee(data.equipCable ?? data.equip_cable)) puntosEquipamiento += 0.35;
  if (!checkPosee(data.equipSonido ?? data.equip_sonido)) puntosEquipamiento += 0.3;

  puntosViviendaServicios = Math.min(
    25,
    puntosViviendaServicios + puntosServicios + puntosEquipamiento
  );

  // =========================================================================
  // C. SITUACIÓN LABORAL Y CARGA FAMILIAR (0 a 25 pts)
  // =========================================================================
  let puntosLaboralCarga = 0;

  // C1. Empleo y modalidad laboral (0 a 10 pts)
  const poseeEmpleo = (
    data.poseeEmpleo ||
    data.posee_empleo_aspirante ||
    data.posee_empleo ||
    data.situacion_laboral_jefe ||
    ''
  ).trim();
  const condicionLaboral = (data.socio_condicion_laboral_tipo || '').trim().toLowerCase();

  if (poseeEmpleo === 'No') {
    puntosLaboralCarga += 10;
  } else if (
    condicionLaboral.includes('informal') ||
    condicionLaboral.includes('comerciante')
  ) {
    puntosLaboralCarga += 5;
  }

  // C2. Situación parental / conyugal (0 a 3 pts)
  const estatusConyugal = (data.familia_estatus_conyugal || '').trim().toLowerCase();
  if (estatusConyugal === 'separados' || estatusConyugal === 'divorciados') {
    puntosLaboralCarga += 3;
  } else if (estatusConyugal === 'concubinato' || estatusConyugal === 'ninguna') {
    puntosLaboralCarga += 1;
  }

  // C3. Número total de hermanos (0 a 6 pts)
  const numHermanos = Number(data.numHermanos ?? data.familia_num_hermanos ?? 0) || 0;
  if (numHermanos >= 5) {
    puntosLaboralCarga += 6;
  } else if (numHermanos >= 3) {
    puntosLaboralCarga += 4;
  } else if (numHermanos >= 1) {
    puntosLaboralCarga += 2;
  }

  // C4. Hermanos cursando estudios universitarios (0 a 4 pts)
  const hermanosUni = Number(data.familia_hermanos_uni ?? 0) || 0;
  if (hermanosUni >= 2) {
    puntosLaboralCarga += 4;
  } else if (hermanosUni === 1) {
    puntosLaboralCarga += 2;
  }

  // C5. Carga adicional en núcleo familiar (0 a 2 pts)
  const totalNucleo = contarIntegrantesNucleo(data.familia_nucleo_json);
  if (totalNucleo >= 5) {
    puntosLaboralCarga += 2;
  } else if (totalNucleo >= 3) {
    puntosLaboralCarga += 1;
  }

  puntosLaboralCarga = Math.min(25, puntosLaboralCarga);

  // =========================================================================
  // D. SALUD Y ENTORNO SOCIO-PSICOLÓGICO (0 a 15 pts)
  // =========================================================================
  let puntosSaludEntorno = 0;

  // D1. Condición médica especial o discapacidad (0 a 8 pts)
  const condicionSalud = (
    data.saludCondicion ||
    data.salud_condicion_especial ||
    data.carga_familiar_discapacidad ||
    'No'
  ).trim();

  if (condicionSalud === 'Si' || condicionSalud === 'Sí' || condicionSalud === 'on') {
    puntosSaludEntorno += 8;
  }

  // D2. Clima / relación familiar (0 a 4 pts)
  const relacion = (data.familiaRelacion || data.familia_relacion || '').trim();
  if (relacion === 'Mala') {
    puntosSaludEntorno += 4;
  } else if (relacion === 'Regular') {
    puntosSaludEntorno += 2;
  }

  // D3. Problema que afecte la relación familiar (0 a 3 pts)
  if (data.familia_problema_sn === 'Si' || data.familia_problema_sn === 'Sí') {
    puntosSaludEntorno += 3;
  }

  puntosSaludEntorno = Math.min(15, puntosSaludEntorno);

  // =========================================================================
  // PUNTAJE FINAL Y NIVEL DE RIESGO (ESCALA 0 - 100)
  // =========================================================================
  const puntaje = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        puntosEconomia +
          puntosViviendaServicios +
          puntosLaboralCarga +
          puntosSaludEntorno
      )
    )
  );

  let nivelRiesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Bajo';
  if (puntaje >= 70) nivelRiesgo = 'Crítico';
  else if (puntaje >= 50) nivelRiesgo = 'Alto';
  else if (puntaje >= 25) nivelRiesgo = 'Medio';

  return {
    puntaje,
    nivelRiesgo,
    detallesFinancieros: {
      ingresosBrutos,
      egresosTotales,
      egresosEsenciales,
      residual,
      residualEsencial
    }
  };
}