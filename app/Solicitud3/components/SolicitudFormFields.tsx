"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import { useToast } from "@/hooks/use-toast"
import { SolicitudArchivos } from "./SolicitudArchivos"
import { SolicitudMaterias } from "./SolicitudMaterias"
import { SolicitudEncuesta } from "./SolicitudEncuesta"
import { DetallesBeca } from "./DetallesBeca" 
import { SolicitudBanners } from "./SolicitudBanners"
import { SolicitudEmailField } from "./SolicitudEmailField"
import { Loader2, Send, ChevronRight, ChevronLeft, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

// Importamos los módulos de apoyo
import { SolicitudFormWelcome } from "./SolicitudFormFieldsWelcome"
import { SolicitudPromedioAlert, SolicitudEditButton } from "./SolicitudFormFieldsAlerts"
import { StepTracker } from "./StepTracker"

export function SolicitudForm({ 
  user, 
  materiasDelPensum, 
  trimestreActual 
}: { 
  user: any, 
  materiasDelPensum?: any[], 
  trimestreActual?: any 
}) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  const [isClient, setIsClient] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [pasoActual, setPasoActual] = useState(1)
  
  const estatus = user?.estatus || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  const [hasStarted, setHasStarted] = useState(esPendiente);

  useEffect(() => { setIsClient(true) }, [])
  
  const estaBloqueadoTotalmente = estatus === 'En Revisión' || estatus === 'Aprobada';
  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);
  const esPromedioBajo = parseFloat(promedio) < 16 && parseFloat(promedio) > 0;

  const { toast } = useToast()
  const router = useRouter()

  const handleTrimestreChange = (trimestre: string) => {
    router.push(`/Solicitud?trimestre=${trimestre}`, { scroll: false });
  };

  const handleMateriasChange = useCallback((notas: string[]) => {
    const notasNumericas = notas.map(n => parseFloat(n)).filter(n => !isNaN(n));
    setPromedio(notasNumericas.length > 0 
      ? (notasNumericas.reduce((a, b) => a + b, 0) / notasNumericas.length).toFixed(2) 
      : "0.00");
  }, []);

  const nextStep = () => {
    if (pasoActual < 4) {
      setPasoActual(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (pasoActual > 1) {
      setPasoActual(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const form = e.currentTarget;
    const inputsObligatorios = Array.from(form.querySelectorAll('input[required], textarea[required], select[required]')) as HTMLInputElement[];

    let primerCampoInvalido: HTMLElement | null = null;

    inputsObligatorios.forEach((input: any) => {
      input.classList.remove('border-red-500', 'bg-red-50', 'ring-1', 'ring-red-200');
    });

    for (const input of inputsObligatorios) {
      if (!input.value || input.value.trim() === "") {
        if (!primerCampoInvalido) primerCampoInvalido = input;
        input.classList.add('border-red-500', 'bg-red-50', 'ring-1', 'ring-red-200');
      }
    }

    if (primerCampoInvalido) {
      toast({
        variant: "destructive",
        title: "Campos Requeridos",
        description: "Por favor complete toda la información obligatoria antes de finalizar.",
      });
      return;
    }

    setIsPending(true);
    const formData = new FormData(form);
    formData.set('promedio', promedio); 
    formData.set('trimestre_seleccionado', trimestreActual?.toString() || "");
    if (user?.id) formData.append('user_id', user.id);

    try {
      const result = await enviarSolicitud(formData);
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error });
      } else {
        toast({ title: "Éxito", description: "Solicitud enviada correctamente." });
        setIsEditing(false);
        router.refresh();
        router.push("/perfil"); 
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de comunicación con el servidor." });
    } finally {
      setIsPending(false);
    }
  }

  if (isClient && !hasStarted) {
    return <SolicitudFormWelcome onStart={() => setHasStarted(true)} />;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start w-full min-w-0">
      
      {/* SIDEBAR DE PASOS: Más estilizado y compacto */}
      <aside className="hidden xl:block w-[240px] shrink-0 sticky top-10">
        <StepTracker pasoActual={pasoActual} />
        
        <div className="mt-8 space-y-4">
          <SolicitudPromedioAlert isVisible={isClient && esPromedioBajo} />
          
          <div className="p-4 bg-[#1e3a5f]/5 rounded-[1.5rem] border border-[#1e3a5f]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#d4a843]" />
              <span className="text-[9px] font-black uppercase text-[#1e3a5f] tracking-widest">Seguridad</span>
            </div>
            <p className="text-[8px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter italic">
              Datos protegidos por protocolos de encriptación institucional.
            </p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL: Optimización de espacios para reducir el tamaño percibido */}
      <div className="flex-1 w-full min-w-0">
        <div className="mb-2 scale-[0.98] origin-left">
          <SolicitudBanners estatus={estatus} />
        </div>

        <div className="mb-3">
          <SolicitudEditButton 
            isPending={esPendiente} 
            isEditing={isEditing} 
            onEdit={() => setIsEditing(true)} 
          />
        </div>

        <form onSubmit={handleSubmit} noValidate className={`space-y-6 w-full relative animate-in fade-in slide-in-from-right-4 duration-700 ${estaBloqueadoTotalmente ? "opacity-75 pointer-events-none" : ""}`}>
          
          <div className="w-full scale-[0.99] origin-left">
            <SolicitudEmailField user={user} />
          </div>
          
          {/* Contenedor del Paso: Paddings reducidos para estética de alta densidad */}
          <div className="bg-white p-4 md:p-7 lg:p-9 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-slate-50 min-h-[500px] w-full relative overflow-hidden">
            
            <div className="w-full h-full transition-all duration-500">
              {pasoActual === 1 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
                  <SolicitudMaterias 
                    disabled={isFormDisabled} 
                    materiasGuardadas={user?.materias_registradas} 
                    materiasDelPensum={materiasDelPensum} 
                    onChangeTrimestre={handleTrimestreChange}
                    trimestreActual={trimestreActual}
                    onChangeNotas={handleMateriasChange} 
                    isOpen={true}
                    onToggle={() => {}}
                  />
                </div>
              )}

              {pasoActual === 2 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
                  <DetallesBeca 
                    disabled={isFormDisabled} 
                    promedio={promedio} 
                    user={user} 
                    isOpen={true} 
                    onToggle={() => {}}
                  />
                </div>
              )}

              {pasoActual === 3 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
                  <SolicitudEncuesta disabled={isFormDisabled} user={user} />
                </div>
              )}

              {pasoActual === 4 && (
                <div className="animate-in fade-in zoom-in-95 duration-500 w-full">
                  <SolicitudArchivos disabled={isFormDisabled} user={user} />
                </div>
              )}
            </div>

            {/* NAVEGACIÓN INFERIOR: Botones más finos y elegantes */}
            <div className="mt-14 pt-8 border-t border-slate-50 flex items-center justify-between w-full">
              <div>
                {pasoActual > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={prevStep}
                    className="text-[#1e3a5f] font-black uppercase tracking-[0.15em] text-[9px] hover:bg-slate-50 rounded-xl px-5 py-5 transition-all h-auto"
                  >
                    <ChevronLeft className="mr-2 h-3.5 w-3.5" /> Anterior
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {pasoActual < 4 ? (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-[#1e3a5f] text-white hover:bg-[#254674] shadow-lg shadow-blue-900/10 font-black uppercase tracking-[0.15em] text-[9px] rounded-xl px-9 py-5 transition-all active:scale-95 border-b-2 border-[#d4a843] h-auto"
                  >
                    Siguiente <ChevronRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isPending || isFormDisabled} 
                    className={`px-12 py-5 rounded-xl transition-all duration-300 font-black uppercase tracking-[0.15em] text-[9px] shadow-xl h-auto ${
                      isFormDisabled 
                        ? "bg-slate-100 text-slate-300 shadow-none" 
                        : "bg-[#1e3a5f] text-[#d4a843] shadow-blue-900/20 hover:bg-[#254674] border-b-2 border-[#d4a843]"
                    }`}
                  >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isPending ? "Procesando" : esPendiente ? "Actualizar" : "Finalizar Solicitud"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}