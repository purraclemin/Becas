'use server'

/**
 * Función auxiliar para blindar el motor de errores de tipeo.
 * Convierte cualquier formato ("1,500.50", "1.500,00", "1000$") en un número matemático real.
 */
const parseMonto = (valor: any): number => {
  if (!valor) return 0;
  // Si ya es número, lo devuelve
  if (typeof valor === 'number') return valor;
  
  // Limpiamos todo excepto números, puntos y comas
  const stringLimpio = String(valor).replace(/[^\d.,]/g, '');
  if (!stringLimpio) return 0;

  // Si tiene formato europeo (punto miles, coma decimal) ej: 1.500,50 -> 1500.50
  if (stringLimpio.includes(',') && stringLimpio.indexOf(',') > stringLimpio.indexOf('.')) {
      return parseFloat(stringLimpio.replace(/\./g, '').replace(',', '.'));
  }
  
  // Formato americano estándar ej: 1,500.50 -> 1500.50
  return parseFloat(stringLimpio.replace(/,/g, ''));
};

/**
 * 🟢 MOTOR DE BAREMO UNIFICADO - VERSIÓN AUDITADA Y BLINDADA
 */
export async function calcularPuntajeUnificado(data: any) {
  let puntaje = 0;

  // 1. Normalización de Ingresos (Blindada con parseMonto)
  const monto_sueldo = parseMonto(data.monto_ingreso_sueldo);
  const monto_extra = parseMonto(data.monto_ingreso_extra);
  const monto_pension = parseMonto(data.monto_ingreso_pension);
  // Sincronizado: Acepta tanto ayuda de la BD como remesa del Frontend
  const monto_ayuda = parseMonto(data.monto_ingreso_ayuda || data.monto_ingreso_remesa);
  const monto_familiar = parseMonto(data.monto_ingreso_familiar);

  const ingresosBrutos = monto_sueldo + monto_extra + monto_pension + monto_ayuda + monto_familiar;

  // 2. Normalización de Egresos (Blindada con parseMonto)
  const egreso_mercado = parseMonto(data.monto_egreso_mercado);
  const egreso_vivienda = parseMonto(data.monto_egreso_vivienda);
  const egreso_salud = parseMonto(data.monto_egreso_salud);
  const egreso_servicios = parseMonto(data.monto_egreso_servicios);

  const egresosTotales = egreso_mercado + egreso_vivienda + egreso_salud + egreso_servicios;

  // A. FACTOR ECONÓMICO RESIDUAL (Ingreso Disponible)
  const residual = ingresosBrutos - egresosTotales;

  if (residual < 0) {
    puntaje += 40; // Déficit severo
  } else if (residual >= 0 && residual <= 50) {
    puntaje += 30; // Vulnerabilidad alta
  } else if (residual > 50 && residual <= 150) {
    puntaje += 20; // Vulnerabilidad media
  } else if (residual > 150 && residual <= 300) {
    puntaje += 10; // Capacidad limitada
  } else {
    puntaje += 0;  // Capacidad holgada
  }

  // B. FACTOR DE VIVIENDA
  const vTipo = data.viviendaTipo || data.vivienda_tipo;
  const vEstatus = data.viviendaEstatus || data.vivienda_estatus;

  if (vTipo === 'Vivienda rural' || vTipo === 'Habitación' || vTipo === 'Otro') puntaje += 15;
  if (vEstatus === 'Alquilada' || vEstatus === 'Residencia' || vEstatus === 'Prestada / Cedida') puntaje += 7;

  // C. HACINAMIENTO Y SITUACIÓN LABORAL
  const numHermanos = Number(data.numHermanos || data.familia_num_hermanos || 0);
  const poseeEmpleo = data.poseeEmpleo || data.posee_empleo_aspirante || data.posee_empleo;

  if (numHermanos > 4) puntaje += 10;
  if (poseeEmpleo === 'No') puntaje += 10;

  // D. SALUD Y DISCAPACIDAD
  const condicionSalud = data.saludCondicion || data.salud_condicion_especial || data.carga_familiar_discapacidad;
  if (condicionSalud === 'Si' || condicionSalud === 'Sí' || condicionSalud === 'on') puntaje += 10;

  // E. CONECTIVIDAD Y EQUIPAMIENTO (Deficiencias suman puntos)
  const checkPosee = (val: any) => val === 'on' || val === 'Posee' || val === 'Si' || val === 'Sí';

  const tieneInternet = checkPosee(data.servInternet) || checkPosee(data.serv_internet);
  if (!tieneInternet) puntaje += 7;

  const tieneNevera = checkPosee(data.equipNevera) || checkPosee(data.equip_nevera);
  if (!tieneNevera) puntaje += 5;

  // F. CLIMA FAMILIAR
  const relacion = data.familiaRelacion || data.familia_relacion;
  if (relacion === 'Regular') puntaje += 5;
  if (relacion === 'Mala') puntaje += 10;

  // 3. DETERMINAR NIVEL DE RIESGO (Umbrales originales: 70, 50, 25)
  let nivelRiesgo = 'Bajo';
  if (puntaje >= 70) nivelRiesgo = 'Crítico';
  else if (puntaje >= 50) nivelRiesgo = 'Alto';
  else if (puntaje >= 25) nivelRiesgo = 'Medio';

  return {
    puntaje,
    nivelRiesgo,
    detallesFinancieros: { // Útil para depuración futura si la necesitas
      ingresosBrutos,
      egresosTotales,
      residual
    }
  };
}