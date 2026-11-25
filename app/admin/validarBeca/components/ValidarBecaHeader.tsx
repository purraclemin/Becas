"use client"

import React from "react"
import { ShieldCheck, CheckCircle, Clock, XCircle, AlertCircle, LucideIcon } from "lucide-react"

interface TabItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface StatusChangeEvent {
  status: string;
}

interface ValidarBecaHeaderProps {
  currentStatus: string;
  onStatusChange: (e: StatusChangeEvent) => void;
  esSecretariaGeneral?: boolean;
}

export function ValidarBecaHeader({
  currentStatus,
  onStatusChange,
  esSecretariaGeneral = false
}: ValidarBecaHeaderProps) {
  const tabsCoordinacion: TabItem[] = [
    { label: "Todas", value: "Todas", icon: ShieldCheck },
    { label: "Pendiente", value: "Pendiente", icon: Clock },
    { label: "Convocado", value: "Convocado a Entrevista", icon: Clock },
    { label: "En Revisión", value: "En Revisión", icon: AlertCircle },
    { label: "Aprobada", value: "Aprobada", icon: CheckCircle },
    { label: "Rechazada", value: "Rechazada", icon: XCircle },
    { label: "Renovacion", value: "Renovacion", icon: XCircle }
  ];

  const tabsSecretaria: TabItem[] = [
    { label: "En Revisión (Pendientes de Dictamen)", value: "En Revisión", icon: AlertCircle }
  ];

  const tabs = esSecretariaGeneral ? tabsSecretaria : tabsCoordinacion;

  return (
    <div className="bg-[#1e3a5f] rounded-xl py-3 px-4 md:px-6 text-white shadow-md border border-[#1e3a5f]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      {/* TÍTULO INSTITUCIONAL */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#d4a843] shrink-0" />
        <h1 className="text-xs md:text-sm font-black tracking-wider uppercase">
          {esSecretariaGeneral
            ? "Dictamen de Becas — Secretaría General"
            : "Gestión y Auditoría de Becas — Coordinación"}
        </h1>
      </div>

      {/* BOTONERA: Oculta en móvil (`hidden md:flex`), alineada fluidamente */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5 bg-[#172e4d] p-1 rounded-lg border border-white/10">
        {tabs.map((tab) => {
          const isActive =
            esSecretariaGeneral ||
            currentStatus?.toLowerCase() === tab.value.toLowerCase() ||
            (tab.value === "Todas" && !currentStatus);
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange({ status: tab.value })}
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