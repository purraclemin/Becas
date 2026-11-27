"use client"

import React, { useState, useEffect, useRef, useCallback, use } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { obtenerTodasLasSolicitudes } from "@/lib/ActionsTodasSolicitudes"
import { actualizarEstatusBeca, type ResultadoActualizacionEstatus } from "@/lib/ActionsEstatusBeca"
import { buscarEstudianteConEstudio } from "@/lib/ActionsSocioeconomico"
import { obtenerOCrearPeriodoObjetivo } from "@/lib/SolicitudAcademic"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias"
import { getSession } from "@/lib/ActionsSession"
import { generarRankingAptoIA } from "@/app/admin/validarBeca/lib/AptoIA"

import { ValidarBecaViewAcademic } from "@/app/admin/validarBeca/components/ValidarBecaViewAcademic"
import {
  ValidarBecaViewAuditoria,
  type SolicitudAuditoriaView
} from "@/app/admin/validarBeca/components/ValidarBecaViewAuditoria"
import { construirExpedienteDetallado } from "@/app/admin/validarBeca/components/ValidarBecaAuditoriaPanel"
import { ValidarBecaHeader } from "@/app/admin/validarBeca/components/ValidarBecaHeader"
import {
  ValidarBecaFilters,
  type StudentData,
  type FiltrosValidacionState
} from "@/app/admin/validarBeca/components/ValidarBecaFilters"
import { ValidarBecaTable } from "@/app/admin/validarBeca/components/ValidarBecaTablePC"
import { AptoIA } from "@/app/admin/validarBeca/components/AptoIA"
import { ModalNominaExcelencia } from "@/app/admin/validarBeca/components/ModalNominaExcelencia"
import { ModalConcursoSocial } from "@/app/admin/validarBeca/components/ModalConcursoSocial"
import type { SolicitudItem } from "@/app/admin/validarBeca/lib/ProcesadorDatosValidarBeca"
import type {
  PeriodoHistorial,
  StatsAcademicas
} from "@/app/admin/validarBeca/components/ValidarBecaAcademicHistory"

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

const RUTAS_RETORNO_ORIGEN: Record<string, string> = {
  estudiantes: "/admin/estudiantes",
  carreras: "/admin/reportes/carreras",
  actividad: "/admin/actividad",
  analiticas: "/admin/analiticas",
  dashboard: "/admin/dashboard",
  socioeconomico: "/admin/estudio-socioeconomico",
  "reportes-aprobadas": "/admin/reportes/aprobadas",
  "reportes-rechazadas": "/admin/reportes/rechazadas",
  "reportes-departamentos": "/admin/reportes/departamentos",
  "reportes-en-revision": "/admin/reportes/en-revision",
  "reportes-recurrencia": "/admin/reportes/recurrencia",
  "reportes-solicitudes-fecha": "/admin/reportes/solicitudes-fecha",
  "reportes-historial": "/admin/reportes/Historial-Aprobaciones",
  "reportes-auditoria": "/admin/reportes/auditoria",
  "reportes-tipos-beca": "/admin/reportes/tipos-beca",
};

