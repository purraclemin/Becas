"use client"

import React from "react"
import { FileDown } from "lucide-react"

interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  mostrarExportar?: boolean
  onExport?: () => void
}

export const PageHeader = ({ titulo, subtitulo, mostrarExportar = true, onExport }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center gap-4 px-2 py-2 backdrop-blur-md bg-white/70 border-b border-slate-200/50 transition-all w-full">
      <div className="flex flex-col justify-center">
        <h1 className="text-xs md:text-sm font-black text-[#1a2744] uppercase tracking-widest leading-none flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#d4a843] rounded-full inline-block shadow-sm"></span>
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5">
            {subtitulo}
          </p>
        )}
      </div>

      {mostrarExportar && (
        <div className="flex items-center gap-3">
          <button 
            onClick={onExport ? onExport : () => window.print()} 
            className="flex items-center gap-1.5 bg-gradient-to-r from-[#d4a843] to-[#c29636] hover:from-[#c29636] hover:to-[#b0832a] text-[#1a2744] px-3.5 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 group border border-[#d4a843]/30"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Exportar</span>
          </button>
        </div>
      )}
    </div>
  )
}