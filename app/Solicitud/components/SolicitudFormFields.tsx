"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import { useToast } from "@/hooks/use-toast"
import { SolicitudArchivos } from "./SolicitudArchivos"
import { SolicitudMaterias } from "./SolicitudMaterias"
import { SolicitudEncuesta } from "./SolicitudEncuesta"
import { DetallesBeca } from "./DetallesBeca" 
import { SolicitudBanners } from "./SolicitudBanners"
import { SolicitudSectionAction } from "./SolicitudSectionAction"
import { SolicitudEmailField } from "./SolicitudEmailField"
import { SeccionFormulario } from "./EncuestaUI"
import { ClipboardList, Edit3, Lock, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  
  // 🟢 NUEVO ESTADO: Controla si el formulario está en modo edición global
  const [isEditing, setIsEditing] = useState(false)
  
  const estatus = user?.estatusBeca || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  const estaBloqueadoTotalmente = estatus === 'En Revisión';

  // Calculamos si el formulario debe comportarse como bloqueado (Read-Only)
  // Está bloqueado si: (Es revisión administrativa) O (Es pendiente Y NO se ha activado la edición)
  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);

  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(esPendiente ? "full" : "datos-beca")
  
  // Estado heredado (se mantiene para compatibilidad con hijos aunque no se use activamente en la lógica nueva)
  const [editingSection, setEditingSection] = useState<number | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  const toggleSeccion = (seccion: string) => {
    if (esPendiente) return;
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion)
  }

  // 🟢 OPTIMIZACIÓN: useCallback para evitar recrear la función en cada renderizado
  const handleMateriasChange = useCallback((notas: string[]) => {
    const notasNumericas = notas.map(n => parseFloat(n)).filter(n => !isNaN(n));
    setPromedio(notasNumericas.length > 0 
      ? (notasNumericas.reduce((a, b) => a + b, 0) / notasNumericas.length).toFixed(2) 
      : "0.00");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    formData.set('promedio', promedio) 
    if (user?.id) formData.append('user_id', user.id)

    try {
      const result = await enviarSolicitud(formData)
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        toast({ title: "Éxito", description: esPendiente ? "Solicitud actualizada correctamente." : "Solicitud enviada." })
        setIsEditing(false) // Volvemos a bloquear tras guardar
        router.refresh()
        if (!esPendiente) router.push("/solicitud-enviada")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de conexión." })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      <SolicitudBanners estatus={estatus} estaBloqueadoTotalmente={estaBloqueadoTotalmente} />

      {/* 🟢 BOTÓN DE DESBLOQUEO MAESTRO (Sin animaciones de entrada para mayor fluidez) */}
      {esPendiente && !estaBloqueadoTotalmente && !isEditing && (
        <div className="flex justify-end mb-6">
            <Button 
                onClick={() => setIsEditing(true)}
                className="bg-[#1e3a5f] text-[#d4a843] border border-[#d4a843] hover:bg-[#254674] shadow-lg gap-2 font-black uppercase tracking-widest text-xs h-10 px-6"
            >
                <Edit3 className="h-4 w-4" /> Habilitar Edición
            </Button>
        </div>
      )}

      {/* Si se está editando, mostramos un indicador visual (Sin animaciones) */}
      {isEditing && (
        <div className="flex justify-end mb-6">
            <div className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                <Lock className="h-3 w-3" /> Modo Edición Activo
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={`space-y-8 relative ${estaBloqueadoTotalmente ? "opacity-75 pointer-events-none" : ""}`}>
        
        <SolicitudEmailField user={user} />

        {/* Pasamos isFormDisabled a todos los componentes hijos */}
        
        <SolicitudSectionAction sectionNum={1} editingSection={null} setEditingSection={() => {}} estaBloqueadoTotalmente={estaBloqueadoTotalmente} esPendiente={esPendiente}>
          <SolicitudMaterias disabled={isFormDisabled} materiasGuardadas={user?.materias_registradas} onChangeNotas={handleMateriasChange} />
        </SolicitudSectionAction>

        <div className="w-full space-y-4">
            <SolicitudSectionAction sectionNum={2} editingSection={null} setEditingSection={() => {}} estaBloqueadoTotalmente={estaBloqueadoTotalmente} esPendiente={esPendiente}>
                <DetallesBeca disabled={isFormDisabled} promedio={promedio} user={user} isOpen={true} />
            </SolicitudSectionAction>

            <SeccionFormulario
                titulo="Investigación Socioeconómica"
                icono={ClipboardList}
                iconoBg="bg-[#d4a843]"
                iconoColor="text-[#1e3a5f]"
                estaAbierto={seccionAbierta === "encuesta" || esPendiente}
                alAlternar={() => toggleSeccion("encuesta")}
            >
                {/* SolicitudEncuesta ya no recibe props de edición, solo disabled */}
                <SolicitudEncuesta disabled={isFormDisabled} user={user} />
            </SeccionFormulario>
        </div>

        <SolicitudArchivos disabled={isFormDisabled} user={user} />

        {/* 🟢 BOTÓN DE ENVÍO INTEGRADO (Sin animaciones pesadas) */}
        <div className="sticky bottom-6 z-30">
            <Button 
                type="submit" 
                disabled={isPending || isFormDisabled} 
                className={`w-full py-8 transition-all duration-200 transform active:scale-[0.98] font-black uppercase tracking-widest border-b-4 ${
                isFormDisabled 
                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed shadow-none" 
                    : "bg-[#1e3a5f] text-[#d4a843] shadow-[0_20px_50px_rgba(30,58,95,0.3)] hover:bg-[#254674] border-[#d4a843]"
                }`}
            >
                {isPending ? (
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                <Send className={`mr-2 h-6 w-6 ${isFormDisabled ? "text-slate-300" : ""}`} />
                )}
                
                {isPending 
                ? "Procesando..." 
                : isFormDisabled 
                    ? "Solicitud Protegida" 
                    : esPendiente 
                    ? "Actualizar Solicitud" 
                    : "Enviar Solicitud de Beca"}
            </Button>
        </div>
      </form>
    </>
  )
}