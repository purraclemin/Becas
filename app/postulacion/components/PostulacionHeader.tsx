"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface PostulacionHeaderProps {
  tituloPaso?: string;
  periodoIngreso?: string;
  promedio: string;
}

export function PostulacionHeader({ 
  tituloPaso = "Postulación", 
  periodoIngreso, 
  promedio 
}: PostulacionHeaderProps) {
  
  // Lógica de estado del promedio
  const valorPromedio = parseFloat(promedio || "0");
  const esBajo = valorPromedio < 16;

  return (
    <header className="w-full bg-white/50 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between flex-shrink-0 transition-all">
      
      {/* Lado Izquierdo: Identidad del Paso */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-1 rounded-full bg-[#1e3a5f]" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4a843]">
            Proceso Actual
          </span>
          <h1 className="text-[#1e3a5f] font-black uppercase tracking-tight text-sm leading-tight mt-0.5">
            {tituloPaso}
          </h1>
        </div>
      </div>

      {/* Lado Derecho: Cápsula de Datos */}
      <div className="flex items-center gap-3">
        {/* Periodo - Estilo Cápsula */}
        <div className="hidden sm:flex items-center px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
             {periodoIngreso || 'Periodo Institucional'}
           </span>
        </div>

        {/* Promedio - Estilo Dinámico */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-1.5 rounded-full shadow-lg transition-all duration-300",
          esBajo 
            ? "bg-red-600 shadow-red-500/20" 
            : "bg-[#1e3a5f] shadow-[#1e3a5f]/20"
        )}>
          <span className={cn(
            "text-[8px] font-black uppercase tracking-widest",
            esBajo ? "text-white" : "text-[#d4a843]"
          )}>
            {esBajo ? "Promedio Bajo" : "Promedio"}
          </span>
          <span className={cn(
            "text-sm font-black leading-none",
            esBajo ? "text-white" : "text-emerald-400"
          )}>
            {promedio}
          </span>
        </div>
      </div>
      
    </header>
  )
}