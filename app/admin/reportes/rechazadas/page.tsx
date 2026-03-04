"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { Table as TableIcon, Loader2, UserX, GraduationCap, XCircle } from "lucide-react"
import { reporteRechazadasPorFecha } from "@/lib/ActionsReportes"

export default function ReporteRechazadasPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ inicio: "", fin: "" })
  const [buscado, setBuscado] = useState(false)

  const generar = async () => {
    if (!range.inicio || !range.fin) return alert("Selecciona ambas fechas");
    setLoading(true)
    const res = await reporteRechazadasPorFecha(range.inicio, range.fin)
    if (res.success) setData(res.data)
    setLoading(false)
    setBuscado(true)
  }

  return (
    <div className="space-y-4">
      <PageHeader titulo="Reporte: Becas Rechazadas" subtitulo="Registro de solicitudes no admitidas" />

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-end gap-3">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Desde</label>
            <input type="date" className="w-full p-1.5 rounded-lg border border-slate-200 text-[11px] font-bold outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50/50" onChange={e => setRange({...range, inicio: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Hasta</label>
            <input type="date" className="w-full p-1.5 rounded-lg border border-slate-200 text-[11px] font-bold outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50/50" onChange={e => setRange({...range, fin: e.target.value})} />
          </div>
        </div>
        <button onClick={generar} disabled={loading} className="bg-rose-600 text-white px-5 h-9 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5"/> : <XCircle className="w-3.5 h-3.5"/>} Generar Reporte
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Estudiante</th>
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Carrera</th>
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Motivo / Observación</th>
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase text-right">Fecha Rechazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[10px]">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest"><Loader2 className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" /> Generando...</td></tr>
            ) : data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-rose-50/20 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600"><UserX className="w-3.5 h-3.5" /></div>
                      <div>
                        <p className="font-black text-[#1a2744] uppercase leading-none">{row.nombre} {row.apellido}</p>
                        <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">{row.cedula}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-bold uppercase text-[9px]"><GraduationCap className="w-3 h-3 inline mr-1 opacity-50" /> {row.carrera}</td>
                  <td className="px-4 py-3"><p className="text-slate-500 italic max-w-xs truncate" title={row.observacion_admin}>"{row.observacion_admin || 'Sin motivo especificado'}"</p></td>
                  <td className="px-4 py-3 text-right font-bold text-slate-600 uppercase">{new Date(row.fecha_aprobacion).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">{buscado ? "No hay rechazos en este rango" : "Selecciona un rango"}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}