"use client"

import React, { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, FileText, Info, LayoutDashboard, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MODALIDADES_POSTULABLES_ESTUDIANTE,
  normalizarTipoBecaOficial,
} from "@/lib/RecordAcademicoUtils"
import type { PostulacionUser } from "../types"

const MIN_CARACTERES_MOTIVO = 20;
const MIN_LETRAS_MOTIVO = 10;
const MAX_CARACTERES_MOTIVO = 1000;

const sanitizarMotivo = (val: string): string => {
  return val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,;:¡!¿?()\-/"]/g, "");
};

export function StepDetalles({
  disabled,
  user,
  onTipoBecaChange,
  tipoBecaSeleccionada,
  promedio,
  indiceGlobal,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onTipoBecaChange?: (value: string) => void;
  tipoBecaSeleccionada?: string;
  promedio: string;
  indiceGlobal?: string;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [motivo, setMotivo] = useState<string>(
    user?.motivo_solicitud ? sanitizarMotivo(user.motivo_solicitud) : ""
  );

  const parsedAvg = parseFloat(promedio);
  const avgTrimestral = Number.isFinite(parsedAvg) ? parsedAvg : 0;
  const parsedGlobal = parseFloat(indiceGlobal || String(user?.indice_global ?? "0"));
  const avgGlobal = Number.isFinite(parsedGlobal) ? parsedGlobal : 0;

  const semestreNum = Number(user?.semestre ?? 1) || 1;
  const esPrimerTrimestre = semestreNum <= 1;
  const trimestreAnteriorNum =
    user?.trimestre_ultimo_cursado && user.trimestre_ultimo_cursado > 0
      ? user.trimestre_ultimo_cursado
      : Math.max(1, semestreNum - 1);

  const trimestreEstudiante = user?.semestre !== undefined ? String(user.semestre) : "";
  const tipoBecaBruto =
    tipoBecaSeleccionada !== undefined ? tipoBecaSeleccionada : (user?.tipo_beca || "");
  const tipoBecaActual = normalizarTipoBecaOficial(tipoBecaBruto) || tipoBecaBruto;

  // Catálogo estricto de las 8 modalidades postulables por el estudiante
  const modalidadesDisponibles = MODALIDADES_POSTULABLES_ESTUDIANTE;

  useEffect(() => {
    if (
      tipoBecaActual &&
      !(modalidadesDisponibles as readonly string[]).includes(tipoBecaActual)
    ) {
      onTipoBecaChange?.("");
    }
  }, [modalidadesDisponibles, tipoBecaActual, onTipoBecaChange]);

  const motivoLimpio = motivo.trim();
  const cantidadLetrasMotivo = motivoLimpio.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, "").length;

  const isTipoValid = (modalidadesDisponibles as readonly string[]).includes(tipoBecaActual);
  const isMotivoValid =
    motivoLimpio.length >= MIN_CARACTERES_MOTIVO &&
    cantidadLetrasMotivo >= MIN_LETRAS_MOTIVO;

  useEffect(() => {
    onValidationChange?.(isTipoValid && isMotivoValid);
  }, [isTipoValid, isMotivoValid, onValidationChange]);

  const getStatusClasses = (val: number): string => {
    if (esPrimerTrimestre) return "text-[#1e3a5f] bg-slate-100 border-slate-200";
    if (val < 16) return "text-red-600 bg-red-50 border-red-100";
    if (val >= 16 && val < 18) return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-emerald-700 bg-emerald-50 border-emerald-200";
  };

  const getStatusLabel = (val: number): string => {
    if (esPrimerTrimestre) return "Nuevo Ingreso";
    if (val < 16) return "Por debajo de 16 pts";
    if (val >= 16 && val < 18) return "";
    return "Rendimiento Destacado";
  };

  const getMotivoBadgeText = (): string => {
    if (motivoLimpio.length < MIN_CARACTERES_MOTIVO) {
      return `Faltan ${MIN_CARACTERES_MOTIVO - motivoLimpio.length} carac.`;
    }
    if (cantidadLetrasMotivo < MIN_LETRAS_MOTIVO) {
      return "Redacte un motivo válido";
    }
    return "Requisito cumplido";
  };

  return (
    <div className="space-y-3 lg:space-y-2.5 animate-in fade-in duration-500 h-full flex flex-col pb-16 lg:pb-0">
      {/* INPUTS TÉCNICOS OCULTOS */}
      <input type="hidden" name="user_id" value={user?.id !== undefined ? String(user.id) : ""} />
      <input type="hidden" name="email_institucional" value={user?.email || user?.email_institucional || ""} />
      <input type="hidden" name="promedio" value={promedio} />
      <input type="hidden" name="trimestre_seleccionado" value={trimestreEstudiante} />
      <input type="hidden" name="tipo_beca" value={isTipoValid ? tipoBecaActual : ""} />

      {/* Encabezado e Indicador de Promedio del Trimestre Anterior */}
      <div className="bg-[#f8fafc] p-2.5 lg:p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm shrink-0">
            <LayoutDashboard className="h-3.5 w-3.5 text-[#d4a843]" />
          </div>
          <div>
            <h4 className="text-[#1e3a5f] font-black text-xs lg:text-[10px] uppercase tracking-tight leading-none">
              Configuración del Beneficio
            </h4>
            <p className="text-slate-500 text-[9px] lg:text-[8px] font-bold uppercase tracking-widest mt-0.5 leading-none">
              Normativa de Becas y Ayudas Económicas UNIMAR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!esPrimerTrimestre && avgGlobal > 0 && (
            <div className="hidden md:flex flex-col items-end px-2.5 py-1 rounded-xl bg-white border border-slate-200">
              <span className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none">
                Índice Global
              </span>
              <span className="text-[10px] font-black text-[#1e3a5f] tabular-nums mt-0.5 leading-none">
                {avgGlobal.toFixed(2)}
              </span>
            </div>
          )}

          <div className={cn(
            "flex items-center justify-between sm:justify-end gap-3 px-3 py-1.5 lg:py-1 rounded-xl border transition-all duration-500 shadow-sm",
            getStatusClasses(avgTrimestral)
          )}>
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[7px] font-black uppercase tracking-[0.15em] leading-none opacity-75">
                {esPrimerTrimestre ? "Condición" : `Prom. Trimestre ${trimestreAnteriorNum}`}
              </span>
              <span className="text-[9px] lg:text-[8px] font-black uppercase mt-0.5 leading-none">
                {getStatusLabel(avgTrimestral)}
              </span>
            </div>
            {!esPrimerTrimestre && (
              <div className="h-6 w-10 lg:h-6 lg:w-9 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center border border-inherit shadow-inner shrink-0">
                <span className="text-[10px] lg:text-[9px] font-black tabular-nums">
                  {avgTrimestral.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 space-y-3 lg:space-y-2">
        {/* Selección de Modalidad (8 modalidades postulables) */}
        <div className="space-y-1.5 shrink-0">
          <Label className="text-[9px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5 leading-none">
            <BookOpen className="h-3 w-3 text-[#d4a843]" /> Modalidad de Beneficio Solicitado
          </Label>
          <Select
            disabled={disabled}
            value={isTipoValid ? tipoBecaActual : ""}
            onValueChange={(val) => onTipoBecaChange?.(val)}
            required
          >
            <SelectTrigger className="h-12 lg:h-9 border-slate-200 text-sm lg:text-xs font-bold transition-all rounded-xl bg-slate-50 focus:bg-white focus:ring-[#1e3a5f] text-[#1e3a5f]">
              <SelectValue placeholder="Seleccione el tipo de beneficio..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {modalidadesDisponibles.map((option) => (
                <SelectItem key={option} value={option} className="text-sm lg:text-xs font-bold uppercase py-2.5 lg:py-1.5">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          
        </div>

        {/* Exposición de Motivos */}
        <div className="flex flex-col flex-1 min-h-0 space-y-1.5">
          <div className="flex items-center justify-between px-1 shrink-0">
            <Label className="text-[9px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5 leading-none">
              <FileText className="h-3 w-3 text-[#d4a843]" /> Exposición de Motivos
            </Label>
            <div className={cn(
              "flex items-center gap-1 text-[8px] lg:text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border leading-none",
              isMotivoValid
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-[#d4a843] bg-[#d4a843]/10 border-[#d4a843]/20"
            )}>
              <Info className="h-2.5 w-2.5" />
              {getMotivoBadgeText()}
            </div>
          </div>

          <div className="relative group flex flex-col flex-1 min-h-0">
            <Textarea
              name="motivo_solicitud"
              maxLength={MAX_CARACTERES_MOTIVO}
              placeholder="Describa detalladamente su situación actual y por qué considera que debe ser beneficiario de este programa de becas..."
              className={cn(
                "w-full h-36 lg:h-full p-3.5 lg:p-3 rounded-xl border-slate-200 bg-slate-50 text-sm lg:text-xs leading-relaxed text-[#1e3a5f] font-medium focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 transition-all duration-300 resize-none",
                motivo.length > 0 && !isMotivoValid && "border-amber-300 bg-amber-50/30"
              )}
              value={motivo}
              onChange={(e) => setMotivo(sanitizarMotivo(e.target.value))}
              disabled={disabled}
              required
            />

            <div className={cn(
              "absolute bottom-2.5 right-3 text-[9px] lg:text-[8px] font-bold uppercase tracking-widest pointer-events-none transition-colors",
              isMotivoValid ? "text-emerald-600" : "text-slate-400"
            )}>
              {motivoLimpio.length} / {MAX_CARACTERES_MOTIVO}
            </div>
          </div>

          <div className="p-2 lg:p-1.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 shrink-0">
            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <p className="text-[9px] lg:text-[8px] text-blue-600/80 font-bold leading-none uppercase tracking-tight">
              Evaluación académica: promedio &ge; 16.00 pts y cero asignaturas reprobadas (&lt; 10 pts) en el trimestre anterior.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}