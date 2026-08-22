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
  onValidationChange,
  onPersonalValidationChange,
  onUniValidationChange,
  onFamiliaValidationChange,
  onLaboralValidationChange,
  onIngresosValidationChange,
  onHogareValidationChange,
  onSaludValidationChange
}: {
  disabled: boolean;
  user: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  onPersonalValidationChange?: (isValid: boolean) => void;
  onUniValidationChange?: (isValid: boolean) => void;
  onFamiliaValidationChange?: (isValid: boolean) => void;
  onLaboralValidationChange?: (isValid: boolean) => void;
  onIngresosValidationChange?: (isValid: boolean) => void;
  onHogareValidationChange?: (isValid: boolean) => void;
  onSaludValidationChange?: (isValid: boolean) => void;
}) {

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true)
    }
  }, [onValidationChange])

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

  const handleTabSelection = (newTabId: string) => {
    const targetIndex = SECCIONES.findIndex(s => s.id === newTabId);
    if (targetIndex > currentIndex) return; 
    onTabChange(newTabId);
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden pb-16 lg:pb-0">
      
      {/* Encabezado */}
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

        <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-[9px] font-black text-[#1e3a5f]">0{currentIndex + 1}</span>
          <span className="text-[9px] text-slate-400">/</span>
          <span className="text-[9px] font-bold text-slate-500">0{SECCIONES.length}</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabSelection} className="flex-1 flex flex-col min-h-0">
        
        {/* SELECTOR MÓVIL (< 1024px) */}
        <div className="block lg:hidden w-full mb-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers className="h-3 w-3 text-[#d4a843]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Seleccione la sección a completar:</span>
          </div>
          
          <Select value={activeTab} onValueChange={handleTabSelection} disabled={disabled}>
            <SelectTrigger className="h-12 border-slate-200 text-sm font-bold uppercase rounded-xl bg-slate-50 text-[#1e3a5f] focus:ring-[#1e3a5f]">
              <SelectValue placeholder="Seleccione una sección..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {SECCIONES.map((s, idx) => {
                const Icono = s.icon;
                const isLocked = idx > currentIndex;
                return (
                  <SelectItem 
                    key={s.id} 
                    value={s.id} 
                    disabled={isLocked}
                    className={cn("text-xs font-bold uppercase py-2.5 gap-2", isLocked && "opacity-45 cursor-not-allowed")}
                  >
                    <div className="flex items-center gap-2">
                      <Icono className="h-3.5 w-3.5 text-[#1e3a5f]" />
                      <span>{idx + 1}. {s.label} {isLocked && "(Bloqueado)"}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* SELECTOR DE ESCRITORIO (>= 1024px) */}
        <div className="hidden lg:block w-full overflow-x-auto pb-1.5 custom-scrollbar shrink-0">
          <TabsList className="bg-slate-100 p-1 rounded-xl w-full border border-slate-200 flex h-auto justify-between gap-1">
            {SECCIONES.map((s, idx) => {
              const Icono = s.icon;
              const isLocked = idx > currentIndex;

              return (
                <TabsTrigger 
                  key={s.id} 
                  value={s.id} 
                  disabled={isLocked}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-tight gap-2 transition-all",
                    "data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white data-[state=active]:shadow-sm",
                    isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-200/60 text-slate-600"
                  )}
                >
                  <Icono className="h-3.5 w-3.5 shrink-0" /> 
                  <span className="truncate">{s.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Contenedor de Contenido Persistente */}
        <div className="flex-1 overflow-y-auto pr-1 pb-2 custom-scrollbar mt-1 lg:mt-2 bg-white/50 rounded-xl border border-slate-50 relative">
          
          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "personal" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaPersonal disabled={disabled} user={user} onValidationChange={onPersonalValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "uni" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaInfoUni disabled={disabled} user={user} onValidationChange={onUniValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "familia" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaGrupoFamiliar disabled={disabled} user={user} onValidationChange={onFamiliaValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "laboral" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaSituacionLaboral disabled={disabled} user={user} onValidationChange={onLaboralValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "ingresos" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaRangoIngreso disabled={disabled} user={user} onValidationChange={onIngresosValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "hogar" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaHogar disabled={disabled} user={user} onValidationChange={onHogareValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1 h-full", activeTab === "salud" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaSalud disabled={disabled} user={user} onValidationChange={onSaludValidationChange} />
          </div>

        </div>
      </Tabs>

      {/* Pie de Declaración */}
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