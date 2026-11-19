"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  HeartPulse,
  Stethoscope,
  Activity,
  Users,
  MessageSquare,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

const OPCIONES_CONVIVENCIA = ["Buena", "Regular", "Mala"] as const;

interface CustomRadioItemProps {
  value: string;
  id: string;
  label: string;
  disabled: boolean;
  colorClass?: string;
}

const sanitizarTextoClinico = (val: string): string => {
  // Permite letras, números (dosis/grados), espacios y puntuación básica; bloquea caracteres especiales inseguros
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,()\-/]/g, "");
};

const tieneTextoReal = (val: string): boolean => {
  const limpio = val.trim();
  if (limpio === "" || limpio.toUpperCase() === "NO") return false;
  const soloLetras = limpio.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "");
  return soloLetras.length >= 2;
};

function CustomRadioItem({
  value,
  id,
  label,
  disabled,
  colorClass = "text-[#1e3a5f]"
}: CustomRadioItemProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex-1 flex items-center justify-center gap-1.5 px-3 h-12 lg:h-9 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer group",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <RadioGroupItem value={value} id={id} className="h-3.5 w-3.5 text-[#1e3a5f]" />
      <span className={cn("text-xs lg:text-[10px] font-bold uppercase cursor-pointer tracking-tight truncate select-none", colorClass)}>
        {label}
      </span>
    </label>
  );
}

