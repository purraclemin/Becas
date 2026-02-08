"use client"

import Link from "next/link"
import { Home, LogOut } from "lucide-react"
import { logout } from "@/lib/ActionsAuth"

export function SocioHeader() {
  return (
    // Agregamos backdrop-blur para que se vea elegante si la tabla pasa por debajo
    <div className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-sm h-16 flex items-center px-6 md:px-8 border-b border-transparent transition-all">
      <div className="w-full bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center gap-4">
        
        {/* Título del Módulo */}
        <h1 className="text-sm md:text-lg font-black text-[#1a2744] uppercase tracking-widest truncate">
          Gestión Socioeconómica
        </h1>

        {/* Controles de Navegación */}
        <div className="flex items-center gap-3 md:gap-5 border-l border-slate-100 pl-3 md:pl-5">
          
          <Link href="/" title="Ir al Pagina de inicio">
            <div className="p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                <Home className="h-5 w-5 text-slate-400 group-hover:text-[#1a2744] transition-colors" />
            </div>
          </Link>

          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-all border border-rose-100 group active:scale-95"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Salir</span>
          </button>
        </div>
      </div>
    </div>
  )
}