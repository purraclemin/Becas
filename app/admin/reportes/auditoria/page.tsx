"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { 
  Loader2, 
  UserCog, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  RefreshCw,
  History
} from "lucide-react"
import { reporteAuditoriaAdministradores } from "@/lib/ActionsReportes"

export default function ReporteAuditoriaPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = await reporteAuditoriaAdministradores()
      if (res.success) {
        setData(res.data)
      }
    } catch (error) {
      console.error("Error al cargar reporte de auditoría:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Función para colores de estatus (Consistencia con Dashboard e Historial)
  const getStatusColor = (status: string) => {
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
        titulo="Auditoría de Administradores" 
        subtitulo="Registro cronológico de actividad y gestión de solicitudes"
        mostrarExportar={true}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Bitácora de Seguridad del Sistema
            </span>
          </div>
          <button 
            onClick={cargarDatos}
            className="text-[8px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            Refrescar Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Administrador</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Acción (Estatus)</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante Afectado</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Dirección IP</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-600 mx-auto mb-2" />
                    Sincronizando registros de seguridad...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-800 rounded-lg flex items-center justify-center text-white">
                          <UserCog className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1a2744] uppercase leading-none">Administrador</p>
                          <p className="text-[8px] text-blue-600 font-bold mt-1 lowercase tracking-tighter">{row.admin_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded border text-[8px] font-bold opacity-60 ${getStatusColor(row.estatus_previo)}`}>
                          {row.estatus_previo}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                        <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase shadow-sm ${getStatusColor(row.estatus_nuevo)}`}>
                          {row.estatus_nuevo}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <p className="font-black text-slate-700 uppercase">{row.alumno_nombre} {row.alumno_apellido}</p>
                        <p className="text-[8px] text-slate-400 font-bold">CI: {row.alumno_cedula}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-500 font-mono text-[9px] border border-slate-200">
                        <Globe className="w-2.5 h-2.5" />
                        {row.ip_accion || '0.0.0.0'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-slate-600 uppercase">
                          {new Date(row.fecha_aprobacion).toLocaleDateString()}
                        </p>
                        <p className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase flex items-center gap-1">
                          <History className="w-2 h-2" />
                          {new Date(row.fecha_aprobacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No existen registros de auditoría en la base de datos
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