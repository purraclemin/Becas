"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, GraduationCap, FileText, LayoutDashboard } from "lucide-react"

// 🟢 CORRECCIÓN: Importamos desde el archivo neutral para romper la dependencia circular
import { SeccionFormulario } from "./EncuestaUI" 

export function DetallesBeca({ disabled, promedio, user, isOpen }: any) {
  return (
    <SeccionFormulario
      titulo="2. Detalles del Beneficio"
      icono={LayoutDashboard}
      iconoBg="bg-[#1e3a5f]"
      iconoColor="text-[#d4a843]"
      estaAbierto={isOpen}
      alAlternar={() => {}} // Bloqueado para mantener la vista plana
    >
        {/* Contenedor con espaciado vertical aumentado para separar los bloques */}
        <div className="space-y-10">
          
          {/* BLOQUE SUPERIOR: TIPO Y PROMEDIO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Beca */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Tipo de Beca
              </Label>
              <Select name="tipoBeca" disabled={disabled} defaultValue={user?.tipo_beca}>
                <SelectTrigger className={`border-slate-200 text-xs font-bold transition-all duration-300 ${
                  disabled 
                    // 🟢 ESTILO OSCURO DE BLOQUEO
                    ? "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed opacity-100 shadow-none" 
                    : "bg-white text-[#1e3a5f]"
                }`}>
                  <SelectValue placeholder="Seleccionar beneficio..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academica">Beca Académica</SelectItem>
                  <SelectItem value="Socioeconomica">Beca Socioeconómica</SelectItem>
                  <SelectItem value="Deportiva">Beca Deportiva</SelectItem>
                  <SelectItem value="Excelencia">Beca a la Excelencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Promedio Calculado (Siempre solo lectura) */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <GraduationCap className="h-3 w-3" /> Promedio Actual (Calculado)
              </Label>
              <div className="relative">
                <Input 
                  value={promedio}
                  readOnly
                  className="border-[#d4a843]/30 bg-[#d4a843]/10 text-sm font-black text-[#1e3a5f] text-center focus-visible:ring-0 cursor-not-allowed select-none" 
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-[#d4a843] uppercase tracking-widest pointer-events-none">
                  PTS
                </span>
              </div>
            </div>
          </div>

          {/* BLOQUE INFERIOR: MOTIVO */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <FileText className="h-3 w-3" /> Motivo de la Solicitud
            </Label>
            
            <Textarea 
              name="motivo" 
              placeholder="Explique su situación académica y socioeconómica..." 
              className={`min-h-[120px] resize-none text-xs leading-relaxed focus-visible:ring-[#1e3a5f] transition-all duration-300 ${
                disabled 
                  // 🟢 ESTILO OSCURO DE BLOQUEO PARA TEXTAREA
                  ? "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
                  : "bg-white border-slate-200 text-slate-700"
              }`} 
              // 🟢 IMPORTANTE: Usamos readOnly en lugar de disabled para que el valor viaje en el FormData
              readOnly={disabled}
              defaultValue={user?.motivo_solicitud}
            />
          </div>

        </div>
    </SeccionFormulario>
  )
}