"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { Loader2, UserCheck, GraduationCap, FileSpreadsheet, RefreshCw, Trophy } from "lucide-react"
import { reporteRecurrenciaAlumnos } from "@/lib/ActionsReportes"

export default function ReporteRecurrenciaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = await reporteRecurrenciaAlumnos()
      if (res.success) {
        setData(res.data)
      }
    } catch (error) {
      console.error("Error al cargar reporte de recurrencia:", error)
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
        titulo="Recurrencia Trimestral" 
        subtitulo="Análisis de continuidad y beneficios acumulados por estudiante"
        mostrarExportar={true}
      />

      {/* RESUMEN RÁPIDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Becados</p>
            <p className="text-sm font-black text-[#1a2744]">{data.length}</p>
          </div>
        </div>
      </div>

      {/* TABLA DE RECURRENCIA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Ranking de Continuidad Académica
            </span>
          </div>
          <button 
            onClick={cargarDatos}
            className="text-[8px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Beneficios</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Periodos Beneficiados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
                    Analizando recurrencia...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/10 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[#1a2744]">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1a2744] uppercase leading-none">{row.nombre} {row.apellido}</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{row.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-[10px] border border-amber-200 shadow-sm">
                        {row.total_beneficios}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600 font-bold uppercase text-[9px]">
                        <GraduationCap className="w-3 h-3 opacity-50" />
                        {row.carrera}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.periodos_beneficiados.split(', ').map((periodo: string, pIdx: number) => (
                          <span key={pIdx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black border border-slate-200">
                            {periodo}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No hay datos de recurrencia disponibles
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