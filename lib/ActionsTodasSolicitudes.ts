'use server'

import {
  fetchSolicitudesDesdeDB,
  type FiltrosDB,
  type SolicitudDBRow
} from './ActionsTodasSolicitudesSQL'

export interface SolicitudFormateada extends SolicitudDBRow {
  email: string | null;
  fecha: string;
  estatus_estudio: 'Hecho' | 'Pendiente';
}

/**
 * Acción principal que el frontend consume.
 * Delega la carga pesada al archivo SQL y se enfoca en el formato.
 * Centraliza el cálculo de paginación para evitar inconsistencias visuales (parpadeo) en el cliente.
 */
export async function obtenerTodasLasSolicitudes(filtros: FiltrosDB = {}): Promise<{
  data: SolicitudFormateada[];
  totalPaginas: number;
  totalRegistros: number;
}> {
  try {
    const { rows, totalRegistros, limit } = await fetchSolicitudesDesdeDB(filtros);

    const dataFormatted: SolicitudFormateada[] = rows.map((row) => ({
      ...row,
      email: row.email_institucional,
      fecha: row.fecha_registro
        ? new Date(row.fecha_registro).toLocaleDateString('es-VE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : "Sin Fecha",
      estatus_estudio: row.puntaje !== null ? 'Hecho' : 'Pendiente'
    }));

    const paginasCalculadas = Math.ceil(totalRegistros / (limit || 1));

    return {
      data: dataFormatted,
      totalPaginas: paginasCalculadas > 0 ? paginasCalculadas : 1,
      totalRegistros
    };
  } catch (error) {
    console.error("❌ Error en obtenerTodasLasSolicitudes:", error);
    return { data: [], totalPaginas: 1, totalRegistros: 0 };
  }
}