export function StepEncuestaSalud({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const tieneCondicionInicial =
    user?.salud_condicion_especial === "Si" ||
    (!!user?.salud_enfermedad_desc && user.salud_enfermedad_desc.trim().toUpperCase() !== "NO");

  const [estaEnfermo, setEstaEnfermo] = useState<boolean>(tieneCondicionInicial);

  const [enfermedadDesc, setEnfermedadDesc] = useState<string>(
    user?.salud_enfermedad_desc && user.salud_enfermedad_desc.trim().toUpperCase() !== "NO"
      ? sanitizarTextoClinico(user.salud_enfermedad_desc)
      : ""
  );

  const [tratamiento, setTratamiento] = useState<string>(
    user?.salud_tratamiento && user.salud_tratamiento.trim().toUpperCase() !== "NO"
      ? sanitizarTextoClinico(user.salud_tratamiento)
      : ""
  );

  const convivenciaInicial =
    user?.familia_relacion && (OPCIONES_CONVIVENCIA as readonly string[]).includes(user.familia_relacion)
      ? user.familia_relacion
      : "Buena";

  const [convivencia, setConvivencia] = useState<string>(convivenciaInicial);
  const [observaciones, setObservaciones] = useState<string>(
    user?.observaciones_estudio ? sanitizarTextoClinico(user.observaciones_estudio) : ""
  );
  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const descRef = useRef<HTMLInputElement>(null);
  const tratamientoRef = useRef<HTMLInputElement>(null);

  const isDescValid = !estaEnfermo || tieneTextoReal(enfermedadDesc);
  const isTratamientoValid = !estaEnfermo || tieneTextoReal(tratamiento);
  const isConvivenciaValid = (OPCIONES_CONVIVENCIA as readonly string[]).includes(convivencia);
  const isValid = isDescValid && isTratamientoValid && isConvivenciaValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Escuchador global del evento para validación visual y enfoque automático
  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isDescValid && descRef.current) {
        descRef.current.focus();
      } else if (!isTratamientoValid && tratamientoRef.current) {
        tratamientoRef.current.focus();
      }
    };

    window.addEventListener("intentar-avanzar-salud", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-salud", handleValidationAttempt);
  }, [isDescValid, isTratamientoValid]);

  // Estándar UF-Scale: h-12/text-sm en móvil, h-9/text-xs en PC
  const editableClass = "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">

      {/* 1. SECCIÓN DE SALUD */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center gap-1.5">
          <HeartPulse className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Estado de Salud del Aspirante
          </Label>
        </div>

        <Label className="text-xs lg:text-[11px] font-bold text-[#1e3a5f] block leading-snug">
          ¿Padece enfermedad crónica o condición de discapacidad?
        </Label>

        <RadioGroup
          value={estaEnfermo ? "Si" : "No"}
          onValueChange={(v) => {
            const esSi = v === "Si";
            setEstaEnfermo(esSi);
            if (!esSi) {
              setEnfermedadDesc("");
              setTratamiento("");
              setHasAttemptedNext(false);
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          disabled={disabled}
        >
          <CustomRadioItem value="Si" id="s_si" label="Sí, poseo condición" disabled={disabled} />
          <CustomRadioItem value="No" id="s_no" label="No, gozo de buena salud" disabled={disabled} />
        </RadioGroup>

        <input type="hidden" name="salud_condicion_especial" value={estaEnfermo ? "Si" : "No"} />

        {estaEnfermo ? (
          <div className="flex flex-col gap-2 pt-1 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isDescValid ? "text-red-500 font-extrabold" : "text-amber-700"
              )}>
                <Stethoscope className="h-2.5 w-2.5" /> Diagnóstico Médico Detallado {hasAttemptedNext && !isDescValid && "*"}
              </Label>
              <Input
                ref={descRef}
                name="salud_enfermedad_desc"
                type="text"
                maxLength={180}
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isDescValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
                placeholder="Especifique su condición o diagnóstico..."
                disabled={disabled}
                value={enfermedadDesc}
                onChange={(e) => setEnfermedadDesc(sanitizarTextoClinico(e.target.value))}
                required={estaEnfermo}
              />
            </div>

            <div className="space-y-1">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isTratamientoValid ? "text-red-500 font-extrabold" : "text-amber-700"
              )}>
                <Activity className="h-2.5 w-2.5" /> Tratamiento e Insumos {hasAttemptedNext && !isTratamientoValid && "*"}
              </Label>
              <Input
                ref={tratamientoRef}
                name="salud_tratamiento"
                type="text"
                maxLength={180}
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isTratamientoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
                placeholder="Indique medicamentos o cuidados permanentes..."
                disabled={disabled}
                value={tratamiento}
                onChange={(e) => setTratamiento(sanitizarTextoClinico(e.target.value))}
                required={estaEnfermo}
              />
            </div>
          </div>
        ) : (
          <>
            <input type="hidden" name="salud_enfermedad_desc" value="NO" />
            <input type="hidden" name="salud_tratamiento" value="NO" />
          </>
        )}
      </div>

      {/* 2. CLIMA FAMILIAR */}
      <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Dinámica y Convivencia
          </Label>
        </div>

        <Label className="text-xs lg:text-[11px] font-bold text-[#1e3a5f] block leading-snug">
          ¿Cómo calificaría la convivencia en su hogar?
        </Label>

        <RadioGroup
          value={convivencia}
          onValueChange={setConvivencia}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          disabled={disabled}
        >
          <CustomRadioItem value="Buena" id="rel_b" label="Buena" disabled={disabled} colorClass="text-emerald-600" />
          <CustomRadioItem value="Regular" id="rel_r" label="Regular" disabled={disabled} colorClass="text-amber-600" />
          <CustomRadioItem value="Mala" id="rel_m" label="Mala" disabled={disabled} colorClass="text-rose-600" />
        </RadioGroup>

        <input type="hidden" name="familia_relacion" value={convivencia} />
      </div>

      {/* 3. OBSERVACIONES */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
        <Label className="text-[9px] font-black uppercase text-[#1e3a5f] flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3 text-[#d4a843]" /> Observaciones del Solicitante
        </Label>
        <Input
          name="observaciones_estudio"
          type="text"
          maxLength={300}
          placeholder="Explique cualquier situación particular para el Comité (Opcional)..."
          className={editableClass}
          disabled={disabled}
          value={observaciones}
          onChange={(e) => setObservaciones(sanitizarTextoClinico(e.target.value))}
        />
      </div>

      {/* Nota Final */}
      <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2.5 shrink-0">
        <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
        <p className="text-[8.5px] text-blue-600 font-bold uppercase tracking-tight leading-relaxed">
          La veracidad de estos datos podrá ser verificada mediante visita domiciliaria.
        </p>
      </div>

    </div>
  )
}