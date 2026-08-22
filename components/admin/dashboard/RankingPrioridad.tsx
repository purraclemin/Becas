"use client"

import { Star, TrendingUp, Heart } from "lucide-react"

interface EstudianteRanking {
  id: number | string
  cedula: string
  nombre: string
  apellido: string
  carrera: string
  promedio_notas: number | string
  vulnerabilidad_puntos: number | string
  origen_puntaje?: 'admin' | 'estudiante'
}

interface RankingProps {
  estudiantes: EstudianteRanking[]
  onNavigate: (cedula: string) => void
}

export function RankingPrioridad({ estudiantes, onNavigate }: RankingProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col w-full">
      {/* Cabecera del Ranking */}
      <div className="bg-[#1a2744] px-4 sm:px-5 py-3 flex justify-between items-center border-b-2 border-[#d4a843] shrink-0">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[#d4a843] fill-[#d4a843]" />
          <div>
            <h3 className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest leading-none">
              Ranking Prioridad Élite
            </h3>
            <p className="text-[8px] text-[#8a9bbd] font-bold uppercase mt-1 tracking-tighter">
              Criterio: Mérito Académico
            </p>
          </div>
        </div>
      </div>
      
      {/* CONTENEDOR DINÁMICO: Crece hasta 10 ítems, luego hace scroll */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[35rem] custom-scrollbar bg-white">
        {estudiantes.length > 0 ? estudiantes.map((est, index) => {
          const promedioSeguro = Number(est.promedio_notas) || 0;
          const puntosSeguros = Number(est.vulnerabilidad_puntos) || 0;

          const esAdmin = est.origen_puntaje === 'admin';
          const colorNecesidad = esAdmin ? 'text-emerald-600' : 'text-rose-600';
          const colorIcono = esAdmin ? 'fill-emerald-600/10' : 'fill-rose-600/10';
          const etiquetaOrigen = esAdmin ? 'ADM' : 'Estu';

          return (
            <div 
              key={`${est.id}-${index}`} 
              onClick={() => onNavigate(est.cedula)}
              className="px-3 sm:px-4 py-3 hover:bg-slate-50/80 transition-all flex items-center justify-between group cursor-pointer gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-[#1a2744] font-black text-[10px] group-hover:border-[#d4a843] group-hover:bg-white transition-all shrink-0">
                  {index === 0 ? "🏆" : index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-[#1a2744] uppercase leading-none group-hover:text-blue-700 transition-colors truncate">
                    {est.nombre} {est.apellido}
                  </p>
                  <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter truncate leading-none">
                    {est.carrera}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Promedio</span>
                  <div className="flex items-center gap-0.5 text-emerald-600">
                    <TrendingUp className="h-2.5 w-2.5" />
                    <span className="text-[11px] sm:text-xs font-black">{promedioSeguro.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-slate-400 uppercase leading-none mb-0.5">Necesidad</span>
                  <div className={`flex items-center gap-1 ${colorNecesidad}`}>
                    <Heart className={`h-2.5 w-2.5 ${colorIcono}`} />
                    <span className="text-[9px] sm:text-[10px] font-black">{puntosSeguros} ({etiquetaOrigen})</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center p-8 text-center opacity-40">
            <p className="text-[9px] font-black uppercase tracking-widest">Sin candidatos élite</p>
          </div>
        )}
      </div>
    </div>
  )
}