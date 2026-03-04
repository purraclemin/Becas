"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * 🟢 COMPONENTE: CONTENEDOR DE GRUPO (Diseño Inmersivo)
 * Reemplaza a las secciones colapsables para mostrar la información 
 * de forma abierta y elegante como en la Imagen 1.
 */
export function GroupContainer({ titulo, subtitulo, children, className = "" }: any) {
  return (
    <div className={`space-y-6 animate-in fade-in duration-700 ${className}`}>
      <div className="flex flex-col border-b border-slate-100 pb-4 mb-2">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1e3a5f]">
          {titulo}
        </h4>
        {subtitulo && (
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
            {subtitulo}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  )
}

/**
 * 🟢 COMPONENTE: CAMPO DE TEXTO / NÚMERO (Estilo Inmersivo)
 */
export function Field({ label, name, type = "text", disabled = false, readOnly = false, placeholder = "", className = "", defaultValue = "", required = false }: any) {
  const isLocked = readOnly || disabled;
  
  return (
    <div className={`space-y-2.5 ${className}`}>
      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-tight">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <Input 
        name={name} 
        type={type} 
        readOnly={isLocked} 
        required={required && !isLocked} 
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`text-xs h-12 px-4 font-bold transition-all rounded-xl border-2 ${
          isLocked 
            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
            : "bg-white border-slate-50 text-[#1e3a5f] focus-visible:ring-4 focus-visible:ring-[#1e3a5f]/5 focus-visible:border-[#1e3a5f] hover:border-slate-200 shadow-sm"
        }`} 
      />
    </div>
  )
}

/**
 * 🟢 COMPONENTE: SELECTOR DESPLEGABLE (Estilo Inmersivo)
 */
export function SelectField({ label, name, disabled, options, placeholder = "Seleccionar...", defaultValue = "", required = false }: any) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  useEffect(() => {
    if (defaultValue !== undefined) setInternalValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="space-y-2.5">
      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-tight">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <Select 
        disabled={disabled} 
        value={internalValue}
        onValueChange={setInternalValue}
      >
        <SelectTrigger 
          className={`text-xs h-12 px-4 font-bold transition-all rounded-xl border-2 disabled:opacity-100 ${
            disabled 
              ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
              : "bg-white border-slate-50 text-[#1e3a5f] hover:border-slate-200 shadow-sm"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
          {options.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold uppercase py-3">
                {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={internalValue} />
    </div>
  )
}

/**
 * 🟢 COMPONENTE: CASILLA DE VERIFICACIÓN (Checkboxes de Servicios/Equipos)
 * Diseñado para que entren los 8 servicios sin amontonarse.
 */
export function CheckItem({ label, name, disabled, defaultChecked = false }: any) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  return (
    <div className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all ${
      disabled 
        ? "bg-slate-50 border-slate-100 opacity-60" 
        : checked 
          ? "bg-[#1e3a5f]/5 border-[#1e3a5f]/20 shadow-sm" 
          : "bg-white border-slate-50 hover:border-slate-200 shadow-sm"
    }`}>
      <Checkbox 
        id={name} 
        checked={checked}
        onCheckedChange={(val: boolean) => setChecked(val)} 
        disabled={disabled} 
        className="h-5 w-5 rounded-md border-2 border-slate-300 data-[state=checked]:bg-[#1e3a5f] data-[state=checked]:border-[#1e3a5f] disabled:opacity-100"
      />
      <Label 
        htmlFor={name} 
        className={`text-[10px] font-black cursor-pointer uppercase tracking-tight ${disabled ? "text-slate-300" : "text-[#1e3a5f]"}`}
      >
        {label}
      </Label>
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
    </div>
  )
}

/**
 * 🟢 COMPONENTE: BOTÓN DE OPCIÓN (RADIO)
 */
export function RadioItem({ value, id, label, disabled }: { value: string, id: string, label: string, disabled?: boolean }) {
  return (
    <div className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all group ${
      disabled 
        ? "bg-slate-50 border-slate-100 opacity-60" 
        : "bg-white border-slate-50 hover:border-[#1e3a5f]/20 cursor-pointer"
    }`}>
      <RadioGroupItem 
        value={value} 
        id={id} 
        disabled={disabled} 
        className="h-5 w-5 border-2 border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f] disabled:opacity-100" 
      />
      <Label 
        htmlFor={id} 
        className={`text-[10px] font-black uppercase tracking-tight cursor-pointer ${disabled ? "text-slate-300" : "text-[#1e3a5f]"}`}
      >
        {label}
      </Label>
    </div>
  )
}