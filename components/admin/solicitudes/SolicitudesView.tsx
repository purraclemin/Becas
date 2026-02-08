"use client"

import React, { useState, useEffect } from "react"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { SolicitudesFilters } from "./SolicitudesFilters"
import { SolicitudesTable } from "./SolicitudesTable"
import { SolicititudesHeader } from "./SolicitudHeader" // <--- 1. IMPORTAMOS TU HEADER
import { Loader2 } from "lucide-react"

export function SolicitudesView({ initialFilters }: any) {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Inicializamos filtros asegurando un límite por defecto
  const [filtros, setFiltros] = useState({
    ...initialFilters,
    limit: initialFilters?.limit || 7 
  })
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const cargarDatos = async (actualFiltros: any, pagina: number) => {
    setLoading(true)
    try {
      const res: any = await obtenerTodasLasSolicitudes({ 
        ...actualFiltros, 
        page: pagina,
        limit: actualFiltros.limit // Aseguramos enviar el límite al servidor
      })

      if (Array.isArray(res)) {
        setSolicitudes(res)
        // Cálculo de respaldo si el servidor no devuelve totalPaginas
        setTotalPaginas(Math.ceil(res.length / (actualFiltros.limit || 7)) || 1)
      } else if (res && typeof res === 'object') {
        setSolicitudes(res.data || [])
        setTotalPaginas(res.totalPaginas || 1)
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
      setSolicitudes([]) 
    } finally {
      setLoading(false)
    }
  }

  // Maneja los cambios desde la Barra de Filtros (Buscador, Selects, etc.)
  const handleFilterChange = (nuevosFiltros: any) => {
    setFiltros(nuevosFiltros)
    setPaginaActual(1) 
  }

  // 2. NUEVA FUNCIÓN: Maneja los clics en el Header (Pestañas Superiores)
  const handleHeaderChange = (e: { status: string }) => {
    // Si seleccionan "Todas", limpiamos el filtro status ("")
    const statusValue = e.status === "Todas" ? "" : e.status
    
    setFiltros({
      ...filtros,
      status: statusValue
    })
    setPaginaActual(1)
  }

  useEffect(() => {
    cargarDatos(filtros, paginaActual)
  }, [filtros, paginaActual])

  return (
    <div className="space-y-6">
      {/* 3. AQUÍ COLOCAMOS TU HEADER INTEGRADO */}
      {/* Se mantiene fijo arriba y controla el estatus de la tabla */}
      <SolicititudesHeader 
        currentStatus={filtros.status || "Todas"} 
        onStatusChange={handleHeaderChange} 
      />

      <SolicitudesFilters 
        initialFilters={filtros} 
        onFilterChange={handleFilterChange}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        totalPaginas={totalPaginas}
        loading={loading}
        hasData={solicitudes.length > 0}
        // Conectamos el selector de filas (7, 14, 21)
        registrosPorPagina={filtros.limit}
        setRegistrosPorPagina={(val: number) => handleFilterChange({ ...filtros, limit: val })}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Consultando MariaDB...
            </span>
          </div>
        ) : (
          <SolicitudesTable data={solicitudes} />
        )}
      </div>
    </div>
  )
}