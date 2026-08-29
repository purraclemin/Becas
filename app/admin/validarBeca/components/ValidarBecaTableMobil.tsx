"use client"

import React, { useState } from "react"
import { Check, Undo2, Activity, MapPin, Calendar } from "lucide-react"
import { getBadgeColor, getRiskDetails, getAvgStyle } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import { SolicitudItem, formatearFechaEnvio } from "@/app/admin/validarBeca/lib/ProcesadorDatosValidarBeca"

interface ValidarBecaCardItemProps {
  s: SolicitudItem;
  onView: (solicitud: SolicitudItem) => void;
  onViewHistorial: (solicitud: SolicitudItem) => void;
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean) => void;
  periodoActualId: number | null;
}

export function ValidarBecaCardItem({ s, onView, onViewHistorial, onStatusChange, periodoActualId }: ValidarBecaCardItemProps) {
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

  const confirmAction = () => {
    if (pendingAction) {
        onStatusChange(Number(s.id), pendingAction)
        setIsConfirming(false)
        setPendingAction(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex flex-col gap-3">
      {/* Cabecera de tarjeta móvil con ergonomía táctil y adaptación fluida */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center font-black text-xs shadow-inner uppercase shrink-0">
            {s.nombre?.[0] || 'U'}{s.apellido?.[0] || 'S'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-slate-400">#{s.id?.toString().padStart(4, '0') || '0000'}</span>
              <span className="text-[9px] text-slate-400 font-medium flex items-center gap-0.5">
                <Calendar className="h-2.5 w-2.5 text-slate-300" /> {fechaEnvio}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getBadgeColor(s.estatus || '')}`}>
                {s.estatus || "S/I"}
              </span>
            </div>
            <h4 className="text-xs font-bold text-[#1e3a5f] truncate mt-0.5">{s.nombre || ''} {s.apellido || ''}</h4>
            <span className="text-[9px] text-slate-500 font-mono">V-{s.cedula || ''}</span>
          </div>
        </div>
      </div>

      {/* Cuerpo de tarjeta móvil: Grilla compacta interactiva */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Carrera / Beca</span>
          <p className="font-bold text-slate-700 truncate uppercase mt-0.5">{s.carrera || "S/I"}</p>
          <p className="text-[8px] text-[#d4a843] font-black uppercase tracking-widest mt-0.5">{s.tipo_beca || "S/I"}</p>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Ubicación & Trim.</span>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-600 truncate uppercase">{s.municipio_residencia || "S/I"}</span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-[9px] font-black text-[#1e3a5f]">
            <span>Trimestre: {s.semestre || s.trimestre || "0"}°</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Promedio</span>
            <span className={`text-xs font-black ${getAvgStyle(String(s.promedio_notas || "0")).split(' ')[1]}`}>
              {s.promedio_notas || "0.00"}
            </span>
            <span className="text-[7px] font-black text-[#d4a843] block uppercase">G: {s.promedio_historico || s.indice_global || "0.00"}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider block">Vulnerabilidad</span>
            {s.puntaje != null ? (
              <span className={`inline-block px-1.5 py-0.5 rounded-lg text-[8px] font-bold mt-0.5 ${risk.style}`}>
                {risk.label} ({s.puntaje} pts)
              </span>
            ) : <span className="text-[8px] italic text-slate-400">Sin estudio</span>}
          </div>
        </div>
      </div>

      {/* Pie de tarjeta móvil: Acciones táctiles */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-400 uppercase">Gestión de Expediente</span>
        {isConfirming ? (
          <div className="flex items-center gap-1.5">
            <button onClick={confirmAction} className="px-3 py-1.5 rounded-xl bg-[#1e3a5f] text-[#d4a843] font-black text-[10px] flex items-center gap-1 shadow-md">
              <Check className="h-3 w-3" /> Confirmar
            </button>
            <button onClick={() => { setIsConfirming(false); setPendingAction(null); }} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-[10px]">
              <Undo2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <select
            defaultValue=""
            onChange={handleSelectChange}
            className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-xl px-3 py-1.5 outline-none focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <option value="" disabled>Validar...</option>
            <option value="ver_detalles">👁️ Ver Expediente</option>
            <option value="ver_historial">📋 Kardex Académico</option>
            {esPeriodoActual ? (
              <>
                {s.estatus !== 'En Revisión' && <option value="En Revisión">⏳ En Revisión</option>}
                {s.estatus !== 'Rechazada' && <option value="Rechazada">❌ Rechazar</option>}
                {s.estatus !== 'Aprobada' && <option value="Aprobada">✅ Aprobar</option>}
              </>
            ) : (
              <option value="" disabled>🔒 Registro Histórico</option>
            )}
          </select>
        )}
      </div>
    </div>
  )
}