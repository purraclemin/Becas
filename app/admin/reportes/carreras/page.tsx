"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
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

export default function ReporteCarrerasPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = await reporteDistribucionCarreras()
      if (res.success) {
        setData(res.data)
      }
    } catch (error) {
      console.error("Error al cargar reporte de carreras:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  return (
    <div className="space-y-4">
      <PageHeader 
        titulo="Distribución por Carreras" 
        subtitulo="Análisis demográfico y estadístico de becados por facultad"
        mostrarExportar={true}
      />

      {/* GRID DE ESTADÍSTICAS POR CARRERA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-cyan-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Rendimiento Operativo por Facultad
            </span>
          </div>
          <button 
            onClick={cargarDatos}
            className="text-[8px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1"
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
                  const efectividad = row.total_solicitudes > 0 
                    ? Math.round((row.aprobadas / row.total_solicitudes) * 100) 
                    : 0;

                  return (
                    <tr key={idx} className="hover:bg-cyan-50/10 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-black text-[#1a2744] uppercase">{row.carrera}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-black text-slate-600">{row.total_solicitudes}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          {row.aprobadas}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-600 font-black">
                          <XCircle className="w-3 h-3" />
                          {row.rechazadas}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-600 font-black">
                          <Clock className="w-3 h-3" />
                          {row.en_proceso}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-black text-[#1a2744]">{efectividad}%</span>
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
    </div>
  )
}