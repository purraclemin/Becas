"use client"

import { BarChart3, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function HealthStatus({ porEstatus, total }: { porEstatus: any[], total: number }) {
  const router = useRouter()

  const filtrarPorEstatus = (estatus: string) => {
    router.push(`/admin/solicitudes?filter=${encodeURIComponent(estatus)}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col h-full">
      {/* Título: Ajustado margen inferior en móvil */}
      <h3 className="font-black text-[#1a2744] text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 mb-4 md:mb-6">
        <BarChart3 className="h-4 w-4 text-[#d4a843]" /> Salud del Proceso Operativo
      </h3>
      
      {/* Espaciado entre barras: Reducido ligeramente en móvil para evitar scroll innecesario */}
      <div className="space-y-5 md:space-y-6 flex-1 flex flex-col justify-center">
        {porEstatus?.map((item, idx) => {
          const porcentaje = total > 0 ? ((item.total / total) * 100).toFixed(1) : "0";
          
          return (
            <div 
              key={idx} 
              onClick={() => filtrarPorEstatus(item.estatus)}
              className="space-y-1.5 md:space-y-2 cursor-pointer group"
            >
              {/* Encabezado de la barra: Texto más pequeño en móvil */}
              <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#1a2744] transition-colors">
                <span className="flex items-center gap-1">
                  {item.estatus}
                  <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#d4a843]" />
                </span>
                <span className="text-[#1a2744] bg-slate-100 px-1.5 py-0.5 rounded md:px-2 md:rounded-md group-hover:bg-[#1a2744] group-hover:text-white transition-colors">
                  {item.total} ({porcentaje}%)
                </span>
              </div>

              {/* Barra de progreso: Altura reducida en móvil (h-2.5) vs escritorio (md:h-3) */}
              <div className="w-full bg-slate-100 h-2.5 md:h-3 rounded-full overflow-hidden border border-slate-200 shadow-inner group-hover:shadow-md transition-all">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.estatus === 'Aprobada' ? 'bg-emerald-500 group-hover:bg-emerald-400' : 
                    item.estatus === 'Rechazada' ? 'bg-rose-500 group-hover:bg-rose-400' : 
                    item.estatus === 'En Revisión' ? 'bg-blue-500 group-hover:bg-blue-400' : 
                    'bg-[#d4a843] group-hover:bg-amber-400'
                  }`} 
                  style={{ width: `${porcentaje}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}