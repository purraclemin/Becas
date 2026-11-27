"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  UserCheck,
  UserX,
  Archive,
  GraduationCap,
  FileSpreadsheet,
  RefreshCw,
  Trophy,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Award,
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
  obtenerReporteRecurrencia,
  type ReporteRecurrenciaItem,
  type StatsRecurrenciaReporte,
  type RespuestaReporteRecurrencia
} from "./actions"

interface RecurrenciaReporteClientProps {
  initialData: RespuestaReporteRecurrencia
}

export function RecurrenciaReporteClient({
  initialData
}: RecurrenciaReporteClientProps) {
  const router = useRouter()
  const [data, setData] = useState<ReporteRecurrenciaItem[]>(initialData.data)
  const [stats, setStats] = useState<StatsRecurrenciaReporte>(initialData.stats)
  const [search, setSearch] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (termino: string, desde: string, hasta: string) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteRecurrencia({
          search: termino || undefined,
          fechaDesde: desde || undefined,
          fechaHasta: hasta || undefined,
        })
        if (reqId !== requestIdRef.current) return
        if (res.success) {
          setData(res.data)
          setStats(res.stats)
        }
      } catch (error) {
        console.error("Error al actualizar recurrencia:", error)
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
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=reportes-recurrencia`
      )
    },
    [router]
  )

  const mapearFilaXLSX = useCallback((row: ReporteRecurrenciaItem): CeldaXLSX[] => {
    return [
      `${row.nombre} ${row.apellido}`.trim().toUpperCase(),
      `V-${row.cedula}`,
      row.carrera.toUpperCase(),
      row.tipo_beca_reciente.toUpperCase(),
      row.total_beneficios,
      row.periodos_beneficiados.length > 0 ? row.periodos_beneficiados.join(", ") : "---",
      row.periodos_rechazados.length > 0 ? row.periodos_rechazados.join(", ") : "---",
      row.fue_rechazado
        ? "RECHAZADO (BAJA)"
        : row.es_finalizado
          ? "FINALIZADA"
          : row.estatus_final.toUpperCase(),
      row.motivo_rechazo || "---",
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

  const subtituloReporte = `Total: ${stats.totalEvaluados} | Activos: ${stats.totalActivos} | Finalizadas: ${stats.totalFinalizados} | Rechazados: ${stats.totalRechazados}${etiquetaRango}${
    search.trim() ? ` | Filtro: "${search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Recurrencia Trimestral"
          subtitulo="Histórico de continuidad, beneficios acumulados y estado final por estudiante"
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* RESUMEN KPI (UF-Scale) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Total Evaluados
            </p>
            <p className="text-lg md:text-base font-mono font-black text-[#1e3a5f] leading-tight mt-0.5">
              {stats.totalEvaluados}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Vigentes / Aprobados
            </p>
            <p className="text-lg md:text-base font-mono font-black text-emerald-700 leading-tight mt-0.5">
              {stats.totalActivos}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <Archive className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Finalizadas (Sin Sanción)
            </p>
            <p className="text-lg md:text-base font-mono font-black text-teal-700 leading-tight mt-0.5">
              {stats.totalFinalizados}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Rechazados / Baja
            </p>
            <p className="text-lg md:text-base font-mono font-black text-rose-700 leading-tight mt-0.5">
              {stats.totalRechazados}
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FECHAS ALINEADA (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-5 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-recurrencia"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar por Nombre, Apellido, Cédula o Carrera</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-recurrencia"
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
              htmlFor="recurrencia-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="recurrencia-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="recurrencia-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="recurrencia-hasta"
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
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}

            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(search, fechaDesde, fechaHasta)}
              className="flex-1 h-12 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                  actualizando ? "animate-spin" : ""
                }`}
              />
              <span>Actualizar</span>
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

      {/* CONTENEDOR DE DATOS (TABLA PC / TARJETAS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        <div className="hidden md:flex px-4 py-2.5 border-b bg-[#f8fafc] justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#d4a843]" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Ranking de Continuidad y Estado Final ({data.length})
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No se encontraron registros de recurrencia para la búsqueda actual.
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
                    <th className="px-3.5 py-2.5 text-center">Beneficios</th>
                    <th className="px-3.5 py-2.5">Carrera / Modalidad</th>
                    <th className="px-3.5 py-2.5">Trayectoria por Periodos</th>
                    <th className="px-3.5 py-2.5 text-right">Estatus Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => (
                    <tr
                      key={row.student_id}
                      onClick={() => abrirAuditoria(row.cedula)}
                      title="Abrir panel de auditoría del estudiante"
                      className={`transition-colors cursor-pointer ${
                        row.fue_rechazado
                          ? "hover:bg-rose-50/30"
                          : row.es_finalizado
                            ? "hover:bg-teal-50/40"
                            : "hover:bg-blue-50/40"
                      }`}
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                              row.fue_rechazado
                                ? "bg-rose-50 text-rose-600"
                                : row.es_finalizado
                                  ? "bg-teal-50 text-teal-700"
                                  : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {row.fue_rechazado ? (
                              <UserX className="h-4 w-4" />
                            ) : row.es_finalizado ? (
                              <Archive className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                              {row.nombre} {row.apellido}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                              V-{row.cedula}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-mono font-black text-xs border border-amber-200 shadow-2xs">
                          {row.total_beneficios}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <p className="flex items-center gap-1 text-slate-700 font-bold uppercase text-xs leading-tight">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{row.carrera}</span>
                        </p>
                        <p className="flex items-center gap-1 text-[#1e3a5f] font-black uppercase text-[9px] mt-1">
                          <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {row.tipo_beca_reciente}
                          </span>
                        </p>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {row.periodos_beneficiados.map((periodo, pIdx) => (
                            <span
                              key={`ap-${pIdx}`}
                              className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-black border border-emerald-200"
                            >
                              ✓ {periodo}
                            </span>
                          ))}
                          {row.periodos_rechazados.map((periodo, rIdx) => (
                            <span
                              key={`re-${rIdx}`}
                              className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[9px] font-black border border-rose-200"
                            >
                              ✕ {periodo} (Rechazado)
                            </span>
                          ))}
                          {row.periodos_beneficiados.length === 0 &&
                            row.periodos_rechazados.length === 0 && (
                              <span className="text-slate-400 text-[10px] font-bold">
                                ---
                              </span>
                            )}
                        </div>
                        {(row.fue_rechazado || row.es_finalizado) && row.motivo_rechazo && (
                          <p
                            className={`text-[10px] italic mt-1 line-clamp-1 max-w-xs ${
                              row.es_finalizado ? "text-teal-700/90" : "text-rose-600/85"
                            }`}
                            title={row.motivo_rechazo}
                          >
                            {row.motivo_rechazo}
                          </p>
                        )}
                      </td>

                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        {row.fue_rechazado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-black uppercase tracking-wider">
                            <XCircle className="h-3 w-3" />
                            Rechazado (Baja)
                          </span>
                        ) : row.es_finalizado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-300 text-[9px] font-black uppercase tracking-wider">
                            <Archive className="h-3 w-3" />
                            Finalizada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" />
                            {row.estatus_final}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TARJETAS MÓVIL (Table-to-Cards) */}
            <div className="md:hidden space-y-3">
              {data.map((row) => (
                <div
                  key={`mob-${row.student_id}`}
                  onClick={() => abrirAuditoria(row.cedula)}
                  className="bg-white rounded-xl border border-slate-200 hover:border-[#1e3a5f]/50 p-4 shadow-sm space-y-2.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                        {row.nombre} {row.apellido}
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                        V-{row.cedula}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-mono font-black shrink-0">
                      {row.total_beneficios} ben.
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-700 uppercase">
                    {row.carrera}
                  </p>
                  <p className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                    <span>{row.tipo_beca_reciente}</span>
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {row.periodos_beneficiados.map((p, idx) => (
                      <span
                        key={`mob-ap-${idx}`}
                        className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black border border-emerald-200"
                      >
                        ✓ {p}
                      </span>
                    ))}
                    {row.periodos_rechazados.map((p, idx) => (
                      <span
                        key={`mob-re-${idx}`}
                        className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-black border border-rose-200"
                      >
                        ✕ {p}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400 font-bold uppercase">
                      Estatus Final
                    </span>
                    {row.fue_rechazado ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black uppercase">
                        <XCircle className="h-3 w-3" />
                        Rechazado (Baja)
                      </span>
                    ) : row.es_finalizado ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 text-[10px] font-black uppercase">
                        <Archive className="h-3 w-3" />
                        Finalizada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                        <CheckCircle2 className="h-3 w-3" />
                        {row.estatus_final}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ReporteRecurrenciaItem>
        titulo="Recurrencia Trimestral"
        subtitulo={subtituloReporte}
        columnas={[
          "Estudiante / Cédula",
          "Beneficios",
          "Carrera / Modalidad",
          "Periodos Aprobados / Rechazados",
          "Estatus Final"
        ]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">
                V-{item.cedula}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
              {item.total_beneficios}
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{item.carrera}</span>
              <span className="text-[8px] text-slate-600 uppercase">
                {item.tipo_beca_reciente}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-[8px] font-semibold text-slate-700">
              {item.periodos_beneficiados.length > 0 && (
                <span className="block">
                  Aprobados: {item.periodos_beneficiados.join(", ")}
                </span>
              )}
              {item.periodos_rechazados.length > 0 && (
                <span className="block text-rose-700">
                  Rechazado en: {item.periodos_rechazados.join(", ")}
                </span>
              )}
              {item.periodos_beneficiados.length === 0 &&
                item.periodos_rechazados.length === 0 &&
                "---"}
            </td>
            <td className="p-1.5 border border-slate-400 text-right uppercase font-bold">
              {item.fue_rechazado
                ? "RECHAZADO (BAJA)"
                : item.es_finalizado
                  ? "FINALIZADA"
                  : item.estatus_final}
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ReporteRecurrenciaItem>
        ref={xlsxRef}
        titulo="Recurrencia Trimestral"
        subtitulo={subtituloReporte}
        nombreHoja="Recurrencia_Trimestral"
        nombreArchivo="recurrencia_trimestral_unimar"
        columnas={[
          "Estudiante",
          "Cédula",
          "Carrera",
          "Modalidad Reciente",
          "Total Beneficios",
          "Periodos Aprobados",
          "Periodos Rechazados",
          "Estatus Final",
          "Motivo de Cierre"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}
