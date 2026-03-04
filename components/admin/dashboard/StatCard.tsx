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
        bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 
        transition-all duration-300 flex flex-col justify-center
        /* FIJAMOS EL ANCHO PARA EVITAR EL ESTIRAMIENTO */
        w-full md:w-32 lg:w-40
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-200 active:scale-95' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-6 h-6 ${color} text-white rounded-lg flex items-center justify-center shadow-sm shrink-0`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <p className="text-slate-500 text-[8px] font-black uppercase tracking-tight truncate leading-none">
          {label}
        </p>
      </div>
      
      <p className="text-sm font-black text-[#1a2744] leading-none ml-0.5">
        {value}
      </p>
    </div>
  )
}