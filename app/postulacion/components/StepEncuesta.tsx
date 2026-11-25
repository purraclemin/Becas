"use client"

import React, { useEffect } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ClipboardList,
  Briefcase,
  Users,
  BadgeDollarSign,
  Home,
  HeartPulse,
  CheckCircle2,
  Layers
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

// Importación de los sub-componentes socioeconómicos (iniciando en Familia)
import { StepEncuestaGrupoFamiliar } from "./StepEncuestaGrupoFamiliar"
import { StepEncuestaSituacionLaboral } from "./StepEncuestaSituacionLaboral"
import { StepEncuestaRangoIngreso } from "./StepEncuestaRangoIngreso"
import { StepEncuestaHogar } from "./StepEncuestaHogar"
import { StepEncuestaSalud } from "./StepEncuestaSalud"

type SeccionId = "familia" | "laboral" | "ingresos" | "hogar" | "salud";

interface SeccionEncuesta {
  id: SeccionId;
  label: string;
  icon: React.ElementType;
}

const SECCIONES: ReadonlyArray<SeccionEncuesta> = [
  { id: "familia", label: "Familiar", icon: Users },
  { id: "laboral", label: "Laboral", icon: Briefcase },
  { id: "ingresos", label: "Ingresos", icon: BadgeDollarSign },
  { id: "hogar", label: "Hogar", icon: Home },
  { id: "salud", label: "Salud", icon: HeartPulse },
];

const SCROLLBAR_TAILWIND_CLASS =
  "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full";

