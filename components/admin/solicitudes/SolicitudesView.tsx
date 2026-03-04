"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { actualizarEstatusBeca } from "@/lib/ActionsEstatusBeca" 
import { obtenerOCrearPeriodoObjetivo } from "@/lib/SolicitudAcademic"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias" 
import { SolicitudesFilters } from "./SolicitudesFilters"
import { SolicitudesHeader } from "./SolicitudHeader" 

// Importación de submódulos
import { SolicitudesViewTable } from "./SolicitudesViewTable"
import { SolicitudesViewAuditoria } from "./SolicitudesViewAuditoria"
import { SolicitudesViewAcademic } from "./SolicitudesViewAcademic"

interface FiltrosSolicitud {
  search: string;
  status: string;
  municipio: string;
  carrera: string;
  trimestre: string;
  tipoBeca: string;
  fecha: string;
  vulnerabilidad: string;
  rankingElite: boolean;
  estadoEstudio: string;
  filtroPromedio: string;
  limit: number;
  // 🟢 NUEVOS: Campos para la integración con Analytics (Embudo)
  es_renovacion?: string;
  promedioMin?: string;
  vulnerabilidadMin?: string;
  tendencia?: string;
  scope?: string; // 📊 Parámetro para la Barra 5
}

export function SolicitudesView({ initialFilters }: { initialFilters: any }) {
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodoActualId, setPeriodoActualId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'auditoria' | 'academic'>('list')
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  const [dataHistorial, setDataHistorial] = useState<any>(null) 
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  
  const [filtros, setFiltros] = useState<FiltrosSolicitud>({
    search: initialFilters?.search || "",
    status: initialFilters?.status || "",
    municipio: initialFilters?.municipio || "",
    carrera: initialFilters?.carrera || "",
    trimestre: initialFilters?.trimestre || "",
    tipoBeca: initialFilters?.tipoBeca || "",
    fecha: initialFilters?.fecha || "",
    vulnerabilidad: initialFilters?.vulnerabilidad || "",
    rankingElite: !!initialFilters?.rankingElite,
    estadoEstudio: initialFilters?.estadoEstudio || "",
    filtroPromedio: initialFilters?.filtroPromedio || "",
    limit: initialFilters?.limit || 7,
    // 🟢 Inicialización de filtros provenientes del Embudo
    es_renovacion: initialFilters?.es_renovacion || "",
    promedioMin: initialFilters?.promedioMin || "",
    vulnerabilidadMin: initialFilters?.vulnerabilidadMin || "",
    tendencia: initialFilters?.tendencia || "",
    scope: initialFilters?.scope || "" // 📊 Inicialización del scope
  })
  
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstRender = useRef(true); 
  const lastFiltersRef = useRef<string>(""); 

  useEffect(() => {
    const cargarPeriodo = async () => {
      try {
        const res = await obtenerOCrearPeriodoObjetivo();
        const idFinal = (res && typeof res === 'object') ? (res.id || res.periodo_id) : res;
        if (idFinal) setPeriodoActualId(Number(idFinal));
      } catch (error) {
        console.error("Error obteniendo periodo actual:", error);
      }
    };
    cargarPeriodo();
  }, []);

  const cargarDatos = useCallback(async (actualFiltros: FiltrosSolicitud, pagina: number) => {
    const currentFiltersKey = JSON.stringify({ ...actualFiltros, pagina });
    if (currentFiltersKey === lastFiltersRef.current && !isFirstRender.current) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true)

    try {
      // Los nuevos filtros se propagan a la Server Action automáticamente
      const res: any = await obtenerTodasLasSolicitudes({ 
        ...actualFiltros, 
        page: pagina, 
        limit: actualFiltros.limit 
      })
      if (controller.signal.aborted) return;
      if (res && res.data) {
        setSolicitudes(res.data);
        setTotalPaginas(res.totalPaginas || 1);
        setTotalRegistros(res.totalRegistros || 0);
        lastFiltersRef.current = currentFiltersKey; 
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error)
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (viewMode !== 'list') return;
    const timeout = setTimeout(() => {
      cargarDatos(filtros, paginaActual);
      isFirstRender.current = false;
    }, isFirstRender.current ? 50 : 0);
    return () => clearTimeout(timeout);
  }, [filtros, paginaActual, cargarDatos, viewMode]);

  const handleStatusChange = async (id: number, newStatus: string, observaciones?: string, confirmacionEspecial: boolean = false) => {
    try {
      const resultado = await actualizarEstatusBeca(id, newStatus, observaciones, confirmacionEspecial);
      if (resultado.error === "REGLAMENTO_INCUMPLIDO") return resultado; 
      lastFiltersRef.current = ""; 
      await cargarDatos(filtros, paginaActual);
      return resultado;
    } catch (error) {
      return { error: "Error de conexión." };
    }
  }

  if (viewMode === 'academic') return (
    <SolicitudesViewAcademic 
      selectedSolicitud={selectedSolicitud} 
      dataHistorial={dataHistorial} 
      loadingHistorial={loadingHistorial} 
      onClose={() => setViewMode('list')} 
    />
  );

  if (viewMode === 'auditoria') return (
    <SolicitudesViewAuditoria 
      selectedSolicitud={selectedSolicitud} 
      onStatusChange={handleStatusChange} 
      onClose={() => setViewMode('list')} 
      periodoActualId={periodoActualId} 
    />
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8">
      <SolicitudesHeader 
        currentStatus={filtros.status || "Todas"} 
        onStatusChange={(e:any) => setFiltros({...filtros, status: e.status === "Todas" ? "" : e.status, limit: 7})} 
      />
      <SolicitudesFilters 
        initialFilters={filtros} 
        onFilterChange={(f:any) => { setFiltros(f); setPaginaActual(1); }}
        paginaActual={paginaActual} 
        setPaginaActual={setPaginaActual} 
        totalPaginas={totalPaginas} 
        loading={loading} 
        hasData={solicitudes.length > 0} 
        registrosPorPagina={filtros.limit} 
        setRegistrosPorPagina={(val:number) => setFiltros({...filtros, limit: val})} 
      />
      <SolicitudesViewTable 
        loading={loading} 
        solicitudes={solicitudes} 
        periodoActualId={periodoActualId}
        handleStatusChange={handleStatusChange}
        onViewAuditoria={(s:any) => { setSelectedSolicitud(s); setViewMode('auditoria'); }}
        onViewAcademic={async (s:any) => {
          setSelectedSolicitud(s); setViewMode('academic'); setLoadingHistorial(true);
          const res = await getStudentHistory(Number(s.user_id), false);
          if (res.success) setDataHistorial(res);
          setLoadingHistorial(false);
        }}
      />
    </div>
  )
}