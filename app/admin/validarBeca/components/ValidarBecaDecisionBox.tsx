"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, MessageSquare, ShieldAlert, 
  CheckCircle2, Loader2, Lock, ArrowRight,
  ClipboardEdit, Building2
} from "lucide-react"
import { validarCuposYRequisitos, DiagnosticoBeca } from "@/lib/ActionsBecaValidators"

interface SolicitudDecision {
  id: number | string;
  cedula: string;
  estatus?: string; 
  departamento_asignado?: string; // <--- Añadido opcional por si ya viene cargado
}

interface ValidarBecaDecisionBoxProps {
  solicitud: SolicitudDecision;
  esPeriodoActual: boolean;
  periodoActualId: number | null;
  observaciones: string;
  setObservaciones: (obs: string) => void;
  departamentoAsignado: string; // <--- Nuevo prop para manejar el estado del departamento
  setDepartamentoAsignado: (dept: string) => void; // <--- Nuevo setter
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean, departamentoAsignado?: string) => void;
  onClose: () => void;
  bloqueadoPorEstudio: boolean;
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
  bloqueadoPorEstudio 
}: ValidarBecaDecisionBoxProps) {
  const router = useRouter()
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [diagnostico, setDiagnostico] = useState<DiagnosticoBeca | null>(null)
  const [validandoCupo, setValidandoCupo] = useState(false)
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false)
  const [responsabilidadAceptada, setResponsabilidadAceptada] = useState(false)

  // Evaluamos el estatus actual limpio para las comparaciones
  const estatusActual = solicitud.estatus?.trim() || "";

  const handleAprobarClick = async () => {
    if (bloqueadoPorEstudio || estatusActual === 'Aprobada') return;

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

  const irAEstudioSocioeconomico = () => {
    router.push(`/admin/estudio-socioeconomico?search=${solicitud.cedula}`);
  };

  return (
    <div className="bg-[#1e3a5f]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden sticky top-24">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2.5 mb-4">
          <ShieldCheck className="h-4 w-4 text-[#d4a843]" />
          <h3 className="text-[9px] font-black uppercase tracking-widest text-white">Panel de Decisión</h3>
        </div>

        {esPeriodoActual ? (
          <>
            {bloqueadoPorEstudio ? (
              <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl border-l-4 border-l-amber-500">
                  <div className="flex items-start gap-2.5">
                    <Lock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Acción Restringida</p>
                      <p className="text-[10px] font-bold text-white/90 leading-tight">
                        No se puede aprobar esta beca sin un baremo socioeconómico validado por el administrador.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={irAEstudioSocioeconomico}
                  className="w-full flex items-center justify-between p-3.5 bg-[#d4a843] hover:bg-[#c2983a] text-[#1e3a5f] rounded-xl transition-all group shadow-md shadow-amber-900/20"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#1e3a5f]/10 rounded-lg">
                      <ClipboardEdit className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tight">Realizar Baremo Ahora</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <>
                {mostrarAdvertencia && diagnostico && (
                  <div className="mb-4 space-y-2.5 animate-in zoom-in duration-300">
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
                      <span className="text-[8px] font-black text-white uppercase tracking-tighter">Acepto la responsabilidad</span>
                    </label>
                  </div>
                )}

                {/* Campo de Observaciones */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Observaciones</span>
                  </div>
                  <textarea 
                    value={observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Indique los motivos de su decisión..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#d4a843] transition-all resize-none h-16 placeholder:text-white/20"
                  />
                </div>

                {/* NUEVO: Campo Select de Departamento Asignado */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-1.5 px-0.5">
                    <Building2 className="h-3 w-3 text-slate-400" />
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Departamento Asignado</span>
                  </div>
                  <select
                    value={departamentoAsignado}
                    onChange={(e) => setDepartamentoAsignado(e.target.value)}
                    className="w-full bg-[#1e3a5f] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-[#d4a843] transition-all"
                  >
                    <option value="" disabled className="bg-[#1e3a5f] text-slate-400">Seleccione un departamento...</option>
                    <option value="Bienestar Estudiantil" className="bg-[#1e3a5f] text-white">Bienestar Estudiantil</option>
                    <option value="Secretaría General" className="bg-[#1e3a5f] text-white">Secretaría General</option>
                    <option value="Control de Estudios" className="bg-[#1e3a5f] text-white">Control de Estudios</option>
                    <option value="Decanato de Investigación" className="bg-[#1e3a5f] text-white">Decanato de Investigación</option>
                    <option value="Biblioteca" className="bg-[#1e3a5f] text-white">Biblioteca</option>
                    <option value="Centro de Tecnologías" className="bg-[#1e3a5f] text-white">Centro de Tecnologías</option>
                  </select>
                </div>

                <div className="grid gap-2.5">
                  {confirmando ? (
                    <div className="flex gap-2 animate-in zoom-in duration-300">
                      <button 
                        onClick={() => { setConfirmando(null); setMostrarAdvertencia(false); }} 
                        className="flex-1 py-2.5 rounded-xl bg-white/5 text-white text-[9px] font-black uppercase border border-white/10 tracking-widest hover:bg-white/10 transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        disabled={mostrarAdvertencia && !responsabilidadAceptada}
                        onClick={() => { 
                          onStatusChange(Number(solicitud.id), confirmando, observaciones, mostrarAdvertencia, departamentoAsignado); 
                          onClose(); 
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase shadow-md transition-all disabled:opacity-30 ${
                          confirmando === 'Aprobada' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'
                        } text-white`}
                      > 
                        Confirmar 
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          disabled={estatusActual === 'En Revisión'}
                          onClick={() => setConfirmando('En Revisión')} 
                          className="py-2.5 rounded-xl bg-white/5 text-blue-400 text-[8px] font-black uppercase border border-blue-500/20 hover:bg-blue-500/10 transition-all tracking-widest disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/2"
                        >
                          A Revisión
                        </button>
                        
                        <button 
                          disabled={estatusActual === 'Rechazada'}
                          onClick={() => setConfirmando('Rechazada')} 
                          className="py-2.5 rounded-xl bg-white/5 text-rose-400 text-[8px] font-black uppercase border border-rose-500/20 hover:bg-rose-500/10 transition-all tracking-widest disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-white/2"
                        >
                          Rechazar
                        </button>
                      </div>

                      <button 
                        disabled={validandoCupo || estatusActual === 'Aprobada'} 
                        onClick={handleAprobarClick} 
                        className="py-3 rounded-xl bg-[#d4a843] text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest hover:bg-[#c2983a] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                      >
                        {validandoCupo ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Validando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="h-3 w-3" />
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
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <Lock className="h-5 w-5 text-slate-500 mx-auto mb-2" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              Periodo Finalizado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}