"use client"

import React from "react"
import { cn } from "@/lib/utils"

export interface PostulacionHeaderProps {
  tituloPaso?: string;
  periodoIngreso?: string;
  promedio: string;
  indiceGlobal?: string;
  etiquetaPromedio?: string;
  esNuevoIngreso?: boolean;
}

export function PostulacionHeader({
  tituloPaso = "Postulación",
  periodoIngreso,
  promedio,
  indiceGlobal,
  etiquetaPromedio = "Prom. Trim. Anterior",
  esNuevoIngreso = false,
}: PostulacionHeaderProps) {
  const valorPromedio = Number.parseFloat(promedio || "0");
  const promedioValido = Number.isFinite(valorPromedio) ? valorPromedio : 0;
  const esBajo = !esNuevoIngreso && promedioValido < 16;
  const promedioFormateado = promedioValido.toFixed(2);

  const valorGlobal = Number.parseFloat(indiceGlobal || "0");
  const mostrarGlobal = !esNuevoIngreso && Number.isFinite(valorGlobal) && valorGlobal > 0;

  return (
    <header className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 transition-all">
      {/* Lado Izquierdo: Identidad del Paso */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="h-9 sm:h-10 w-1 rounded-full bg-[#1e3a5f] flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4a843] truncate">
            Proceso Actual
          </span>
          <h1 className="text-[#1e3a5f] font-black uppercase tracking-tight text-xs sm:text-sm leading-tight mt-0.5 truncate">
            {tituloPaso}
          </h1>
        </div>
      </div>

      {/* Lado Derecho: Cápsulas de Datos */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Período */}
        <div className="hidden sm:flex items-center px-3.5 py-1.5 rounded-full bg-[#f8fafc] border border-slate-200">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
            {periodoIngreso || "Periodo Institucional"}
          </span>
        </div>

        {/* Referencia secundaria del Índice Global */}
        {mostrarGlobal && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
              Global
            </span>
            <span className="text-xs font-black text-[#1e3a5f] tabular-nums leading-none">
              {valorGlobal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Promedio del Trimestre Anterior (Indicador principal evaluado) */}
        <div
          className={cn(
            "flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-1.5 rounded-full shadow-md transition-all duration-300",
            esBajo
              ? "bg-red-600 shadow-red-500/20"
              : "bg-[#1e3a5f] shadow-[#1e3a5f]/20"
          )}
        >
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              esBajo ? "text-white" : "text-[#d4a843]"
            )}
          >
            {esNuevoIngreso
              ? "1° Trimestre"
              : esBajo
                ? `${etiquetaPromedio} Bajo`
                : etiquetaPromedio}
          </span>
          {!esNuevoIngreso && (
            <span
              className={cn(
                "text-xs sm:text-sm font-black leading-none tabular-nums",
                esBajo ? "text-white" : "text-emerald-400"
              )}
            >
              {promedioFormateado}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}