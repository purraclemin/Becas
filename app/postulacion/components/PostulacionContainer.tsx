"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  ClipboardList, 
  BookOpen, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Send,
  Eye,
  User,
  Mail
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"

// Componentes Modulares
import { StepMaterias } from "./StepMaterias"
import { StepDetalles } from "./StepDetalles"
import { StepEncuesta } from "./StepEncuesta"
import { StepArchivos } from "./StepArchivos"
import { StepResumen } from "./StepResumen"

const PASOS = [
  { id: 1, titulo: "Carga Académica", icon: BookOpen },
  { id: 2, titulo: "Detalles Beca", icon: LayoutDashboard },
  { id: 3, titulo: "Estudio Social", icon: ClipboardList },
  { id: 4, titulo: "Documentación", icon: Upload },
  { id: 5, titulo: "Resumen y Envío", icon: Eye },
]

// Definición de las pestañas internas del Paso 03 (Estudio Social)
const TABS_ENCUESTA = ["personal", "uni", "familia", "laboral", "ingresos", "hogar", "salud"];

export function PostulacionContainer({ 
  user, 
  materiasDelPensum, 
  trimestreActual,
  periodoIngreso 
}: { 
  user: any, 
  materiasDelPensum?: any[], 
  trimestreActual?: any,
  periodoIngreso?: string
}) {
  const [pasoActual, setPasoActual] = useState(1)
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  const [materiasValidas, setMateriasValidas] = useState(false) 
  const [detallesValidos, setDetallesValidos] = useState(false)
  const [encuestaValida, setEncuestaValida] = useState(false)
  const [tipoBecaSeleccionada, setTipoBecaSeleccionada] = useState<string>(user?.tipo_beca || "")
  
  // Estado maestro para la persistencia de datos del formulario
  const [formData, setFormData] = useState<any>(user || {});

  // Estado para controlar la pestaña activa de la encuesta desde el contenedor
  const [activeEncuestaTab, setActiveEncuestaTab] = useState("personal")

  const { toast } = useToast()
  const router = useRouter()
  const progreso = (pasoActual / PASOS.length) * 100

  // Función para capturar los datos actuales del DOM al estado maestro
  const syncFormData = () => {
    const form = document.getElementById("form-postulacion") as HTMLFormElement;
    if (form) {
      const formObj = new FormData(form);
      const data: any = { ...formData };
      formObj.forEach((value, key) => {
        data[key] = value;
      });
      setFormData(data);
    }
  };

  // Lógica de Navegación Inteligente con Sincronización
  const handleSiguiente = () => {
    syncFormData(); // Guardar información antes de avanzar

    // Si estamos en el Paso 3, navegamos primero por sus pestañas internas
    if (pasoActual === 3) {
      const currentIndex = TABS_ENCUESTA.indexOf(activeEncuestaTab);
      if (currentIndex < TABS_ENCUESTA.length - 1) {
        setActiveEncuestaTab(TABS_ENCUESTA[currentIndex + 1]);
        return; // Detenemos aquí para no pasar al paso 4
      }
    }
    
    if (pasoActual < PASOS.length) setPasoActual(prev => prev + 1)
  }

  const handleAnterior = () => {
    syncFormData(); // Guardar información antes de retroceder

    // Si estamos en el Paso 3, retrocedemos por las pestañas internas primero
    if (pasoActual === 3) {
      const currentIndex = TABS_ENCUESTA.indexOf(activeEncuestaTab);
      if (currentIndex > 0) {
        setActiveEncuestaTab(TABS_ENCUESTA[currentIndex - 1]);
        return; // Detenemos aquí para no volver al paso 2
      }
    }

    if (pasoActual > 1) setPasoActual(prev => prev - 1)
  }

  const handleTrimestreChange = (trimestre: string) => {
    router.push(`/postulacion?trimestre=${trimestre}`, { scroll: false });
  };

  const handleMateriasChange = useCallback((notas: string[]) => {
    const notasNumericas = notas.map(n => parseFloat(n)).filter(n => !isNaN(n));
    setPromedio(notasNumericas.length > 0 
      ? (notasNumericas.reduce((a, b) => a + b, 0) / notasNumericas.length).toFixed(2) 
      : "0.00");
  }, []);

  async function handleSubmit() {
    syncFormData();
    const form = document.getElementById("form-postulacion") as HTMLFormElement;
    if (!form) return;

    setIsPending(true);
    // Como los componentes nunca se destruyen del todo (solo se ocultan), FormData captura todos los inputs de todos los pasos
    const finalFormData = new FormData(form);
    finalFormData.set('promedio', promedio); 
    finalFormData.set('trimestre_seleccionado', trimestreActual?.toString() || "");
    if (tipoBecaSeleccionada) finalFormData.set('tipo_beca', tipoBecaSeleccionada);
    if (user?.id) finalFormData.append('user_id', user.id);

    try {
      const result = await enviarSolicitud(finalFormData);
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Éxito", description: "Postulación enviada correctamente." });
        router.refresh();
        router.push("/perfil"); 
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de comunicación." });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex absolute inset-0 bg-white selection:bg-[#d4a843]/30 overflow-hidden">
      
      {/* SIDEBAR COMPACTO */}
      <aside className="w-56 bg-[#1e3a5f] flex flex-col relative overflow-hidden flex-shrink-0 h-full border-r border-white/5">
        <div className="p-4 relative z-10 flex-1">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="bg-[#d4a843] p-1.5 rounded-lg">
              <GraduationCap className="h-4 w-4 text-[#1e3a5f]" />
            </div>
            <div>
              <h2 className="text-white font-black text-[10px] uppercase tracking-tighter leading-none">Unimar</h2>
              <p className="text-[#d4a843] text-[7px] font-bold uppercase tracking-[0.15em]">Becas 2026</p>
            </div>
          </div>

          <nav className="space-y-2.5">
            {PASOS.map((paso) => {
              const Icono = paso.icon
              const activo = pasoActual === paso.id
              const completado = pasoActual > paso.id

              return (
                <div key={paso.id} className={cn(
                    "flex items-center gap-3 transition-all duration-300", 
                    activo ? "opacity-100 translate-x-1" : "opacity-30"
                )}>
                  <div className={cn(
                    "h-6 w-6 rounded-lg flex items-center justify-center border-2 transition-all", 
                    activo ? "bg-[#d4a843] border-[#d4a843] shadow-md shadow-[#d4a843]/20" : 
                    completado ? "bg-green-500 border-green-500" : "border-white/10"
                  )}>
                    {completado ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Icono className={cn("h-3 w-3", activo ? "text-[#1e3a5f]" : "text-white")} />}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn("text-[7px] font-black uppercase tracking-widest leading-none", activo ? "text-[#d4a843]" : "text-white/50")}>Paso 0{paso.id}</span>
                    <span className="text-white font-bold text-[9px] uppercase tracking-tight leading-none mt-1">{paso.titulo}</span>
                  </div>
                </div>
              )
            })}
          </nav>
        </div>

        <div className="p-4 bg-[#1a3354]">
          <div className="flex justify-between text-[7px] font-black uppercase text-white/30 mb-1 tracking-widest">
            <span>Progreso</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <Progress value={progreso} className="h-1 bg-white/10 rounded-full" />
        </div>
      </aside>

      {/* ÁREA DE TRABAJO COMPACTA */}
      <section className="flex-1 flex flex-col min-w-0 bg-slate-50 relative h-full">
        
        {/* Cabecera Reducida */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-5 flex-shrink-0">
          <div>
            <h1 className="text-[#1e3a5f] font-black text-xs uppercase tracking-tight leading-none">
                {PASOS.find(p => p.id === pasoActual)?.titulo}
            </h1>
            <p className="text-slate-400 text-[7px] font-bold uppercase tracking-widest leading-none mt-1">
                {periodoIngreso || 'Postulación Institucional'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-center min-w-[60px]">
              <span className="block text-[5px] font-black text-slate-400 uppercase leading-none mb-0.5">Promedio</span>
              <span className="text-[10px] font-black text-[#1e3a5f]">{promedio}</span>
            </div>
          </div>
        </header>

        {/* Contenido Central Optimizado */}
        <div className="flex-1 overflow-hidden p-3 lg:p-4 flex flex-col">
          <div className="max-w-5xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            
            {/* Barra de Información Compacta */}
            {user && (
              <div className="bg-[#1e3a5f]/5 px-3 py-2 border-b border-[#1e3a5f]/10 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-[#1e3a5f]" />
                  <p className="text-[10px] font-bold text-[#1e3a5f] truncate max-w-[200px]">{user.nombre} {user.apellido}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-[#d4a843]" />
                  <p className="text-[10px] font-bold text-[#1e3a5f] truncate max-w-[200px]">{user.email || user.correo || "Sin correo"}</p>
                </div>
              </div>
            )}

             <form id="form-postulacion" noValidate onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex flex-col min-h-0 p-4 lg:p-5 overflow-y-auto custom-scrollbar">
                    {/* Se mantienen todos los componentes renderizados usando hidden para preservar los datos de los inputs nativos y archivos */}
                    <div className={cn("flex-1 flex flex-col min-h-0", pasoActual === 1 ? "flex" : "hidden")}>
                      <StepMaterias 
                        disabled={isPending} 
                        materiasDelPensum={materiasDelPensum} 
                        trimestreActual={trimestreActual} 
                        onChangeTrimestre={handleTrimestreChange} 
                        onChangeNotas={handleMateriasChange} 
                        materiasGuardadas={formData?.materias_registradas || user?.materias_registradas} 
                        user={formData}
                        onValidationChange={setMateriasValidas}
                      />
                    </div>

                    <div className={cn("flex-1 flex flex-col min-h-0", pasoActual === 2 ? "flex" : "hidden")}>
                      <StepDetalles 
                        disabled={isPending} 
                        user={formData} 
                        onTipoBecaChange={setTipoBecaSeleccionada}
                        tipoBecaSeleccionada={tipoBecaSeleccionada}
                        promedio={promedio}
                        onValidationChange={setDetallesValidos}
                      />
                    </div>

                    <div className={cn("flex-1 flex flex-col min-h-0", pasoActual === 3 ? "flex" : "hidden")}>
                      <StepEncuesta 
                        disabled={isPending} 
                        user={formData} 
                        activeTab={activeEncuestaTab}
                        onTabChange={setActiveEncuestaTab}
                        onValidationChange={setEncuestaValida}
                      />
                    </div>

                    <div className={cn("flex-1 flex flex-col min-h-0", pasoActual === 4 ? "flex" : "hidden")}>
                      <StepArchivos 
                        disabled={isPending} 
                        tipoBeca={tipoBecaSeleccionada} 
                      />
                    </div>

                    <div className={cn("flex-1 flex flex-col min-h-0", pasoActual === 5 ? "flex" : "hidden")}>
                      <StepResumen 
                        user={formData} 
                        promedio={promedio} 
                        trimestre={trimestreActual} 
                        tipoBeca={tipoBecaSeleccionada}
                      />
                    </div>
                </div>
             </form>
          </div>
        </div>

        {/* FOOTER COMPACTO */}
        <footer className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-5 flex-shrink-0 w-full">
          <Button 
            variant="ghost" 
            onClick={handleAnterior} 
            disabled={(pasoActual === 1 && activeEncuestaTab === "personal") || isPending} 
            className="rounded-lg h-8 px-4 font-black uppercase text-[8px] tracking-widest text-[#1e3a5f]"
          >
            <ArrowLeft className="mr-2 h-3 w-3" /> Anterior
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-bold text-[7px] uppercase tracking-widest">
                {pasoActual} / {PASOS.length}
            </span>
            <Button 
              onClick={pasoActual === PASOS.length ? handleSubmit : handleSiguiente}
              disabled={
                isPending || 
                (pasoActual === 1 && !materiasValidas) || 
                (pasoActual === 2 && !detallesValidos) ||
                (pasoActual === 3 && !encuestaValida)
              }
              className="bg-[#1e3a5f] hover:bg-[#254674] text-white rounded-lg h-8 px-5 font-black uppercase text-[8px] tracking-widest shadow-sm transition-all active:scale-95 group disabled:opacity-50"
            >
              {isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : pasoActual === PASOS.length ? <Send className="mr-2 h-3 w-3" /> : null}
              {pasoActual === PASOS.length ? (isPending ? "Enviando..." : "Finalizar") : "Siguiente"}
              {pasoActual !== PASOS.length && <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />}
            </Button>
          </div>
        </footer>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  )
}