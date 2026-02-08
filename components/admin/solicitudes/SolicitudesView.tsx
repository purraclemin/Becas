"use client"

import React, { useState, useEffect, useRef } from "react"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { actualizarEstatusBeca } from "@/lib/ActionsEstatusBeca" 
import { SolicitudesFilters } from "./SolicitudesFilters"
import { SolicitudesTable } from "./SolicitudesTable"
import { SolicitudesHeader } from "./SolicitudHeader" 
import { SolicitudModal } from "./SolicitudModal" 
import { Loader2 } from "lucide-react"

export function SolicitudesView({ initialFilters }: any) {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  
  // Filtros iniciales
  const [filtros, setFiltros] = useState({
    ...initialFilters,
    limit: initialFilters?.limit || 7 
  })
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  // 🟢 1. REF PARA CONTROLAR PETICIONES VIEJAS (SEMÁFORO)
  const abortControllerRef = useRef<AbortController | null>(null);

  const cargarDatos = async (actualFiltros: any, pagina: number) => {
    // A. Si hay una petición "viva", la cancelamos inmediatamente
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    // B. Creamos un nuevo controlador para esta nueva petición
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true)

    try {
      // Petición directa a MariaDB
      const res: any = await obtenerTodasLasSolicitudes({ 
        ...actualFiltros, 
        page: pagina,
        limit: actualFiltros.limit 
      })

      // C. ANTES DE ACTUALIZAR: Preguntamos "¿Sigo siendo la petición actual?"
      // Si controller.signal.aborted es true, significa que el usuario hizo otro clic
      // y esta data ya es "basura", así que no hacemos nada.
      if (controller.signal.aborted) return;

      if (res && res.data) {
        setSolicitudes(res.data)
        setTotalPaginas(res.totalPaginas || 1)
        setTotalRegistros(res.totalRegistros || 0)
      } else {
        setSolicitudes([])
        setTotalPaginas(1)
      }

    } catch (error) {
      // Solo mostramos error si NO fue cancelado intencionalmente
      if (!controller.signal.aborted) {
          console.error("Error cargando solicitudes:", error)
          setSolicitudes([]) 
      }
    } finally {
      // Solo quitamos el loading si esta petición sigue vigente
      if (!controller.signal.aborted) {
          setLoading(false)
      }
    }
  }

  // Maneja los cambios desde la Barra de Filtros
  const handleFilterChange = (nuevosFiltros: any) => {
    setFiltros(nuevosFiltros)
    setPaginaActual(1) 
  }

  // Maneja los clics en el Header
  const handleHeaderChange = (e: { status: string }) => {
    const statusValue = e.status === "Todas" ? "" : e.status
    setFiltros({ ...filtros, status: statusValue })
    setPaginaActual(1)
  }

  // --- FUNCIONES DE ACCIÓN ---
  const handleView = (solicitud: any) => {
    setSelectedSolicitud(solicitud)
    setIsModalOpen(true)
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const resultado = await actualizarEstatusBeca(id, newStatus);
      if (resultado.error) {
        alert("No se pudo actualizar: " + resultado.error);
        return;
      }
      await cargarDatos(filtros, paginaActual);
    } catch (error) {
      console.error("Error al procesar el cambio de estatus:", error);
    }
  }

  // Efecto principal: Recarga datos y limpia al desmontar
  useEffect(() => {
    cargarDatos(filtros, paginaActual)
    
    // Cleanup: Si el usuario cambia de página rápido, matamos la petición
    return () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }
  }, [filtros, paginaActual])

  return (
    <div className="space-y-6">
      <SolicitudesHeader
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
        registrosPorPagina={filtros.limit}
        setRegistrosPorPagina={(val: number) => handleFilterChange({ ...filtros, limit: val })}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 h-full animate-in fade-in duration-200">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Consultando MariaDB...
            </span>
          </div>
        ) : (
          <SolicitudesTable 
            data={solicitudes} 
            onView={handleView} 
            onStatusChange={handleStatusChange} 
          />
        )}
      </div>

      {isModalOpen && selectedSolicitud && (
        <SolicitudModal
          solicitud={selectedSolicitud}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange} 
        />
      )}
    </div>
  )
}