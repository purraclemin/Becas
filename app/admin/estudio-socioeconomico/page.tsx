"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, Loader2, Sparkles, User, ChevronRight, Mail, Fingerprint } from "lucide-react"
import { buscarEstudianteConEstudio, guardarOActualizarEstudio, borrarEstudio } from "@/lib/ActionsSocioeconomico"

// Componentes internos
import { ResultCard } from "@/components/socioeconomico/ResultCard"
import { StepForm } from "@/components/socioeconomico/StepForm"
import { SocioHeader } from "@/components/socioeconomico/SocioHeader"
import { StudentIdentity } from "@/components/socioeconomico/StudentIdentity"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function EstudioSocioeconomicoPage() {
  const [loading, setLoading] = useState(false)
  const [cedulaBusqueda, setCedulaBusqueda] = useState("")
  
  // Estados para manejo de selección
  const [student, setStudent] = useState<any>(null)
  const [candidates, setCandidates] = useState<any[]>([]) // Lista de coincidencias
  
  const [pasoActual, setPasoActual] = useState(1)
  const [mostrarResultado, setMostrarResultado] = useState(false)
  const [notificacion, setNotificacion] = useState<{msg: string, tipo: 'success' | 'error'} | null>(null)
  
  const [formData, setFormData] = useState<any>({
    tipo_vivienda: "", tenencia_vivienda: "", numero_habitaciones: "", material_vivienda: "",
    num_personas_hogar: "", num_personas_trabajan: "", dependencia_economica: "", carga_familiar_discapacidad: "",
    ingreso_mensual_familiar: "", egreso_mensual_aproximado: "", empleo_jefe_hogar: "", ayuda_otros_familiares: "",
    acceso_internet: "", equipo_computacion: "", servicio_agua_luz: "", transporte_universidad: "", 
    gastos_medicos_mensuales: "", pago_alquiler_residencia: "", hermanos_estudiando: "", beca_otra_institucion: ""
  })

  const notify = (msg: string, tipo: 'success' | 'error' = 'error') => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  };

  // --- LÓGICA DE SELECCIÓN DE CANDIDATO ---
  const selectCandidate = (selected: any) => {
    setStudent(selected);
    setCandidates([]); 
    
    if (selected.respuestas_json) {
      try {
        setFormData(JSON.parse(selected.respuestas_json));
        setMostrarResultado(true);
      } catch (e) {
        console.error("Error al leer datos guardados", e);
      }
    } else {
      setMostrarResultado(false);
      setPasoActual(1);
    }
  };

  // --- LÓGICA CENTRALIZADA DE BÚSQUEDA ---
  const performSearch = async (termino: string, isAuto: boolean = false) => {
    if (!termino || termino.length < 3) return;

    setLoading(true);
    if (!isAuto) await new Promise(r => setTimeout(r, 500)); 

    const res: any = await buscarEstudianteConEstudio(termino);
    const hasResults = res && (Array.isArray(res) ? res.length > 0 : true);

    if (hasResults) {
      if (Array.isArray(res)) {
        if (res.length === 1) {
          selectCandidate(res[0]);
        } else {
          setStudent(null); 
          setCandidates(res);
        }
      } else {
        selectCandidate(res);
      }
    } else {
      setStudent(null);
      setCandidates([]);
      if (!isAuto) notify("No se encontraron coincidencias.", "error");
    }
    setLoading(false);
  };

  // --- EFECTO: DEBOUNCE ---
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
  }, [cedulaBusqueda]);

  const handleSearch = async () => {
    if(!cedulaBusqueda) return notify("Por favor, ingrese un término.", "error");
    await performSearch(cedulaBusqueda, false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const dataToSave = { ...formData, student_id: student.id };
    const res = await guardarOActualizarEstudio(dataToSave);
    
    if (res.success) {
      notify("Estudio procesado exitosamente.", "success");
      if (res.dataUpdated) {
         setStudent((prev: any) => ({ ...prev, ...res.dataUpdated, respuestas_json: res.dataUpdated.respuestas_json }));
         setMostrarResultado(true);
      } else {
         await performSearch(student.cedula, true);
      }
    } else {
      notify("Error al guardar el estudio.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f8fafc] overflow-hidden selection:bg-[#d4a843] selection:text-[#1e3a5f]">
      
      {/* Fondo sutil */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Notificación */}
      {notificacion && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-5 duration-300">
           <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full shadow-2xl border backdrop-blur-md ${
             notificacion.tipo === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 'bg-rose-50/90 border-rose-200 text-rose-800'
           }`}>
            {notificacion.tipo === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <p className="text-[10px] font-black uppercase tracking-widest">{notificacion.msg}</p>
          </div>
        </div>
      )}

      {/* Overlay Carga */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-3">
             <Loader2 className="h-6 w-6 text-[#d4a843] animate-spin" />
             <p className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">Sincronizando...</p>
          </div>
        </div>
      )}

      <SocioHeader />

      <main className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto w-full space-y-10 pb-32">
        
        {/* IDENTIDAD / BÚSQUEDA */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
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

        {/* --- LISTA DE CANDIDATOS (Elegante & Pequeña) --- */}
        {candidates.length > 0 && !student && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6 px-1">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Coincidencias ({candidates.length})
                </h3>
                <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidates.map((c: any) => (
                <div 
                  key={c.id}
                  onClick={() => selectCandidate(c)}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:border-[#d4a843] hover:shadow-md transition-all group flex items-center justify-between overflow-hidden relative"
                >
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1e3a5f] font-bold text-xs group-hover:bg-[#1e3a5f] group-hover:text-[#d4a843] transition-colors">
                        {c.nombre?.[0]}{c.apellido?.[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-[#1e3a5f] uppercase tracking-tight group-hover:text-[#d4a843] transition-colors truncate">
                        {c.nombre} {c.apellido}
                      </h4>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                          <span className="text-[#d4a843]">V-{c.cedula}</span>
                          <span className="opacity-30">•</span>
                          <span className="flex items-center gap-1 lowercase font-medium opacity-70">
                            <Mail className="h-2.5 w-2.5" /> {c.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 relative z-10">
                    {c.estatus_solicitud && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                            c.estatus_solicitud === 'Pendiente' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {c.estatus_solicitud}
                        </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-[#d4a843] group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÁREA DE CONTENIDO */}
        {student ? (
          <div className="transition-all duration-700 animate-in fade-in slide-in-from-bottom-6 max-w-4xl mx-auto">
            {mostrarResultado ? (
              <ResultCard student={student} formData={formData} />
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-[#1e3a5f] h-1.5 w-full"></div>
                <StepForm 
                    pasoActual={pasoActual} 
                    setPasoActual={setPasoActual} 
                    handleNext={(e:any) => { e.preventDefault(); setPasoActual((p:number) => p + 1); }} 
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
            <div className="text-center py-20 animate-in zoom-in-95 duration-700">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-100">
                  <Fingerprint className="h-6 w-6 text-slate-200" />
              </div>
              <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sin consulta activa</h3>
            </div>
          )
        )}
      </main>

      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          Bienestar Estudiantil &bull; Unimar 2026
        </p>
      </footer>
    </div>
  )
}