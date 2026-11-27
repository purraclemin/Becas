"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  X,
  Calendar,
  UserX,
  Archive,
  GraduationCap,
  Award,
  RefreshCw,
  AlertCircle,
  RotateCcw,
  Layers,
  Filter
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
  obtenerReporteRechazadas,
  type ReporteRechazadaItem,
  type RespuestaReporteRechazadas,
  type StatsReporteRechazadas,
  type FiltroEstatusCierre
} from "./actions"

interface RechazadasReporteClientProps {
  initialData: RespuestaReporteRechazadas
  initialEstatus: FiltroEstatusCierre
}

const formatearFecha = (fechaIso: string): string => {
  if (!fechaIso) return "---"
  const parsed = new Date(fechaIso)
  if (Number.isNaN(parsed.getTime())) return fechaIso
  return parsed.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatearTrimestreLabel = (semestre: number, corto: boolean = false): string => {
  if (esEgresadoPorSemestre(semestre)) return "Egresado"
  return corto ? `${semestre}° Trim.` : `${semestre}° Trimestre`
}

export function RechazadasReporteClient({
  initialData,
  initialEstatus
}: RechazadasReporteClientProps) {
  const router = useRouter()
  const [data, setData] = useState<ReporteRechazadaItem[]>(initialData.data)
  const [stats, setStats] = useState<StatsReporteRechazadas>(initialData.stats)
  const [estatusFiltro, setEstatusFiltro] = useState<FiltroEstatusCierre>(initialEstatus)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("")
  const [range, setRange] = useState<{ inicio: string; fin: string }>({
    inicio: "",
    fin: ""
  })
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (
      inicio: string,
      fin: string,
      termino: string,
      estatus: FiltroEstatusCierre
    ) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteRechazadas({
          fechaDesde: inicio || undefined,
          fechaHasta: fin || undefined,
          search: termino || undefined,
          estatus
        })

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setData(res.data)
          setStats(res.stats)
        }
      } catch (error) {
        console.error("Error al actualizar becas rechazadas / finalizadas:", error)
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

    if (range.inicio && range.fin && range.inicio > range.fin) {
      setAvisoFecha("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")
      return
    }

    setAvisoFecha(null)
    const delay = search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(range.inicio, range.fin, search, estatusFiltro)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, range.inicio, range.fin, estatusFiltro, cargarDatos])

  const cambiarEstatusFiltro = (nuevo: FiltroEstatusCierre) => {
    setEstatusFiltro(nuevo)
    const url =
      nuevo === "Todas"
        ? "/admin/reportes/rechazadas"
        : `/admin/reportes/rechazadas?estatus=${encodeURIComponent(nuevo)}`
    router.replace(url, { scroll: false })
  }

  const handleLimpiarFiltros = () => {
    setSearch("")
    setRange({ inicio: "", fin: "" })
    setAvisoFecha(null)
    cambiarEstatusFiltro("Todas")
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

  const abrirAuditoria = useCallback(
    (cedula: string) => {
      const cedulaLimpia = String(cedula || "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=reportes-rechazadas`
      )
    },
    [router]
  )

  const mapearFilaXLSX = useCallback((item: ReporteRechazadaItem): CeldaXLSX[] => {
    return [
      item.estatus.toUpperCase(),
      `${item.nombre} ${item.apellido}`.trim().toUpperCase(),
      `V-${item.cedula}`,
      item.tipo_beca.toUpperCase(),
      item.carrera.toUpperCase(),
      formatearTrimestreLabel(item.semestre, true).toUpperCase(),
      Number(item.promedio_notas),
      Number(item.indice_global),
      item.puntaje_baremo !== null ? item.puntaje_baremo : "Sin estudio",
      item.motivo_rechazo,
      item.periodo.toUpperCase(),
      formatearFecha(item.fecha_rechazo),
    ]
  }, [])

  const hayFiltrosActivos =
    search.trim() !== "" ||
    range.inicio !== "" ||
    range.fin !== "" ||
    estatusFiltro !== "Todas"

  const tituloExportacion =
    estatusFiltro === "Finalizada"
      ? "Reporte: Becas Finalizadas"
      : estatusFiltro === "Rechazada"
        ? "Reporte: Becas Rechazadas"
        : "Reporte: Becas Rechazadas / Finalizadas"

  const nombreArchivoXlsx =
    estatusFiltro === "Finalizada"
      ? "becas_finalizadas_unimar"
      : estatusFiltro === "Rechazada"
        ? "becas_rechazadas_unimar"
        : "becas_rechazadas_finalizadas_unimar"

  const subtituloReporte = `${
    range.inicio && range.fin
      ? `Periodo de cierre: ${range.inicio} al ${range.fin}`
      : range.inicio
        ? `Cierres desde: ${range.inicio}`
        : range.fin
          ? `Cierres hasta: ${range.fin}`
          : "Registro consolidado de cierres administrativos y bajas"
  } — Vista: ${estatusFiltro} (${data.length}) | Rechazadas: ${stats.totalRechazadas} | Finalizadas: ${stats.totalFinalizadas}${
    search.trim() ? ` | Filtro: "${search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN ESTANDARIZADO DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Reporte: Rechazadas / Finalizadas"
          subtitulo={`Bajas sancionatorias y cierres de ciclo sin sanción — Mostrando: ${data.length}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* KPIs SEPARADOS E INTERACTIVOS (Total Cierres / Rechazadas / Finalizadas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <button
          type="button"
          onClick={() => cambiarEstatusFiltro("Todas")}
          className={`bg-white p-4 md:p-3.5 rounded-xl border shadow-sm flex items-center gap-3.5 text-left transition-all cursor-pointer ${
            estatusFiltro === "Todas"
              ? "border-[#1e3a5f] ring-1 ring-[#1e3a5f]/20"
              : "border-slate-200 hover:border-[#1e3a5f]/40"
          }`}
        >
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Total Cierres
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.totalRegistros}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarEstatusFiltro("Rechazada")}
          className={`bg-white p-4 md:p-3.5 rounded-xl border shadow-sm flex items-center gap-3.5 text-left transition-all cursor-pointer ${
            estatusFiltro === "Rechazada"
              ? "border-rose-500 ring-1 ring-rose-500/20 bg-rose-50/30"
              : "border-slate-200 hover:border-rose-300"
          }`}
        >
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <UserX className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Rechazadas (Baja)
            </p>
            <p className="text-lg md:text-base font-mono font-black text-rose-700 leading-tight mt-0.5">
              {stats.totalRechazadas}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => cambiarEstatusFiltro("Finalizada")}
          className={`bg-white p-4 md:p-3.5 rounded-xl border shadow-sm flex items-center gap-3.5 text-left transition-all cursor-pointer ${
            estatusFiltro === "Finalizada"
              ? "border-teal-600 ring-1 ring-teal-600/20 bg-teal-50/30"
              : "border-slate-200 hover:border-teal-300"
          }`}
        >
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <Archive className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Finalizadas (Sin Sanción)
            </p>
            <p className="text-lg md:text-base font-mono font-black text-teal-700 leading-tight mt-0.5">
              {stats.totalFinalizadas}
            </p>
          </div>
        </button>
      </div>

      {/* BARRA DE FILTROS ALINEADA (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-rechazadas"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Nombre, Cédula, Carrera o Beca</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-rechazadas"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar estudiante..."
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
              htmlFor="filtro-estatus-cierre"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Filter className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Estatus</span>
            </label>
            <select
              id="filtro-estatus-cierre"
              value={estatusFiltro}
              onChange={(e) => cambiarEstatusFiltro(e.target.value as FiltroEstatusCierre)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="Todas">Todas ({stats.totalRegistros})</option>
              <option value="Rechazada">Rechazadas ({stats.totalRechazadas})</option>
              <option value="Finalizada">Finalizadas ({stats.totalFinalizadas})</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="rechazadas-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="rechazadas-desde"
              type="date"
              value={range.inicio}
              onChange={(e) => setRange((prev) => ({ ...prev, inicio: e.target.value }))}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="rechazadas-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="rechazadas-hasta"
              type="date"
              value={range.fin}
              onChange={(e) => setRange((prev) => ({ ...prev, fin: e.target.value }))}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-2 flex items-center gap-2">
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
              disabled={actualizando}
              onClick={() => void cargarDatos(range.inicio, range.fin, search, estatusFiltro)}
              className="flex-1 h-12 md:h-9 px-3 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
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

      {/* CONTENEDOR DE DATOS (TABLA PC / TABLE-TO-CARDS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        <div className="hidden md:flex px-4 py-2.5 border-b bg-[#f8fafc] justify-between items-center">
          <div className="flex items-center gap-2">
            {estatusFiltro === "Finalizada" ? (
              <Archive className="w-3.5 h-3.5 text-teal-600" />
            ) : (
              <UserX className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Registros en Vista ({estatusFiltro}): {data.length}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase">
            <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
              Rechazadas: {stats.totalRechazadas}
            </span>
            <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800">
              Finalizadas: {stats.totalFinalizadas}
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No se encontraron solicitudes rechazadas o finalizadas con los criterios seleccionados.
            </p>
          </div>
        ) : (
          <>
            {/* TABLA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="px-3.5 py-2.5">Estudiante</th>
                    <th className="px-3.5 py-2.5">Carrera / Programa</th>
                    <th className="px-3.5 py-2.5 text-center">Estatus</th>
                    <th className="px-3.5 py-2.5 text-center">Prom. / Global</th>
                    <th className="px-3.5 py-2.5">Motivo / Observación</th>
                    <th className="px-3.5 py-2.5 text-right">F. Cierre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => {
                    const esFinalizada = row.estatus === "Finalizada"
                    return (
                      <tr
                        key={row.solicitud_id}
                        onClick={() => abrirAuditoria(row.cedula)}
                        title="Abrir panel de auditoría del estudiante"
                        className={`transition-colors cursor-pointer ${
                          esFinalizada ? "hover:bg-teal-50/40" : "hover:bg-rose-50/30"
                        }`}
                      >
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`h-8 w-8 rounded-lg border flex items-center justify-center shrink-0 ${
                                esFinalizada
                                  ? "bg-teal-50 border-teal-200/80 text-teal-700"
                                  : "bg-rose-50 border-rose-200/70 text-rose-600"
                              }`}
                            >
                              {esFinalizada ? (
                                <Archive className="h-4 w-4" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                                {row.nombre} {row.apellido}
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                                V-{row.cedula} • {formatearTrimestreLabel(row.semestre, true)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <p className="font-bold text-slate-700 uppercase text-xs flex items-center gap-1 leading-tight">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{row.carrera}</span>
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[9px] font-black text-[#1e3a5f] uppercase">
                              <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                              {row.tipo_beca}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[8px] font-black uppercase ${
                                esFinalizada
                                  ? "bg-teal-50 border-teal-200 text-teal-800"
                                  : "bg-rose-50 border-rose-200 text-rose-700"
                              }`}
                            >
                              {row.periodo_codigo}
                            </span>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase ${
                              esFinalizada
                                ? "bg-teal-100 text-teal-800 border-teal-300"
                                : "bg-rose-100 text-rose-700 border-rose-200"
                            }`}
                          >
                            {esFinalizada ? (
                              <Archive className="h-3 w-3" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                            {row.estatus}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 text-center">
                          <span
                            className={`text-xs font-mono font-black tabular-nums block ${
                              esFinalizada ? "text-teal-700" : "text-rose-700"
                            }`}
                          >
                            {row.promedio_notas}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                            G: {row.indice_global}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <p
                            className="text-[11px] text-slate-600 italic max-w-xs line-clamp-2"
                            title={row.motivo_rechazo}
                          >
                            &ldquo;{row.motivo_rechazo}&rdquo;
                          </p>
                        </td>

                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-600 whitespace-nowrap">
                          {formatearFecha(row.fecha_rechazo)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* TARJETAS MÓVIL (Table-to-Cards) */}
            <div className="md:hidden space-y-3">
              {data.map((row) => {
                const esFinalizada = row.estatus === "Finalizada"
                return (
                  <div
                    key={`mob-${row.solicitud_id}`}
                    onClick={() => abrirAuditoria(row.cedula)}
                    className={`bg-white rounded-xl border p-4 shadow-sm space-y-2.5 cursor-pointer transition-colors ${
                      esFinalizada
                        ? "border-teal-200 hover:border-teal-400"
                        : "border-slate-200 hover:border-rose-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                          {row.nombre} {row.apellido}
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                          V-{row.cedula} • {formatearTrimestreLabel(row.semestre, false)}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase shrink-0 ${
                          esFinalizada
                            ? "bg-teal-100 border-teal-300 text-teal-800"
                            : "bg-rose-100 border-rose-200 text-rose-700"
                        }`}
                      >
                        {row.estatus}
                      </span>
                    </div>

                    <p className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                      <span>{row.tipo_beca}</span>
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                      <span className="uppercase">{row.carrera}</span>
                      <span
                        className={`font-mono font-black ${
                          esFinalizada ? "text-teal-700" : "text-rose-700"
                        }`}
                      >
                        Prom: {row.promedio_notas}
                      </span>
                    </div>

                    <p
                      className={`text-xs text-slate-600 italic p-2.5 rounded-lg border ${
                        esFinalizada
                          ? "bg-teal-50/50 border-teal-200/70"
                          : "bg-rose-50/40 border-rose-100"
                      }`}
                    >
                      &ldquo;{row.motivo_rechazo}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                      <span>{row.periodo_codigo}</span>
                      <span>Cierre: {formatearFecha(row.fecha_rechazo)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ReporteRechazadaItem>
        titulo={tituloExportacion}
        subtitulo={subtituloReporte}
        columnas={[
          "Estudiante / Cédula",
          "Carrera / Programa",
          "Estatus",
          "Prom. / Global",
          "Motivo / Observación",
          "F. Cierre"
        ]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">
                V-{item.cedula} • {formatearTrimestreLabel(item.semestre, true)}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{item.carrera}</span>
              <span className="text-[8px] text-slate-600 font-bold">
                {item.tipo_beca} ({item.periodo_codigo})
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center uppercase font-bold text-[8px]">
              {item.estatus}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{item.promedio_notas}</span>
              <span className="text-[8px] text-slate-600">G: {item.indice_global}</span>
            </td>
            <td className="p-1.5 border border-slate-400 italic text-slate-700">
              {item.motivo_rechazo}
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px] font-bold uppercase">
              {formatearFecha(item.fecha_rechazo)}
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ReporteRechazadaItem>
        ref={xlsxRef}
        titulo={tituloExportacion}
        subtitulo={subtituloReporte}
        nombreHoja="Rechazadas_Finalizadas"
        nombreArchivo={nombreArchivoXlsx}
        columnas={[
          "Estatus",
          "Estudiante",
          "Cédula",
          "Programa",
          "Carrera",
          "Trimestre",
          "Prom. Trimestral",
          "Índice Global",
          "Puntaje Baremo",
          "Motivo / Observación",
          "Periodo",
          "F. Cierre"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}
