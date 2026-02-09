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
        bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 
        transition-all duration-300 
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-200' : ''}
        h-full
      `}
    >
      {/* Tamaño del icono: Reducido en móvil (w-8 h-8) vs escritorio (md:w-10 md:h-10) */}
      <div className={`w-8 h-8 md:w-10 md:h-10 ${color} text-white rounded-xl flex items-center justify-center mb-2 md:mb-4 shadow-md`}>
        <Icon className="h-4 w-4 md:h-5 md:w-5" />
      </div>

      <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-tight">
        {label}
      </p>
      
      {/* Tamaño del valor: Ligeramente ajustado para pantallas pequeñas */}
      <p className="text-lg md:text-xl font-black text-[#1a2744] mt-0.5 md:mt-1">
        {value}
      </p>
    </div>
  )
}