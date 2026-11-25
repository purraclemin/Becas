"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck, MessageSquare, ShieldAlert,
  CheckCircle2, Loader2, Lock, ArrowRight,
  ClipboardEdit, Building2, CalendarDays, MailCheck, AlertTriangle, Send, XCircle
} from "lucide-react"
import { validarCuposYRequisitos, DiagnosticoBeca } from "@/lib/ActionsBecaValidators"
import type { ResultadoActualizacionEstatus } from "@/lib/ActionsEstatusBeca"

interface SolicitudDecision {
  id: number | string;
  cedula: string;
  estatus?: string;
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

  const [estatusLocal, setEstatusLocal] = useState<string>(solicitud.estatus || "");

  useEffect(() => {
    setEstatusLocal(solicitud.estatus || "");
    setFeedback(null);
    setConfirmando(null);
    setMostrarAdvertencia(false);
    setResponsabilidadAceptada(false);
  }, [solicitud.id, solicitud.estatus]);

  const estatusActual = estatusLocal.trim();
  const instruccionesGuardadas = (observaciones || solicitud.observaciones_admin || "").trim();

  // Acción de Coordinación: Convocar a Entrevista
  const handleConfirmarCita = async () => {
    setProcesando(true);
    setFeedback(null);
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        'Convocado a Entrevista',
        observaciones,
        false,
        departamentoAsignado
      );

      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.error });
        return;
      }

      setEstatusLocal('Convocado a Entrevista');
      setConfirmando(null);

      if (res?.emailEnviado === false) {
        setFeedback({
          tipo: 'warning',
          mensaje: res.emailError
            ? `Citación guardada en el perfil del estudiante, pero falló el correo: ${res.emailError}`
            : 'Citación guardada en el perfil del estudiante, pero no se pudo enviar el correo electrónico.',
        });
      } else {
        setFeedback({
          tipo: 'success',
          mensaje: 'Citación enviada al perfil del estudiante y notificada por correo electrónico.',
        });
      }
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al procesar la convocatoria.' });
    } finally {
      setProcesando(false);
    }
  };

  // Acción de Coordinación: Remitir o actualizar notas en 'En Revisión' para Secretaría General
  const handleRemitirARevision = async () => {
    setProcesando(true);
    setFeedback(null);
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        'En Revisión',
        observaciones,
        false,
        departamentoAsignado
      );

      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.error });
        return;
      }

      setEstatusLocal('En Revisión');
      setConfirmando(null);
      setFeedback({
        tipo: 'success',
        mensaje: 'Expediente remitido a Secretaría General en estatus En Revisión.',
      });
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al actualizar la auditoría.' });
    } finally {
      setProcesando(false);
    }
  };

  // Acción de Coordinación: Actualizar departamento de una beca ya aprobada
  const handleCambiarDepartamento = async () => {
    setGuardandoDept(true);
    setFeedback(null);
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        'Aprobada',
        observaciones || 'Actualización de departamento asignado',
        false,
        departamentoAsignado
      );
      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.error });
        return;
      }
      onClose();
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error al actualizar departamento.' });
    } finally {
      setGuardandoDept(false);
    }
  };

  // Acción exclusiva de Secretaría General: Validar cupos antes de aprobar
  const handleAprobarClick = async () => {
    if (!esSecretariaGeneral || estatusActual !== 'En Revisión') return;

    setValidandoCupo(true);
    setMostrarAdvertencia(false);
    setFeedback(null);
    try {
      const res = await validarCuposYRequisitos(Number(solicitud.id), Number(periodoActualId));
      setDiagnostico(res);
      if (res && res.apto === false) {
        setMostrarAdvertencia(true);
        setTimeout(() => setConfirmando('Aprobada'), 100);
      } else {
        setConfirmando('Aprobada');
      }
    } catch {
      setConfirmando('Aprobada');
    } finally {
      setValidandoCupo(false);
    }
  };

  // Acción exclusiva de Secretaría General: Confirmar Aprobación o Rechazo
  const handleConfirmarDictamenSecretaria = async () => {
    if (!esSecretariaGeneral || !confirmando) return;
    setProcesando(true);
    setFeedback(null);
    try {
      const res = await onStatusChange(
        Number(solicitud.id),
        confirmando,
        observaciones,
        mostrarAdvertencia,
        departamentoAsignado
      );

      if (res?.error) {
        setFeedback({ tipo: 'error', mensaje: res.message || res.error });
        return;
      }

      onClose();
    } catch {
      setFeedback({ tipo: 'error', mensaje: 'Error de conexión al registrar el dictamen.' });
    } finally {
      setProcesando(false);
    }
  };

  const irAEstudioSocioeconomico = () => {
    router.push(`/admin/estudio-socioeconomico?search=${solicitud.cedula}&abrirAuditoria=${solicitud.cedula}`);
  };

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

        {/* Feedback de operaciones */}
        {feedback && (
          <div
            className={`mb-4 p-3 rounded-xl border text-[10px] font-bold flex items-start gap-2 animate-in fade-in duration-300 ${
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

        {!esPeriodoActual ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Lock className="h-5 w-5 text-slate-500 mx-auto mb-2" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Periodo Finalizado
            </p>
          </div>
        ) : esSecretariaGeneral ? (
          /* ================================================================ */
          /* FLUJO EXCLUSIVO DE SECRETARÍA GENERAL (APROBAR / RECHAZAR)       */
          /* ================================================================ */
          estatusActual !== 'En Revisión' ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center space-y-2">
              <Lock className="h-5 w-5 text-[#d4a843] mx-auto" />
              <p className="text-[9px] font-black text-white uppercase tracking-widest">
                Expediente no disponible para dictamen
              </p>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Secretaría General solo puede aprobar o rechazar expedientes que se encuentren en estatus <strong>En Revisión</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              {bloqueadoPorEstudio && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl border-l-4 border-l-amber-400 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-amber-100 leading-snug">
                    Aviso: Este expediente en revisión aún no registra estudio socioeconómico oficial de Coordinación.
                  </p>
                </div>
              )}

              {mostrarAdvertencia && diagnostico && (
                <div className="space-y-2.5 animate-in zoom-in duration-300">
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl border-l-4 border-l-rose-500">
                    <div className="flex items-start gap-2.5">
                      <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
                      <p className="text-[10px] font-bold text-white">{diagnostico.mensaje}</p>
                    </div>
                  </div>
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
                </div>
              )}

              {/* Observaciones del dictamen */}
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
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-all resize-none h-20 placeholder:text-white/25 disabled:opacity-50"
                />
              </div>

              {/* Departamento asignado al aprobar */}
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
                  className="w-full h-12 md:h-9 bg-[#1e3a5f] border border-white/10 rounded-xl px-2.5 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-all"
                >
                  <option value="" disabled className="bg-[#1e3a5f] text-slate-400">Seleccione un departamento...</option>
                  <option value="Bienestar Estudiantil" className="bg-[#1e3a5f] text-white">Bienestar Estudiantil</option>
                  <option value="Secretaría General" className="bg-[#1e3a5f] text-white">Secretaría General</option>
                  <option value="Control de Estudios" className="bg-[#1e3a5f] text-white">Control de Estudios</option>
                  <option value="Decanato de Investigación" className="bg-[#1e3a5f] text-white">Servicio Comunitario</option>
                  <option value="Biblioteca" className="bg-[#1e3a5f] text-white">Biblioteca</option>
                  <option value="Centro de Tecnologías" className="bg-[#1e3a5f] text-white">Centro de Salud</option>
                </select>
              </div>

              <div className="grid gap-2.5 pt-1">
                {confirmando ? (
                  <div className="flex gap-2 animate-in zoom-in duration-300">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => { setConfirmando(null); setMostrarAdvertencia(false); }}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={procesando || (mostrarAdvertencia && !responsabilidadAceptada)}
                      onClick={handleConfirmarDictamenSecretaria}
                      className={`flex-1 h-12 md:h-9 rounded-xl text-[9px] font-black uppercase shadow-md transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 cursor-pointer ${
                        confirmando === 'Aprobada' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'
                      } text-white`}
                    >
                      {procesando ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Procesando...
                        </>
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
                      className="h-12 md:h-10 rounded-xl bg-[#d4a843] text-[#1e3a5f] text-[10px] font-black uppercase tracking-widest hover:bg-[#c2983a] transition-all disabled:opacity-40 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
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
                      onClick={() => setConfirmando('Rechazada')}
                      className="h-12 md:h-9 rounded-xl bg-rose-500/15 text-rose-300 text-[10px] font-black uppercase border border-rose-500/30 hover:bg-rose-500/25 transition-all tracking-widest cursor-pointer flex items-center justify-center gap-1.5"
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
          /* ================================================================ */
          /* FLUJO EXCLUSIVO DE COORDINACIÓN (SOLO GESTIÓN Y AUDITORÍA)       */
          /* ================================================================ */
          <>
            {estatusActual === 'Pendiente' ? (
              <div className="mb-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-0.5">Fase de Convocatoria</p>
                      <p className="text-[10px] font-bold text-white/90 leading-tight">
                        Este estudiante se encuentra en estatus pendiente. Debe convocarlo a una entrevista presencial para habilitar el baremo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Instrucciones de Citación</span>
                  </div>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={procesando}
                    placeholder="Indique fecha, hora, lugar y recaudos para la entrevista presencial..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-all resize-none h-24 placeholder:text-white/30 disabled:opacity-50"
                  />
                </div>

                {confirmando === 'Convocado a Entrevista' ? (
                  <div className="flex gap-2 animate-in zoom-in duration-300">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => setConfirmando(null)}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={handleConfirmarCita}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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
                    className="w-full flex items-center justify-between p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all group shadow-md shadow-blue-900/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-white/10 rounded-lg">
                        <CalendarDays className="h-3.5 w-3.5 text-[#d4a843]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tight">Convocar a Entrevista</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            ) : bloqueadoPorEstudio ? (
              <div className="mb-2 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Estudiante Convocado</p>
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
                  onClick={irAEstudioSocioeconomico}
                  className="w-full flex items-center justify-between p-3.5 bg-[#d4a843] hover:bg-[#c2983a] text-[#1e3a5f] rounded-xl transition-all group shadow-md shadow-amber-900/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#1e3a5f]/10 rounded-lg">
                      <ClipboardEdit className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight">Realizar Entrevista Ahora</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : estatusActual === 'Rechazada' ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl border-l-4 border-l-rose-500 space-y-1.5">
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">
                  Dictamen Emitido — Rechazada
                </p>
                <p className="text-[10px] font-bold text-white/90 leading-snug">
                  Esta solicitud fue rechazada por Secretaría General y se encuentra cerrada en auditoría.
                </p>
              </div>
            ) : estatusActual === 'Aprobada' ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl border-l-4 border-l-emerald-500">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">
                    Dictamen Emitido — Aprobada
                  </p>
                  <p className="text-[10px] font-bold text-white/90 leading-snug">
                    Aprobada por Secretaría General. Coordinación puede gestionar el departamento asignado al becario.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Departamento Asignado</span>
                  </div>
                  <select
                    value={departamentoAsignado}
                    onChange={(e) => setDepartamentoAsignado(e.target.value)}
                    className="w-full h-12 md:h-9 bg-[#1e3a5f] border border-white/10 rounded-xl px-2.5 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-all"
                  >
                    <option value="" disabled className="bg-[#1e3a5f] text-slate-400">Seleccione un departamento...</option>
                    <option value="Bienestar Estudiantil" className="bg-[#1e3a5f] text-white">Bienestar Estudiantil</option>
                    <option value="Secretaría General" className="bg-[#1e3a5f] text-white">Secretaría General</option>
                    <option value="Control de Estudios" className="bg-[#1e3a5f] text-white">Control de Estudios</option>
                    <option value="Decanato de Investigación" className="bg-[#1e3a5f] text-white">Servicio Comunitario</option>
                    <option value="Biblioteca" className="bg-[#1e3a5f] text-white">Biblioteca</option>
                    <option value="Centro de Tecnologías" className="bg-[#1e3a5f] text-white">Centro de Salud</option>
                  </select>
                </div>

                <button
                  type="button"
                  disabled={guardandoDept}
                  onClick={handleCambiarDepartamento}
                  className="w-full h-12 md:h-9 rounded-xl bg-[#d4a843] text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest hover:bg-[#c2983a] transition-all disabled:opacity-40 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
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
            ) : (
              /* Estudio completado en Coordinación: Remitir / Mantener en Revisión (SIN Aprobar ni Rechazar) */
              <div className="space-y-3">
                <div className="p-3.5 bg-blue-500/10 border border-blue-400/30 rounded-xl border-l-4 border-l-[#d4a843]">
                  <p className="text-[9px] font-black text-[#d4a843] uppercase tracking-widest mb-0.5">
                    {estatusActual === 'En Revisión'
                      ? 'En Espera de Secretaría General'
                      : 'Auditoría Completada'}
                  </p>
                  <p className="text-[10px] font-bold text-white/90 leading-snug">
                    {estatusActual === 'En Revisión'
                      ? 'Este expediente ya fue remitido a Secretaría General para su dictamen final (Aprobación o Rechazo).'
                      : 'Puede agregar observaciones técnicas de auditoría y remitir el expediente a Secretaría General.'}
                  </p>
                </div>

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
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm md:text-xs text-white outline-none focus:border-[#d4a843] transition-all resize-none h-20 placeholder:text-white/25 disabled:opacity-50"
                  />
                </div>

                {confirmando === 'En Revisión' ? (
                  <div className="flex gap-2 animate-in zoom-in duration-300">
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => setConfirmando(null)}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-all cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={handleRemitirARevision}
                      className="flex-1 h-12 md:h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
                    className="w-full h-12 md:h-10 rounded-xl bg-[#d4a843] hover:bg-[#c2983a] text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {estatusActual === 'En Revisión'
                      ? 'Actualizar Notas para Secretaría'
                      : 'Enviar a Revisión (Secretaría General)'}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}