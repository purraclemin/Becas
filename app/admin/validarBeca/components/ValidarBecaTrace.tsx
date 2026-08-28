"use client"

import React from "react"
import { History } from "lucide-react"

interface SolicitudTrace {
  id?: number | string | null;
  fecha?: string | null;
  fecha_registro?: string | null;
}

interface ValidarBecaTraceProps {
  solicitud: SolicitudTrace;
}

export function ValidarBecaTrace({ solicitud }: ValidarBecaTraceProps) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 space-y-3">
      <div className="flex items-center gap-2.5">
        <History className="h-3.5 w-3.5 text-[#d4a843]" />
        <span className="text-[8px] font-black text-[#1e3a5f] uppercase tracking-widest">Trazabilidad del Sistema</span>
      </div>
      
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex flex-col">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">Fecha de Ingreso</span>
            <span className="text-[9px] font-bold text-slate-700">{solicitud.fecha || solicitud.fecha_registro || "---"}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[7px] font-black text-slate-400 uppercase tracking-wider">ID Interno</span>
            <span className="text-[9px] font-bold text-[#1e3a5f]">#{solicitud.id ? Number(solicitud.id).toString().padStart(4, '0') : "0000"}</span>
          </div>
        </div>

        <div className="p-2 bg-slate-50/70 rounded-xl border border-slate-100">
          <p className="text-[8px] text-slate-500 font-medium leading-relaxed italic text-center">
            Este registro es inmutable y forma parte del historial de auditoría de becas.
          </p>
        </div>
      </div>
    </div>
  )
}