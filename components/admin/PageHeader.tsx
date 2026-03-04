"use client"

import React from "react"
import Link from "next/link"
import { FileDown, Home, LogOut } from "lucide-react"
import { logout } from "@/lib/ActionsAuth"

interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  mostrarExportar?: boolean
}

export const PageHeader = ({ titulo, subtitulo, mostrarExportar = true }: PageHeaderProps) => {
  return (
    <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center gap-4 mb-4">
      <div className="flex flex-col justify-center">
        <h1 className="text-sm font-black text-[#1a2744] uppercase tracking-widest leading-none">
          {titulo}
        </h1>
        {subtitulo && (
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            {subtitulo}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 border-l border-slate-100 pl-3">
        {mostrarExportar && (
          <button 
            onClick={() => window.print()} 
            className="hidden sm:flex items-center gap-1.5 bg-[#d4a843] hover:bg-[#b88f32] text-[#1a2744] px-3 py-1 rounded-lg transition-all shadow-sm active:scale-95 group"
          >
            <FileDown className="h-3.5 w-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Exportar</span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        <Link href="/" title="Ir al Inicio">
          <Home className="h-4 w-4 text-slate-400 hover:text-[#1a2744] transition-colors cursor-pointer" />
        </Link>

        <button 
          onClick={() => logout()} 
          className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-all border border-rose-100 group"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest hidden md:inline">Salir</span>
        </button>
      </div>
    </div>
  )
}