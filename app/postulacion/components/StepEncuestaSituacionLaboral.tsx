"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Briefcase, Building2, BadgeDollarSign, Info, UserRoundSearch } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaSituacionLaboral({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: any;
  onValidationChange?: (isValid: boolean) => void;
}) {
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

  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  const empresaRef = useRef<HTMLInputElement>(null);
  const cargoRef = useRef<HTMLInputElement>(null);

  const isEmpresaValid = !tieneEmpleo || empresa.trim() !== "";
  const isCargoValid = !tieneEmpleo || cargo.trim() !== "";
  const isValid = isEmpresaValid && isCargoValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isEmpresaValid && empresaRef.current) empresaRef.current.focus();
      else if (!isCargoValid && cargoRef.current) cargoRef.current.focus();
    };

    window.addEventListener('intentar-avanzar-laboral', handleValidationAttempt);
    return () => window.removeEventListener('intentar-avanzar-laboral', handleValidationAttempt);
  }, [isEmpresaValid, isCargoValid]);

  // Restricción para permitir solo letras y espacios en el cargo
  const handleSoloLetrasCargo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCargo(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
  };

  // Estándar UF-Scale optimizado sin scroll: h-10 en móvil, h-8 en PC
  const editableClass = "h-10 lg:h-8 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs lg:text-[11px] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-2.5 rounded-xl";

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      
      {/* SECCIÓN 1: PREGUNTA FILTRO */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
           <UserRoundSearch className="h-3.5 w-3.5 text-[#d4a843]" />
           <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
             Actividad Laboral Actual
           </Label>
        </div>
        
        <Label className="text-[11px] font-bold text-[#1e3a5f] block leading-snug">
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
            }
          }} 
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5"
          disabled={disabled}
        >
          {[
            { id: "trabaja_si", val: "Si", label: "Sí, poseo empleo" },
            { id: "trabaja_no", val: "No", label: "No poseo empleo" }
          ].map((opt) => (
            <label 
              key={opt.id} 
              htmlFor={opt.id}
              className="flex items-center justify-center gap-2 px-3 h-10 lg:h-9 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
            >
              <RadioGroupItem value={opt.val} id={opt.id} className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span className="text-[9px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
        
        <input type="hidden" name="posee_empleo_aspirante" value={tieneEmpleo ? "Si" : "No"} />
      </div>

      {/* SECCIÓN 2: DETALLES DINÁMICOS */}
      {tieneEmpleo ? (
        <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 space-y-2.5 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm">
              <Briefcase className="h-3 w-3 text-[#d4a843]" />
            </div>
            <span className="text-[9px] font-black uppercase text-[#1e3a5f] tracking-widest">Información del Empleo</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            
            {/* Empresa / Negocio */}
            <div className="space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isEmpresaValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                <Building2 className="h-2.5 w-2.5 text-[#d4a843]" /> Empresa / Negocio {hasAttemptedNext && !isEmpresaValid && "*"}
              </Label>
              <Input 
                ref={empresaRef}
                name="socio_trabajo_empresa" 
                disabled={disabled} 
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Nombre de la empresa"
                required={tieneEmpleo}
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isEmpresaValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>

            {/* Cargo (Solo Letras) */}
            <div className="space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isCargoValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                <Briefcase className="h-2.5 w-2.5 text-[#d4a843]" /> Cargo {hasAttemptedNext && !isCargoValid && "*"}
              </Label>
              <Input 
                ref={cargoRef}
                name="socio_trabajo_cargo" 
                disabled={disabled} 
                value={cargo}
                onChange={handleSoloLetrasCargo}
                placeholder="Ej. Asistente"
                required={tieneEmpleo}
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isCargoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>

            {/* Sueldo Mensual */}
            <div className="space-y-0.5">
              <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <BadgeDollarSign className="h-2.5 w-2.5 text-[#d4a843]" /> Sueldo Mensual ($)
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
                  className={cn(editableClass, "pl-6")}
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 shrink-0">
          <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <p className="text-[8.5px] text-blue-600/80 font-bold leading-relaxed uppercase tracking-tight">
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