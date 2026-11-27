"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BellRing,
  CheckCircle2,
  XCircle,
  Archive,
  Building2,
  CalendarDays,
  Clock,
  GraduationCap,
  X,
  MessageSquareText
} from "lucide-react"
import {
  verificarEstadoLigeroEstudiante,
  type EstadoLigeroEstudianteResponse
} from "@/lib/ActionsStudent"

export interface PerfilRealtimeSnapshot {
  estatus: string
  observacionesAdmin: string | null
  departamentoAsignado: string | null
  semestre: number
  becaPerdida: boolean
  periodoActual: string
  tipoBeca: string | null
}

interface PerfilRealtimeWatcherProps {
  initialSnapshot: PerfilRealtimeSnapshot
}

interface NotificacionTiempoReal {
  titulo: string
  subtitulo: string
  estatus: string
  detalle?: string | null
  departamento?: string | null
  estiloBadge: string
  icono: "aprobada" | "rechazada" | "finalizada" | "convocado" | "revision" | "depto" | "academico"
}

const INTERVALO_POLLING_MS = 4000

const normalizarTexto = (valor: string | null | undefined): string => {
  return (valor ?? "").trim()
}

const construirEstiloNotificacion = (
  previo: PerfilRealtimeSnapshot,
  actual: EstadoLigeroEstudianteResponse
): NotificacionTiempoReal => {
  const estatusCambio =
    normalizarTexto(previo.estatus) !== normalizarTexto(actual.estatus)
  const deptoCambio =
    normalizarTexto(previo.departamentoAsignado) !==
    normalizarTexto(actual.departamentoAsignado)
  const semestreCambio = previo.semestre !== actual.semestre
  const periodoCambio =
    normalizarTexto(previo.periodoActual) !== normalizarTexto(actual.periodoActual)

  if (estatusCambio) {
    switch (actual.estatus) {
      case "Aprobada":
        return {
          titulo: "¡Tu Beca ha sido Aprobada!",
          subtitulo: actual.tipoBeca
            ? `Beneficio oficial activado en ${actual.tipoBeca}.`
            : "Secretaría General aprobó tu postulación en el periodo vigente.",
          estatus: "Aprobada",
          detalle: actual.observacionesAdmin,
          departamento: actual.departamentoAsignado,
          estiloBadge: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icono: "aprobada",
        }
      case "Rechazada":
        return {
          titulo: "Actualización de Dictamen",
          subtitulo: "Tu expediente ha sido actualizado a estatus Rechazada.",
          estatus: "Rechazada",
          detalle: actual.observacionesAdmin,
          estiloBadge: "bg-rose-100 text-rose-800 border-rose-300",
          icono: "rechazada",
        }
      case "Finalizada":
        return {
          titulo: "Ciclo de Beca Finalizado",
          subtitulo: "Cierre formal sin sanción académica ni disciplinaria.",
          estatus: "Finalizada",
          detalle: actual.observacionesAdmin,
          estiloBadge: "bg-teal-100 text-teal-800 border-teal-300",
          icono: "finalizada",
        }
      case "Convocado a Entrevista":
        return {
          titulo: "Has sido Convocado a Entrevista",
          subtitulo: "Bienestar Estudiantil emitió una citación presencial.",
          estatus: "Convocado a Entrevista",
          detalle: actual.observacionesAdmin,
          estiloBadge: "bg-orange-100 text-orange-800 border-orange-300",
          icono: "convocado",
        }
      case "En Revisión":
        return {
          titulo: "Expediente Remitido a Secretaría General",
          subtitulo: "Tu solicitud pasó a estatus En Revisión para dictamen final.",
          estatus: "En Revisión",
          detalle: actual.observacionesAdmin,
          estiloBadge: "bg-blue-100 text-blue-800 border-blue-300",
          icono: "revision",
        }
      default:
        return {
          titulo: "Actualización de Estatus",
          subtitulo: `Tu expediente ahora se encuentra en estatus ${actual.estatus}.`,
          estatus: actual.estatus,
          detalle: actual.observacionesAdmin,
          estiloBadge: "bg-amber-100 text-amber-800 border-amber-300",
          icono: "revision",
        }
    }
  }

  if (deptoCambio && actual.departamentoAsignado) {
    return {
      titulo: "Departamento Asignado Actualizado",
      subtitulo: previo.departamentoAsignado
        ? `Reasignado de ${previo.departamentoAsignado} a ${actual.departamentoAsignado}.`
        : `Adscrito oficialmente a ${actual.departamentoAsignado}.`,
      estatus: actual.estatus,
      departamento: actual.departamentoAsignado,
      detalle: actual.observacionesAdmin,
      estiloBadge: "bg-indigo-100 text-indigo-800 border-indigo-300",
      icono: "depto",
    }
  }

  if (semestreCambio || periodoCambio) {
    const nivelTexto =
      actual.semestre >= 13 ? "Egresado" : `${actual.semestre}° Trimestre`
    return {
      titulo: "Actualización Académica del Sistema",
      subtitulo: `Periodo activo: ${actual.periodoActual} • Nivel: ${nivelTexto}.`,
      estatus: actual.estatus,
      detalle: actual.observacionesAdmin,
      estiloBadge: "bg-blue-100 text-blue-800 border-blue-300",
      icono: "academico",
    }
  }

  return {
    titulo: "Nueva Observación de Bienestar Estudiantil",
    subtitulo: "Se registró una actualización en las notas de tu expediente.",
    estatus: actual.estatus,
    detalle: actual.observacionesAdmin,
    estiloBadge: "bg-amber-100 text-amber-800 border-amber-300",
    icono: "revision",
  }
}

