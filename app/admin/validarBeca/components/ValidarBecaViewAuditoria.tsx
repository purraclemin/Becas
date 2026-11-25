"use client"

import React, { useState, useEffect } from "react"
import { ArrowLeft, ShieldCheck, Award } from "lucide-react"
import { ValidarBecaAuditoriaPanel, SolicitudAuditoriaPanelData } from "./ValidarBecaAuditoriaPanel"
import { getBadgeColor } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import type { ResultadoActualizacionEstatus } from "@/lib/ActionsEstatusBeca"

export interface SolicitudAuditoriaView extends SolicitudAuditoriaPanelData {
  nombre?: string | null;
  apellido?: string | null;
  cedula?: string | null;
  estatus?: string | null;
}

interface ValidarBecaViewAuditoriaProps {
  selectedSolicitud: SolicitudAuditoriaView | null;
  onStatusChange: (
    id: number,
    status: string,
    observaciones?: string,
    confirmacionEspecial?: boolean,
    departamentoAsignado?: string
  ) => Promise<ResultadoActualizacionEstatus>;
  onClose: () => void;
  periodoActualId: number | null;
  esSecretariaGeneral?: boolean;
}

export function ValidarBecaViewAuditoria({
  selectedSolicitud,
  onStatusChange,
  onClose,
  periodoActualId,
  esSecretariaGeneral = false
}: ValidarBecaViewAuditoriaProps) {
  const [estatusActual, setEstatusActual] = useState<string>(
    String(selectedSolicitud?.estatus || "Pendiente")
  );

  useEffect(() => {
    if (selectedSolicitud?.estatus) {
      setEstatusActual(String(selectedSolicitud.estatus));
    }
  }, [selectedSolicitud?.id, selectedSolicitud?.estatus]);

  const handleStatusChangeLocal = async (
    id: number,
    status: string,
    observaciones?: string,
    confirmacionEspecial?: boolean,
    departamentoAsignado?: string
  ): Promise<ResultadoActualizacionEstatus> => {
    const res = await onStatusChange(id, status, observaciones, confirmacionEspecial, departamentoAsignado);
    if (res?.success) {
      setEstatusActual(status);
    }
    return res;
  };

  const solicitudSegura: SolicitudAuditoriaPanelData = selectedSolicitud
    ? { ...selectedSolicitud, estatus: estatusActual }
    : {
        id: 0,
        cedula: "",
        periodo_id: periodoActualId,
        estatus: estatusActual,
        email_institucional: "",
        observaciones_admin: null
      };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4">
      {/* CABECERA DE AUDITORÍA / DICTAMEN */}
      <div className="bg-[#1e3a5f] rounded-2xl px-5 py-4 text-white shadow-sm border border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 bg-white/10 hover:bg-white/20 rounded-xl text-[#d4a843] flex items-center justify-center transition-all shrink-0 cursor-pointer"
            title="Volver a la lista"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <ShieldCheck className="h-4 w-4 text-[#d4a843]" />
              <h1 className="text-xs md:text-sm font-black tracking-wider uppercase text-white">
                {esSecretariaGeneral
                  ? "Dictamen de Beca — Secretaría General"
                  : "Auditoría y Gestión de Beca — Coordinación"}
              </h1>
            </div>
            <p className="text-[10px] text-slate-300 font-medium">
              {String(selectedSolicitud?.nombre || "")} {String(selectedSolicitud?.apellido || "")} V-{String(selectedSolicitud?.cedula || "")}
            </p>
          </div>
        </div>

        {/* Estatus Actual reactivo en tiempo real */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#172e4d] rounded-xl border border-white/10 shrink-0">
          <Award className="h-3.5 w-3.5 text-[#d4a843]" />
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">Estatus:</span>
          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-colors duration-300 ${getBadgeColor(estatusActual)}`}>
            {estatusActual || "S/I"}
          </span>
        </div>
      </div>

      {/* PANEL DE AUDITORÍA INTEGRADO */}
      <ValidarBecaAuditoriaPanel
        solicitud={solicitudSegura}
        onStatusChange={handleStatusChangeLocal}
        onClose={onClose}
        periodoActualId={periodoActualId}
        esSecretariaGeneral={esSecretariaGeneral}
      />
    </div>
  )
}