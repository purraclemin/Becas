"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

export function SeccionFormulario({ titulo, icono: Icon, iconoBg, iconoColor, children, estaAbierto, alAlternar }: any) {
  return (
    <div className="border rounded-2xl bg-white shadow-sm overflow-hidden border-slate-200 transition-all duration-300">
      <button 
        type="button" 
        onClick={alAlternar}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-all focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className={`${iconoBg} p-2 rounded-lg ${iconoColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#1e3a5f]">{titulo}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${estaAbierto ? "rotate-180" : ""}`} />
      </button>
      
      <div className={`px-5 pb-6 pt-2 ${estaAbierto ? "block animate-in slide-in-from-top-2 fade-in duration-300" : "hidden"}`}>
        {children}
      </div>
    </div>
  )
}

export function CustomSection({ title, icon: Icon, isOpen, onToggle, children }: any) {
  return (
    <div className="border rounded-2xl bg-white px-4 border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      <button 
        type="button" 
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left hover:opacity-80 focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-[#d4a843]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#1e3a5f]">{title}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <div className={`pb-6 pt-2 space-y-6 ${isOpen ? "block animate-in slide-in-from-top-2 fade-in duration-300" : "hidden"}`}>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, name, type = "text", disabled = false, readOnly = false, placeholder = "", className = "", defaultValue = "" }: any) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-tight">{label}</Label>
      <Input 
        name={name} 
        type={type} 
        readOnly={readOnly || disabled} 
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`text-[11px] h-9 font-bold transition-colors ${
          (readOnly || disabled) 
            // 🟢 AJUSTE VISUAL: Fondo más oscuro y borde visible para denotar bloqueo
            ? "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed select-none opacity-100 pointer-events-none shadow-none" 
            : "bg-white border-slate-200 text-[#1e3a5f] focus-visible:ring-[#1e3a5f]"
        }`} 
      />
    </div>
  )
}

export function SelectField({ label, name, disabled, options, placeholder = "Seleccionar...", defaultValue = "" }: any) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  useEffect(() => {
    setInternalValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-tight">{label}</Label>
      <Select 
        disabled={disabled} 
        defaultValue={defaultValue} 
        value={internalValue}
        onValueChange={setInternalValue}
      >
        <SelectTrigger 
          className={`text-[11px] h-9 font-bold transition-colors disabled:opacity-100 [&>svg]:opacity-100 ${
            disabled 
               // 🟢 AJUSTE VISUAL: Fondo oscuro para Selects bloqueados
              ? "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
              : "bg-white border-slate-200 text-[#1e3a5f]"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={internalValue} />
    </div>
  )
}

export function CheckItem({ label, name, disabled, defaultChecked = false }: any) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-xl border transition-all ${
      disabled 
        // 🟢 AJUSTE VISUAL: Fondo oscuro para Checkboxes bloqueados
        ? "bg-slate-200/60 border-slate-300" 
        : "bg-white border-slate-100 hover:border-[#d4a843]/30 shadow-sm"
    }`}>
      <Checkbox 
        id={name} 
        checked={checked}
        onCheckedChange={(val: boolean) => setChecked(val)} 
        disabled={disabled} 
        className={`disabled:opacity-100 ${
            disabled ? "border-slate-400 data-[state=checked]:bg-slate-500 data-[state=checked]:border-slate-500" : ""
        }`}
      />
      <Label 
        htmlFor={name} 
        className={`text-[10px] font-bold cursor-pointer ${disabled ? "text-slate-500" : "text-slate-600"}`}
      >
        {label}
      </Label>
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
    </div>
  )
}

export function RadioItem({ value, id, label, disabled }: { value: string, id: string, label: string, disabled?: boolean }) {
  return (
    <div className={`flex items-center space-x-2 p-3 rounded-xl border transition-all ${
      disabled 
        // 🟢 AJUSTE VISUAL: Fondo oscuro para Radios bloqueados
        ? "bg-slate-200/60 border-slate-300 opacity-80" 
        : "bg-slate-50 border-slate-200 hover:bg-white"
    }`}>
      <RadioGroupItem value={value} id={id} disabled={disabled} className="disabled:opacity-100 disabled:border-slate-400 disabled:text-slate-500" />
      <Label 
        htmlFor={id} 
        className={`text-[10px] font-bold cursor-pointer ${disabled ? "text-slate-500" : "text-slate-700"}`}
      >
        {label}
      </Label>
    </div>
  )
}