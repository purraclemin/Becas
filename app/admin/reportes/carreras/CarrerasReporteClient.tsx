"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  GraduationCap,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  RefreshCw,
  Search,
  X,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Award,
  ExternalLink,
  Calendar,
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
import {
  esEgresadoPorSemestre,
  getBadgeColor
} from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import {
  obtenerReporteCarreras,
  type EstudianteCarreraReporte,
  type ReporteCarreraItem,
  type StatsCarrerasReporte,
  type RespuestaReporteCarreras
} from "./actions"

interface CarrerasReporteClientProps {
  initialData: RespuestaReporteCarreras
  initialCarrera: string
}

const formatearTrimestre = (semestre: number, corto: boolean = false): string => {
  if (esEgresadoPorSemestre(semestre)) return "Egresado"
  return corto ? `${semestre}° Trim.` : `${semestre}° Trimestre`
}

const getNotaBadge = (nota: string): string => {
  const val = parseFloat(nota || "0")
  if (val >= 18) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (val >= 16) return "bg-blue-50 text-blue-700 border-blue-200"
  if (val >= 10) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-rose-50 text-rose-700 border-rose-200"
}

export function CarrerasReporteClient({
  initialData,
  initialCarrera
}: CarrerasReporteClientProps) {
  const router = useRouter()
  const listaInicial = Array.isArray(initialData?.data) ? initialData.data : []

  const [data, setData] = useState<ReporteCarreraItem[]>(listaInicial)
  const [stats, setStats] = useState<StatsCarrerasReporte>(
    initialData?.stats ?? {
      totalCarreras: 0,
      totalSolicitudes: 0,
      totalAprobadas: 0,
      totalFinalizadas: 0,
      efectividadGlobal: 0,
    }
  )
  const [carreraDestacada, setCarreraDestacada] = useState<string>(initialCarrera)
  const [search, setSearch] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  // Auto-expande la carrera seleccionada si llega ?carrera= desde el Dashboard
  const [abiertos, setAbiertos] = useState<string[]>(() => {
    if (!initialCarrera) return []
    const objetivo = initialCarrera.trim().toLowerCase()
    const coincidencia = listaInicial.find(
      (item) => item.carrera.trim().toLowerCase() === objetivo
    )
    return coincidencia ? [coincidencia.carrera] : []
  })

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  // Compara contra el último filtro realmente consultado (inmune al doble montaje de React Strict Mode)
  const ultimoFiltroConsultadoRef = useRef<string>("::::")
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (termino: string, desde: string, hasta: string) => {
      const reqId = ++requestIdRef.current
      const terminoLimpio = termino.trim()
      ultimoFiltroConsultadoRef.current = `${terminoLimpio}::${desde}::${hasta}`
      setActualizando(true)

      try {
        const res = await obtenerReporteCarreras({
          search: terminoLimpio || undefined,
          fechaDesde: desde || undefined,
          fechaHasta: hasta || undefined,
        })
        if (reqId !== requestIdRef.current) return
        if (res.success) {
          setData(res.data)
          setStats(res.stats)

          if (terminoLimpio !== "" || desde !== "" || hasta !== "") {
            setAbiertos(
              res.data
                .filter((c) => c.estudiantes.length > 0)
                .map((c) => c.carrera)
            )
          } else if (carreraDestacada) {
            const objetivo = carreraDestacada.trim().toLowerCase()
            const coincidencia = res.data.find(
              (c) => c.carrera.trim().toLowerCase() === objetivo
            )
            setAbiertos(coincidencia ? [coincidencia.carrera] : [])
          }
        }
      } catch (error) {
        console.error("Error al actualizar distribución por carreras:", error)
      } finally {
        if (reqId === requestIdRef.current) {
          setActualizando(false)
        }
      }
    },
    [carreraDestacada]
  )

  useEffect(() => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setAvisoFecha("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")
      return
    }

    setAvisoFecha(null)
    const terminoLimpio = search.trim()
    const claveActual = `${terminoLimpio}::${fechaDesde}::${fechaHasta}`
    if (claveActual === ultimoFiltroConsultadoRef.current) return

    const delay = terminoLimpio !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(search, fechaDesde, fechaHasta)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, fechaDesde, fechaHasta, cargarDatos])

  // Si llega ?carrera= desde el Dashboard, coloca esa carrera primero para visibilidad inmediata
  const carrerasOrdenadas = useMemo<ReporteCarreraItem[]>(() => {
    if (!carreraDestacada) return data
    const objetivo = carreraDestacada.trim().toLowerCase()
    const idx = data.findIndex((c) => c.carrera.trim().toLowerCase() === objetivo)
    if (idx <= 0) return data
    const copia = [...data]
    const [seleccionada] = copia.splice(idx, 1)
    return [seleccionada, ...copia]
  }, [data, carreraDestacada])

  // Listado completo de estudiantes de todos los acordeones para impresión PDF y exportación XLSX
  const estudiantesAplanados = useMemo<EstudianteCarreraReporte[]>(() => {
    return carrerasOrdenadas.flatMap((c) => c.estudiantes)
  }, [carrerasOrdenadas])

  const todosExpandidos = useMemo<boolean>(() => {
    return (
      carrerasOrdenadas.length > 0 &&
      carrerasOrdenadas.every((c) => abiertos.includes(c.carrera))
    )
  }, [carrerasOrdenadas, abiertos])

  const handleToggleTodos = () => {
    if (todosExpandidos) {
      setAbiertos([])
    } else {
      setAbiertos(carrerasOrdenadas.map((c) => c.carrera))
    }
  }

  const toggleCarrera = (nombreCarrera: string) => {
    setAbiertos((prev) =>
      prev.includes(nombreCarrera)
        ? prev.filter((item) => item !== nombreCarrera)
        : [...prev, nombreCarrera]
    )
  }

  const limpiarCarreraDestacada = () => {
    setCarreraDestacada("")
    setAbiertos([])
    router.replace("/admin/reportes/carreras", { scroll: false })
  }

  const abrirAuditoriaEstudiante = (cedula: string) => {
    const cedulaLimpia = cedula.trim()
    if (!cedulaLimpia) return
    router.push(
      `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=carreras`
    )
  }

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((est: EstudianteCarreraReporte): CeldaXLSX[] => {
    return [
      est.carrera.toUpperCase(),
      `V-${est.cedula}`,
      `${est.nombre} ${est.apellido}`.trim().toUpperCase(),
      formatearTrimestre(est.semestre, true).toUpperCase(),
      est.tipo_beca.toUpperCase(),
      Number(est.promedio_notas),
      Number(est.indice_global),
      est.estatus.toUpperCase(),
      est.periodo_codigo.toUpperCase(),
    ]
  }, [])

  const hayFiltrosActivos =
    search.trim() !== "" || fechaDesde !== "" || fechaHasta !== ""

  const handleLimpiarFiltros = () => {
    setSearch("")
    setFechaDesde("")
    setFechaHasta("")
    setAvisoFecha(null)
  }

  const etiquetaRango =
    fechaDesde && fechaHasta
      ? ` | Rango: ${fechaDesde} al ${fechaHasta}`
      : fechaDesde
        ? ` | Desde: ${fechaDesde}`
        : fechaHasta
          ? ` | Hasta: ${fechaHasta}`
          : ""

  const subtituloReporte = `Carreras: ${stats.totalCarreras} | Total Estudiantes: ${stats.totalSolicitudes} | Aprobadas Vigentes: ${stats.totalAprobadas} | Finalizadas: ${stats.totalFinalizadas} | Efectividad Global: ${stats.efectividadGlobal}%${etiquetaRango}${
    search.trim() ? ` | Filtro: "${search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Distribución por Carreras"
          subtitulo="Análisis demográfico sin duplicados y Kardex desplegable por facultad"
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* RESUMEN KPI (UF-Scale) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
            <GraduationCap className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Total Solicitudes (Únicas)
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.totalSolicitudes}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Becas Aprobadas (Vigentes)
            </p>
            <p className="text-lg md:text-base font-mono font-black text-emerald-700 leading-tight mt-0.5">
              {stats.totalAprobadas}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-amber-50 border border-amber-100 text-[#d4a843] flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Efectividad Global
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.efectividadGlobal}%
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA, FECHAS Y CONTROLES ALINEADOS (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-carreras"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar Carrera, Estudiante o Cédula</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-carreras"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, apellido, cédula o carrera..."
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
              htmlFor="carreras-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="carreras-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="carreras-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="carreras-hasta"
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
              disabled={carrerasOrdenadas.length === 0}
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
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {avisoFecha && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{avisoFecha}</span>
          </div>
        )}

        {carreraDestacada && (
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50/70 border border-[#d4a843]/40 text-xs">
            <span className="font-bold text-[#1e3a5f]">
              Vista enfocada desde Dashboard:{" "}
              <strong className="uppercase">{carreraDestacada}</strong>
            </span>
            <button
              type="button"
              onClick={limpiarCarreraDestacada}
              className="text-[10px] font-black uppercase text-[#1e3a5f] hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Quitar foco</span>
            </button>
          </div>
        )}
      </div>

      {/* ACORDEÓN ESTILO KARDEX POR CARRERA */}
      <div className="space-y-2.5 print:hidden">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-[#d4a843]" />
            <h3 className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
              Rendimiento Operativo por Facultad ({carrerasOrdenadas.length}) — Haz clic en una carrera para ver el Kardex
            </h3>
          </div>
        </div>

        {carrerasOrdenadas.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No hay datos registrados para la búsqueda actual.
            </p>
          </div>
        ) : (
          carrerasOrdenadas.map((row) => {
            const estaAbierto = abiertos.includes(row.carrera)
            const esDestacada =
              carreraDestacada !== "" &&
              row.carrera.trim().toLowerCase() === carreraDestacada.trim().toLowerCase()

            return (
              <div
                key={row.carrera}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  esDestacada
                    ? "border-[#d4a843] ring-1 ring-[#d4a843]/30"
                    : "border-slate-200"
                }`}
              >
                {/* CABECERA DE CARRERA CON TODAS LAS MÉTRICAS */}
                <button
                  type="button"
                  onClick={() => toggleCarrera(row.carrera)}
                  aria-expanded={estaAbierto}
                  className="w-full p-4 md:px-4 md:py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 md:h-9 md:w-9 rounded-lg bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0">
                      <GraduationCap className="h-5 w-5 md:h-4 md:w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-tight">
                          {row.carrera}
                        </h4>
                        {esDestacada && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-[#d4a843]/50 text-[#1e3a5f] text-[8px] font-black uppercase">
                            Seleccionada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] md:text-[10px] font-bold text-slate-400 mt-0.5">
                        Prom. Carrera:{" "}
                        <span className="font-mono text-[#1e3a5f] font-black">
                          {row.promedio_general}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* MÉTRICAS COMPLETAS DE LA CARRERA */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-2 sm:gap-3 shrink-0 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-slate-100">
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
                      <div className="px-2 py-1 rounded-lg bg-[#f8fafc] border border-slate-200 min-w-[54px]">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">
                          Total
                        </span>
                        <span className="text-xs font-mono font-black text-[#1e3a5f]">
                          {row.total_solicitudes}
                        </span>
                      </div>

                      <div className="px-2 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200 min-w-[54px]">
                        <span className="block text-[8px] font-black text-emerald-700 uppercase">
                          Aprob.
                        </span>
                        <span className="text-xs font-mono font-black text-emerald-700 inline-flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3 hidden sm:inline" />
                          {row.aprobadas}
                        </span>
                      </div>

                      <div className="px-2 py-1 rounded-lg bg-rose-50/70 border border-rose-200 min-w-[54px]">
                        <span className="block text-[8px] font-black text-rose-700 uppercase">
                          Rech.
                        </span>
                        <span className="text-xs font-mono font-black text-rose-700 inline-flex items-center gap-0.5">
                          <XCircle className="h-3 w-3 hidden sm:inline" />
                          {row.rechazadas}
                        </span>
                      </div>

                      <div className="px-2 py-1 rounded-lg bg-amber-50/70 border border-amber-200 min-w-[54px]">
                        <span className="block text-[8px] font-black text-amber-700 uppercase">
                          Proc.
                        </span>
                        <span className="text-xs font-mono font-black text-amber-700 inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3 hidden sm:inline" />
                          {row.en_proceso}
                        </span>
                      </div>

                      <div className="px-2 py-1 rounded-lg bg-teal-50/70 border border-teal-200 min-w-[54px]">
                        <span className="block text-[8px] font-black text-teal-800 uppercase">
                          Final.
                        </span>
                        <span className="text-xs font-mono font-black text-teal-800 inline-flex items-center gap-0.5">
                          <Archive className="h-3 w-3 hidden sm:inline" />
                          {row.finalizadas}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-2 lg:border-l border-slate-200">
                      <div className="flex flex-col items-end gap-1 min-w-[68px]">
                        <span className="text-xs font-mono font-black text-[#1e3a5f]">
                          {row.efectividad}%
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1e3a5f] transition-all duration-700"
                            style={{ width: `${row.efectividad}%` }}
                          />
                        </div>
                      </div>

                      {estaAbierto ? (
                        <ChevronUp className="h-4 w-4 text-[#1e3a5f] shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </button>

                {/* PANEL DESPLEGABLE ESTILO KARDEX CON ESTUDIANTES */}
                {estaAbierto && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-[#f8fafc]/60">
                    {row.estudiantes.length === 0 ? (
                      <div className="py-6 text-center text-slate-400">
                        <p className="text-xs font-black uppercase tracking-widest">
                          Sin estudiantes registrados en esta carrera.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* TABLA KARDEX ESCRITORIO */}
                        <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden bg-white mt-2">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="bg-slate-100/90 border-b border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-3 py-2">Cédula</th>
                                <th className="px-3 py-2">Estudiante</th>
                                <th className="px-3 py-2">Programa / Periodo</th>
                                <th className="px-3 py-2 text-center">Trimestre</th>
                                <th className="px-3 py-2 text-center">Prom. / Global</th>
                                <th className="px-3 py-2 text-center">Estatus</th>
                                <th className="px-3 py-2 text-right">Auditoría</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {row.estudiantes.map((est) => (
                                <tr
                                  key={est.solicitud_id}
                                  onClick={() => abrirAuditoriaEstudiante(est.cedula)}
                                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                >
                                  <td className="px-3 py-2 font-mono font-bold text-slate-500 whitespace-nowrap">
                                    V-{est.cedula}
                                  </td>
                                  <td className="px-3 py-2">
                                    <p className="font-black text-[#1e3a5f] uppercase leading-tight group-hover:text-blue-700 transition-colors">
                                      {est.nombre} {est.apellido}
                                    </p>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#1e3a5f] uppercase">
                                        <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                                        {est.tipo_beca}
                                      </span>
                                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[8px] font-black text-slate-600 uppercase">
                                        {est.periodo_codigo}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-center whitespace-nowrap">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                        esEgresadoPorSemestre(est.semestre)
                                          ? "bg-teal-50 text-teal-800 border border-teal-200"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {formatearTrimestre(est.semestre, true)}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span
                                      className={`inline-block min-w-[44px] px-2 py-0.5 rounded border text-xs font-mono font-black ${getNotaBadge(
                                        est.promedio_notas
                                      )}`}
                                    >
                                      {est.promedio_notas}
                                    </span>
                                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5">
                                      G: {est.indice_global}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-center whitespace-nowrap">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase ${getBadgeColor(
                                        est.estatus
                                      )}`}
                                    >
                                      {est.estatus}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#1e3a5f] group-hover:text-[#d4a843] transition-colors">
                                      <span>Expediente</span>
                                      <ExternalLink className="h-3 w-3" />
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* TARJETAS KARDEX MÓVIL (UF-Scale) */}
                        <div className="md:hidden space-y-2.5 mt-2">
                          {row.estudiantes.map((est) => (
                            <button
                              key={`mob-est-${est.solicitud_id}`}
                              type="button"
                              onClick={() => abrirAuditoriaEstudiante(est.cedula)}
                              className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-200 hover:border-[#1e3a5f]/40 shadow-2xs space-y-2 cursor-pointer transition-all"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                                    {est.nombre} {est.apellido}
                                  </p>
                                  <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                                    V-{est.cedula} • {formatearTrimestre(est.semestre, false)}
                                  </p>
                                </div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase shrink-0 ${getBadgeColor(
                                    est.estatus
                                  )}`}
                                >
                                  {est.estatus}
                                </span>
                              </div>

                              <p className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                                <span>{est.tipo_beca}</span>
                              </p>

                              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                                <span className="font-mono font-bold text-slate-600">
                                  Prom: <strong className="text-[#1e3a5f]">{est.promedio_notas}</strong>{" "}
                                  (G: {est.indice_global})
                                </span>
                                <span className="inline-flex items-center gap-1 font-black uppercase text-[#1e3a5f] text-[10px]">
                                  <span>Auditar</span>
                                  <ExternalLink className="h-3 w-3 text-[#d4a843]" />
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF — TODOS LOS ACORDEONES DESPLEGADOS CON ESTUDIANTES */}
      <PrintReportLayout<EstudianteCarreraReporte>
        titulo="Distribución por Carreras — Detalle Kardex"
        subtitulo={subtituloReporte}
        columnas={[
          "Carrera / Facultad",
          "Estudiante / Cédula",
          "Trimestre",
          "Tipo de Beca",
          "Prom. / Global",
          "Estatus / Periodo"
        ]}
        datos={estudiantesAplanados}
        renderFila={(est, idx) => (
          <tr key={`${est.solicitud_id}-${idx}`} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400 uppercase font-bold text-[#1e3a5f]">
              {est.carrera}
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {est.nombre} {est.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{est.cedula}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-semibold uppercase text-[8px]">
              {formatearTrimestre(est.semestre, true)}
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">
              {est.tipo_beca}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{est.promedio_notas}</span>
              <span className="text-[8px] text-slate-600">G: {est.indice_global}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-right">
              <span className="uppercase font-bold block text-[#1e3a5f] text-[8px]">
                {est.estatus}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">{est.periodo_codigo}</span>
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) — DETALLE COMPLETO DE ESTUDIANTES POR CARRERA */}
      <ExportReportXLSX<EstudianteCarreraReporte>
        ref={xlsxRef}
        titulo="Distribución por Carreras — Detalle de Estudiantes"
        subtitulo={subtituloReporte}
        nombreHoja="Distribucion_Carreras"
        nombreArchivo="distribucion_carreras_estudiantes_unimar"
        columnas={[
          "Carrera / Facultad",
          "Cédula",
          "Estudiante",
          "Trimestre",
          "Tipo de Beca",
          "Prom. Trimestral",
          "Índice Global",
          "Estatus",
          "Periodo"
        ]}
        datos={estudiantesAplanados}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}
