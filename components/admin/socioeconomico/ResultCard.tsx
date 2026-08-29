"use client"

import React from "react"
import { 
  CheckCircle2, Info, HelpCircle, AlertTriangle, BadgeCheck, Activity, Landmark, ShieldAlert, Mail 
} from "lucide-react"
import { SECCIONES_REPORTE, CAMPOS_MONETARIOS } from "./ResultCardData"
import { RiskIndicator, getColorByScore } from "./ResultCardUI"

export function ResultCard({ student, formData }: any) {
  const displayData = { ...student, ...formData };
  
  // Prioridad total a los datos del administrador para el reporte final (Lógica Intacta)
  const puntajeFinal = student?.puntaje_admin ?? student?.puntaje ?? 0;
  const puntajeAlumno = student?.puntaje_estudiante ?? 0;
  const nivelFinal = student?.nivel_admin ?? student?.nivel_riesgo ?? "Pendiente";

  const getNivelConfig = (nivel: string) => {
    switch (nivel) {
      case 'Crítico':
        return {
          bgHeader: "bg-slate-950",
          bgLight: "bg-rose-50/50",
          text: "text-rose-900",
          icon: ShieldAlert,
          desc: "ESTADO CRÍTICO: Vulnerabilidad extrema detectada."
        };
      case 'Alto':
        return {
          bgHeader: "bg-rose-600",
          bgLight: "bg-rose-50/80",
          text: "text-rose-800",
          icon: AlertTriangle,
          desc: "RIESGO ALTO: Carencias socioeconómicas severas verificadas."
        };
      case 'Medio':
        return {
          bgHeader: "bg-amber-500",
          bgLight: "bg-amber-50/80",
          text: "text-amber-800",
          icon: Info,
          desc: "RIESGO MEDIO: Situación vulnerable evaluada."
        };
      case 'Bajo':
        return {
          bgHeader: "bg-emerald-600",
          bgLight: "bg-emerald-50/80",
          text: "text-emerald-800",
          icon: CheckCircle2,
          desc: "RIESGO BAJO: Condiciones socioeconómicas estables."
        };
      default:
        return {
          bgHeader: "bg-[#1e3a5f]",
          bgLight: "bg-slate-50",
          text: "text-slate-800",
          icon: HelpCircle,
          desc: "PENDIENTE: Requiere validación técnica."
        };
    }
  };

  const config = getNivelConfig(nivelFinal);
  const IconoNivel = config.icon;

  const formatValue = (key: string, value: any) => {
    if (value instanceof Date) return value.toLocaleDateString();
    if (value === "on" || value === "Posee" || value === "Si") return "Sí / Posee";
    if (value === "off" || value === "No posee" || value === "No") return "No / No posee";
    if (value === "S") return "Semipresencial";
    if (value === "P") return "Presencial";
    if (value === "V") return "Virtual";
    if (CAMPOS_MONETARIOS.includes(key) && value !== undefined) return `$ ${parseFloat(value).toFixed(2)}`;
    if (key === "indice_global" && value) return `${value} pts`;
    return value || "---";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 max-w-6xl mx-auto pb-12">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-2">
        
        {/* CABECERA COMPACTA: Alta densidad espacial corporativa */}
        <div className={`px-6 py-4 text-white flex flex-col md:flex-row justify-between items-center gap-4 ${config.bgHeader} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 text-center md:text-left min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                 <Activity className="h-3.5 w-3.5 text-[#d4a843]" />
                 <span className="text-[9px] font-black uppercase tracking-[0.15em]">Reporte de Auditoría Digital</span>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                <Landmark className="h-3.5 w-3.5 text-[#d4a843]" /> Dirección de Bienestar Estudiantil
              </div>
            </div>

            <h2 className="text-xl font-black uppercase tracking-tight mb-2 truncate">
              Expediente: {student?.nombre} {student?.apellido}
            </h2>

            <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
               <span className="px-2.5 py-0.5 bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/20">
                  V-{student?.cedula}
               </span>
               <span className="px-2.5 py-0.5 bg-white/10 rounded-md text-[9px] font-bold flex items-center gap-1.5 border border-white/10">
                  <Mail className="h-3 w-3 text-[#d4a843]" /> {student?.email}
               </span>
               <span className="px-2.5 py-0.5 bg-black/20 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3 text-[#d4a843]" /> ID: {student?.id ? `${student.id}` : '---'}
               </span>
            </div>
          </div>

          {/* TARJETAS DE PUNTRAJE: Compactas y estilizadas */}
          <div className="flex gap-3 relative z-10 shrink-0">
            <div className={`px-4 py-2.5 rounded-xl border border-white/10 text-center min-w-[110px] shadow-sm ${getColorByScore(puntajeAlumno)}`}>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-0.5">Alumno</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-2xl font-black tabular-nums tracking-tighter">{puntajeAlumno}</span>
                <span className="text-[10px] font-bold opacity-75">PTS</span>
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-xl border border-white/10 text-center min-w-[110px] shadow-sm ${getColorByScore(puntajeFinal)}`}>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-0.5">Institución</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-2xl font-black tabular-nums tracking-tighter">{puntajeFinal}</span>
                <span className="text-[10px] font-bold opacity-75">PTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE RIESGO: Altura reducida */}
        <div className={`px-6 py-3 border-b flex items-center gap-3 ${config.bgLight} ${config.text} border-x-0`}>
          <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0 border border-white/50">
             <IconoNivel className="h-4 w-4" />
          </div>
          <p className="text-xs font-black uppercase tracking-tight italic">
            {config.desc}
          </p>
        </div>

        {/* CUERPO DEL REPORTE: Textos aumentados 1 nivel para mayor legibilidad */}
        <div className="p-6 space-y-8 bg-[#f8fafc]">
          {Object.entries(SECCIONES_REPORTE).map(([secKey, seccion]: any) => (
            <div key={secKey} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <seccion.icon className="h-4 w-4 text-[#d4a843]" />
                <h3 className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-[0.15em]">
                  {seccion.titulo}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(seccion.campos).map(([campoKey, label]: any) => (
                  <div key={campoKey} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-200/60 hover:border-[#d4a843]/40 transition-all group">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#d4a843]">
                      {label}
                    </span>
                    <span className="text-xs font-bold text-[#1e3a5f] uppercase truncate">
                      {formatValue(campoKey, displayData[campoKey])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}