"use client"
import React, { useState } from "react"
import { Eye, Check, X, Clock, Undo2, Activity, GraduationCap } from "lucide-react"
import { getBadgeColor, getRiskDetails, getAvgStyle } from "./SolicitudesUtils"

export function SolicitudesTableRow({ s, onView, onStatusChange }: any) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const risk = getRiskDetails(s.puntaje)

  const handleActionClick = (action: string) => {
    setPendingAction(action)
    setIsConfirming(true)
  }

  // Confirmación final antes de enviar a DB
  const confirmAction = () => {
    if (pendingAction) {
        onStatusChange(s.id, pendingAction)
        setIsConfirming(false)
    }
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      {/* ID */}
      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">
        #{s.id.toString().padStart(4, '0')}
      </td>

      {/* ESTUDIANTE */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#1a2744] text-[#d4a843] flex items-center justify-center font-black text-xs shadow-inner uppercase">
            {s.nombre?.[0]}{s.apellido?.[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-[#1a2744] leading-tight">{s.nombre} {s.apellido}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-tighter">V-{s.cedula}</p>
          </div>
        </div>
      </td>

      {/* CARRERA / BECA */}
      <td className="px-6 py-4 hidden md:table-cell">
        <p className="text-xs font-bold text-slate-700 truncate max-w-[140px] uppercase">{s.carrera}</p>
        <p className="text-[9px] text-[#d4a843] font-black uppercase tracking-widest">{s.tipo_beca}</p>
      </td>

      {/* VULNERABILIDAD */}
      <td className="px-6 py-4 hidden lg:table-cell text-center">
        {s.puntaje != null ? (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-transform group-hover:scale-105 ${risk.style}`}>
            <Activity className="h-3 w-3" />
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[9px] font-black uppercase tracking-tighter">{risk.label}</span>
              <span className="text-[8px] font-bold opacity-75">{s.puntaje} PTS</span>
            </div>
          </div>
        ) : <span className="text-[9px] font-bold text-slate-300 uppercase italic">Sin Estudio</span>}
      </td>

      {/* PROMEDIO */}
      <td className="px-6 py-4 text-center hidden lg:table-cell">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm transition-transform group-hover:scale-105 ${getAvgStyle(s.promedio_notas)}`}>
          <GraduationCap className="h-3.5 w-3.5" />
          <span className="font-black text-xs">{s.promedio_notas}</span>
        </div>
      </td>

      {/* ESTATUS (CENTRADO) */}
      <td className="px-6 py-4 hidden sm:table-cell text-center">
        <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getBadgeColor(s.estatus)}`}>
          {s.estatus}
        </span>
      </td>

      {/* ACCIONES DINÁMICAS */}
      <td className="px-6 py-4 text-right">
        {isConfirming ? (
          <div className="flex items-center justify-end gap-2 animate-in slide-in-from-right-2 fade-in duration-200">
            <div className={`text-[8px] font-black px-2 py-1.5 rounded border uppercase tracking-widest ${
                pendingAction === 'En Revisión' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                pendingAction === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              ¿{pendingAction === 'En Revisión' ? 'Revisar' : pendingAction}?
            </div>
            
            <button onClick={confirmAction} className="h-8 w-8 rounded-full bg-[#1a2744] text-[#d4a843] flex items-center justify-center hover:scale-110 shadow-md transition-transform">
              <Check className="h-4 w-4" />
            </button>
            
            <button onClick={() => setIsConfirming(false)} className="h-8 w-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors">
              <Undo2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1">
            {/* 1. Ver Detalle */}
            <button onClick={() => onView(s)} className="p-2 text-slate-400 hover:text-[#1a2744] hover:bg-slate-100 rounded-lg transition-all" title="Ver Detalle">
                <Eye className="h-4 w-4" />
            </button>

            {/* 2. Botón CORRECCIÓN: Enviar a Revisión (Visible si NO está en revisión) */}
            {s.estatus !== 'En Revisión' && (
                <button onClick={() => handleActionClick('En Revisión')} className="p-2 text-blue-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Regresar a Revisión">
                    <Clock className="h-4 w-4" />
                </button>
            )}

            {/* 3. Rechazar (Visible si NO está rechazada) */}
            {s.estatus !== 'Rechazada' && (
                <button onClick={() => handleActionClick('Rechazada')} className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Rechazar">
                    <X className="h-4 w-4" />
                </button>
            )}

            {/* 4. Aprobar (Visible si NO está aprobada) */}
            {s.estatus !== 'Aprobada' && (
                <button onClick={() => handleActionClick('Aprobada')} className="p-2 text-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Aprobar">
                    <Check className="h-4 w-4" />
                </button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}