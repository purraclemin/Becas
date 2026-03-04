"use client"

import React, { useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Info
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

  // Configuración de las pestañas compactas
  const SECCIONES = [
    { id: "personal", label: "Personal", icon: User },
    { id: "uni", label: "Info Uni", icon: GraduationCap },
    { id: "familia", label: "Familiar", icon: Users },
    { id: "laboral", label: "Laboral", icon: Briefcase },
    { id: "ingresos", label: "Ingresos", icon: BadgeDollarSign },
    { id: "hogar", label: "Hogar", icon: Home },
    { id: "salud", label: "Salud", icon: HeartPulse },
  ]

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      {/* Encabezado Ultra-Compacto */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center border border-[#1e3a5f]/20">
          <ClipboardList className="h-4 w-4 text-[#1e3a5f]" />
        </div>
        <div>
          <h3 className="text-[#1e3a5f] font-black text-xs uppercase tracking-tight leading-none">Investigación Socioeconómica</h3>
          <p className="text-slate-400 text-[8px] font-bold mt-1 uppercase tracking-widest leading-none">Estudio de vulnerabilidad y entorno</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col min-h-0">
        
        {/* Lista de Pestañas Compactas con Scroll Horizontal */}
        <div className="w-full overflow-x-auto pb-1.5 custom-scrollbar shrink-0">
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
        <div className="flex-1 overflow-y-auto pr-1 pb-2 custom-scrollbar mt-2 bg-white/50 rounded-xl border border-slate-50 relative">
          
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