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

// Exportamos PASOS por si el Header o Container necesitan leer los títulos
export const PASOS = [
  { id: 1, titulo: "Carga Académica", icon: BookOpen },
  { id: 2, titulo: "Detalles Beca", icon: LayoutDashboard },
  { id: 3, titulo: "Estudio Social", icon: ClipboardList },
  { id: 4, titulo: "Documentación", icon: Upload },
  { id: 5, titulo: "Resumen y Envío", icon: Eye },
]

interface PostulacionSidebarProps {
  pasoActual: number;
  progreso: number;
}

export function PostulacionSidebar({ pasoActual, progreso }: PostulacionSidebarProps) {
  // Buscamos la información del paso activo actual para mostrarla de forma limpia en móvil
  const pasoActivoData = PASOS.find(p => p.id === pasoActual) || PASOS[0];
  const IconoActivo = pasoActivoData.icon;

  return (
    <aside className="w-full lg:w-[260px] bg-[#1e3a5f] flex flex-col flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#e2e8f0]/10 transition-all shadow-sm z-20">
      
      {/* =========================================================
          VISTA MÓVIL / TABLET (< 1024px): Header Compacto sin Scroll 
          ========================================================= */}
      <div className="lg:hidden flex flex-col w-full bg-[#1e3a5f] p-3 sm:p-4 gap-3">
        <div className="flex items-center justify-between">
          
          {/* Logo Institucional */}
          <div className="flex items-center gap-2">
            <div className="bg-[#d4a843] p-1.5 rounded-lg shadow-sm">
              <GraduationCap className="h-4 w-4 text-[#1e3a5f]" />
            </div>
            <div>
              <h2 className="text-white font-black text-xs uppercase tracking-tight leading-none">Unimar</h2>
              <p className="text-[#d4a843] text-[8px] font-bold uppercase tracking-[0.15em]">Becas 2026</p>
            </div>
          </div>

          {/* Indicador de Paso Numérico Compacto */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <span className="text-[#d4a843] text-[10px] font-black uppercase">Paso 0{pasoActual}</span>
            <span className="text-white/40 text-[10px]">/</span>
            <span className="text-white/75 text-[10px] font-bold">0{PASOS.length}</span>
          </div>
        </div>

        {/* Título del Paso Actual y Barra de Progreso Integrada */}
        <div className="flex flex-col gap-1.5 bg-black/20 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-[#d4a843] flex items-center justify-center shrink-0">
                <IconoActivo className="h-3 w-3 text-[#1e3a5f]" />
              </div>
              <span className="text-white font-bold text-xs uppercase tracking-wide truncate">
                {pasoActivoData.titulo}
              </span>
            </div>
            <span className="text-[#d4a843] font-black text-[10px] uppercase tracking-wider shrink-0">
              {Math.round(progreso)}%
            </span>
          </div>
          <Progress value={progreso} className="h-1 bg-white/10 [&>div]:bg-[#d4a843]" />
        </div>
      </div>


      {/* =========================================================
          VISTA DE ESCRITORIO (>= 1024px): Sidebar Vertical Clásico
          ========================================================= */}
          
      {/* 1. Logo Desktop */}
      <div className="hidden lg:flex p-5 items-center gap-2.5 border-b border-white/5">
        <div className="bg-[#d4a843] p-1.5 rounded-lg shadow-sm">
          <GraduationCap className="h-5 w-5 text-[#1e3a5f]" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-white font-black text-xs uppercase tracking-tighter leading-none">Unimar</h2>
          <p className="text-[#d4a843] text-[9px] font-bold uppercase tracking-[0.15em] mt-0.5">Becas 2026</p>
        </div>
      </div>

      {/* 2. Navegación Vertical Desktop */}
      <nav className="hidden lg:flex flex-col overflow-y-auto custom-scrollbar px-5 py-4 gap-3 flex-1">
        {PASOS.map((paso) => {
          const Icono = paso.icon;
          const activo = pasoActual === paso.id;
          const completado = pasoActual > paso.id;

          return (
            <div 
              key={paso.id} 
              className={cn(
                "flex items-center gap-3 transition-all duration-300 rounded-lg",
                activo ? "translate-x-1" : "opacity-50 hover:opacity-80"
              )}
            >
              <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center border-2 transition-all shrink-0", 
                activo ? "bg-[#d4a843] border-[#d4a843] shadow-md shadow-[#d4a843]/20" : 
                completado ? "bg-green-500 border-green-500 shadow-sm shadow-green-500/20" : "border-white/20 bg-white/5"
              )}>
                {completado ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Icono className={cn("h-3.5 w-3.5", activo ? "text-[#1e3a5f]" : "text-white")} />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className={cn(
                  "text-[8px] font-black uppercase tracking-widest leading-none", 
                  activo ? "text-[#d4a843]" : "text-white/60"
                )}>
                  Paso 0{paso.id}
                </span>
                <span className="text-white font-bold text-[10px] uppercase tracking-tight leading-none mt-1 whitespace-nowrap">
                  {paso.titulo}
                </span>
              </div>
            </div>
          )
        })}
      </nav>

      {/* 3. Sección Inferior de Progreso (Desktop) */}
      <div className="hidden lg:block p-6 bg-[#162d4a] mt-auto border-t border-white/5">
        <div className="flex justify-between text-[9px] font-black uppercase text-white/40 mb-2 tracking-widest">
          <span>Progreso Total</span>
          <span className="text-[#d4a843]">{Math.round(progreso)}%</span>
        </div>
        <Progress value={progreso} className="h-1.5 bg-white/10 [&>div]:bg-[#d4a843]" />
      </div>

    </aside>
  )
}