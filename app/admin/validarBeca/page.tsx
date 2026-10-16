"use client"

import React, { useState, useEffect, useRef, useCallback, use } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { actualizarEstatusBeca } from "@/lib/ActionsEstatusBeca" 
import { obtenerOCrearPeriodoObjetivo } from "@/lib/SolicitudAcademic"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias" 
import { generarRankingAptoIA } from "@/app/admin/validarBeca/lib/AptoIA"

// 🟢 IMPORTACIONES LOCALES E INDEPENDIENTES Y SUS TIPOS OFICIALES
import { ValidarBecaViewAcademic } from "@/app/admin/validarBeca/components/ValidarBecaViewAcademic"
import { ValidarBecaViewAuditoria, SolicitudAuditoriaView } from "@/app/admin/validarBeca/components/ValidarBecaViewAuditoria"
import { ValidarBecaHeader } from "@/app/admin/validarBeca/components/ValidarBecaHeader"
import { ValidarBecaFilters, StudentData, FiltrosValidacionState } from "@/app/admin/validarBeca/components/ValidarBecaFilters"
import { ValidarBecaTable } from "@/app/admin/validarBeca/components/ValidarBecaTablePC"
import { AptoIA } from "@/app/admin/validarBeca/components/AptoIA"
import { SolicitudItem } from "@/app/admin/validarBeca/lib/ProcesadorDatosValidarBeca"
import { PeriodoHistorial, StatsAcademicas } from "@/app/admin/validarBeca/components/ValidarBecaAcademicHistory"

interface EstudianteIAAnalizado {
  id: number | string;
  cedula: string;
  nombre: string;
  apellido: string;
  carrera: string;
  promedio: number;
  puntajeVulnerabilidad: number;
  municipio: string;
  motivoSolicitud: string;
  estatus: string;
  analisisIA: string;
}

interface RespuestaSolicitudes {
  data: SolicitudItem[];
  totalPaginas: number;
  totalRegistros: number;
}

interface HistorialAcademicoResponse {
  success: boolean;
  data: PeriodoHistorial[];
  stats: StatsAcademicas;
  [key: string]: unknown;
}

interface ValidarBecaPageProps {
  searchParams?: Promise<Record<string, string>> | Record<string, string>;
}

