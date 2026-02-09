"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { 
  Clock, BookOpen, Home, LogOut, GraduationCap, Calendar 
} from "lucide-react"

import { obtenerSolicitudesRecientes } from "@/lib/ActionsRecientes"
import { logout } from "@/lib/ActionsAuth"

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
    /* Se añade max-w-full y overflow-x-hidden para blindar el ancho de la página en móviles */
    <div className="w-full h-screen md:h-auto md:min-h-screen bg-[#f8fafc] flex flex-col overflow-hidden md:overflow-visible max-w-full">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] h-16 flex items-center px-4 md:px-8 shrink-0">
        <div className="w-full bg-white px-4 md:px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center overflow-hidden">
          <div className="min-w-0 flex-1">
            <h1 className="text-xs md:text-lg font-black text-[#1a2744] uppercase tracking-widest truncate">
              Registro de Actividad
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-5 border-l border-slate-100 pl-3 md:pl-5 shrink-0">
            <Link href="/admin/dashboard" title="Volver al Dashboard">
                <div className="text-[10px] font-bold text-slate-500 hover:text-[#1a2744] uppercase tracking-wider cursor-pointer whitespace-nowrap">
                  <span className="hidden sm:inline">Volver</span>
                  <span className="sm:hidden">Atrás</span>
                </div>
            </Link>

            <Link href="/" title="Ir al Inicio">
              <Home className="h-5 w-5 text-slate-400 hover:text-[#1a2744] transition-colors cursor-pointer" />
            </Link>

            <button 
              onClick={() => logout()} 
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-all border border-rose-100 group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENIDO --- */}
      {/* Se añade min-h-0 para que el flex-1 funcione correctamente con el scroll interno en móviles */}
      <div className="p-3 md:p-8 flex-1 overflow-hidden flex flex-col min-h-0 w-full max-w-full">
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full overflow-hidden w-full max-w-full">
          <div className="bg-slate-50 px-5 md:px-6 py-4 md:py-5 border-b flex justify-between items-center shrink-0">
            <h3 className="text-[10px] md:text-xs font-black text-[#1a2744] uppercase tracking-widest flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#d4a843]" /> Últimos 50 Movimientos
            </h3>
            <span className="hidden sm:inline text-[9px] font-bold text-slate-400 uppercase">
                Orden Cronológico Descendente
            </span>
          </div>
          
          {/* Contenedor del scroll: Aseguramos que el scroll sea horizontal solo aquí adentro */}
          <div className="overflow-auto flex-1 custom-scrollbar w-full">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm">
                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <th className="px-8 py-4">Fecha / Hora</th>
                  <th className="px-8 py-4">Estudiante</th>
                  <th className="px-8 py-4">Carrera</th>
                  <th className="px-8 py-4">Beca</th>
                  <th className="px-8 py-4 text-center">Índice</th>
                  <th className="px-8 py-4 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-32 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#d4a843] border-t-transparent"></div>
                      <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase">Cargando historial...</p>
                    </td>
                  </tr>
                ) : recientes.length > 0 ? (
                  recientes.map((s) => (
                    <tr 
                      key={s.id} 
                      onClick={() => irASolicitud(s.cedula)}
                      className="hover:bg-blue-50/50 transition-all group cursor-pointer"
                    >
                      <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] font-bold">
                              <Calendar className="h-3 w-3 text-slate-300" />
                              {formatearFecha(s.fecha_registro)}
                          </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-9 w-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-[#d4a843] font-black text-xs shadow-sm group-hover:scale-110 transition-transform">
                            {s.nombre?.[0]}{s.apellido?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-[#1a2744] text-xs uppercase leading-none">{s.nombre} {s.apellido}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-mono tracking-tighter">V-{s.cedula}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-[#1a2744]">
                          <BookOpen className="h-3.5 w-3.5 text-[#d4a843]" />
                          <span className="text-[10px] font-black uppercase truncate max-w-[150px]" title={s.carrera}>
                            {s.carrera || "No asignada"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-slate-600 uppercase">
                        {s.tipo_beca}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${getAvgStyle(s.promedio_notas)}`}>
                           <GraduationCap className="h-3.5 w-3.5" />
                           <span className="font-black text-[10px]">{s.promedio_notas}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${
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
                    <td colSpan={6} className="py-20 text-center text-slate-400 italic text-sm">
                      No hay movimientos recientes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-[8px] text-gray-400 font-bold uppercase tracking-[0.5em] py-3 shrink-0">
          Unimar &bull; Auditoría &bull; 2026
        </p>
      </div>
    </div>
  )
}