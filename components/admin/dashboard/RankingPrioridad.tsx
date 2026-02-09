// components/admin/dashboard/RankingPrioridad.tsx
import { Award, Star, TrendingUp, Heart } from "lucide-react"

interface RankingProps {
  estudiantes: any[]
  onNavigate: (cedula: string) => void // <--- Nueva prop
}

export function RankingPrioridad({ estudiantes, onNavigate }: RankingProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
      <div className="bg-[#1a2744] px-6 py-5 flex justify-between items-center border-b-4 border-[#d4a843]">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[#d4a843] fill-[#d4a843]" />
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none">
              Ranking de Prioridad Élite
            </h3>
            <p className="text-[8px] text-[#8a9bbd] font-bold uppercase mt-1">Criterio: Mérito Académico</p>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-slate-100 flex-1">
        {estudiantes.length > 0 ? estudiantes.map((est, index) => (
          <div 
            key={est.id} 
            // EVENTO CLICK
            onClick={() => onNavigate(est.cedula)}
            className="p-4 hover:bg-blue-50 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border-2 border-slate-100 text-[#1a2744] font-black text-xs group-hover:border-[#d4a843] group-hover:bg-white transition-all">
                {index === 0 ? "🏆" : index + 1}
              </div>
              <div>
                <p className="text-xs font-black text-[#1a2744] uppercase leading-none group-hover:text-blue-700 transition-colors">
                  {est.nombre} {est.apellido}
                </p>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{est.carrera}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="text-[7px] font-black text-slate-400 uppercase">Promedio</span>
                <div className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-sm font-black">{Number(est.promedio_notas).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[7px] font-black text-slate-400 uppercase">Necesidad</span>
                <div className="flex items-center gap-1 text-blue-600">
                  <Heart className="h-3 w-3 fill-blue-600/10" />
                  <span className="text-xs font-black">{est.vulnerabilidad_puntos} pts</span>
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