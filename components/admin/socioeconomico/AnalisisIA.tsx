"use client"

import React from "react"
import { Sparkles, FileText, ShieldCheck } from "lucide-react"

interface AnalisisIAProps {
  onGenerarAnalisisIA?: () => void
  cargandoIA?: boolean
  resumenIA?: string
}

export function AnalisisIA({ 
  onGenerarAnalisisIA, 
  cargandoIA = false, 
  resumenIA 
}: AnalisisIAProps) {
  return (
    <div className="w-full max-w-none bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-sm mb-4 overflow-hidden">
      <div className="flex flex-row items-center justify-between gap-4 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-[#1e3a5f] text-white rounded-xl flex items-center justify-center shadow-xs shrink-0 border border-white/10">
            <FileText className="h-4 w-4 text-[#d4a843]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-[#1e3a5f] text-xs uppercase tracking-wider truncate">
              Diagnóstico Socioeconómico y Asistente IA
            </h3>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5 truncate">
              Resumen ejecutivo e interpretación del baremo institucional
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onGenerarAnalisisIA) onGenerarAnalisisIA()
          }}
          disabled={cargandoIA}
          className="bg-[#1e3a5f] hover:bg-[#1a2744] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-white/10 shrink-0"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#d4a843]" />
          <span>{cargandoIA ? "Generando..." : "Generar Diagnóstico"}</span>
        </button>
      </div>

      <div className="mt-2.5">
        {resumenIA ? (
          <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/60 shadow-2xs">
            <div className="flex items-center gap-1.5 mb-2 text-[#1e3a5f] text-[9px] font-black uppercase tracking-widest bg-white w-fit px-2.5 py-1 rounded-lg border border-slate-200/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Informe de Evaluación Generado por IA:</span>
            </div>
            <div className="text-slate-700 text-xs leading-relaxed font-medium space-y-2 whitespace-pre-line pl-0.5">
              {resumenIA}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-xl py-2.5 px-4 text-center w-full">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              Haz clic en el botón superior para procesar el análisis e interpretación del baremo actual mediante inteligencia artificial.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}