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
  const [tieneEmpleo, setTieneEmpleo] = useState(
    !!user?.socio_trabajo_empresa && user?.socio_trabajo_empresa !== "NO" || user?.posee_empleo_aspirante === "Si"
  );
  const [sueldo, setSueldo] = useState(user?.monto_ingreso_sueldo ?? "0");
  const [empresa, setEmpresa] = useState(
    user?.socio_trabajo_empresa && user?.socio_trabajo_empresa !== "NO" ? user.socio_trabajo_empresa : ""
  );
  const [cargo, setCargo] = useState(
    user?.socio_trabajo_cargo && user?.socio_trabajo_cargo !== "NO" ? user.socio_trabajo_cargo : ""
  );

  // Estándar UNIMAR Academic Minimalist (Simetría unificada con altura de 40px y bordes xl)
  const editableClass = "h-10 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-500 pb-4">
      
      {/* SECCIÓN 1: PREGUNTA FILTRO (Compacta) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
           <UserRoundSearch className="h-4 w-4 text-[#d4a843]" />
           <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
             Actividad Laboral Actual
           </Label>
        </div>
        
        <Label className="text-xs font-bold text-[#1e3a5f] block leading-snug">
          ¿Realiza usted actualmente alguna actividad laboral remunerada?
        </Label>

        <RadioGroup 
          value={tieneEmpleo ? "Si" : "No"} 
          onValueChange={(v) => {
            const esSi = v === "Si";
            setTieneEmpleo(esSi);
            if (!esSi) {
              setSueldo("0");
              setEmpresa("");
              setCargo("");
            } else {
              setEmpresa("");
              setCargo("");
              setSueldo("0");
            }
          }} 
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1"
          disabled={disabled}
        >
          {[
            { id: "trabaja_si", val: "Si", label: "Sí, poseo empleo" },
            { id: "trabaja_no", val: "No", label: "No poseo empleo" }
          ].map((opt) => (
            <label 
              key={opt.id} 
              htmlFor={opt.id}
              className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
            >
              <RadioGroupItem value={opt.val} id={opt.id} className="h-4 w-4 text-[#1e3a5f]" />
              <span className="text-[10px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
        
        <input type="hidden" name="posee_empleo_aspirante" value={tieneEmpleo ? "Si" : "No"} />
      </div>

      {/* SECCIÓN 2: DETALLES (Dinámica y Compacta) */}
      {tieneEmpleo ? (
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3.5 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm">
              <Briefcase className="h-3.5 w-3.5 text-[#d4a843]" />
            </div>
            <span className="text-[9px] font-black uppercase text-[#1e3a5f] tracking-widest">Información del Empleo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Nombre de la Empresa */}
            <div className="space-y-1 sm:col-span-1">
              <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-[#d4a843]" /> Empresa / Negocio
              </Label>
              <Input 
                name="socio_trabajo_empresa" 
                disabled={disabled} 
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Nombre de la empresa"
                required={tieneEmpleo}
                className={editableClass}
              />
            </div>

            {/* Cargo */}
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-[#d4a843]" /> Cargo
              </Label>
              <Input 
                name="socio_trabajo_cargo" 
                disabled={disabled} 
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej. Asistente"
                required={tieneEmpleo}
                className={editableClass}
              />
            </div>

            {/* Sueldo Mensual */}
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <BadgeDollarSign className="h-3 w-3 text-[#d4a843]" /> Sueldo Mensual ($)
              </Label>
              <div className="relative">
                <Input 
                  name="monto_ingreso_sueldo" 
                  type="number" 
                  disabled={disabled} 
                  value={sueldo}
                  onChange={(e) => setSueldo(e.target.value)}
                  placeholder="0.00"
                  required={tieneEmpleo}
                  className={cn(editableClass, "pl-7")}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* NOTA INFORMATIVA SI NO TRABAJA + INPUTS OCULTOS CON "NO" / "0" */
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2.5 shrink-0">
          <Info className="h-4 w-4 text-blue-400 shrink-0" />
          <p className="text-[9px] text-blue-600/80 font-bold leading-relaxed uppercase tracking-tight">
            Se analizará el ingreso de su grupo familiar o representante para el baremo social.
          </p>
          <input type="hidden" name="socio_trabajo_empresa" value="NO" />
          <input type="hidden" name="socio_trabajo_cargo" value="NO" />
          <input type="hidden" name="monto_ingreso_sueldo" value="0" />
        </div>
      )}
    </div>
  )
}