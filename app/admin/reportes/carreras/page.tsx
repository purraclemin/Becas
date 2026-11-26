"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Loader2,
  GraduationCap,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  X
} from "lucide-react"
import {
  reporteDistribucionCarreras,
  type ReporteDistribucionCarreraRow
} from "@/lib/ActionsReportes"

export default function ReporteCarrerasPage() {
  const [data, setData] = useState<ReporteDistribucionCarreraRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>("")

  const cargarDatos = useCallback(async (termino: string) => {
    setLoading(true)
    try {
      const res = await reporteDistribucionCarreras(termino)
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte de carreras:", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargarDatos(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, cargarDatos])

  const handleExportar = () => {
    window.print()
  }

  const calcularEfectividad = (row: ReporteDistribucionCarreraRow): number => {
    const total = Number(row.total_solicitudes ?? 0)
    const aprobadas = Number(row.aprobadas ?? 0)
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(aprobadas)) {
      return 0
    }
    return Math.round((aprobadas / total) * 100)
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      <div className="print:hidden">
        <PageHeader
          titulo="Distribución por Carreras"
          subtitulo="Análisis demográfico y estadístico de becados por facultad"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* BARRA DE BÚSQUEDA POR NOMBRE, CÉDULA O CARRERA */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre, Cédula o Carrera..."
            className="w-full h-12 md:h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => void cargarDatos(search)}
          className="h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-xs md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Sincronizar
        </button>
      </div>

      {/* GRID DE ESTADÍSTICAS POR CARRERA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Rendimiento Operativo por Facultad ({data.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera / Facultad</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Total Solicitudes</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Aprobadas</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Rechazadas</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">En Proceso</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Efectividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500 mx-auto mb-2" />
                    Calculando distribución...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => {
                  const efectividad = calcularEfectividad(row)
                  const totalSolicitudes = Number(row.total_solicitudes ?? 0)
                  const aprobadas = Number(row.aprobadas ?? 0)
                  const rechazadas = Number(row.rechazadas ?? 0)
                  const enProceso = Number(row.en_proceso ?? 0)

                  return (
                    <tr key={idx} className="hover:bg-cyan-50/10 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-black text-[#1e3a5f] uppercase">{row.carrera || "---"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-black text-slate-600">{totalSolicitudes}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          {aprobadas}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-600 font-black">
                          <XCircle className="w-3 h-3" />
                          {rechazadas}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-600 font-black">
                          <Clock className="w-3 h-3" />
                          {enProceso}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-black text-[#1e3a5f]">{efectividad}%</span>
                          <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 transition-all duration-1000"
                              style={{ width: `${efectividad}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No hay datos registrados para la búsqueda actual
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN */}
      <PrintReportLayout<ReporteDistribucionCarreraRow>
        titulo="Distribución por Carreras"
        subtitulo={`Total Carreras: ${data.length}${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`}
        columnas={["Carrera / Facultad", "Total Solicitudes", "Aprobadas", "Rechazadas", "En Proceso", "Efectividad"]}
        datos={data}
        renderFila={(item, idx) => {
          const efectividad = calcularEfectividad(item)
          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400 uppercase font-bold text-[#1e3a5f]">
                {item.carrera || "---"}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold">
                {Number(item.total_solicitudes ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {Number(item.aprobadas ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {Number(item.rechazadas ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {Number(item.en_proceso ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-right font-bold text-[#1e3a5f]">
                {efectividad}%
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}