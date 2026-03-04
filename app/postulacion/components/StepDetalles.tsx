"use client"

import React, { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, FileText, Info, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

export function StepDetalles({
  disabled,
  user,
  onTipoBecaChange,
  tipoBecaSeleccionada,
  promedio,
  onValidationChange
}: {
  disabled: boolean;
  user: any;
  onTipoBecaChange?: (value: string) => void;
  tipoBecaSeleccionada?: string;
  promedio: string;
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [motivo, setMotivo] = useState(user?.motivo_solicitud || "");
  const avg = parseFloat(promedio);

  // Sincronización con el trimestre de StepMaterias (tabla students columna semestre)
  const trimestreEstudiante = user?.semestre || "";

  useEffect(() => {
    const isTipoValid = !!(tipoBecaSeleccionada && tipoBecaSeleccionada !== "");
    const isMotivoValid = motivo.trim().length >= 2;
    
    if (onValidationChange) {
      onValidationChange(isTipoValid && isMotivoValid);
    }
  }, [tipoBecaSeleccionada, motivo, onValidationChange]);

  const getStatusClasses = (val: number) => {
    if (val < 16) return "text-red-600 bg-red-50 border-red-100";
    if (val >= 16 && val < 18) return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-green-600 bg-green-50 border-green-100";
  };

  const getStatusLabel = (val: number) => {
    if (val < 16) return "Índice Regular";
    if (val >= 16 && val < 18) return "Buen Índice";
    return "Índice de Excelencia";
  };

  return (
    <div className="flex flex-col h-full space-y-5 animate-in fade-in duration-500">
      
      {/* 🟢 INPUTS TÉCNICOS OCULTOS (Requeridos por ActionsSolicitud.ts) */}
      <input type="hidden" name="user_id" value={user?.id || ""} />
      <input type="hidden" name="email_institucional" value={user?.email || user?.email_institucional || ""} />
      <input type="hidden" name="promedio" value={promedio} />
      <input type="hidden" name="trimestre_seleccionado" value={trimestreEstudiante} />
      <input type="hidden" name="tipo_beca" value={tipoBecaSeleccionada || user?.tipo_beca || ""} />

      {/* Encabezado e Indicador de Promedio */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#d4a843]/10 flex items-center justify-center border border-[#d4a843]/20">
            <LayoutDashboard className="h-5 w-5 text-[#d4a843]" />
          </div>
          <div>
            <h3 className="text-[#1e3a5f] font-black text-base uppercase tracking-tight leading-none">Configuración del Beneficio</h3>
            <p className="text-slate-400 text-[11px] font-medium mt-1 leading-none">Especifique la modalidad de beca y justifique su solicitud.</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all duration-500 shadow-sm",
          getStatusClasses(avg)
        )}>
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black uppercase tracking-[0.15em] leading-none opacity-70">Promedio Actual</span>
            <span className="text-[9px] font-black uppercase mt-1 leading-none">{getStatusLabel(avg)}</span>
          </div>
          <div className="h-7 w-9 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center border border-inherit shadow-inner">
             <span className="text-[11px] font-black">{promedio}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 gap-5">
        
        {/* Selección de Modalidad */}
        <div className="space-y-2.5 shrink-0">
          <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
            <BookOpen className="h-3 w-3 text-[#d4a843]" /> Modalidad de Beneficio Solicitado
          </Label>
          <Select 
            disabled={disabled} 
            defaultValue={tipoBecaSeleccionada || user?.tipo_beca} 
            onValueChange={onTipoBecaChange}
            required
          >
            <SelectTrigger className="h-11 border-slate-200 text-xs font-bold transition-all rounded-xl bg-slate-50 focus:bg-white focus:ring-[#1e3a5f] text-[#1e3a5f]">
              <SelectValue placeholder="Seleccione el tipo de beneficio..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {[
                "BECA SOCIAL", "BECA APRENDIZAJE", "BECA POR DISCAPACIDAD", 
                "BECA A LA EXCELENCIA", "Ayuda Económica General", 
                "Ayuda Económica Familiar", "Ayuda Económica para Trabajadores",
                "Ayuda Económica para Hijos de Trabajadores",
                "Ayuda Económica para Estudiantes Preparadores",
                "Ayuda Económica por Actividades Extracurriculares"
              ].map(option => (
                <SelectItem key={option} value={option} className="text-[11px] font-bold uppercase py-2">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exposición de Motivos */}
        <div className="flex flex-col flex-1 min-h-0 space-y-2.5">
          <div className="flex items-center justify-between shrink-0">
            <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-[#d4a843]" /> Exposición de Motivos
            </Label>
            <div className="flex items-center gap-1 text-[8px] font-black text-[#d4a843] bg-[#d4a843]/10 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-[#d4a843]/20">
              <Info className="h-2.5 w-2.5" />
              {motivo.length < 2 ? `Faltan ${2 - motivo.length} carac.` : "Requisito cumplido"}
            </div>
          </div>
          
          <div className="relative group flex-1 flex flex-col min-h-0">
            <Textarea 
              name="motivo_solicitud" 
              placeholder="Describa detalladamente su situación actual y por qué considera que debe ser beneficiario de este programa de becas..." 
              className={cn(
                "flex-1 w-full p-4 md:p-5 rounded-2xl border-slate-200 bg-slate-50 text-xs leading-relaxed text-[#1e3a5f] font-medium focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 transition-all duration-300 resize-none",
                motivo.length > 0 && motivo.length < 2 && "border-amber-200 bg-amber-50/30"
              )}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={disabled}
              required
            />
            
            <div className={cn(
              "absolute bottom-3 right-4 text-[8px] font-bold uppercase tracking-widest pointer-events-none transition-colors",
              motivo.length >= 2 ? "text-green-500" : "text-slate-300"
            )}>
              {motivo.length} caracteres
            </div>
          </div>
          
          <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2 shrink-0">
            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[9px] text-blue-600/80 font-bold leading-relaxed uppercase tracking-tight">
              Su exposición de motivos es fundamental para el análisis del Comité de Becas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}