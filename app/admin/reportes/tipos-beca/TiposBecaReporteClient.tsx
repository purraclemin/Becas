"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Tags,
  PieChart,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Layers,
  Search,
  X,
  Award
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import {
  obtenerReporteTiposBeca,
  type ReporteTipoBecaItem,
  type StatsTiposBecaReporte,
  type RespuestaReporteTiposBeca
} from "./actions"

interface TiposBecaReporteClientProps {
  initialData: RespuestaReporteTiposBeca
}

export function TiposBecaReporteClient({
  initialData
}: TiposBecaReporteClientProps) {
  const [data, setData] = useState<ReporteTipoBecaItem[]>(initialData.data)
  const [stats, setStats] = useState<StatsTiposBecaReporte>(initialData.stats)
  const [search, setSearch] = useState<string>("")
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(async (termino: string) => {
    const reqId = ++requestIdRef.current
    setActualizando(true)

    try {
      const res = await obtenerReporteTiposBeca(termino || undefined)
      if (reqId !== requestIdRef.current) return
      if (res.success) {
        setData(res.data)
        setStats(res.stats)
      }
    } catch (error) {
      console.error("Error al actualizar tipos de beca:", error)
    } finally {
      if (reqId === requestIdRef.current) {
        setActualizando(false)
      }
    }
  }, [])

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false
      return
    }

    const delay = search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(search)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, cargarDatos])

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((row: ReporteTipoBecaItem): CeldaXLSX[] => {
    return [
      row.tipo_beca.toUpperCase(),
      row.total,
      row.aprobadas,
      row.rechazadas,
      row.en_proceso,
      `${row.porcentaje}%`,
    ]
  }, [])

  const subtituloReporte = `Modalidades: ${stats.totalModalidades} | Total Solicitudes: ${stats.totalSolicitudes}${
    search.trim() ? ` | Filtro: "${search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Tipos de Beca"
          subtitulo="Análisis operativo y estadístico homologado por categoría oficial"
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* RESUMEN KPI (UF-Scale) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div className="bg-white p-4 md:p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5 md:h-4 md:w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
              Modalidades con Registro
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
              Total Solicitudes
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
              Total Aprobadas
            </p>
            <p className="text-lg md:text-base font-mono font-black text-emerald-700 leading-tight mt-0.5">
              {stats.totalAprobadas}
            </p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA ALINEADA (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-9 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-tipos-beca"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar por Modalidad, Nombre o Cédula</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-tipos-beca"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: Excelencia, Aprendizaje, Discapacidad o cédula..."
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

          <div className="md:col-span-3 flex items-center">
            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(search)}
              className="w-full h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                  actualizando ? "animate-spin" : ""
                }`}
              />
              <span>Sincronizar Datos</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE DATOS (TABLA PC / TARJETAS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        <div className="hidden md:flex px-4 py-2.5 border-b bg-[#f8fafc] justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Desglose por Categoría de Programa ({data.length})
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No hay datos de programas para la búsqueda actual.
            </p>
          </div>
        ) : (
          <>
            {/* TABLA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="px-3.5 py-2.5">Categoría de Beca</th>
                    <th className="px-3.5 py-2.5 text-center">Total</th>
                    <th className="px-3.5 py-2.5 text-center">Aprobadas</th>
                    <th className="px-3.5 py-2.5 text-center">Rechazadas</th>
                    <th className="px-3.5 py-2.5 text-center">En Proceso</th>
                    <th className="px-3.5 py-2.5 text-right">Distribución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => (
                    <tr
                      key={row.tipo_beca}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                            <Tags className="h-4 w-4" />
                          </div>
                          <p className="font-black text-[#1e3a5f] uppercase leading-snug">
                            {row.tipo_beca}
                          </p>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <span className="font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          {row.total}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1 text-emerald-700 font-mono font-black">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{row.aprobadas}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1 text-rose-600 font-mono font-black">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>{row.rechazadas}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1 text-amber-600 font-mono font-black">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{row.en_proceso}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="inline-flex items-center gap-1 font-mono font-black text-[#1e3a5f]">
                            <PieChart className="h-3 w-3 text-[#d4a843]" />
                            <span>{row.porcentaje}%</span>
                          </div>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1e3a5f] transition-all duration-700"
                              style={{ width: `${row.porcentaje}%` }}
                            />
                          </div>
                        </div>
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
                  key={`mob-${row.tipo_beca}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                      {row.tipo_beca}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[#1e3a5f] text-xs font-mono font-black shrink-0">
                      {row.porcentaje}%
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200">
                      <span className="block text-[8px] font-black text-slate-400 uppercase">
                        Total
                      </span>
                      <span className="text-sm font-mono font-black text-[#1e3a5f]">
                        {row.total}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <span className="block text-[8px] font-black text-emerald-700 uppercase">
                        Aprob.
                      </span>
                      <span className="text-sm font-mono font-black text-emerald-700">
                        {row.aprobadas}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50/60 border border-rose-200">
                      <span className="block text-[8px] font-black text-rose-700 uppercase">
                        Rech.
                      </span>
                      <span className="text-sm font-mono font-black text-rose-700">
                        {row.rechazadas}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-200">
                      <span className="block text-[8px] font-black text-amber-700 uppercase">
                        Proc.
                      </span>
                      <span className="text-sm font-mono font-black text-amber-700">
                        {row.en_proceso}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ReporteTipoBecaItem>
        titulo="Tipos de Beca"
        subtitulo={subtituloReporte}
        columnas={[
          "Categoría de Beca",
          "Total",
          "Aprobadas",
          "Rechazadas",
          "En Proceso",
          "Distribución"
        ]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400 uppercase font-bold text-[#1e3a5f]">
              {item.tipo_beca}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              {item.total}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-semibold">
              {item.aprobadas}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-semibold">
              {item.rechazadas}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-semibold">
              {item.en_proceso}
            </td>
            <td className="p-1.5 border border-slate-400 text-right font-bold text-[#1e3a5f]">
              {item.porcentaje}%
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ReporteTipoBecaItem>
        ref={xlsxRef}
        titulo="Tipos de Beca"
        subtitulo={subtituloReporte}
        nombreHoja="Tipos_Beca"
        nombreArchivo="tipos_de_beca_unimar"
        columnas={[
          "Categoría de Beca",
          "Total",
          "Aprobadas",
          "Rechazadas",
          "En Proceso",
          "Distribución"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}