export function StepEncuesta({
  disabled,
  user,
  activeTab,
  onTabChange,
  onValidationChange,
  onFamiliaValidationChange,
  onLaboralValidationChange,
  onIngresosValidationChange,
  onHogareValidationChange,
  onSaludValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
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
    onValidationChange?.(true);
  }, [onValidationChange]);

  const currentIndex = SECCIONES.findIndex(s => s.id === activeTab);
  const tabActivoSeguro: SeccionId = currentIndex >= 0 ? SECCIONES[currentIndex].id : "familia";
  const indiceActivoSeguro = currentIndex >= 0 ? currentIndex : 0;

  const handleTabSelection = (newTabId: string) => {
    const targetIndex = SECCIONES.findIndex(s => s.id === newTabId);
    if (targetIndex === -1 || targetIndex > indiceActivoSeguro) return;
    onTabChange(newTabId);
  };

  // Valores precargados del sistema interno (Personal + Info Uni) conservados de forma oculta
  const nacionalidadInterna = user?.socio_nacionalidad || "Venezolano/a";
  const lugarNacInterno = user?.socio_lugar_nac || "Porlamar, Nueva Esparta";
  const estadoCivilInterno = user?.socio_estado_civil || user?.estado_civil || "Soltero/a";
  const direccionInterna = user?.direccion_completa || "Av. Bolívar, Nueva Esparta";
  const telfHabInterno = user?.socio_telf_hab || "02952600000";
  const celularInterno = user?.socio_celular || user?.telefono || "04120000000";
  const carreraInterna = user?.socio_carrera || user?.carrera || "No especificada";
  const trimestreInterno = String(user?.socio_trimestre ?? user?.semestre ?? "1");
  const ueProcedenciaInterna = user?.socio_ue_procedencia || "U.E. Colegio Virgen del Valle";
  const otrosEstudiosInternos = user?.socio_otros_estudios || "Ninguno";
  const fechaUnimarInterna = user?.socio_fecha_unimar || "2024-01-15";
  const modalidadInterna = user?.socio_modalidad || "P";

  return (
    <div className="flex-1 min-h-0 flex flex-col animate-in fade-in duration-500 overflow-hidden pb-16 lg:pb-0">

      {/* CAMPOS INTERNOS OCULTOS (YA REGISTRADOS EN EL SISTEMA) */}
      <input type="hidden" name="socio_nacionalidad" value={nacionalidadInterna} />
      <input type="hidden" name="socio_lugar_nac" value={lugarNacInterno} />
      <input type="hidden" name="socio_estado_civil" value={estadoCivilInterno} />
      <input type="hidden" name="direccion_completa" value={direccionInterna} />
      <input type="hidden" name="socio_telf_hab" value={telfHabInterno} />
      <input type="hidden" name="socio_celular" value={celularInterno} />
      <input type="hidden" name="socio_carrera" value={carreraInterna} />
      <input type="hidden" name="socio_trimestre" value={trimestreInterno} />
      <input type="hidden" name="socio_ue_procedencia" value={ueProcedenciaInterna} />
      <input type="hidden" name="socio_otros_estudios" value={otrosEstudiosInternos} />
      <input type="hidden" name="socio_fecha_unimar" value={fechaUnimarInterna} />
      <input type="hidden" name="socio_modalidad" value={modalidadInterna} />

      {/* Encabezado compacto */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center border border-[#1e3a5f]/20">
            <ClipboardList className="h-3.5 w-3.5 text-[#1e3a5f]" />
          </div>
          <div>
            <h3 className="text-[#1e3a5f] font-black text-xs uppercase tracking-tight leading-none">
              Investigación Socioeconómica
            </h3>
            <p className="text-slate-400 text-[8px] font-bold mt-0.5 uppercase tracking-widest leading-none">
              Estudio de vulnerabilidad y entorno
            </p>
          </div>
        </div>

        <div className="lg:hidden flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-[9px] font-black text-[#1e3a5f]">0{indiceActivoSeguro + 1}</span>
          <span className="text-[9px] text-slate-400">/</span>
          <span className="text-[9px] font-bold text-slate-500">0{SECCIONES.length}</span>
        </div>
      </div>

      <Tabs value={tabActivoSeguro} onValueChange={handleTabSelection} className="flex-1 flex flex-col min-h-0">

        {/* SELECTOR MÓVIL (< 1024px) */}
        <div className="block lg:hidden w-full mb-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Layers className="h-3 w-3 text-[#d4a843]" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
              Seleccione la sección a completar:
            </span>
          </div>

          <Select value={tabActivoSeguro} onValueChange={handleTabSelection} disabled={disabled}>
            <SelectTrigger className="h-12 border-slate-200 text-sm font-bold uppercase rounded-xl bg-slate-50 text-[#1e3a5f] focus:ring-[#1e3a5f]">
              <SelectValue placeholder="Seleccione una sección..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {SECCIONES.map((s, idx) => {
                const Icono = s.icon;
                const isLocked = idx > indiceActivoSeguro;
                return (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    disabled={isLocked}
                    className={cn("text-sm font-bold uppercase py-2.5 gap-2", isLocked && "opacity-45 cursor-not-allowed")}
                  >
                    <div className="flex items-center gap-2">
                      <Icono className="h-3.5 w-3.5 text-[#1e3a5f]" />
                      <span>{idx + 1}. {s.label} {isLocked && "(Bloqueado)"}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* SELECTOR DE ESCRITORIO (>= 1024px) */}
        <div className={cn("hidden lg:block w-full overflow-x-auto pb-1 shrink-0", SCROLLBAR_TAILWIND_CLASS)}>
          <TabsList className="bg-slate-100 p-1 rounded-xl w-full border border-slate-200 flex h-auto justify-between gap-1">
            {SECCIONES.map((s, idx) => {
              const Icono = s.icon;
              const isLocked = idx > indiceActivoSeguro;

              return (
                <TabsTrigger
                  key={s.id}
                  value={s.id}
                  disabled={isLocked}
                  className={cn(
                    "flex-1 h-8 rounded-lg px-2.5 text-xs font-black uppercase tracking-tight gap-1.5 transition-all",
                    "data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white data-[state=active]:shadow-sm",
                    isLocked ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-200/60 text-slate-600"
                  )}
                >
                  <Icono className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Contenedor de Contenido Persistente (Scroll interno aislado si hace falta, sin empujar el footer) */}
        <div className={cn("flex-1 min-h-0 overflow-y-auto pr-1 pb-1 mt-1 bg-white/50 rounded-xl border border-slate-50 relative", SCROLLBAR_TAILWIND_CLASS)}>

          <div className={cn("mt-0 outline-none p-1", tabActivoSeguro === "familia" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaGrupoFamiliar disabled={disabled} user={user} onValidationChange={onFamiliaValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1", tabActivoSeguro === "laboral" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaSituacionLaboral disabled={disabled} user={user} onValidationChange={onLaboralValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1", tabActivoSeguro === "ingresos" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaRangoIngreso disabled={disabled} user={user} onValidationChange={onIngresosValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1", tabActivoSeguro === "hogar" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaHogar disabled={disabled} user={user} onValidationChange={onHogareValidationChange} />
          </div>

          <div className={cn("mt-0 outline-none p-1", tabActivoSeguro === "salud" ? "block animate-in fade-in" : "hidden")}>
            <StepEncuestaSalud disabled={disabled} user={user} onValidationChange={onSaludValidationChange} />
          </div>

        </div>
      </Tabs>

      {/* Pie de Declaración */}
     
    </div>
  )
}