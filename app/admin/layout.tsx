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

  // Solo para asegurar que el cliente esté montado
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    /* BLOQUEO DE ANCHO:
       - w-full y max-w-full junto con overflow-x-hidden evitan que la página 
         "baile" o permita zoom negativo si hay contenido ancho dentro.
    */
    <div className="flex min-h-screen bg-[#eff6ff] w-full max-w-full overflow-x-hidden selection:bg-[#d4a843]/30">
      
      <div className="flex-1 flex min-h-screen relative w-full max-w-full">
        
        {/* 1. SIDEBAR: Mantener lógica original */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={logout} 
        />

        {/* 2. CONTENIDO PRINCIPAL: 
            - md:ml-56 para respetar tu diseño de escritorio.
            - min-w-0 es VITAL: permite que el contenedor sepa que puede ser más pequeño 
              que su contenido interno (obligando a las tablas a scrollear).
        */}
        <div className="flex-1 flex flex-col relative z-0 md:ml-56 min-w-0 max-w-full transition-all duration-300">
          
          {/* HEADER MÓVIL (Solo visible < 768px) */}
          <header className="md:hidden bg-white px-4 py-3 shadow-sm flex items-center sticky top-0 z-40 border-b border-slate-200 shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-[#1a2744] p-2 rounded-md hover:bg-slate-100 transition-colors"
              >
                  <Menu className="w-6 h-6" />
              </button>
              <span className="ml-3 font-black text-[#1a2744] uppercase text-[10px] tracking-widest">
                Menú de Navegación
              </span>
          </header>

          {/* 3. ÁREA DE TRABAJO:
              - max-w-full y overflow-x-hidden aquí también para asegurar 
                que el 'children' no rompa el contenedor.
          */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 lg:px-12 overflow-x-hidden md:overflow-x-visible">
            {children}
          </main>

          {/* ELIMINADO: Botón flotante de Modo Oscuro */}

        </div>
      </div>
    </div>
  )
}