"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { 
  FileText, CheckCircle2, Clock, XCircle, 
  Home, LogOut, Loader2 
} from "lucide-react"

// Acciones y Lógica
import { obtenerEstadisticasBecas } from "@/lib/ActionsDashboard"
import { obtenerRankingPrioridad } from "@/lib/ActionsRanking"
import { logout } from "@/lib/ActionsAuth" 

// Componentes del Dashboard
import { StatCard } from "@/components/admin/dashboard/StatCard"
import { RankingPrioridad } from "@/components/admin/dashboard/RankingPrioridad"
import { CarreraBarChart, BecaPieChart } from "@/components/admin/dashboard/DashboardCharts"
import { HealthStatus } from "@/components/admin/dashboard/OperationalStats"

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

  const total = stats?.porEstatus?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0
  
  // 🟢 Lógica desglosada por estatus individual
  const cantPendientes = stats?.porEstatus?.find((e: any) => e.estatus === 'Pendiente')?.total || 0
  const cantEnRevision = stats?.porEstatus?.find((e: any) => e.estatus === 'En Revisión')?.total || 0
  const cantAprobadas = stats?.porEstatus?.find((e: any) => e.estatus === 'Aprobada')?.total || 0
  const cantRechazadas = stats?.porEstatus?.find((e: any) => e.estatus === 'Rechazada')?.total || 0
  
  const irAFiltroCarrera = (carrera: string) => {
    if (!carrera) return;
    router.push(`/admin/solicitudes?carrera=${encodeURIComponent(carrera)}`)
  }

  const irAFiltroBeca = (beca: string) => {
    if (!beca) return;
    router.push(`/admin/solicitudes?tipoBeca=${encodeURIComponent(beca)}`)
  }

  const irAStatus = (estatus: string) => {
    if (estatus === 'Todas') {
      router.push('/admin/solicitudes')
    } else {
      router.push(`/admin/solicitudes?status=${encodeURIComponent(estatus)}`)
    }
  }

  if (loading) {
      return (
          <div className="w-full min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
              <Loader2 className="h-10 w-10 text-[#d4a843] animate-spin mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] text-center">
                  Cargando métricas en tiempo real...
              </p>
          </div>
      )
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* --- ENCABEZADO INTEGRADO --- */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] py-2 md:h-16 md:flex md:items-center px-4 md:px-8">
        <div className="w-full bg-white px-4 md:px-6 py-3 md:py-2 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-sm md:text-lg font-black text-[#1a2744] uppercase tracking-widest">
              Panel de Control
            </h1>
            <div className="flex md:hidden items-center gap-4">
              <Link href="/" title="Ir al Inicio">
                <Home className="h-5 w-5 text-slate-400" />
              </Link>
              <button onClick={() => logout()} className="text-rose-500">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg overflow-x-auto max-w-full no-scrollbar">
            {['Todas', 'Pendiente', 'En Revisión', 'Aprobada', 'Rechazada'].map((label) => (
              <button
                key={label}
                onClick={() => irAStatus(label)}
                className={`
                  px-3 md:px-4 py-1.5 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                  ${label === 'Todas' 
                    ? "bg-[#1a2744] text-white shadow-md" 
                    : "text-slate-400 hover:text-[#1a2744] hover:bg-white"
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link href="/" title="Ir al Inicio">
              <Home className="h-5 w-5 text-slate-400 hover:text-[#1a2744] transition-colors cursor-pointer" />
            </Link>
            <button 
              onClick={() => logout()} 
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-all border border-rose-100 group"
            >
              <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Salir</span>
            </button>
          </div>

        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-10">
        
        {/* 🟢 TARJETAS KPI ACTUALIZADAS (Grid de 5 para mejor distribución) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
           <StatCard label="Total" value={total} icon={FileText} color="bg-blue-500" onClick={() => irAStatus('Todas')} />
           <StatCard label="Pendientes" value={cantPendientes} icon={Clock} color="bg-[#d4a843]" onClick={() => irAStatus('Pendiente')} />
           <StatCard label="En Revisión" value={cantEnRevision} icon={Clock} color="bg-blue-600" onClick={() => irAStatus('En Revisión')} />
           <StatCard label="Aprobadas" value={cantAprobadas} icon={CheckCircle2} color="bg-emerald-500" onClick={() => irAStatus('Aprobada')} />
           <StatCard label="Rechazadas" value={cantRechazadas} icon={XCircle} color="bg-rose-500" onClick={() => irAStatus('Rechazada')} />
        </div>

        {/* ORDEN 1 & 2: RANKING Y LUEGO GRÁFICOS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
           {/* RANKING PRIMERO EN MÓVIL (order-1) */}
           <div className="h-[400px] md:h-96 order-1 xl:order-2 animate-in fade-in zoom-in-95 duration-500 delay-200">
             <RankingPrioridad estudiantes={ranking} onNavigate={(q: string) => router.push(`/admin/solicitudes?search=${q}`)} />
           </div>

           {/* GRÁFICOS DESPUÉS EN MÓVIL (order-2 y order-3) */}
           <div className="order-2 xl:order-1 animate-in fade-in zoom-in-95 duration-500 delay-100">
               <CarreraBarChart data={stats?.porCarrera || []} onNavigate={irAFiltroCarrera} />
           </div>
           
           <div className="order-3 animate-in fade-in zoom-in-95 duration-500 delay-300">
               <BecaPieChart data={stats?.porTipo || []} onNavigate={irAFiltroBeca} />
           </div>
        </div>

        {/* ORDEN 3 & 4: SALUD Y DISTRIBUCIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <HealthStatus porEstatus={stats?.porEstatus || []} total={total} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-5 md:px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-black text-[#1a2744] text-[10px] uppercase tracking-widest">Distribución Detallada</h3>
              <Link href="/admin/analitica" className="text-[9px] font-black text-blue-600 hover:underline uppercase">Ver Todo</Link>
            </div>
            <div className="flex-1 overflow-y-auto max-h-64 custom-scrollbar">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {stats?.porTipo?.map((item: any, idx: number) => (
                    <tr key={idx} onClick={() => irAFiltroBeca(item.tipo_beca)} className="hover:bg-blue-50 transition-all cursor-pointer group">
                      <td className="px-5 md:px-6 py-4 text-[9px] md:text-[10px] font-bold text-slate-600 uppercase group-hover:text-[#1a2744]">{item.tipo_beca}</td>
                      <td className="px-5 md:px-6 py-4 text-right">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black">{item.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}