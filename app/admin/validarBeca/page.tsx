"use client"

import React, { useState, useEffect, useRef, useCallback, use } from "react"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { actualizarEstatusBeca } from "@/lib/ActionsEstatusBeca" 
import { obtenerOCrearPeriodoObjetivo } from "@/lib/SolicitudAcademic"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias" 
import { generarRankingAptoIA } from "@/app/admin/validarBeca/lib/AptoIA"

// 🟢 IMPORTACIONES LOCALES E INDEPENDIENTES
import { ValidarBecaViewAcademic } from "@/app/admin/validarBeca/components/ValidarBecaViewAcademic"
import { ValidarBecaViewAuditoria } from "@/app/admin/validarBeca/components/ValidarBecaViewAuditoria"
import { ValidarBecaHeader } from "@/app/admin/validarBeca/components/ValidarBecaHeader"
import { ValidarBecaFilters } from "@/app/admin/validarBeca/components/ValidarBecaFilters"
import { ValidarBecaTable } from "@/app/admin/validarBeca/components/ValidarBecaTablePC"
import { AptoIA } from "@/app/admin/validarBeca/components/AptoIA"

interface FiltrosValidacion {
  search: string;
  status: string;
  municipio: string;
  carrera: string;
  trimestre: string;
  tipoBeca: string;
  fecha: string;
  vulnerabilidad: string;
  rankingElite?: boolean;
  estadoEstudio: string;
  filtroPromedio: string;
  limit: number;
  es_renovacion?: string;
  promedioMin?: string;
  vulnerabilidadMin?: string;
  tendencia?: string;
  scope?: string;
}

