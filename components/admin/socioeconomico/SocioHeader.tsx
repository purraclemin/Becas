"use client"

import Link from "next/link"
import { Home, LogOut, ListChecks, Printer, Info } from "lucide-react"
import { logout } from "@/lib/ActionsAuth"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function SocioHeader() {
  return (
    <div className="fixed top-0 left-0 md:left-48 right-0 z-50 bg-white/70 backdrop-blur-md h-20 flex items-center px-6 md:px-8 border-b border-slate-200/50 shadow-sm transition-all">
      <div className="w-full max-w-[1600px] mx-auto flex justify-between items-center gap-4">
        
        <h1 className="text-sm md:text-lg font-black text-[#1a2744] uppercase tracking-widest truncate">
          Gestión Socioeconómica
        </h1>

        <div className="flex items-center gap-2 md:gap-4 border-l border-slate-100 pl-4 md:pl-6">
          
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-amber-50/80 hover:bg-amber-100 text-amber-600 rounded-xl transition-all border border-amber-100/50 group active:scale-95 shadow-sm"
                title="Ver Desglose de Puntos"
              >
                <ListChecks className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Desglose</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-5 rounded-2xl shadow-2xl border-slate-200 mt-2 backdrop-blur-xl bg-white/95" align="end">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Info className="h-4 w-4 text-amber-500" />
                  <h4 className="font-black text-[11px] uppercase tracking-tighter text-[#1a2744]">Criterios de Baremo</h4>
                </div>
                <ul className="space-y-2 text-[10px] font-bold uppercase tracking-tight text-[#1a2744]">
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Déficit / Ingreso Bajo</span><span className="text-emerald-600">+30 a +40 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Vivienda Rural / Habitación</span><span className="text-emerald-600">+15 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Alquilada / Residencia / Cedida</span><span className="text-emerald-600">+7 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Carga (+4 hermanos)</span><span className="text-emerald-600">+10 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Aspirante Desempleado</span><span className="text-emerald-600">+10 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Condición de Salud</span><span className="text-emerald-600">+10 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Sin Conectividad Internet</span><span className="text-emerald-600">+7 pts</span></li>
                    <li className="flex justify-between border-b border-slate-50 pb-1"><span>Sin Nevera Básica</span><span className="text-emerald-600">+5 pts</span></li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>

          <Link href="/" title="Ir a Inicio">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/80 hover:bg-slate-100 text-slate-400 hover:text-[#1a2744] rounded-xl transition-all border border-slate-200/50 group shadow-sm">
                <Home className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Inicio</span>
            </div>
          </Link>

          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 px-3 py-2 bg-blue-50/80 hover:bg-blue-100 text-blue-600 rounded-xl transition-all border border-blue-100/50 group active:scale-95 shadow-sm"
            title="Imprimir baremo"
          >
            <Printer className="h-4 w-4" />
            <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Imprimir</span>
          </button>

          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 px-3 py-2 bg-rose-50/80 hover:bg-rose-100 text-rose-500 rounded-xl transition-all border border-rose-100/50 group active:scale-95 shadow-sm"
            title="Cerrar Sesión"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-[9px] font-black uppercase tracking-widest hidden lg:inline">Salir</span>
          </button>

        </div>
      </div>
    </div>
  )
}