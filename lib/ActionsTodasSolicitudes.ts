'use server'

import { fetchSolicitudesDesdeDB } from './ActionsTodasSolicitudesSQL'

/**
 * Acción principal que el frontend consume.
 * Delega la carga pesada al archivo SQL y se enfoca en el formato.
 * Centraliza el cálculo de paginación para evitar inconsistencias visuales (parpadeo) en el cliente.
 */
export async function obtenerTodasLasSolicitudes(filtros: any = {}) {
  try {
    // La propagación del objeto filtros asegura que los parámetros de Analytics
    // (es_renovacion, promedioMin, vulnerabilidadMin, tendencia) lleguen a la DB.
    const { rows, totalRegistros, limit } = await fetchSolicitudesDesdeDB(filtros);

    // Formateamos los datos brutos de la DB para el uso en el Panel y Tabla
    const dataFormatted = rows.map((row: any) => ({
        ...row,
        // Normalizamos el email para que el componente SolicitudAuditoriaPanel lo encuentre
        email: row.email_institucional, 
        fecha: row.fecha_registro 
          ? new Date(row.fecha_registro).toLocaleDateString('es-VE', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            }) 
          : "Sin Fecha",
        // El estatus del estudio se determina por la existencia de puntaje en la tabla socioeconómica
        estatus_estudio: row.puntaje !== null ? 'Hecho' : 'Pendiente'
    }));

    // Calculamos las páginas asegurando un mínimo de 1 para evitar estados vacíos iniciales
    const paginasCalculadas = Math.ceil(totalRegistros / (limit || 1));

    return {
      data: dataFormatted,
      totalPaginas: paginasCalculadas > 0 ? paginasCalculadas : 1,
      totalRegistros: totalRegistros
    };

  } catch (error) {
    console.error("❌ Error en obtenerTodasLasSolicitudes:", error);
    // Retornamos 1 página por defecto en caso de error para mantener la estructura de la UI
    return { data: [], totalPaginas: 1, totalRegistros: 0 };
  }
}