"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { 
  Search, FileDown, BadgeCheck, Mail, Phone, BookOpen, Calendar, 
  Home, LogOut, Loader2, ChevronLeft, ChevronRight 
} from "lucide-react"

// Importamos la acción optimizada (Asegúrate que el nombre del archivo coincida)
import { obtenerEstudiantesConSolicitud } from "@/lib/Actionsestudiantes" 
import { logout } from "@/lib/ActionsAuth"

export default function EstudiantesAdminPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  
  // Estados de Paginación
  const [page, setPage] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  // Control de peticiones (Semáforo Anti-Parpadeo)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. FUNCIÓN DE CARGA INTELIGENTE
  const cargarDatos = async (termino: string, pagina: number) => {
    // A. Cancelar petición anterior si existe
    if (abortControllerRef.current) {
        abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)

    try {
      // B. Consultar al servidor (MariaDB hace el filtro y el limit)
      const data: any = await obtenerEstudiantesConSolicitud(termino, pagina, 12) // 12 items por página

      // C. Si la petición fue abortada, no actualizamos estado
      if (controller.signal.aborted) return

      if (data && Array.isArray(data.estudiantes)) {
        setEstudiantes(data.estudiantes)
        setTotalPaginas(data.totalPaginas || 1)
        setTotalRegistros(data.totalRegistros || 0)
      } else {
        setEstudiantes([])
        setTotalPaginas(1)
        setTotalRegistros(0)
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Error en la conexión:", error)
        setEstudiantes([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  // 2. EFECTO: DEBOUNCE PARA EL BUSCADOR (Espera 400ms antes de buscar)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Al buscar, siempre reseteamos a página 1
      setPage(1) 
      cargarDatos(busqueda, 1)
    }, 400)

    return () => clearTimeout(timer)
  }, [busqueda])

  // 3. EFECTO: CAMBIO DE PÁGINA (Carga inmediata)
  useEffect(() => {
    // Solo cargamos si NO es la página 1 (porque esa ya la carga el efecto del buscador)
    // O si queremos forzar la recarga
    if (page > 1) {
        cargarDatos(busqueda, page)
    }
  }, [page])


  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] h-16 flex items-center px-6 md:px-8 border-b border-transparent">
        <div className="w-full bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center gap-4">
          
          <div className="flex flex-col justify-center">
            <h1 className="text-lg font-black text-[#1a2744] uppercase tracking-widest leading-none">
              Base de Estudiantes
            </h1>
          </div>

          <div className="flex items-center gap-4 border-l border-slate-100 pl-4">
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
      <div className="p-6 md:p-8 space-y-6 pb-10">
        
        {/* BARRA DE BÚSQUEDA Y PAGINACIÓN SUPERIOR */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          <div className="relative w-full lg:max-w-md group">
            {loading ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4a843] animate-spin" />
            ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#d4a843] transition-colors" />
            )}
            <input 
              type="text" 
              placeholder="Buscar por cédula, nombre o correo..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-sm text-[#1e3a5f] outline-none focus:border-[#d4a843] focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
            />
          </div>
          
          {/* Info y Paginador */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
             <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                <BadgeCheck className="h-5 w-5 text-[#1e3a5f]" />
                <span className="text-[10px] md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider">
                {totalRegistros} Resultados
                </span>
            </div>

            {/* Controles Paginación */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="p-2 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronLeft className="h-4 w-4 text-slate-600" />
                </button>
                <span className="px-2 text-xs font-black text-slate-600 min-w-[3rem] text-center">
                    {page} / {totalPaginas}
                </span>
                <button 
                    onClick={() => setPage(p => Math.min(totalPaginas, p + 1))}
                    disabled={page === totalPaginas || loading}
                    className="p-2 hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
            </div>
          </div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 min-h-[400px]">
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
                {loading && estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#d4a843] border-t-transparent"></div>
                      <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando base de datos...</p>
                    </td>
                  </tr>
                ) : estudiantes.length > 0 ? (
                  estudiantes.map((e) => (
                    <tr key={e.id} className="hover:bg-blue-50/30 transition-all group animate-in fade-in duration-300">
                      
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
        
        {/* PAGINACIÓN INFERIOR (Opcional, ya está arriba también) */}
        {totalPaginas > 1 && (
            <div className="flex justify-center pt-4">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Mostrando página {page} de {totalPaginas}
                 </p>
            </div>
        )}

      </div>
    </div>
  )
}