"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { 
  FileText, CheckCircle2, Clock, XCircle, Sparkles, 
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
  
  const pendientes = stats?.porEstatus?.reduce((acc: number, curr: any) => {
      if (curr.estatus === 'Pendiente' || curr.estatus === 'En Revisión') {
          return acc + curr.total;
      }
      return acc;
  }, 0) || 0;
  
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
      
      {/* --- ENCABEZADO INTEGRADO (MÁS COMPACTO EN MÓVIL) --- */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] py-1.5 md:h-16 md:flex md:items-center px-2 md:px-8">
        <div className="w-full bg-white px-3 md:px-6 py-2 md:py-2 rounded-lg md:rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
          
          <div className="flex items-center justify-between w-full md:w-auto">
            <h1 className="text-[11px] md:text-lg font-black text-[#1a2744] uppercase tracking-wider md:tracking-widest">
              Panel de Control
            </h1>
            <div className="flex md:hidden items-center gap-3">
              <Link href="/" title="Ir al Inicio">
                <Home className="h-4 w-4 text-slate-400" />
              </Link>
              <button onClick={() => logout()} className="text-rose-500">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filtros: Más compactos en móvil */}
          <div className="flex items-center gap-1 bg-slate-50 p-0.5 md:p-1 rounded-md md:rounded-lg overflow-x-auto max-w-full no-scrollbar">
            {['Todas', 'Pendiente', 'En Revisión', 'Aprobada', 'Rechazada'].map((label) => (
              <button
                key={label}
                onClick={() => irAStatus(label)}
                className={`
                  px-2.5 py-1 md:px-4 md:py-1.5 rounded-md text-[8px] md:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
                  ${label === 'Todas' 
                    ? "bg-[#1a2744] text-white shadow-sm" 
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

      <div className="p-3 md:p-8 space-y-4 md:space-y-8 pb-10">
        
        {/* TARJETAS KPI (Reducción de gap en móvil) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
           <StatCard label="Total" value={total} icon={FileText} color="bg-blue-500" onClick={() => irAStatus('Todas')} />
           <StatCard label="Pendientes" value={pendientes} icon={Clock} color="bg-[#d4a843]" onClick={() => irAStatus('Pendiente')} />
           <StatCard label="Aprobadas" value={stats?.porEstatus?.find((e: any) => e.estatus === 'Aprobada')?.total || 0} icon={CheckCircle2} color="bg-emerald-500" onClick={() => irAStatus('Aprobada')} />
           <StatCard label="Rechazadas" value={stats?.porEstatus?.find((e: any) => e.estatus === 'Rechazada')?.total || 0} icon={XCircle} color="bg-rose-500" onClick={() => irAStatus('Rechazada')} />
        </div>

        {/* GRÁFICOS INTERACTIVOS (Altura ajustada para móvil) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
           <div className="animate-in fade-in zoom-in-95 duration-500 delay-100 bg-white p-1 md:p-2 rounded-xl border border-slate-100 h-[300px] md:h-auto">
               <CarreraBarChart data={stats?.porCarrera || []} onNavigate={irAFiltroCarrera} />
           </div>
           
           <div className="h-[350px] md:h-96 animate-in fade-in zoom-in-95 duration-500 delay-200">
             <RankingPrioridad estudiantes={ranking} onNavigate={(q: string) => router.push(`/admin/solicitudes?search=${q}`)} />
           </div>

           <div className="animate-in fade-in zoom-in-95 duration-500 delay-300 bg-white p-1 md:p-2 rounded-xl border border-slate-100 h-[300px] md:h-auto">
               <BecaPieChart data={stats?.porTipo || []} onNavigate={irAFiltroBeca} />
           </div>
        </div>

        {/* SALUD OPERATIVA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <HealthStatus porEstatus={stats?.porEstatus || []} total={total} />
          
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-4 md:px-6 py-3 md:py-4 border-b flex justify-between items-center">
              <h3 className="font-black text-[#1a2744] text-[9px] md:text-[10px] uppercase tracking-widest">Distribución Detallada</h3>
              <Link href="/admin/reportes" className="text-[8px] md:text-[9px] font-black text-blue-600 hover:underline uppercase">Ver Todo</Link>
            </div>
            <div className="flex-1 overflow-y-auto max-h-48 md:max-h-64 custom-scrollbar">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {stats?.porTipo?.map((item: any, idx: number) => (
                    <tr key={idx} onClick={() => irAFiltroBeca(item.tipo_beca)} className="hover:bg-blue-50 transition-all cursor-pointer group">
                      <td className="px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-bold text-slate-600 uppercase group-hover:text-[#1a2744]">{item.tipo_beca}</td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-black">{item.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* IA PREDICTORA */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1a2744] p-5 md:p-8 rounded-xl md:rounded-3xl shadow-xl text-center text-white relative overflow-hidden border-b-4 md:border-b-8 border-[#d4a843] animate-in slide-in-from-bottom-8 duration-700">
          <div className="absolute -top-10 -right-10 opacity-10"><Sparkles className="h-20 md:h-40 w-20 md:w-40 text-[#d4a843]" /></div>
          <h3 className="text-sm md:text-xl font-black uppercase tracking-tighter flex items-center justify-center gap-2 md:gap-3">
            <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-[#d4a843]" /> IA Predictora Unimar
          </h3>
          <p className="mt-2 md:mt-4 text-slate-300 text-[10px] md:text-sm max-w-2xl mx-auto italic">
            Hay <span className="text-[#d4a843] font-bold">{pendientes} solicitudes</span> críticas esperando revisión.
          </p>
          <button 
            onClick={() => irAStatus('Pendiente')}
            className="mt-5 md:mt-8 w-full md:w-auto bg-[#d4a843] text-[#1a2744] px-6 py-2.5 md:px-8 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest shadow-lg hover:scale-105 hover:bg-white transition-all"
          >
            Gestionar Ahora
          </button>
        </div>

      </div>
    </div>
  )
}