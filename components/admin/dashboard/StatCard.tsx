"use client"

import { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  onClick?: () => void // <--- Nueva propiedad opcional
}

export function StatCard({ label, value, icon: Icon, color, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white p-6 rounded-2xl shadow-sm border border-slate-200 
        transition-all duration-300 
        ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-blue-200' : ''}
        h-full
      `}
    >
      <div className={`w-10 h-10 ${color} text-white rounded-xl flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-[#1a2744] mt-1">{value}</p>
    </div>
  )
}