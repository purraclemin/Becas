"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { logout } from "@/lib/ActionsAuth"
import { Menu } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen w-full bg-[#eff6ff] selection:bg-[#d4a843]/30 overflow-x-hidden">
      <div className="flex min-h-screen">
        
        {/* SIDEBAR FIJA */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={logout} 
        />

        {/* CONTENEDOR MAESTRO DE CONTENIDO
            - overflow-hidden: Evita que componentes hijos con anchos fijos rompan el layout.
            - md:ml-48: Respeta el ancho de la sidebar.
        */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:ml-48 overflow-hidden">
          
          {/* HEADER MÓVIL */}
          <header className="lg:hidden bg-white px-4 py-3 shadow-sm flex items-center sticky top-0 z-40 border-b border-slate-200 shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-[#1a2744] p-2 rounded-md hover:bg-slate-100 transition-colors"
              >
                  <Menu className="w-6 h-6" />
              </button>
              <span className="ml-3 font-black text-[#1a2744] uppercase text-[10px] tracking-widest">
                Panel Administrativo
              </span>
          </header>

          {/* ÁREA DE TRABAJO UNIFICADA
              - max-w-[1400px]: Establece el límite de ancho para TODAS las páginas.
              - mx-auto: Centra el contenido si la pantalla es muy ancha.
              - p-4 md:p-8: Margen constante para evitar que las páginas se vean de distintos tamaños.
          */}
          <main className="w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col">
            {children}
          </main>

        </div>
      </div>
    </div>
  )
}