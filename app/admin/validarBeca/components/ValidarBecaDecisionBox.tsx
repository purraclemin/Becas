"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck, MessageSquare, ShieldAlert,
  CheckCircle2, Loader2, Lock, ArrowRight,
  ClipboardEdit, Building2, CalendarDays, MailCheck, AlertTriangle, Send, XCircle, History,
  GraduationCap, Archive
} from "lucide-react"
import { validarCuposYRequisitos, DiagnosticoBeca } from "@/lib/ActionsBecaValidators"
import { DEPARTAMENTOS_UNIMAR_OFICIALES } from "@/lib/RecordAcademicoUtils"
import type { ResultadoActualizacionEstatus } from "@/lib/ActionsEstatusBeca"

interface SolicitudDecision {
  id: number | string;
  user_id?: number | string | null;
  cedula: string;
  estatus?: string;
  periodo_id?: number | string | null;
  observaciones_admin?: string | null;
  departamento_asignado?: string;
}

interface ValidarBecaDecisionBoxProps {
  solicitud: SolicitudDecision;
  esPeriodoActual: boolean;
  periodoActualId: number | null;
  observaciones: string;
  setObservaciones: (obs: string) => void;
  departamentoAsignado: string;
  setDepartamentoAsignado: (dept: string) => void;
  onStatusChange: (
    id: number,
    status: string,
    observaciones?: string,
    confirmacionEspecial?: boolean,
    departamentoAsignado?: string
  ) => Promise<ResultadoActualizacionEstatus>;
  onClose: () => void;
  onViewAcademic?: () => void;
  bloqueadoPorEstudio: boolean;
  esSecretariaGeneral?: boolean;
}

interface FeedbackAccion {
  tipo: 'success' | 'warning' | 'error';
  mensaje: string;
}

