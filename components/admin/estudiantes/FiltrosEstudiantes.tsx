"use client"

import React from "react"
import { 
  Search, BadgeCheck, Loader2, ChevronLeft, ChevronRight 
} from "lucide-react"

interface FiltrosProps {
  busqueda: string
  setBusqueda: (val: string) => void
  loading: boolean
  totalRegistros: number
  page: number
  totalPaginas: number
  setPage: (update: (prev: number) => number) => void
}

export const FiltrosEstudiantes = ({
  busqueda,
  setBusqueda,
  loading,
  totalRegistros,
  page,
  totalPaginas,
  setPage
}: FiltrosProps) => {
  return (
    <div className="bg-white p-3 md:p-3.5 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-3 items-center justify-between">
      
      {/* BUSCADOR COMPACTO */}
      <div className="relative w-full lg:max-w-xs group">
        {loading ? (
          <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#d4a843] animate-spin" />
        ) : (
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-[#d4a843] transition-colors" />
        )}
        <input 
          type="text" 
          placeholder="Buscar..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 py-2 pl-9 pr-3 rounded-lg text-xs text-[#1e3a5f] outline-none focus:border-[#d4a843] focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
        />
      </div>
      
      {/* INFO Y CONTROLES DE PAGINACIÓN REDUCIDOS */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        
        {/* TOTAL RESULTADOS */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 rounded-lg border border-blue-100/50">
          <BadgeCheck className="h-4 w-4 text-[#1e3a5f]" />
          <span className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-wider">
            {totalRegistros} Resultados
          </span>
        </div>

        {/* SELECTOR DE PÁGINA COMPACTO */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-1.5 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Anterior"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-slate-600" />
          </button>
          
          <div className="px-1.5 min-w-[2.8rem] flex flex-col items-center justify-center border-x border-slate-200/50">
            <span className="text-[10px] font-black text-slate-600 leading-none">
              {page} / {totalPaginas}
            </span>
          </div>

          <button 
            onClick={() => setPage(p => Math.min(totalPaginas, p + 1))}
            disabled={page === totalPaginas || loading}
            className="p-1.5 hover:bg-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            title="Siguiente"
          >
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  )
}