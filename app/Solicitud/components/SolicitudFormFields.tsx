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
import { ClipboardList, Edit3, Lock, Loader2, Send, AlertTriangle, PlayCircle, BookOpenCheck, CheckCircle2, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "0.00")
  const [isClient, setIsClient] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // 🟢 LÓGICA DE ESTATUS
  const estatus = user?.estatus || 'ninguna';
  const esPendiente = estatus === 'Pendiente';
  const esRenovacion = estatus === 'Renovacion';
  
  const [hasStarted, setHasStarted] = useState(esPendiente);

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const estaBloqueadoTotalmente = estatus === 'En Revisión';
  const isFormDisabled = estaBloqueadoTotalmente || (esPendiente && !isEditing);
  const esPromedioBajo = parseFloat(promedio) < 16.50 && parseFloat(promedio) > 0;

  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(esPendiente ? "full" : "datos-beca")

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
        toast({ title: "Éxito", description: "Solicitud procesada con éxito." })
        setIsEditing(false) 
        router.refresh()
        router.push("/perfil") 
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de conexión con el servidor." })
    } finally {
      setIsPending(false)
    }
  }

  // 🟢 PANTALLA DE INICIO (CARGA AL CLIC)
  if (isClient && !hasStarted) {
    return (
      <div className="py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mb-8 max-w-sm mx-auto p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
          <div className="h-20 w-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
             <BookOpenCheck className={`h-10 w-10 ${esRenovacion ? "text-violet-600" : "text-[#1e3a5f]"}`} />
          </div>
          <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-tight">
            {esRenovacion ? "Listo para Renovar" : "Iniciar Proceso de Beca"}
          </h3>
          <p className="text-[11px] text-gray-500 mt-3 leading-relaxed italic">
            {esRenovacion 
              ? "Actualizaremos tu carga académica para el nuevo periodo. Tus documentos y datos socioeconómicos se mantendrán vigentes." 
              : "Completa todos los pasos para postularte al programa de becas académicas de la Unimar."}
          </p>
        </div>
        
        <Button 
          onClick={() => setHasStarted(true)}
          className={`group px-12 py-8 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all hover:scale-105 active:scale-95 ${
            esRenovacion ? "bg-violet-600 text-white" : "bg-[#1e3a5f] text-[#d4a843]"
          }`}
        >
          <PlayCircle className="mr-3 h-5 w-5 animate-pulse" /> {esRenovacion ? "Cargar Notas Nuevas" : "Comenzar Ahora"}
        </Button>
      </div>
    )
  }

  return (
    <>
      <SolicitudBanners estatus={estatus} estaBloqueadoTotalmente={estaBloqueadoTotalmente} />

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

      <form onSubmit={handleSubmit} noValidate className={`space-y-12 relative animate-in fade-in slide-in-from-top-4 duration-700 ${estaBloqueadoTotalmente ? "opacity-75 pointer-events-none" : ""}`}>
        
        {/* 1. Email Institucional */}
        <SolicitudEmailField user={user} />
        
        {/* 2. Carga de Materias (Diseño Minimalista) */}
        <div className="bg-white rounded-3xl p-2 md:p-4 border border-slate-100 shadow-sm">
            <SolicitudSectionAction sectionNum={1} editingSection={null} setEditingSection={() => {}} estaBloqueadoTotalmente={estaBloqueadoTotalmente} esPendiente={esPendiente}>
                <SolicitudMaterias 
                    disabled={isFormDisabled} 
                    materiasGuardadas={esRenovacion ? [] : user?.materias_registradas} 
                    onChangeNotas={handleMateriasChange} 
                />
            </SolicitudSectionAction>
        </div>

        {/* 🟢 BLOQUEO DE SECCIONES EN RENOVACIÓN */}
        {esRenovacion ? (
            <div className="space-y-6">
                {/* Banner Informativo de Expediente */}
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center text-center gap-4 shadow-inner">
                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500 border border-emerald-100">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">Expediente Socioeconómico Activo</h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm mx-auto italic">
                            Su información de vivienda, entorno familiar y recaudos digitales ya reposan en nuestros archivos y se mantendrán vinculados a esta renovación.
                        </p>
                    </div>
                </div>

                {/* TRUCO DE MAGIA: Campos ocultos para el FormData */}
                <div className="hidden" aria-hidden="true">
                    <DetallesBeca disabled={false} promedio={promedio} user={user} isOpen={true} />
                    <SolicitudEncuesta disabled={false} user={user} />
                    <SolicitudArchivos disabled={false} user={user} />
                </div>
            </div>
        ) : (
            // Flujo Normal para Solicitudes Nuevas
            <div className="w-full space-y-6">
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

                <SolicitudArchivos disabled={isFormDisabled} user={user} />
            </div>
        )}

        {/* Botón de Envío y Alertas */}
        <div className="sticky bottom-6 z-30 space-y-4">
            {isClient && esPromedioBajo && (
                <div className="bg-amber-50/90 backdrop-blur-sm border border-amber-200 p-5 rounded-[1.5rem] flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-xl">
                    <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-amber-900 tracking-tight">Índice Académico Particular</p>
                        <p className="text-[9px] text-amber-800 leading-relaxed font-medium">
                            Su promedio actual requiere un análisis detallado por parte de la Coordinación de Bienestar Estudiantil.
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
                    : esRenovacion
                        ? "bg-violet-600 text-white shadow-[0_20px_50px_rgba(124,58,237,0.3)] hover:bg-violet-700 border-violet-800"
                        : "bg-[#1e3a5f] text-[#d4a843] shadow-[0_20px_50px_rgba(30,58,95,0.3)] hover:bg-[#254674] border-[#d4a843]"
                }`}
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    <Send className={`mr-2 h-5 w-5 ${isFormDisabled ? "text-slate-200" : ""}`} />
                )}
                {isPending ? "Procesando..." : isFormDisabled ? "Solicitud Protegida" : esPendiente ? "Actualizar Datos" : esRenovacion ? "Confirmar Renovación" : "Enviar Solicitud"}
            </Button>
        </div>
      </form>
    </>
  )
}