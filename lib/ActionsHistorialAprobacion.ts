"use server"

import {
  obtenerReporteHistorialAprobaciones,
  type HistorialAprobacionItem,
  type FiltrosHistorialAprobaciones,
  type RespuestaHistorialAprobaciones,
} from "@/app/admin/reportes/Historial-Aprobaciones/actions"

export type {
  HistorialAprobacionItem,
  FiltrosHistorialAprobaciones,
  RespuestaHistorialAprobaciones,
}

export async function obtenerHistorialAprobaciones(
  filtros: FiltrosHistorialAprobaciones = {}
): Promise<RespuestaHistorialAprobaciones> {
  return await obtenerReporteHistorialAprobaciones(filtros)
}