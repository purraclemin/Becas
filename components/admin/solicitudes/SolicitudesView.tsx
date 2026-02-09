"use client"

import React, { useState, useEffect, useRef } from "react"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { actualizarEstatusBeca } from "@/lib/ActionsEstatusBeca" 
import { SolicitudesFilters } from "./SolicitudesFilters"
import { SolicitudesTable } from "./SolicitudesTable"
import { SolicitudesHeader } from "./SolicitudHeader" 
import { SolicitudModal } from "./SolicitudModal" 
import { Loader2 } from "lucide-react"

// Interfaz para asegurar tipado estricto y evitar error de 'any' implícito
interface FiltrosSolicitud {
  search: string;
  status: string;
  carrera: string;
  tipoBeca: string;
  fecha: string;
  vulnerabilidad: string;
  rankingElite: boolean;
  estadoEstudio: string;
  filtroPromedio: string;
  limit: number;
}

export function SolicitudesView({ initialFilters }: { initialFilters: any }) {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  
  // 🟢 ÚNICA FUENTE DE VERDAD: El estado se inicializa una vez.
  // Gracias a la 'key' en el Padre, este componente se reinicia solo cuando la URL cambia.
  const [filtros, setFiltros] = useState<FiltrosSolicitud>({
    search: initialFilters?.search || "",
    status: initialFilters?.status || "",
    carrera: initialFilters?.carrera || "",
    tipoBeca: initialFilters?.tipoBeca || "",
    fecha: initialFilters?.fecha || "",
    vulnerabilidad: initialFilters?.vulnerabilidad || "",
    rankingElite: !!initialFilters?.rankingElite,
    estadoEstudio: initialFilters?.estadoEstudio || "",
    filtroPromedio: initialFilters?.filtroPromedio || "",
    limit: initialFilters?.limit || 7 
  })
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null);

  const cargarDatos = async (actualFiltros: FiltrosSolicitud, pagina: number) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true)

    try {
      const res: any = await obtenerTodasLasSolicitudes({ 
        ...actualFiltros, 
        page: pagina,
        limit: actualFiltros.limit 
      })

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
      if (!controller.signal.aborted) {
          console.error("Error cargando solicitudes:", error)
          setSolicitudes([]) 
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  const handleFilterChange = (nuevosFiltros: FiltrosSolicitud) => {
    setFiltros(nuevosFiltros)
    setPaginaActual(1) 
  }

  const handleHeaderChange = (e: { status: string }) => {
    const statusValue = e.status === "Todas" ? "" : e.status
    handleFilterChange({ ...filtros, status: statusValue })
  }

  const handleView = (solicitud: any) => {
    setSelectedSolicitud(solicitud)
    setIsModalOpen(true)
  }

  // 🟢 ACTUALIZADO: Ahora recibe y envía las observaciones al servidor
  const handleStatusChange = async (id: number, newStatus: string, observaciones?: string) => {
    try {
      const resultado = await actualizarEstatusBeca(id, newStatus, observaciones);
      if (resultado.error) {
        alert("No se pudo actualizar: " + resultado.error);
        return;
      }
      await cargarDatos(filtros, paginaActual);
    } catch (error) {
      console.error("Error al procesar el cambio de estatus:", error);
    }
  }

  // Único efecto que dispara la carga. Se ejecuta al montar y cuando cambian filtros.
  useEffect(() => {
    cargarDatos(filtros, paginaActual)
    return () => abortControllerRef.current?.abort();
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-in fade-in duration-300">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Sincronizando MariaDB...
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