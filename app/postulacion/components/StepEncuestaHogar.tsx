"use client"

import React, { useState } from "react"
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

// 🟢 Componente extraído fuera de StepEncuestaHogar para evitar reinicio de estado al renderizar
const CheckItem = ({ label, name, icon: Icon, defaultChecked, disabled }: any) => {
  const [checked, setChecked] = useState(defaultChecked || false);

  return (
    <label className={cn(
      "flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/30 transition-all cursor-pointer group hover:border-[#1e3a5f]/20 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f]/20",
      disabled && "opacity-60 cursor-not-allowed"
    )}>
      <input 
        type="checkbox" 
        disabled={disabled}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]" 
      />
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-3.5 w-3.5 text-slate-400 group-has-[:checked]:text-[#1e3a5f] shrink-0" />
        <span className="text-[9px] font-black uppercase text-slate-600 group-has-[:checked]:text-[#1e3a5f] tracking-wider truncate">
          {label}
        </span>
      </div>
    </label>
  );
};

export function StepEncuestaHogar({
  disabled,
  user
}: {
  disabled: boolean;
  user: any;
}) {
  const [tipoVivienda, setTipoVivienda] = useState(user?.vivienda_tipo || "");
  const [tenenciaVivienda, setTenenciaVivienda] = useState(user?.vivienda_estatus || "");

  // Estándar UNIMAR Academic Minimalist
  const editableClass = "h-10 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-500 pb-4">
      
      {/* 1. ESTRUCTURA Y TENENCIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Building2 className="h-3 w-3 text-[#d4a843]" /> Tipo de Estructura
          </Label>
          <Select 
            disabled={disabled} 
            value={tipoVivienda}
            onValueChange={setTipoVivienda}
            required
          >
            <SelectTrigger className={editableClass}>
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {["Quinta", "Casa", "Apartamento", "Vivienda rural", "Habitación", "Otro"].map(v => (
                <SelectItem key={v} value={v} className="text-xs font-bold uppercase py-2">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="vivienda_tipo" value={tipoVivienda} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Key className="h-3 w-3 text-[#d4a843]" /> Tenencia de la Vivienda
          </Label>
          <Select 
            disabled={disabled} 
            value={tenenciaVivienda}
            onValueChange={setTenenciaVivienda}
            required
          >
            <SelectTrigger className={editableClass}>
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {["Propia", "Alquilada", "Residencia", "Prestada / Cedida", "Pagándose"].map(v => (
                <SelectItem key={v} value={v} className="text-xs font-bold uppercase py-2">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="vivienda_estatus" value={tenenciaVivienda} />
        </div>
      </div>

      {/* 2. SERVICIOS Y EQUIPAMIENTO */}
      <div className="space-y-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">
            Servicios y Equipamiento
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <CheckItem disabled={disabled} label="Agua Blanca" name="serv_agua" icon={Droplet} defaultChecked={user?.serv_agua === "on"} />
          <CheckItem disabled={disabled} label="Electricidad" name="serv_luz" icon={Zap} defaultChecked={user?.serv_luz === "on"} />
          <CheckItem disabled={disabled} label="Gas Doméstico" name="serv_gas" icon={Flame} defaultChecked={user?.serv_gas === "on"} />
          <CheckItem disabled={disabled} label="Aseo Urbano" name="serv_aseo" icon={Trash2} defaultChecked={user?.serv_aseo === "on"} />
          <CheckItem disabled={disabled} label="Internet" name="serv_internet" icon={Wifi} defaultChecked={user?.serv_internet === "on"} />
          <CheckItem disabled={disabled} label="Nevera" name="equip_nevera" icon={Refrigerator} defaultChecked={user?.equip_nevera === "on"} />
          <CheckItem disabled={disabled} label="Lavadora" name="equip_lavadora" icon={Waves} defaultChecked={user?.equip_lavadora === "on"} />
          <CheckItem disabled={disabled} label="TV por Cable" name="equip_cable" icon={Tv} defaultChecked={user?.equip_cable === "on"} />
        </div>
      </div>

      {/* 3. NOTA INFORMATIVA */}
      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center gap-3">
        <Info className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-[9px] text-amber-700 font-bold uppercase tracking-tight leading-relaxed">
          Las condiciones de vivienda son indicadores fundamentales para el baremo socioeconómico.
        </p>
      </div>

    </div>
  )
}