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

  // Estilo ultra-compacto institucional
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[10px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";
  const incomeClass = "h-8 bg-white border-emerald-200 font-black text-emerald-900 text-[10px] focus:ring-1 focus:ring-emerald-500/10 transition-all px-2";
  const expenseClass = "h-8 bg-white border-rose-200 font-black text-rose-900 text-[10px] focus:ring-1 focus:ring-rose-500/10 transition-all px-2";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* 1. SELECCIÓN DE RANGO (Compacta) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
           <Banknote className="h-3.5 w-3.5 text-[#d4a843]" />
           <Label className="text-[8px] font-black uppercase tracking-widest text-slate-500">
             Estimación de Ingreso Familiar
           </Label>
        </div>
        
        <Label className="text-[10px] font-bold text-[#1e3a5f] block leading-none">
          ¿En qué rango se ubica el ingreso total mensual de su grupo familiar?
        </Label>

        <RadioGroup 
          value={rangoIngreso} 
          onValueChange={setRangoIngreso}
          className="flex gap-2 pt-1"
          disabled={disabled}
        >
          {[
            { id: "ri1", val: "1", label: "1 Salario" },
            { id: "ri2", val: "2", label: "1 a 2 Salarios" },
            { id: "ri3", val: "3", label: "Más de 2" }
          ].map((opt) => (
            <div key={opt.id} className="flex-1 flex items-center gap-2 px-3 h-8 rounded-lg border border-slate-200 bg-slate-50/30 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer">
              <RadioGroupItem value={opt.val} id={opt.id} className="h-3 w-3" />
              <Label htmlFor={opt.id} className="text-[9px] font-bold text-[#1e3a5f] cursor-pointer uppercase">{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
        {/* Input oculto para asegurar la persistencia en el FormData maestro */}
        <input type="hidden" name="rango_ingreso_familiar" value={rangoIngreso} />
      </div>

      {/* 2. DETALLE NUMÉRICO (Grids de alta densidad) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* BLOQUE DE INGRESOS (Emerald Theme) */}
        <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <Label className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Ingresos ($)</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            <div className="col-span-2 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Sueldos y Salarios (Solo Familiar no Incluir Ingreso propio)</Label>
              <Input name="monto_ingreso_familiar" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_familiar} required placeholder="0.00" className={incomeClass} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Extras</Label>
              <Input name="monto_ingreso_extra" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_extra} placeholder="0.00" className={incomeClass} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Pensión</Label>
              <Input name="monto_ingreso_pension" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_pension} placeholder="0.00" className={incomeClass} />
            </div>
            <div className="col-span-2 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Remesas / Ayudas</Label>
              {/* CORRECCIÓN: name cambiado a monto_ingreso_ayuda para que coincida con StepResumen */}
              <Input name="monto_ingreso_ayuda" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_ingreso_ayuda || user?.monto_ingreso_ayuda} placeholder="0.00" className={incomeClass} />
            </div>
          </div>
        </div>

        {/* BLOQUE DE EGRESOS (Rose Theme) */}
        <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <Label className="text-[8px] font-black text-rose-700 uppercase tracking-widest">Gastos ($)</Label>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            <div className="col-span-2 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Alimentación (Mercado)</Label>
              <Input name="monto_egreso_mercado" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_mercado} required placeholder="0.00" className={expenseClass} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Alquiler</Label>
              <Input name="monto_egreso_vivienda" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_vivienda} required placeholder="0.00" className={expenseClass} />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Salud</Label>
              <Input name="monto_egreso_salud" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_salud} required placeholder="0.00" className={expenseClass} />
            </div>
            <div className="col-span-2 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Servicios (Luz, Agua...)</Label>
              <Input name="monto_egreso_servicios" type="number" step="0.01" disabled={disabled} defaultValue={user?.monto_egreso_servicios} required placeholder="0.00" className={expenseClass} />
            </div>
          </div>
        </div>

      </div>

      {/* Nota de Veracidad (Ultra-compacta) */}
      <div className="p-2 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 shrink-0">
        <Info className="h-3 w-3 text-[#1e3a5f] shrink-0" />
        <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight leading-none">
          Use el promedio mensual de los últimos 3 meses expresado en divisas ($).
        </p>
      </div>

    </div>
  )
}