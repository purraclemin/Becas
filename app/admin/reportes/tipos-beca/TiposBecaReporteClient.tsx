"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Tags,
  PieChart,
  CheckCircle2,
  XCircle,
  Clock,
  Archive,
  RefreshCw,
  Layers,
  Search,
  X,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ExternalLink,
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
import { normalizarTipoBecaOficial } from "@/lib/RecordAcademicoUtils"
import {
  obtenerReporteTiposBeca,
  type EstudianteTipoBecaReporte,
  type PeriodoTipoBecaOption,
  type ReporteTipoBecaItem,
  type StatsTiposBecaReporte,
  type RespuestaReporteTiposBeca
} from "./actions"

interface TiposBecaReporteClientProps {
  initialData: RespuestaReporteTiposBeca
  initialTipoBeca?: string
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

const resolverTipoCanonico = (raw: string): string => {
  const limpio = raw.trim()
  if (!limpio) return ""
  return (normalizarTipoBecaOficial(limpio) || limpio).toLowerCase()
}

export function TiposBecaReporteClient({
  initialData,
  initialTipoBeca = ""
}: TiposBecaReporteClientProps) {
  const router = useRouter()
  const listaInicial = Array.isArray(initialData?.data) ? initialData.data : []
  const periodosIniciales = Array.isArray(initialData?.periodos) ? initialData.periodos : []

  const [data, setData] = useState<ReporteTipoBecaItem[]>(listaInicial)
  const [stats, setStats] = useState<StatsTiposBecaReporte>(
    initialData?.stats ?? {
      totalModalidades: 0,
      totalSolicitudes: 0,
      totalAprobadas: 0,
      totalRechazadas: 0,
      totalFinalizadas: 0,
    }
  )
  const [periodos, setPeriodos] = useState<PeriodoTipoBecaOption[]>(periodosIniciales)
  const [periodoSeleccionadoId, setPeriodoSeleccionadoId] = useState<number>(
    Number(initialData?.periodoSeleccionadoId || periodosIniciales[0]?.id || 0)
  )
  const [esPeriodoActual, setEsPeriodoActual] = useState<boolean>(
    Boolean(initialData?.esPeriodoActual ?? true)
  )
  const [tipoDestacado, setTipoDestacado] = useState<string>(initialTipoBeca)
  const [search, setSearch] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  // Auto-expande la modalidad seleccionada si llega ?tipoBeca= desde el Dashboard
  const [abiertos, setAbiertos] = useState<string[]>(() => {
    if (!initialTipoBeca) return []
    const claveObj = resolverTipoCanonico(initialTipoBeca)
    const coincidencia = listaInicial.find(
      (item) => resolverTipoCanonico(item.tipo_beca) === claveObj
    )
    return coincidencia ? [coincidencia.tipo_beca] : []
  })

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  // Inmune al doble montaje de React Strict Mode: evita que el acordeón auto-abierto se cierre solo
  const ultimoFiltroConsultadoRef = useRef<string>(
    `${Number(initialData?.periodoSeleccionadoId || periodosIniciales[0]?.id || 0)}::::::`
  )
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (termino: string, periodoIdVal: number, desde: string, hasta: string) => {
      const reqId = ++requestIdRef.current
      const terminoLimpio = termino.trim()
      ultimoFiltroConsultadoRef.current = `${periodoIdVal}::${terminoLimpio}::${desde}::${hasta}`
      setActualizando(true)

      try {
        const res = await obtenerReporteTiposBeca({
          search: terminoLimpio || undefined,
          periodoId: periodoIdVal > 0 ? periodoIdVal : undefined,
          fechaDesde: desde || undefined,
          fechaHasta: hasta || undefined,
        })
        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setData(res.data)
          setStats(res.stats)
          setPeriodos(res.periodos)
          setEsPeriodoActual(res.esPeriodoActual)

          if (terminoLimpio !== "" || desde !== "" || hasta !== "") {
            setAbiertos(
              res.data
                .filter((m) => m.estudiantes.length > 0)
                .map((m) => m.tipo_beca)
            )
          } else if (tipoDestacado) {
            const claveObj = resolverTipoCanonico(tipoDestacado)
            const coincidencia = res.data.find(
              (m) => resolverTipoCanonico(m.tipo_beca) === claveObj
            )
            setAbiertos(coincidencia ? [coincidencia.tipo_beca] : [])
          } else {
            setAbiertos([])
          }
        }
      } catch (error) {
        console.error("Error al actualizar tipos de beca:", error)
      } finally {
        if (reqId === requestIdRef.current) {
          setActualizando(false)
        }
      }
    },
    [tipoDestacado]
  )

  useEffect(() => {
    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setAvisoFecha("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")
      return
    }

    setAvisoFecha(null)
    const terminoLimpio = search.trim()
    const claveActual = `${periodoSeleccionadoId}::${terminoLimpio}::${fechaDesde}::${fechaHasta}`
    if (claveActual === ultimoFiltroConsultadoRef.current) return

    const delay = terminoLimpio !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(search, periodoSeleccionadoId, fechaDesde, fechaHasta)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, periodoSeleccionadoId, fechaDesde, fechaHasta, cargarDatos])

  // Si llega ?tipoBeca= desde Dashboard, coloca esa modalidad primero para foco inmediato
  const modalidadesOrdenadas = useMemo<ReporteTipoBecaItem[]>(() => {
    if (!tipoDestacado) return data
    const claveObj = resolverTipoCanonico(tipoDestacado)
    const idx = data.findIndex(
      (item) => resolverTipoCanonico(item.tipo_beca) === claveObj
    )
    if (idx <= 0) return data
    const copia = [...data]
    const [seleccionada] = copia.splice(idx, 1)
    return [seleccionada, ...copia]
  }, [data, tipoDestacado])

  // Listado completo aplanado para exportación PDF y Excel (.xlsx)
  const estudiantesAplanados = useMemo<EstudianteTipoBecaReporte[]>(() => {
    return modalidadesOrdenadas.flatMap((m) => m.estudiantes)
  }, [modalidadesOrdenadas])

  const todosExpandidos = useMemo<boolean>(() => {
    return (
      modalidadesOrdenadas.length > 0 &&
      modalidadesOrdenadas.every((m) => abiertos.includes(m.tipo_beca))
    )
  }, [modalidadesOrdenadas, abiertos])

  const handleToggleTodos = () => {
    if (todosExpandidos) {
      setAbiertos([])
    } else {
      setAbiertos(modalidadesOrdenadas.map((m) => m.tipo_beca))
    }
  }

  const toggleModalidad = (nombreModalidad: string) => {
    setAbiertos((prev) =>
      prev.includes(nombreModalidad)
        ? prev.filter((item) => item !== nombreModalidad)
        : [...prev, nombreModalidad]
    )
  }

  const limpiarTipoDestacado = () => {
    setTipoDestacado("")
    setAbiertos([])
    router.replace("/admin/reportes/tipos-beca", { scroll: false })
  }

  const abrirAuditoriaEstudiante = useCallback(
    (cedula: string) => {
      const cedulaLimpia = String(cedula || "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=reportes-tipos-beca`
      )
    },
    [router]
  )

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((est: EstudianteTipoBecaReporte): CeldaXLSX[] => {
    return [
      est.tipo_beca.toUpperCase(),
      `V-${est.cedula}`,
      `${est.nombre} ${est.apellido}`.trim().toUpperCase(),
      est.carrera.toUpperCase(),
      formatearTrimestre(est.semestre, true).toUpperCase(),
      Number(est.promedio_notas),
      Number(est.indice_global),
      est.puntaje_baremo !== null ? est.puntaje_baremo : "Sin estudio",
      est.estatus.toUpperCase(),
      est.departamento_asignado.toUpperCase(),
      est.periodo_codigo.toUpperCase(),
    ]
  }, [])

  const etiquetaPeriodoSeleccionado = useMemo<string>(() => {
    const encontrado = periodos.find((p) => p.id === periodoSeleccionadoId)
    if (!encontrado) return "Periodo Vigente"
    return `${encontrado.codigo} — ${encontrado.nombre}${encontrado.esActual ? " (Actual)" : " (Histórico)"}`
  }, [periodos, periodoSeleccionadoId])

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

  const subtituloReporte = `${etiquetaPeriodoSeleccionado} | ${
    esPeriodoActual
      ? "Solo Becarios Aprobados"
      : "Histórico (Aprobados primero, luego Rechazados/Cierres)"
  } | Modalidades: ${stats.totalModalidades} | Total Estudiantes: ${stats.totalSolicitudes}${etiquetaRango}${
    search.trim() ? ` | Filtro: "${search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Tipos de Beca — Kardex"
          subtitulo={`Desglose desplegable por modalidad — ${etiquetaPeriodoSeleccionado}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* RESUMEN KPI (UF-Scale) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Modalidades
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.totalModalidades}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-amber-50 border border-amber-100 text-[#d4a843] flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              {esPeriodoActual ? "Becarios en Vista" : "Total Periodo"}
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
              Aprobadas
            </p>
            <p className="text-lg md:text-base font-mono font-black text-emerald-700 leading-tight mt-0.5">
              {stats.totalAprobadas}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div
            className={`h-11 w-11 md:h-9 md:w-9 rounded-xl border flex items-center justify-center shrink-0 ${
              esPeriodoActual
                ? "bg-teal-50 border-teal-200 text-teal-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {esPeriodoActual ? (
              <Archive className="h-5 w-5 md:h-4 md:w-4" />
            ) : (
              <XCircle className="h-5 w-5 md:h-4 md:w-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              {esPeriodoActual ? "Finalizadas" : "Rechazadas / Baja"}
            </p>
            <p
              className={`text-lg md:text-base font-mono font-black leading-tight mt-0.5 ${
                esPeriodoActual ? "text-teal-700" : "text-rose-700"
              }`}
            >
              {esPeriodoActual ? stats.totalFinalizadas : stats.totalRechazadas}
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA, PERIODO, FECHAS Y CONTROLES (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-tipos-beca"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar Modalidad, Nombre o Cédula</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-tipos-beca"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, apellido, cédula o modalidad..."
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
              htmlFor="selector-periodo-tipos-beca"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Periodo</span>
            </label>
            <select
              id="selector-periodo-tipos-beca"
              value={String(periodoSeleccionadoId)}
              onChange={(e) => setPeriodoSeleccionadoId(Number(e.target.value))}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all cursor-pointer"
            >
              {periodos.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.codigo} {p.esActual ? "(Actual)" : "(Hist.)"}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="tipos-beca-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="tipos-beca-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="tipos-beca-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="tipos-beca-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2">
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
              disabled={modalidadesOrdenadas.length === 0}
              onClick={handleToggleTodos}
              className="flex-1 h-12 md:h-9 px-2.5 rounded-lg bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 text-[#1e3a5f] text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            >
              <ChevronsUpDown className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0" />
              <span>{todosExpandidos ? "Colapsar" : "Expandir"}</span>
            </button>

            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(search, periodoSeleccionadoId, fechaDesde, fechaHasta)}
              className="h-12 md:h-9 px-3 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                  actualizando ? "animate-spin" : ""
                }`}
              />
              <span className="hidden xl:inline">Refrescar</span>
            </button>
          </div>
        </div>

        {avisoFecha && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{avisoFecha}</span>
          </div>
        )}

        {/* Nota de criterio activo */}
       
      </div>

      {/* ACORDEÓN ESTILO KARDEX POR TIPO DE BECA */}
      <div className="space-y-2.5 print:hidden">
        <div className="flex items-center gap-2 px-1">
          <Tags className="h-3.5 w-3.5 text-[#d4a843]" />
          <h3 className="text-[10px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">
            Kardex por Tipo de Beca ({modalidadesOrdenadas.length}) — Haz clic en una modalidad para ver sus estudiantes
          </h3>
        </div>

        {modalidadesOrdenadas.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No hay beneficiarios registrados para los filtros y periodo seleccionados.
            </p>
          </div>
        ) : (
          modalidadesOrdenadas.map((row) => {
            const estaAbierto = abiertos.includes(row.tipo_beca)
            const esDestacada =
              tipoDestacado !== "" &&
              resolverTipoCanonico(row.tipo_beca) === resolverTipoCanonico(tipoDestacado)

            return (
              <div
                key={row.tipo_beca}
                className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                  esDestacada
                    ? "border-[#d4a843] ring-1 ring-[#d4a843]/30"
                    : "border-slate-200"
                }`}
              >
                {/* CABECERA DE MODALIDAD CON MÉTRICAS */}
                <button
                  type="button"
                  onClick={() => toggleModalidad(row.tipo_beca)}
                  aria-expanded={estaAbierto}
                  className="w-full p-4 md:px-4 md:py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 md:h-9 md:w-9 rounded-lg bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0">
                      <Award className="h-5 w-5 md:h-4 md:w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-tight">
                          {row.tipo_beca}
                        </h4>
                        {esDestacada && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-[#d4a843]/50 text-[#1e3a5f] text-[8px] font-black uppercase">
                            Seleccionada
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] md:text-[10px] font-bold text-slate-400 mt-0.5">
                        Prom. Modalidad:{" "}
                        <span className="font-mono text-[#1e3a5f] font-black">
                          {row.promedio_general}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* MÉTRICAS COMPLETAS */}
                  <div className="flex flex-wrap lg:flex-nowrap items-center justify-between lg:justify-end gap-2 sm:gap-3 shrink-0 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-slate-100">
                    <div
                      className={`grid gap-1.5 sm:gap-2 text-center ${
                        esPeriodoActual ? "grid-cols-2" : "grid-cols-5"
                      }`}
                    >
                      <div className="px-2 py-1 rounded-lg bg-[#f8fafc] border border-slate-200 min-w-[54px]">
                        <span className="block text-[8px] font-black text-slate-400 uppercase">
                          Total
                        </span>
                        <span className="text-xs font-mono font-black text-[#1e3a5f]">
                          {row.total}
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

                      {!esPeriodoActual && (
                        <>
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
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pl-2 lg:border-l border-slate-200">
                      <div className="flex flex-col items-end gap-1 min-w-[68px]">
                        <div className="inline-flex items-center gap-1 font-mono font-black text-xs text-[#1e3a5f]">
                          <PieChart className="h-3 w-3 text-[#d4a843]" />
                          <span>{row.porcentaje}%</span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1e3a5f] transition-all duration-700"
                            style={{ width: `${row.porcentaje}%` }}
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
                          Sin estudiantes registrados en esta modalidad.
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
                                <th className="px-3 py-2">Carrera / Depto.</th>
                                <th className="px-3 py-2 text-center">Trimestre</th>
                                <th className="px-3 py-2 text-center">Prom. / Global</th>
                                <th className="px-3 py-2 text-center">Baremo</th>
                                <th className="px-3 py-2 text-center">Estatus</th>
                                <th className="px-3 py-2 text-right">Auditoría</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                              {row.estudiantes.map((est) => (
                                <tr
                                  key={est.solicitud_id}
                                  onClick={() => abrirAuditoriaEstudiante(est.cedula)}
                                  title="Abrir panel de auditoría del estudiante"
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
                                    <p className="font-bold text-slate-700 uppercase text-xs leading-tight">
                                      {est.carrera}
                                    </p>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {est.departamento_asignado}
                                    </span>
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
                                    {est.puntaje_baremo !== null ? (
                                      <span className="px-2 py-0.5 rounded bg-[#1e3a5f]/10 text-[#1e3a5f] font-mono font-black text-[10px]">
                                        {est.puntaje_baremo} pts
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-400">
                                        N/A
                                      </span>
                                    )}
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

                              <p className="text-sm font-bold text-slate-700 uppercase">
                                {est.carrera}
                              </p>

                              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-xs">
                                <span className="font-mono font-bold text-slate-600">
                                  Prom: <strong className="text-[#1e3a5f]">{est.promedio_notas}</strong>{" "}
                                  • Baremo:{" "}
                                  <strong className="text-[#1e3a5f]">
                                    {est.puntaje_baremo !== null ? `${est.puntaje_baremo} pts` : "N/A"}
                                  </strong>
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

      {/* PLANTILLA DE IMPRESIÓN PDF — DESGLOSE COMPLETO KARDEX */}
      <PrintReportLayout<EstudianteTipoBecaReporte>
        titulo="Tipos de Beca — Detalle Kardex"
        subtitulo={subtituloReporte}
        columnas={[
          "Tipo de Beca",
          "Estudiante / Cédula",
          "Carrera / Trim.",
          "Prom. / Global",
          "Baremo",
          "Estatus / Depto."
        ]}
        datos={estudiantesAplanados}
        renderFila={(est, idx) => (
          <tr key={`${est.solicitud_id}-${idx}`} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400 uppercase font-bold text-[#1e3a5f]">
              {est.tipo_beca}
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {est.nombre} {est.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{est.cedula}</span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{est.carrera}</span>
              <span className="text-[8px] text-slate-600 font-bold">
                {formatearTrimestre(est.semestre, true)}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{est.promedio_notas}</span>
              <span className="text-[8px] text-slate-600">G: {est.indice_global}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
              {est.puntaje_baremo !== null ? `${est.puntaje_baremo} pts` : "---"}
            </td>
            <td className="p-1.5 border border-slate-400 text-right">
              <span className="uppercase font-bold block text-[#1e3a5f] text-[8px]">
                {est.estatus}
              </span>
              <span className="text-[8px] text-slate-500">{est.departamento_asignado}</span>
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) — DESGLOSE COMPLETO */}
      <ExportReportXLSX<EstudianteTipoBecaReporte>
        ref={xlsxRef}
        titulo="Tipos de Beca — Detalle Kardex"
        subtitulo={subtituloReporte}
        nombreHoja="Tipos_Beca_Kardex"
        nombreArchivo="tipos_de_beca_kardex_unimar"
        columnas={[
          "Tipo de Beca",
          "Cédula",
          "Estudiante",
          "Carrera",
          "Trimestre",
          "Prom. Trimestral",
          "Índice Global",
          "Puntaje Baremo",
          "Estatus",
          "Departamento",
          "Periodo"
        ]}
        datos={estudiantesAplanados}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}
