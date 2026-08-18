import React from "react"

export interface PostulacionHeaderProps {
  tituloPaso?: string;
  periodoIngreso?: string;
  promedio: string;
}

export function PostulacionHeader({ 
  tituloPaso = "Postulación", 
  periodoIngreso, 
  promedio 
}: PostulacionHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-[#e2e8f0] px-4 sm:px-6 py-4 flex flex-row items-center justify-between flex-shrink-0 transition-all">
      
      {/* Información del Paso Actual */}
      <div className="flex flex-col pr-4">
        <h1 className="text-[#1e3a5f] font-serif font-extrabold uppercase tracking-tight text-sm sm:text-base leading-none">
          {tituloPaso}
        </h1>
        <p className="text-[#6b7280] text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none mt-1.5">
          {periodoIngreso || 'Postulación Institucional'}
        </p>
      </div>

      {/* Indicador de Promedio Académico */}
      <div className="flex items-center shrink-0">
        <div className="px-3 py-1.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-center min-w-[72px] shadow-sm transition-all hover:shadow-md">
          <span className="block text-[8px] font-black text-[#6b7280] uppercase tracking-wider leading-none mb-1">
            Promedio
          </span>
          <span className="block text-xs font-black text-[#1e3a5f] leading-none">
            {promedio}
          </span>
        </div>
      </div>
      
    </header>
  )
}