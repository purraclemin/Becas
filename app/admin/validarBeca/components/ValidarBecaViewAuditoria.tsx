"use client"

import React from "react"
import { ArrowLeft, ShieldCheck, Award } from "lucide-react"
import { ValidarBecaAuditoriaPanel } from "./ValidarBecaAuditoriaPanel"

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
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
      {/* CABECERA DE AUDITORÍA */}
      <div className="bg-[#1e3a5f] rounded-2xl p-6 text-white shadow-lg border border-[#1e3a5f]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[#d4a843] transition-all"
            title="Volver a la lista"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-5 w-5 text-[#d4a843]" />
              <h1 className="text-lg font-black tracking-wider uppercase">Auditoría y Validación de Beca</h1>
            </div>
            <p className="text-xs text-slate-300">
              {selectedSolicitud?.nombre || ""} {selectedSolicitud?.apellido || ""} • V-{selectedSolicitud?.cedula || ""}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#172e4d] rounded-xl border border-white/10">
          <Award className="h-4 w-4 text-[#d4a843]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Estatus Actual: {selectedSolicitud?.estatus || "S/I"}</span>
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