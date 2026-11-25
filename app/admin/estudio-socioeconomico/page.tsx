"use client"

import React, { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, Fingerprint } from "lucide-react"
import { buscarEstudianteConEstudio, guardarOActualizarEstudio, borrarEstudio } from "@/lib/ActionsSocioeconomico"

// Componentes modulares unificados (Sin AnalisisIA)
import { PageHeader } from "@/components/admin/PageHeader"
import { ResultCard } from "@/components/admin/socioeconomico/ResultCard"
import { StepForm } from "@/components/admin/socioeconomico/StepForm"
import { StudentIdentity } from "@/components/admin/socioeconomico/StudentIdentity"
import { SECCIONES_MAESTRAS } from "@/components/admin/socioeconomico/StepFormData"
import type { StudentData } from "@/app/admin/validarBeca/components/ValidarBecaFilters"

interface EstudianteData extends StudentData {
  nombre?: string;
  apellido?: string;
  cedula: string;
  email?: string;
  puntaje_admin?: number | null;
}

const construirEstadoInicialVacio = (): Record<string, unknown> => {
  const estado: Record<string, unknown> = {};
  for (const seccion of SECCIONES_MAESTRAS) {
    for (const campo of seccion.fields) {
      estado[campo.name] = "";
    }
  }
  return estado;
};

function SocioeconomicoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [cedulaBusqueda, setCedulaBusqueda] = useState<string>("");

  const [student, setStudent] = useState<StudentData | null>(null);
  const [candidates, setCandidates] = useState<EstudianteData[]>([]);

  const [, setPasoActual] = useState<number>(1);
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);
  const [notificacion, setNotificacion] = useState<{ msg: string; tipo: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<Record<string, unknown>>(() => construirEstadoInicialVacio());

  const forzarEdicionParam = searchParams.get('editar') === '1';

  const notify = (msg: string, tipo: 'success' | 'error' = 'error') => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const selectCandidate = useCallback((selected: EstudianteData) => {
    setStudent(selected);
    setCandidates([]);

    if (selected.puntaje_admin !== null && selected.puntaje_admin !== undefined) {
      setFormData({ ...construirEstadoInicialVacio(), ...selected });
      if (forzarEdicionParam) {
        setMostrarResultado(false);
        setPasoActual(1);
      } else {
        setMostrarResultado(true);
      }
    } else {
      setFormData(construirEstadoInicialVacio());
      setMostrarResultado(false);
      setPasoActual(1);
    }
  }, [forzarEdicionParam]);

  const performSearch = useCallback(async (termino: string, isAuto: boolean = false) => {
    if (!termino || termino.length < 3) return;

    setLoading(true);
    const res = await buscarEstudianteConEstudio(termino) as EstudianteData[];

    if (res && res.length > 0) {
      if (res.length === 1) {
        selectCandidate(res[0]);
      } else {
        setStudent(null);
        setCandidates(res);
      }
    } else if (!isAuto) {
      setStudent(null);
      setCandidates([]);
      notify("No se encontraron coincidencias.", "error");
    }
    setLoading(false);
  }, [selectCandidate]);

  useEffect(() => {
    const querySearch = searchParams.get('search');
    if (querySearch) {
      setCedulaBusqueda(querySearch);
      performSearch(querySearch, true);
    }
  }, [searchParams, performSearch]);

  useEffect(() => {
    const term = cedulaBusqueda.trim();
    if (!term) {
      setStudent(null);
      setCandidates([]);
      setMostrarResultado(false);
      return;
    }
    const timeoutId = setTimeout(() => { performSearch(term, true); }, 600);
    return () => clearTimeout(timeoutId);
  }, [cedulaBusqueda, performSearch]);

  const handleSearch = async () => {
    if (!cedulaBusqueda) return notify("Por favor, ingrese un término.", "error");
    await performSearch(cedulaBusqueda, false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setLoading(true);
    const dataToSave = { ...formData, student_id: student.id };
    const res = await guardarOActualizarEstudio(dataToSave) as { success?: boolean; error?: string };

    if (res && res.success) {
      notify("Auditoría guardada correctamente.", "success");

      setTimeout(() => {
        router.push(`/admin/validarBeca?abrirAuditoria=${student.cedula}`);
      }, 800);
    } else {
      notify(res?.error || "Error al guardar.", "error");
      setLoading(false);
    }
  };

  const handleBorrarEstudio = async (studentId: string | number): Promise<{ success: boolean }> => {
    const numericId = typeof studentId === 'string' ? Number(studentId) : studentId;
    const res = await borrarEstudio(numericId);
    return res ?? { success: false };
  };

  const handleSetStudent = (val: StudentData | null) => {
    setStudent(val);
  };

  return (
    <div className="w-full space-y-4 relative px-2 sm:px-4 md:px-6">

      {notificacion && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-lg border backdrop-blur-md ${
            notificacion.tipo === 'success' ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' : 'bg-rose-50/95 border-rose-200 text-rose-800'
          }`}>
            {notificacion.tipo === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
            <p className="text-[9px] font-black uppercase tracking-widest">{notificacion.msg}</p>
          </div>
        </div>
      )}

      <PageHeader
        titulo="Estudio Socioeconómico"
        subtitulo="Auditoría y Baremo de Vulnerabilidad"
        mostrarExportar={false}
      />

      <main className="w-full space-y-6 pb-10">

        {/* BUSCADOR E IDENTIDAD */}
        <section className="w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <StudentIdentity
            student={student}
            loading={loading}
            cedulaBusqueda={cedulaBusqueda}
            setCedulaBusqueda={setCedulaBusqueda}
            handleSearch={handleSearch}
            mostrarResultado={mostrarResultado}
            setMostrarResultado={setMostrarResultado}
            setPasoActual={setPasoActual}
            borrarEstudio={handleBorrarEstudio}
            setStudent={handleSetStudent}
          />
        </section>

        {/* LISTADO DE CANDIDATOS */}
        {candidates.length > 0 && !student && (
          <div className="w-full animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3 mb-5 px-1">
              <div className="h-px flex-1 bg-slate-200"></div>
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Coincidencias Encontradas ({candidates.length})
              </h3>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidates.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCandidate(c)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/80 cursor-pointer hover:border-[#d4a843] hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1e3a5f] font-bold text-xs group-hover:bg-[#1e3a5f] group-hover:text-[#d4a843] transition-colors shadow-sm shrink-0">
                      {c.nombre?.[0]}{c.apellido?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#1e3a5f] uppercase tracking-tight truncate group-hover:text-[#b8860b] transition-colors">
                        {c.nombre} {c.apellido}
                      </h4>
                      <div className="flex items-center gap-2.5 text-[9px] font-bold text-slate-400 mt-1">
                        <span className="text-[#d4a843] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">V-{c.cedula}</span>
                        <span className="opacity-30">•</span>
                        <span className="truncate max-w-[150px]">{c.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#1a2744] group-hover:text-[#d4a843] transition-all shrink-0">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÁREA DE TRABAJO (FORMULARIO O RESULTADO) */}
        {student ? (
          <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-4">
            {mostrarResultado ? (
              <ResultCard
                student={student}
                formData={formData}
                setMostrarResultado={setMostrarResultado}
                setPasoActual={setPasoActual}
              />
            ) : (
              <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#1e3a5f] h-1 w-full"></div>
                <StepForm
                  student={student}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  formData={formData as Record<string, string | number | boolean | null | undefined>}
                  setFormData={setFormData}
                />
              </div>
            )}
          </div>
        ) : (
          candidates.length === 0 && (
            <div className="text-center py-16 opacity-40">
              <Fingerprint className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <h3 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Esperando consulta</h3>
            </div>
          )
        )}
      </main>

      <footer className="text-center py-4 border-t border-slate-100 mt-6">
        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.4em]">
          Bienestar Estudiantil &bull; Unimar 2026
        </p>
      </footer>
    </div>
  );
}

export default function EstudioSocioeconomicoPage() {
  return (
    <Suspense fallback={
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="h-7 w-7 text-[#d4a843] animate-spin mb-3" />
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Iniciando Módulo...</p>
      </div>
    }>
      <SocioeconomicoContent />
    </Suspense>
  );
}