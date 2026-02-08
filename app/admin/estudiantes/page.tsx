"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Search, FileDown, BadgeCheck, Mail, Phone, BookOpen, Calendar, Home, LogOut 
} from "lucide-react"

// Importaciones de lógica
import { obtenerEstudiantesConSolicitud } from "@/lib/Actionsestudiantes" 
import { logout } from "@/lib/ActionsLogout"

export default function EstudiantesAdminPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  // 1. CARGA DE DATOS
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await obtenerEstudiantesConSolicitud()
        if (data && Array.isArray(data)) {
          setEstudiantes(data)
        } else {
          setEstudiantes([])
        }
      } catch (error) {
        console.error("Error en la conexión:", error)
        setEstudiantes([])
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  // 2. LÓGICA DE BÚSQUEDA
  const filtrados = estudiantes.filter((e) => {
    const term = busqueda.toLowerCase().trim()
    if (!term) return true 

    const nombre = (e.nombre || "").toLowerCase()
    const apellido = (e.apellido || "").toLowerCase()
    const cedula = (e.cedula || "").toString().toLowerCase()
    const email = (e.email_institucional || e.email || "").toLowerCase()

    return nombre.includes(term) || 
           apellido.includes(term) || 
           cedula.includes(term) ||
           email.includes(term)
  })

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* --- NUEVO HEADER (Estilo Unificado) --- */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] h-16 flex items-center px-6 md:px-8 border-b border-transparent">
        <div className="w-full bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center gap-4">
          
          {/* TÍTULO */}
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-black text-[#1a2744] uppercase tracking-widest leading-none">
              Base de Estudiantes
            </h1>
          </div>

          {/* ACCIONES (Exportar, Inicio, Salir) */}
          <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
            
            {/* Botón Exportar PDF (Estilo Pill Dorado) */}
            <button 
              onClick={() => window.print()} 
              className="hidden sm:flex items-center gap-2 bg-[#d4a843] hover:bg-[#b88f32] text-[#1a2744] px-4 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 group"
            >
              <FileDown className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exportar</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <Link href="/" title="Ir al Inicio">
              <Home className="h-5 w-5 text-slate-400 hover:text-[#1a2744] transition-colors cursor-pointer" />
            </Link>

            <button 
              onClick={() => logout()} 
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-all border border-rose-100 group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Salir</span>
            </button>
          </div>

        </div>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="p-6 md:p-8 space-y-6 overflow-y-auto pb-10">
        
        {/* BARRA DE BÚSQUEDA FLOTANTE */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#d4a843] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar por cédula, nombre o correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-sm text-[#1e3a5f] outline-none focus:border-[#d4a843] focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
            />
          </div>
          
          {/* Contador de Resultados */}
          <div className="flex items-center gap-3 px-5 py-2 bg-blue-50/50 rounded-xl border border-blue-100 w-full lg:w-auto justify-center">
            <BadgeCheck className="h-5 w-5 text-[#1e3a5f]" />
            <span className="text-[10px] md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider">
              {filtrados.length} Registros Activos
            </span>
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[#1a2744] text-[9px] font-black uppercase tracking-[0.15em]">
                  <th className="px-6 md:px-10 py-5">Datos Personales</th>
                  <th className="px-6 md:px-10 py-5">Información de Contacto</th>
                  <th className="px-6 md:px-10 py-5">Perfil Académico</th>
                  <th className="px-6 md:px-10 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Calendar className="h-3.5 w-3.5 text-[#d4a843]" /> Fecha Ingreso
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#d4a843] border-t-transparent"></div>
                      <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando base de datos...</p>
                    </td>
                  </tr>
                ) : filtrados.length > 0 ? (
                  filtrados.map((e) => (
                    <tr key={e.id} className="hover:bg-blue-50/30 transition-all group">
                      
                      {/* DATOS PERSONALES */}
                      <td className="px-6 md:px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 md:h-11 md:w-11 bg-[#1e3a5f] rounded-xl flex items-center justify-center text-[#d4a843] font-black text-xs md:text-sm shadow-sm group-hover:scale-110 transition-transform">
                            {e.nombre?.[0] || 'U'}{e.apellido?.[0] || 'M'}
                          </div>
                          <div>
                            <p className="font-black text-[#1e3a5f] text-xs md:text-sm uppercase tracking-tight leading-none">
                              {e.apellido || "N/A"}, {e.nombre || "N/A"}
                            </p>
                            <span className="inline-block mt-1.5 bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                              V-{e.cedula || "S/N"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CONTACTO */}
                      <td className="px-6 md:px-10 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-slate-600 font-bold group-hover:text-[#1a2744] transition-colors">
                            <Mail className="h-3.5 w-3.5 text-[#d4a843] shrink-0" /> 
                            {e.email_institucional || e.email || "No registrado"}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] md:text-[11px] text-slate-600 font-bold">
                            <Phone className="h-3.5 w-3.5 text-[#d4a843] shrink-0" /> 
                            {e.telefono || "No registrado"}
                          </div>
                        </div>
                      </td>

                      {/* ACADÉMICO */}
                      <td className="px-6 md:px-10 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg hidden sm:block border border-blue-100">
                            <BookOpen className="h-4 w-4 text-[#1e3a5f]" />
                          </div>
                          <div>
                            <p className="text-[10px] md:text-[11px] font-black text-[#1e3a5f] uppercase leading-none truncate max-w-[150px]" title={e.carrera}>
                              {e.carrera || "No asignada"}
                            </p>
                            <p className="text-[9px] text-[#d4a843] font-bold uppercase mt-1 tracking-widest">
                              {e.semestre || "0"}° SEMESTRE
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* FECHA */}
                      <td className="px-6 md:px-10 py-5 text-right font-mono text-[10px] font-bold text-slate-400">
                        {e.created_at ? new Date(e.created_at).toLocaleDateString('es-VE') : "---"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <p className="text-slate-400 font-bold italic text-sm">
                        {busqueda ? `No hay resultados para "${busqueda}"` : "Base de datos vacía."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <p className="text-center text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] py-4">
          Sistema de Control Interno &bull; Decanato de Estudiantes UNIMAR
        </p>
      </div>
    </div>
  )
}