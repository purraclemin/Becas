"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  Waves,
  Phone,
  Wind,
  Fan,
  Utensils,
  Microwave,
  Volume2,
  Laptop,
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

const OPCIONES_ESTRUCTURA = [
  "Quinta",
  "Casa",
  "Apartamento",
  "Vivienda rural",
  "Habitación",
  "Otro"
] as const;

const OPCIONES_TENENCIA = [
  "Propia",
  "Alquilada",
  "Residencia",
  "Prestada / Cedida",
  "Pagándose",
  "Otro"
] as const;

const OPCIONES_ESTRUCTURA_FIJAS: ReadonlyArray<string> = OPCIONES_ESTRUCTURA.filter((v) => v !== "Otro");
const OPCIONES_TENENCIA_FIJAS: ReadonlyArray<string> = OPCIONES_TENENCIA.filter((v) => v !== "Otro");

const sanitizarTextoPersonalizado = (val: string): string => {
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,\-/()]/g, "").slice(0, 50);
};

const esTextoPersonalizadoValido = (val: string): boolean => {
  const limpio = val.trim();
  const soloLetras = limpio.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");
  return limpio.length >= 2 && soloLetras.length >= 2;
};

type ServicioHogarKey =
  | "serv_agua"
  | "serv_luz"
  | "serv_gas"
  | "serv_aseo"
  | "serv_internet"
  | "serv_telefono"
  | "serv_cloacas"
  | "equip_nevera"
  | "equip_lavadora"
  | "equip_cable"
  | "equip_aire"
  | "equip_ventilador"
  | "equip_tv"
  | "equip_cocina"
  | "equip_microondas"
  | "equip_sonido"
  | "equip_computadora"
  | "equip_celular";

interface ServicioHogarConfig {
  label: string;
  name: ServicioHogarKey;
  icon: React.ElementType;
  key: ServicioHogarKey;
}

interface CheckItemProps {
  label: string;
  name: ServicioHogarKey;
  icon: React.ElementType;
  defaultChecked: boolean;
  disabled: boolean;
}

const SERVICIOS_Y_EQUIPAMIENTO: ReadonlyArray<ServicioHogarConfig> = [
  { label: "Agua", name: "serv_agua", icon: Droplet, key: "serv_agua" },
  { label: "Luz", name: "serv_luz", icon: Zap, key: "serv_luz" },
  { label: "Gas", name: "serv_gas", icon: Flame, key: "serv_gas" },
  { label: "Aseo", name: "serv_aseo", icon: Trash2, key: "serv_aseo" },
  { label: "Teléfono", name: "serv_telefono", icon: Phone, key: "serv_telefono" },
  { label: "Cloacas", name: "serv_cloacas", icon: Waves, key: "serv_cloacas" },
  { label: "Internet", name: "serv_internet", icon: Wifi, key: "serv_internet" },
  { label: "Nevera", name: "equip_nevera", icon: Refrigerator, key: "equip_nevera" },
  { label: "Aire Acond.", name: "equip_aire", icon: Wind, key: "equip_aire" },
  { label: "Ventilador", name: "equip_ventilador", icon: Fan, key: "equip_ventilador" },
  { label: "TV", name: "equip_tv", icon: Tv, key: "equip_tv" },
  { label: "Cocina", name: "equip_cocina", icon: Utensils, key: "equip_cocina" },
  { label: "Microondas", name: "equip_microondas", icon: Microwave, key: "equip_microondas" },
  { label: "Lavadora", name: "equip_lavadora", icon: Waves, key: "equip_lavadora" },
  { label: "Eq. Sonido", name: "equip_sonido", icon: Volume2, key: "equip_sonido" },
  { label: "Computadora", name: "equip_computadora", icon: Laptop, key: "equip_computadora" },
  { label: "Celular", name: "equip_celular", icon: Smartphone, key: "equip_celular" },
  { label: "TV Cable", name: "equip_cable", icon: Tv, key: "equip_cable" }
];

