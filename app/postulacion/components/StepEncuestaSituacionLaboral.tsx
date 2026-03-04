"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Briefcase, Building2, BadgeDollarSign, Info, UserRoundSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaSituacionLaboral({
  disabled,
  user
}: {
  disabled: boolean;
  user: any;
}) {
  // Inicializamos el estado basado en la información existente
  const [tieneEmpleo, setTieneEmpleo] = useState(!!user?.socio_trabajo_empresa || user?.posee_empleo_aspirante === "Si");

  // Estilos ultra-compactos institucionales
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[10px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* SECCIÓN 1: PREGUNTA FILTRO (Compacta) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2 mb-1">
           <UserRoundSearch className="h-3.5 w-3.5 text-[#d4a843]" />
           <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500">
             Actividad Laboral Actual
           </Label>
        </div>
        
        <Label className="text-[10px] font-bold text-[#1e3a5f] block leading-none">
          ¿Realiza usted actualmente alguna actividad laboral remunerada?
        </Label>

        <RadioGroup 
          value={tieneEmpleo ? "Si" : "No"} 
          onValueChange={(v) => setTieneEmpleo(v === "Si")} 
          className="flex gap-2 pt-1"
          disabled={disabled}
        >
          {[
            { id: "trabaja_si", val: "Si", label: "Sí, poseo empleo" },
            { id: "trabaja_no", val: "No", label: "No poseo empleo" }
          ].map((opt) => (
            <div key={opt.id} className="flex-1 flex items-center gap-2 px-3 h-8 rounded-lg border border-slate-200 bg-slate-50/30 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer">
              <RadioGroupItem value={opt.val} id={opt.id} className="h-3 w-3" />
              <Label htmlFor={opt.id} className="text-[9px] font-bold text-[#1e3a5f] cursor-pointer uppercase">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        
        <input type="hidden" name="posee_empleo_aspirante" value={tieneEmpleo ? "Si" : "No"} />
      </div>

      {/* SECCIÓN 2: DETALLES (Dinámica y Compacta) */}
      {tieneEmpleo ? (
        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-200 space-y-3 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#1e3a5f] flex items-center justify-center shadow-sm">
              <Briefcase className="h-3 w-3 text-[#d4a843]" />
            </div>
            <span className="text-[8px] font-black uppercase text-[#1e3a5f] tracking-widest">Información del Empleo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Nombre de la Empresa */}
            <div className="space-y-0.5 md:col-span-1">
              <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
                <Building2 className="h-2 w-2" /> Empresa / Negocio
              </Label>
              <Input 
                name="socio_trabajo_empresa" 
                disabled={disabled} 
                defaultValue={user?.socio_trabajo_empresa} 
                placeholder="Nombre de la empresa"
                required={tieneEmpleo}
                className={editableClass}
              />
            </div>

            {/* Cargo */}
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
                <Briefcase className="h-2 w-2" /> Cargo
              </Label>
              <Input 
                name="socio_trabajo_cargo" 
                disabled={disabled} 
                defaultValue={user?.socio_trabajo_cargo} 
                placeholder="Ej. Asistente"
                required={tieneEmpleo}
                className={editableClass}
              />
            </div>

            {/* Sueldo Mensual */}
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
                <BadgeDollarSign className="h-2 w-2" /> Sueldo Mensual ($)
              </Label>
              <div className="relative">
                <Input 
                  name="monto_ingreso_sueldo" 
                  type="number" 
                  disabled={disabled} 
                  defaultValue={user?.monto_ingreso_sueldo} 
                  placeholder="0.00"
                  required={tieneEmpleo}
                  className={cn(editableClass, "pl-4")}
                />
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[9px]">$</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NOTA INFORMATIVA SI NO TRABAJA + INPUTS OCULTOS DE LIMPIEZA */
        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 shrink-0">
          <Info className="h-3 w-3 text-blue-400 shrink-0" />
          <p className="text-[8px] text-blue-600/80 font-bold leading-none uppercase tracking-tight">
            Se analizará el ingreso de su grupo familiar o representante para el baremo social.
          </p>
          {/* Inputs ocultos que garantizan que el FormData ponga a cero los valores si marca "No", asegurando la suma del resumen */}
          <input type="hidden" name="socio_trabajo_empresa" value="" />
          <input type="hidden" name="socio_trabajo_cargo" value="" />
          <input type="hidden" name="monto_ingreso_sueldo" value="0" />
        </div>
      )}
    </div>
  )
}