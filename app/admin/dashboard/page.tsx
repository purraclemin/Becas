"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import { 
  FileText, CheckCircle2, Clock, XCircle, Loader2, RefreshCw, AlertCircle 
} from "lucide-react"

import { obtenerEstadisticasBecas } from "@/lib/ActionsDashboard"
import { obtenerRankingPrioridad } from "@/lib/ActionsRanking"

import { PageHeader } from "@/components/admin/PageHeader"
import { StatCard } from "@/components/admin/dashboard/StatCard"
import { RankingPrioridad } from "@/components/admin/dashboard/RankingPrioridad"
import { CarreraBarChart, BecaPieChart } from "@/components/admin/dashboard/DashboardCharts"
import { HealthStatus } from "@/components/admin/dashboard/OperationalStats"
import { ImprimirConIAModal } from "@/components/admin/ImprimirConIAModal"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true) 
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const router = useRouter() 

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [dataStats, dataRanking] = await Promise.all([
          obtenerEstadisticasBecas(),
          obtenerRankingPrioridad() 
        ])
        setStats(dataStats)
        setRanking(dataRanking)
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error)
      } finally {
        setLoading(false) 
      }
    }
    cargarTodo()
  }, [])

  // Conteo de estatus
  const total = stats?.porEstatus?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0
  const cantPendientes = stats?.porEstatus?.find((e: any) => e.estatus === 'Pendiente')?.total || 0
  const cantEnRevision = stats?.porEstatus?.find((e: any) => e.estatus === 'En Revisión')?.total || 0
  const cantAprobadas = stats?.porEstatus?.find((e: any) => e.estatus === 'Aprobada')?.total || 0
  const cantRechazadas = stats?.porEstatus?.find((e: any) => e.estatus === 'Rechazada')?.total || 0
  
  // Renovación
  const cantRenovaciones = stats?.porEstatus?.find((e: any) => 
    e.estatus === 'Renovación' || e.estatus === 'Renovacion'
  )?.total || 0

  // Revisión Especial
  const cantRevisionEspecial = stats?.porEstatus?.find((e: any) => 
    e.estatus === 'Revisión Especial' || e.estatus === 'Revision Especial'
  )?.total || 0

  const irAStatus = (estatus: string) => {
    if (estatus === 'Todas') {
      router.push('/admin/solicitudes')
    } else {
      router.push(`/admin/solicitudes?status=${encodeURIComponent(estatus)}`)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-slate-50 min-h-[60vh]">
        <Loader2 className="h-7 w-7 text-[#d4a843] animate-spin mb-3" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Sincronizando Sistema UNIMAR...</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 px-2 pt-0 pb-6 bg-[#f8fafc] min-h-screen">
      {/* Cabecera Académica Minimalista con integración de IA */}
      <PageHeader 
        titulo="Panel de Control" 
        subtitulo="Métricas y Rendimiento Operativo"
        mostrarExportar={true}
        onExport={() => setIsAIModalOpen(true)}
      />

      {/* UF-Scale: Bloque superior adaptado con grilla fluida y compacta en escritorio */}
      <div className="flex justify-start">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 w-full">
          <StatCard label="Total" value={total} icon={FileText} color="bg-[#1e3a5f]" onClick={() => irAStatus('Todas')} />
          
          <StatCard 
            label="Renovación" 
            value={cantRenovaciones} 
            icon={RefreshCw} 
            color="bg-indigo-600" 
            onClick={() => irAStatus('Renovación')} 
          />

          <StatCard 
            label="Rev. Especial" 
            value={cantRevisionEspecial} 
            icon={AlertCircle} 
            color="bg-purple-600" 
            onClick={() => irAStatus('Revisión Especial')} 
          />

          <StatCard label="Pendientes" value={cantPendientes} icon={Clock} color="bg-[#d4a843]" onClick={() => irAStatus('Pendiente')} />
          <StatCard label="En Revisión" value={cantEnRevision} icon={Clock} color="bg-blue-600" onClick={() => irAStatus('En Revisión')} />
          <StatCard label="Aprobadas" value={cantAprobadas} icon={CheckCircle2} color="bg-emerald-600" onClick={() => irAStatus('Aprobada')} />
          <StatCard label="Rechazadas" value={cantRechazadas} icon={XCircle} color="bg-rose-600" onClick={() => irAStatus('Rechazada')} />
        </div>
      </div>

      {/* Grilla central balanceada de 12 columnas para alinear correctamente las tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <CarreraBarChart data={stats?.porCarrera || []} onNavigate={(c) => router.push(`/admin/solicitudes?carrera=${encodeURIComponent(c)}`)} />
        </div>
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <RankingPrioridad estudiantes={ranking} onNavigate={(q: string) => router.push(`/admin/solicitudes?search=${q}`)} />
        </div>
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <BecaPieChart data={stats?.porTipo || []} onNavigate={(b) => router.push(`/admin/solicitudes?tipoBeca=${encodeURIComponent(b)}`)} />
        </div>
      </div>

      {/* Bloque inferior: Salud operativa y distribución detallada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4 items-start">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <HealthStatus porEstatus={stats?.porEstatus || []} total={total} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col h-fit">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-black text-[#1e3a5f] text-[9px] uppercase tracking-wider">Distribución Detallada</h3>
            <button onClick={() => router.push('/admin/analiticas')} className="text-[8px] font-black text-[#1e3a5f] hover:text-[#d4a843] uppercase tracking-wider transition-colors">Ver Analíticas</button>
          </div>
          <div className="flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-100">
                {stats?.porTipo?.map((item: any, idx: number) => (
                  <tr 
                    key={idx} 
                    onClick={() => router.push(`/admin/solicitudes?tipoBeca=${encodeURIComponent(item.tipo_beca)}`)} 
                    className="hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <td className="px-4 py-2 text-[9px] font-bold text-slate-600 uppercase group-hover:text-[#1e3a5f]">
                      {item.tipo_beca}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="bg-blue-50 text-[#1e3a5f] px-2 py-0.5 rounded-md text-[9px] font-black border border-blue-100/50">
                        {item.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Informe Inteligente con Gemini */}
      <ImprimirConIAModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        stats={stats}
        ranking={ranking}
      />
    </div>
  )
}