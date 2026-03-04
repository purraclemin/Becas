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
import AdminTestPanel from "@/components/admin/AdminTestPanel"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true) 
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
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-7 w-7 text-[#d4a843] animate-spin mb-3" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Sincronizando...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader 
        titulo="Panel de Control" 
        subtitulo="Métricas y Rendimiento Operativo"
        mostrarExportar={true}
      />

      <div className="flex justify-start">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500 w-fit">
          <StatCard label="Total" value={total} icon={FileText} color="bg-blue-500" onClick={() => irAStatus('Todas')} />
          
          <StatCard 
            label="Renovación" 
            value={cantRenovaciones} 
            icon={RefreshCw} 
            color="bg-indigo-500" 
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
          <StatCard label="Aprobadas" value={cantAprobadas} icon={CheckCircle2} color="bg-emerald-500" onClick={() => irAStatus('Aprobada')} />
          <StatCard label="Rechazadas" value={cantRechazadas} icon={XCircle} color="bg-rose-500" onClick={() => irAStatus('Rechazada')} />
        </div>
      </div>

      <AdminTestPanel />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="h-72 order-1 xl:order-2">
          <RankingPrioridad estudiantes={ranking} onNavigate={(q: string) => router.push(`/admin/solicitudes?search=${q}`)} />
        </div>
        <div className="order-2 xl:order-1">
          <CarreraBarChart data={stats?.porCarrera || []} onNavigate={(c) => router.push(`/admin/solicitudes?carrera=${encodeURIComponent(c)}`)} />
        </div>
        <div className="order-3">
          <BecaPieChart data={stats?.porTipo || []} onNavigate={(b) => router.push(`/admin/solicitudes?tipoBeca=${encodeURIComponent(b)}`)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
        <HealthStatus porEstatus={stats?.porEstatus || []} total={total} />
        
        {/* TABLA OPTIMIZADA: h-fit elimina el espacio en blanco, sin max-h elimina el scroll */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-fit">
          <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
            <h3 className="font-black text-[#1a2744] text-[9px] uppercase tracking-widest">Distribución Detallada</h3>
            <button onClick={() => router.push('/admin/analiticas')} className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Ver Analíticas</button>
          </div>
          <div className="flex-1 bg-white">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-50">
                {stats?.porTipo?.map((item: any, idx: number) => (
                  <tr 
                    key={idx} 
                    onClick={() => router.push(`/admin/solicitudes?tipoBeca=${encodeURIComponent(item.tipo_beca)}`)} 
                    className="hover:bg-blue-50/50 transition-all cursor-pointer group"
                  >
                    <td className="px-4 py-2 text-[9px] font-bold text-slate-600 uppercase group-hover:text-[#1a2744]">
                      {item.tipo_beca}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-black">
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
    </div>
  )
}