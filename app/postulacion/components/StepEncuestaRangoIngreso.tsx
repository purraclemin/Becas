"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  TrendingUp, 
  TrendingDown, 
  Info,
  Banknote
} from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaRangoIngreso({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: any;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [rangoIngreso, setRangoIngreso] = useState(user?.rango_ingreso_familiar || "1");
  
  const cleanVal = (val: any) => (val && val !== "0" && val !== 0 ? val.toString() : "");

  const [ingresos, setIngresos] = useState({
    familiar: cleanVal(user?.monto_ingreso_familiar),
    extra: cleanVal(user?.monto_ingreso_extra),
    pension: cleanVal(user?.monto_ingreso_pension),
    ayuda: cleanVal(user?.monto_ingreso_ayuda)
  });

  const [egresos, setEgresos] = useState({
    mercado: cleanVal(user?.monto_egreso_mercado),
    vivienda: cleanVal(user?.monto_egreso_vivienda),
    salud: cleanVal(user?.monto_egreso_salud),
    servicios: cleanVal(user?.monto_egreso_servicios)
  });

  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  const ingresoRef = useRef<HTMLInputElement>(null);

  // Validaciones obligatorias
  const isIngresoValid = ingresos.familiar.trim() !== "";
  const isMercadoValid = egresos.mercado.trim() !== "";
  const isViviendaValid = egresos.vivienda.trim() !== "";
  const isSaludValid = egresos.salud.trim() !== "";
  const isServiciosValid = egresos.servicios.trim() !== "";

  const isValid = isIngresoValid && isMercadoValid && isViviendaValid && isSaludValid && isServiciosValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isIngresoValid && ingresoRef.current) {
        ingresoRef.current.focus();
      }
    };

    window.addEventListener('intentar-avanzar-ingresos', handleValidationAttempt);
    return () => window.removeEventListener('intentar-avanzar-ingresos', handleValidationAttempt);
  }, [isIngresoValid]);

  const handleSoloNumeros = (setter: any, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setter((prev: any) => ({ ...prev, [field]: val }));
  };

  // Alturas súper compactas para eliminar cualquier scroll vertical
  const incomeClass = "h-9 lg:h-7 bg-emerald-50/30 border-emerald-200 font-black text-emerald-900 text-xs lg:text-[11px] focus:bg-white focus:ring-1 focus:ring-emerald-500/10 transition-all px-2 rounded-xl";
  const expenseClass = "h-9 lg:h-7 bg-rose-50/30 border-rose-200 font-black text-rose-900 text-xs lg:text-[11px] focus:bg-white focus:ring-1 focus:ring-rose-500/10 transition-all px-2 rounded-xl";

  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 pb-8 lg:pb-0">
      
      {/* 1. SELECCIÓN DE RANGO */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
           <Banknote className="h-3.5 w-3.5 text-[#d4a843]" />
           <Label className="text-[8.5px] font-black uppercase tracking-widest text-slate-500">
             Estimación de Ingreso Familiar
           </Label>
        </div>
        
        <Label className="text-[10px] font-bold text-[#1e3a5f] block leading-tight">
          ¿En qué rango se ubica el ingreso total mensual de su grupo familiar?
        </Label>

        <RadioGroup 
          value={rangoIngreso} 
          onValueChange={setRangoIngreso}
          className="grid grid-cols-1 sm:grid-cols-3 gap-1.5"
          disabled={disabled}
        >
          {[
            { id: "ri1", val: "1", label: "1 Salario" },
            { id: "ri2", val: "2", label: "1 a 2 Salarios" },
            { id: "ri3", val: "3", label: "Más de 2" }
          ].map((opt) => (
            <label 
              key={opt.id} 
              htmlFor={opt.id}
              className="flex items-center justify-center gap-1.5 px-2.5 h-9 lg:h-8 rounded-lg border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
            >
              <RadioGroupItem value={opt.val} id={opt.id} className="h-3 w-3 text-[#1e3a5f]" />
              <span className="text-[8.5px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
        <input type="hidden" name="rango_ingreso_familiar" value={rangoIngreso} />
      </div>

      {/* 2. DETALLE NUMÉRICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        
        {/* BLOQUE DE INGRESOS */}
        <div className="p-2.5 bg-emerald-50/20 rounded-xl border border-emerald-100 space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <Label className="text-[8.5px] font-black text-emerald-700 uppercase tracking-widest">Ingresos ($)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            <div className="col-span-1 sm:col-span-2 space-y-0.5">
              <Label className={cn(
                "text-[7.5px] font-black uppercase transition-colors",
                hasAttemptedNext && !isIngresoValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                Sueldos (Familiar) {hasAttemptedNext && !isIngresoValid && "*"}
              </Label>
              <Input 
                ref={ingresoRef}
                name="monto_ingreso_familiar" 
                type="text" 
                inputMode="decimal"
                disabled={disabled} 
                value={ingresos.familiar}
                onChange={handleSoloNumeros(setIngresos, 'familiar')}
                required 
                placeholder="" 
                className={cn(
                  incomeClass,
                  hasAttemptedNext && !isIngresoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )} 
              />
            </div>

            {[
              { key: 'extra', label: 'Extras' },
              { key: 'pension', label: 'Pensión' }
            ].map((item) => (
              <div key={item.key} className="space-y-0.5">
                <Label className={cn(
                  "text-[7.5px] font-black uppercase transition-colors",
                  hasAttemptedNext && ingresos[item.key as keyof typeof ingresos].trim() === "" ? "text-red-500 font-extrabold" : "text-slate-500"
                )}>
                  {item.label} {hasAttemptedNext && ingresos[item.key as keyof typeof ingresos].trim() === "" && "*"}
                </Label>
                <Input 
                  name={`monto_ingreso_${item.key}`} 
                  type="text" 
                  inputMode="decimal"
                  disabled={disabled} 
                  value={ingresos[item.key as keyof typeof ingresos]} 
                  onChange={handleSoloNumeros(setIngresos, item.key)}
                  placeholder="" 
                  className={cn(
                    incomeClass,
                    hasAttemptedNext && ingresos[item.key as keyof typeof ingresos].trim() === "" && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                  )} 
                />
              </div>
            ))}

            <div className="col-span-1 sm:col-span-2 space-y-0.5">
              <Label className={cn(
                "text-[7.5px] font-black uppercase transition-colors",
                hasAttemptedNext && ingresos.ayuda.trim() === "" ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                Remesas / Ayudas {hasAttemptedNext && ingresos.ayuda.trim() === "" && "*"}
              </Label>
              <Input 
                name="monto_ingreso_ayuda" 
                type="text" 
                inputMode="decimal"
                disabled={disabled} 
                value={ingresos.ayuda} 
                onChange={handleSoloNumeros(setIngresos, 'ayuda')}
                placeholder="" 
                className={cn(
                  incomeClass,
                  hasAttemptedNext && ingresos.ayuda.trim() === "" && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )} 
              />
            </div>
          </div>
        </div>

        {/* BLOQUE DE EGRESOS */}
        <div className="p-2.5 bg-rose-50/20 rounded-xl border border-rose-100 space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <Label className="text-[8.5px] font-black text-rose-700 uppercase tracking-widest">Gastos ($)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {[
              { key: 'mercado', label: 'Alimentación', valid: isMercadoValid, span: 'col-span-1 sm:col-span-2' },
              { key: 'vivienda', label: 'Alquiler', valid: isViviendaValid },
              { key: 'salud', label: 'Salud', valid: isSaludValid }
            ].map((item) => (
              <div key={item.key} className={cn("space-y-0.5", item.span)}>
                <Label className={cn(
                  "text-[7.5px] font-black uppercase transition-colors",
                  hasAttemptedNext && !item.valid ? "text-red-500 font-extrabold" : "text-slate-500"
                )}>
                  {item.label} {hasAttemptedNext && !item.valid && "*"}
                </Label>
                <Input 
                  name={`monto_egreso_${item.key}`} 
                  type="text" 
                  inputMode="decimal"
                  disabled={disabled} 
                  value={egresos[item.key as keyof typeof egresos]}
                  onChange={handleSoloNumeros(setEgresos, item.key)}
                  required 
                  placeholder="" 
                  className={cn(
                    expenseClass,
                    hasAttemptedNext && !item.valid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                  )} 
                />
              </div>
            ))}

            <div className="col-span-1 sm:col-span-2 space-y-0.5">
              <Label className={cn(
                "text-[7.5px] font-black uppercase transition-colors",
                hasAttemptedNext && !isServiciosValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                Servicios (Luz, Agua...) {hasAttemptedNext && !isServiciosValid && "*"}
              </Label>
              <Input 
                name="monto_egreso_servicios" 
                type="text" 
                inputMode="decimal"
                disabled={disabled} 
                value={egresos.servicios}
                onChange={handleSoloNumeros(setEgresos, 'servicios')}
                required 
                placeholder="" 
                className={cn(
                  expenseClass,
                  hasAttemptedNext && !isServiciosValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nota de Veracidad */}
      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 shrink-0">
        <Info className="h-3 w-3 text-[#1e3a5f] shrink-0" />
        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight leading-none">
          Use el promedio mensual de los últimos 3 meses expresado en divisas ($).
        </p>
      </div>

    </div>
  )
}