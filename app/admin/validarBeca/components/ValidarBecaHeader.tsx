"use client"

import React from "react"
import { ShieldCheck, CheckCircle, Clock, XCircle, AlertCircle, LucideIcon } from "lucide-react"

interface TabItem {
  label: string;
  icon: LucideIcon;
}

interface StatusChangeEvent {
  status: string;
}

interface ValidarBecaHeaderProps {
  currentStatus: string;
  onStatusChange: (e: StatusChangeEvent) => void;
}

export function ValidarBecaHeader({ currentStatus, onStatusChange }: ValidarBecaHeaderProps) {
  const tabs: TabItem[] = [
    { label: "Todas", icon: ShieldCheck },
    { label: "Pendiente", icon: Clock },
    { label: "En Revisión", icon: AlertCircle },
    { label: "Aprobada", icon: CheckCircle },
    { label: "Rechazada", icon: XCircle },
    { label: "Renovacion", icon: XCircle }
  ]

  return (
    <div className="bg-[#1e3a5f] rounded-2xl p-6 text-white shadow-lg border border-[#1e3a5f]/20 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-[#d4a843]" />
          <h1 className="text-lg font-black tracking-wider uppercase">Validación de Becas Institucionales</h1>
        </div>
        <p className="text-xs text-slate-300">Universidad de Margarita • Auditoría y Control de Asignaciones</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-[#172e4d] p-1.5 rounded-xl border border-white/10">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.label || (tab.label === "Todas" && !currentStatus);
          return (
            <button
              key={tab.label}
              onClick={() => onStatusChange({ status: tab.label })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                isActive 
                  ? "bg-[#d4a843] text-[#1e3a5f] shadow-md" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}