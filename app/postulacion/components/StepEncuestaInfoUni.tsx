"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  GraduationCap, 
  School, 
  History, 
  CalendarClock, 
  Globe, 
  ShieldCheck,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaInfoUni({
  disabled,
  user
}: {
  disabled: boolean;
  user: any;
}) {
  // Estándar UNIMAR Academic Minimalist (Simetría unificada con StepEncuestaPersonal)
  const blockedClass = "h-9 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/60 cursor-not-allowed text-[11px] shadow-none px-3 rounded-xl";
  const editableClass = "h-10 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-500 pb-4">
      
      {/* BLOQUE 1: DATOS ACADÉMICOS MAESTROS (BLOQUEADOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Registro Académico Oficial</span>
        </div>

        <div className="space-y-1 sm:col-span-3">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><GraduationCap className="h-2.5 w-2.5 text-[#d4a843]" /> Carrera que Cursa</Label>
          <Input 
            name="socio_carrera"
            readOnly 
            disabled 
            value={user?.socio_carrera || user?.carrera || "No especificada"} 
            className={blockedClass} 
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><History className="h-2.5 w-2.5 text-[#d4a843]" /> Trimestre Actual</Label>
          <Input 
            name="socio_trimestre"
            readOnly 
            disabled 
            value={user?.socio_trimestre || user?.semestre?.toString() || "0"} 
            className={cn(blockedClass, "text-center")} 
          />
        </div>
      </div>

      {/* BLOQUE 2: INFORMACIÓN DE PROCEDENCIA Y MODALIDAD (EDITABLES) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Detalles de Formación</span>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><School className="h-3 w-3 text-[#d4a843]" /> U.E. de Procedencia</Label>
          <Input 
            name="socio_ue_procedencia" 
            disabled={disabled} 
            defaultValue={user?.socio_ue_procedencia} 
            required 
            placeholder="Ej: U.E. Colegio Porlamar" 
            className={editableClass} 
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><CalendarClock className="h-3 w-3 text-[#d4a843]" /> Fecha Ingreso UNIMAR</Label>
          <Input 
            name="socio_fecha_unimar" 
            type="date" 
            disabled={disabled} 
            defaultValue={user?.socio_fecha_unimar} 
            required 
            className={editableClass} 
          />
        </div>

        <div className="space-y-1 col-span-full">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Info className="h-3 w-3 text-[#d4a843]" /> Otros Estudios Realizados</Label>
          <Input 
            name="socio_otros_estudios" 
            disabled={disabled} 
            defaultValue={user?.socio_otros_estudios} 
            placeholder="Cursos, diplomados o técnicos realizados (Opcional)" 
            className={editableClass} 
          />
        </div>

        {/* Modalidad de Estudio (Optimizada y responsiva) */}
        <div className="col-span-full space-y-1.5 mt-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Globe className="h-3 w-3 text-[#d4a843]" /> Modalidad de Estudio Elegida</Label>
          <RadioGroup 
            name="socio_modalidad" 
            defaultValue={user?.socio_modalidad || "P"} 
            disabled={disabled}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {[
              { id: "mod_p", val: "P", label: "Presencial" },
              { id: "mod_s", val: "S", label: "Semipresencial" },
              { id: "mod_v", val: "V", label: "Virtual" }
            ].map((mod) => (
              <label 
                key={mod.id} 
                htmlFor={mod.id}
                className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
              >
                <RadioGroupItem value={mod.val} id={mod.id} className="h-4 w-4 text-[#1e3a5f]" />
                <span className="text-[10px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{mod.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}