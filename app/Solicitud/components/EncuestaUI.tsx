"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

/**
 * 🟢 COMPONENTE: CONTENEDOR DE SECCIÓN PRINCIPAL
 */
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

/**
 * 🟢 COMPONENTE: SECCIÓN INTERNA (ACORDEÓN)
 */
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

/**
 * 🟢 COMPONENTE: CAMPO DE TEXTO / NÚMERO
 * Se añadió soporte explícito para 'required'.
 */
export function Field({ label, name, type = "text", disabled = false, readOnly = false, placeholder = "", className = "", defaultValue = "", required = false }: any) {
  const isLocked = readOnly || disabled;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-tight">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <Input 
        name={name} 
        type={type} 
        readOnly={isLocked} 
        required={required && !isLocked} // Solo es requerido si no está bloqueado
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={`text-[11px] h-10 font-bold transition-all ${
          isLocked 
            ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-100 shadow-none" 
            : "bg-white border-slate-200 text-[#1e3a5f] focus-visible:ring-[#1e3a5f] hover:border-slate-300"
        }`} 
      />
    </div>
  )
}

/**
 * 🟢 COMPONENTE: SELECTOR DESPLEGABLE
 * Se añadió 'required' al input oculto para validación de formulario.
 */
export function SelectField({ label, name, disabled, options, placeholder = "Seleccionar...", defaultValue = "", required = false }: any) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  useEffect(() => {
    setInternalValue(defaultValue);
  }, [defaultValue]);

  return (
    <div className="space-y-2">
      <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-tight">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <Select 
        disabled={disabled} 
        value={internalValue}
        onValueChange={setInternalValue}
      >
        <SelectTrigger 
          className={`text-[11px] h-10 font-bold transition-all disabled:opacity-100 ${
            disabled 
              ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed shadow-none" 
              : "bg-white border-slate-200 text-[#1e3a5f] hover:border-slate-300"
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium uppercase tracking-tight">
                {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* El input oculto ahora lleva el atributo required para que el navegador lo valide */}
      <input 
        type="hidden" 
        name={name} 
        value={internalValue} 
        required={required && !disabled} 
      />
    </div>
  )
}

/**
 * 🟢 COMPONENTE: CASILLA DE VERIFICACIÓN (CHECKBOX)
 */
export function CheckItem({ label, name, disabled, defaultChecked = false }: any) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    setChecked(defaultChecked);
  }, [defaultChecked]);

  return (
    <div className={`flex items-center space-x-2 p-3 rounded-xl border transition-all ${
      disabled 
        ? "bg-slate-100 border-slate-200" 
        : "bg-white border-slate-100 hover:border-[#d4a843]/40 shadow-sm"
    }`}>
      <Checkbox 
        id={name} 
        checked={checked}
        onCheckedChange={(val: boolean) => setChecked(val)} 
        disabled={disabled} 
        className="disabled:opacity-100"
      />
      <Label 
        htmlFor={name} 
        className={`text-[10px] font-bold cursor-pointer uppercase tracking-tight ${disabled ? "text-slate-400" : "text-slate-600"}`}
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
    <div className={`flex items-center space-x-2 p-3 rounded-xl border transition-all ${
      disabled 
        ? "bg-slate-100 border-slate-200 opacity-80" 
        : "bg-slate-50 border-slate-200 hover:bg-white hover:border-[#1e3a5f]/20 cursor-pointer"
    }`}>
      <RadioGroupItem 
        value={value} 
        id={id} 
        disabled={disabled} 
        className="disabled:opacity-100 disabled:border-slate-300" 
      />
      <Label 
        htmlFor={id} 
        className={`text-[10px] font-black uppercase tracking-tight cursor-pointer ${disabled ? "text-slate-400" : "text-[#1e3a5f]"}`}
      >
        {label}
      </Label>
    </div>
  )
}