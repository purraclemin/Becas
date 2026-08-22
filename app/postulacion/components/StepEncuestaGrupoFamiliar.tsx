"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Users2, UserCircle, Baby, Building2, GraduationCap, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaGrupoFamiliar({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: any;
  onValidationChange?: (isValid: boolean) => void;
}) {
  // Estados agrupados por entidad
  const [padre, setPadre] = useState({
    nombre: user?.padre_nombre || "",
    edad: user?.padre_edad ?? "",
    ocupacion: user?.padre_ocupacion || "",
    trabajo: user?.padre_trabajo || ""
  });

  const [madre, setMadre] = useState({
    nombre: user?.madre_nombre || "",
    edad: user?.madre_edad ?? "",
    ocupacion: user?.madre_ocupacion || "",
    trabajo: user?.madre_trabajo || ""
  });

  const [numHermanos, setNumHermanos] = useState(user?.familia_num_hermanos ?? "");
  const [hermanosUni, setHermanosUni] = useState(user?.familia_hermanos_uni ?? "");
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  const padreNombreRef = useRef<HTMLInputElement>(null);
  const madreNombreRef = useRef<HTMLInputElement>(null);
  const numHermanosRef = useRef<HTMLInputElement>(null);

  // Validadores limpios
  const isPadreValid = Object.values(padre).every(v => v.toString().trim() !== "");
  const isMadreValid = Object.values(madre).every(v => v.toString().trim() !== "");
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
    };

    window.addEventListener('intentar-avanzar-familia', handleValidationAttempt);
    return () => window.removeEventListener('intentar-avanzar-familia', handleValidationAttempt);
  }, [isPadreValid, isMadreValid, numHermanos]);

  // Filtros de entrada reutilizables
  const handleInput = (setter: React.Dispatch<React.SetStateAction<any>>, field: string, type: 'letras' | 'numeros') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const regex = type === 'letras' ? /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g : /\D/g;
    setter((prev: any) => ({ ...prev, [field]: e.target.value.replace(regex, "") }));
  };

  const handleHermanos = (setter: any, isUni = false) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
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

  const editableClass = "h-10 lg:h-8 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs lg:text-[11px] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]/5 transition-all px-2.5 rounded-xl";

  const renderFichaFamiliar = (
    titulo: string, 
    tipo: 'padre' | 'madre', 
    data: typeof padre, 
    setter: any, 
    ref: React.RefObject<HTMLInputElement | null>, 
    colorClass: string, 
    hoverClass: string
  ) => (
    <div className={cn("p-3 bg-white border border-slate-200 rounded-2xl shadow-sm relative transition-colors", hoverClass)}>
      <div className="flex items-center gap-2 mb-2">
        <UserCircle className={cn("h-3.5 w-3.5", colorClass)} />
        <Label className={cn("text-[9px] font-black uppercase tracking-widest", colorClass.replace("text-", "text-"))}>{titulo}</Label>
      </div>

      <div className="grid grid-cols-4 gap-x-2 gap-y-2">
        {[
          { key: 'nombre', label: 'Nombres y Apellidos', span: 'col-span-4', type: 'letras', placeholder: 'Nombre completo', ref },
          { key: 'edad', label: 'Edad', span: 'col-span-1', type: 'numeros', placeholder: '', max: 3, center: true },
          { key: 'ocupacion', label: 'Ocupación', span: 'col-span-3', type: 'letras', placeholder: 'Ej. Comerciante' },
          { key: 'trabajo', label: 'Lugar de Trabajo', span: 'col-span-4', type: 'letras', placeholder: 'Nombre de la empresa o negocio', icon: Building2 }
        ].map((field) => {
          const isEmpty = hasAttemptedNext && data[field.key as keyof typeof data].toString().trim() === "";
          return (
            <div key={field.key} className={field.span + " space-y-0.5"}>
              <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors", isEmpty ? "text-red-500 font-extrabold" : "text-slate-500")}>
                {field.icon && <field.icon className="h-2.5 w-2.5 text-[#d4a843]" />}
                {field.label} {isEmpty && "*"}
              </Label>
              <Input 
                ref={field.ref}
                name={`${tipo}_${field.key}`}
                disabled={disabled}
                value={data[field.key as keyof typeof data]}
                onChange={handleInput(setter, field.key, field.type as any)}
                required
                maxLength={field.max}
                placeholder={field.placeholder}
                className={cn(editableClass, field.center && "text-center", isEmpty && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

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
            { label: "Número Total de Hermanos", val: numHermanos, handler: handleHermanos(setNumHermanos), ref: numHermanosRef },
            { label: "Hermanos en Universidad o Unimar", val: hermanosUni, handler: handleHermanos(setHermanosUni, true) }
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