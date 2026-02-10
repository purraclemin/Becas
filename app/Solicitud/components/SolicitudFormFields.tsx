"use client"

import { useState, useCallback, useEffect } from "react"
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
import { ClipboardList, Edit3, Lock, Loader2, Send, FileDown, Eye, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

// IMPORTS PARA EL PDF
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { PlanillaSolicitud } from "@/components/pdf/PlanillaSolicitud"

export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  
  // 🟢 ESTADO PARA EVITAR ERROR DE SERVIDOR
  const [isClient, setIsClient] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // 🟢 ESTADO PARA LA PREVISUALIZACIÓN
  const [showPreview, setShowPreview] = useState(false)

  // Activamos el cliente solo después del montaje
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const estatus = user?.estatusBeca || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  const estaBloqueadoTotalmente = estatus === 'En Revisión';

  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);
  
  // 🟢 LÓGICA DE PROMEDIO BAJO
  const esPromedioBajo = parseFloat(promedio) < 16.50 && parseFloat(promedio) > 0;

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
    
    // 🟢 VALIDACIÓN DE BLINDAJE: Verificar archivos obligatorios antes de enviar
    const formData = new FormData(e.currentTarget)
    const cedulaFile = formData.get('copia_cedula') as File;
    const fotoFile = formData.get('foto_carnet') as File;

    // Un usuario cumple si: Ya tiene URL guardada O está subiendo un archivo nuevo (> 0 bytes)
    const tieneCedula = !!user?.cedula_url || (cedulaFile && cedulaFile.size > 0);
    const tieneFoto = !!user?.foto_url || (fotoFile && fotoFile.size > 0);

    if (!tieneCedula || !tieneFoto) {
        toast({
            variant: "destructive",
            title: "Documentación Incompleta",
            description: "Es obligatorio adjuntar la Cédula y la Foto tipo carnet para enviar la solicitud.",
        });
        return; // 🛑 DETENEMOS EL ENVÍO AQUÍ
    }

    setIsPending(true)
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
        
        // 🟢 REDIRECCIÓN: Si era una actualización (esPendiente), enviamos al Perfil
        if (!esPendiente) {
            router.push("/solicitud-enviada")
        } else {
            router.push("/perfil")
        }
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

      {/* 🟢 PANEL DE ACCIONES SUPERIOR (PDF + EDICIÓN) */}
      <div className="flex justify-end items-center gap-3 mb-6">
          
          {isClient && !isEditing && user?.id && (
            <div className="flex gap-2">
                {/* BOTÓN VER PREVIA */}
                <Button 
                    onClick={() => setShowPreview(true)}
                    className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 gap-2 font-black uppercase tracking-widest text-[10px] h-10 px-4"
                >
                    <Eye className="h-4 w-4" /> Ver Previa
                </Button>

                {/* BOTÓN DESCARGAR */}
                <PDFDownloadLink
                  document={<PlanillaSolicitud user={user} promedio={promedio} />}
                  fileName={`Planilla_Solicitud_${user?.cedula || 'UNIMAR'}.pdf`}
                  className="inline-flex items-center justify-center rounded-md text-[10px] font-black uppercase tracking-widest h-10 px-4 py-2 bg-[#1e3a5f] text-[#d4a843] border border-[#d4a843] hover:bg-[#254674] shadow-sm gap-2"
                >
                  {({ loading }) =>
                    loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <FileDown className="h-4 w-4" /> Descargar
                      </>
                    )
                  }
                </PDFDownloadLink>
            </div>
          )}

          {esPendiente && !estaBloqueadoTotalmente && !isEditing && (
              <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-[#1e3a5f] border border-[#1e3a5f]/20 hover:border-[#1e3a5f] gap-2 font-black uppercase tracking-widest text-[10px] h-10 px-6"
              >
                  <Edit3 className="h-4 w-4" /> Habilitar Edición
              </Button>
          )}
      </div>

      {/* 🟢 VISOR DE PREVISUALIZACIÓN (MODAL) */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col p-4 md:p-10 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4 text-white">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#d4a843] rounded-lg">
                        <Eye className="h-5 w-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-tighter">Previsualización de Planilla</h2>
                        <p className="text-[10px] text-slate-400 font-medium italic">Revise que todos los datos sean correctos antes de imprimir.</p>
                    </div>
                </div>
                <Button variant="ghost" onClick={() => setShowPreview(false)} className="text-white hover:bg-white/10">
                    <X className="h-6 w-6" />
                </Button>
            </div>
            <div className="flex-1 bg-white rounded-2xl overflow-hidden shadow-2xl relative border-4 border-[#1e3a5f]">
                <PDFViewer width="100%" height="100%" showToolbar={false} className="border-none">
                    <PlanillaSolicitud user={user} promedio={promedio} />
                </PDFViewer>
            </div>
            <div className="mt-6 flex justify-center">
                <Button onClick={() => setShowPreview(false)} className="bg-[#d4a843] text-[#1e3a5f] font-black uppercase tracking-widest px-10 h-12 rounded-xl">
                    Entendido, cerrar vista
                </Button>
            </div>
        </div>
      )}

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

        <div className="sticky bottom-6 z-30 space-y-4">
            {/* 🟢 AVISO PREVENTIVO DE PROMEDIO BAJO */}
            {isClient && esPromedioBajo && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-amber-900 tracking-tight">Aviso de Rendimiento Académico</p>
                        <p className="text-[9px] text-amber-800 leading-relaxed italic">
                            Tu promedio actual (<b>{promedio} pts</b>) es inferior al mínimo regular de <b>16.50 pts</b>. 
                            Puedes enviar la solicitud, pero será marcada para una <b>revisión especial</b> por la comisión de becas.
                        </p>
                    </div>
                </div>
            )}

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