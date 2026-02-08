"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, Loader2, Sparkles, User, ChevronRight } from "lucide-react"
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

  // NOTA: Eliminamos el objeto 'labels' porque ahora vive dentro de ResultCard.tsx

  const notify = (msg: string, tipo: 'success' | 'error' = 'error') => {
    setNotificacion({ msg, tipo });
    setTimeout(() => setNotificacion(null), 4000);
  };

  // --- LÓGICA DE SELECCIÓN DE CANDIDATO ---
  const selectCandidate = (selected: any) => {
    setStudent(selected);
    setCandidates([]); // Limpiamos la lista al seleccionar
    
    // Si ya tiene estudio, cargamos datos
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
    
    // Verificamos si hay resultados reales
    const hasResults = res && (Array.isArray(res) ? res.length > 0 : true);

    if (hasResults) {
      // 1. Caso: Múltiples resultados
      if (Array.isArray(res)) {
        if (res.length === 1) {
          selectCandidate(res[0]); // Solo uno, seleccionamos directo
        } else {
          setStudent(null); 
          setCandidates(res); // Varios, mostramos lista
        }
      } 
      // 2. Caso: Objeto único (Legacy)
      else {
        selectCandidate(res);
      }
    } else {
      setStudent(null);
      setCandidates([]);
      if (!isAuto) notify("No se encontraron coincidencias.", "error");
    }
    setLoading(false);
  };

  // --- EFECTO: BÚSQUEDA AUTOMÁTICA (DEBOUNCE) ---
  useEffect(() => {
    const term = cedulaBusqueda.trim();
    
    if (!term) {
        setStudent(null);
        setCandidates([]);
        setMostrarResultado(false);
        return;
    }

    const timeoutId = setTimeout(() => {
        performSearch(term, true);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [cedulaBusqueda]);

  // --- MANEJADOR MANUAL ---
  const handleSearch = async () => {
    if(!cedulaBusqueda) return notify("Por favor, ingrese un término de búsqueda.", "error");
    await performSearch(cedulaBusqueda, false);
  };

  // --- ENVÍO DEL FORMULARIO ---
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToSave = { 
        ...formData, 
        student_id: student.id 
    };

    const res = await guardarOActualizarEstudio(dataToSave);
    
    if (res.success) {
      notify("Estudio procesado exitosamente. Estatus actualizado.", "success");
      
      // Actualización optimista
      if (res.dataUpdated) {
         setStudent((prev: any) => ({
             ...prev,
             ...res.dataUpdated,
             respuestas_json: res.dataUpdated.respuestas_json
         }));
         setMostrarResultado(true);
      } else {
         await performSearch(student.cedula, true);
      }
    } else {
      notify("Ocurrió un error al guardar el estudio.", "error");
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-[#f8fafc] overflow-hidden selection:bg-[#d4a843] selection:text-[#1e3a5f]">
      
      {/* 1. FONDO INSTITUCIONAL SUTIL */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* 2. NOTIFICACIÓN */}
      {notificacion && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
           <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-md ${
             notificacion.tipo === 'success' 
               ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' 
               : 'bg-rose-50/90 border-rose-200 text-rose-800'
           }`}>
            {notificacion.tipo === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-xs font-black uppercase tracking-widest">{notificacion.msg}</p>
          </div>
        </div>
      )}

      {/* 3. OVERLAY DE CARGA */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl border border-slate-100 flex flex-col items-center gap-3">
             <Loader2 className="h-8 w-8 text-[#d4a843] animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e3a5f]">Procesando...</p>
          </div>
        </div>
      )}

      <SocioHeader />

      <main className="relative z-10 p-6 md:p-12 max-w-6xl mx-auto w-full space-y-10 pb-32">
        
        {/* BLOQUE DE IDENTIDAD / BÚSQUEDA */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden transition-all hover:shadow-md">
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

        {/* --- LISTA DE CANDIDATOS (Si hay múltiples resultados) --- */}
        {candidates.length > 0 && !student && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4 px-2">
                <Sparkles className="h-4 w-4 text-[#d4a843]" />
                <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">
                  Resultados Encontrados ({candidates.length})
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((c: any) => (
                <div 
                  key={c.id}
                  onClick={() => selectCandidate(c)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-[#d4a843] hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm bg-slate-50">
                      <AvatarFallback className="bg-[#1e3a5f] text-[#d4a843] text-xs font-bold">
                        {c.nombre?.substring(0, 1)}{c.apellido?.substring(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-[#1e3a5f] group-hover:text-[#d4a843] transition-colors">
                        {c.nombre} {c.apellido}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span>V-{c.cedula}</span>
                        {/* Estatus de solicitud */}
                        {c.estatus_solicitud && (
                             <span className={`px-1.5 py-0.5 rounded text-[9px] ml-1 ${
                                 c.estatus_solicitud === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                             }`}>
                                {c.estatus_solicitud}
                             </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#d4a843] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        {student ? (
          <div className="transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
            {mostrarResultado ? (
              // VISTA DE RESULTADOS (Ya no recibe 'labels')
              <div className="relative">
                 <div className="absolute -top-6 -left-6 -z-10"><Sparkles className="h-24 w-24 text-[#d4a843]/10" /></div>
                 <ResultCard student={student} formData={formData} />
              </div>
            ) : (
              // FORMULARIO
              <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="bg-[#1e3a5f] h-2 w-full"></div>
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
          // ESTADO VACÍO
          candidates.length === 0 && (
            <div className="text-center py-20 opacity-50 animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-[#1e3a5f] uppercase tracking-widest">Esperando consulta</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Busque por nombre, cédula o correo para gestionar un estudio.
              </p>
            </div>
          )
        )}

      </main>

      {/* FOOTER */}
      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
          Dirección de Bienestar Estudiantil &bull; Unimar 2026
        </p>
      </footer>
    </div>
  )
}