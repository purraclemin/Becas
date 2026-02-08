"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" 
import { 
  FileText, CheckCircle2, Clock, XCircle, Sparkles, 
  Home, LogOut 
} from "lucide-react"

// Acciones y Lógica
import { obtenerEstadisticasBecas } from "@/lib/ActionsDashboard"
import { obtenerSolicitudesRecientes } from "@/lib/ActionsRecientes"
import { obtenerRankingPrioridad } from "@/lib/ActionsRanking"
import { logout } from "@/lib/ActionsLogout"

// Componentes del Dashboard
import { StatCard } from "@/components/admin/dashboard/StatCard"
import { RankingPrioridad } from "@/components/admin/dashboard/RankingPrioridad"
import { CarreraBarChart, BecaPieChart } from "@/components/admin/dashboard/DashboardCharts"
import { HealthStatus } from "@/components/admin/dashboard/OperationalStats"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [ranking, setRanking] = useState<any[]>([])
  const router = useRouter() 

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [_, dataStats, dataRanking] = await Promise.all([
          obtenerSolicitudesRecientes(),
          obtenerEstadisticasBecas(),
          obtenerRankingPrioridad()
        ])
        setStats(dataStats)
        setRanking(dataRanking)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    cargarTodo()
  }, [])

  const total = stats?.porEstatus?.reduce((acc: any, curr: any) => acc + curr.total, 0) || 0
  const pendientes = stats?.porEstatus?.find((e: any) => e.estatus === 'Pendiente' || e.estatus === 'En Revisión')?.total || 0
  
  // --- 🟢 NUEVAS FUNCIONES DE NAVEGACIÓN PRECISA ---
  
  // Para la gráfica de Barras (Carreras)
  const irAFiltroCarrera = (carrera: string) => {
    if (!carrera) return;
    router.push(`/admin/solicitudes?carrera=${encodeURIComponent(carrera)}`)
  }

  // Para la gráfica de Torta (Becas) y la tabla de abajo
  const irAFiltroBeca = (beca: string) => {
    if (!beca) return;
    router.push(`/admin/solicitudes?tipoBeca=${encodeURIComponent(beca)}`)
  }

  // Para los botones de Estatus (Superior y Tarjetas)
  const irAStatus = (estatus: string) => {
    if (estatus === 'Todas') {
      router.push('/admin/solicitudes')
    } else {
      router.push(`/admin/solicitudes?status=${encodeURIComponent(estatus)}`)
    }
  }

  return (
    <div className="w-full min-h-screen bg-[#f8fafc]">
      
      {/* --- ENCABEZADO INTEGRADO --- */}
      <div className="sticky top-0 z-30 bg-[#f8fafc] h-16 flex items-center px-6 md:px-8">
        <div className="w-full bg-white px-6 py-2 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <h1 className="text-lg font-black text-[#1a2744] uppercase tracking-widest">
            Panel de Control
          </h1>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg overflow-x-auto max-w-full">
            {['Todas', 'Pendiente', 'En Revisión', 'Aprobada', 'Rechazada'].map((label) => (
              <button
                key={label}
                onClick={() => irAStatus(label)}
                className={`
                  px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap
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

          <div className="flex items-center gap-5">
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

      <div className="p-6 md:p-8 space-y-8 pb-10">
        
        {/* TARJETAS KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard label="Total Solicitudes" value={total} icon={FileText} color="bg-blue-500" onClick={() => irAStatus('Todas')} />
           <StatCard label="Pendientes" value={pendientes} icon={Clock} color="bg-[#d4a843]" onClick={() => irAStatus('Pendiente')} />
           <StatCard label="Aprobadas" value={stats?.porEstatus?.find((e: any) => e.estatus === 'Aprobada')?.total || 0} icon={CheckCircle2} color="bg-emerald-500" onClick={() => irAStatus('Aprobada')} />
           <StatCard label="Rechazadas" value={stats?.porEstatus?.find((e: any) => e.estatus === 'Rechazada')?.total || 0} icon={XCircle} color="bg-rose-500" onClick={() => irAStatus('Rechazada')} />
        </div>

        {/* GRÁFICOS INTERACTIVOS CON NAVEGACIÓN CORREGIDA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           {/* Usa irAFiltroCarrera para que envíe ?carrera=... */}
           <CarreraBarChart data={stats?.porCarrera || []} onNavigate={irAFiltroCarrera} />
           
           <div className="h-96">
             <RankingPrioridad estudiantes={ranking} onNavigate={(q: string) => router.push(`/admin/solicitudes?search=${q}`)} />
           </div>

           {/* Usa irAFiltroBeca para que envíe ?tipoBeca=... */}
           <BecaPieChart data={stats?.porTipo || []} onNavigate={irAFiltroBeca} />
        </div>

        {/* SALUD OPERATIVA Y DISTRIBUCIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <HealthStatus porEstatus={stats?.porEstatus || []} total={total} />
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-black text-[#1a2744] text-[10px] uppercase tracking-widest">Distribución Detallada</h3>
              <Link href="/admin/reportes" className="text-[9px] font-black text-blue-600 hover:underline uppercase">Ver Todo</Link>
            </div>
            <div className="flex-1 overflow-y-auto max-h-64">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {stats?.porTipo?.map((item: any, idx: number) => (
                    <tr key={idx} onClick={() => irAFiltroBeca(item.tipo_beca)} className="hover:bg-blue-50 transition-all cursor-pointer group">
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase group-hover:text-[#1a2744]">{item.tipo_beca}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">{item.total}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* IA PREDICTORA */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#1a2744] p-8 rounded-3xl shadow-xl text-center text-white relative overflow-hidden border-b-8 border-[#d4a843]">
          <div className="absolute -top-10 -right-10 opacity-10"><Sparkles className="h-40 w-40 text-[#d4a843]" /></div>
          <h3 className="text-xl font-black uppercase tracking-tighter flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 text-[#d4a843]" /> IA Predictora Unimar
          </h3>
          <p className="mt-4 text-slate-300 text-sm max-w-2xl mx-auto italic">
            Prioridad: Hay <span className="text-[#d4a843] font-bold">{pendientes} solicitudes</span> críticas esperando revisión.
          </p>
          <button 
            onClick={() => irAStatus('Pendiente')}
            className="mt-8 bg-[#d4a843] text-[#1a2744] px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 hover:bg-white transition-all"
          >
            Gestionar Ahora
          </button>
        </div>

      </div>
    </div>
  )
}