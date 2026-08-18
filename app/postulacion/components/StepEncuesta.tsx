"use client"

import React, { useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ClipboardList, 
  User, 
  Briefcase, 
  GraduationCap, 
  Users, 
  BadgeDollarSign, 
  Home, 
  HeartPulse,
  CheckCircle2,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"

// Importación de los sub-componentes especializados
import { StepEncuestaPersonal } from "./StepEncuestaPersonal"
import { StepEncuestaSituacionLaboral } from "./StepEncuestaSituacionLaboral"
import { StepEncuestaInfoUni } from "./StepEncuestaInfoUni"
import { StepEncuestaGrupoFamiliar } from "./StepEncuestaGrupoFamiliar"
import { StepEncuestaRangoIngreso } from "./StepEncuestaRangoIngreso"
import { StepEncuestaHogar } from "./StepEncuestaHogar"
import { StepEncuestaSalud } from "./StepEncuestaSalud"

export function StepEncuesta({
  disabled,
  user,
  activeTab,
  onTabChange,
  onValidationChange
}: {
  disabled: boolean;
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}) {

  // Validación automática para permitir la navegación fluida
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true)
    }
  }, [onValidationChange])

  // Configuración de las pestañas
  const SECCIONES = [
    { id: "personal", label: "Personal", icon: User },
    { id: "uni", label: "Info Uni", icon: GraduationCap },
    { id: "familia", label: "Familiar", icon: Users },
    { id: "laboral", label: "Laboral", icon: Briefcase },
    { id: "ingresos", label: "Ingresos", icon: BadgeDollarSign },
    { id: "hogar", label: "Hogar", icon: Home },
    { id: "salud", label: "Salud", icon: HeartPulse },
  ]

  const currentIndex = SECCIONES.findIndex(s => s.id === activeTab);
  const currentSectionData = SECCIONES[currentIndex] || SECCIONES[0];

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden pb-4 lg:pb-0">
      
      {/* Encabezado Ultra-Compacto */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center border border-[#1e3a5f]/20">
            <ClipboardList className="h-4 w-4 text-[#1e3a5f]" />
          </div>
          <div>
            <h3 className="text-[#1e3a5f] font-black text-xs uppercase tracking-tight leading-none">Investigación Socioeconómica</h3>
            <p className="text-slate-400 text-[8px] font-bold mt-1 uppercase tracking-widest leading-none">Estudio de vulnerabilidad y entorno</p>
          </div>
        </div>

        {/* Indicador de sección móvil */}
        <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-[9px] font-black text-[#1e3a5f]">0{currentIndex + 1}</span>
          <span className="text-[9px] text-slate-400">/</span>
          <span className="text-[9px] font-bold text-slate-500">0{SECCIONES.length}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
        
        {/* =========================================================
            SELECTOR MÓVIL (< 1024px): Menú Desplegable Limpio sin Scroll
            ========================================================= */}
        <div className="block lg:hidden w-full mb-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers className="h-3 w-3 text-[#d4a843]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Seleccione la sección a completar:</span>
          </div>
          
          <Select value={activeTab} onValueChange={onTabChange} disabled={disabled}>
            <SelectTrigger className="h-11 border-slate-200 text-xs font-bold uppercase rounded-xl bg-slate-50 text-[#1e3a5f] focus:ring-[#1e3a5f]">
              <SelectValue placeholder="Seleccione una sección..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {SECCIONES.map((s, idx) => {
                const Icono = s.icon;
                return (
                  <SelectItem key={s.id} value={s.id} className="text-xs font-bold uppercase py-2.5 gap-2">
                    <div className="flex items-center gap-2">
                      <Icono className="h-3.5 w-3.5 text-[#1e3a5f]" />
                      <span>{idx + 1}. {s.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* =========================================================
            SELECTOR DE ESCRITORIO (>= 1024px): Pestañas Horizontales Originales
            ========================================================= */}
        <div className="hidden lg:block w-full overflow-x-auto pb-1.5 custom-scrollbar shrink-0">
          <TabsList className="bg-slate-100 p-0.5 rounded-lg w-max border border-slate-200 flex h-auto">
            {SECCIONES.map((s) => {
              const Icono = s.icon
              return (
                <TabsTrigger 
                  key={s.id} 
                  value={s.id} 
                  className="rounded-md px-2.5 py-1.5 data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white text-[8px] font-black uppercase tracking-tight gap-1.5 transition-all"
                >
                  <Icono className="h-3 w-3" /> {s.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Contenedor de Contenido Persistente (Evita desmontaje del DOM) */}
        <div className="flex-1 overflow-y-auto pr-1 pb-2 custom-scrollbar mt-1 lg:mt-2 bg-white/50 rounded-xl border border-slate-50 relative">
          
          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "personal" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaPersonal disabled={disabled} user={user} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "uni" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaInfoUni disabled={disabled} user={user} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "familia" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaGrupoFamiliar disabled={disabled} user={user} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "laboral" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaSituacionLaboral disabled={disabled} user={user} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "ingresos" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaRangoIngreso disabled={disabled} user={user} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "hogar" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaHogar disabled={disabled} user={user} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "salud" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaSalud disabled={disabled} user={user} />
          </div>

        </div>
      </Tabs>

      {/* Pie de Declaración Compacto */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-[7px] font-black text-slate-400 uppercase tracking-widest italic">
          <CheckCircle2 className="h-2.5 w-2.5" /> Información bajo fe de juramento
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  )
}