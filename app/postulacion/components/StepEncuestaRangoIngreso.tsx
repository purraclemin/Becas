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
import type { PostulacionUser } from "../types"

interface IngresosState {
  familiar: string;
  extra: string;
  pension: string;
  ayuda: string;
}

interface EgresosState {
  mercado: string;
  vivienda: string;
  salud: string;
  servicios: string;
}

const sanitizarEnteroInicial = (val: string | number | null | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const parsed = Math.trunc(Number(val));
  return !isNaN(parsed) && parsed >= 0 ? String(parsed) : "";
};

export function StepEncuestaRangoIngreso({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [rangoIngreso, setRangoIngreso] = useState<string>(user?.rango_ingreso_familiar || "1");

  const [ingresos, setIngresos] = useState<IngresosState>({
    familiar: sanitizarEnteroInicial(user?.monto_ingreso_familiar),
    extra: sanitizarEnteroInicial(user?.monto_ingreso_extra),
    pension: sanitizarEnteroInicial(user?.monto_ingreso_pension),
    ayuda: sanitizarEnteroInicial(user?.monto_ingreso_ayuda)
  });

  const [egresos, setEgresos] = useState<EgresosState>({
    mercado: sanitizarEnteroInicial(user?.monto_egreso_mercado),
    vivienda: sanitizarEnteroInicial(user?.monto_egreso_vivienda),
    salud: sanitizarEnteroInicial(user?.monto_egreso_salud),
    servicios: sanitizarEnteroInicial(user?.monto_egreso_servicios)
  });

  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const ingresoFamiliarRef = useRef<HTMLInputElement>(null);
  const ingresoExtraRef = useRef<HTMLInputElement>(null);
  const ingresoPensionRef = useRef<HTMLInputElement>(null);
  const ingresoAyudaRef = useRef<HTMLInputElement>(null);
  const egresoMercadoRef = useRef<HTMLInputElement>(null);
  const egresoViviendaRef = useRef<HTMLInputElement>(null);
  const egresoSaludRef = useRef<HTMLInputElement>(null);
  const egresoServiciosRef = useRef<HTMLInputElement>(null);

  // Validaciones obligatorias (enteros >= 0)
  const isIngresoValid = ingresos.familiar.trim() !== "";
  const isExtraValid = ingresos.extra.trim() !== "";
  const isPensionValid = ingresos.pension.trim() !== "";
  const isAyudaValid = ingresos.ayuda.trim() !== "";

  const isMercadoValid = egresos.mercado.trim() !== "";
  const isViviendaValid = egresos.vivienda.trim() !== "";
  const isSaludValid = egresos.salud.trim() !== "";
  const isServiciosValid = egresos.servicios.trim() !== "";

  const isValid =
    isIngresoValid &&
    isExtraValid &&
    isPensionValid &&
    isAyudaValid &&
    isMercadoValid &&
    isViviendaValid &&
    isSaludValid &&
    isServiciosValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isIngresoValid && ingresoFamiliarRef.current) ingresoFamiliarRef.current.focus();
      else if (!isExtraValid && ingresoExtraRef.current) ingresoExtraRef.current.focus();
      else if (!isPensionValid && ingresoPensionRef.current) ingresoPensionRef.current.focus();
      else if (!isAyudaValid && ingresoAyudaRef.current) ingresoAyudaRef.current.focus();
      else if (!isMercadoValid && egresoMercadoRef.current) egresoMercadoRef.current.focus();
      else if (!isViviendaValid && egresoViviendaRef.current) egresoViviendaRef.current.focus();
      else if (!isSaludValid && egresoSaludRef.current) egresoSaludRef.current.focus();
      else if (!isServiciosValid && egresoServiciosRef.current) egresoServiciosRef.current.focus();
    };

    window.addEventListener("intentar-avanzar-ingresos", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-ingresos", handleValidationAttempt);
  }, [
    isIngresoValid,
    isExtraValid,
    isPensionValid,
    isAyudaValid,
    isMercadoValid,
    isViviendaValid,
    isSaludValid,
    isServiciosValid
  ]);

  // Sanitización estricta: solo números enteros no negativos
  const handleSoloEnterosIngresos = (field: keyof IngresosState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 7);
    setIngresos(prev => ({ ...prev, [field]: val }));
  };

  const handleSoloEnterosEgresos = (field: keyof EgresosState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 7);
    setEgresos(prev => ({ ...prev, [field]: val }));
  };

  const incomeClass = "h-12 lg:h-9 bg-emerald-50/30 border-emerald-200 font-black text-emerald-900 text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500/10 transition-all px-2.5 rounded-xl";
  const expenseClass = "h-12 lg:h-9 bg-rose-50/30 border-rose-200 font-black text-rose-900 text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-rose-500/10 transition-all px-2.5 rounded-xl";

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-8 lg:pb-0">

      {/* 1. SELECCIÓN DE RANGO */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Banknote className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[8.5px] font-black uppercase tracking-widest text-slate-500">
            Estimación de Ingreso Familiar
          </Label>
        </div>

        <Label className="text-xs lg:text-[10px] font-bold text-[#1e3a5f] block leading-tight">
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
              className="flex items-center justify-center gap-1.5 px-2.5 h-12 lg:h-9 rounded-lg border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
            >
              <RadioGroupItem value={opt.val} id={opt.id} className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span className="text-xs lg:text-[9px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
        <input type="hidden" name="rango_ingreso_familiar" value={rangoIngreso} />
      </div>

      {/* 2. DETALLE NUMÉRICO (ENTEROS NO NEGATIVOS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">

        {/* BLOQUE DE INGRESOS */}
        <div className="p-2.5 bg-emerald-50/20 rounded-xl border border-emerald-100 space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <Label className="text-[8.5px] font-black text-emerald-700 uppercase tracking-widest">Ingresos ($ enteros)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="col-span-1 sm:col-span-2 space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase transition-colors",
                hasAttemptedNext && !isIngresoValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                Sueldos (Familiar) {hasAttemptedNext && !isIngresoValid && "*"}
              </Label>
              <Input
                ref={ingresoFamiliarRef}
                name="monto_ingreso_familiar"
                type="text"
                inputMode="numeric"
                maxLength={7}
                disabled={disabled}
                value={ingresos.familiar}
                onChange={handleSoloEnterosIngresos("familiar")}
                required
                placeholder="0"
                className={cn(
                  incomeClass,
                  hasAttemptedNext && !isIngresoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>

            {([
              { key: "extra", label: "Extras", valid: isExtraValid, ref: ingresoExtraRef },
              { key: "pension", label: "Pensión", valid: isPensionValid, ref: ingresoPensionRef }
            ] as const).map((item) => (
              <div key={item.key} className="space-y-0.5">
                <Label className={cn(
                  "text-[8px] font-black uppercase transition-colors",
                  hasAttemptedNext && !item.valid ? "text-red-500 font-extrabold" : "text-slate-500"
                )}>
                  {item.label} {hasAttemptedNext && !item.valid && "*"}
                </Label>
                <Input
                  ref={item.ref}
                  name={`monto_ingreso_${item.key}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  disabled={disabled}
                  value={ingresos[item.key]}
                  onChange={handleSoloEnterosIngresos(item.key)}
                  required
                  placeholder="0"
                  className={cn(
                    incomeClass,
                    hasAttemptedNext && !item.valid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                  )}
                />
              </div>
            ))}

            <div className="col-span-1 sm:col-span-2 space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase transition-colors",
                hasAttemptedNext && !isAyudaValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                Remesas / Ayudas {hasAttemptedNext && !isAyudaValid && "*"}
              </Label>
              <Input
                ref={ingresoAyudaRef}
                name="monto_ingreso_ayuda"
                type="text"
                inputMode="numeric"
                maxLength={7}
                disabled={disabled}
                value={ingresos.ayuda}
                onChange={handleSoloEnterosIngresos("ayuda")}
                required
                placeholder="0"
                className={cn(
                  incomeClass,
                  hasAttemptedNext && !isAyudaValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>
          </div>
        </div>

        {/* BLOQUE DE EGRESOS */}
        <div className="p-2.5 bg-rose-50/20 rounded-xl border border-rose-100 space-y-2">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <Label className="text-[8.5px] font-black text-rose-700 uppercase tracking-widest">Gastos ($ enteros)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([
              { key: "mercado", label: "Alimentación", valid: isMercadoValid, span: "col-span-1 sm:col-span-2", ref: egresoMercadoRef },
              { key: "vivienda", label: "Alquiler", valid: isViviendaValid, span: "", ref: egresoViviendaRef },
              { key: "salud", label: "Salud", valid: isSaludValid, span: "", ref: egresoSaludRef }
            ] as const).map((item) => (
              <div key={item.key} className={cn("space-y-0.5", item.span)}>
                <Label className={cn(
                  "text-[8px] font-black uppercase transition-colors",
                  hasAttemptedNext && !item.valid ? "text-red-500 font-extrabold" : "text-slate-500"
                )}>
                  {item.label} {hasAttemptedNext && !item.valid && "*"}
                </Label>
                <Input
                  ref={item.ref}
                  name={`monto_egreso_${item.key}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  disabled={disabled}
                  value={egresos[item.key]}
                  onChange={handleSoloEnterosEgresos(item.key)}
                  required
                  placeholder="0"
                  className={cn(
                    expenseClass,
                    hasAttemptedNext && !item.valid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                  )}
                />
              </div>
            ))}

            <div className="col-span-1 sm:col-span-2 space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase transition-colors",
                hasAttemptedNext && !isServiciosValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                Servicios (Luz, Agua...) {hasAttemptedNext && !isServiciosValid && "*"}
              </Label>
              <Input
                ref={egresoServiciosRef}
                name="monto_egreso_servicios"
                type="text"
                inputMode="numeric"
                maxLength={7}
                disabled={disabled}
                value={egresos.servicios}
                onChange={handleSoloEnterosEgresos("servicios")}
                required
                placeholder="0"
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
        <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-tight leading-none">
          Ingrese el promedio mensual de los últimos 3 meses en divisas ($), solo números enteros sin negativos (coloque 0 si no aplica).
        </p>
      </div>

    </div>
  )
}