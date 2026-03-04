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

export function StepEncuestaHogar({
  disabled,
  user
}: {
  disabled: boolean;
  user: any;
}) {
  // Estados para persistir los select en inputs ocultos
  const [tipoVivienda, setTipoVivienda] = useState(user?.vivienda_tipo || "");
  const [tenenciaVivienda, setTenenciaVivienda] = useState(user?.vivienda_estatus || "");

  // Estilos ultra-compactos institucionales
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[10px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";

  // Helper para renderizar items de equipamiento/servicios ultra-compactos
  const CheckItem = ({ label, name, icon: Icon, defaultChecked }: any) => (
    <label className={cn(
      "flex items-center gap-2 p-1.5 px-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-all cursor-pointer group has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f]/20",
      disabled && "opacity-60 cursor-not-allowed"
    )}>
      <input 
        type="checkbox" 
        name={name} 
        disabled={disabled}
        defaultChecked={defaultChecked}
        className="h-3 w-3 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]/10" 
      />
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="h-3 w-3 text-slate-400 group-has-[:checked]:text-[#1e3a5f] shrink-0" />
        <span className="text-[9px] font-bold uppercase text-slate-500 group-has-[:checked]:text-[#1e3a5f] tracking-tight truncate">
          {label}
        </span>
      </div>
    </label>
  );

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* 1. ESTRUCTURA Y TENENCIA (Grid Horizontal) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
            <Building2 className="h-2.5 w-2.5 text-[#d4a843]" /> Tipo de Estructura
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
            <SelectContent>
              {["Quinta", "Casa", "Apartamento", "Vivienda rural", "Habitación", "Otro"].map(v => (
                <SelectItem key={v} value={v} className="text-[10px] font-bold uppercase">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Input oculto clave para la persistencia en FormData */}
          <input type="hidden" name="vivienda_tipo" value={tipoVivienda} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
            <Key className="h-2.5 w-2.5 text-[#d4a843]" /> Tenencia de la Vivienda
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
            <SelectContent>
              {["Propia", "Alquilada", "Residencia", "Prestada / Cedida", "Pagándose"].map(v => (
                <SelectItem key={v} value={v} className="text-[10px] font-bold uppercase">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Input oculto clave para la persistencia en FormData */}
          <input type="hidden" name="vivienda_estatus" value={tenenciaVivienda} />
        </div>
      </div>

      {/* 2. SERVICIOS Y EQUIPAMIENTO (Grid Compacto) */}
      <div className="space-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-[#d4a843]" />
          <Label className="text-[8px] font-black uppercase tracking-widest text-[#1e3a5f]">
            Servicios y Equipamiento
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Servicios */}
          <CheckItem label="Agua Blanca" name="serv_agua" icon={Droplet} defaultChecked={user?.serv_agua === "on"} />
          <CheckItem label="Electricidad" name="serv_luz" icon={Zap} defaultChecked={user?.serv_luz === "on"} />
          <CheckItem label="Gas Doméstico" name="serv_gas" icon={Flame} defaultChecked={user?.serv_gas === "on"} />
          <CheckItem label="Aseo Urbano" name="serv_aseo" icon={Trash2} defaultChecked={user?.serv_aseo === "on"} />
          <CheckItem label="Internet" name="serv_internet" icon={Wifi} defaultChecked={user?.serv_internet === "on"} />
          
          {/* Equipamiento */}
          <CheckItem label="Nevera" name="equip_nevera" icon={Refrigerator} defaultChecked={user?.equip_nevera === "on"} />
          <CheckItem label="Lavadora" name="equip_lavadora" icon={Waves} defaultChecked={user?.equip_lavadora === "on"} />
          <CheckItem label="TV por Cable" name="equip_cable" icon={Tv} defaultChecked={user?.equip_cable === "on"} />
        </div>
      </div>

      {/* 3. NOTA INFORMATIVA (Ultra-compacta) */}
      <div className="p-2 px-3 bg-amber-50/50 rounded-lg border border-amber-100 flex items-center gap-2 shrink-0">
        <Info className="h-3 w-3 text-amber-500 shrink-0" />
        <p className="text-[8px] text-amber-700 font-bold uppercase tracking-tight leading-none">
          Las condiciones de vivienda son indicadores fundamentales para el baremo socioeconómico.
        </p>
      </div>

    </div>
  )
}