"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  X,
  RefreshCw,
  Calendar,
  Award,
  ChevronsUpDown,
  RotateCcw,
  AlertCircle
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import { esEgresadoPorSemestre } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import {
  obtenerReporteDepartamentos,
  type RespuestaReporteDepartamentos,
  type DepartamentoAgrupadoReporte,
  type StatsDepartamentosReporte,
  type BecarioDepartamentoItem,
  type PeriodoDepartamentoOption
} from "./actions"

const formatearTrimestreDepto = (semestre: number, corto: boolean = false): string => {
  if (esEgresadoPorSemestre(semestre)) return "Egresado"
  return corto ? `${semestre}°` : `${semestre}° Trimestre`
}

interface DepartamentosReporteClientProps {
  initialData: RespuestaReporteDepartamentos
}

const getNotaBadge = (nota: number | string): string => {
  const val = typeof nota === "number" ? nota : parseFloat(nota || "0")
  if (val >= 18) return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
  if (val >= 16) return "bg-blue-500/10 text-blue-700 border-blue-500/20"
  if (val >= 10) return "bg-amber-500/10 text-amber-700 border-amber-500/20"
  return "bg-rose-500/10 text-rose-700 border-rose-500/20"
}

export function DepartamentosReporteClient({
  initialData
}: DepartamentosReporteClientProps) {
  const router = useRouter()
  const [departamentos, setDepartamentos] = useState<DepartamentoAgrupadoReporte[]>(
    Array.isArray(initialData?.departamentos) ? initialData.departamentos : []
  )
  const [stats, setStats] = useState<StatsDepartamentosReporte>(initialData.stats)
  const [periodoActual, setPeriodoActual] = useState<PeriodoDepartamentoOption | null>(
    initialData.periodoActual ?? initialData.periodos?.[0] ?? null
  )
  const [search, setSearch] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  // Todos los bloques de departamento inician cerrados
  const [abiertos, setAbiertos] = useState<string[]>([])

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (termino: string, desde: string, hasta: string) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteDepartamentos({
          search: termino || undefined,
          fechaDesde: desde || undefined,
          fechaHasta: hasta || undefined,
        })

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setDepartamentos(res.departamentos)
          setStats(res.stats)
          setPeriodoActual(res.periodoActual ?? res.periodos?.[0] ?? null)

          if (termino.trim() !== "" || desde !== "" || hasta !== "") {
            setAbiertos(res.departamentos.map((d) => d.departamento))
          } else {
            setAbiertos([])
          }
        }
      } catch (error) {
        console.error("Error al actualizar reporte por departamentos:", error)
      } finally {
        if (reqId === requestIdRef.current) {
          setActualizando(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false
      return
    }

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setAvisoFecha("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")
      return
    }

    setAvisoFecha(null)
    const delay = search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(search, fechaDesde, fechaHasta)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, fechaDesde, fechaHasta, cargarDatos])

  const hayFiltrosActivos =
    search.trim() !== "" || fechaDesde !== "" || fechaHasta !== ""

  const handleLimpiarFiltros = () => {
    setSearch("")
    setFechaDesde("")
    setFechaHasta("")
    setAvisoFecha(null)
  }

  const todosExpandidos = useMemo<boolean>(() => {
    return (
      departamentos.length > 0 &&
      departamentos.every((d) => abiertos.includes(d.departamento))
    )
  }, [departamentos, abiertos])

  const handleToggleTodos = () => {
    if (todosExpandidos) {
      setAbiertos([])
    } else {
      setAbiertos(departamentos.map((d) => d.departamento))
    }
  }

  const toggleDepartamento = (nombreDepto: string) => {
    setAbiertos((prev) =>
      prev.includes(nombreDepto)
        ? prev.filter((item) => item !== nombreDepto)
        : [...prev, nombreDepto]
    )
  }

  const estudiantesAplanados = useMemo<BecarioDepartamentoItem[]>(() => {
    return departamentos.flatMap((d) => d.estudiantes)
  }, [departamentos])

  const etiquetaPeriodoActual = useMemo<string>(() => {
    return periodoActual
      ? `${periodoActual.codigo} — ${periodoActual.nombre}`
      : "Periodo Vigente"
  }, [periodoActual])

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const abrirAuditoria = useCallback(
    (cedula: string) => {
      const cedulaLimpia = String(cedula || "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=reportes-departamentos`
      )
    },
    [router]
  )

  const mapearFilaXLSX = useCallback((est: BecarioDepartamentoItem): CeldaXLSX[] => {
    return [
      est.departamento.toUpperCase(),
      `V-${est.cedula}`,
      `${est.nombre} ${est.apellido}`.trim().toUpperCase(),
      est.carrera.toUpperCase(),
      formatearTrimestreDepto(est.semestre, true).toUpperCase(),
      est.tipoBeca.toUpperCase(),
      Number(est.promedioTrimestral),
      Number(est.indiceGlobal),
      est.email,
      est.telefono,
      est.periodoCodigo
    ]
  }, [])

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Becarios por Departamento"
          subtitulo={`Becarios aprobados vigentes — ${etiquetaPeriodoActual}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* MINI DASHBOARD KPI (UF-Scale) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 group hover:border-[#d4a843] transition-all">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1e3a5f] transition-colors shrink-0">
            <Building2 className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Departamentos Activos
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.totalDepartamentosActivos}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 group hover:border-[#d4a843] transition-all">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1e3a5f] transition-colors shrink-0">
            <Users className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Becarios Aprobados Asignados
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.totalBecariosAsignados}{" "}
              <span className="text-xs md:text-[10px] font-bold text-slate-400 uppercase">
                / {stats.totalBecarios}
              </span>
            </p>
          </div>
        </div>

        <div
          className={`p-4 md:p-3.5 rounded-xl border shadow-sm flex items-center gap-3.5 transition-all ${
            stats.totalSinDepartamento > 0
              ? "bg-amber-50/60 border-amber-200 hover:border-amber-400"
              : "bg-white border-slate-200 hover:border-[#d4a843]"
          }`}
        >
          <div
            className={`h-11 w-11 md:h-9 md:w-9 rounded-xl flex items-center justify-center shrink-0 ${
              stats.totalSinDepartamento > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-[#f8fafc] border border-slate-100 text-[#d4a843]"
            }`}
          >
            <AlertTriangle className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Sin Departamento
            </p>
            <p
              className={`text-lg md:text-base font-mono font-black leading-tight mt-0.5 ${
                stats.totalSinDepartamento > 0 ? "text-amber-700" : "text-[#1e3a5f]"
              }`}
            >
              {stats.totalSinDepartamento}
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA, FECHAS Y CONTROLES ALINEADOS (UF-Scale — Periodo Vigente Fijo) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-departamento-estudiante"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar Departamento, Nombre o Cédula</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-departamento-estudiante"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Departamento, nombre, apellido o cédula..."
                className="w-full h-12 md:h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] placeholder:text-slate-400 placeholder:font-medium outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#1e3a5f] cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="departamentos-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="departamentos-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="departamentos-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="departamentos-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex items-center gap-2">
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="h-12 md:h-9 px-3 rounded-lg bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                title="Restablecer filtros"
              >
                <RotateCcw className="h-4 w-4 md:h-3.5 md:w-3.5" />
              </button>
            )}

            <button
              type="button"
              disabled={departamentos.length === 0}
              onClick={handleToggleTodos}
              className="flex-1 h-12 md:h-9 px-3 rounded-lg bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 text-[#1e3a5f] text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            >
              <ChevronsUpDown className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0" />
              <span>{todosExpandidos ? "Colapsar" : "Expandir"}</span>
            </button>

            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(search, fechaDesde, fechaHasta)}
              className="h-12 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                  actualizando ? "animate-spin" : ""
                }`}
              />
              <span>Refrescar</span>
            </button>
          </div>
        </div>

       

        {avisoFecha && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{avisoFecha}</span>
          </div>
        )}
      </div>

      {/* LISTADO COLAPSABLE POR DEPARTAMENTO */}
      <div className="space-y-2.5 print:hidden">
        <div className="flex items-center gap-2 px-1">
          <Building2 className="h-3.5 w-3.5 text-[#d4a843]" />
          <h3 className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Dependencias Institucionales Detectadas ({departamentos.length}) — Solo Aprobados Periodo Actual
          </h3>
        </div>

        {departamentos.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <p className="text-sm md:text-xs font-black text-slate-400 uppercase tracking-widest">
              No se encontraron becarios aprobados en el periodo actual para los filtros seleccionados.
            </p>
          </div>
        ) : (
          departamentos.map((depto) => {
            const estaAbierto = abiertos.includes(depto.departamento)

            return (
              <div
                key={depto.departamento}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  depto.sinAsignar ? "border-amber-200" : "border-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleDepartamento(depto.departamento)}
                  aria-expanded={estaAbierto}
                  className="w-full p-4 md:px-4 md:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div
                      className={`h-10 w-10 md:h-9 md:w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        depto.sinAsignar
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[#1e3a5f] text-[#d4a843]"
                      }`}
                    >
                      {depto.sinAsignar ? (
                        <AlertTriangle className="h-5 w-5 md:h-4 md:w-4" />
                      ) : (
                        <Building2 className="h-5 w-5 md:h-4 md:w-4" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] md:text-[8px] font-black text-[#d4a843] uppercase tracking-wider">
                          {depto.sinAsignar ? "Atención Operativa" : "Dependencia Universitaria"}
                        </span>
                        {depto.sinAsignar && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] md:text-[8px] font-black uppercase">
                            Pendiente de Ubicación
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-tight">
                        {depto.departamento}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {depto.resumenModalidades.slice(0, 3).map((mod) => (
                          <span
                            key={mod.tipoBeca}
                            className="px-2 py-0.5 rounded bg-[#f8fafc] border border-slate-200 text-[10px] md:text-[9px] font-bold text-slate-600 uppercase"
                          >
                            {mod.tipoBeca}: {mod.cantidad}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-slate-100">
                    <div className="flex flex-col items-start sm:items-end leading-none">
                      <span className="text-[9px] md:text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        Prom. Área
                      </span>
                      <span className="text-sm md:text-xs font-mono font-black text-[#1e3a5f] mt-1">
                        {depto.promedioGeneral}
                      </span>
                    </div>

                    <div className="flex flex-col items-end leading-none border-l border-slate-200 pl-4">
                      <span className="text-[9px] md:text-[8px] font-black text-slate-400 uppercase tracking-wider">
                        Becarios
                      </span>
                      <span className="text-base md:text-sm font-mono font-black text-[#1e3a5f] mt-1">
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

                {estaAbierto && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
                    {/* TABLA ESCRITORIO */}
                    <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden bg-[#f8fafc]">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200">
                            <th className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Cédula
                            </th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Estudiante / Contacto
                            </th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Carrera / Trim.
                            </th>
                            <th className="px-3 py-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Tipo de Beca
                            </th>
                            <th className="px-3 py-2 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Promedio
                            </th>
                            <th className="px-3 py-2 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest">
                              Periodo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs">
                          {depto.estudiantes.map((est) => (
                            <tr
                              key={est.solicitudId}
                              onClick={() => abrirAuditoria(est.cedula)}
                              title="Abrir panel de auditoría del estudiante"
                              className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                            >
                              <td className="px-3 py-2 font-mono text-xs font-bold text-slate-500 whitespace-nowrap">
                                V-{est.cedula}
                              </td>
                              <td className="px-3 py-2">
                                <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                                  {est.nombre} {est.apellido}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {est.email} • {est.telefono}
                                </p>
                              </td>
                              <td className="px-3 py-2">
                                <p className="font-bold text-slate-700 uppercase text-xs leading-tight">
                                  {est.carrera}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {formatearTrimestreDepto(est.semestre, false)}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#1e3a5f] uppercase">
                                  <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                                  {est.tipoBeca}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`inline-block min-w-[44px] px-2 py-0.5 rounded-md border text-xs font-mono font-black ${getNotaBadge(
                                    est.promedioTrimestral
                                  )}`}
                                >
                                  {est.promedioTrimestral}
                                </span>
                                <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                                  G: {est.indiceGlobal}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
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
                          onClick={() => abrirAuditoria(est.cedula)}
                          className="p-3.5 rounded-xl bg-[#f8fafc] border border-slate-200 hover:border-[#1e3a5f]/50 space-y-2 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                                {est.nombre} {est.apellido}
                              </p>
                              <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                                V-{est.cedula} • {formatearTrimestreDepto(est.semestre, false)}
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
                          <p className="text-sm font-bold text-slate-700 uppercase">
                            {est.carrera}
                          </p>
                          <p className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                            <span>{est.tipoBeca}</span>
                          </p>
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70 text-xs text-slate-500">
                            <span className="truncate">{est.email}</span>
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[#1e3a5f] font-black text-[10px] shrink-0">
                              {est.periodoCodigo}
                            </span>
                          </div>
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

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<BecarioDepartamentoItem>
        titulo="Becarios por Departamento (Aprobados Vigentes)"
        subtitulo={`${etiquetaPeriodoActual} — Departamentos Activos: ${stats.totalDepartamentosActivos} | Becarios Aprobados: ${stats.totalBecarios}${
          fechaDesde && fechaHasta
            ? ` | Rango: ${fechaDesde} al ${fechaHasta}`
            : fechaDesde
              ? ` | Desde: ${fechaDesde}`
              : fechaHasta
                ? ` | Hasta: ${fechaHasta}`
                : ""
        }${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`}
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
              <span className="text-[8px] text-slate-600 font-bold">{formatearTrimestreDepto(est.semestre, false)}</span>
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
        titulo="Becarios por Departamento (Aprobados Vigentes)"
        subtitulo={`${etiquetaPeriodoActual} — Total Becarios Aprobados: ${stats.totalBecarios}${
          fechaDesde && fechaHasta
            ? ` | Rango: ${fechaDesde} al ${fechaHasta}`
            : fechaDesde
              ? ` | Desde: ${fechaDesde}`
              : fechaHasta
                ? ` | Hasta: ${fechaHasta}`
                : ""
        }${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`}
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