export function PerfilRealtimeWatcher({
  initialSnapshot
}: PerfilRealtimeWatcherProps) {
  const router = useRouter()
  const [notificacion, setNotificacion] = useState<NotificacionTiempoReal | null>(null)

  const snapshotRef = useRef<PerfilRealtimeSnapshot>(initialSnapshot)
  const inFlightRef = useRef<boolean>(false)

  // Mantiene la referencia sincronizada cuando el Server Component se refresca
  useEffect(() => {
    snapshotRef.current = initialSnapshot
  }, [initialSnapshot])

  useEffect(() => {
    let desmontado = false

    const verificarCambios = async () => {
      if (desmontado || inFlightRef.current) return
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return
      }

      inFlightRef.current = true
      try {
        const res = await verificarEstadoLigeroEstudiante()
        if (desmontado || !res.ok) return

        const prev = snapshotRef.current
        const cambioDetectado =
          normalizarTexto(prev.estatus) !== normalizarTexto(res.estatus) ||
          normalizarTexto(prev.observacionesAdmin) !==
            normalizarTexto(res.observacionesAdmin) ||
          normalizarTexto(prev.departamentoAsignado) !==
            normalizarTexto(res.departamentoAsignado) ||
          prev.semestre !== res.semestre ||
          prev.becaPerdida !== res.becaPerdida ||
          normalizarTexto(prev.periodoActual) !== normalizarTexto(res.periodoActual)

        if (cambioDetectado) {
          const aviso = construirEstiloNotificacion(prev, res)

          snapshotRef.current = {
            estatus: res.estatus,
            observacionesAdmin: res.observacionesAdmin,
            departamentoAsignado: res.departamentoAsignado,
            semestre: res.semestre,
            becaPerdida: res.becaPerdida,
            periodoActual: res.periodoActual,
            tipoBeca: res.tipoBeca,
          }

          setNotificacion(aviso)

          // Sincroniza en tiempo real el Navbar / NavMenu / UserActions
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("unimar:estudiante-estatus-actualizado", {
                detail: res,
              })
            )
          }

          router.refresh()
        }
      } catch {
        // Reintentará silenciosamente en el próximo ciclo
      } finally {
        inFlightRef.current = false
      }
    }

    const timer = setInterval(() => {
      void verificarCambios()
    }, INTERVALO_POLLING_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void verificarCambios()
      }
    }

    const handleFocus = () => {
      void verificarCambios()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      desmontado = true
      clearInterval(timer)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [router])

  if (!notificacion) return null

  const renderIcono = () => {
    switch (notificacion.icono) {
      case "aprobada":
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      case "rechazada":
        return <XCircle className="h-5 w-5 text-rose-400" />
      case "finalizada":
        return <Archive className="h-5 w-5 text-teal-300" />
      case "convocado":
        return <CalendarDays className="h-5 w-5 text-[#d4a843]" />
      case "depto":
        return <Building2 className="h-5 w-5 text-[#d4a843]" />
      case "academico":
        return <GraduationCap className="h-5 w-5 text-[#d4a843]" />
      default:
        return <Clock className="h-5 w-5 text-[#d4a843]" />
    }
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-full sm:max-w-md z-50 animate-in slide-in-from-bottom-4 fade-in duration-300"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#1e3a5f] px-4 py-3 border-b-4 border-[#d4a843] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-[#d4a843]/40 flex items-center justify-center shrink-0">
              {renderIcono()}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#d4a843] flex items-center gap-1">
                <BellRing className="h-3 w-3 shrink-0" />
                <span>Actualización en Tiempo Real</span>
              </p>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight truncate">
                {notificacion.titulo}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setNotificacion(null)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 bg-[#f8fafc] space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${notificacion.estiloBadge}`}
            >
              Estatus: {notificacion.estatus}
            </span>
          </div>

          <p className="text-xs font-bold text-[#1e3a5f] leading-relaxed">
            {notificacion.subtitulo}
          </p>

          {notificacion.departamento && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-xs font-bold text-[#1e3a5f]">
              <Building2 className="h-4 w-4 text-[#d4a843] shrink-0" />
              <span>Departamento: {notificacion.departamento}</span>
            </div>
          )}

          {notificacion.detalle && (
            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-[#d4a843]/40 text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#1e3a5f]">
                <MessageSquareText className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                <span>Observación Oficial</span>
              </div>
              <p className="font-medium leading-relaxed whitespace-pre-line break-words">
                {notificacion.detalle}
              </p>
            </div>
          )}

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setNotificacion(null)}
              className="h-9 px-4 rounded-xl bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-[11px] font-black uppercase tracking-wider cursor-pointer transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
