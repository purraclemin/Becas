"use client"

import React from "react"
import { ArrowLeft, ShieldCheck, Award } from "lucide-react"
import { ValidarBecaAuditoriaPanel } from "./ValidarBecaAuditoriaPanel"
import { getBadgeColor } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"

interface SolicitudAuditoriaView {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  estatus?: string;
  [key: string]: any;
}

interface ValidarBecaViewAuditoriaProps {
  selectedSolicitud: SolicitudAuditoriaView | null;
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean) => void;
  onClose: () => void;
  periodoActualId: number | null;
}

export function ValidarBecaViewAuditoria({ 
  selectedSolicitud, 
  onStatusChange, 
  onClose, 
  periodoActualId 
}: ValidarBecaViewAuditoriaProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4">
      {/* CABECERA DE AUDITORÍA: Estandarizada al tamaño de ValidarBecaHeader */}
      <div className="bg-[#1e3a5f] rounded-2xl px-5 py-4 text-white shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="h-9 w-9 bg-white/10 hover:bg-white/20 rounded-xl text-[#d4a843] flex items-center justify-center transition-all shrink-0"
            title="Volver a la lista"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="h-4 w-4 text-[#d4a843]" />
              <h1 className="text-xs md:text-sm font-black tracking-wider uppercase text-white">Auditoría y Validación de Beca</h1>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              {selectedSolicitud?.nombre || ""} {selectedSolicitud?.apellido || ""} • V-{selectedSolicitud?.cedula || ""}
            </p>
          </div>
        </div>

        {/* Estatus Actual con el color predeterminado idéntico al de la tabla */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#172e4d] rounded-xl border border-white/10 shrink-0">
          <Award className="h-3.5 w-3.5 text-[#d4a843]" />
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">Estatus:</span>
          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getBadgeColor(selectedSolicitud?.estatus || '')}`}>
            {selectedSolicitud?.estatus || "S/I"}
          </span>
        </div>
      </div>

      {/* PANEL DE AUDITORÍA INTEGRADO Y AUTÓNOMO */}
      <ValidarBecaAuditoriaPanel 
        solicitud={selectedSolicitud}
        onStatusChange={onStatusChange}
        onClose={onClose}
        periodoActualId={periodoActualId}
      />
    </div>
  )
}