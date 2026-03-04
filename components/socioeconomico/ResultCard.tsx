"use client"

import React from "react"
import { 
  CheckCircle2, Info, HelpCircle, AlertTriangle, BadgeCheck, Activity, Landmark, ShieldAlert, Mail 
} from "lucide-react"
import { SECCIONES_REPORTE, CAMPOS_MONETARIOS } from "./ResultCardData"
import { RiskIndicator, getColorByScore } from "./ResultCardUI"

export function ResultCard({ student, formData }: any) {
  const displayData = { ...student, ...formData };
  
  // Prioridad total a los datos del administrador para el reporte final
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
          bgHeader: "bg-slate-700",
          bgLight: "bg-slate-50",
          text: "text-slate-800",
          icon: HelpCircle,
          desc: "PENDIENTE: Requiere validación técnica."
        };
    }
  };

  // La configuración visual ahora depende del nivel determinado por la institución
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
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6 max-w-5xl mx-auto pb-20">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-2">
        
        {/* CABECERA: El color predominante es el del Administrador (config.bgHeader) */}
        <div className={`p-8 text-white flex flex-col lg:flex-row justify-between items-center gap-6 ${config.bgHeader} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4 bg-white/10 w-fit px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
               <Activity className="h-3.5 w-3.5 text-[#d4a843]" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Reporte de Auditoría Digital</span>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-70 mb-3">
              <Landmark className="h-3.5 w-3.5" /> Dirección de Bienestar Estudiantil
            </div>

            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-tight">
              Expediente: {student?.nombre} {student?.apellido}
            </h2>

            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
               <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20">
                  V-{student?.cedula}
               </span>
               <span className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold flex items-center gap-2 border border-white/10">
                  <Mail className="h-3 w-3 text-[#d4a843]" /> {student?.email}
               </span>
               <span className="px-3 py-1 bg-black/20 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <BadgeCheck className="h-3 w-3 text-[#d4a843]" /> Auditoría: {student?.id ? `ID-${student.id}` : '---'}
               </span>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            {/* Tarjeta del Alumno: Muestra su puntaje pero no domina el color del reporte */}
            <div className={`p-4 rounded-2xl border border-white/10 text-center min-w-[140px] shadow-xl ${getColorByScore(puntajeAlumno)}`}>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-1">Alumno</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-4xl font-black tabular-nums tracking-tighter">{puntajeAlumno}</span>
                <span className="text-[10px] font-bold opacity-70">PTS</span>
              </div>
            </div>

            {/* Tarjeta de la Institución: Refleja el puntaje validado que controla el reporte */}
            <div className={`p-4 rounded-2xl border border-white/10 text-center min-w-[140px] shadow-xl ${getColorByScore(puntajeFinal)}`}>
              <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-1">Institución</p>
              <div className="flex items-baseline justify-center gap-0.5">
                <span className="text-4xl font-black tabular-nums tracking-tighter">{puntajeFinal}</span>
                <span className="text-[10px] font-bold opacity-70">PTS</span>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE RIESGO: Basada en la validación oficial */}
        <div className={`px-8 py-4 border-b flex items-center gap-4 ${config.bgLight} ${config.text} border-x-0`}>
          <div className="p-2 bg-white rounded-xl shadow-md shrink-0 border border-white/50">
             <IconoNivel className="h-5 w-5" />
          </div>
          <p className="text-xs font-black uppercase tracking-tight italic">
            {config.desc}
          </p>
        </div>

        {/* CUERPO DEL REPORTE */}
        <div className="p-10 space-y-12 bg-white">
          {Object.entries(SECCIONES_REPORTE).map(([secKey, seccion]: any) => (
            <div key={secKey} className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
                <seccion.icon className="h-4 w-4 text-[#d4a843]" />
                <h3 className="text-[10px] font-black text-[#1a2744] uppercase tracking-[0.2em]">
                  {seccion.titulo}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(seccion.campos).map(([campoKey, label]: any) => (
                  <div key={campoKey} className="flex flex-col p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-[#d4a843]/20 hover:bg-slate-50 transition-all group">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#d4a843]">
                      {label}
                    </span>
                    <span className="text-[11px] font-black text-[#1a2744] uppercase truncate">
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