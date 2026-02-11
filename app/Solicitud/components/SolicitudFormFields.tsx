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
import { SolicitudSectionAction } from "./SolicitudSectionAction"
import { SolicitudEmailField } from "./SolicitudEmailField"
import { SeccionFormulario } from "./EncuestaUI"
import { 
  ClipboardList, 
  Edit3, 
  Lock, 
  Loader2, 
  Send, 
  AlertTriangle, 
  PlayCircle, 
  FileText 
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  const [isClient, setIsClient] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // 🟢 ESTATUS PARA SOLICITUD NUEVA
  const estatus = user?.estatus || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  
  // Pantalla de bienvenida
  const [hasStarted, setHasStarted] = useState(esPendiente);

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const estaBloqueadoTotalmente = estatus === 'En Revisión' || estatus === 'Aprobada';
  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);
  const esPromedioBajo = parseFloat(promedio) < 16.50 && parseFloat(promedio) > 0;

  // 🟢 SINCRONIZACIÓN: Iniciamos con la Sección 1 (materias) abierta por defecto
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(esPendiente ? "full" : "materias")

  const { toast } = useToast()
  const router = useRouter()

  const toggleSeccion = (seccion: string) => {
    if (esPendiente && !isEditing) return;
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
        toast({ title: "Éxito", description: "Solicitud enviada correctamente." })
        setIsEditing(false) 
        router.refresh()
        router.push("/perfil") 
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de comunicación con el servidor." })
    } finally {
      setIsPending(false)
    }
  }

  // 🟢 PANTALLA DE BIENVENIDA
  if (isClient && !hasStarted) {
    return (
      <div className="py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 max-w-sm mx-auto p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
             <FileText className="h-10 w-10 text-[#1e3a5f]" />
          </div>
          <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-tight">
            Nueva Postulación
          </h3>
          <p className="text-[11px] text-gray-500 mt-3 leading-relaxed italic">
            Bienvenido. Por favor complete los 4 pasos obligatorios del formulario para procesar su solicitud de beca.
          </p>
        </div>
        
        <Button 
          onClick={() => setHasStarted(true)}
          className="group px-12 py-8 bg-[#1e3a5f] text-[#d4a843] rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          <PlayCircle className="mr-3 h-5 w-5 animate-pulse" /> Comenzar Solicitud
        </Button>
      </div>
    )
  }

  return (
    <>
      <SolicitudBanners estatus={estatus} />

      <div className="flex justify-end items-center gap-3 mb-6">
          {esPendiente && !estaBloqueadoTotalmente && !isEditing && (
              <Button 
                  type="button" 
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-[#1e3a5f] border border-[#1e3a5f]/20 hover:border-[#1e3a5f] gap-2 font-black uppercase tracking-widest text-[10px] h-10 px-6"
              >
                  <Edit3 className="h-4 w-4" /> Habilitar Edición
              </Button>
          )}
      </div>

      {isEditing && (
        <div className="flex justify-end mb-6">
            <div className="bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide animate-pulse">
                <Lock className="h-3 w-3" /> Modo Edición Activo
            </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={`space-y-8 relative animate-in fade-in slide-in-from-top-4 duration-700 ${estaBloqueadoTotalmente ? "opacity-75 pointer-events-none" : ""}`}>
        
        {/* PASO 0: Email Institucional */}
        <SolicitudEmailField user={user} />
        
        <div className="w-full space-y-6">
            {/* 🟢 SECCIÓN 1: CARGA ACADÉMICA (Ahora en acordeón) */}
            <SolicitudSectionAction>
                <SolicitudMaterias 
                    disabled={isFormDisabled} 
                    materiasGuardadas={user?.materias_registradas} 
                    onChangeNotas={handleMateriasChange} 
                    isOpen={seccionAbierta === "materias" || esPendiente}
                    onToggle={() => toggleSeccion("materias")}
                />
            </SolicitudSectionAction>

            {/* SECCIÓN 2: DETALLES DE BECA */}
            <SolicitudSectionAction>
                <DetallesBeca 
                    disabled={isFormDisabled} 
                    promedio={promedio} 
                    user={user} 
                    isOpen={seccionAbierta === "detalles-beca" || esPendiente} 
                    onToggle={() => toggleSeccion("detalles-beca")}
                />
            </SolicitudSectionAction>

            {/* SECCIÓN 3: ENCUESTA SOCIOECONÓMICA */}
            <SeccionFormulario
                titulo="3. Investigación Socioeconómica"
                icono={ClipboardList}
                iconoBg="bg-[#1e3a5f]" // Unificado al azul institucional
                iconoColor="text-[#d4a843]"
                estaAbierto={seccionAbierta === "encuesta" || esPendiente}
                alAlternar={() => toggleSeccion("encuesta")}
            >
                <SolicitudEncuesta disabled={isFormDisabled} user={user} />
            </SeccionFormulario>

            {/* SECCIÓN 4: RECAUDOS DIGITALES */}
            <SolicitudArchivos disabled={isFormDisabled} user={user} />
        </div>

        {/* Notificaciones de Promedio y Botón de Envío */}
        <div className="sticky bottom-6 z-30 space-y-4">
            {isClient && esPromedioBajo && (
                <div className="bg-amber-50/90 backdrop-blur-sm border border-amber-200 p-5 rounded-[1.5rem] flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-xl">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-amber-900 tracking-tight">Análisis de Índice Académico</p>
                        <p className="text-[9px] text-amber-800 leading-relaxed font-medium">
                            Promedio inferior a 16.50: Su solicitud será sometida a una revisión especial por el comité de bienestar.
                        </p>
                    </div>
                </div>
            )}

            <Button 
                type="submit" 
                disabled={isPending || isFormDisabled} 
                className={`w-full py-9 rounded-[1.5rem] transition-all duration-300 transform active:scale-[0.98] font-black uppercase tracking-[0.2em] text-[11px] border-b-4 ${
                isFormDisabled 
                    ? "bg-slate-100 text-slate-300 border-slate-200 shadow-none" 
                    : "bg-[#1e3a5f] text-[#d4a843] shadow-[0_20px_50px_rgba(30,58,95,0.3)] hover:bg-[#254674] border-[#d4a843]"
                }`}
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Send className={`mr-2 h-5 w-5 ${isFormDisabled ? "text-slate-200" : ""}`} />
                )}
                {isPending ? "Procesando..." : isFormDisabled ? "Solicitud Protegida" : esPendiente ? "Actualizar Registro" : "Enviar Postulación"}
            </Button>
        </div>
      </form>
    </>
  )
}