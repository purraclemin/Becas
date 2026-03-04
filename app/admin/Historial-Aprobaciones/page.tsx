"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { Search, Loader2, Calendar, UserCheck, FileText, BookOpen, AlertCircle } from "lucide-react"
import { obtenerHistorialAprobaciones } from "@/lib/ActionsHistorialAprobacion"

export default function HistorialAprobacionesPage() {
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  
  const [filtros, setFiltros] = useState({ 
    fechaInicio: "", 
    fechaFin: "" 
  })

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = await obtenerHistorialAprobaciones(filtros)
      if (res.success && res.data) {
        setHistorial(res.data)
      } else {
        setHistorial([])
      }
    } catch (error) {
      console.error("Error al cargar historial:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  // Función para mantener la paleta de colores del Dashboard
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rechazada': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'En Revisión': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendiente': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Renovacion': 
      case 'Renovación': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Revisión Especial': 
      case 'Revision Especial': return 'bg-purple-100 text-purple-700 border-purple-200'; // Rosa/Morado según Dashboard
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader 
        titulo="Historial de Decisiones" 
        subtitulo="Auditoría de aprobaciones y rechazos de becas"
        mostrarExportar={true}
      />

      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="date" 
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="date" 
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            />
          </div>
        </div>

        <button 
          onClick={cargarDatos}
          disabled={loading}
          className="bg-[#1a2744] text-white px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-900 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          Filtrar Registro
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Periodo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Cambio de Estatus</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Baremo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Fecha y Hora</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                    Sincronizando auditoría...
                  </td>
                </tr>
              ) : historial.length > 0 ? (
                historial.map((reg) => {
                  let materiasData = null;
                  try {
                    materiasData = typeof reg.materias_snapshot_json === "string" 
                      ? JSON.parse(reg.materias_snapshot_json) 
                      : reg.materias_snapshot_json;
                  } catch (e) {
                    console.error("Error al parsear materias:", e);
                  }
                  
                  return (
                    <React.Fragment key={reg.id}>
                      <tr className={`hover:bg-blue-50/30 transition-colors group ${expandedRow === reg.id ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[#1a2744]">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-black text-[#1a2744] uppercase leading-none">{reg.nombre} {reg.apellido}</p>
                              <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{reg.cedula}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-black text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                            {reg.periodo_nombre}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(reg.estatus_previo)} opacity-70`}>
                              {reg.estatus_previo}
                            </span>
                            <span className="text-slate-300 font-bold">→</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase shadow-sm ${getStatusColor(reg.estatus_nuevo)}`}>
                              {reg.estatus_nuevo}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-[#1a2744]">
                          {reg.puntaje_baremo_}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-600 uppercase">
                            {new Date(reg.fecha_aprobacion).toLocaleDateString()}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase">
                            {new Date(reg.fecha_aprobacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleRow(reg.id)}
                              className={`p-1.5 rounded-md transition-all ${expandedRow === reg.id ? 'bg-[#1a2744] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all">
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedRow === reg.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-slate-50/50 border-l-4 border-[#1a2744]">
                            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                              {materiasData ? (
                                <>
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-3 bg-[#1a2744] rounded-full"></div>
                                    <h4 className="text-[9px] font-black text-[#1a2744] uppercase tracking-widest">
                                      Carga Académica Registrada (Trimestre {materiasData.trimestre})
                                    </h4>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {materiasData.materias?.map((mat: any, i: number) => (
                                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                                        <div className="flex flex-col overflow-hidden mr-2">
                                          <span className="text-[7px] text-slate-400 font-bold uppercase truncate">{mat.codigo}</span>
                                          <span className="text-[9px] font-black text-slate-700 uppercase truncate" title={mat.nombre}>{mat.nombre}</span>
                                        </div>
                                        <div className="bg-slate-100 px-2 py-1 rounded text-[#1a2744] font-black text-[10px] shrink-0 border border-slate-200">
                                          {mat.nota}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-400 py-4">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-[9px] font-black uppercase italic">Sin datos de materias capturados en esta acción.</span>
                                </div>
                              )}

                              {reg.observacion_admin && (
                                <div className="mt-4 p-2 bg-white rounded-lg border-l-2 border-blue-500 shadow-sm">
                                  <p className="text-[8px] font-black text-blue-600 uppercase mb-1 tracking-tighter">Nota Administrativa:</p>
                                  <p className="text-[10px] text-slate-600 font-medium italic">"{reg.observacion_admin}"</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No se encontraron registros de auditoría
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