export function ValidarBecaDecisionBox({
  solicitud,
  esPeriodoActual,
  periodoActualId,
  observaciones,
  setObservaciones,
  departamentoAsignado,
  setDepartamentoAsignado,
  onStatusChange,
  onClose,
  onViewAcademic,
  bloqueadoPorEstudio,
  esSecretariaGeneral = false
}: ValidarBecaDecisionBoxProps) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [diagnostico, setDiagnostico] = useState<DiagnosticoBeca | null>(null)
  const [validandoCupo, setValidandoCupo] = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [guardandoDept, setGuardandoDept] = useState(false)
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false)
  const [responsabilidadAceptada, setResponsabilidadAceptada] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackAccion | null>(null)

  const [estatusLocal, setEstatusLocal] = useState<string>(solicitud.estatus || "")

  // Sincroniza estatus sin destruir el feedback activo
  useEffect(() => {
    setEstatusLocal(solicitud.estatus || "")
  }, [solicitud.id, solicitud.estatus])

  // Reinicia estados transitorios únicamente al cambiar de expediente (solicitud.id)
  useEffect(() => {
    setFeedback(null)
    setConfirmando(null)
    setDiagnostico(null)
    setMostrarAdvertencia(false)
    setResponsabilidadAceptada(false)
  }, [solicitud.id])

  const estatusActual = estatusLocal.trim()
  const instruccionesGuardadas = (observaciones || solicitud.observaciones_admin || "").trim()

  const estatusNormalizado = estatusActual
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  const esAprobadoOReprobado =
    estatusNormalizado.includes("aprob") ||
    estatusNormalizado.includes("rechaz") ||
    estatusNormalizado.includes("reprob") ||
    estatusNormalizado.includes("finaliz")

  const periodoSolicitudNum = Number(solicitud.periodo_id || 0)
  const periodoActualNum = Number(periodoActualId || 0)
  const esPeriodoDiferenteAlActual =
    !esPeriodoActual &&
    periodoActualNum > 0 &&
    periodoSolicitudNum > 0 &&
    periodoSolicitudNum !== periodoActualNum

  const mostrarAvisoPeriodoAnterior =
    esPeriodoDiferenteAlActual && !esAprobadoOReprobado

  const handleConfirmarCita = async () => {
    setProcesando(true)
    setFeedback(null)
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        'Convocado a Entrevista',
        observaciones,
        false,
        departamentoAsignado
      )

      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.error })
        return
      }

      setEstatusLocal('Convocado a Entrevista')
      setConfirmando(null)

      if (res?.emailEnviado === false) {
        setFeedback({
          tipo: 'warning',
          mensaje: res.emailError
            ? `Citación guardada en el perfil del estudiante, pero falló el correo: ${res.emailError}`
            : 'Citación guardada en el perfil del estudiante, pero no se pudo enviar el correo electrónico.',
        })
      } else {
        setFeedback({
          tipo: 'success',
          mensaje: 'Citación enviada al perfil del estudiante y notificada por correo electrónico.',
        })
      }
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al procesar la convocatoria.' })
    } finally {
      setProcesando(false)
    }
  }

  const handleRemitirARevision = async () => {
    setProcesando(true)
    setFeedback(null)
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        'En Revisión',
        observaciones,
        false,
        departamentoAsignado
      )

      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.error })
        return
      }

      setEstatusLocal('En Revisión')
      setConfirmando(null)
      if (res?.emailEnviado === false) {
        setFeedback({
          tipo: 'warning',
          mensaje: res.emailError
            ? `Expediente remitido a Secretaría General, pero falló el correo al estudiante: ${res.emailError}`
            : 'Expediente remitido a Secretaría General, pero no se pudo enviar el correo al estudiante.',
        })
      } else {
        setFeedback({
          tipo: 'success',
          mensaje: 'Expediente remitido a Secretaría General y notificado por correo electrónico al estudiante.',
        })
      }
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al actualizar la auditoría.' })
    } finally {
      setProcesando(false)
    }
  }

  const handleCambiarDepartamento = async () => {
    setGuardandoDept(true)
    setFeedback(null)
    try {
      const obsLimpia = observaciones.trim()
      const res = await onStatusChange(
        Number(solicitud.id),
        'Aprobada',
        obsLimpia !== '' ? obsLimpia : undefined,
        false,
        departamentoAsignado
      )
      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.error })
        return
      }
      if (res?.emailEnviado === false) {
        setFeedback({
          tipo: 'warning',
          mensaje: res.emailError
            ? `Departamento actualizado, pero falló el correo al estudiante: ${res.emailError}`
            : 'Departamento actualizado en el sistema, pero no se pudo enviar el correo electrónico.',
        })
        return
      }
      onClose()
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error al actualizar departamento.' })
    } finally {
      setGuardandoDept(false)
    }
  }

  const handleAprobarClick = async () => {
    if (!esSecretariaGeneral || estatusActual !== 'En Revisión') return

    setValidandoCupo(true)
    setMostrarAdvertencia(false)
    setFeedback(null)
    try {
      const periodoParaValidar = Number(periodoActualId || solicitud.periodo_id || 0)
      const res = await validarCuposYRequisitos(Number(solicitud.id), periodoParaValidar)
      setDiagnostico(res)
      if (res && res.apto === false) {
        setMostrarAdvertencia(true)
      }
      setConfirmando('Aprobada')
    } catch {
      setConfirmando('Aprobada')
    } finally {
      setValidandoCupo(false)
    }
  }

  const esBloqueoEstrictoAprobacion =
    diagnostico?.codigo === 'BECA_PERDIDA' || diagnostico?.codigo === 'CUPO_EXCEDIDO'

  const handleConfirmarDictamenSecretaria = async () => {
    if (!esSecretariaGeneral || !confirmando) return
    if (confirmando === 'Aprobada' && esBloqueoEstrictoAprobacion) {
      setFeedback({
        tipo: 'error',
        mensaje:
          diagnostico?.mensaje ||
          'Los cupos están llenos para esta modalidad en el periodo vigente. No es posible aprobar.',
      })
      return
    }
    setProcesando(true)
    setFeedback(null)
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        confirmando,
        observaciones,
        mostrarAdvertencia,
        departamentoAsignado
      )

      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.message || res.error })
        return
      }

      const estatusAplicado = confirmando
      setEstatusLocal(estatusAplicado)
      setConfirmando(null)

      if (res?.emailEnviado === false) {
        setFeedback({
          tipo: 'warning',
          mensaje: res.emailError
            ? `Dictamen "${estatusAplicado}" guardado en el sistema, pero falló el correo al estudiante: ${res.emailError}`
            : `Dictamen "${estatusAplicado}" guardado en el sistema, pero no se pudo enviar el correo electrónico al estudiante.`,
        })
        return
      }

      onClose()
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al registrar el dictamen.' })
    } finally {
      setProcesando(false)
    }
  }

  const irAEstudioSocioeconomico = (forzarEdicion: boolean = false) => {
    const cedulaEnc = encodeURIComponent(String(solicitud.cedula || '').trim())
    const suffixEditar = forzarEdicion ? '&editar=1' : ''
    router.push(`/admin/estudio-socioeconomico?search=${cedulaEnc}&abrirAuditoria=${cedulaEnc}${suffixEditar}`)
  }

  return (
    <div className="bg-[#1e3a5f]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden sticky top-24">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[#d4a843]" />
            <h3 className="text-[9px] font-black uppercase tracking-widest text-white">
              {esSecretariaGeneral ? "Panel de Dictamen" : "Panel de Gestión y Auditoría"}
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/10 text-[8px] font-black uppercase tracking-wider text-[#d4a843]">
            {esSecretariaGeneral ? "Secretaría General" : "Coordinación"}
          </span>
        </div>

        {mostrarAvisoPeriodoAnterior && (
          <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-[#d4a843]/30 flex items-start gap-2">
            <History className="h-3.5 w-3.5 text-[#d4a843] shrink-0 mt-0.5" />
            <p className="text-[9px] font-bold text-slate-200 leading-snug">
              Expediente en lista de espera de un periodo anterior.
            </p>
          </div>
        )}

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl border text-[10px] font-bold flex items-start gap-2 ${
              feedback.tipo === 'success'
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                : feedback.tipo === 'warning'
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-200'
                  : 'bg-rose-500/15 border-rose-400/40 text-rose-200'
            }`}
          >
            {feedback.tipo === 'success' ? (
              <MailCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle
                className={`h-4 w-4 shrink-0 mt-0.5 ${
                  feedback.tipo === 'warning' ? 'text-amber-400' : 'text-rose-400'
                }`}
              />
            )}
            <p className="leading-snug">{feedback.mensaje}</p>
          </div>
        )}

        {esSecretariaGeneral ? (
          estatusActual !== 'En Revisión' ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-2">
              <Lock className="h-5 w-5 text-[#d4a843] mx-auto" />
              <p className="text-[9px] font-black text-white uppercase tracking-widest">
                Expediente no disponible para dictamen
              </p>
              
            </div>
          ) : (
            <div className="space-y-3">
              {bloqueadoPorEstudio && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl border-l-4 border-l-amber-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-100 leading-snug">
                    Aviso: Este expediente en revisión aún no registra estudio socioeconómico oficial de Coordinación.
                  </p>
                </div>
              )}

              {mostrarAdvertencia && diagnostico && (
                <div className="space-y-2.5">
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-xl border-l-4 border-l-rose-500 space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {diagnostico.codigo === 'CUPO_EXCEDIDO' && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-rose-300">
                            Cupos Llenos — Aprobación Bloqueada
                          </p>
                        )}
                        {diagnostico.codigo === 'BECA_PERDIDA' && (
                          <p className="text-[9px] font-black uppercase tracking-widest text-rose-300">
                            Bloqueo Definitivo
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-white leading-snug">
                          {diagnostico.mensaje}
                        </p>
                        {diagnostico.codigo === 'CUPO_EXCEDIDO' && diagnostico.detalles && (
                          <p className="text-[9px] font-black uppercase tracking-wider text-rose-200 pt-0.5">
                            Ocupación actual: {diagnostico.detalles.actual} / {diagnostico.detalles.maximo} cupos
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {!esBloqueoEstrictoAprobacion && (
                    <label className="flex items-center gap-2.5 p-2.5 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={responsabilidadAceptada}
                        onChange={(e) => setResponsabilidadAceptada(e.target.checked)}
                        className="h-3.5 w-3.5 text-[#d4a843] rounded border-white/20 bg-transparent focus:ring-0"
                      />
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                        Acepto la responsabilidad de aprobar por excepción
                      </span>
                    </label>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-0.5">
                  <MessageSquare className="h-3 w-3 text-slate-400" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    Observaciones de Dictamen
                  </span>
                </div>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  disabled={procesando}
                  placeholder="Indique los motivos de aprobación o rechazo..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-colors resize-none h-20 placeholder:text-white/25 disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-0.5">
                  <Building2 className="h-3 w-3 text-slate-400" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    Departamento Asignado
                  </span>
                </div>
                <select
                  value={departamentoAsignado}
                  onChange={(e) => setDepartamentoAsignado(e.target.value)}
                  disabled={procesando}
                  className="w-full h-12 md:h-9 bg-[#1e3a5f] border border-white/10 rounded-xl px-2.5 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-colors"
                >
                  <option value="" disabled className="bg-[#1e3a5f] text-slate-400">
                    Seleccione un departamento...
                  </option>
                  {DEPARTAMENTOS_UNIMAR_OFICIALES.map((dept) => (
                    <option key={dept} value={dept} className="bg-[#1e3a5f] text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2.5 pt-1">
                {confirmando ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => {
                        setConfirmando(null)
                        setMostrarAdvertencia(false)
                        setDiagnostico(null)
                        setResponsabilidadAceptada(false)
                      }}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={
                        procesando ||
                        (confirmando === 'Aprobada' && esBloqueoEstrictoAprobacion) ||
                        (confirmando === 'Aprobada' &&
                          mostrarAdvertencia &&
                          !responsabilidadAceptada)
                      }
                      onClick={handleConfirmarDictamenSecretaria}
                      className={`flex-1 h-12 md:h-9 rounded-xl text-[9px] font-black uppercase shadow-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer ${
                        confirmando === 'Aprobada' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'
                      } text-white`}
                    >
                      {procesando ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Procesando...
                        </>
                      ) : confirmando === 'Aprobada' && diagnostico?.codigo === 'CUPO_EXCEDIDO' ? (
                        'Cupos Llenos'
                      ) : (
                        `Confirmar ${confirmando === 'Aprobada' ? 'Aprobación' : 'Rechazo'}`
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <button
                      type="button"
                      disabled={validandoCupo || procesando}
                      onClick={handleAprobarClick}
                      className="h-12 md:h-10 rounded-xl bg-[#d4a843] text-[#1e3a5f] text-[10px] font-black uppercase tracking-widest hover:bg-[#c2983a] transition-colors disabled:opacity-40 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {validandoCupo ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Validando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aprobar Solicitud
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={validandoCupo || procesando}
                      onClick={() => {
                        setDiagnostico(null)
                        setMostrarAdvertencia(false)
                        setResponsabilidadAceptada(false)
                        setConfirmando('Rechazada')
                      }}
                      className="h-12 md:h-9 rounded-xl bg-rose-500/15 text-rose-300 text-[10px] font-black uppercase border border-rose-500/30 hover:bg-rose-500/25 transition-colors tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar Solicitud
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <>
            {estatusActual === 'Pendiente' ? (
              <div className="mb-2 space-y-3">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">
                        Fase de Convocatoria
                      </p>
                      <p className="text-[10px] font-bold text-white/90 leading-tight">
                        Este estudiante se encuentra en estatus pendiente. Puede convocarlo a entrevista presencial para habilitar el baremo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Instrucciones de Citación
                    </span>
                  </div>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={procesando}
                    placeholder="Indique fecha, hora, lugar y recaudos para la entrevista presencial..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-colors resize-none h-24 placeholder:text-white/30 disabled:opacity-50"
                  />
                </div>

                {confirmando === 'Convocado a Entrevista' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => setConfirmando(null)}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={handleConfirmarCita}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase shadow-md shadow-blue-600/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {procesando ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Confirmar Cita'
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmando('Convocado a Entrevista')}
                    className="w-full flex items-center justify-between p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors group shadow-md shadow-blue-900/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white/10 rounded-lg">
                        <CalendarDays className="h-3.5 w-3.5 text-[#d4a843]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tight">
                        Convocar a Entrevista
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            ) : estatusActual === 'Rechazada' ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl border-l-4 border-l-rose-500 space-y-1.5">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                  Dictamen Emitido — Rechazada
                </p>
                <p className="text-[10px] font-bold text-white/90 leading-snug">
                  Esta solicitud fue rechazada de forma definitiva y se encuentra cerrada en auditoría.
                </p>
              </div>
            ) : estatusActual === 'Finalizada' ? (
              <div className="space-y-3">
                <div className="p-4 bg-teal-500/10 border border-teal-400/30 rounded-xl border-l-4 border-l-teal-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Archive className="h-3.5 w-3.5 text-teal-300 shrink-0" />
                    <p className="text-[9px] font-black text-teal-300 uppercase tracking-widest">
                      Expediente Cerrado — Finalizada
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-white/90 leading-snug">
                    Este beneficio culminó sin sanción disciplinaria ni académica (no aplica bloqueo Art. 28) y se encuentra cerrado en auditoría.
                  </p>
                </div>

                {instruccionesGuardadas && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-[#d4a843]" />
                      <span className="text-[8px] font-black text-[#d4a843] uppercase tracking-widest">
                        Motivo de Finalización
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 font-medium leading-relaxed whitespace-pre-line break-words">
                      {instruccionesGuardadas}
                    </p>
                  </div>
                )}
              </div>
            ) : estatusActual === 'Aprobada' ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl border-l-4 border-l-emerald-500">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">
                    Beneficio Vigente — Aprobada
                  </p>
                  <p className="text-[10px] font-bold text-white/90 leading-snug">
                    Coordinación puede asignar o actualizar el departamento de adscripción del becario.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Departamento Asignado
                    </span>
                  </div>
                  <select
                    value={departamentoAsignado}
                    onChange={(e) => setDepartamentoAsignado(e.target.value)}
                    className="w-full h-12 md:h-9 bg-[#1e3a5f] border border-white/10 rounded-xl px-2.5 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-colors"
                  >
                    <option value="" disabled className="bg-[#1e3a5f] text-slate-400">
                      Seleccione un departamento...
                    </option>
                    {DEPARTAMENTOS_UNIMAR_OFICIALES.map((dept) => (
                      <option key={dept} value={dept} className="bg-[#1e3a5f] text-white">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={guardandoDept}
                  onClick={handleCambiarDepartamento}
                  className="w-full h-12 md:h-9 rounded-xl bg-[#d4a843] text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest hover:bg-[#c2983a] transition-colors disabled:opacity-40 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {guardandoDept ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-3 w-3" />
                      Cambiar Departamento
                    </>
                  )}
                </button>
              </div>
            ) : bloqueadoPorEstudio ? (
              <div className="mb-2 space-y-3">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">
                        Estudiante Convocado
                      </p>
                      <p className="text-[10px] font-bold text-white/90 leading-tight">
                        Cita notificada. Realice el baremo socioeconómico tras culminar la entrevista presencial para remitir el expediente a Secretaría General.
                      </p>
                    </div>
                  </div>
                </div>

                {instruccionesGuardadas && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-[#d4a843]" />
                      <span className="text-[8px] font-black text-[#d4a843] uppercase tracking-widest">
                        Instrucciones Enviadas al Estudiante
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 font-medium leading-relaxed whitespace-pre-line">
                      {instruccionesGuardadas}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => irAEstudioSocioeconomico(false)}
                  className="w-full flex items-center justify-between p-3.5 bg-[#d4a843] hover:bg-[#c2983a] text-[#1e3a5f] rounded-xl transition-colors group shadow-md shadow-amber-900/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#1e3a5f]/10 rounded-lg">
                      <ClipboardEdit className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight">
                      Realizar Entrevista Ahora
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 bg-blue-500/10 border border-blue-400/30 rounded-xl border-l-4 border-l-[#d4a843]">
                  <p className="text-[9px] font-black text-[#d4a843] uppercase tracking-widest mb-0.5">
                    {estatusActual === 'En Revisión'
                      ? 'En Espera de Secretaría General'
                      : 'Auditoría Completada'}
                  </p>
                  <p className="text-[10px] font-bold text-white/90 leading-snug">
                    {estatusActual === 'En Revisión'
                      ? 'Este expediente está disponible en Secretaría General para su dictamen final (Aprobación o Rechazo).'
                      : 'Puede agregar observaciones técnicas de auditoría y remitir el expediente a Secretaría General.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => irAEstudioSocioeconomico(true)}
                  className="w-full flex items-center justify-between px-3.5 h-12 md:h-9 bg-white/5 hover:bg-white/10 text-white border border-white/15 rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardEdit className="h-3.5 w-3.5 text-[#d4a843]" />
                    <span className="text-[9px] font-black uppercase tracking-tight">
                      Actualizar Estudio Socioeconómico
                    </span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-[#d4a843] group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      Observaciones de Auditoría
                    </span>
                  </div>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={procesando}
                    placeholder="Notas técnicas de Coordinación para Secretaría General..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-colors resize-none h-20 placeholder:text-white/25 disabled:opacity-50"
                  />
                </div>

                {confirmando === 'En Revisión' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => setConfirmando(null)}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={handleRemitirARevision}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {procesando ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        'Confirmar'
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmando('En Revisión')}
                    className="w-full h-12 md:h-10 rounded-xl bg-[#d4a843] hover:bg-[#c2983a] text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {estatusActual === 'En Revisión'
                      ? 'Actualizar Observacion para Secretaría'
                      : 'Enviar a Revisión (Secretaría General)'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {onViewAcademic && (
          <div className="mt-4 pt-3.5 border-t border-white/10">
            <button
              type="button"
              onClick={onViewAcademic}
              className="w-full h-12 md:h-9 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#d4a843]/40 hover:border-[#d4a843] text-white transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0" />
                <span className="text-sm md:text-[10px] font-black uppercase tracking-wider">
                  Histórico Académico
                </span>
              </div>
              <ArrowRight className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
