"use client"

import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  onClick?: () => void 
}

export function StatCard({ label, value, icon: Icon, color, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        /* Estilo Bento Unificado con escala dual UF-Scale optimizada para móvil */
        bg-white hover:bg-slate-50/80 p-2 sm:p-3 rounded-xl border border-slate-200/80
        transition-all duration-300 flex flex-col justify-between
        w-full h-full shadow-2xs
        ${onClick ? 'cursor-pointer hover:border-[#1e3a5f]/40 active:scale-[0.98]' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-1.5 mb-1">
        <div className={`w-6 h-6 sm:w-7 sm:h-7 ${color} text-white rounded-lg flex items-center justify-center shadow-xs shrink-0`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <span className="text-slate-400 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-right truncate">
          {label}
        </span>
      </div>
      
      <div className="text-left mt-0.5 sm:mt-1">
        <p className="text-sm sm:text-lg font-black text-[#1e3a5f] tracking-tight leading-none">
          {value}
        </p>
      </div>
    </div>
  )
}