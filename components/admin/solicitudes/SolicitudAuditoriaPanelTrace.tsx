"use client"

import React from "react"
import { History } from "lucide-react"

export function SolicitudAuditoriaPanelTrace({ solicitud }: { solicitud: any }) {
  return (
    <div className="p-6 bg-white rounded-[2rem] shadow-xl border border-slate-200 space-y-4">
      <div className="flex items-center gap-3">
        <History className="h-3.5 w-3.5 text-[#d4a843]" />
        <span className="text-[8px] font-black text-[#1a2744] uppercase tracking-widest">Trazabilidad del Sistema</span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Fecha de Ingreso</span>
            <span className="text-[10px] font-bold text-slate-700">{solicitud.fecha || solicitud.fecha_registro || "---"}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">ID Interno</span>
            <span className="text-[10px] font-bold text-[#1a2744]">#{solicitud.id?.toString().padStart(4, '0')}</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50 rounded-lg">
          <p className="text-[8px] text-slate-400 font-medium leading-relaxed italic text-center">
            Este registro es inmutable y forma parte del historial de auditoría de becas.
          </p>
        </div>
      </div>
    </div>
  )
}