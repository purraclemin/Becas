"use client"
import React, { useState } from "react"
import { Eye, Check, X, Clock, Undo2, Activity, GraduationCap, History, MapPin, Hash, ClipboardList } from "lucide-react"
import { getBadgeColor, getRiskDetails, getAvgStyle } from "./SolicitudesUtils"

export function SolicitudesTableRow({ s, onView, onViewHistorial, onStatusChange, periodoActualId }: any) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const risk = getRiskDetails(s.puntaje)

  /** * 🟢 LÓGICA DE DESBLOQUEO ULTRA-ROBUSTA:
   * 1. Limpiamos y convertimos a número ambos valores.
   * 2. DESBLOQUEO POR DEFECTO: Si periodoActualId es null o 0, no bloqueamos.
   */
  const valPeriodoSolicitud = s.periodo_id ? Number(s.periodo_id) : 0;
  const valPeriodoActual = periodoActualId ? Number(periodoActualId) : 0;
  
  // Solo bloqueamos si EXISTE un periodo actual cargado y este es DIFERENTE al de la solicitud
  const esPeriodoActual = valPeriodoActual === 0 || valPeriodoSolicitud === valPeriodoActual;

  const handleActionClick = (action: string) => {
    setPendingAction(action)
    setIsConfirming(true)
  }

  const confirmAction = () => {
    if (pendingAction) {
        onStatusChange(s.id, pendingAction)
        setIsConfirming(false)
    }
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      {/* ID */}
      <td className="px-2 md:px-4 py-4 font-mono text-[10px] md:text-xs font-bold text-slate-400">
        #{s.id.toString().padStart(4, '0')}
      </td>

      {/* ESTUDIANTE */}
      <td className="px-2 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#1a2744] text-[#d4a843] flex items-center justify-center font-black text-[10px] shadow-inner uppercase shrink-0">
            {s.nombre?.[0]}{s.apellido?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1a2744] leading-tight truncate">{s.nombre} {s.apellido}</p>
            <span className="text-[9px] text-slate-500 font-mono tracking-tighter block">V-{s.cedula}</span>
          </div>
        </div>
      </td>

      {/* MUNICIPIO (PC) */}
      <td className="px-2 py-4 hidden lg:table-cell">
        <div className="flex items-start gap-1.5">
          <MapPin className="h-3 w-3 text-slate-300 mt-0.5" />
          <p className="text-[10px] font-bold text-slate-600 uppercase leading-tight line-clamp-2">
            {s.municipio_residencia || "S/I"}
          </p>
        </div>
      </td>

      {/* CARRERA / BECA (PC) */}
      <td className="px-2 py-4 hidden md:table-cell">
        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px] uppercase leading-tight">{s.carrera}</p>
        <p className="text-[8px] text-[#d4a843] font-black uppercase tracking-widest mt-0.5">{s.tipo_beca}</p>
      </td>

      {/* TRIMESTRE (PC) */}
      <td className="px-2 py-4 text-center hidden lg:table-cell">
        <span className="text-xs font-black text-[#1a2744]">
          {s.semestre || s.trimestre || "0"}
        </span>
      </td>

      {/* VULNERABILIDAD (PC) */}
      <td className="px-2 py-4 hidden lg:table-cell text-center">
        {s.puntaje != null ? (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm ${risk.style}`}>
            <Activity className="h-3 w-3" />
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] font-black uppercase tracking-tighter">{risk.label}</span>
              <span className="text-[7px] font-bold opacity-75">{s.puntaje} PTS</span>
            </div>
          </div>
        ) : <span className="text-[8px] font-bold text-slate-300 uppercase italic">Sin Estudio</span>}
      </td>

      {/* PROMEDIO / GLOBAL (PC) */}
      <td className="px-2 py-4 text-center hidden lg:table-cell">
        <div className="inline-flex flex-col items-center leading-tight">
          <span className={`text-xs font-black ${getAvgStyle(s.promedio_notas).split(' ')[1]}`}>
            {s.promedio_notas}
          </span>
          <span className="text-[8px] font-black text-[#d4a843] uppercase tracking-tighter mt-0.5">
            G: {s.promedio_historico || s.indice_global || "0.00"}
          </span>
        </div>
      </td>

      {/* ESTATUS (PC) */}
      <td className="px-2 py-4 hidden sm:table-cell text-center">
        <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getBadgeColor(s.estatus)}`}>
          {s.estatus}
        </span>
      </td>

      {/* ACCIONES DINÁMICAS */}
      <td className="px-2 py-4 text-right">
        {isConfirming ? (
          <div className="flex items-center justify-end gap-1">
            <button onClick={confirmAction} className="h-7 w-7 rounded-full bg-[#1a2744] text-[#d4a843] flex items-center justify-center shadow-md">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={() => setIsConfirming(false)} className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
              <Undo2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-0.5">
            <button 
              onClick={() => onViewHistorial(s)} 
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
              title="Historial de Materias"
            >
              <ClipboardList className="h-3.5 w-3.5" />
            </button>

            <button onClick={() => onView(s)} className="p-1.5 text-slate-400 hover:text-[#1a2744] hover:bg-slate-100 rounded-lg" title="Detalles">
              <Eye className="h-3.5 w-3.5" />
            </button>

            {esPeriodoActual ? (
              <div className="flex items-center gap-0.5">
                {s.estatus !== 'En Revisión' && (
                  <button onClick={() => handleActionClick('En Revisión')} className="p-1.5 text-blue-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Clock className="h-3.5 w-3.5" />
                  </button>
                )}
                {s.estatus !== 'Rechazada' && (
                  <button onClick={() => handleActionClick('Rechazada')} className="p-1.5 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {s.estatus !== 'Aprobada' && (
                  <button onClick={() => handleActionClick('Aprobada')} className="p-1.5 text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[8px] font-black text-slate-300 uppercase italic px-1">
                Histórico
              </span>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}