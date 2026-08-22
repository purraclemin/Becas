"use client"

import React, { useState, useEffect, Suspense, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, AlertCircle, Loader2, ChevronRight, Fingerprint } from "lucide-react"
import { buscarEstudianteConEstudio, guardarOActualizarEstudio, borrarEstudio } from "@/lib/ActionsSocioeconomico"
import { generarAnalisisIaEstudio } from "@/lib/diagnosticoIA"

// Componentes modulares unificados
import { PageHeader } from "@/components/admin/PageHeader"
import { ResultCard } from "@/components/admin/socioeconomico/ResultCard"
import { StepForm } from "@/components/admin/socioeconomico/StepForm"
import { StudentIdentity } from "@/components/admin/socioeconomico/StudentIdentity"
import { AnalisisIA } from "@/components/admin/socioeconomico/AnalisisIA"

function SocioeconomicoContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false)
  const [cedulaBusqueda, setCedulaBusqueda] = useState("")
  
  const [student, setStudent] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([]) 
  
  const [pasoActual, setPasoActual] = useState(1)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success' | 'error'} | null>(null)
  
  // Estados para la IA real
  const [cargandoIA, setCargandoIA] = useState(false)
  const [resumenIA, setResumenIA] = useState("")

  const initialFormState = {
    socio_estado_civil: "",
    socio_municipio: "",
    posee_empleo_aspirante: "No",
    socio_carrera: "",
    socio_trimestre: "",
    socio_modalidad: "",
    familia_num_hermanos: 0,
    familia_hermanos_uni: 0,
    rango_ingreso_familiar: "",
    monto_ingreso_sueldo: 0,
    monto_egreso_mercado: 0,
    monto_egreso_vivienda: 0,
    vivienda_tipo: "",
    vivienda_estatus: "",
    serv_agua: "No posee",
    serv_luz: "No posee",
    serv_gas: "No posee",
    serv_aseo: "No posee",
    serv_internet: "No posee",
    equip_nevera: "No posee",
    equip_lavadora: "No posee",
    equip_cable: "No posee",
    carga_familiar_discapacidad: "No",
    socio_relacion_fam: ""
  };

  const [formData, setFormData] = useState<any>(initialFormState)

  const notify = (msg: string, tipo: 'success' | 'error' = 'error') => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  };

  const selectCandidate = (selected: any) => {
    setStudent(selected);
    setCandidates([]); 
    setResumenIA(""); // Resetear IA al cambiar de estudiante
    
    if (selected.puntaje_admin !== null && selected.puntaje_admin !== undefined) {
      setFormData({ ...initialFormState, ...selected });
      setMostrarResultado(true);
    } else {
      setFormData(initialFormState);
      setMostrarResultado(false);
      setPasoActual(1);
    }
  };

  const performSearch = useCallback(async (termino: string, isAuto: boolean = false) => {
    if (!termino || termino.length < 3) return;

    setLoading(true);
    const res: any = await buscarEstudianteConEstudio(termino);
    
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
  }, []);

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
    if(!cedulaBusqueda) return notify("Por favor, ingrese un término.", "error");
    await performSearch(cedulaBusqueda, false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const dataToSave = { ...formData, student_id: student.id };
    const res: any = await guardarOActualizarEstudio(dataToSave);
    
    if (res && res.success) {
      notify("Auditoría guardada correctamente.", "success");
      await performSearch(student.cedula, true);
    } else {
      notify(res?.error || "Error al guardar.", "error");
    }
    setLoading(false);
  };

  // Conexión real con la Server Action de Gemini (Corregido para manejar string | undefined)
  const handleGenerarAnalisisIA = async () => {
    if (!student?.id) return;
    
    setCargandoIA(true);
    setResumenIA("");

    try {
      const res = await generarAnalisisIaEstudio(student.id);

      if (res && res.success) {
        setResumenIA(res.analisis ?? "");
      } else {
        setResumenIA(res.error ?? "No se pudo generar el diagnóstico ejecutivo.");
      }
    } catch (error) {
      console.error("Error al invocar la API de IA:", error);
      setResumenIA("Ocurrió un error inesperado al procesar la inteligencia artificial.");
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <div className="space-y-4 relative">
      
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

      <main className="space-y-6 pb-10">
        
        {/* BUSCADOR E IDENTIDAD */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <StudentIdentity 
              student={student} 
              loading={loading} 
              cedulaBusqueda={cedulaBusqueda} 
              setCedulaBusqueda={setCedulaBusqueda}
              handleSearch={handleSearch} 
              mostrarResultado={mostrarResultado}
              setMostrarResultado={setMostrarResultado} 
              setPasoActual={setPasoActual}
              borrarEstudio={borrarEstudio} 
              setStudent={setStudent}
            />
        </section>

        {/* LISTADO DE CANDIDATOS */}
        {candidates.length > 0 && !student && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500 max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-5 px-1">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Coincidencias Encontradas ({candidates.length})
                </h3>
                <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidates.map((c: any) => (
                <div 
                  key={c.id}
                  onClick={() => selectCandidate(c)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200/80 cursor-pointer hover:border-[#d4a843] hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1e3a5f] font-bold text-xs group-hover:bg-[#1e3a5f] group-hover:text-[#d4a843] transition-colors shadow-sm">
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
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#1a2744] group-hover:text-[#d4a843] transition-all">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÁREA DE TRABAJO (FORMULARIO O RESULTADO) */}
        {student ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-4xl mx-auto space-y-4">
            {mostrarResultado ? (
              <>
                {/* COMPONENTE ANALISIS IA REAL INTEGRADO */}
                <AnalisisIA 
                  onGenerarAnalisisIA={handleGenerarAnalisisIA}
                  cargandoIA={cargandoIA}
                  resumenIA={resumenIA}
                />

                <ResultCard student={student} formData={formData} />
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-[#1e3a5f] h-1 w-full"></div>
                <StepForm 
                    student={student}
                    handleSubmit={handleSubmit} 
                    loading={loading} 
                    formData={formData} 
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

      <footer className="text-center py-4">
        <p className="text-[7px] font-bold text-slate-300 uppercase tracking-[0.4em]">
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