"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, MessageSquare, ShieldAlert, 
  CheckCircle2, Loader2, Lock, ArrowRight,
  ClipboardEdit
} from "lucide-react"
import { validarCuposYRequisitos } from "@/lib/ActionsBecaValidators"

export function SolicitudAuditoriaPanelDecision({ 
  solicitud, 
  esPeriodoActual, 
  periodoActualId, 
  observaciones, 
  setObservaciones, 
  onStatusChange, 
  onClose,
  bloqueadoPorEstudio // Recibimos la señal de seguridad del orquestador
}: any) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [diagnostico, setDiagnostico] = useState<any>(null)
  const [validandoCupo, setValidandoCupo] = useState(false)
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false)
  const [responsabilidadAceptada, setResponsabilidadAceptada] = useState(false)

  const handleAprobarClick = async () => {
    // 🚨 Doble verificación de seguridad
    if (bloqueadoPorEstudio) return;

    setValidandoCupo(true);
    setMostrarAdvertencia(false);
    try {
      const res = await validarCuposYRequisitos(Number(solicitud.id), Number(periodoActualId));
      setDiagnostico(res);
      if (res && res.apto === false) {
        setMostrarAdvertencia(true);
        setTimeout(() => setConfirmando('Aprobada'), 100);
      } else {
        setConfirmando('Aprobada');
      }
    } catch (error) {
      setConfirmando('Aprobada');
    } finally {
      setValidandoCupo(false);
    }
  };

  /**
   * Redirección estratégica al módulo socioeconómico
   * Pasa la cédula como parámetro para disparar la búsqueda automática.
   */
  const irAEstudioSocioeconomico = () => {
    router.push(`/admin/estudio-socioeconomico?search=${solicitud.cedula}`);
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden sticky top-24">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-5 w-5 text-[#d4a843]" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Panel de Decisión</h3>
        </div>

        {esPeriodoActual ? (
          <>
            {/* 🚨 BLOQUE DE SEGURIDAD: FALTA DE ESTUDIO SOCIOECONÓMICO */}
            {bloqueadoPorEstudio ? (
              <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Acción Restringida</p>
                      <p className="text-[11px] font-bold text-white/90 leading-tight">
                        No se puede aprobar esta beca sin un baremo socioeconómico validado por el administrador.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={irAEstudioSocioeconomico}
                  className="w-full flex items-center justify-between p-4 bg-[#d4a843] hover:bg-[#c2983a] text-[#1a2744] rounded-xl transition-all group shadow-lg shadow-amber-900/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1a2744]/10 rounded-lg">
                      <ClipboardEdit className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tight">Realizar Baremo Ahora</span>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                {mostrarAdvertencia && diagnostico && (
                  <div className="mb-6 space-y-3 animate-in zoom-in duration-300">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl border-l-4 border-l-rose-500">
                      <div className="flex items-start gap-3">
                        <ShieldAlert className="h-6 w-6 text-rose-500 shrink-0" />
                        <p className="text-[11px] font-bold text-white">{diagnostico.mensaje}</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={responsabilidadAceptada} 
                        onChange={(e) => setResponsabilidadAceptada(e.target.checked)} 
                        className="h-4 w-4 text-[#d4a843] rounded border-white/20 bg-transparent focus:ring-0" 
                      />
                      <span className="text-[9px] font-black text-white uppercase tracking-tighter">Acepto la responsabilidad</span>
                    </label>
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 px-1">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Observaciones</span>
                  </div>
                  <textarea 
                    value={observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Indique los motivos de su decisión..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-[#d4a843] transition-all resize-none h-24 placeholder:text-white/20"
                  />
                </div>

                <div className="grid gap-3">
                  {confirmando ? (
                    <div className="flex gap-2 animate-in zoom-in duration-300">
                      <button 
                        onClick={() => { setConfirmando(null); setMostrarAdvertencia(false); }} 
                        className="flex-1 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        disabled={mostrarAdvertencia && !responsabilidadAceptada}
                        onClick={() => { onStatusChange(solicitud.id, confirmando, observaciones, mostrarAdvertencia); onClose(); }}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all disabled:opacity-30 ${
                          confirmando === 'Aprobada' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'
                        } text-white`}
                      > 
                        Confirmar 
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setConfirmando('En Revisión')} 
                          className="py-3 rounded-xl bg-white/5 text-blue-400 text-[9px] font-black uppercase border border-blue-500/20 hover:bg-blue-500/10 transition-all tracking-widest"
                        >
                          A Revisión
                        </button>
                        <button 
                          onClick={() => setConfirmando('Rechazada')} 
                          className="py-3 rounded-xl bg-white/5 text-rose-400 text-[9px] font-black uppercase border border-rose-500/20 hover:bg-rose-500/10 transition-all tracking-widest"
                        >
                          Rechazar
                        </button>
                      </div>
                      <button 
                        disabled={validandoCupo} 
                        onClick={handleAprobarClick} 
                        className="py-4 rounded-xl bg-[#d4a843] text-[#1a2744] text-[10px] font-black uppercase tracking-widest hover:bg-[#c2983a] transition-all disabled:opacity-50"
                      >
                        {validandoCupo ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Validando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aprobar Solicitud
                          </div>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <Lock className="h-6 w-6 text-slate-500 mx-auto mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Periodo Finalizado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}