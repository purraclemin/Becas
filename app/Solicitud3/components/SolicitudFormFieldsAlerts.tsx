"use client"

import React from "react"
import { AlertTriangle, Edit3, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * 🟢 COMPONENTE: ALERTA DE PROMEDIO (Diseño Inmersivo)
 * Se muestra de forma elegante en la columna izquierda o sobre el formulario
 * para advertir sobre la revisión especial según el índice académico.
 */
export function SolicitudPromedioAlert({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <div className="bg-amber-50/50 backdrop-blur-md border-2 border-amber-100/50 p-6 rounded-[2.5rem] flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-sm relative overflow-hidden">
      {/* Decoración de fondo sutil */}
      <div className="absolute -top-4 -right-4 opacity-5">
        <ShieldAlert className="h-20 w-20 text-amber-600" />
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center border border-amber-100 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
        </div>
        <p className="text-[11px] font-black uppercase text-amber-900 tracking-[0.15em]">
          Alerta Académica
        </p>
      </div>

      <div className="space-y-2 relative z-10">
        <p className="text-[10px] text-amber-800/80 leading-relaxed font-bold uppercase tracking-tight italic">
          Su promedio actual es inferior a <span className="text-amber-600 font-black">16.00 pts</span>.
        </p>
        <p className="text-[9px] text-amber-700/60 leading-relaxed font-medium uppercase tracking-tighter">
          * Su postulación pasará automáticamente a una fase de <b>Revisión Especial</b> por el Comité de Bienestar Estudiantil.
        </p>
      </div>
    </div>
  );
}

/**
 * 🟢 COMPONENTE: BOTÓN DE EDICIÓN (Diseño Inmersivo)
 * Permite al usuario habilitar los campos si la solicitud está en estado 'Pendiente'.
 */
export function SolicitudEditButton({ isPending, isEditing, onEdit }: { isPending: boolean, isEditing: boolean, onEdit: () => void }) {
  if (!isPending || isEditing) return null;
  return (
    <div className="flex justify-end items-center mb-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <Button 
        type="button" 
        onClick={onEdit}
        className="bg-white text-[#1e3a5f] border-2 border-slate-50 hover:border-[#d4a843]/30 hover:bg-[#d4a843]/5 gap-3 font-black uppercase tracking-[0.2em] text-[10px] h-14 px-8 rounded-2xl shadow-sm transition-all active:scale-95 group"
      >
        <Edit3 className="h-4 w-4 text-[#d4a843] transition-transform group-hover:rotate-12" /> 
        Habilitar Formulario para Edición
      </Button>
    </div>
  );
}