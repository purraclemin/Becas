"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Briefcase,
  Building2,
  BadgeDollarSign,
  Info,
  UserRoundSearch,
  MapPin,
  Phone
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

const sanitizarEnteroNoNegativoInicial = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = Math.trunc(Number(val));
  return !isNaN(num) && num >= 0 ? String(num) : "";
};

const sanitizarEmpresa = (val: string | undefined): string => {
  if (!val || val === "NO") return "";
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,\-&/()]/g, "");
};

const sanitizarSoloLetras = (val: string | undefined): string => {
  if (!val || val === "NO") return "";
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
};

export function StepEncuestaSituacionLaboral({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [tieneEmpleo, setTieneEmpleo] = useState<boolean>(
    (!!user?.socio_trabajo_empresa && user?.socio_trabajo_empresa !== "NO") ||
    user?.posee_empleo_aspirante === "Si"
  );
  const [sueldo, setSueldo] = useState<string>(
    sanitizarEnteroNoNegativoInicial(user?.monto_ingreso_sueldo) || "0"
  );
  const [empresa, setEmpresa] = useState<string>(
    sanitizarEmpresa(user?.socio_trabajo_empresa)
  );
  const [cargo, setCargo] = useState<string>(
    sanitizarSoloLetras(user?.socio_trabajo_cargo)
  );
  const [direccionTrabajo, setDireccionTrabajo] = useState<string>(
    user?.socio_trabajo_direccion && user.socio_trabajo_direccion !== "NO"
      ? user.socio_trabajo_direccion
      : ""
  );
  const [telefonoTrabajo, setTelefonoTrabajo] = useState<string>(
    user?.socio_trabajo_telefono && user.socio_trabajo_telefono !== "NO"
      ? user.socio_trabajo_telefono.replace(/\D/g, "").slice(0, 15)
      : ""
  );
  const [condicionTipo, setCondicionTipo] = useState<string>(
    user?.socio_condicion_laboral_tipo || "Empleado"
  );
  const [condicionDesc, setCondicionDesc] = useState<string>(
    user?.socio_condicion_laboral_desc && user.socio_condicion_laboral_desc !== "NO"
      ? user.socio_condicion_laboral_desc
      : ""
  );

  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const empresaRef = useRef<HTMLInputElement>(null);
  const cargoRef = useRef<HTMLInputElement>(null);
  const sueldoRef = useRef<HTMLInputElement>(null);

  const isEmpresaValid = !tieneEmpleo || empresa.trim() !== "";
  const isCargoValid = !tieneEmpleo || cargo.trim() !== "";
  const isSueldoValid = !tieneEmpleo || (sueldo.trim() !== "" && parseInt(sueldo, 10) >= 0);
  const isValid = isEmpresaValid && isCargoValid && isSueldoValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isEmpresaValid && empresaRef.current) empresaRef.current.focus();
      else if (!isCargoValid && cargoRef.current) cargoRef.current.focus();
      else if (!isSueldoValid && sueldoRef.current) sueldoRef.current.focus();
    };

    window.addEventListener("intentar-avanzar-laboral", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-laboral", handleValidationAttempt);
  }, [isEmpresaValid, isCargoValid, isSueldoValid]);

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpresa(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,\-&/()]/g, ""));
  };

  const handleSoloLetrasCargo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCargo(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
  };

  const handleSoloEnteroSueldo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSueldo(e.target.value.replace(/\D/g, "").slice(0, 7));
  };

  const editableClass =
    "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-2.5 rounded-xl";

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">

      {/* SECCIÓN 1: PREGUNTA FILTRO */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <UserRoundSearch className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Actividad Laboral Actual
          </Label>
        </div>

        <Label className="text-xs lg:text-[11px] font-bold text-[#1e3a5f] block leading-snug">
          ¿Realiza usted actualmente alguna actividad laboral remunerada?
        </Label>

        <RadioGroup
          value={tieneEmpleo ? "Si" : "No"}
          onValueChange={(v) => {
            const esSi = v === "Si";
            setTieneEmpleo(esSi);
            if (!esSi) {
              setSueldo("0");
              setEmpresa("");
              setCargo("");
              setDireccionTrabajo("");
              setTelefonoTrabajo("");
              setCondicionDesc("");
            } else if (sueldo === "0") {
              setSueldo("");
            }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5"
          disabled={disabled}
        >
          {[
            { id: "trabaja_si", val: "Si", label: "Sí, poseo empleo" },
            { id: "trabaja_no", val: "No", label: "No poseo empleo" }
          ].map((opt) => (
            <label
              key={opt.id}
              htmlFor={opt.id}
              className="flex items-center justify-center gap-2 px-3 h-12 lg:h-9 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
            >
              <RadioGroupItem value={opt.val} id={opt.id} className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <span className="text-xs lg:text-[9px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{opt.label}</span>
            </label>
          ))}
        </RadioGroup>

        <input type="hidden" name="posee_empleo_aspirante" value={tieneEmpleo ? "Si" : "No"} />
      </div>

      {/* SECCIÓN 2: DETALLES DINÁMICOS */}
      {tieneEmpleo ? (
        <div className="bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 space-y-2.5 animate-in slide-in-from-top-2 duration-300 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm">
              <Briefcase className="h-3 w-3 text-[#d4a843]" />
            </div>
            <span className="text-[9px] font-black uppercase text-[#1e3a5f] tracking-widest">En Caso de Trabajar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">

            {/* Empresa / Negocio */}
            <div className="space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isEmpresaValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                <Building2 className="h-2.5 w-2.5 text-[#d4a843]" /> Nombre de la Empresa {hasAttemptedNext && !isEmpresaValid && "*"}
              </Label>
              <Input
                ref={empresaRef}
                name="socio_trabajo_empresa"
                type="text"
                disabled={disabled}
                value={empresa}
                onChange={handleEmpresaChange}
                placeholder="Nombre de la empresa"
                required={tieneEmpleo}
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isEmpresaValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>

            {/* Cargo */}
            <div className="space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isCargoValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                <Briefcase className="h-2.5 w-2.5 text-[#d4a843]" /> Cargo {hasAttemptedNext && !isCargoValid && "*"}
              </Label>
              <Input
                ref={cargoRef}
                name="socio_trabajo_cargo"
                type="text"
                disabled={disabled}
                value={cargo}
                onChange={handleSoloLetrasCargo}
                placeholder="Ej. Asistente"
                required={tieneEmpleo}
                className={cn(
                  editableClass,
                  hasAttemptedNext && !isCargoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                )}
              />
            </div>

            {/* Sueldo Mensual */}
            <div className="space-y-0.5">
              <Label className={cn(
                "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
                hasAttemptedNext && !isSueldoValid ? "text-red-500 font-extrabold" : "text-slate-500"
              )}>
                <BadgeDollarSign className="h-2.5 w-2.5 text-[#d4a843]" /> Sueldo Mensual ($) {hasAttemptedNext && !isSueldoValid && "*"}
              </Label>
              <div className="relative">
                <Input
                  ref={sueldoRef}
                  name="monto_ingreso_sueldo"
                  type="text"
                  inputMode="numeric"
                  maxLength={7}
                  disabled={disabled}
                  value={sueldo}
                  onChange={handleSoloEnteroSueldo}
                  placeholder="0"
                  required={tieneEmpleo}
                  className={cn(
                    editableClass,
                    "pl-6",
                    hasAttemptedNext && !isSueldoValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
                  )}
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
              </div>
            </div>

            {/* Dirección de Trabajo */}
            <div className="sm:col-span-2 space-y-0.5">
              <Label className="text-[8px] font-black uppercase flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-2.5 w-2.5 text-[#d4a843]" /> Dirección de Trabajo
              </Label>
              <Input
                name="socio_trabajo_direccion"
                type="text"
                maxLength={250}
                disabled={disabled}
                value={direccionTrabajo}
                onChange={(e) => setDireccionTrabajo(e.target.value)}
                placeholder="Dirección del lugar de trabajo"
                className={editableClass}
              />
            </div>

            {/* Teléfono de Trabajo */}
            <div className="space-y-0.5">
              <Label className="text-[8px] font-black uppercase flex items-center gap-1.5 text-slate-500">
                <Phone className="h-2.5 w-2.5 text-[#d4a843]" /> Teléfono Trabajo
              </Label>
              <Input
                name="socio_trabajo_telefono"
                type="text"
                inputMode="numeric"
                maxLength={15}
                disabled={disabled}
                value={telefonoTrabajo}
                onChange={(e) => setTelefonoTrabajo(e.target.value.replace(/\D/g, "").slice(0, 15))}
                placeholder="02950000000"
                className={editableClass}
              />
            </div>

            {/* Condición Laboral (Comerciante / Economía Informal / Empleado) */}
            <div className="space-y-0.5">
              <Label className="text-[8px] font-black uppercase text-slate-500">
                Condición / Modalidad
              </Label>
              <select
                name="socio_condicion_laboral_tipo"
                disabled={disabled}
                value={condicionTipo}
                onChange={(e) => setCondicionTipo(e.target.value)}
                className={cn(editableClass, "w-full outline-none cursor-pointer")}
              >
                <option value="Empleado">Empleado / Dependiente</option>
                <option value="Comerciante">Comerciante</option>
                <option value="Economía Informal">Economía Informal</option>
              </select>
            </div>

            {/* Especificar Condición Laboral */}
            <div className="sm:col-span-2 space-y-0.5">
              <Label className="text-[8px] font-black uppercase text-slate-500">
                Especificar
              </Label>
              <Input
                name="socio_condicion_laboral_desc"
                type="text"
                maxLength={250}
                disabled={disabled}
                value={condicionDesc}
                onChange={(e) => setCondicionDesc(e.target.value)}
                placeholder="Detalles adicionales de su actividad laboral..."
                className={editableClass}
              />
            </div>

          </div>
        </div>
      ) : (
        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 shrink-0">
          <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
          <p className="text-[8.5px] text-blue-600/80 font-bold leading-relaxed uppercase tracking-tight">
            Se analizará el ingreso de su grupo familiar o representante para el baremo social.
          </p>
          <input type="hidden" name="socio_trabajo_empresa" value="NO" />
          <input type="hidden" name="socio_trabajo_cargo" value="NO" />
          <input type="hidden" name="socio_trabajo_direccion" value="NO" />
          <input type="hidden" name="socio_trabajo_telefono" value="NO" />
          <input type="hidden" name="socio_condicion_laboral_tipo" value="No aplica" />
          <input type="hidden" name="socio_condicion_laboral_desc" value="NO" />
          <input type="hidden" name="monto_ingreso_sueldo" value="0" />
        </div>
      )}
    </div>
  )
}