export default function ValidarBecaPage({ searchParams }: ValidarBecaPageProps) {
  const resolvedParams = searchParams instanceof Promise ? use(searchParams) : (searchParams || {});
  const initialFilters = resolvedParams;

  const urlSearchParams = useSearchParams();
  const router = useRouter();
  
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodoActualId, setPeriodoActualId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'auditoria' | 'academic'>('list');
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAuditoriaView | null>(null);
  const [dataHistorial, setDataHistorial] = useState<HistorialAcademicoResponse | null>(null); 
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // 🟢 ESTADOS PARA EL BUSCADOR DE IDENTIDAD Y FICHA INDIVIDUAL
  const [student, setStudent] = useState<StudentData | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [cedulaBusqueda, setCedulaBusqueda] = useState("");
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [, setPasoActual] = useState<number>(1);

  // 🟢 ESTADOS PARA EL MODAL DE IA CON PERSISTENCIA GLOBAL (localStorage)
  const [isAptoIAOpen, setIsAptoIAOpen] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  
  const [estudiantesAptosIA, setEstudiantesAptosIA] = useState<EstudianteIAAnalizado[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('unimar_ranking_ia_cache');
      if (saved) {
        try { return JSON.parse(saved) as EstudianteIAAnalizado[]; } catch { return []; }
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
  
  const [filtros, setFiltros] = useState<FiltrosValidacionState>({
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
  });
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [, setTotalRegistros] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isFirstRender = useRef(true); 
  const lastFiltersRef = useRef<string>(""); 
  const auditoriaAbiertaRef = useRef<string | null>(null);

  useEffect(() => {
    const cargarPeriodo = async () => {
      try {
        const res = await obtenerOCrearPeriodoObjetivo();
        const idFinal = (res && typeof res === 'object') ? ((res as Record<string, unknown>).id || (res as Record<string, unknown>).periodo_id) : res;
        if (idFinal) setPeriodoActualId(Number(idFinal));
      } catch (error) {
        console.error("Error obteniendo periodo actual:", error);
      }
    };
    cargarPeriodo();
  }, []);

  // 🟢 CAPTURA DIRECTA Y APERTURA AUTOMÁTICA DE AUDITORÍA POR CÉDULA (SIN IMPORTAR LA PÁGINA)
  const cedulaTarget = urlSearchParams.get('abrirAuditoria') || initialFilters?.abrirAuditoria;

  useEffect(() => {
    if (!cedulaTarget || auditoriaAbiertaRef.current === cedulaTarget) return;

    const abrirExpedienteDirecto = async () => {
      auditoriaAbiertaRef.current = cedulaTarget;
      setLoading(true);
      try {
        const res = (await obtenerTodasLasSolicitudes({
          search: cedulaTarget.trim(),
          page: 1,
          limit: 1
        })) as RespuestaSolicitudes;

        if (res && res.data && res.data.length > 0) {
          setSelectedSolicitud(res.data[0] as SolicitudAuditoriaView);
          setViewMode('auditoria');
        }
      } catch (error) {
        console.error("Error abriendo expediente automático:", error);
      } finally {
        setLoading(false);
      }
    };

    abrirExpedienteDirecto();
  }, [cedulaTarget]);

  const cargarDatos = useCallback(async (actualFiltros: FiltrosValidacionState, pagina: number) => {
    const currentFiltersKey = JSON.stringify({ ...actualFiltros, pagina });
    if (currentFiltersKey === lastFiltersRef.current && !isFirstRender.current) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);

    try {
      const res = (await obtenerTodasLasSolicitudes({ 
        ...actualFiltros, 
        page: pagina, 
        limit: actualFiltros.limit 
      })) as RespuestaSolicitudes;
      
      if (controller.signal.aborted) return;
      if (res && res.data) {
        setSolicitudes(res.data);
        setTotalPaginas(res.totalPaginas || 1);
        setTotalRegistros(res.totalRegistros || 0);
        lastFiltersRef.current = currentFiltersKey; 
      }
    } catch (error) {
      console.error("Error cargando solicitudes para validación:", error);
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

  const handleStatusChange = async (
    id: number, 
    newStatus: string, 
    observaciones?: string, 
    confirmacionEspecial: boolean = false,
    departamentoAsigned?: string
  ) => {
    try {
      const resultado = await actualizarEstatusBeca(
        id, 
        newStatus, 
        observaciones, 
        confirmacionEspecial, 
        departamentoAsigned
      );
      if (resultado.error === "REGLAMENTO_INCUMPLIDO") return resultado; 
      lastFiltersRef.current = ""; 
      await cargarDatos(filtros, paginaActual);
      return resultado;
    } catch {
      return { error: "Error de conexión." };
    }
  };

  const handleSearch = async () => {
    if (!cedulaBusqueda.trim()) return;
    setStudentLoading(true);
    try {
      const res = (await obtenerTodasLasSolicitudes({ 
        search: cedulaBusqueda.trim(), 
        page: 1, 
        limit: 1 
      })) as RespuestaSolicitudes;
      
      if (res && res.data && res.data.length > 0) {
        setStudent(res.data[0] as unknown as StudentData);
        setMostrarResultado(true);
      } else {
        setStudent(null);
        setMostrarResultado(false);
      }
    } catch (error) {
      console.error("Error buscando estudiante individual:", error);
      setStudent(null);
    } finally {
      setStudentLoading(false);
    }
  };

  const borrarEstudio = async (_id: string | number) => {
    try {
      setStudent(null);
      setMostrarResultado(false);
      setCedulaBusqueda("");
      await cargarDatos(filtros, paginaActual);
      return { success: true };
    } catch (error) {
      console.error("Error al borrar estudio:", error);
      return { success: false };
    }
  };

  const ejecutarAnalisisIA = async () => {
    setLoadingIA(true);
    try {
      const res = await generarRankingAptoIA();
      if (res.success && res.data) {
        setEstudiantesAptosIA(res.data as EstudianteIAAnalizado[]);
        setIaYaCargada(true);
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

  const handleOpenAptoIA = async () => {
    setIsAptoIAOpen(true);
    if (!iaYaCargada || estudiantesAptosIA.length === 0) {
      await ejecutarAnalisisIA();
    }
  };

  const handleRefreshIA = async () => {
    await ejecutarAnalisisIA();
  };

  const handleSelectEstudianteDesdeIA = (cedulaEstudiante: string) => {
    const encontrada = solicitudes.find(s => s.cedula === cedulaEstudiante) as SolicitudAuditoriaView | undefined;
    if (encontrada) {
      setSelectedSolicitud({
        ...encontrada,
        nombre: encontrada.nombre || undefined,
        apellido: encontrada.apellido || undefined
      });
      setViewMode('auditoria'); 
    } else {
      setFiltros(prev => ({ ...prev, search: cedulaEstudiante }));
      setIsAptoIAOpen(false);
    }
  };

  const handleCloseSubViews = () => {
    setViewMode('list');
    if (cedulaTarget) {
      auditoriaAbiertaRef.current = null;
      router.replace('/admin/validarBeca');
    }
  };

  const selectedSolicitudAcademica = selectedSolicitud ? {
    ...selectedSolicitud,
    nombre: selectedSolicitud.nombre || undefined,
    apellido: selectedSolicitud.apellido || undefined
  } : null;

  if (viewMode === 'academic') return (
    <ValidarBecaViewAcademic 
      selectedSolicitud={selectedSolicitudAcademica} 
      dataHistorial={dataHistorial} 
      loadingHistorial={loadingHistorial} 
      onClose={handleCloseSubViews} 
    />
  );

  if (viewMode === 'auditoria') return (
    <ValidarBecaViewAuditoria 
      selectedSolicitud={selectedSolicitud} 
      onStatusChange={handleStatusChange} 
      onClose={handleCloseSubViews} 
      periodoActualId={periodoActualId} 
    />
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
      <ValidarBecaHeader 
        currentStatus={filtros.status || "Todas"} 
        onStatusChange={(e: { status: string }) => setFiltros({...filtros, status: e.status === "Todas" ? "" : e.status, limit: 7})} 
      />
      <ValidarBecaFilters 
        initialFilters={filtros} 
        onFilterChange={(f: FiltrosValidacionState) => { 
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
        student={student}
        studentLoading={studentLoading}
        cedulaBusqueda={cedulaBusqueda}
        setCedulaBusqueda={setCedulaBusqueda}
        handleSearch={handleSearch}
        mostrarResultado={mostrarResultado}
        setMostrarResultado={setMostrarResultado}
        setPasoActual={setPasoActual}
        borrarEstudio={borrarEstudio}
        setStudent={setStudent}
        onView={(studentData) => {
          setSelectedSolicitud(studentData as SolicitudAuditoriaView);
          setViewMode('auditoria');
        }}
      />
      <ValidarBecaTable 
        loading={loading} 
        solicitudes={solicitudes} 
        periodoActualId={periodoActualId}
        onStatusChange={handleStatusChange}
        onViewAuditoria={(s: SolicitudItem) => { setSelectedSolicitud(s as SolicitudAuditoriaView); setViewMode('auditoria'); }}
        onViewAcademic={async (s: SolicitudItem) => {
          setSelectedSolicitud(s as SolicitudAuditoriaView); setViewMode('academic'); setLoadingHistorial(true);
          const userIdVal = s.user_id;
          const res = (await getStudentHistory(Number(userIdVal), false)) as HistorialAcademicoResponse;
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