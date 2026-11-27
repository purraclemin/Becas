"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Award,
  X,
  Loader2,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Users,
  Sparkles
} from "lucide-react"
import {
  obtenerNominaExcelenciaAcademica,
  type NominaCarreraExcelenciaUI,
} from "@/lib/ActionsGestionEspecial"

interface ModalNominaExcelenciaProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshList: () => void;
}

interface FeedbackEstado {
  tipo: 'success' | 'error';
  mensaje: string;
}

export function ModalNominaExcelencia({
  isOpen,
  onClose,
  onRefreshList,
}: ModalNominaExcelenciaProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [periodoCodigo, setPeriodoCodigo] = useState<string>("");
  const [periodoNombre, setPeriodoNombre] = useState<string>("");
  const [nomina, setNomina] = useState<NominaCarreraExcelenciaUI[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEstado | null>(null);

  // Referencias estables para evitar recargas o parpadeos al re-renderizar el componente padre
  const onRefreshListRef = useRef<() => void>(onRefreshList);
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    onRefreshListRef.current = onRefreshList;
  }, [onRefreshList]);

  useEffect(() => {
    if (!isOpen) return;

    const reqId = ++requestIdRef.current;
    setFeedback(null);
    setLoading(true);

    const cargarNomina = async () => {
      try {
        const res = await obtenerNominaExcelenciaAcademica();
        if (reqId !== requestIdRef.current) return;

        if (res.success) {
          setPeriodoCodigo(res.periodoCodigo);
          setPeriodoNombre(res.periodoNombre);
          setNomina(res.nomina);
          if (res.huboCambios) {
            onRefreshListRef.current();
          }
        } else {
          setFeedback({
            tipo: 'error',
            mensaje: res.error || 'No fue posible consultar la nómina de Excelencia Académica.',
          });
        }
      } catch {
        if (reqId === requestIdRef.current) {
          setFeedback({
            tipo: 'error',
            mensaje: 'Error de conexión al consultar la nómina de Excelencia Académica.',
          });
        }
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    void cargarNomina();
  }, [isOpen]);

  if (!isOpen) return null;

  const totalTitulares = nomina.filter((n) => n.titularActual !== null).length;
  const totalDesempates = nomina.filter((n) => n.desempateAutomatico).length;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#1e3a5f]/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Cabecera Institucional */}
        <div className="bg-[#1e3a5f] px-5 py-4 border-b-2 border-[#d4a843] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#d4a843]/20 border border-[#d4a843]/40 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-[#d4a843]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm md:text-xs font-black text-white uppercase tracking-widest leading-none">
                  Nómina Automática — Beca a la Excelencia Académica
                </h2>
                {periodoCodigo && (
                  <span className="px-2 py-0.5 rounded bg-[#d4a843] text-[#1e3a5f] text-[9px] font-black uppercase tracking-wider">
                    {periodoCodigo}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-300 font-semibold mt-1">
                Art. 8 y 32: Mayor Índice Global (&ge; 18.00 pts) desde 4° trimestre, 0 reprobadas último trim. • 1 cupo por carrera ({periodoNombre || 'Periodo Vigente'})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="self-end md:self-center p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Barra de Estado Automático */}
        <div className="bg-[#f8fafc] px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                Sincronización Automática Activa
              </span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-[#d4a843]" />
              <span className="text-[10px] font-black text-[#1e3a5f] uppercase">
                Otorgadas: {totalTitulares} / {nomina.length || 8}
              </span>
            </div>

            {totalDesempates > 0 && (
              <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-[10px] font-black text-blue-800 uppercase">
                  Desempates Resueltos: {totalDesempates}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-2 shrink-0 ${
              feedback.tipo === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.tipo === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.mensaje}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Contenido: Listado de las 8 Carreras */}
        <div className="p-5 overflow-y-auto flex-1 bg-[#f8fafc] space-y-3">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#d4a843] mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Consultando promedios acumulados por carrera...
              </p>
            </div>
          ) : nomina.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-bold uppercase">
              No se encontraron carreras configuradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {nomina.map((item) => (
                <div
                  key={item.carreraId}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-tight truncate">
                      {item.carrera}
                    </h3>
                    {item.titularActual ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.desempateAutomatico && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-[8px] font-black uppercase">
                            Desempate Auto
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase">
                          Otorgada
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold uppercase shrink-0">
                        Sin Elegibles (&ge; 18)
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2.5 flex-1">
                    {item.candidatosTop.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic py-2">
                        Ningún estudiante cumple &ge; 4° trimestre, Índice Global &ge; 18.00 y cero reprobadas.
                      </p>
                    ) : (
                      item.candidatosTop.map((cand) => (
                        <div
                          key={cand.studentId}
                          className="p-3 rounded-xl border bg-emerald-50/50 border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-[#1e3a5f] uppercase truncate">
                                {cand.nombre} {cand.apellido}
                              </span>
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold">
                              V-{cand.cedula} • {cand.semestre}° Trimestre • Trim. Ant.: {cand.promedioUltimoTrim.toFixed(2)}
                            </p>
                            {item.criterioDesempate && (
                              <p className="text-[9px] font-bold text-blue-700 mt-0.5">
                                {item.criterioDesempate}
                              </p>
                            )}
                            {cand.becaBaseRespaldo && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-[9px] font-bold text-amber-800 uppercase">
                                Respaldo Base: {cand.becaBaseRespaldo}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <div className="px-2.5 py-1 rounded-lg bg-[#1e3a5f] text-white text-center">
                              <span className="block text-[7px] font-bold text-[#d4a843] uppercase leading-none">
                                Global
                              </span>
                              <span className="text-xs font-black tabular-nums">
                                {cand.indiceGlobal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                    {item.otrosElegibles.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                          <Users className="h-3 w-3" /> Siguientes elegibles ({item.otrosElegibles.length}):
                        </p>
                        <div className="space-y-1">
                          {item.otrosElegibles.slice(0, 2).map((otro) => (
                            <div
                              key={otro.studentId}
                              className="flex items-center justify-between text-[10px] text-slate-600 px-2 py-1 rounded bg-slate-50"
                            >
                              <span className="font-semibold truncate">
                                {otro.nombre} {otro.apellido} (V-{otro.cedula} • {otro.semestre}°T)
                              </span>
                              <span className="font-black text-[#1e3a5f] tabular-nums shrink-0 ml-2">
                                {otro.indiceGlobal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[10px] text-slate-400 font-semibold">
            Sincronización automática en cada cambio de periodo y aprobación: si un titular con beca base pierde el 1° lugar, retorna automáticamente a su beca original si mantiene &ge; 16.00 pts y cero reprobadas.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="h-12 md:h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider cursor-pointer shrink-0 ml-3"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
