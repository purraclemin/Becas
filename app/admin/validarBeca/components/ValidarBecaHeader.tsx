"use client"

import React from "react"
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Award,
  UserPlus,
  Archive,
  LucideIcon
} from "lucide-react"

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
  onOpenExcelencia?: () => void;
  onOpenConcursoSocial?: () => void;
}

export function ValidarBecaHeader({
  currentStatus,
  onStatusChange,
  esSecretariaGeneral = false,
  onOpenExcelencia,
  onOpenConcursoSocial,
}: ValidarBecaHeaderProps) {
  const tabsCoordinacion: TabItem[] = [
    { label: "Todas", value: "Todas", icon: ShieldCheck },
    { label: "Pendiente", value: "Pendiente", icon: Clock },
    { label: "Convocado", value: "Convocado a Entrevista", icon: Clock },
    { label: "En Revisión", value: "En Revisión", icon: AlertCircle },
    { label: "Aprobada", value: "Aprobada", icon: CheckCircle },
    { label: "Rechazada", value: "Rechazada", icon: XCircle },
    { label: "Finalizada", value: "Finalizada", icon: Archive },
  ];

  const tabsSecretaria: TabItem[] = [
    { label: "En Revisión (Pendientes de Dictamen)", value: "En Revisión", icon: AlertCircle }
  ];

  const tabs = esSecretariaGeneral ? tabsSecretaria : tabsCoordinacion;

  return (
    <div className="bg-[#1e3a5f] rounded-xl py-3 px-4 md:px-6 text-white shadow-md border border-[#1e3a5f]/20 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        {/* TÍTULO INSTITUCIONAL */}
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#d4a843] shrink-0" />
          <h1 className="text-xs md:text-sm font-black tracking-wider uppercase">
            {esSecretariaGeneral
              ? "Dictamen de Becas — Secretaría General"
              : "Gestión y Auditoría de Becas — Coordinación"}
          </h1>
        </div>

        {/* BOTONES DE GESTIÓN INSTITUCIONAL ESPECIAL (Solo Coordinación) */}
        {!esSecretariaGeneral && (onOpenExcelencia || onOpenConcursoSocial) && (
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {onOpenExcelencia && (
              <button
                type="button"
                onClick={onOpenExcelencia}
                className="flex-1 sm:flex-none h-11 md:h-8 px-3 rounded-lg bg-[#d4a843] hover:bg-[#c2973b] text-[#1e3a5f] text-xs md:text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Award className="h-3.5 w-3.5 shrink-0" />
                <span>Nómina Excelencia</span>
              </button>
            )}
            {onOpenConcursoSocial && (
              <button
                type="button"
                onClick={onOpenConcursoSocial}
                className="flex-1 sm:flex-none h-11 md:h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-[#d4a843]/50 text-xs md:text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                <span>Concurso Social</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* BOTONERA DE ESTATUS: Oculta en móvil, alineada fluidamente en PC */}
      <div className="hidden md:flex flex-wrap items-center gap-1.5 bg-[#172e4d] p-1 rounded-lg border border-white/10 w-fit">
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
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
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