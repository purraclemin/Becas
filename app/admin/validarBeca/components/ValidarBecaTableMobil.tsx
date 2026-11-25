"use client"

import React, { useState } from "react"
import { Check, Undo2, MapPin, Calendar } from "lucide-react"
import { getBadgeColor, getRiskDetails, getAvgStyle } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import { SolicitudItem, formatearFechaEnvio } from "@/app/admin/validarBeca/lib/ProcesadorDatosValidarBeca"
import type { ResultadoActualizacionEstatus } from "@/lib/ActionsEstatusBeca"

interface ValidarBecaCardItemProps {
  s: SolicitudItem;
  onView: (solicitud: SolicitudItem) => void;
  onViewHistorial: (solicitud: SolicitudItem) => void;
  onStatusChange: (
    id: number,
    status: string,
    observaciones?: string,
    confirmacionEspecial?: boolean
  ) => Promise<ResultadoActualizacionEstatus | void> | void;
  periodoActualId: number | null;
  esSecretariaGeneral?: boolean;
}

export function ValidarBecaCardItem({
  s,
  onView,
  onViewHistorial,
  onStatusChange,
  periodoActualId,
  esSecretariaGeneral = false
}: ValidarBecaCardItemProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const risk = getRiskDetails(s.puntaje ?? 0)

  const valPeriodoSolicitud = s.periodo_id ? Number(s.periodo_id) : 0;
  const valPeriodoActual = periodoActualId ? Number(periodoActualId) : 0;
  const esPeriodoActual = valPeriodoActual === 0 || valPeriodoSolicitud === valPeriodoActual;

  const fechaEnvio = formatearFechaEnvio(s);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) return
    if (value === "ver_detalles") {
      onView(s)
    } else if (value === "ver_historial") {
      onViewHistorial(s)
    } else {
      setPendingAction(value)
      setIsConfirming(true)
    }
    e.target.value = ""
  }

  const confirmAction = async () => {
    if (pendingAction) {
      const res = await onStatusChange(Number(s.id), pendingAction);
      setIsConfirming(false);
      setPendingAction(null);
      if (res && typeof res === 'object' && res.error === 'REGLAMENTO_INCUMPLIDO') {
        onView(s);
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
      {/* Cabecera de tarjeta móvil con ergonomía táctil */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center font-black text-xs shadow-inner uppercase shrink-0">
            {s.nombre?.[0] || 'U'}{s.apellido?.[0] || 'S'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold text-slate-400">#{s.id?.toString().padStart(4, '0') || '0000'}</span>
              <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5 text-slate-300" /> {fechaEnvio}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getBadgeColor(s.estatus || '')}`}>
                {s.estatus || "S/I"}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1e3a5f] truncate mt-0.5">{s.nombre || ''} {s.apellido || ''}</h4>
            <span className="text-[10px] text-slate-500 font-mono">V-{s.cedula || ''}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo de tarjeta móvil: Grilla compacta interactiva */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Carrera / Beca</span>
          <p className="font-bold text-slate-700 truncate uppercase mt-0.5">{s.carrera || "S/I"}</p>
          <p className="text-[9px] text-[#d4a843] font-black uppercase tracking-widest mt-0.5">{s.tipo_beca || "S/I"}</p>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Ubicación & Trim.</span>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-600 truncate uppercase">{s.municipio_residencia || "S/I"}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] font-black text-[#1e3a5f]">
            <span>Trimestre: {s.semestre || s.trimestre || "0"}°</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Promedio</span>
            <span className={`text-sm font-black ${getAvgStyle(String(s.promedio_notas || "0")).split(' ')[1]}`}>
              {s.promedio_notas || "0.00"}
            </span>
            <span className="text-[8px] font-black text-[#d4a843] block uppercase">G: {s.promedio_historico || s.indice_global || "0.00"}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Vulnerabilidad</span>
            {s.puntaje != null ? (
              <span className={`inline-block px-1.5 py-0.5 rounded-lg text-[9px] font-bold mt-0.5 ${risk.style}`}>
                {risk.label} ({s.puntaje} pts)
              </span>
            ) : <span className="text-[9px] italic text-slate-400">Sin estudio</span>}
          </div>
        </div>
      </div>

      {/* Pie de tarjeta móvil: Acciones táctiles (h-12) */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          {esSecretariaGeneral ? "Dictamen" : "Gestión"}
        </span>
        {isConfirming ? (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={confirmAction} className="h-12 px-4 rounded-xl bg-[#1e3a5f] text-[#d4a843] font-black text-xs flex items-center gap-1 shadow-md">
              <Check className="h-3.5 w-3.5" /> Confirmar
            </button>
            <button type="button" onClick={() => { setIsConfirming(false); setPendingAction(null); }} className="h-12 px-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <select
            defaultValue=""
            onChange={handleSelectChange}
            className="h-12 bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl px-3 outline-none focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <option value="" disabled>{esSecretariaGeneral ? "Dictaminar..." : "Gestionar..."}</option>
            <option value="ver_detalles">👁️ Ver Expediente</option>
            <option value="ver_historial">📋 Historial Académico</option>
            {esPeriodoActual ? (
              esSecretariaGeneral ? (
                s.estatus === 'En Revisión' && (
                  <>
                    <option value="Aprobada">✅ Aprobar</option>
                    <option value="Rechazada">❌ Rechazar</option>
                  </>
                )
              ) : (
                s.estatus !== 'En Revisión' &&
                s.estatus !== 'Aprobada' &&
                s.estatus !== 'Rechazada' && (
                  <option value="En Revisión">⏳ Enviar a Revisión</option>
                )
              )
            ) : (
              <option value="" disabled>🔒 Registro Histórico</option>
            )}
          </select>
        )}
      </div>
    </div>
  )
}