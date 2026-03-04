"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { Table as TableIcon, Loader2, Calendar, User, ClipboardList, Clock } from "lucide-react"
import { reporteSolicitudesPorFecha } from "@/lib/ActionsReportes"

export default function ReporteSolicitudesFechaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState({ inicio: "", fin: "" })
  const [buscado, setBuscado] = useState(false)

  const generar = async () => {
    if (!range.inicio || !range.fin) return alert("Selecciona ambas fechas");
    setLoading(true)
    try {
      const res = await reporteSolicitudesPorFecha(range.inicio, range.fin)
      // queryFresh devuelve las filas directamente
      if (res) {
        setData(res as any[])
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error)
    } finally {
      setLoading(false)
      setBuscado(true)
    }
  }

  // Función para los colores de estatus (Mismo diseño que Dashboard)
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Aprobada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rechazada': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'En Revisión': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Renovacion': 
      case 'Renovación': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Revisión Especial': 
      case 'Revision Especial': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader 
        titulo="Solicitudes por Fecha" 
        subtitulo="Listado completo basado en la fecha de ingreso al sistema"
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
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50" 
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
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50" 
                onChange={e => setRange({...range, fin: e.target.value})} 
              />
            </div>
          </div>
        </div>
        <button 
          onClick={generar} 
          disabled={loading}
          className="bg-blue-600 text-white px-5 h-9 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5"/> : <TableIcon className="w-3.5 h-3.5"/>}
          Generar Listado
        </button>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Registros en el periodo: {data.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Tipo de Beca</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Fecha Ingreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    Cargando información...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[#1a2744]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1a2744] uppercase leading-none">{row.nombre} {row.apellido}</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{row.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-600 uppercase text-[9px] truncate max-w-[150px]">
                        {row.carrera}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-200">
                        {row.tipo_beca}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase shadow-sm ${getStatusStyles(row.estatus)}`}>
                        {row.estatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-slate-600 font-bold">
                          <Calendar className="w-2.5 h-2.5 opacity-50" />
                          {new Date(row.fecha_registro).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[8px] font-bold mt-0.5">
                          <Clock className="w-2.5 h-2.5 opacity-50" />
                          {new Date(row.fecha_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    {buscado ? "No se encontraron solicitudes en este periodo" : "Define un rango de fechas para consultar"}
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