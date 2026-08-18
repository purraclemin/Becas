"use client"

import React, { useState } from "react"
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
  user
}: {
  disabled: boolean;
  user: any;
}) {
  // Estado local para garantizar la persistencia del RadioGroup
  const [rangoIngreso, setRangoIngreso] = useState(user?.rango_ingreso_familiar || "1");

  // Estándar UNIMAR Academic Minimalist
  const editableClass = "h-10 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";
  const incomeClass = "h-10 bg-emerald-50/30 border-emerald-200 font-black text-emerald-900 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all px-3 rounded-xl";
  const expenseClass = "h-10 bg-rose-50/30 border-rose-200 font-black text-rose-900 text-xs focus:bg-white focus:ring-2 focus:ring-rose-500/10 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-500 pb-4">
      
      {/* 1. SELECCIÓN DE RANGO */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
           <Banknote className="h-4 w-4 text-[#d4a843]" />
           <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
             Estimación de Ingreso Familiar
           </Label>
        </div>
        
        <Label className="text-xs font-bold text-[#1e3a5f] block leading-snug">
          ¿En qué rango se ubica el ingreso total mensual de su grupo familiar?
        </Label>

        <RadioGroup 
          value={rangoIngreso} 
          onValueChange={setRangoIngreso}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
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
              className="flex items-center justify-center gap-2 px-3 h-10 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
            >
              <RadioGroupItem value={opt.val} id={opt.id} className="h-4 w-4 text-[#1e3a5f]" />
              <span className="text-[10px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>
        <input type="hidden" name="rango_ingreso_familiar" value={rangoIngreso} />
      </div>

      {/* 2. DETALLE NUMÉRICO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* BLOQUE DE INGRESOS */}
        <div className="p-4 bg-emerald-50/20 rounded-2xl border border-emerald-100 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <Label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Ingresos ($)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Sueldos (Familiar)</Label>
              <Input name="monto_ingreso_familiar" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_familiar || "0"} required placeholder="0.00" className={incomeClass} />
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Extras</Label>
              <Input name="monto_ingreso_extra" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_extra || "0"} placeholder="0.00" className={incomeClass} />
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Pensión</Label>
              <Input name="monto_ingreso_pension" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_pension || "0"} placeholder="0.00" className={incomeClass} />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Remesas / Ayudas</Label>
              <Input name="monto_ingreso_ayuda" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_ayuda || "0"} placeholder="0.00" className={incomeClass} />
            </div>
          </div>
        </div>

        {/* BLOQUE DE EGRESOS */}
        <div className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-600" />
            <Label className="text-[9px] font-black text-rose-700 uppercase tracking-widest">Gastos ($)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Alimentación</Label>
              <Input name="monto_egreso_mercado" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_mercado || "0"} required placeholder="0.00" className={expenseClass} />
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Alquiler</Label>
              <Input name="monto_egreso_vivienda" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_vivienda || "0"} required placeholder="0.00" className={expenseClass} />
            </div>
            <div className="space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Salud</Label>
              <Input name="monto_egreso_salud" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_salud || "0"} required placeholder="0.00" className={expenseClass} />
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Servicios (Luz, Agua...)</Label>
              <Input name="monto_egreso_servicios" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_servicios || "0"} required placeholder="0.00" className={expenseClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Nota de Veracidad */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5">
        <Info className="h-4 w-4 text-[#1e3a5f] shrink-0" />
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
          Use el promedio mensual de los últimos 3 meses expresado en divisas ($).
        </p>
      </div>

    </div>
  )
}