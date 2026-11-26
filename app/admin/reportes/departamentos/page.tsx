"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Building2,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  RefreshCw,
  Loader2,
  FileText,
  FileSpreadsheet,
  Calendar,
  Award,
  ChevronsUpDown
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import {
  reporteBecariosPorDepartamento,
  type DepartamentoAgrupadoReporte,
  type StatsDepartamentosReporte,
  type BecarioDepartamentoItem
} from "@/lib/ActionsReportes"

interface PeriodoSelectOption {
  id: number
  codigo: string
  nombre: string
  esActual: boolean
}

const getNotaBadge = (nota: number | string): string => {
  const val = typeof nota === "number" ? nota : parseFloat(nota || "0")
  if (val >= 18) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
  if (val >= 16) return "bg-blue-500/10 text-blue-700 border-blue-500/20"
  if (val >= 10) return "bg-amber-500/10 text-amber-700 border-amber-500/20"
  return "bg-rose-500/10 text-rose-700 border-rose-500/20"
}

export default function ReporteDepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<DepartamentoAgrupadoReporte[]>([])
  const [stats, setStats] = useState<StatsDepartamentosReporte>({
    totalDepartamentosActivos: 0,
    totalBecariosAsignados: 0,
    totalSinDepartamento: 0,
    totalBecarios: 0
  })
  const [periodos, setPeriodos] = useState<PeriodoSelectOption[]>([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>("")
  const [search, setSearch] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  // Misma lógica de acordeón del historial de materias (por defecto el primer departamento abierto)
  const [abierto, setAbierto] = useState<number | null>(0)
  const [expandirTodos, setExpandirTodos] = useState<boolean>(false)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)

  const cargarDatos = useCallback(async (termino: string, periodoVal: string) => {
    setLoading(true)
    try {
      const periodoParam: number | "todos" | undefined =
        periodoVal === "todos"
          ? "todos"
          : periodoVal !== "" && Number(periodoVal) > 0
            ? Number(periodoVal)
            : undefined

      const res = await reporteBecariosPorDepartamento({
        search: termino || undefined,
        periodoId: periodoParam
      })

      if (res.success) {
        setDepartamentos(res.departamentos)
        setStats(res.stats)
        setPeriodos(res.periodos)
        if (periodoVal === "") {
          setPeriodoSeleccionado(String(res.periodoSeleccionado))
        }
        setAbierto(res.departamentos.length > 0 ? 0 : null)
      } else {
        setDepartamentos([])
      }
    } catch (error) {
      console.error("Error al cargar reporte por departamentos:", error)
      setDepartamentos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargarDatos(search, periodoSeleccionado)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, periodoSeleccionado, cargarDatos])

  // Lista aplanada para impresión PDF y exportación Excel (.xlsx)
  const estudiantesAplanados = useMemo<BecarioDepartamentoItem[]>(() => {
    return departamentos.flatMap((d) => d.estudiantes)
  }, [departamentos])

  const etiquetaPeriodoActual = useMemo<string>(() => {
    if (periodoSeleccionado === "todos") return "Todos los Periodos"
    const encontrado = periodos.find((p) => String(p.id) === periodoSeleccionado)
    return encontrado ? `${encontrado.codigo} — ${encontrado.nombre}` : "Periodo Vigente"
  }, [periodoSeleccionado, periodos])

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((est: BecarioDepartamentoItem): CeldaXLSX[] => {
    return [
      est.departamento.toUpperCase(),
      `V-${est.cedula}`,
      `${est.nombre} ${est.apellido}`.trim().toUpperCase(),
      est.carrera.toUpperCase(),
      `${est.semestre}°`,
      est.tipoBeca.toUpperCase(),
      Number(est.promedioTrimestral),
      Number(est.indiceGlobal),
      est.email,
      est.telefono,
      est.periodoCodigo
    ]
  }, [])

  return (
    <div className="space-y-5 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL */}
      <div className="print:hidden">
        <PageHeader
          titulo="Becarios por Departamento"
          subtitulo={`Distribución operativa por dependencia — ${etiquetaPeriodoActual}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* MINI DASHBOARD (Misma arquitectura de 3 tarjetas KPI del Historial Académico) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#d4a843] transition-all">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1e3a5f] transition-colors shrink-0">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Departamentos Activos
            </p>
            <p className="text-xl font-mono font-black text-[#1e3a5f] leading-tight">
              {stats.totalDepartamentosActivos}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#d4a843] transition-all">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1e3a5f] transition-colors shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Becarios Asignados
            </p>
            <p className="text-xl font-mono font-black text-[#1e3a5f] leading-tight">
              {stats.totalBecariosAsignados}{" "}
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                / {stats.totalBecarios}
              </span>
            </p>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-all ${
            stats.totalSinDepartamento > 0
              ? "bg-amber-50/60 border-amber-200 hover:border-amber-400"
              : "bg-white border-slate-200 hover:border-[#d4a843]"
          }`}
        >
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
              stats.totalSinDepartamento > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-50 text-[#d4a843]"
            }`}
          >
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Sin Departamento
            </p>
            <p
              className={`text-xl font-mono font-black leading-tight ${
                stats.totalSinDepartamento > 0 ? "text-amber-700" : "text-[#1e3a5f]"
              }`}
            >
              {stats.totalSinDepartamento}
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS Y EXPORTACIÓN RÁPIDA */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-end justify-between gap-3 print:hidden">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-7 space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">
              Buscar Departamento o Estudiante
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Departamento, nombre, cédula o carrera..."
                className="w-full h-12 md:h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3 text-[#d4a843]" /> Periodo Académico
            </label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white cursor-pointer"
            >
              {periodos.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.codigo} — {p.nombre} {p.esActual ? "(Actual)" : ""}
                </option>
              ))}
              <option value="todos">Todos los Periodos (Histórico)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={departamentos.length === 0}
            onClick={() => setExpandirTodos((prev) => !prev)}
            className="h-12 md:h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1e3a5f] text-sm md:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ChevronsUpDown className="h-3.5 w-3.5 text-[#d4a843]" />
            <span>{expandirTodos ? "Colapsar" : "Expandir Todos"}</span>
          </button>

          <button
            type="button"
            disabled={loading || estudiantesAplanados.length === 0}
            onClick={handleImprimirPDF}
            className="h-12 md:h-9 px-3 rounded-lg bg-white hover:bg-[#f8fafc] border border-slate-200 text-[#1e3a5f] text-sm md:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            disabled={loading || exportandoXlsx || estudiantesAplanados.length === 0}
            onClick={() => void handleExportarXLSX()}
            className="h-12 md:h-9 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm md:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {exportandoXlsx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
            )}
            <span>Excel</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => void cargarDatos(search, periodoSeleccionado)}
            className="h-12 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* LISTADO COLAPSABLE POR DEPARTAMENTO (Misma lógica de ValidarBecaAcademicHistory) */}
      <div className="space-y-3 print:hidden">
        <div className="flex items-center gap-2.5 px-1">
          <Building2 className="h-4 w-4 text-[#d4a843]" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Dependencias Institucionales Detectadas ({departamentos.length})
          </h3>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#d4a843] mx-auto mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Agrupando becarios por departamento...
            </p>
          </div>
        ) : departamentos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              No se encontraron becarios aprobados para los filtros seleccionados.
            </p>
          </div>
        ) : (
          departamentos.map((depto, idx) => {
            const estaAbierto = expandirTodos || abierto === idx

            return (
              <div
                key={depto.departamento}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  depto.sinAsignar ? "border-amber-200" : "border-slate-200"
                }`}
              >
                {/* CABECERA COLAPSABLE DEL DEPARTAMENTO */}
                <button
                  type="button"
                  onClick={() => {
                    if (expandirTodos) {
                      setExpandirTodos(false)
                      setAbierto(idx)
                      return
                    }
                    setAbierto(abierto === idx ? null : idx)
                  }}
                  className="w-full p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        depto.sinAsignar
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[#1e3a5f] text-[#d4a843]"
                      }`}
                    >
                      {depto.sinAsignar ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black text-[#d4a843] uppercase tracking-wider">
                          {depto.sinAsignar ? "Atención Operativa" : "Dependencia Universitaria"}
                        </span>
                        {depto.sinAsignar && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[8px] font-black uppercase">
                            Pendiente de Ubicación
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-[#1e3a5f] uppercase tracking-tight">
                        {depto.departamento}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {depto.resumenModalidades.slice(0, 3).map((mod) => (
                          <span
                            key={mod.tipoBeca}
                            className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-600 uppercase"
                          >
                            {mod.tipoBeca}: {mod.cantidad}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                    <div className="flex flex-col items-start sm:items-end leading-none">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        Prom. Área
                      </span>
                      <span className="text-sm font-mono font-black text-[#1e3a5f] mt-0.5">
                        {depto.promedioGeneral}
                      </span>
                    </div>

                    <div className="flex flex-col items-end leading-none border-l border-slate-200 pl-4">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        Becarios
                      </span>
                      <span className="text-base font-mono font-black text-[#1e3a5f] mt-0.5">
                        {depto.totalEstudiantes}
                      </span>
                    </div>

                    {estaAbierto ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                </button>

                {/* CONTENIDO DESPLEGABLE: ESTUDIANTES EN ESE DEPARTAMENTO */}
                {estaAbierto && (
                  <div className="px-4 md:px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                    {/* TABLA PC */}
                    <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden bg-[#f8fafc]">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200">
                            <th className="px-3.5 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Cédula
                            </th>
                            <th className="px-3.5 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Estudiante / Contacto
                            </th>
                            <th className="px-3.5 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Carrera / Trim.
                            </th>
                            <th className="px-3.5 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Tipo de Beca
                            </th>
                            <th className="px-3.5 py-2.5 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Promedio
                            </th>
                            <th className="px-3.5 py-2.5 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Periodo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs">
                          {depto.estudiantes.map((est) => (
                            <tr key={est.solicitudId} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-3.5 py-2.5 font-mono text-[11px] font-bold text-slate-500">
                                V-{est.cedula}
                              </td>
                              <td className="px-3.5 py-2.5">
                                <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                                  {est.nombre} {est.apellido}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {est.email} • {est.telefono}
                                </p>
                              </td>
                              <td className="px-3.5 py-2.5">
                                <p className="font-bold text-slate-700 uppercase text-[11px]">
                                  {est.carrera}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {est.semestre}° Trimestre
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#1e3a5f] uppercase">
                                  <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                                  {est.tipoBeca}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 text-center">
                                <span
                                  className={`inline-block min-w-[44px] px-2 py-0.5 rounded-lg border text-[11px] font-mono font-black ${getNotaBadge(
                                    est.promedioTrimestral
                                  )}`}
                                >
                                  {est.promedioTrimestral}
                                </span>
                                <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                                  G: {est.indiceGlobal}
                                </span>
                              </td>
                              <td className="px-3.5 py-2.5 text-right">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[#1e3a5f] text-[10px] font-black uppercase">
                                  {est.periodoCodigo}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* TARJETAS MÓVIL */}
                    <div className="md:hidden space-y-2.5">
                      {depto.estudiantes.map((est) => (
                        <div
                          key={`mob-${est.solicitudId}`}
                          className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-black text-[#1e3a5f] uppercase">
                                {est.nombre} {est.apellido}
                              </p>
                              <p className="text-xs font-mono font-bold text-slate-500">
                                V-{est.cedula} • {est.semestre}° Trim.
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-black shrink-0 ${getNotaBadge(
                                est.promedioTrimestral
                              )}`}
                            >
                              {est.promedioTrimestral}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 uppercase">
                            {est.carrera}
                          </p>
                          <p className="text-xs font-black text-[#1e3a5f] uppercase">
                            {est.tipoBeca}
                          </p>
                          <p className="text-[11px] text-slate-500 break-all">
                            {est.email} • {est.telefono}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout<BecarioDepartamentoItem>
        titulo="Becarios por Departamento"
        subtitulo={`${etiquetaPeriodoActual} — Departamentos Activos: ${stats.totalDepartamentosActivos} | Becarios: ${stats.totalBecarios}${
          search.trim() ? ` | Filtro: "${search.trim()}"` : ""
        }`}
        columnas={[
          "Departamento",
          "Estudiante / Cédula",
          "Carrera / Trim.",
          "Tipo de Beca",
          "Prom. / Global",
          "Contacto"
        ]}
        datos={estudiantesAplanados}
        renderFila={(est, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400 font-bold text-[#1e3a5f] uppercase">
              {est.departamento}
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {est.nombre} {est.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{est.cedula}</span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{est.carrera}</span>
              <span className="text-[8px] text-slate-600 font-bold">{est.semestre}° Trimestre</span>
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">
              {est.tipoBeca}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{est.promedioTrimestral}</span>
              <span className="text-[8px] text-slate-600">G: {est.indiceGlobal}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-[8px]">
              <span className="block">{est.email}</span>
              <span className="block text-slate-600">{est.telefono}</span>
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<BecarioDepartamentoItem>
        ref={xlsxRef}
        titulo="Becarios por Departamento"
        subtitulo={`${etiquetaPeriodoActual} — Total Becarios: ${stats.totalBecarios}`}
        nombreHoja="Becarios_Departamentos"
        nombreArchivo="becarios_por_departamento_unimar"
        columnas={[
          "Departamento",
          "Cédula",
          "Estudiante",
          "Carrera",
          "Trimestre",
          "Tipo de Beca",
          "Prom. Trimestral",
          "Índice Global",
          "Correo",
          "Teléfono",
          "Periodo"
        ]}
        datos={estudiantesAplanados}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}