const CheckItem = ({ label, name, icon: Icon, defaultChecked, disabled }: CheckItemProps) => {
  const [checked, setChecked] = useState<boolean>(defaultChecked);

  return (
    <label
      className={cn(
        "flex items-center gap-2 min-h-12 lg:min-h-8 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/30 transition-all cursor-pointer group hover:border-[#1e3a5f]/20 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f]/30",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <input
        type="checkbox"
        disabled={disabled}
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="h-4 w-4 lg:h-3.5 lg:w-3.5 rounded border-slate-300 text-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] shrink-0"
      />
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="h-3.5 w-3.5 lg:h-3 lg:w-3 text-slate-400 group-has-[:checked]:text-[#1e3a5f] shrink-0" />
        <span className="text-xs lg:text-[9px] font-black uppercase text-slate-600 group-has-[:checked]:text-[#1e3a5f] tracking-wider truncate">
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
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const rawEstructura = user?.vivienda_tipo?.trim() || "";
  const esEstructuraPersonalizadaInicial =
    rawEstructura !== "" && !OPCIONES_ESTRUCTURA_FIJAS.includes(rawEstructura);

  const rawTenencia = user?.vivienda_estatus?.trim() || "";
  const esTenenciaPersonalizadaInicial =
    rawTenencia !== "" && !OPCIONES_TENENCIA_FIJAS.includes(rawTenencia);

  const [tipoVivienda, setTipoVivienda] = useState<string>(
    esEstructuraPersonalizadaInicial ? "Otro" : rawEstructura
  );
  const [otroTipoVivienda, setOtroTipoVivienda] = useState<string>(
    esEstructuraPersonalizadaInicial && rawEstructura !== "Otro"
      ? sanitizarTextoPersonalizado(rawEstructura)
      : ""
  );

  const [tenenciaVivienda, setTenenciaVivienda] = useState<string>(
    esTenenciaPersonalizadaInicial ? "Otro" : rawTenencia
  );
  const [otraTenenciaVivienda, setOtraTenenciaVivienda] = useState<string>(
    esTenenciaPersonalizadaInicial && rawTenencia !== "Otro"
      ? sanitizarTextoPersonalizado(rawTenencia)
      : ""
  );

  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const estructuraRef = useRef<HTMLButtonElement>(null);
  const otroTipoRef = useRef<HTMLInputElement>(null);
  const tenenciaRef = useRef<HTMLButtonElement>(null);
  const otraTenenciaRef = useRef<HTMLInputElement>(null);

  const isTipoSelectValid = (OPCIONES_ESTRUCTURA as readonly string[]).includes(tipoVivienda);
  const isOtroTipoValid = tipoVivienda !== "Otro" || esTextoPersonalizadoValido(otroTipoVivienda);
  const isEstructuraValid = isTipoSelectValid && isOtroTipoValid;

  const isTenenciaSelectValid = (OPCIONES_TENENCIA as readonly string[]).includes(tenenciaVivienda);
  const isOtraTenenciaValid = tenenciaVivienda !== "Otro" || esTextoPersonalizadoValido(otraTenenciaVivienda);
  const isTenenciaValid = isTenenciaSelectValid && isOtraTenenciaValid;

  const isValid = isEstructuraValid && isTenenciaValid;

  const valorFinalEstructura =
    tipoVivienda === "Otro" ? otroTipoVivienda.trim() : tipoVivienda;
  const valorFinalTenencia =
    tenenciaVivienda === "Otro" ? otraTenenciaVivienda.trim() : tenenciaVivienda;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isTipoSelectValid && estructuraRef.current) {
        estructuraRef.current.focus();
      } else if (!isOtroTipoValid && otroTipoRef.current) {
        otroTipoRef.current.focus();
      } else if (!isTenenciaSelectValid && tenenciaRef.current) {
        tenenciaRef.current.focus();
      } else if (!isOtraTenenciaValid && otraTenenciaRef.current) {
        otraTenenciaRef.current.focus();
      }
    };

    window.addEventListener("intentar-avanzar-hogar", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-hogar", handleValidationAttempt);
  }, [isTipoSelectValid, isOtroTipoValid, isTenenciaSelectValid, isOtraTenenciaValid]);

  const editableClass =
    "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-2 animate-in fade-in duration-500 pb-8 lg:pb-0">

      {/* 1. ESTRUCTURA Y TENENCIA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">

        <div className="space-y-1">
          <Label className={cn(
            "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
            hasAttemptedNext && !isEstructuraValid ? "text-red-500 font-extrabold" : "text-slate-500"
          )}>
            <Building2 className="h-2.5 w-2.5 text-[#d4a843]" /> 5- Área Físico Ambiental: Tipo de Vivienda {hasAttemptedNext && !isEstructuraValid && "*"}
          </Label>
          <Select
            disabled={disabled}
            value={tipoVivienda}
            onValueChange={(val) => {
              setTipoVivienda(val);
              if (val !== "Otro") setOtroTipoVivienda("");
            }}
            required
          >
            <SelectTrigger
              ref={estructuraRef}
              className={cn(
                editableClass,
                hasAttemptedNext && !isTipoSelectValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
              )}
            >
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {OPCIONES_ESTRUCTURA.map((v) => (
                <SelectItem key={v} value={v} className="text-sm lg:text-xs font-bold uppercase py-2">
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {tipoVivienda === "Otro" && (
            <div className="pt-0.5 animate-in slide-in-from-top-1 duration-200">
              <Input
                ref={otroTipoRef}
                type="text"
                maxLength={50}
                disabled={disabled}
                value={otroTipoVivienda}
                onChange={(e) => setOtroTipoVivienda(sanitizarTextoPersonalizado(e.target.value))}
                placeholder="Especifique el tipo de vivienda..."
                required
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isOtroTipoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>
          )}

          <input type="hidden" name="vivienda_tipo" value={valorFinalEstructura} />
        </div>

        <div className="space-y-1">
          <Label className={cn(
            "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
            hasAttemptedNext && !isTenenciaValid ? "text-red-500 font-extrabold" : "text-slate-500"
          )}>
            <Key className="h-2.5 w-2.5 text-[#d4a843]" /> La Vivienda Es {hasAttemptedNext && !isTenenciaValid && "*"}
          </Label>
          <Select
            disabled={disabled}
            value={tenenciaVivienda}
            onValueChange={(val) => {
              setTenenciaVivienda(val);
              if (val !== "Otro") setOtraTenenciaVivienda("");
            }}
            required
          >
            <SelectTrigger
              ref={tenenciaRef}
              className={cn(
                editableClass,
                hasAttemptedNext && !isTenenciaSelectValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
              )}
            >
              <SelectValue placeholder="Seleccione..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {OPCIONES_TENENCIA.map((v) => (
                <SelectItem key={v} value={v} className="text-sm lg:text-xs font-bold uppercase py-2">
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {tenenciaVivienda === "Otro" && (
            <div className="pt-0.5 animate-in slide-in-from-top-1 duration-200">
              <Input
                ref={otraTenenciaRef}
                type="text"
                maxLength={50}
                disabled={disabled}
                value={otraTenenciaVivienda}
                onChange={(e) => setOtraTenenciaVivienda(sanitizarTextoPersonalizado(e.target.value))}
                placeholder="Especifique la tenencia de la vivienda..."
                required
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isOtraTenenciaValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>
          )}

          <input type="hidden" name="vivienda_estatus" value={valorFinalTenencia} />
        </div>

      </div>

      {/* 2. SERVICIOS Y EQUIPAMIENTO */}
      <div className="space-y-1.5 p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">
            Servicios y Equipamiento de la Vivienda
          </Label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
          {SERVICIOS_Y_EQUIPAMIENTO.map((item) => (
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
      <div className="px-2.5 py-2 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center gap-2 shrink-0">
        <Info className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <p className="text-[8.5px] text-amber-700 font-bold uppercase tracking-tight leading-snug">
          Las condiciones de vivienda y servicios son indicadores fundamentales para el baremo socioeconómico.
        </p>
      </div>

    </div>
  )
}