export default function ValidarBecaPage({ searchParams }: ValidarBecaPageProps) {
  const resolvedParams = searchParams instanceof Promise ? use(searchParams) : (searchParams || {});
  const initialFilters = resolvedParams;

  const urlSearchParams = useSearchParams();
  const router = useRouter();

  const cedulaTarget = urlSearchParams.get("abrirAuditoria") || initialFilters?.abrirAuditoria;
  const origenTarget = urlSearchParams.get("origen") || initialFilters?.origen;

  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [abriendoAuditoriaDirecta, setAbriendoAuditoriaDirecta] = useState<boolean>(
    Boolean(cedulaTarget)
  );
  const [periodoActualId, setPeriodoActualId] = useState<number | null>(null);
  const [esSecretariaGeneral, setEsSecretariaGeneral] = useState<boolean>(false);
  const [rolCargado, setRolCargado] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<"list" | "auditoria" | "academic">("list");
  const [academicReturnView, setAcademicReturnView] = useState<"list" | "auditoria">("list");
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAuditoriaView | null>(null);
  const [expedientePrecargado, setExpedientePrecargado] = useState<Record<string, unknown> | null>(
    null
  );
  const [dataHistorial, setDataHistorial] = useState<HistorialAcademicoResponse | null>(null);
  const [loadingHistorial, setLoadingHistorial] = useState<boolean>(false);

  // Modales de Gestión Institucional Especial (Solo Coordinación)
  const [isExcelenciaOpen, setIsExcelenciaOpen] = useState<boolean>(false);
  const [isConcursoSocialOpen, setIsConcursoSocialOpen] = useState<boolean>(false);

  // ESTADOS PARA EL BUSCADOR DE IDENTIDAD Y FICHA INDIVIDUAL
  const [student, setStudent] = useState<StudentData | null>(null);
  const [studentLoading, setStudentLoading] = useState<boolean>(false);
  const [cedulaBusqueda, setCedulaBusqueda] = useState<string>("");
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);
  const [, setPasoActual] = useState<number>(1);

  // ESTADOS PARA EL MODAL DE IA CON PERSISTENCIA GLOBAL
  const [isAptoIAOpen, setIsAptoIAOpen] = useState<boolean>(false);
  const [loadingIA, setLoadingIA] = useState<boolean>(false);

  const [estudiantesAptosIA, setEstudiantesAptosIA] = useState<EstudianteIAAnalizado[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("unimar_ranking_ia_cache");
      if (saved) {
        try {
          return JSON.parse(saved) as EstudianteIAAnalizado[];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [iaYaCargada, setIaYaCargada] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return Boolean(localStorage.getItem("unimar_ranking_ia_cache"));
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
    rankingElite: Boolean(initialFilters?.rankingElite),
    estadoEstudio: initialFilters?.estadoEstudio || "",
    filtroPromedio: initialFilters?.filtroPromedio || "",
    limit: Number(initialFilters?.limit) || 7,
    es_renovacion: initialFilters?.es_renovacion || "",
    promedioMin: initialFilters?.promedioMin || "",
    vulnerabilidadMin: initialFilters?.vulnerabilidadMin || "",
    tendencia: initialFilters?.tendencia || "",
    scope: initialFilters?.scope || "",
  });

  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [, setTotalRegistros] = useState<number>(0);

  const listRequestIdRef = useRef<number>(0);
  const lastFiltersRef = useRef<string>("");
  const auditoriaAbiertaRef = useRef<string | null>(null);
  const necesitaRecargaListaRef = useRef<boolean>(false);

  // 1. Carga unificada inicial: contexto (periodo + rol) y, si llega ?abrirAuditoria=, expediente + estudio en UN SOLO ciclo
  useEffect(() => {
    let activo = true;

    const inicializar = async () => {
      try {
        const cedulaInicial = cedulaTarget ? cedulaTarget.trim() : "";

        if (cedulaInicial) {
          auditoriaAbiertaRef.current = cedulaInicial;
          setAbriendoAuditoriaDirecta(true);
          setLoading(true);

          const [resPeriodo, session, resSolDirecta, resultadosEstudio] = await Promise.all([
            obtenerOCrearPeriodoObjetivo(),
            getSession(),
            obtenerTodasLasSolicitudes({
              cedulaExacta: cedulaInicial,
              incluirHistorico: true,
              page: 1,
              limit: 1,
            }) as Promise<RespuestaSolicitudes>,
            buscarEstudianteConEstudio(cedulaInicial) as Promise<Array<Record<string, unknown>>>,
          ]);

          if (!activo) return;

          const idFinal = Number(resPeriodo);
          if (Number.isFinite(idFinal) && idFinal > 0) {
            setPeriodoActualId(idFinal);
          }

          const esSec = Boolean(
            session.isLoggedIn &&
            "esSecretariaGeneral" in session &&
            session.esSecretariaGeneral
          );
          setEsSecretariaGeneral(esSec);
          if (esSec) {
            setFiltros((prev) => ({ ...prev, status: "En Revisión" }));
          }

          let solicitudEncontrada = resSolDirecta?.data?.[0];

          // Respaldo: búsqueda parcial si no hubo coincidencia exacta de cédula
          if (!solicitudEncontrada) {
            const resFallback = (await obtenerTodasLasSolicitudes({
              search: cedulaInicial,
              incluirHistorico: !esSec,
              status: esSec ? "En Revisión" : undefined,
              page: 1,
              limit: 1,
            })) as RespuestaSolicitudes;

            if (!activo) return;
            solicitudEncontrada = resFallback?.data?.[0];
          }

          if (solicitudEncontrada) {
            const vistaAuditoria = solicitudEncontrada as SolicitudAuditoriaView;
            setSelectedSolicitud(vistaAuditoria);
            setExpedientePrecargado(
              construirExpedienteDetallado(vistaAuditoria, resultadosEstudio)
            );
            setViewMode("auditoria");
          }

          setLoading(false);
          setAbriendoAuditoriaDirecta(false);
          setRolCargado(true);
          return;
        }

        const [resPeriodo, session] = await Promise.all([
          obtenerOCrearPeriodoObjetivo(),
          getSession(),
        ]);

        if (!activo) return;

        const idFinal = Number(resPeriodo);
        if (Number.isFinite(idFinal) && idFinal > 0) {
          setPeriodoActualId(idFinal);
        }

        const esSec = Boolean(
          session.isLoggedIn &&
          "esSecretariaGeneral" in session &&
          session.esSecretariaGeneral
        );
        setEsSecretariaGeneral(esSec);

        if (esSec) {
          setFiltros((prev) => ({ ...prev, status: "En Revisión" }));
        }
      } catch (error) {
        console.error("Error inicializando contexto de validación:", error);
      } finally {
        if (activo) {
          setAbriendoAuditoriaDirecta(false);
          setRolCargado(true);
        }
      }
    };

    void inicializar();
    return () => {
      activo = false;
    };
    // Solo al montar la página; cambios posteriores de cedulaTarget se gestionan abajo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Apertura directa si cedulaTarget cambia estando ya montado (ej: desde el buscador global del header)
  useEffect(() => {
    if (!rolCargado) return;
    if (!cedulaTarget) {
      setAbriendoAuditoriaDirecta(false);
      return;
    }

    const cedulaLimpia = cedulaTarget.trim();
    if (!cedulaLimpia || auditoriaAbiertaRef.current === cedulaLimpia) return;

    let activo = true;
    const abrirExpedienteDirecto = async () => {
      auditoriaAbiertaRef.current = cedulaLimpia;
      setAbriendoAuditoriaDirecta(true);
      setLoading(true);
      try {
        const [resSol, resultadosEstudio] = await Promise.all([
          obtenerTodasLasSolicitudes({
            cedulaExacta: cedulaLimpia,
            incluirHistorico: true,
            page: 1,
            limit: 1,
          }) as Promise<RespuestaSolicitudes>,
          buscarEstudianteConEstudio(cedulaLimpia) as Promise<Array<Record<string, unknown>>>,
        ]);

        if (!activo) return;

        let encontrada = resSol?.data?.[0];
        if (!encontrada) {
          const resFallback = (await obtenerTodasLasSolicitudes({
            search: cedulaLimpia,
            incluirHistorico: !esSecretariaGeneral,
            status: esSecretariaGeneral ? "En Revisión" : undefined,
            page: 1,
            limit: 1,
          })) as RespuestaSolicitudes;
          if (!activo) return;
          encontrada = resFallback?.data?.[0];
        }

        if (encontrada) {
          const vista = encontrada as SolicitudAuditoriaView;
          setSelectedSolicitud(vista);
          setExpedientePrecargado(construirExpedienteDetallado(vista, resultadosEstudio));
          setViewMode("auditoria");
        }
      } catch (error) {
        console.error("Error abriendo expediente automático:", error);
      } finally {
        if (activo) {
          setLoading(false);
          setAbriendoAuditoriaDirecta(false);
        }
      }
    };

    void abrirExpedienteDirecto();
    return () => {
      activo = false;
    };
  }, [cedulaTarget, rolCargado, esSecretariaGeneral]);

  const cargarDatos = useCallback(async (actualFiltros: FiltrosValidacionState, pagina: number) => {
    const currentFiltersKey = JSON.stringify({ ...actualFiltros, pagina });
    if (currentFiltersKey === lastFiltersRef.current) return;

    const reqId = ++listRequestIdRef.current;
    setLoading(true);

    try {
      const res = (await obtenerTodasLasSolicitudes({
        ...actualFiltros,
        page: pagina,
        limit: actualFiltros.limit,
      })) as RespuestaSolicitudes;

      if (reqId !== listRequestIdRef.current) return;
      if (res && res.data) {
        setSolicitudes(res.data);
        setTotalPaginas(res.totalPaginas || 1);
        setTotalRegistros(res.totalRegistros || 0);
        lastFiltersRef.current = currentFiltersKey;
      }
    } catch (error) {
      console.error("Error cargando solicitudes para validación:", error);
    } finally {
      if (reqId === listRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const forzarRecargaListado = useCallback(() => {
    lastFiltersRef.current = "";
    void cargarDatos(filtros, paginaActual);
  }, [cargarDatos, filtros, paginaActual]);

  useEffect(() => {
    if (!rolCargado || viewMode !== "list" || abriendoAuditoriaDirecta) return;

    if (necesitaRecargaListaRef.current) {
      necesitaRecargaListaRef.current = false;
      lastFiltersRef.current = "";
    }

    const delay = filtros.search.trim() !== "" ? 250 : 0;
    const timeout = setTimeout(() => {
      void cargarDatos(filtros, paginaActual);
    }, delay);
    return () => clearTimeout(timeout);
  }, [filtros, paginaActual, cargarDatos, viewMode, rolCargado, abriendoAuditoriaDirecta]);

  const handleOpenAcademicHistory = useCallback(
    async (solicitudTarget: SolicitudItem | SolicitudAuditoriaView, origen: "list" | "auditoria") => {
      setSelectedSolicitud(solicitudTarget as SolicitudAuditoriaView);
      setAcademicReturnView(origen);
      setViewMode("academic");
      setDataHistorial(null);
      setLoadingHistorial(true);

      try {
        const userIdVal = Number(solicitudTarget.user_id ?? 0);
        if (Number.isInteger(userIdVal) && userIdVal > 0) {
          const res = (await getStudentHistory(userIdVal, false)) as HistorialAcademicoResponse;
          if (res.success) {
            setDataHistorial(res);
          }
        }
      } catch (error) {
        console.error("Error cargando historial académico del estudiante:", error);
      } finally {
        setLoadingHistorial(false);
      }
    },
    []
  );

  const handleStatusChange = useCallback(
    async (
      id: number,
      newStatus: string,
      observaciones?: string,
      confirmacionEspecial: boolean = false,
      departamentoAsigned?: string
    ): Promise<ResultadoActualizacionEstatus> => {
      try {
        const resultado = await actualizarEstatusBeca(
          id,
          newStatus,
          observaciones,
          confirmacionEspecial,
          departamentoAsigned
        );

        if (resultado.error === "REGLAMENTO_INCUMPLIDO" || resultado.error) {
          return resultado;
        }

        if (resultado.success) {
          const obsLimpias =
            observaciones && observaciones.trim() !== "" ? observaciones.trim() : null;

          setSelectedSolicitud((prev) =>
            prev && Number(prev.id) === Number(id)
              ? {
                  ...prev,
                  estatus: newStatus,
                  observaciones_admin: obsLimpias,
                  departamento_asignado: departamentoAsigned ?? prev.departamento_asignado,
                }
              : prev
          );

          setSolicitudes((prev) =>
            prev.map((item) =>
              Number(item.id) === Number(id)
                ? {
                    ...item,
                    estatus: newStatus,
                    observaciones_admin: obsLimpias,
                    departamento_asignado: departamentoAsigned ?? item.departamento_asignado,
                  }
                : item
            )
          );

          // Si estamos dentro del panel de auditoría, diferimos la recarga del listado hasta volver a la lista
          if (viewMode === "auditoria") {
            necesitaRecargaListaRef.current = true;
          } else {
            lastFiltersRef.current = "";
            await cargarDatos(filtros, paginaActual);
          }
        }

        return resultado;
      } catch {
        return { error: "Error de conexión." };
      }
    },
    [viewMode, cargarDatos, filtros, paginaActual]
  );

  const handleSearch = async () => {
    if (!cedulaBusqueda.trim()) return;
    setStudentLoading(true);
    try {
      const res = (await obtenerTodasLasSolicitudes({
        search: cedulaBusqueda.trim(),
        status: esSecretariaGeneral ? "En Revisión" : undefined,
        page: 1,
        limit: 1,
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
      lastFiltersRef.current = "";
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
        if (typeof window !== "undefined") {
          localStorage.setItem("unimar_ranking_ia_cache", JSON.stringify(res.data));
          localStorage.setItem("unimar_ranking_ia_timestamp", new Date().toISOString());
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
    if (esSecretariaGeneral) return;
    setIsAptoIAOpen(true);
    if (!iaYaCargada || estudiantesAptosIA.length === 0) {
      await ejecutarAnalisisIA();
    }
  };

  const handleRefreshIA = async () => {
    await ejecutarAnalisisIA();
  };

  const handleSelectEstudianteDesdeIA = async (cedulaEstudiante: string) => {
    const cedulaLimpia = cedulaEstudiante.trim();
    if (!cedulaLimpia) return;

    setIsAptoIAOpen(false);
    const encontrada = solicitudes.find(
      (s) => String(s.cedula || "").trim() === cedulaLimpia
    ) as SolicitudAuditoriaView | undefined;

    if (encontrada) {
      setExpedientePrecargado(null);
      setSelectedSolicitud({
        ...encontrada,
        nombre: encontrada.nombre || undefined,
        apellido: encontrada.apellido || undefined,
      });
      setViewMode("auditoria");
      return;
    }

    // Si no está en la página visible actual, abre directamente su panel de auditoría
    setAbriendoAuditoriaDirecta(true);
    try {
      const [resSol, resultadosEstudio] = await Promise.all([
        obtenerTodasLasSolicitudes({
          cedulaExacta: cedulaLimpia,
          incluirHistorico: !esSecretariaGeneral,
          status: esSecretariaGeneral ? "En Revisión" : undefined,
          page: 1,
          limit: 1,
        }) as Promise<RespuestaSolicitudes>,
        buscarEstudianteConEstudio(cedulaLimpia) as Promise<Array<Record<string, unknown>>>,
      ]);

      const registro = resSol?.data?.[0];
      if (registro) {
        const vista = registro as SolicitudAuditoriaView;
        setSelectedSolicitud(vista);
        setExpedientePrecargado(construirExpedienteDetallado(vista, resultadosEstudio));
        setViewMode("auditoria");
      }
    } catch (error) {
      console.error("Error abriendo auditoría desde Ranking IA:", error);
    } finally {
      setAbriendoAuditoriaDirecta(false);
    }
  };

  const handleCloseSubViews = useCallback(() => {
    const origenKey = String(origenTarget || "").trim().toLowerCase();
    const rutaRetorno = RUTAS_RETORNO_ORIGEN[origenKey];
    if (rutaRetorno) {
      router.push(rutaRetorno);
      return;
    }

    setExpedientePrecargado(null);
    setViewMode("list");
    setAcademicReturnView("list");
    if (cedulaTarget) {
      auditoriaAbiertaRef.current = null;
      router.replace("/admin/validarBeca");
    }
  }, [origenTarget, cedulaTarget, router]);

  const handleCloseAcademicView = useCallback(() => {
    if (academicReturnView === "auditoria" && selectedSolicitud) {
      setViewMode("auditoria");
      setAcademicReturnView("list");
      return;
    }
    handleCloseSubViews();
  }, [academicReturnView, selectedSolicitud, handleCloseSubViews]);

  const selectedSolicitudAcademica = selectedSolicitud
    ? {
        ...selectedSolicitud,
        nombre: selectedSolicitud.nombre || undefined,
        apellido: selectedSolicitud.apellido || undefined,
      }
    : null;

  if (abriendoAuditoriaDirecta) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-[#f8fafc] min-h-[60vh]">
        <Loader2 className="h-9 w-9 animate-spin text-[#d4a843] mb-3" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">
          Abriendo Expediente de Auditoría...
        </p>
      </div>
    );
  }

  if (viewMode === "academic") {
    return (
      <ValidarBecaViewAcademic
        selectedSolicitud={selectedSolicitudAcademica}
        dataHistorial={dataHistorial}
        loadingHistorial={loadingHistorial}
        onClose={handleCloseAcademicView}
        backLabel={academicReturnView === "auditoria" ? "Volver a Auditoría" : "Cerrar Expediente"}
      />
    );
  }

  if (viewMode === "auditoria") {
    return (
      <ValidarBecaViewAuditoria
        selectedSolicitud={selectedSolicitud}
        initialExpedienteDetallado={expedientePrecargado}
        onStatusChange={handleStatusChange}
        onClose={handleCloseSubViews}
        onViewAcademic={
          selectedSolicitud
            ? () => {
                void handleOpenAcademicHistory(selectedSolicitud, "auditoria");
              }
            : undefined
        }
        periodoActualId={periodoActualId}
        esSecretariaGeneral={esSecretariaGeneral}
      />
    );
  }

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
      <ValidarBecaHeader
        currentStatus={esSecretariaGeneral ? "En Revisión" : filtros.status || "Todas"}
        esSecretariaGeneral={esSecretariaGeneral}
        onOpenExcelencia={!esSecretariaGeneral ? () => setIsExcelenciaOpen(true) : undefined}
        onOpenConcursoSocial={!esSecretariaGeneral ? () => setIsConcursoSocialOpen(true) : undefined}
        onStatusChange={(e: { status: string }) => {
          if (esSecretariaGeneral) return;
          setFiltros({ ...filtros, status: e.status === "Todas" ? "" : e.status, limit: 7 });
        }}
      />
      <ValidarBecaFilters
        initialFilters={filtros}
        esSecretariaGeneral={esSecretariaGeneral}
        onFilterChange={(f: FiltrosValidacionState) => {
          setFiltros(esSecretariaGeneral ? { ...f, status: "En Revisión" } : f);
        }}
        paginaActual={paginaActual}
        setPaginaActual={setPaginaActual}
        totalPaginas={totalPaginas}
        loading={loading}
        hasData={solicitudes.length > 0}
        registrosPorPagina={filtros.limit}
        setRegistrosPorPagina={(val: number) => {
          setFiltros({ ...filtros, limit: val });
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
          setExpedientePrecargado(null);
          setSelectedSolicitud(studentData as SolicitudAuditoriaView);
          setViewMode("auditoria");
        }}
      />
      <ValidarBecaTable
        loading={loading}
        solicitudes={solicitudes}
        periodoActualId={periodoActualId}
        esSecretariaGeneral={esSecretariaGeneral}
        onStatusChange={handleStatusChange}
        onViewAuditoria={(s: SolicitudItem) => {
          setExpedientePrecargado(null);
          setSelectedSolicitud(s as SolicitudAuditoriaView);
          setViewMode("auditoria");
        }}
        onViewAcademic={(s: SolicitudItem) => {
          void handleOpenAcademicHistory(s, "list");
        }}
      />

      {!esSecretariaGeneral && (
        <>
          <AptoIA
            isOpen={isAptoIAOpen}
            onClose={() => setIsAptoIAOpen(false)}
            loading={loadingIA}
            estudiantesAptos={estudiantesAptosIA}
            onSelectEstudiante={(ced) => {
              void handleSelectEstudianteDesdeIA(ced);
            }}
            periodoNombre={periodoActualId ? `Periodo ID: ${periodoActualId}` : "Periodo Actual"}
            onRefreshIA={handleRefreshIA}
          />
          <ModalNominaExcelencia
            isOpen={isExcelenciaOpen}
            onClose={() => setIsExcelenciaOpen(false)}
            onRefreshList={forzarRecargaListado}
          />
          <ModalConcursoSocial
            isOpen={isConcursoSocialOpen}
            onClose={() => setIsConcursoSocialOpen(false)}
            onRefreshList={forzarRecargaListado}
          />
        </>
      )}
    </div>
  );
}
