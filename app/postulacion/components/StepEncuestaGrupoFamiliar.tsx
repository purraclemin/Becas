"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Users2, UserCircle, Baby, Building2, GraduationCap, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

interface FichaFamiliarState {
  nombre: string;
  edad: string;
  ocupacion: string;
  trabajo: string;
}

interface CampoFamiliarConfig {
  key: keyof FichaFamiliarState;
  label: string;
  span: string;
  type: "letras" | "numeros";
  placeholder: string;
  max?: number;
  center?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  icon?: React.ElementType;
}

const sanitizarEdadInicial = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = Math.trunc(Number(val));
  return !isNaN(num) && num >= 1 && num <= 120 ? String(num) : "";
};

const sanitizarEnteroNoNegativoInicial = (val: string | number | undefined): string => {
  if (val === undefined || val === null || val === "") return "";
  const num = Math.trunc(Number(val));
  return !isNaN(num) && num >= 0 ? String(num) : "";
};

export function StepEncuestaGrupoFamiliar({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  // Estados agrupados por entidad
  const [padre, setPadre] = useState<FichaFamiliarState>({
    nombre: user?.padre_nombre || "",
    edad: sanitizarEdadInicial(user?.padre_edad),
    ocupacion: user?.padre_ocupacion || "",
    trabajo: user?.padre_trabajo || ""
  });

  const [madre, setMadre] = useState<FichaFamiliarState>({
    nombre: user?.madre_nombre || "",
    edad: sanitizarEdadInicial(user?.madre_edad),
    ocupacion: user?.madre_ocupacion || "",
    trabajo: user?.madre_trabajo || ""
  });

  const [numHermanos, setNumHermanos] = useState<string>(
    sanitizarEnteroNoNegativoInicial(user?.familia_num_hermanos)
  );
  const [hermanosUni, setHermanosUni] = useState<string>(
    sanitizarEnteroNoNegativoInicial(user?.familia_hermanos_uni)
  );
  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const padreNombreRef = useRef<HTMLInputElement>(null);
  const madreNombreRef = useRef<HTMLInputElement>(null);
  const numHermanosRef = useRef<HTMLInputElement>(null);
  const hermanosUniRef = useRef<HTMLInputElement>(null);

  const isEdadValida = (edadStr: string): boolean => {
    if (edadStr.trim() === "") return false;
    const n = parseInt(edadStr, 10);
    return !isNaN(n) && n >= 1 && n <= 120;
  };

  // Validadores estrictos
  const isPadreValid =
    padre.nombre.trim() !== "" &&
    isEdadValida(padre.edad) &&
    padre.ocupacion.trim() !== "" &&
    padre.trabajo.trim() !== "";

  const isMadreValid =
    madre.nombre.trim() !== "" &&
    isEdadValida(madre.edad) &&
    madre.ocupacion.trim() !== "" &&
    madre.trabajo.trim() !== "";

  const isHermanosValid = numHermanos !== "" && hermanosUni !== "";
  const isValid = isPadreValid && isMadreValid && isHermanosValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isPadreValid && padreNombreRef.current) padreNombreRef.current.focus();
      else if (!isMadreValid && madreNombreRef.current) madreNombreRef.current.focus();
      else if (numHermanos === "" && numHermanosRef.current) numHermanosRef.current.focus();
      else if (hermanosUni === "" && hermanosUniRef.current) hermanosUniRef.current.focus();
    };

    window.addEventListener("intentar-avanzar-familia", handleValidationAttempt);
    return () => window.removeEventListener("intentar-avanzar-familia", handleValidationAttempt);
  }, [isPadreValid, isMadreValid, numHermanos, hermanosUni]);

  // Filtros de entrada reutilizables (Cero any)
  const handleInput = (
    setter: React.Dispatch<React.SetStateAction<FichaFamiliarState>>,
    field: keyof FichaFamiliarState,
    type: "letras" | "numeros"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "letras") {
      const soloLetras = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      setter(prev => ({ ...prev, [field]: soloLetras }));
    } else {
      const soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 3);
      if (soloDigitos !== "" && parseInt(soloDigitos, 10) > 120) return;
      setter(prev => ({ ...prev, [field]: soloDigitos }));
    }
  };

  const handleHermanos = (isUni = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (isUni) {
      const max = numHermanos === "" ? 0 : parseInt(numHermanos, 10);
      setHermanosUni(val === "" || parseInt(val, 10) <= max ? val : max.toString());
    } else {
      setNumHermanos(val);
      if (hermanosUni !== "" && parseInt(hermanosUni, 10) > (val === "" ? 0 : parseInt(val, 10))) {
        setHermanosUni(val);
      }
    }
  };

  const editableClass = "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-2.5 rounded-xl";

  const renderFichaFamiliar = (
    titulo: string,
    tipo: "padre" | "madre",
    data: FichaFamiliarState,
    setter: React.Dispatch<React.SetStateAction<FichaFamiliarState>>,
    ref: React.RefObject<HTMLInputElement | null>,
    colorClass: string,
    hoverClass: string
  ) => {
    const campos: CampoFamiliarConfig[] = [
      { key: "nombre", label: "Nombres y Apellidos", span: "col-span-4", type: "letras", placeholder: "Nombre completo  ", ref },
      { key: "edad", label: "Edad", span: "col-span-1", type: "numeros", placeholder: "Ej. 45", max: 3, center: true },
      { key: "ocupacion", label: "Ocupación", span: "col-span-3", type: "letras", placeholder: "Ej. Comerciante" },
      { key: "trabajo", label: "Lugar de Trabajo", span: "col-span-4", type: "letras", placeholder: "Nombre de la empresa o negocio", icon: Building2 }
    ];

    return (
      <div className={cn("p-3 bg-white border border-slate-200 rounded-2xl shadow-sm relative transition-colors", hoverClass)}>
        <div className="flex items-center gap-2 mb-2">
          <UserCircle className={cn("h-3.5 w-3.5", colorClass)} />
          <Label className={cn("text-[9px] font-black uppercase tracking-widest", colorClass)}>{titulo}</Label>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-2">
          {campos.map((field) => {
            const valorActual = data[field.key];
            const isInvalid = hasAttemptedNext && (
              field.key === "edad" ? !isEdadValida(valorActual) : valorActual.trim() === ""
            );
            const IconComp = field.icon;

            return (
              <div key={field.key} className={field.span + " space-y-0.5"}>
                <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors", isInvalid ? "text-red-500 font-extrabold" : "text-slate-500")}>
                  {IconComp && <IconComp className="h-2.5 w-2.5 text-[#d4a843]" />}
                  {field.label} {isInvalid && "*"}
                </Label>
                <Input
                  ref={field.ref}
                  name={`${tipo}_${field.key}`}
                  type="text"
                  inputMode={field.type === "numeros" ? "numeric" : "text"}
                  disabled={disabled}
                  value={valorActual}
                  onChange={handleInput(setter, field.key, field.type)}
                  required
                  maxLength={field.max}
                  placeholder={field.placeholder}
                  className={cn(editableClass, field.center && "text-center", isInvalid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2 shrink-0">
        <Info className="h-3.5 w-3.5 text-[#1e3a5f] shrink-0" />
        <p className="text-[8.5px] text-slate-600 font-bold uppercase tracking-tight leading-relaxed">
          Proporcione los datos de sus padres y hermanos. Esta información es vital para determinar la carga familiar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {renderFichaFamiliar("Ficha del Padre", "padre", padre, setPadre, padreNombreRef, "text-blue-600", "hover:border-blue-200")}
        {renderFichaFamiliar("Ficha de la Madre", "madre", madre, setMadre, madreNombreRef, "text-pink-600", "hover:border-pink-200")}
      </div>

      <div className="p-3 bg-[#1e3a5f]/5 rounded-2xl border border-[#1e3a5f]/10 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Baby className="h-3.5 w-3.5 text-[#d4a843]" />
          <Label className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">Situación de Hermanos</Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[
            { label: "Número Total de Hermanos", val: numHermanos, handler: handleHermanos(false), ref: numHermanosRef },
            { label: "Hermanos en Universidad o Unimar", val: hermanosUni, handler: handleHermanos(true), ref: hermanosUniRef }
          ].map((item, idx) => {
            const isEmpty = hasAttemptedNext && item.val === "";
            return (
              <div key={idx} className="space-y-0.5">
                <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors", isEmpty ? "text-red-500 font-extrabold" : "text-slate-500")}>
                  {idx === 0 ? <Users2 className="h-2.5 w-2.5 text-[#d4a843]" /> : <GraduationCap className="h-2.5 w-2.5 text-[#d4a843]" />}
                  {item.label} {isEmpty && "*"}
                </Label>
                <Input
                  ref={item.ref}
                  name={idx === 0 ? "familia_num_hermanos" : "familia_hermanos_uni"}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  disabled={disabled}
                  value={item.val}
                  onChange={item.handler}
                  required
                  placeholder="0"
                  className={cn(editableClass, isEmpty && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}