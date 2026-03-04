"use client"

import React from "react"
import { AlertTriangle, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SolicitudPromedioAlert({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;
  return (
    <div className="bg-amber-50/90 backdrop-blur-sm border border-amber-200 p-5 rounded-[1.5rem] flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-xl">
      <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase text-amber-900 tracking-tight">Análisis de Índice Académico</p>
        <p className="text-[9px] text-amber-800 leading-relaxed font-medium">
          Promedio inferior a 16: Su solicitud será sometida a una revisión especial por el comité de bienestar.
        </p>
      </div>
    </div>
  );
}

export function SolicitudEditButton({ isPending, isEditing, onEdit }: { isPending: boolean, isEditing: boolean, onEdit: () => void }) {
  if (!isPending || isEditing) return null;
  return (
    <div className="flex justify-end items-center gap-3 mb-6">
      <Button 
        type="button" 
        onClick={onEdit}
        className="bg-white text-[#1e3a5f] border border-[#1e3a5f]/20 hover:border-[#1e3a5f] gap-2 font-black uppercase tracking-widest text-[10px] h-10 px-6"
      >
        <Edit3 className="h-4 w-4" /> Habilitar Edición
      </Button>
    </div>
  );
}