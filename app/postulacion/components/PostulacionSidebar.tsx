"use client"

import React from "react"
import { 
  ClipboardList, 
  BookOpen, 
  Upload, 
  CheckCircle2, 
  GraduationCap,
  LayoutDashboard,
  Eye
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export const PASOS = [
  { id: 1, titulo: "Carga Académica", icon: BookOpen },
  { id: 2, titulo: "Detalles Beca", icon: LayoutDashboard },
  { id: 3, titulo: "Estudio Social", icon: ClipboardList },
  { id: 4, titulo: "Documentación", icon: Upload },
  { id: 5, titulo: "Resumen y Envío", icon: Eye },
]

export function PostulacionSidebar({ pasoActual, progreso }: { pasoActual: number; progreso: number }) {
  return (
    <aside className="w-full lg:w-[200px] bg-[#1a2f4a] flex flex-col flex-shrink-0 transition-all z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.3)]">
      
      {/* VISTA MÓVIL (Compacta) */}
      <div className="lg:hidden flex items-center justify-between p-3 bg-[#1e3a5f] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-[#d4a843] p-1.5 rounded-lg"><GraduationCap className="h-3 w-3 text-[#1e3a5f]" /></div>
          <span className="text-white font-black text-[10px] uppercase tracking-widest">Unimar Becas</span>
        </div>
        <div className="text-[9px] font-black text-[#d4a843] bg-white/5 px-2 py-1 rounded-md">
          Paso 0{pasoActual} / 0{PASOS.length}
        </div>
      </div>

      {/* VISTA DESKTOP (Elegante y delgada) */}
      <div className="hidden lg:flex p-6 items-center gap-3 border-b border-white/5">
        <div className="bg-[#d4a843] p-2 rounded-xl shadow-lg shadow-[#d4a843]/20">
          <GraduationCap className="h-4 w-4 text-[#1e3a5f]" />
        </div>
        <div>
          <h2 className="text-white font-black text-[11px] uppercase tracking-tighter leading-none">Unimar</h2>
          <p className="text-[#d4a843] text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Becas 2026</p>
        </div>
      </div>

      <nav className="hidden lg:flex flex-col px-4 py-8 gap-6 flex-1">
        {PASOS.map((paso) => {
          const Icono = paso.icon;
          const activo = pasoActual === paso.id;
          const completado = pasoActual > paso.id;

          return (
            <div key={paso.id} className={cn("group flex items-center gap-4 transition-all duration-500", activo ? "opacity-100" : "opacity-40 hover:opacity-70")}>
              <div className={cn(
                "relative h-8 w-8 rounded-xl flex items-center justify-center border transition-all duration-500", 
                activo ? "bg-[#d4a843] border-[#d4a843] shadow-lg shadow-[#d4a843]/20" : 
                completado ? "bg-emerald-500/20 border-emerald-500/50" : "border-white/10 bg-white/5"
              )}>
                {completado ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Icono className={cn("h-4 w-4", activo ? "text-[#1e3a5f]" : "text-white/70")} />}
              </div>
              <div className="flex flex-col">
                <span className={cn("text-[7px] font-black uppercase tracking-[0.2em]", activo ? "text-[#d4a843]" : "text-white/40")}>Paso 0{paso.id}</span>
                <span className="text-white font-bold text-[10px] uppercase tracking-tight mt-0.5">{paso.titulo}</span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* FOOTER DE PROGRESO "TECH" */}
      <div className="hidden lg:block p-4 bg-[#16273e]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[8px] font-black uppercase text-white/40 tracking-[0.2em]">Progreso</span>
          <span className="text-[#d4a843] font-black text-[10px]">{Math.round(progreso)}%</span>
        </div>
        <Progress value={progreso} className="h-1 bg-white/5 [&>div]:bg-[#d4a843] [&>div]:shadow-[0_0_8px_rgba(212,168,67,0.5)]" />
      </div>

    </aside>
  )
}