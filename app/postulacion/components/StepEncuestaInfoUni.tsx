"use client"

import React, { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  GraduationCap,
  School,
  History,
  CalendarClock,
  Globe,
  ShieldCheck,
  Info
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

const FECHA_MINIMA_UNIMAR = "1995-01-01";

const sanitizarSoloLetras = (val: string | undefined): string => {
  if (!val) return "";
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
};

export function StepEncuestaInfoUni({
  disabled,
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [ueProcedencia, setUeProcedencia] = useState<string>(
    sanitizarSoloLetras(user?.socio_ue_procedencia)
  );
  const [fechaIngreso, setFechaIngreso] = useState<string>(
    user?.socio_fecha_unimar || ""
  );
  const [otrosEstudios, setOtrosEstudios] = useState<string>(
    sanitizarSoloLetras(user?.socio_otros_estudios)
  );
  const [modalidad, setModalidad] = useState<string>(
    user?.socio_modalidad || "P"
  );
  const [maxFecha, setMaxFecha] = useState<string>("");
  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);

  const ueRef = useRef<HTMLInputElement>(null);
  const fechaRef = useRef<HTMLInputElement>(null);

  // Cálculo de fecha máxima únicamente en cliente para prevenir errores de hidratación
  useEffect(() => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");
    setMaxFecha(`${anio}-${mes}-${dia}`);
  }, []);

  const isUeValid = ueProcedencia.trim() !== "";
  const isFechaFormatoValido = /^\d{4}-\d{2}-\d{2}$/.test(fechaIngreso);
  const isFechaEnRango =
    isFechaFormatoValido &&
    fechaIngreso >= FECHA_MINIMA_UNIMAR &&
    (maxFecha === "" || fechaIngreso <= maxFecha);
  const isFechaValid = isFechaEnRango;

  const isValid = isUeValid && isFechaValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  // Escuchador del evento global emitido por el hook cuando se presiona "Siguiente"
  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isUeValid && ueRef.current) {
        ueRef.current.focus();
      } else if (!isFechaValid && fechaRef.current) {
        fechaRef.current.focus();
      }
    };

    window.addEventListener("intentar-avanzar-uni", handleValidationAttempt);
    return () => {
      window.removeEventListener("intentar-avanzar-uni", handleValidationAttempt);
    };
  }, [isUeValid, isFechaValid]);

  const handleSoloLetras =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
    };

  const blockedClass = "h-12 lg:h-9 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/60 cursor-not-allowed text-sm lg:text-xs shadow-none px-3 rounded-xl";
  const editableClass = "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 pb-16 lg:pb-0">

      {/* BLOQUE 1: DATOS ACADÉMICOS MAESTROS (BLOQUEADOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 lg:p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Registro Académico Oficial</span>
        </div>

        <div className="space-y-1 sm:col-span-3">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="h-2.5 w-2.5 text-[#d4a843]" /> Carrera que Cursa
          </Label>
          <Input
            name="socio_carrera"
            readOnly
            disabled
            value={user?.socio_carrera || user?.carrera || "No especificada"}
            className={blockedClass}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5">
            <History className="h-2.5 w-2.5 text-[#d4a843]" /> Trimestre Actual
          </Label>
          <Input
            name="socio_trimestre"
            readOnly
            disabled
            value={user?.socio_trimestre?.toString() || user?.semestre?.toString() || "0"}
            className={cn(blockedClass, "text-center")}
          />
        </div>
      </div>

      {/* BLOQUE 2: INFORMACIÓN DE PROCEDENCIA Y MODALIDAD (EDITABLES) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 lg:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Detalles de Formación</span>
        </div>

        {/* U.E. de Procedencia (Obligatorio ) */}
        <div className="space-y-1 sm:col-span-2">
          <Label className={cn(
            "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
            hasAttemptedNext && !isUeValid ? "text-red-500 font-extrabold" : "text-slate-500"
          )}>
            <School className="h-3 w-3 text-[#d4a843]" /> U.E. de Procedencia {hasAttemptedNext && !isUeValid && "*"}
          </Label>
          <Input
            ref={ueRef}
            name="socio_ue_procedencia"
            type="text"
            disabled={disabled}
            value={ueProcedencia}
            onChange={handleSoloLetras(setUeProcedencia)}
            required
            placeholder="Ej: Unidad Educativa Colegio Porlamar"
            className={cn(
              editableClass,
              hasAttemptedNext && !isUeValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
            )}
          />
        </div>

        {/* Fecha Ingreso UNIMAR (Obligatorio, rango válido) */}
        <div className="space-y-1">
          <Label className={cn(
            "text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors",
            hasAttemptedNext && !isFechaValid ? "text-red-500 font-extrabold" : "text-slate-500"
          )}>
            <CalendarClock className="h-3 w-3 text-[#d4a843]" /> Fecha Ingreso UNIMAR {hasAttemptedNext && !isFechaValid && "*"}
          </Label>
          <Input
            ref={fechaRef}
            name="socio_fecha_unimar"
            type="date"
            min={FECHA_MINIMA_UNIMAR}
            max={maxFecha || undefined}
            disabled={disabled}
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
            required
            className={cn(
              editableClass,
              hasAttemptedNext && !isFechaValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse"
            )}
          />
        </div>

        {/* Otros Estudios Realizados (Opcional ) */}
        <div className="space-y-1 col-span-full">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Info className="h-3 w-3 text-[#d4a843]" /> Otros Estudios Realizados
          </Label>
          <Input
            name="socio_otros_estudios"
            type="text"
            disabled={disabled}
            value={otrosEstudios}
            onChange={handleSoloLetras(setOtrosEstudios)}
            placeholder="Cursos o diplomados realizados (Opcional)"
            className={editableClass}
          />
        </div>

        {/* Modalidad de Estudio */}
        <div className="col-span-full space-y-1.5 mt-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-[#d4a843]" /> Modalidad de Estudio Elegida
          </Label>
          <RadioGroup
            value={modalidad}
            onValueChange={setModalidad}
            disabled={disabled}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
          >
            {[
              { id: "mod_p", val: "P", label: "Presencial" },
              { id: "mod_s", val: "S", label: "Semipresencial" },
              { id: "mod_v", val: "V", label: "Virtual" }
            ].map((mod) => (
              <label
                key={mod.id}
                htmlFor={mod.id}
                className="flex items-center justify-center gap-2 px-4 h-12 lg:h-9 rounded-xl border border-slate-200 bg-slate-50/50 has-[:checked]:bg-[#1e3a5f]/5 has-[:checked]:border-[#1e3a5f] transition-all cursor-pointer w-full"
              >
                <RadioGroupItem value={mod.val} id={mod.id} className="h-4 w-4 text-[#1e3a5f]" />
                <span className="text-xs lg:text-[10px] font-bold text-[#1e3a5f] cursor-pointer uppercase select-none">{mod.label}</span>
              </label>
            ))}
          </RadioGroup>
          <input type="hidden" name="socio_modalidad" value={modalidad} />
        </div>
      </div>
    </div>
  )
}