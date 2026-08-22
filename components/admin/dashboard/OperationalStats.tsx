"use client"

import { BarChart3, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function HealthStatus({ porEstatus, total }: { porEstatus: any[], total: number }) {
  const router = useRouter()

  const filtrarPorEstatus = (estatus: string) => {
    router.push(`/admin/solicitudes?filter=${encodeURIComponent(estatus)}`)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-3 sm:p-4 flex flex-col h-full">
      <h3 className="font-black text-[#1e3a5f] text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center gap-2 mb-3 shrink-0">
        <BarChart3 className="h-3.5 w-3.5 text-[#d4a843]" /> Salud Operativa
      </h3>
      
      {/* Contenedor dinámico: crece según contenido, scroll solo si excede ~10 ítems */}
      <div className="space-y-3.5 overflow-y-auto max-h-[400px] custom-scrollbar pr-1">
        {porEstatus && porEstatus.length > 0 ? (
          porEstatus.map((item, idx) => {
            const porcentaje = total > 0 ? ((item.total / total) * 100).toFixed(1) : "0";
            
            return (
              <div 
                key={idx} 
                onClick={() => filtrarPorEstatus(item.estatus)}
                className="space-y-1.5 cursor-pointer group"
              >
                {/* Encabezado estandarizado */}
                <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-[#1e3a5f] transition-colors">
                  <span className="flex items-center gap-1">
                    {item.estatus}
                    <ArrowRight className="h-2.5 w-2.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#d4a843]" />
                  </span>
                  <span className="text-[#1e3a5f] bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-[#1e3a5f] group-hover:text-white transition-colors">
                    {item.total} ({porcentaje}%)
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50 shadow-inner group-hover:shadow transition-all">
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
          })
        ) : (
          <div className="text-center py-4 opacity-40">
            <p className="text-[9px] font-black uppercase tracking-widest">Sin datos operativos</p>
          </div>
        )}
      </div>
    </div>
  )
}