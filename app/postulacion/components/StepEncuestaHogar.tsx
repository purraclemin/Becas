"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Building2, 
  Key, 
  Zap, 
  Droplet, 
  Flame, 
  Trash2, 
  Wifi, 
  Tv, 
  Refrigerator, 
  Info,
  Waves
} from "lucide-react"
import { cn } from "@/lib/utils"

const CheckItem = ({ label, name, icon: Icon, defaultChecked, disabled }: any) => {
  const [checked, setChecked] = useState(defaultChecked || false);

  return (
    <label className={cn(
      "flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/30 transition-all cursor-pointer group hover:border-[#1e3a5f]/20 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f]/20",
      disabled && "opacity-60 cursor-not-allowed"
    )}>
      <input 
        type="checkbox" 
        disabled={disabled}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-slate-300 text-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]" 
      />
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="h-3 w-3 text-slate-400 group-has-[:checked]:text-[#1e3a5f] shrink-0" />
        <span className="text-[8.5px] font-black uppercase text-slate-600 group-has-[:checked]:text-[#1e3a5f] tracking-wider truncate">
          {label}
        </span>
      </div>
    </label>
  );
};

export function StepEncuestaHogar({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: any;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [tipoVivienda, setTipoVivienda] = useState(user?.vivienda_tipo || "");
  const [tenenciaVivienda, setTenenciaVivienda] = useState(user?.vivienda_estatus || "");
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  const estructuraRef = useRef<HTMLButtonElement>(null);

  const isEstructuraValid = tipoVivienda !== "";
  const isTenenciaValid = tenenciaVivienda !== "";
  const isValid = isEstructuraValid && isTenenciaValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Escuchador global del evento para validación visual y enfoque automático
  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isEstructuraValid && estructuraRef.current) {
        estructuraRef.current.focus();
      }
    };

    window.addEventListener('intentar-avanzar-hogar', handleValidationAttempt);
    return () => window.removeEventListener('intentar-avanzar-hogar', handleValidationAttempt);
  }, [isEstructuraValid]);

  // Estándar UF-Scale compacto sin scroll
  const editableClass = "h-10 lg:h-8 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs lg:text-[11px] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-2.5 rounded-xl";

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      
      {/* 1. ESTRUCTURA Y TENENCIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="space-y-0.5">
          <Label className={cn(
            "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
            hasAttemptedNext && !isEstructuraValid ? "text-red-500 font-extrabold" : "text-slate-500"
          )}>
            <Building2 className="h-2.5 w-2.5 text-[#d4a843]" /> Tipo de Estructura {hasAttemptedNext && !isEstructuraValid && "*"}
          </Label>
          <Select 
            disabled={disabled} 
            value={tipoVivienda}
            onValueChange={setTipoVivienda}
            required
          >
            <SelectTrigger 
              ref={estructuraRef}
              className={cn(
                editableClass,
                hasAttemptedNext && !isEstructuraValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
              )}
            >
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {["Quinta", "Casa", "Apartamento", "Vivienda rural", "Habitación", "Otro"].map(v => (
                <SelectItem key={v} value={v} className="text-sm lg:text-xs font-bold uppercase py-2">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="vivienda_tipo" value={tipoVivienda} />
        </div>

        <div className="space-y-0.5">
          <Label className={cn(
            "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
            hasAttemptedNext && !isTenenciaValid ? "text-red-500 font-extrabold" : "text-slate-500"
          )}>
            <Key className="h-2.5 w-2.5 text-[#d4a843]" /> Tenencia de la Vivienda {hasAttemptedNext && !isTenenciaValid && "*"}
          </Label>
          <Select 
            disabled={disabled} 
            value={tenenciaVivienda}
            onValueChange={setTenenciaVivienda}
            required
          >
            <SelectTrigger className={cn(
              editableClass,
              hasAttemptedNext && !isTenenciaValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
            )}>
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {["Propia", "Alquilada", "Residencia", "Prestada / Cedida", "Pagándose"].map(v => (
                <SelectItem key={v} value={v} className="text-sm lg:text-xs font-bold uppercase py-2">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="vivienda_estatus" value={tenenciaVivienda} />
        </div>

      </div>

      {/* 2. SERVICIOS Y EQUIPAMIENTO (DRY mediante arreglo) */}
      <div className="space-y-2 p-3 bg-slate-50/70 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">
            Servicios y Equipamiento
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Agua Blanca", name: "serv_agua", icon: Droplet, key: "serv_agua" },
            { label: "Electricidad", name: "serv_luz", icon: Zap, key: "serv_luz" },
            { label: "Gas Doméstico", name: "serv_gas", icon: Flame, key: "serv_gas" },
            { label: "Aseo Urbano", name: "serv_aseo", icon: Trash2, key: "serv_aseo" },
            { label: "Internet", name: "serv_internet", icon: Wifi, key: "serv_internet" },
            { label: "Nevera", name: "equip_nevera", icon: Refrigerator, key: "equip_nevera" },
            { label: "Lavadora", name: "equip_lavadora", icon: Waves, key: "equip_lavadora" },
            { label: "TV por Cable", name: "equip_cable", icon: Tv, key: "equip_cable" }
          ].map((item) => (
            <CheckItem 
              key={item.key} 
              disabled={disabled} 
              label={item.label} 
              name={item.name} 
              icon={item.icon} 
              defaultChecked={user?.[item.key] === "on"} 
            />
          ))}
        </div>
      </div>

      {/* Nota informativa compacta */}
      <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center gap-2.5 shrink-0">
        <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <p className="text-[8.5px] text-amber-700 font-bold uppercase tracking-tight leading-relaxed">
          Las condiciones de vivienda son indicadores fundamentales para el baremo socioeconómico.
        </p>
      </div>

    </div>
  )
}