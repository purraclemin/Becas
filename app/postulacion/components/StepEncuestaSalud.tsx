"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  Users, 
  MessageSquare,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaSalud({
  disabled,
  user
}: {
  disabled: boolean;
  user: any;
}) {
  // Estado para mostrar/ocultar detalles médicos
  const [estaEnfermo, setEstaEnfermo] = useState(
    user?.salud_condicion_especial === "Si" || !!user?.salud_enfermedad_desc
  );

  // Estado para la convivencia familiar
  const [convivencia, setConvivencia] = useState(user?.familia_relacion || "Buena");

  // Estilos ultra-compactos institucionales (Letra de escritura text-[9px])
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[9px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";

  // Helper para Radio Items clicables en toda su área y compactos
  const CustomRadioItem = ({ value, id, label, colorClass = "text-[#1e3a5f]" }: any) => (
    <label 
      htmlFor={id}
      className={cn(
        "flex-1 flex items-center gap-2 px-3 h-8 rounded-lg border border-slate-200 bg-slate-50/30 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer group",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <RadioGroupItem value={value} id={id} className="h-3 w-3" />
      <span className={cn("text-[9px] font-bold uppercase cursor-pointer tracking-tight truncate", colorClass)}>
        {label}
      </span>
    </label>
  );

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* 1. SECCIÓN DE SALUD (Compacta) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
           <HeartPulse className="h-3.5 w-3.5 text-[#d4a843]" />
           <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500">
             Estado de Salud del Aspirante
           </Label>
        </div>
        
        <Label className="text-[10px] font-bold text-[#1e3a5f] block leading-none">
          ¿Padece enfermedad crónica o condición de discapacidad?
        </Label>

        <RadioGroup 
          value={estaEnfermo ? "Si" : "No"} 
          onValueChange={(v) => setEstaEnfermo(v === "Si")} 
          className="flex gap-2 pt-1"
          disabled={disabled}
        >
          <CustomRadioItem value="Si" id="s_si" label="Sí, poseo condición" />
          <CustomRadioItem value="No" id="s_no" label="No, gozo de buena salud" />
        </RadioGroup>
        
        {/* Persistencia clave para el Resumen */}
        <input type="hidden" name="salud_condicion_especial" value={estaEnfermo ? "Si" : "No"} />

        {estaEnfermo ? (
          <div className="flex flex-col gap-2 pt-2 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-amber-700 flex items-center gap-1">
                <Stethoscope className="h-2.5 w-2.5" /> Diagnóstico Médico Detallado
              </Label>
              <Input 
                name="salud_enfermedad_desc" 
                className={editableClass}
                placeholder="Especifique su condición o diagnóstico..." 
                disabled={disabled} 
                defaultValue={user?.salud_enfermedad_desc} 
                required={estaEnfermo} 
              />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-amber-700 flex items-center gap-1">
                <Activity className="h-2.5 w-2.5" /> Tratamiento e Insumos requeridos
              </Label>
              <Input 
                name="salud_tratamiento" 
                className={editableClass}
                placeholder="Indique medicamentos o cuidados permanentes..." 
                disabled={disabled} 
                defaultValue={user?.salud_tratamiento} 
                required={estaEnfermo} 
              />
            </div>
          </div>
        ) : (
          /* Entradas ocultas para limpiar los datos si cambia de "Sí" a "No" */
          <>
            <input type="hidden" name="salud_enfermedad_desc" value="" />
            <input type="hidden" name="salud_tratamiento" value="" />
          </>
        )}
      </div>

      {/* 2. CLIMA FAMILIAR (Compacto) */}
      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center gap-2">
           <Users className="h-3.5 w-3.5 text-[#d4a843]" />
           <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500">
             Dinámica y Convivencia
           </Label>
        </div>

        <Label className="text-[10px] font-bold text-[#1e3a5f] block leading-none">
          ¿Cómo calificaría la convivencia en su hogar?
        </Label>

        <RadioGroup 
          value={convivencia} 
          onValueChange={setConvivencia}
          className="flex gap-2 pt-1"
          disabled={disabled}
        >
          <CustomRadioItem value="Buena" id="rel_b" label="Buena" colorClass="text-green-600" />
          <CustomRadioItem value="Regular" id="rel_r" label="Regular" colorClass="text-amber-600" />
          <CustomRadioItem value="Mala" id="rel_m" label="Mala" colorClass="text-red-600" />
        </RadioGroup>

        {/* Persistencia clave para el Resumen */}
        <input type="hidden" name="familia_relacion" value={convivencia} />
      </div>

      {/* 3. OBSERVACIONES (Ahora como Input igual a Salud) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1.5 shrink-0">
        <Label className="text-[8px] font-black uppercase text-[#1e3a5f] flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3 text-[#d4a843]" /> Observaciones del Solicitante
        </Label>
        <Input 
          name="observaciones_estudio" 
          placeholder="Explique cualquier situación particular para el Comité..." 
          className={editableClass}
          disabled={disabled}
          defaultValue={user?.observaciones_estudio}
        />
      </div>

      {/* Nota Final */}
      <div className="p-2 px-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center gap-2 shrink-0">
        <Info className="h-3 w-3 text-blue-400 shrink-0" />
        <p className="text-[8px] text-blue-600 font-bold uppercase tracking-tight leading-none">
          La veracidad de estos datos podrá ser verificada mediante visita domiciliaria.
        </p>
      </div>

    </div>
  )
}