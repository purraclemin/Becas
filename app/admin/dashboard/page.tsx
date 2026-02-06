"use client"

import React, { useState, useEffect } from "react"
import { logout } from "@/lib/Actionslogout"
import Link from "next/link"
import { 
  BarChart3, 
  Users, 
  ClipboardCheck, 
  Settings, 
  LogOut, 
  Bell, 
  UserCircle,
  ArrowUpRight,
  Clock
} from "lucide-react"
import { obtenerSolicitudesRecientes } from "@/lib/ActionsRecientes"

export default function AdminDashboard() {
  const [recientes, setRecientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Carga automática de datos reales al entrar al dashboard
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await obtenerSolicitudesRecientes()
        setRecientes(data)
      } catch (error) {
        console.error("Error cargando el dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      {/* Sidebar Lateral - Identidad UNIMAR */}
      <aside className="w-64 bg-[#1a2744] text-white hidden md:flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#1e3a5f]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] border border-[#d4a843]">
              <span className="text-lg font-bold text-[#d4a843] font-serif">U</span>
            </div>
            <span className="font-serif font-extrabold tracking-tighter text-sm uppercase text-[#ffffff]">Panel Control</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 bg-[#d4a843] text-[#1a2744] px-4 py-3 rounded-lg font-bold text-sm shadow-md transition-all">
            <Settings className="h-5 w-5" /> Inicio
          </Link>
          <Link href="/admin/reportes" className="flex items-center gap-3 text-[#8a9bbd] hover:text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#1e3a5f]">
            <BarChart3 className="h-5 w-5 text-[#d4a843]" /> Reportes
          </Link>
          <Link href="/admin/solicitudes" className="flex items-center gap-3 text-[#8a9bbd] hover:text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#1e3a5f]">
            <ClipboardCheck className="h-5 w-5 text-[#d4a843]" /> Validar Becas
          </Link>
          <Link href="/admin/estudiantes" className="flex items-center gap-3 text-[#8a9bbd] hover:text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:bg-[#1e3a5f]">
            <Users className="h-5 w-5 text-[#d4a843]" /> Estudiantes
          </Link>
        </nav>

        {/* Botón de Cerrar Sesión Implementado */}
        <div className="p-4 border-t border-[#1e3a5f]">
          <button 
            onClick={async () => {
              if(confirm("¿Estás seguro de que deseas cerrar sesión en el sistema UNIMAR?")) {
                await logout();
              }
            }}
            className="flex w-full items-center gap-3 text-red-400 hover:text-red-300 px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors hover:bg-red-950/20 rounded-lg"
          >
            <LogOut className="h-5 w-5" /> 
            Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior */}
        <header className="bg-white h-20 shadow-sm flex items-center justify-between px-10 border-b border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-[#1e3a5f] font-black text-xl font-serif uppercase tracking-tight">Bienvenido, Administrador</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Universidad de Margarita &bull; Gestión 2026</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="relative hidden lg:block">
              <Bell className="h-6 w-6 text-gray-300" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#d4a843] rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-4 border-l pl-8 border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#1e3a5f] leading-none tracking-tighter text-right">ADMIN_UNIMAR</p>
                <p className="text-[9px] font-bold text-[#d4a843] uppercase mt-1">Status: En Línea</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-[#d4a843]/20">
                <UserCircle className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Zona de Trabajo */}
        <div className="p-10 space-y-10 overflow-y-auto">
          
          {/* Accesos Directos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/admin/reportes" className="group bg-white p-8 rounded-2xl shadow-sm border-b-4 border-[#d4a843] hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-[#d4a843]/10 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-[#d4a843]" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-200 group-hover:text-[#d4a843] transition-colors" />
              </div>
              <h4 className="text-lg font-black text-[#1e3a5f] font-serif uppercase tracking-tight">Estadísticas</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Análisis de promedios y distribución global de becas aprobadas.</p>
            </Link>

            <Link href="/admin/solicitudes" className="group bg-white p-8 rounded-2xl shadow-sm border-b-4 border-[#1e3a5f] hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-[#1e3a5f]/10 rounded-xl">
                  <ClipboardCheck className="h-8 w-8 text-[#1e3a5f]" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-200 group-hover:text-[#1e3a5f] transition-colors" />
              </div>
              <h4 className="text-lg font-black text-[#1e3a5f] font-serif uppercase tracking-tight">Validaciones</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Procesar nuevas solicitudes enviadas por los estudiantes registrados.</p>
            </Link>

            <Link href="/admin/estudiantes" className="group bg-white p-8 rounded-2xl shadow-sm border-b-4 border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-200 group-hover:text-gray-600 transition-colors" />
              </div>
              <h4 className="text-lg font-black text-[#1e3a5f] font-serif uppercase tracking-tight">Estudiantes</h4>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">Directorio completo de alumnos postulados y sus datos de contacto.</p>
            </Link>
          </div>

          {/* Tabla de Datos Reales */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-[#f8fafc] px-10 py-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#d4a843]" />
                <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-[0.2em]">Últimas Solicitudes en el Sistema</h3>
              </div>
              <Link href="/admin/solicitudes" className="text-[10px] font-bold bg-[#1e3a5f] text-white px-4 py-2 rounded-full hover:bg-[#d4a843] transition-colors">
                GESTIONAR TODO
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[#8a9bbd] uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-10 py-5">Postulante</th>
                    <th className="px-10 py-5">Beca Solicitada</th>
                    <th className="px-10 py-5 text-center">Índice Académico</th>
                    <th className="px-10 py-5 text-right">Estado Actual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#d4a843] border-t-transparent"></div>
                        <p className="mt-4 text-xs font-bold text-gray-400 uppercase">Sincronizando con base de datos...</p>
                      </td>
                    </tr>
                  ) : recientes.length > 0 ? (
                    recientes.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-10 py-5">
                          <p className="text-sm font-bold text-[#1e3a5f] uppercase">{s.nombre} {s.apellido}</p>
                          <p className="text-[10px] text-gray-400 font-medium italic leading-none mt-1">Referencia: #{s.id}</p>
                        </td>
                        <td className="px-10 py-5">
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-tighter">{s.tipo_beca}</span>
                        </td>
                        <td className="px-10 py-5 text-center font-black text-[#1e3a5f] text-sm">
                          {s.promedio_notas}
                        </td>
                        <td className="px-10 py-5 text-right">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            s.estatus === 'Pendiente' ? 'bg-orange-100 text-orange-700' : 
                            s.estatus === 'Aprobada' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {s.estatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center text-gray-400 text-xs italic">
                        No hay solicitudes recientes registradas en este periodo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}