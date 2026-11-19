"use client"

import React, { ComponentType, SVGProps } from "react"
import { 
  CheckCircle2, Info, HelpCircle, AlertTriangle, BadgeCheck, Activity, Landmark, ShieldAlert, Mail 
} from "lucide-react"
import { SECCIONES_REPORTE, CAMPOS_MONETARIOS } from "./ResultCardData"
import { getColorByScore } from "./ResultCardUI"

export interface StudentDataRecord {
  id?: number | string;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  email?: string;
  telefono?: string;
  sexo?: string;
  fecha_nacimiento?: string;
  carrera?: string;
  semestre?: number | string;
  indice_global?: number | string;
  municipio_residencia?: string;
  puntaje_admin?: number | null;
  puntaje?: number | null;
  puntaje_estudiante?: number | null;
  nivel_admin?: string | null;
  nivel_riesgo?: string | null;
  [key: string]: unknown;
}

interface ResultCardProps {
  student?: StudentDataRecord | null;
  formData?: Record<string, unknown> | null;
}

interface NivelConfig {
  bgHeader: string;
  bgLight: string;
  text: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  desc: string;
}

interface SeccionCampoConfig {
  titulo: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  campos: Record<string, string>;
}

export function ResultCard({ student, formData }: ResultCardProps) {
  const rawData: Record<string, unknown> = { ...(student || {}), ...(formData || {}) };
  
  const displayData: Record<string, unknown> = {
    ...rawData,
    municipio_residencia: rawData.municipio_residencia || rawData.municipio || rawData.socio_municipio || "---",
    telefono: rawData.telefono || rawData.socio_celular || rawData.socio_telf_hab || "---",
    sexo: rawData.sexo || rawData.socio_sexo || "---",
    fecha_nacimiento: rawData.fecha_nacimiento || rawData.socio_fecha_nac || "---",
    carrera: rawData.carrera || rawData.socio_carrera || "---",
    semestre: rawData.semestre || rawData.socio_trimestre || "---",
    indice_global: rawData.indice_global || rawData.promedio_notas || rawData.promedio || "---",
    familia_relacion: rawData.familia_relacion || rawData.socio_relacion_fam || "Buena",
    situacion_laboral_jefe: rawData.situacion_laboral_jefe || rawData.posee_empleo_aspirante || rawData.posee_empleo || "No",
    salud_condicion_especial: rawData.salud_condicion_especial || rawData.posee_enfermedad_aspirante || rawData.salud_condicion || "No",
  };
  
  const puntajeFinal = Number(student?.puntaje_admin ?? student?.puntaje ?? 0);
  const puntajeAlumno = Number(student?.puntaje_estudiante ?? 0);
  const nivelFinal = String(student?.nivel_admin ?? student?.nivel_riesgo ?? "Pendiente");

  const getNivelConfig = (nivel: string): NivelConfig => {
    switch (nivel) {
      case 'Crítico':
        return { bgHeader: "bg-slate-950", bgLight: "bg-rose-50/50", text: "text-rose-900", icon: ShieldAlert, desc: "ESTADO CRÍTICO: Vulnerabilidad extrema detectada." };
      case 'Alto':
        return { bgHeader: "bg-rose-600", bgLight: "bg-rose-50/80", text: "text-rose-800", icon: AlertTriangle, desc: "RIESGO ALTO: Carencias socioeconómicas severas verificadas." };
      case 'Medio':
        return { bgHeader: "bg-amber-500", bgLight: "bg-amber-50/80", text: "text-amber-800", icon: Info, desc: "RIESGO MEDIO: Situación vulnerable evaluada." };
      case 'Bajo':
        return { bgHeader: "bg-emerald-600", bgLight: "bg-emerald-50/80", text: "text-emerald-800", icon: CheckCircle2, desc: "RIESGO BAJO: Condiciones socioeconómicas estables." };
      default:
        return { bgHeader: "bg-[#1e3a5f]", bgLight: "bg-slate-50", text: "text-slate-800", icon: HelpCircle, desc: "PENDIENTE: Requiere validación técnica." };
    }
  };

  const config = getNivelConfig(nivelFinal);
  const IconoNivel = config.icon;

  const formatValue = (key: string, value: unknown): string => {
    if (value instanceof Date) return value.toLocaleDateString();
    if (value === "on" || value === "Posee" || value === "Si" || value === "Sí") return "Sí / Posee";
    if (value === "off" || value === "No posee" || value === "No") return "No / No posee";
    if (value === "S") return "Semipresencial";
    if (value === "P") return "Presencial";
    if (value === "V") return "Virtual";
    if (value === "M") return "Masculino";
    if (value === "F") return "Femenino";
    if (CAMPOS_MONETARIOS.includes(key) && value !== undefined && value !== null && value !== "") {
      return `$ ${parseFloat(String(value)).toFixed(2)}`;
    }
    if (key === "indice_global" && value && value !== "---") return `${String(value)} pts`;
    return value !== null && value !== undefined && String(value).trim() !== "" ? String(value) : "---";
  };

  return (
    <div id="print-section" className="w-full max-w-6xl mx-auto">
      
      {/* ========================================================= */}
      {/* 1. VERSIÓN WEB (Interactiva y moderna - Se oculta al imprimir) */}
      {/* ========================================================= */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 pb-12 print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
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
                Expediente: {String(student?.nombre || "")} {String(student?.apellido || "")}
              </h2>

              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                 <span className="px-2.5 py-0.5 bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/20">
                    V-{String(student?.cedula || "---")}
                 </span>
                 <span className="px-2.5 py-0.5 bg-white/10 rounded-md text-[9px] font-bold flex items-center gap-1.5 border border-white/10">
                    <Mail className="h-3 w-3 text-[#d4a843]" /> {String(student?.email || "---")}
                 </span>
                 <span className="px-2.5 py-0.5 bg-black/20 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3 text-[#d4a843]" /> ID: {student?.id ? `${student.id}` : '---'}
                 </span>
              </div>
            </div>

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

          <div className={`px-6 py-3 border-b flex items-center gap-3 ${config.bgLight} ${config.text} border-x-0`}>
            <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0 border border-white/50">
               <IconoNivel className="h-4 w-4" />
            </div>
            <p className="text-xs font-black uppercase tracking-tight italic">
              {config.desc}
            </p>
          </div>

          <div className="p-6 space-y-8 bg-[#f8fafc]">
            {Object.entries(SECCIONES_REPORTE as Record<string, SeccionCampoConfig>).map(([secKey, seccion]) => {
              const IconoSeccion = seccion.icon;
              return (
                <div key={secKey} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <IconoSeccion className="h-4 w-4 text-[#d4a843]" />
                    <h3 className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-[0.15em]">
                      {seccion.titulo}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(seccion.campos).map(([campoKey, label]) => (
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
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. VERSIÓN DE IMPRESIÓN (Tablas detalladas institucionales - Se muestra solo al imprimir) */}
      {/* ========================================================= */}
      <div className="hidden print:block bg-white text-slate-900 m-0 p-0 w-full">
        
        {/* Cabecera Institucional en Tabla */}
        <div className="p-2 bg-white border-b-2 border-[#1e3a5f] mb-3">
          <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#1e3a5f] tracking-wider">
                Reporte de Auditoría Digital — Dirección de Bienestar Estudiantil
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">UNIMAR 2026</span>
          </div>

          <div className="bg-slate-50 rounded border border-slate-300 p-2">
            <div className="flex flex-col divide-y divide-slate-200 text-[10px]">
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">Expediente del Estudiante:</span>
                <span className="font-black text-[#1e3a5f] uppercase text-xs">
                  {String(student?.nombre || "")} {String(student?.apellido || "")}
                </span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">Cédula de Identidad:</span>
                <span className="font-black text-slate-800 uppercase">V-{String(student?.cedula || "---")}</span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">Correo Electrónico:</span>
                <span className="font-semibold text-slate-800">{String(student?.email || "---")}</span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">ID de Registro Institucional:</span>
                <span className="font-bold text-slate-800">{student?.id ? `${student.id}` : '---'}</span>
              </div>
              <div className="py-1.5 flex justify-between items-center bg-slate-100 px-2 rounded">
                <span className="font-black text-[#1e3a5f] uppercase">Puntaje Asignado (Alumno / Institución):</span>
                <div className="flex gap-3 font-black text-xs">
                  <span className="text-blue-800">Alumno: {puntajeAlumno} PTS</span>
                  <span>|</span>
                  <span className="text-emerald-800">Institución: {puntajeFinal} PTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Estatus de Riesgo */}
        <div className="px-3 py-1.5 border border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-tight italic mb-3 rounded">
          {config.desc}
        </div>

        {/* Cuerpo de Secciones en Tablas Detalladas */}
        <div className="space-y-3">
          {Object.entries(SECCIONES_REPORTE as Record<string, SeccionCampoConfig>).map(([secKey, seccion]) => (
            <div key={secKey} className="bg-white p-2 rounded border border-slate-300">
              <div className="pb-1 mb-1 border-b border-slate-300">
                <h3 className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-[0.15em]">
                  {seccion.titulo}
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-slate-200">
                {Object.entries(seccion.campos).map(([campoKey, label]) => (
                  <div key={campoKey} className="py-1 flex justify-between items-center text-left">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                      {label}:
                    </span>
                    <span className="text-[10px] font-black text-[#1e3a5f] uppercase text-right">
                      {formatValue(campoKey, displayData[campoKey])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pie de página oficial */}
        <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[8px] text-slate-500 uppercase tracking-wider">
          © Copyright 2026-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela
        </div>
      </div>
    </div>
  )
}