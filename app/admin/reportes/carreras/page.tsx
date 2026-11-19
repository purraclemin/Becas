"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Loader2,
  GraduationCap,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react"
import { reporteDistribucionCarreras } from "@/lib/ActionsReportes"

interface DistribucionCarreraRow {
  carrera?: string
  total_solicitudes?: number | string
  aprobadas?: number | string
  rechazadas?: number | string
  en_proceso?: number | string
  [key: string]: unknown
}

interface ReporteCarrerasResponse {
  success?: boolean
  data?: DistribucionCarreraRow[]
}

export default function ReporteCarrerasPage() {
  const [data, setData] = useState<DistribucionCarreraRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = (await reporteDistribucionCarreras()) as ReporteCarrerasResponse
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
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleExportar = () => {
    window.print()
  }

  const calcularEfectividad = (row: DistribucionCarreraRow): number => {
    const total = Number(row.total_solicitudes ?? 0)
    const aprobadas = Number(row.aprobadas ?? 0)
    if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(aprobadas)) {
      return 0
    }
    return Math.round((aprobadas / total) * 100)
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Distribución por Carreras"
          subtitulo="Análisis demográfico y estadístico de becados por facultad"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* GRID DE ESTADÍSTICAS POR CARRERA EN PANTALLA (Se oculta al imprimir) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Rendimiento Operativo por Facultad ({data.length})
            </span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="text-[8px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
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
            <tbody className="divide-y divide-slate-100 text-[10px]">
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
                          <p className="font-black text-[#1e3a5f] uppercase">{String(row.carrera || "---")}</p>
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
                    No hay datos registrados por carrera
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Distribución por Carreras"
        subtitulo={`Análisis demográfico y estadístico de becados por facultad — Total Carreras: ${data.length}`}
        columnas={["Carrera / Facultad", "Total Solicitudes", "Aprobadas", "Rechazadas", "En Proceso", "Efectividad"]}
        datos={data}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const item = row as DistribucionCarreraRow
          const efectividad = calcularEfectividad(item)
          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400 uppercase font-bold text-[#1e3a5f]">
                {String(item.carrera || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold">
                {String(item.total_solicitudes ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {String(item.aprobadas ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {String(item.rechazadas ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {String(item.en_proceso ?? 0)}
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