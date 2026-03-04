"use client"

import React from "react"
import { CheckCircle2, BookOpen, ClipboardList, Upload, Layers } from "lucide-react"

interface StepTrackerProps {
  pasoActual: number
}

/**
 * 🟢 COMPONENTE: RASTREADOR DE PASOS (Optimizado para Sidebar)
 * Ajustado para integrarse en el flujo inmersivo sin desbordar el viewport.
 */
export function StepTracker({ pasoActual }: StepTrackerProps) {
  const pasos = [
    { n: 1, label: "Academia", sub: "Historial de notas", icon: BookOpen },
    { n: 2, label: "Modalidad", sub: "Tipo de beneficio", icon: Layers },
    { n: 3, label: "Encuesta", sub: "Socioeconómico", icon: ClipboardList },
    { n: 4, label: "Documentos", sub: "Carga de recaudos", icon: Upload },
  ]

  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
      {pasos.map((paso, index) => {
        const isActivo = pasoActual === paso.n
        const isCompletado = pasoActual > paso.n
        const Icono = paso.icon

        return (
          <div key={paso.n} className="relative flex items-center gap-4 group">
            
            {/* Línea conectora dinámica */}
            {index !== pasos.length - 1 && (
              <div 
                className={`absolute left-[17px] top-9 w-[1.5px] h-8 transition-all duration-700 ease-in-out ${
                  isCompletado ? "bg-emerald-500" : "bg-white/10"
                }`}
              />
            )}

            {/* Círculo Indicador */}
            <div 
              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-500 ${
                isCompletado 
                  ? "bg-emerald-500 border-emerald-500 shadow-[0_5px_15px_rgba(16,185,129,0.3)]" 
                  : isActivo 
                    ? "bg-[#d4a843] border-[#d4a843] shadow-[0_8px_20px_rgba(212,168,67,0.3)] scale-105" 
                    : "bg-[#1e3a5f]/40 border-white/10"
              }`}
            >
              {isCompletado ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : (
                <Icono className={`h-4 w-4 ${isActivo ? "text-[#1e3a5f]" : "text-white/30"}`} />
              )}
            </div>

            {/* Textos Informativos */}
            <div className="flex flex-col min-w-0">
              <span 
                className={`text-[10px] font-black uppercase tracking-[0.15em] truncate transition-all duration-300 ${
                  isActivo ? "text-[#d4a843]" : isCompletado ? "text-emerald-400" : "text-white/30"
                }`}
              >
                {paso.label}
              </span>
              <span className={`text-[9px] font-bold truncate transition-all duration-300 ${
                isActivo ? "text-white/90" : "text-white/20"
              }`}>
                {paso.sub}
              </span>
            </div>

            {/* Acento visual para el paso activo */}
            {isActivo && (
              <div className="absolute -left-2 w-1 h-6 bg-[#d4a843] rounded-full blur-[2px] opacity-50" />
            )}
          </div>
        )
      })}
    </div>
  )
}