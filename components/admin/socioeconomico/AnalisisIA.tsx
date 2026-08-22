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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xl mb-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1e3a5f] text-white rounded-xl flex items-center justify-center shadow-md shrink-0 border border-white/10">
            <FileText className="h-5 w-5 text-[#d4a843]" />
          </div>
          <div>
            <h3 className="font-black text-[#1e3a5f] text-sm sm:text-base uppercase tracking-wider">
              Diagnóstico Socioeconómico y Asistente IA
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
              Resumen ejecutivo e interpretación del baremo institucional
            </p>
          </div>
        </div>

        <button
          onClick={onGenerarAnalisisIA}
          disabled={cargandoIA}
          className="bg-[#1e3a5f] hover:bg-[#1a2744] text-white text-[10px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-white/10"
        >
          <Sparkles className="h-4 w-4 text-[#d4a843]" />
          {cargandoIA ? "Generando Análisis..." : "Generar Diagnóstico Ejecutivo"}
        </button>
      </div>

      <div className="mt-4">
        {resumenIA ? (
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/60 shadow-xs animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-3 text-[#1e3a5f] text-[10px] font-black uppercase tracking-widest bg-white w-fit px-3 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Informe de Evaluación Generado por IA:</span>
            </div>
            <div className="text-slate-700 text-xs sm:text-sm leading-relaxed font-medium space-y-4 whitespace-pre-line pl-1">
              {resumenIA}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Haz clic en el botón superior para procesar el análisis e interpretación del baremo actual mediante inteligencia artificial.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}