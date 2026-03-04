"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import { 
  Clock, BookOpen, GraduationCap, Calendar, Loader2 
} from "lucide-react"

import { obtenerSolicitudesRecientes } from "@/lib/ActionsRecientes"
import { PageHeader } from "@/components/admin/PageHeader"

export default function ActividadPage() {
  const router = useRouter()
  const [recientes, setRecientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerSolicitudesRecientes()
        if (Array.isArray(data)) setRecientes(data)
      } catch (error) {
        console.error("Error al cargar actividad:", error)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const getAvgStyle = (nota: string) => {
    const val = parseFloat(nota) || 0;
    if (val >= 16) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (val >= 10) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }

  const irASolicitud = (cedula: string) => {
    if (!cedula || cedula === 'S/N') return;
    router.push(`/admin/solicitudes?search=${cedula}`);
  }

  const formatearFecha = (fecha: string) => {
      if (!fecha) return "---";
      return new Date(fecha).toLocaleDateString('es-VE', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  }

  return (
    <div className="space-y-4">
      
      {/* HEADER UNIFICADO (Reemplaza el código borrado) */}
      <PageHeader 
        titulo="Registro de Actividad" 
        subtitulo="Auditoría de Movimientos en Tiempo Real"
        mostrarExportar={false}
      />

      {/* --- CONTENIDO COMPACTO --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        
        <div className="bg-slate-50 px-5 py-3 border-b flex justify-between items-center">
          <h3 className="text-[9px] font-black text-[#1a2744] uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#d4a843]" /> Últimos Movimientos
          </h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
              Periodo Académico 2026
          </span>
        </div>
        
        {/* TABLA CON ESCALA REDUCIDA AL 30% */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[900px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-slate-50">
              <tr className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-3 border-b border-slate-200">Fecha / Hora</th>
                <th className="px-6 py-3 border-b border-slate-200">Estudiante</th>
                <th className="px-6 py-3 border-b border-slate-200">Carrera</th>
                <th className="px-6 py-3 border-b border-slate-200">Beca</th>
                <th className="px-6 py-3 border-b border-slate-200 text-center">Índice</th>
                <th className="px-6 py-3 border-b border-slate-200 text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <Loader2 className="inline-block h-8 w-8 text-[#d4a843] animate-spin mb-2" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consultando registros...</p>
                  </td>
                </tr>
              ) : recientes.length > 0 ? (
                recientes.map((s) => (
                  <tr 
                    key={s.id} 
                    onClick={() => irASolicitud(s.cedula)}
                    className="hover:bg-blue-50/50 transition-all group cursor-pointer"
                  >
                    <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px] font-bold whitespace-nowrap">
                            <Calendar className="h-3 w-3 text-slate-300" />
                            {formatearFecha(s.fecha_registro)}
                        </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <div className="h-7 w-7 bg-[#1e3a5f] rounded flex items-center justify-center text-[#d4a843] font-black text-[10px] shadow-sm group-hover:scale-105 transition-transform shrink-0">
                          {s.nombre?.[0]}{s.apellido?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a2744] text-[10px] uppercase leading-none">{s.nombre} {s.apellido}</p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-mono tracking-tighter">V-{s.cedula}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2 text-[#1a2744] whitespace-nowrap">
                        <BookOpen className="h-3 w-3 text-[#d4a843]" />
                        <span className="text-[9px] font-black uppercase truncate max-w-[140px]" title={s.carrera}>
                          {s.carrera || "No asignada"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-[9px] font-bold text-slate-600 uppercase whitespace-nowrap">
                      {s.tipo_beca}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-sm ${getAvgStyle(s.promedio_notas)}`}>
                         <GraduationCap className="h-3 w-3" />
                         <span className="font-black text-[9px]">{s.promedio_notas}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs border ${
                        s.estatus === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                        s.estatus === 'En Revisión' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        s.estatus === 'Rechazada' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {s.estatus || 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 italic text-xs">
                    No hay movimientos registrados en la bitácora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-[7px] text-gray-400 font-bold uppercase tracking-[0.3em] py-2">
        Unimar &bull; Sistema de Auditoría Interna &bull; 2026
      </p>
    </div>
  )
}