export default function ValidarBecaPage({ searchParams }: { searchParams?: Promise<Record<string, string>> | Record<string, string> }) {
  const resolvedParams = searchParams instanceof Promise ? use(searchParams) : (searchParams || {});
  const initialFilters = resolvedParams;
  
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodoActualId, setPeriodoActualId] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'auditoria' | 'academic'>('list')
  const [selectedSolicitud, setSelectedSolicitud] = useState<any>(null)
  const [dataHistorial, setDataHistorial] = useState<any>(null) 
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  // 🟢 ESTADOS PARA EL MODAL DE IA CON PERSISTENCIA GLOBAL (localStorage)
  const [isAptoIAOpen, setIsAptoIAOpen] = useState(false)
  const [loadingIA, setLoadingIA] = useState(false)
  
  // Recupera el caché almacenado del navegador al iniciar para que no se pierda al cambiar de página
  const [estudiantesAptosIA, setEstudiantesAptosIA] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unimar_ranking_ia_cache');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return []; }
      }
    }
    return [];
  });

  const [iaYaCargada, setIaYaCargada] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('unimar_ranking_ia_cache');
    }
    return false;
  });
  
  const [filtros, setFiltros] = useState<FiltrosValidacion>({
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
    limit: Number(initialFilters?.limit) || 7,
    es_renovacion: initialFilters?.es_renovacion || "",
    promedioMin: initialFilters?.promedioMin || "",
    vulnerabilidadMin: initialFilters?.vulnerabilidadMin || "",
    tendencia: initialFilters?.tendencia || "",
    scope: initialFilters?.scope || ""
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

  const cargarDatos = useCallback(async (actualFiltros: FiltrosValidacion, pagina: number) => {
    const currentFiltersKey = JSON.stringify({ ...actualFiltros, pagina });
    if (currentFiltersKey === lastFiltersRef.current && !isFirstRender.current) return;
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
        setSolicitudes(res.data);
        setTotalPaginas(res.totalPaginas || 1);
        setTotalRegistros(res.totalRegistros || 0);
        lastFiltersRef.current = currentFiltersKey; 
      }
    } catch (error) {
      console.error("Error cargando solicitudes para validación:", error)
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

  // 🟢 FUNCIÓN DE EJECUCIÓN Y ALMACENAMIENTO PERSISTENTE DE LA IA (CON TIMESTAMP)
  const ejecutarAnalisisIA = async () => {
    setLoadingIA(true);
    try {
      const res = await generarRankingAptoIA();
      if (res.success && res.data) {
        setEstudiantesAptosIA(res.data);
        setIaYaCargada(true);
        // Guardamos de forma persistente en localStorage tanto los datos como la marca de tiempo exacta
        if (typeof window !== 'undefined') {
          localStorage.setItem('unimar_ranking_ia_cache', JSON.stringify(res.data));
          localStorage.setItem('unimar_ranking_ia_timestamp', new Date().toISOString());
        }
      } else {
        console.error("Error devuelto por la IA:", res.error);
      }
    } catch (error) {
      console.error("Error crítico al invocar la Server Action de IA:", error);
    } finally {
      setLoadingIA(false);
    }
  };

  // 🟢 AL HACER CLIC EN EL BOTÓN DE APTOS
  const handleOpenAptoIA = async () => {
    setIsAptoIAOpen(true);
    // Si no existen datos almacenados en la caché local, los genera por primera vez
    if (!iaYaCargada || estudiantesAptosIA.length === 0) {
      await ejecutarAnalisisIA();
    }
  };

  // 🟢 BOTÓN DE RECARGA MANUAL EXCLUSIVO DENTRO DEL MODAL
  const handleRefreshIA = async () => {
    await ejecutarAnalisisIA();
  };

  const handleSelectEstudianteDesdeIA = (cedulaEstudiante: string) => {
    const encontrada = solicitudes.find(s => s.cedula === cedulaEstudiante);
    if (encontrada) {
      setSelectedSolicitud(encontrada);
      setViewMode('auditoria'); 
    } else {
      setFiltros(prev => ({ ...prev, search: cedulaEstudiante }));
      setIsAptoIAOpen(false);
    }
  };

  if (viewMode === 'academic') return (
    <ValidarBecaViewAcademic 
      selectedSolicitud={selectedSolicitud} 
      dataHistorial={dataHistorial} 
      loadingHistorial={loadingHistorial} 
      onClose={() => setViewMode('list')} 
    />
  );

  if (viewMode === 'auditoria') return (
    <ValidarBecaViewAuditoria 
      selectedSolicitud={selectedSolicitud} 
      onStatusChange={handleStatusChange} 
      onClose={() => setViewMode('list')} 
      periodoActualId={periodoActualId} 
    />
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
      <ValidarBecaHeader 
        currentStatus={filtros.status || "Todas"} 
        onStatusChange={(e: any) => setFiltros({...filtros, status: e.status === "Todas" ? "" : e.status, limit: 7})} 
      />
      <ValidarBecaFilters 
        initialFilters={filtros} 
        onFilterChange={(f: any) => { 
          setFiltros(f); 
        }}
        paginaActual={paginaActual} 
        setPaginaActual={setPaginaActual} 
        totalPaginas={totalPaginas} 
        loading={loading} 
        hasData={solicitudes.length > 0} 
        registrosPorPagina={filtros.limit} 
        setRegistrosPorPagina={(val: number) => {
          setFiltros({...filtros, limit: val});
          setPaginaActual(1); 
        }} 
        onOpenAptoIA={handleOpenAptoIA} 
      />
      <ValidarBecaTable 
        loading={loading} 
        solicitudes={solicitudes} 
        periodoActualId={periodoActualId}
        onStatusChange={handleStatusChange}
        onViewAuditoria={(s: any) => { setSelectedSolicitud(s); setViewMode('auditoria'); }}
        onViewAcademic={async (s: any) => {
          setSelectedSolicitud(s); setViewMode('academic'); setLoadingHistorial(true);
          const res = await getStudentHistory(Number(s.user_id), false);
          if (res.success) setDataHistorial(res);
          setLoadingHistorial(false);
        }}
      />

      <AptoIA 
        isOpen={isAptoIAOpen}
        onClose={() => setIsAptoIAOpen(false)}
        loading={loadingIA}
        estudiantesAptos={estudiantesAptosIA}
        onSelectEstudiante={handleSelectEstudianteDesdeIA}
        periodoNombre={periodoActualId ? `Periodo ID: ${periodoActualId}` : "Periodo Actual"} 
        onRefreshIA={handleRefreshIA}
      />
    </div>
  )
}