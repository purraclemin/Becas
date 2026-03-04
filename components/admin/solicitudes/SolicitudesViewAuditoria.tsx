"use client"

import React from "react"
import { ArrowLeft } from "lucide-react"
import { SolicitudAuditoriaPanel } from "./SolicitudAuditoriaPanel"

interface AuditoriaViewProps {
  selectedSolicitud: any;
  onStatusChange: any;
  onClose: () => void;
  periodoActualId: number | null;
}

export function SolicitudesViewAuditoria({ selectedSolicitud, onStatusChange, onClose, periodoActualId }: AuditoriaViewProps) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#1a2744] transition-all group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Volver al listado
        </button>
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-[#1a2744]">Centro de Auditoría Activo</span>
        </div>
      </div>
      <SolicitudAuditoriaPanel 
        solicitud={selectedSolicitud} 
        onStatusChange={onStatusChange}
        onClose={onClose}
        periodoActualId={periodoActualId}
      />
    </div>
  )
}