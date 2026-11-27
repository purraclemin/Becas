"use server"

import {
  obtenerReporteAprobadas,
  type ReporteAprobadaItem,
  type PeriodoAprobadaOption,
  type RespuestaReporteAprobadas,
} from "@/app/admin/reportes/aprobadas/actions"
import {
  obtenerReporteRechazadas,
  type EstatusCierreReporte,
  type FiltroEstatusCierre,
  type StatsReporteRechazadas,
  type ReporteRechazadaItem,
  type RespuestaReporteRechazadas,
} from "@/app/admin/reportes/rechazadas/actions"
import {
  obtenerReporteRecurrencia,
  type FiltrosReporteRecurrencia,
  type ReporteRecurrenciaItem,
  type StatsRecurrenciaReporte,
  type RespuestaReporteRecurrencia,
} from "@/app/admin/reportes/recurrencia/actions"
import {
  obtenerReporteSolicitudesFecha,
  type ReporteSolicitudFechaItem,
} from "@/app/admin/reportes/solicitudes-fecha/actions"
import {
  obtenerReporteCarreras,
  type FiltrosReporteCarreras,
  type EstudianteCarreraReporte,
  type ReporteCarreraItem,
  type StatsCarrerasReporte,
  type RespuestaReporteCarreras,
} from "@/app/admin/reportes/carreras/actions"
import {
  obtenerReporteAuditoria,
  type FiltrosReporteAuditoria,
  type ReporteAuditoriaItem,
  type RespuestaReporteAuditoria,
} from "@/app/admin/reportes/auditoria/actions"
import {
  obtenerReporteTiposBeca,
  type EstudianteTipoBecaReporte,
  type PeriodoTipoBecaOption,
  type FiltrosReporteTiposBeca,
  type ReporteTipoBecaItem,
  type StatsTiposBecaReporte,
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
  PeriodoAprobadaOption,
  RespuestaReporteAprobadas,
  EstatusCierreReporte,
  FiltroEstatusCierre,
  StatsReporteRechazadas,
  ReporteRechazadaItem,
  RespuestaReporteRechazadas,
  FiltrosReporteRecurrencia,
  ReporteRecurrenciaItem,
  StatsRecurrenciaReporte,
  RespuestaReporteRecurrencia,
  ReporteSolicitudFechaItem,
  FiltrosReporteCarreras,
  EstudianteCarreraReporte,
  ReporteCarreraItem,
  StatsCarrerasReporte,
  RespuestaReporteCarreras,
  FiltrosReporteAuditoria,
  ReporteAuditoriaItem,
  RespuestaReporteAuditoria,
  EstudianteTipoBecaReporte,
  PeriodoTipoBecaOption,
  FiltrosReporteTiposBeca,
  ReporteTipoBecaItem,
  StatsTiposBecaReporte,
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
  search?: string,
  periodoId?: number | "todos"
): Promise<RespuestaReporteAprobadas> {
  return await obtenerReporteAprobadas({ inicio, fin, search, periodoId })
}

export async function reporteRechazadasPorFecha(
  inicio?: string,
  fin?: string,
  search?: string,
  estatus?: FiltroEstatusCierre
): Promise<RespuestaReporteRechazadas> {
  return await obtenerReporteRechazadas({ inicio, fin, search, estatus })
}

export async function reporteRecurrenciaAlumnos(
  entrada?: string | FiltrosReporteRecurrencia
): Promise<RespuestaReporteRecurrencia> {
  return await obtenerReporteRecurrencia(entrada)
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
  entrada?: string | FiltrosReporteCarreras
): Promise<RespuestaReporteCarreras> {
  return await obtenerReporteCarreras(entrada)
}

export async function reporteAuditoriaAdministradores(
  entrada?: string | FiltrosReporteAuditoria
): Promise<RespuestaReporteAuditoria> {
  return await obtenerReporteAuditoria(entrada)
}

export async function reporteTiposDeBeca(
  filtros?: FiltrosReporteTiposBeca | string
): Promise<RespuestaReporteTiposBeca> {
  return await obtenerReporteTiposBeca(filtros)
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
