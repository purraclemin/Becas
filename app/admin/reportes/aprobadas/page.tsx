"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { FileDown, Table as TableIcon, Loader2, Calendar, UserCheck, GraduationCap, Award } from "lucide-react"
import { reporteAprobadasPorFecha } from "@/lib/ActionsReportes"

export default function ReporteAprobadasPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ inicio: "", fin: "" })
  const [buscado, setBuscado] = useState(false)

  const generar = async () => {
    if (!range.inicio || !range.fin) {
      alert("Por favor selecciona ambas fechas para filtrar.")
      return
    }

    setLoading(true)
    try {
      const res = await reporteAprobadasPorFecha(range.inicio, range.fin)
      if (res.success) {
        setData(res.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al generar reporte:", error)
    } finally {
      setLoading(false)
      setBuscado(true)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader 
        titulo="Reporte: Becas Aprobadas" 
        subtitulo="Listado histórico de beneficios otorgados y validados"
      />

      {/* FILTROS DE GENERACIÓN */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-end gap-3">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="date" 
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50" 
                onChange={e => setRange({...range, inicio: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="date" 
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50" 
                onChange={e => setRange({...range, fin: e.target.value})} 
              />
            </div>
          </div>
        </div>
        <button 
          onClick={generar} 
          disabled={loading}
          className="bg-emerald-600 text-white px-5 h-9 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5"/> : <TableIcon className="w-3.5 h-3.5"/>}
          Generar Vista
        </button>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Aprobaciones Encontradas: {data.length}
            </span>
          </div>
          {data.length > 0 && (
            <button className="text-blue-600 font-black text-[9px] uppercase flex items-center gap-1 hover:underline">
              <FileDown className="w-3 h-3"/> Exportar Excel
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Beneficiario</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Puntaje</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Programa</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera / Periodo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">F. Aprobación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                    Consultando registros...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/10 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1a2744] uppercase leading-none">{row.nombre} {row.apellido}</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{row.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                        {row.puntaje_baremo_} pts
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-black text-slate-600 uppercase text-[9px]">
                        <Award className="w-3 h-3 text-amber-500" />
                        {row.tipo_beca_snapshot}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-600 uppercase flex items-center gap-1">
                          <GraduationCap className="w-2.5 h-2.5" /> {row.carrera}
                        </span>
                        <span className="text-[8px] text-blue-600 font-black mt-0.5">{row.periodo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-500">
                      {new Date(row.fecha_aprobacion).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    {buscado ? "No se encontraron becas aprobadas en este rango" : "Selecciona fechas para generar el listado"}
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