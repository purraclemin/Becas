"use client"

import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ControlesPaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  setPaginaActual: (page: number | ((prev: number) => number)) => void;
  registrosPorPagina: number;
  setRegistrosPorPagina?: (limit: number) => void;
  alturaCalculada: number;
  loading: boolean;
  hasData: boolean;
}

export function ControlesPaginacion({
  paginaActual,
  totalPaginas,
  setPaginaActual,
  registrosPorPagina,
  setRegistrosPorPagina,
  alturaCalculada,
  loading,
  hasData,
}: ControlesPaginacionProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between md:justify-end">
      {/* Selector de filas por página */}
      <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-2 h-9">
        <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Filas:</span>
        <select 
          value={registrosPorPagina} 
          onChange={(e) => { 
            if (setRegistrosPorPagina) setRegistrosPorPagina(Number(e.target.value)); 
            setPaginaActual(1); 
          }}
          className="bg-transparent py-1.5 text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
        >
          <option value={alturaCalculada}>Auto</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Controles de avance y retroceso de páginas */}
      {!loading && hasData && (
        <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-0.5 h-9">
          <button 
            onClick={() => setPaginaActual((prev: number) => Math.max(1, prev - 1))} 
            disabled={paginaActual === 1} 
            className="p-1.5 rounded-lg hover:bg-white text-slate-500 disabled:opacity-30 cursor-pointer transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <span className="px-3 text-[10px] font-black text-[#1e3a5f] min-w-[50px] text-center">
            {paginaActual} / {totalPaginas}
          </span>
          
          <button 
            onClick={() => setPaginaActual((prev: number) => Math.min(totalPaginas, prev + 1))} 
            disabled={paginaActual === totalPaginas} 
            className="p-1.5 rounded-lg hover:bg-white text-slate-500 disabled:opacity-30 cursor-pointer transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}