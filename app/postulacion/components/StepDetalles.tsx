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
    <div className="space-y-3 lg:space-y-2.5 animate-in fade-in duration-500 h-full flex flex-col pb-16 lg:pb-0">
      
      {/* 🟢 INPUTS TÉCNICOS OCULTOS */}
      <input type="hidden" name="user_id" value={user?.id || ""} />
      <input type="hidden" name="email_institucional" value={user?.email || user?.email_institucional || ""} />
      <input type="hidden" name="promedio" value={promedio} />
      <input type="hidden" name="trimestre_seleccionado" value={trimestreEstudiante} />
      <input type="hidden" name="tipo_beca" value={tipoBecaSeleccionada || user?.tipo_beca || ""} />

      {/* Encabezado e Indicador de Promedio (Escalado adaptable) */}
      <div className="bg-slate-50 p-2.5 lg:p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center shadow-sm shrink-0">
            <LayoutDashboard className="h-3.5 w-3.5 text-[#d4a843]" />
          </div>
          <div>
            <h4 className="text-[#1e3a5f] font-black text-[11px] lg:text-[10px] uppercase tracking-tight leading-none">Configuración del Beneficio</h4>
            <p className="text-slate-500 text-[9px] lg:text-[8px] font-bold uppercase tracking-widest mt-0.5 leading-none">Especifique modalidad y justificación</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center justify-between sm:justify-end gap-3 px-3 py-1.5 lg:py-1 rounded-xl border transition-all duration-500 shadow-sm",
          getStatusClasses(avg)
        )}>
          <div className="flex flex-col items-start sm:items-end">
            <span className="text-[7px] font-black uppercase tracking-[0.15em] leading-none opacity-70">Promedio Actual</span>
            <span className="text-[9px] lg:text-[8px] font-black uppercase mt-0.5 leading-none">{getStatusLabel(avg)}</span>
          </div>
          <div className="h-6 w-8 lg:h-6 lg:w-7 rounded-lg bg-white/80 backdrop-blur-sm flex items-center justify-center border border-inherit shadow-inner shrink-0">
             <span className="text-[10px] lg:text-[9px] font-black">{promedio}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 space-y-3 lg:space-y-2">
        
        {/* Selección de Modalidad (Más cómodo en móvil, compacto en PC) */}
        <div className="space-y-1.5 shrink-0">
          <Label className="text-[9px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5 leading-none">
            <BookOpen className="h-3 w-3 text-[#d4a843]" /> Modalidad de Beneficio Solicitado
          </Label>
          <Select 
            disabled={disabled} 
            defaultValue={tipoBecaSeleccionada || user?.tipo_beca} 
            onValueChange={onTipoBecaChange}
            required
          >
            {/* Altura grande en móvil (h-12), compacta en PC (h-9) */}
            <SelectTrigger className="h-12 lg:h-9 border-slate-200 text-sm lg:text-[11px] font-bold transition-all rounded-xl bg-slate-50 focus:bg-white focus:ring-[#1e3a5f] text-[#1e3a5f]">
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
                <SelectItem key={option} value={option} className="text-sm lg:text-[11px] font-bold uppercase py-2.5 lg:py-1.5">
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exposición de Motivos (Ocupa el espacio restante sin generar espacios vacíos) */}
        <div className="flex flex-col flex-1 min-h-0 space-y-1.5">
          <div className="flex items-center justify-between px-1 shrink-0">
            <Label className="text-[9px] lg:text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5 leading-none">
              <FileText className="h-3 w-3 text-[#d4a843]" /> Exposición de Motivos
            </Label>
            <div className="flex items-center gap-1 text-[8px] lg:text-[7px] font-black text-[#d4a843] bg-[#d4a843]/10 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-[#d4a843]/20 leading-none">
              <Info className="h-2.5 w-2.5" />
              {motivo.length < 2 ? `Faltan ${2 - motivo.length} carac.` : "Requisito cumplido"}
            </div>
          </div>
          
          <div className="relative group flex flex-col flex-1 min-h-0">
            <Textarea 
              name="motivo_solicitud" 
              placeholder="Describa detalladamente su situación actual y por qué considera que debe ser beneficiario de este programa de becas..." 
              className={cn(
                "w-full h-32 lg:h-full p-3.5 lg:p-3 rounded-xl border-slate-200 bg-slate-50 text-sm lg:text-[11px] leading-relaxed text-[#1e3a5f] font-medium focus:bg-white focus:border-[#1e3a5f] focus:ring-4 focus:ring-[#1e3a5f]/5 transition-all duration-300 resize-none",
                motivo.length > 0 && motivo.length < 2 && "border-amber-200 bg-amber-50/30"
              )}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={disabled}
              required
            />
            
            <div className={cn(
              "absolute bottom-2.5 right-3 text-[9px] lg:text-[8px] font-bold uppercase tracking-widest pointer-events-none transition-colors",
              motivo.length >= 2 ? "text-green-500" : "text-slate-300"
            )}>
              {motivo.length} caracteres
            </div>
          </div>
          
          <div className="p-2 lg:p-1.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2 shrink-0">
            <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <p className="text-[9px] lg:text-[8px] text-blue-600/80 font-bold leading-none uppercase tracking-tight">
              Su exposición de motivos es fundamental para el análisis del Comité de Becas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}