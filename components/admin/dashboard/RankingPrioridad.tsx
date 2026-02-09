"use client"

import { Award, Star, TrendingUp, Heart } from "lucide-react"

interface RankingProps {
  estudiantes: any[]
  onNavigate: (cedula: string) => void
}

export function RankingPrioridad({ estudiantes, onNavigate }: RankingProps) {
  return (
    /* h-[400px] asegura un tamaño definido en móvil para que el scroll funcione y no se monte. 
       mb-6 añade separación con el siguiente elemento en la pila vertical. */
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[400px] md:h-full flex flex-col mb-6 md:mb-0">
      
      {/* Cabecera */}
      <div className="bg-[#1a2744] px-4 py-4 md:px-6 md:py-5 flex justify-between items-center border-b-4 border-[#d4a843] shrink-0">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 md:h-5 md:w-5 text-[#d4a843] fill-[#d4a843]" />
          <div>
            <h3 className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.15em] md:tracking-[0.2em] leading-none">
              Ranking de Prioridad Élite
            </h3>
            <p className="text-[7px] md:text-[8px] text-[#8a9bbd] font-bold uppercase mt-1">Criterio: Mérito Académico</p>
          </div>
        </div>
      </div>
      
      {/* Listado con Scroll Independiente */}
      <div className="divide-y divide-slate-100 flex-1 overflow-y-auto custom-scrollbar bg-white">
        {estudiantes.length > 0 ? estudiantes.map((est, index) => (
          <div 
            key={est.id} 
            onClick={() => onNavigate(est.cedula)}
            className="p-3 md:p-4 hover:bg-blue-50 transition-all flex items-center justify-between group cursor-pointer"
          >
            {/* Sección Izquierda: Avatar y Nombres */}
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-100 text-[#1a2744] font-black text-[10px] md:text-xs group-hover:border-[#d4a843] group-hover:bg-white transition-all shrink-0">
                {index === 0 ? "🏆" : index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-black text-[#1a2744] uppercase leading-none group-hover:text-blue-700 transition-colors truncate">
                  {est.nombre} {est.apellido}
                </p>
                <p className="text-[8px] md:text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter truncate">
                  {est.carrera}
                </p>
              </div>
            </div>

            {/* Sección Derecha: Métricas */}
            <div className="flex items-center gap-3 md:gap-6 shrink-0 ml-2">
              <div className="flex flex-col items-center">
                <span className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase">Promedio</span>
                <div className="flex items-center gap-0.5 md:gap-1 text-emerald-600">
                  <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" />
                  <span className="text-xs md:text-sm font-black">{Number(est.promedio_notas).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[6px] md:text-[7px] font-black text-slate-400 uppercase">Necesidad</span>
                <div className="flex items-center gap-0.5 md:gap-1 text-blue-600">
                  <Heart className="h-2.5 w-2.5 md:h-3 md:w-3 fill-blue-600/10" />
                  <span className="text-[10px] md:text-xs font-black">{est.vulnerabilidad_puntos} pts</span>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center opacity-40">
            <p className="text-[10px] font-black uppercase tracking-widest">Sin candidatos élite</p>
          </div>
        )}
      </div>
    </div>
  )
}