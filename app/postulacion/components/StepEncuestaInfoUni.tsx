"use client"

import React, { useEffect, useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  GraduationCap,
  School,
  History,
  CalendarClock,
  Globe,
  ShieldCheck,
  Info,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PostulacionUser } from "../types"

function formatearFechaDDMMYYYY(valor: string | undefined): {
  visualDDMMYYYY: string;
  isoYYYYMMDD: string;
} {
  if (!valor || valor.trim() === "") {
    return { visualDDMMYYYY: "01-01-2024", isoYYYYMMDD: "2024-01-01" };
  }

  const limpio = valor.trim();
  const baseFecha = limpio.includes("T") ? limpio.split("T")[0] : limpio;

  if (/^\d{4}-\d{2}-\d{2}$/.test(baseFecha)) {
    const [anio, mes, dia] = baseFecha.split("-");
    return {
      visualDDMMYYYY: `${dia}-${mes}-${anio}`,
      isoYYYYMMDD: baseFecha,
    };
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(baseFecha)) {
    const [dia, mes, anio] = baseFecha.split("-");
    return {
      visualDDMMYYYY: baseFecha,
      isoYYYYMMDD: `${anio}-${mes}-${dia}`,
    };
  }

  const fechaObj = new Date(limpio);
  if (!Number.isNaN(fechaObj.getTime())) {
    const anio = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaObj.getDate()).padStart(2, "0");
    return {
      visualDDMMYYYY: `${dia}-${mes}-${anio}`,
      isoYYYYMMDD: `${anio}-${mes}-${dia}`,
    };
  }

  return { visualDDMMYYYY: "01-01-2024", isoYYYYMMDD: "2024-01-01" };
}

function formatearModalidadTexto(codigo: string | undefined): {
  textoVisual: string;
  codigoValor: string;
} {
  const limpio = (codigo || "P").trim().toUpperCase();
  if (limpio === "S" || limpio === "SEMIPRESENCIAL") {
    return { textoVisual: "Semipresencial", codigoValor: "S" };
  }
  if (limpio === "V" || limpio === "VIRTUAL") {
    return { textoVisual: "Virtual", codigoValor: "V" };
  }
  return { textoVisual: "Presencial", codigoValor: "P" };
}

export function StepEncuestaInfoUni({
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  const ueProcedenciaValor = user?.socio_ue_procedencia || "U.E. Colegio Virgen del Valle";
  const otrosEstudiosValor = user?.socio_otros_estudios || "Ninguno";

  const { visualDDMMYYYY: fechaUnimarVisual, isoYYYYMMDD: fechaUnimarISO } = useMemo(
    () => formatearFechaDDMMYYYY(user?.socio_fecha_unimar),
    [user?.socio_fecha_unimar]
  );

  const { textoVisual: modalidadVisual, codigoValor: modalidadCodigo } = useMemo(
    () => formatearModalidadTexto(user?.socio_modalidad),
    [user?.socio_modalidad]
  );

  const readOnlyClass =
    "h-12 lg:h-9 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/80 cursor-not-allowed text-sm lg:text-xs shadow-none px-3 rounded-xl select-none";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 pb-16 lg:pb-0">
      {/* BLOQUE 1: DATOS ACADÉMICOS MAESTROS (SOLO LECTURA) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 lg:p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">
            Registro Académico Oficial (Solo Lectura)
          </span>
        </div>

        <div className="space-y-1 sm:col-span-3">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="h-2.5 w-2.5 text-[#d4a843]" /> Carrera que Cursa
          </Label>
          <Input
            name="socio_carrera"
            readOnly
            aria-readonly="true"
            value={user?.socio_carrera || user?.carrera || "No especificada"}
            className={readOnlyClass}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5">
            <History className="h-2.5 w-2.5 text-[#d4a843]" /> Trimestre Actual
          </Label>
          <Input
            name="socio_trimestre"
            readOnly
            aria-readonly="true"
            value={user?.socio_trimestre?.toString() || user?.semestre?.toString() || "0"}
            className={cn(readOnlyClass, "text-center")}
          />
        </div>
      </div>

      {/* BLOQUE 2: INFORMACIÓN DE PROCEDENCIA Y MODALIDAD PRECARGADOS (SOLO LECTURA) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 lg:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="col-span-full flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">
              Detalles de Formación Precargados
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
            <Lock className="h-2.5 w-2.5 text-[#d4a843]" /> Solo Lectura
          </span>
        </div>

        {/* U.E. de Procedencia */}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <School className="h-3 w-3 text-[#d4a843]" /> U.E. de Procedencia
          </Label>
          <Input
            name="socio_ue_procedencia"
            type="text"
            readOnly
            aria-readonly="true"
            value={ueProcedenciaValor}
            className={readOnlyClass}
          />
        </div>

        {/* Fecha Ingreso UNIMAR (Formato DD-MM-YYYY en vista de solo lectura) */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <CalendarClock className="h-3 w-3 text-[#d4a843]" /> Fecha Ingreso UNIMAR
          </Label>
          <Input
            type="text"
            readOnly
            aria-readonly="true"
            value={fechaUnimarVisual}
            className={cn(readOnlyClass, "text-center font-mono")}
          />
          <input type="hidden" name="socio_fecha_unimar" value={fechaUnimarISO} />
        </div>

        {/* Otros Estudios Realizados */}
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Info className="h-3 w-3 text-[#d4a843]" /> Otros Estudios Realizados
          </Label>
          <Input
            name="socio_otros_estudios"
            type="text"
            readOnly
            aria-readonly="true"
            value={otrosEstudiosValor}
            className={readOnlyClass}
          />
        </div>

        {/* Modalidad de Estudio */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-[#d4a843]" /> Modalidad de Estudio
          </Label>
          <Input
            type="text"
            readOnly
            aria-readonly="true"
            value={modalidadVisual}
            className={readOnlyClass}
          />
          <input type="hidden" name="socio_modalidad" value={modalidadCodigo} />
        </div>
      </div>
    </div>
  )
}