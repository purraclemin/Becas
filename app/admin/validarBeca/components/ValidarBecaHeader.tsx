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
    <div className="bg-[#1e3a5f] rounded-xl py-3 px-4 md:px-6 text-white shadow-md border border-[#1e3a5f]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* 🟢 TÍTULO INSTITUCIONAL */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#d4a843] shrink-0" />
        <h1 className="text-xs md:text-sm font-black tracking-wider uppercase">
          Validación de Becas Institucionales
        </h1>
      </div>

      {/* 🟢 BOTONERA: Oculta en móvil (`hidden md:flex`), sin scroll en PC, alineada fluidamente a la izquierda */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5 bg-[#172e4d] p-1 rounded-lg border border-white/10">
        {tabs.map((tab) => {
          const isActive = currentStatus === tab.label || (tab.label === "Todas" && !currentStatus);
          return (
            <button
              key={tab.label}
              onClick={() => onStatusChange({ status: tab.label })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${
                isActive 
                  ? "bg-[#d4a843] text-[#1e3a5f] shadow-sm" 
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}