"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, GraduationCap, FileText, LayoutDashboard, Info } from "lucide-react"

/**
 * 🟢 COMPONENTE: DETALLES DEL BENEFICIO (Dashboard Inmersivo)
 * Sección rediseñada para aprovechar el ancho completo y mejorar la jerarquía visual.
 * Se eliminó el envoltorio de SeccionFormulario para integrarse al flujo de pasos.
 */
export function DetallesBeca({ 
  disabled, 
  promedio, 
  user, 
}: { 
  disabled: boolean, 
  promedio: string, 
  user: any, 
  isOpen: boolean, 
  onToggle: () => void 
}) {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* CABECERA INFORMATIVA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
          <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-[#1e3a5f] shadow-lg flex items-center justify-center text-[#d4a843]">
                  <LayoutDashboard className="h-7 w-7" />
              </div>
              <div>
                  <h3 className="text-sm font-black uppercase text-[#1e3a5f] tracking-widest">Modalidad de Solicitud</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 tracking-tighter">Seleccione el beneficio al que desea optar este período</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SELECCIÓN DE MODALIDAD */}
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
              <BookOpen className="h-3.5 w-3.5 text-[#d4a843]" /> Tipo de Beneficio Solicitado
            </Label>
            <Select name="tipo_beca" disabled={disabled} defaultValue={user?.tipo_beca}>
              <SelectTrigger className={`h-14 border-slate-200 text-xs font-bold transition-all rounded-2xl px-6 shadow-sm ${
                disabled 
                  ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-100" 
                  : "bg-white text-[#1e3a5f] hover:border-[#1e3a5f]/30"
              }`}>
                <SelectValue placeholder="Seleccione una opción..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="BECA SOCIAL" className="text-xs font-bold uppercase py-3">BECA SOCIAL</SelectItem>
                <SelectItem value="BECA APRENDIZAJE" className="text-xs font-bold uppercase py-3">BECA APRENDIZAJE</SelectItem>
                <SelectItem value="BECA POR DISCAPACIDAD" className="text-xs font-bold uppercase py-3">BECA POR DISCAPACIDAD</SelectItem>
                <SelectItem value="BECA A LA EXCELENCIA" className="text-xs font-bold uppercase py-3">BECA A LA EXCELENCIA</SelectItem>
                <SelectItem value="OTRAS BECAS" className="text-xs font-bold uppercase py-3">OTRAS BECAS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-3">
            <Info className="h-4 w-4 text-[#d4a843] shrink-0 mt-0.5" />
            <p className="text-[9px] text-[#8b5e1b] font-bold uppercase tracking-widest leading-relaxed">
              Consulte la normativa vigente para verificar los índices mínimos requeridos en cada modalidad.
            </p>
          </div>
        </div>

        {/* INDICADOR DE ÍNDICE ACADÉMICO */}
        <div className="p-8 bg-[#1e3a5f]/5 border-2 border-[#1e3a5f]/10 rounded-[3rem] flex flex-col justify-center items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-md">
            <GraduationCap className="h-8 w-8 text-[#1e3a5f]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Promedio Actual Detectado</p>
            <div className="text-4xl font-black text-[#1e3a5f] mt-1">{promedio}</div>
            <p className="text-[9px] font-bold text-[#d4a843] uppercase tracking-widest mt-1">Puntos Acumulados</p>
          </div>
          <Input type="hidden" name="promedio_visual" value={promedio} />
        </div>
      </div>

      {/* EXPOSICIÓN DE MOTIVOS - FULL WIDTH */}
      <div className="p-8 lg:p-10 bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <FileText className="h-5 w-5 text-[#d4a843]" />
            <span className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">Exposición de Motivos</span>
        </div>
        
        <div className="space-y-4">
          <Textarea 
            name="motivo_solicitud" 
            placeholder="Describa de manera detallada las razones socioeconómicas o académicas por las cuales solicita el beneficio..." 
            className={`min-h-[200px] p-8 rounded-[2rem] resize-none text-xs font-medium leading-relaxed transition-all duration-500 border-2 ${
              disabled 
                ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                : "bg-slate-50/30 border-slate-50 text-[#1e3a5f] focus-visible:ring-4 focus-visible:ring-[#1e3a5f]/5 focus-visible:border-[#1e3a5f] hover:border-slate-200"
            }`} 
            readOnly={disabled}
            defaultValue={user?.motivo_solicitud}
            required
          />
          <div className="flex items-center justify-between px-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                * Justifique su necesidad de apoyo institucional de forma honesta.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}