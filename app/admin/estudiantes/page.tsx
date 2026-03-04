"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, Calendar } from "lucide-react"

// Importamos los componentes modulares
import { PageHeader } from "@/components/admin/PageHeader"
import { FiltrosEstudiantes } from "@/components/admin/estudiantes/FiltrosEstudiantes"
import { FilaEstudiante } from "@/components/admin/estudiantes/FilaEstudiante"

// Importamos las acciones
import { obtenerEstudiantesConSolicitud } from "@/lib/Actionsestudiantes" 

export default function EstudiantesAdminPage() {
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)
  
  // Estados de Paginación
  const [page, setPage] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. FUNCIÓN DE CARGA CENTRALIZADA
  const cargarDatos = useCallback(async (termino: string, pagina: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)

    try {
      const data: any = await obtenerEstudiantesConSolicitud(termino, pagina, 12)

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
  }, [])

  // 2. EFECTO UNIFICADO: Sincroniza búsqueda y paginación
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos(busqueda, page)
    }, busqueda ? 400 : 0)

    return () => clearTimeout(timer)
  }, [busqueda, page, cargarDatos])

  // Resetear página al buscar un nuevo término
  useEffect(() => {
    setPage(1)
  }, [busqueda])

  return (
    <div className="space-y-4">
      
      {/* HEADER UNIFICADO (Reemplaza el código anterior de encabezado) */}
      <PageHeader 
        titulo="Base de Estudiantes" 
        subtitulo="Gestión y Control de Datos Académicos"
        mostrarExportar={true}
      />

      {/* --- CONTENIDO AJUSTADO AL LAYOUT --- */}
      <div className="space-y-4">
        
        {/* COMPONENTE MODULAR DE FILTROS */}
        <FiltrosEstudiantes 
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          loading={loading}
          totalRegistros={totalRegistros}
          page={page}
          totalPaginas={totalPaginas}
          setPage={setPage}
        />

        {/* TABLA DE RESULTADOS - ESCALA REDUCIDA AL 30% */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[#1a2744] text-[8.5px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">Datos Personales</th>
                  <th className="px-6 py-4">Información de Contacto</th>
                  <th className="px-6 py-4">Perfil Académico</th>
                  <th className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Calendar className="h-3 w-3 text-[#d4a843]" /> Fecha Ingreso
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Loader2 className="inline-block h-8 w-8 text-[#d4a843] animate-spin" />
                      <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando base de datos...</p>
                    </td>
                  </tr>
                ) : estudiantes.length > 0 ? (
                  estudiantes.map((e) => (
                    <FilaEstudiante key={e.id} estudiante={e} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <p className="text-slate-400 font-bold italic text-xs">
                        {busqueda ? `Sin resultados para "${busqueda}"` : "La base de datos está vacía."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* INFO DE PÁGINA INFERIOR COMPACTA */}
        {totalPaginas > 1 && (
          <div className="flex justify-center">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-xs">
              Página {page} de {totalPaginas}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}