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
  Monitor,
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
  // Estilos ultra-compactos institucionales (idénticos a StepEncuestaPersonal)
  const blockedClass = "h-8 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/60 cursor-not-allowed text-[10px] shadow-none px-2";
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[10px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* BLOQUE 1: DATOS ACADÉMICOS MAESTROS (BLOQUEADOS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-3 gap-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100 relative overflow-hidden">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3 w-3 text-slate-400" />
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Registro Académico Oficial</span>
        </div>

        <div className="space-y-0.5 md:col-span-3">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><GraduationCap className="h-2 w-2" /> Carrera que Cursa</Label>
          <Input 
            name="socio_carrera"
            readOnly 
            disabled 
            value={user?.socio_carrera || user?.carrera || "No especificada"} 
            className={blockedClass} 
          />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><History className="h-2 w-2" /> Trimestre Actual</Label>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2 p-3 bg-white rounded-xl border border-[#1e3a5f]/10 shadow-sm relative">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <div className="h-1 w-1 rounded-full bg-[#d4a843]" />
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Detalles de Formación</span>
        </div>

        <div className="space-y-0.5 md:col-span-2">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><School className="h-2 w-2 text-[#d4a843]" /> U.E. de Procedencia</Label>
          <Input 
            name="socio_ue_procedencia" 
            disabled={disabled} 
            defaultValue={user?.socio_ue_procedencia} 
            required 
            placeholder="Ej: U.E. Colegio Porlamar" 
            className={editableClass} 
          />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><CalendarClock className="h-2 w-2 text-[#d4a843]" /> Fecha Ingreso UNIMAR</Label>
          <Input 
            name="socio_fecha_unimar" 
            type="date" 
            disabled={disabled} 
            defaultValue={user?.socio_fecha_unimar} 
            required 
            className={editableClass} 
          />
        </div>

        <div className="space-y-0.5 col-span-full">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Info className="h-2 w-2 text-[#d4a843]" /> Otros Estudios Realizados</Label>
          <Input 
            name="socio_otros_estudios" 
            disabled={disabled} 
            defaultValue={user?.socio_otros_estudios} 
            placeholder="Cursos, diplomados o técnicos realizados (Opcional)" 
            className={editableClass} 
          />
        </div>

        {/* Modalidad de Estudio (Ultra-compacta) */}
        <div className="col-span-full space-y-1.5 mt-1">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Globe className="h-2 w-2 text-[#d4a843]" /> Modalidad de Estudio Elegida</Label>
          <RadioGroup 
            name="socio_modalidad" 
            defaultValue={user?.socio_modalidad || "P"} 
            disabled={disabled}
            className="flex gap-2"
          >
            {[
              { id: "mod_p", val: "P", label: "Presencial" },
              { id: "mod_s", val: "S", label: "Semipresencial" },
              { id: "mod_v", val: "V", label: "Virtual" }
            ].map((mod) => (
              <div key={mod.id} className="flex-1 flex items-center gap-2 px-3 h-8 rounded-lg border border-slate-200 bg-slate-50/30 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer">
                <RadioGroupItem value={mod.val} id={mod.id} className="h-3 w-3" />
                <Label htmlFor={mod.id} className="text-[9px] font-bold text-[#1e3a5f] cursor-pointer uppercase">{mod.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}