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
import { ClipboardList, Edit3, Lock, Loader2, Send, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"

// 🟢 IMPORTS PARA EL PDF PROFESIONAL
import { PDFDownloadLink } from "@react-pdf/renderer"
import { PlanillaSolicitud } from "@/components/pdf/PlanillaSolicitud"

export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  
  const [isEditing, setIsEditing] = useState(false)
  
  const estatus = user?.estatusBeca || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  const estaBloqueadoTotalmente = estatus === 'En Revisión';

  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);

  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(esPendiente ? "full" : "datos-beca")
  
  const [editingSection, setEditingSection] = useState<number | null>(null)

  const { toast } = useToast()
  const router = useRouter()

  const toggleSeccion = (seccion: string) => {
    if (esPendiente) return;
    setSeccionAbierta(seccionAbierta === seccion ? null : seccion)
  }

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
        setIsEditing(false) 
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

      {/* 🟢 ACCIONES DE CABECERA (PDF + EDICIÓN) */}
      <div className="flex justify-end items-center gap-3 mb-6">
          
          {/* BOTÓN DE DESCARGA PROFESIONAL */}
          {!isEditing && user?.id && (
            <PDFDownloadLink
              document={<PlanillaSolicitud user={user} promedio={promedio} />}
              fileName={`Planilla_Solicitud_${user?.cedula || 'UNIMAR'}.pdf`}
              className="inline-flex items-center justify-center rounded-md text-xs font-black uppercase tracking-widest h-10 px-6 py-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white text-[#1e3a5f] border border-[#1e3a5f]/20 hover:bg-slate-50 hover:border-[#1e3a5f] shadow-sm gap-2"
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generando...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" /> Descargar Planilla
                  </>
                )
              }
            </PDFDownloadLink>
          )}

          {/* BOTÓN DE DESBLOQUEO MAESTRO */}
          {esPendiente && !estaBloqueadoTotalmente && !isEditing && (
              <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#1e3a5f] text-[#d4a843] border border-[#d4a843] hover:bg-[#254674] shadow-lg gap-2 font-black uppercase tracking-widest text-xs h-10 px-6"
              >
                  <Edit3 className="h-4 w-4" /> Habilitar Edición
              </Button>
          )}
      </div>

      {isEditing && (
        <div className="flex justify-end mb-6">
            <div className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                <Lock className="h-3 w-3" /> Modo Edición Activo
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={`space-y-8 relative ${estaBloqueadoTotalmente ? "opacity-75 pointer-events-none" : ""}`}>
        
        <SolicitudEmailField user={user} />
        
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
                <SolicitudEncuesta disabled={isFormDisabled} user={user} />
            </SeccionFormulario>
        </div>

        <SolicitudArchivos disabled={isFormDisabled} user={user} />

        <div className="sticky bottom-6 z-30">
            <Button 
                type="submit" 
                disabled={isPending || isFormDisabled} 
                className={`w-full py-8 transition-all duration-200 transform active:scale-[0.98] font-black uppercase tracking-widest border-b-4 ${
                isFormDisabled 
                    ? "bg-slate-100 text-slate-400 border-slate-200 shadow-none" 
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