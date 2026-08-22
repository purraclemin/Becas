"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { logout } from "@/lib/ActionsAuth"
import { Search, Bell, ShieldCheck, User, Wrench } from "lucide-react"
import AdminTestPanel from "@/components/admin/AdminTestPanel"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showTestPanel, setShowTestPanel] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] selection:bg-[#d4a843]/30 overflow-x-hidden font-sans text-slate-800">
      <div className="flex min-h-screen">
        
        {/* NAVEGACIÓN GLOBAL (SIDEBAR / BOTTOM NAV) */}
        <AdminSidebar 
          onLogout={logout} 
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        />

        {/* CONTENEDOR MAESTRO DE CONTENIDO (Se ajusta dinámicamente según el estado del sidebar) */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-48'} overflow-hidden pb-16 lg:pb-0`}>
          
          {/* CABECERA SUPERIOR EJECUTIVA (TOP NAVBAR) */}
          <header className="bg-white px-4 md:px-6 h-16 shadow-sm flex items-center justify-between sticky top-0 z-40 border-b border-slate-200 shrink-0">
              
              {/* Sección Izquierda: Identidad móvil, Buscador Global y Botón DevPanel */}
              <div className="flex items-center gap-3 flex-1">
                  <span className="lg:hidden font-black text-[#1a2744] uppercase text-[10px] tracking-widest">
                    Unimar Admin
                  </span>
                  
                  {/* Buscador Integrado - Visible en Desktop */}
                  <div className="hidden md:flex items-center gap-3 w-full max-w-sm">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Buscar en el panel de administración..." 
                        className="w-full pl-9 pr-4 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Botón para alternar el Panel de Pruebas / Desarrollador */}
                  <button 
                    onClick={() => setShowTestPanel(!showTestPanel)}
                    className={`flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-black uppercase tracking-wider transition-all border shrink-0 shadow-xs ${
                      showTestPanel 
                        ? "bg-[#1a2744] text-white border-[#1a2744]" 
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                    title="Alternar Modo Desarrollador"
                  >
                    <Wrench className="w-3.5 h-3.5 text-[#d4a843]" />
                    <span className="hidden xl:inline">Dev Panel</span>
                  </button>
              </div>

              {/* Sección Derecha: Indicadores y Perfil Corporativo */}
              <div className="flex items-center gap-3 md:gap-5 justify-end">
                  
                  {/* Badge de Estado del Sistema */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 h-7 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">En Línea</span>
                  </div>

                  {/* Icono de Notificaciones */}
                  <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-[#1a2744] rounded-full transition-colors">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                  </button>

                  <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                  {/* Perfil del Usuario Administrador */}
                  <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-xs font-bold text-[#1a2744] group-hover:text-[#d4a843] transition-colors leading-tight">Administrador</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">Unimar Becas</span>
                    </div>
                    {/* Avatar Corporativo */}
                    <div className="h-8 w-8 md:h-9 md:w-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-[#d4a843] shadow-sm border border-slate-200 group-hover:border-[#d4a843] transition-all">
                      <User className="w-4 h-4 md:w-4 md:h-4" />
                    </div>
                  </div>

              </div>
          </header>

          {/* PANEL DE DESARROLLADOR DESPLEGABLE GLOBAL */}
          {showTestPanel && (
            <div className="w-full max-w-[1400px] mx-auto px-2 md:px-6 lg:px-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <AdminTestPanel />
            </div>
          )}

          {/* ÁREA DE TRABAJO UNIFICADA */}
          <main className="w-full max-w-[1400px] mx-auto px-4 py-3 md:px-6 lg:px-8 flex flex-col flex-1 relative">
            {children}
          </main>

        </div>
      </div>
    </div>
  )
}