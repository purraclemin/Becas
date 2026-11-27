'use client'

import React, { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FastForward,
  RotateCcw,
  CalendarDays,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  actualizarConfiguracionPruebas,
  avanzarSiguientePeriodoPruebas,
  restaurarPeriodoRealPruebas,
  obtenerConfiguracionActual,
} from '@/lib/ActionsAdmin'
import type { ModoPruebaStatus } from '@/lib/ModoPrueba'

interface FeedbackDevPanel {
  tipo: 'success' | 'error'
  mensaje: string
}

export default function AdminTestPanel() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [accionActiva, setAccionActiva] = useState<'avanzar' | 'restaurar' | 'bypass' | null>(null)
  const [status, setStatus] = useState<ModoPruebaStatus | null>(null)
  const [feedback, setFeedback] = useState<FeedbackDevPanel | null>(null)

  const cargarEstado = useCallback(async () => {
    try {
      const data = await obtenerConfiguracionActual()
      setStatus(data)
    } catch (error) {
      console.error('Error cargando estado DEV PANEL:', error)
    }
  }, [])

  useEffect(() => {
    void cargarEstado()
  }, [cargarEstado])

  const handleToggleBypass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const activar = e.target.checked
    setFeedback(null)
    setAccionActiva('bypass')

    const formData = new FormData()
    formData.append('modo_prueba', activar ? 'on' : 'off')

    startTransition(async () => {
      try {
        const res = await actualizarConfiguracionPruebas(formData)
        if (res.success) {
          await cargarEstado()
          router.refresh()
          setFeedback({
            tipo: 'success',
            mensaje: activar
              ? 'Bypass de reglas activado correctamente.'
              : 'Bypass desactivado y periodo real restaurado.',
          })
        } else {
          setFeedback({
            tipo: 'error',
            mensaje: res.error || 'No se pudo actualizar el bypass de reglas.',
          })
        }
      } catch {
        setFeedback({ tipo: 'error', mensaje: 'Error de conexión con el servidor.' })
      } finally {
        setAccionActiva(null)
      }
    })
  }

  const handleAvanzarSiguientePeriodo = () => {
    setFeedback(null)
    setAccionActiva('avanzar')

    startTransition(async () => {
      try {
        const res = await avanzarSiguientePeriodoPruebas()
        if (res.success) {
          await cargarEstado()
          router.refresh()
          const detalle = [
            `Activado ${res.periodoNuevoCodigo}`,
            typeof res.totalProcesados === 'number'
              ? `${res.totalProcesados} expedientes evaluados`
              : null,
            typeof res.estudiantesAvanzados === 'number' && res.estudiantesAvanzados > 0
              ? `${res.estudiantesAvanzados} alumnos avanzaron trimestre`
              : null,
          ]
            .filter((item): item is string => Boolean(item))
            .join(' • ')

          setFeedback({ tipo: 'success', mensaje: detalle })
        } else {
          setFeedback({
            tipo: 'error',
            mensaje: res.error || 'No se pudo avanzar al siguiente periodo.',
          })
        }
      } catch {
        setFeedback({
          tipo: 'error',
          mensaje: 'Error al ejecutar la transición al siguiente periodo.',
        })
      } finally {
        setAccionActiva(null)
      }
    })
  }

  const handleRestaurarPeriodoReal = () => {
    setFeedback(null)
    setAccionActiva('restaurar')

    startTransition(async () => {
      try {
        const res = await restaurarPeriodoRealPruebas()
        if (res.success) {
          await cargarEstado()
          router.refresh()
          setFeedback({
            tipo: 'success',
            mensaje: `Restaurado al periodo real ${res.periodoActualCodigo || ''}.`,
          })
        } else {
          setFeedback({
            tipo: 'error',
            mensaje: res.error || 'No se pudo restaurar el periodo real.',
          })
        }
      } catch {
        setFeedback({
          tipo: 'error',
          mensaje: 'Error al restaurar el periodo calendario.',
        })
      } finally {
        setAccionActiva(null)
      }
    })
  }

  const activo = Boolean(status?.activo)
  const haySimulacionPeriodo = Boolean(status?.periodoSimuladoCodigo)

  return (
    <div
      className={`p-3.5 md:p-3 border-2 border-dashed rounded-xl my-2 shadow-sm transition-all duration-300 ${
        activo || haySimulacionPeriodo
          ? 'border-emerald-500 bg-emerald-50/50'
          : 'border-[#d4a843]/70 bg-slate-50'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            className={`h-4 w-4 ${
              activo || haySimulacionPeriodo ? 'text-emerald-700' : 'text-[#1e3a5f]'
            }`}
          />
          <h3
            className={`font-black uppercase text-[10px] tracking-widest ${
              activo || haySimulacionPeriodo ? 'text-emerald-800' : 'text-[#1e3a5f]'
            }`}
          >
            Modo Desarrollador — Progresión Cronológica de Periodos
          </h3>

          {(activo || haySimulacionPeriodo) && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-black uppercase">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1e3a5f] text-white">
            <CalendarDays className="h-3 w-3 text-[#d4a843]" />
            <span>
              Periodo Activo: {status?.periodoActualCodigo || '...'}
            </span>
          </span>
          {haySimulacionPeriodo && (
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[9px]">
              Simulado
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        {/* Switch Bypass de Reglas */}
        <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
            Bypass de Reglas
          </span>
          <label className="relative inline-flex items-center cursor-pointer scale-90">
            <input
              type="checkbox"
              checked={activo}
              disabled={isPending}
              onChange={handleToggleBypass}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-slate-300 rounded-full peer peer-checked:bg-emerald-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
          </label>
        </div>

        {/* Acciones secuenciales de periodo */}
        <div className="flex flex-wrap items-center gap-2 flex-1 sm:flex-initial justify-end">
          <button
            type="button"
            onClick={handleAvanzarSiguientePeriodo}
            disabled={isPending || !status}
            className="h-10 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isPending && accionActiva === 'avanzar' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d4a843]" />
            ) : (
              <FastForward className="h-3.5 w-3.5 text-[#d4a843]" />
            )}
            <span>
              {isPending && accionActiva === 'avanzar'
                ? 'Procesando transición...'
                : `Avanzar al Siguiente Periodo (${status?.siguientePeriodoCodigo || '...'})`}
            </span>
          </button>

          <button
            type="button"
            onClick={handleRestaurarPeriodoReal}
            disabled={isPending || (!activo && !haySimulacionPeriodo)}
            className="h-10 md:h-9 px-3.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending && accionActiva === 'restaurar' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
            <span>Volver al Periodo Real</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-2.5 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${
            feedback.tipo === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {feedback.tipo === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.mensaje}</span>
        </div>
      )}
    </div>
  )
}
