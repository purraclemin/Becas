"use client"

import React, { useState, useEffect } from "react"
import { Sparkles, TrendingUp, MapPin, FileText, ArrowRight, X, ShieldAlert, Calendar, RefreshCw, Clock } from "lucide-react"

interface EstudianteIAAnalizado {
  id: number | string;
  cedula: string;
  nombre: string;
  apellido: string;
  carrera: string;
  promedio: number;
  puntajeVulnerabilidad: number;
  municipio: string;
  motivoSolicitud: string;
  estatus: string;
  analisisIA: string;
}

interface AptoIAProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  estudiantesAptos: EstudianteIAAnalizado[];
  onSelectEstudiante: (cedula: string) => void;
  periodoNombre?: string;
  onRefreshIA: () => void;
}

export function AptoIA({ isOpen, onClose, loading, estudiantesAptos, onSelectEstudiante, periodoNombre, onRefreshIA }: AptoIAProps) {
  // 🟢 Estado para el cronómetro digital corriendo en tiempo real (HH:MM:SS)
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState<string>("00:00:00");

  useEffect(() => {
    // Si no hay timestamp registrado en localStorage y ya hay datos, inicializamos uno
    if (typeof window !== 'undefined') {
      let ts = localStorage.getItem('unimar_ranking_ia_timestamp');
      if (!ts && estudiantesAptos.length > 0) {
        ts = new Date().toISOString();
        localStorage.setItem('unimar_ranking_ia_timestamp', ts);
      }
    }

    const actualizarCronometro = () => {
      if (typeof window === 'undefined') return;
      const ts = localStorage.getItem('unimar_ranking_ia_timestamp');
      if (!ts) {
        setTiempoTranscurrido("00:00:00");
        return;
      }

      const tiempoGuardado = new Date(ts).getTime();
      const ahora = new Date().getTime();
      const diffSegundos = Math.floor((ahora - tiempoGuardado) / 1000);

      if (diffSegundos < 0) {
        setTiempoTranscurrido("00:00:00");
        return;
      }

      const horas = Math.floor(diffSegundos / 3600);
      const minutos = Math.floor((diffSegundos % 3600) / 60);
      const segundos = diffSegundos % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTiempoTranscurrido(`${pad(horas)}:${pad(minutos)}:${pad(segundos)}`);
    };

    actualizarCronometro();
    const intervalo = setInterval(actualizarCronometro, 1000); // 👈 Corre cada segundo exacto

    return () => clearInterval(intervalo);
  }, [estudiantesAptos]);

  if (!isOpen) return null;

  const getBadgeEstatusStyle = (estatus: string) => {
    const est = (estatus || "").toLowerCase();
    if (est.includes("pendiente")) return "bg-amber-100 text-amber-800 border-amber-300 font-black";
    if (est.includes("revisión") || est.includes("revision")) return "bg-blue-100 text-blue-800 border-blue-300 font-black";
    if (est.includes("especial")) return "bg-purple-100 text-purple-800 border-purple-300 font-black";
    return "bg-slate-100 text-slate-700 border-slate-300 font-black";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3a5f]/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Cabecera Institucional */}
        <div className="bg-[#1e3a5f] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-[#d4a843] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4a843]/20 rounded-xl border border-[#d4a843]/30">
              <Sparkles className="h-5 w-5 text-[#d4a843]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xs font-black text-white uppercase tracking-widest leading-none">
                  Selección Inteligente por IA (Ranking Élite Unimar)
                </h2>
                {periodoNombre && (
                  <span className="px-2 py-0.5 bg-[#d4a843] text-[#1e3a5f] rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-2.5 w-2.5" /> {periodoNombre}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-[#d4a843] font-bold uppercase mt-1 tracking-wider">
                Análisis ponderado: Promedio + Vulnerabilidad + Lejanía + Motivo (Pendientes y En Revisión)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button 
              onClick={onRefreshIA}
              disabled={loading}
              className="px-3 py-1.5 bg-[#d4a843] hover:bg-[#c2983c] text-[#1e3a5f] rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              title="Actualizar ranking de IA manualmente"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Ranking
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Barra de Estado con Cronómetro Digital en Tiempo Real */}
        <div className="bg-slate-100 px-6 py-1.5 border-b border-slate-200 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#1e3a5f]" />
            <span>Estado del reporte: <strong className="text-[#1e3a5f]">Persistente en Memoria</strong></span>
          </div>
          <div className="flex items-center gap-1 text-slate-700 font-black">
            <span>Tiempo desde última actualización:</span>
            <span className="px-2 py-0.5 bg-slate-200 text-[#1e3a5f] rounded font-mono text-[10px]">
              {tiempoTranscurrido}
            </span>
          </div>
        </div>

        {/* Contenido Dinámico */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-[#1e3a5f] animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-[#d4a843] animate-pulse" />
              </div>
              <p className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest animate-pulse">
                La IA está evaluando expedientes y ponderando criterios de Unimar...
              </p>
            </div>
          ) : estudiantesAptos.length > 0 ? (
            estudiantesAptos.map((est, index) => (
              <div 
                key={est.id}
                onClick={() => {
                  onSelectEstudiante(est.cedula);
                  onClose();
                }}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:border-[#1e3a5f] hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1e3a5f] group-hover:bg-[#d4a843] transition-colors" />

                <div className="flex items-start gap-3 min-w-0 pl-2">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-[#1e3a5f] font-black text-xs shrink-0 border border-slate-200 group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                    {index === 0 ? "🏆" : `#${index + 1}`}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-tight">
                        {est.nombre} {est.apellido}
                      </h3>
                      <span className="text-[9px] font-bold text-slate-400">
                        V-{est.cedula}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider border ${getBadgeEstatusStyle(est.estatus)}`}>
                        {est.estatus || "Pendiente"}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      {est.carrera}
                    </p>
                    
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-2 mt-2 flex items-start gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-amber-900 font-medium leading-relaxed">
                        <strong className="font-bold">Criterio IA:</strong> {est.analisisIA}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Promedio</span>
                    <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                      <TrendingUp className="h-3 w-3" />
                      {est.promedio.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vulnerabilidad</span>
                    <div className="flex items-center gap-1 text-amber-600 font-black text-xs">
                      <ShieldAlert className="h-3 w-3" />
                      {est.puntajeVulnerabilidad} pts
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Municipio</span>
                    <div className="flex items-center gap-1 text-slate-600 font-bold text-[10px]">
                      <MapPin className="h-3 w-3 text-[#d4a843]" />
                      {est.municipio}
                    </div>
                  </div>

                  <div className="pl-2 border-l border-slate-100">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <FileText className="h-8 w-8 text-slate-300" />
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                No se encontraron registros pendientes o en revisión bajo los parámetros actuales.
              </p>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase">
            Desarrollado bajo estándares de Arquitectura Unimar 2026
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  )
}