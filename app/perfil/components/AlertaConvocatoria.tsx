"use client"

import React, { useState } from "react"
import { CalendarDays, Building2, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlertaConvocatoriaProps {
  estatus: string;
}

export function AlertaConvocatoria({ estatus }: AlertaConvocatoriaProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Normalización estricta para detectar la convocatoria (evita errores por acentos o mayúsculas)
  const s = estatus?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
  const esConvocado = s.includes('convocad');

  // Si el estudiante no ha sido convocado o ya cerró el aviso en su sesión actual, no se renderiza nada
  if (!esConvocado || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3a5f]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Cabecera Institucional con los colores de Unimar */}
        <div className="bg-[#1e3a5f] px-6 py-5 flex items-center justify-between border-b-4 border-[#d4a843]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d4a843]/20 rounded-2xl border border-[#d4a843]/30">
              <CalendarDays className="h-6 w-6 text-[#d4a843]" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#d4a843]">
                Citación Oficial Urgente
              </span>
              <h2 className="text-base font-black text-white uppercase tracking-tight">
                Entrevista Presencial Requerida
              </h2>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Cerrar aviso temporalmente"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Modal de Alerta */}
        <div className="p-6 md:p-8 space-y-6 bg-slate-50/50">
          
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-900 leading-relaxed uppercase">
              Su solicitud de beca ha avanzado en el proceso de evaluación y requiere su presencia obligatoria en el campus universitario.
            </p>
          </div>

          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 text-xs font-bold text-[#1e3a5f]">
              <Building2 className="h-4 w-4 text-[#d4a843] shrink-0" />
              <span><strong>Destino:</strong> Departamento de Bienestar Estudiantil</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
              <CalendarDays className="h-4 w-4 text-[#d4a843] shrink-0" />
              <span><strong>Acción:</strong> Acercarse con sus recaudos para culminar el estudio socioeconómico.</span>
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-500 text-center leading-relaxed italic">
            Debe presionar el botón inferior para confirmar la lectura de este aviso y acceder a los detalles de su expediente.
          </p>

        </div>

        {/* Pie del Modal con el botón de cierre obligatorio */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <Button 
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#1e3a5f] hover:bg-[#162c4a] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20 transition-all cursor-pointer"
          >
            Entendido, Cerrar Aviso
          </Button>
        </div>

      </div>
    </div>
  )
}