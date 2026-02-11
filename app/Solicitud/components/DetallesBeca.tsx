"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, GraduationCap, FileText, LayoutDashboard } from "lucide-react"
import { SeccionFormulario } from "./EncuestaUI" 

/**
 * 🟢 COMPONENTE: DETALLES DEL BENEFICIO (LIMPIO)
 * Ahora funciona como una sección colapsable sincronizada con el formulario.
 */
export function DetallesBeca({ 
  disabled, 
  promedio, 
  user, 
  isOpen, 
  onToggle 
}: { 
  disabled: boolean, 
  promedio: string, 
  user: any, 
  isOpen: boolean, 
  onToggle: () => void 
}) {
  return (
    <SeccionFormulario
      titulo="2. Detalles del Beneficio"
      icono={LayoutDashboard}
      iconoBg="bg-[#1e3a5f]"
      iconoColor="text-[#d4a843]"
      estaAbierto={isOpen}
      alAlternar={onToggle}
    >
        {/* Contenedor con espaciado optimizado */}
        <div className="space-y-10 pt-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Selección del Tipo de Beca */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <BookOpen className="h-3 w-3 text-[#d4a843]" /> Modalidad de Beca
              </Label>
              <Select name="tipo_beca" disabled={disabled} defaultValue={user?.tipo_beca}>
                <SelectTrigger className={`h-11 border-slate-200 text-xs font-bold transition-all rounded-xl ${
                  disabled 
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-100 shadow-none" 
                    : "bg-white text-[#1e3a5f] hover:border-slate-300"
                }`}>
                  <SelectValue placeholder="Seleccionar beneficio..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="Academica" className="text-xs font-bold uppercase">Beca Académica</SelectItem>
                  <SelectItem value="Socioeconomica" className="text-xs font-bold uppercase">Beca Socioeconómica</SelectItem>
                  <SelectItem value="Deportiva" className="text-xs font-bold uppercase">Beca Deportiva</SelectItem>
                  <SelectItem value="Excelencia" className="text-xs font-bold uppercase">Beca a la Excelencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Promedio Académico (Cálculo Automático) */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <GraduationCap className="h-3 w-3 text-[#d4a843]" /> Índice Académico Reportado
              </Label>
              <div className="relative group">
                <Input 
                  value={promedio}
                  readOnly
                  className="h-11 border-[#d4a843]/30 bg-[#d4a843]/5 text-sm font-black text-[#1e3a5f] text-center focus-visible:ring-0 cursor-not-allowed select-none rounded-xl" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#d4a843] uppercase tracking-widest pointer-events-none">
                  Puntos
                </span>
              </div>
            </div>
          </div>

          {/* Justificación de la Solicitud */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
                <FileText className="h-3 w-3 text-[#d4a843]" /> Exposición de Motivos
            </Label>
            
            <Textarea 
              name="motivo_solicitud" 
              placeholder="Explique detalladamente las razones por las cuales solicita el beneficio económico..." 
              className={`min-h-[140px] p-5 rounded-2xl resize-none text-xs leading-relaxed transition-all duration-300 ${
                disabled 
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                  : "bg-white border-slate-200 text-[#1e3a5f] focus-visible:ring-[#1e3a5f] hover:border-slate-300"
              }`} 
              readOnly={disabled}
              defaultValue={user?.motivo_solicitud}
              required
            />
            <p className="text-[9px] text-slate-400 font-medium italic ml-1">
                * Describa su situación socioeconómica actual de forma honesta.
            </p>
          </div>

        </div>
    </SeccionFormulario>
  )
}