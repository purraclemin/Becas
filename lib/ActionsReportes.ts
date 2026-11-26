"use server"

import {
  obtenerReporteAprobadas,
  type ReporteAprobadaItem,
  type RespuestaReporteAprobadas,
} from "@/app/admin/reportes/aprobadas/actions"
import {
  obtenerReporteRechazadas,
  type ReporteRechazadaItem,
  type RespuestaReporteRechazadas,
} from "@/app/admin/reportes/rechazadas/actions"
import {
  obtenerReporteRecurrencia,
  type ReporteRecurrenciaItem,
  type RespuestaReporteRecurrencia,
} from "@/app/admin/reportes/recurrencia/actions"
import {
  obtenerReporteSolicitudesFecha,
  type ReporteSolicitudFechaItem,
} from "@/app/admin/reportes/solicitudes-fecha/actions"
import {
  obtenerReporteCarreras,
  type ReporteCarreraItem,
  type RespuestaReporteCarreras,
} from "@/app/admin/reportes/carreras/actions"
import {
  obtenerReporteAuditoria,
  type ReporteAuditoriaItem,
  type RespuestaReporteAuditoria,
} from "@/app/admin/reportes/auditoria/actions"
import {
  obtenerReporteTiposBeca,
  type ReporteTipoBecaItem,
  type RespuestaReporteTiposBeca,
} from "@/app/admin/reportes/tipos-beca/actions"
import {
  obtenerReporteEnRevision,
  enviarReporteEnRevisionSecretaria as enviarEnRevisionModular,
  type FiltrosReporteEnRevision,
  type ExpedienteEnRevisionItem,
  type ResumenCupoModalidad,
  type PeriodoResumenBasico,
  type RespuestaReporteEnRevision,
  type RespuestaEnvioSecretaria,
} from "@/app/admin/reportes/en-revision/actions"
import {
  obtenerReporteDepartamentos,
  type FiltrosReporteDepartamentos,
  type BecarioDepartamentoItem,
  type DepartamentoAgrupadoReporte,
  type StatsDepartamentosReporte,
  type RespuestaReporteDepartamentos,
} from "@/app/admin/reportes/departamentos/actions"

export type {
  ReporteAprobadaItem,
  RespuestaReporteAprobadas,
  ReporteRechazadaItem,
  RespuestaReporteRechazadas,
  ReporteRecurrenciaItem,
  RespuestaReporteRecurrencia,
  ReporteSolicitudFechaItem,
  ReporteCarreraItem,
  RespuestaReporteCarreras,
  ReporteAuditoriaItem,
  RespuestaReporteAuditoria,
  ReporteTipoBecaItem,
  RespuestaReporteTiposBeca,
  FiltrosReporteEnRevision,
  ExpedienteEnRevisionItem,
  ResumenCupoModalidad,
  PeriodoResumenBasico,
  RespuestaReporteEnRevision,
  RespuestaEnvioSecretaria,
  FiltrosReporteDepartamentos,
  BecarioDepartamentoItem,
  DepartamentoAgrupadoReporte,
  StatsDepartamentosReporte,
  RespuestaReporteDepartamentos,
}

export async function reporteAprobadasPorFecha(
  inicio?: string,
  fin?: string,
  search?: string
): Promise<RespuestaReporteAprobadas> {
  return await obtenerReporteAprobadas({ inicio, fin, search })
}

export async function reporteRechazadasPorFecha(
  inicio?: string,
  fin?: string,
  search?: string
): Promise<RespuestaReporteRechazadas> {
  return await obtenerReporteRechazadas({ inicio, fin, search })
}

export async function reporteRecurrenciaAlumnos(
  search?: string
): Promise<RespuestaReporteRecurrencia> {
  return await obtenerReporteRecurrencia(search)
}

export async function reporteSolicitudesPorFecha(
  inicio?: string,
  fin?: string,
  search?: string
): Promise<ReporteSolicitudFechaItem[]> {
  const res = await obtenerReporteSolicitudesFecha({ inicio, fin, search })
  return res.data
}

export async function reporteDistribucionCarreras(
  search?: string
): Promise<RespuestaReporteCarreras> {
  return await obtenerReporteCarreras(search)
}

export async function reporteAuditoriaAdministradores(
  search?: string
): Promise<RespuestaReporteAuditoria> {
  return await obtenerReporteAuditoria(search)
}

export async function reporteTiposDeBeca(
  search?: string
): Promise<RespuestaReporteTiposBeca> {
  return await obtenerReporteTiposBeca(search)
}

export async function reporteEnRevision(
  filtros: FiltrosReporteEnRevision = {}
): Promise<RespuestaReporteEnRevision> {
  return await obtenerReporteEnRevision(filtros)
}

export async function enviarReporteEnRevisionSecretaria(
  filtros: FiltrosReporteEnRevision = {}
): Promise<RespuestaEnvioSecretaria> {
  return await enviarEnRevisionModular(filtros)
}

export async function reporteBecariosPorDepartamento(
  filtros: FiltrosReporteDepartamentos = {}
): Promise<RespuestaReporteDepartamentos> {
  return await obtenerReporteDepartamentos(filtros)
}