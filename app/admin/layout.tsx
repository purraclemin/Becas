"use client"

import React, { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { logout } from "@/lib/ActionsAuth"
import { Menu, Sun, Moon } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evita errores de hidratación asegurando que renderizamos solo en cliente
  useEffect(() => {
    setMounted(true)
    // Recuperar preferencia del usuario si existe (opcional)
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") setIsDarkMode(true)
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
  }

  if (!mounted) return null

  return (
    /* LA CLAVE: Agregamos la clase 'dark' al contenedor padre si el estado es true.
      Esto activa todas las clases 'dark:...' en tus componentes hijos.
    */
    <div className={`${isDarkMode ? 'dark' : ''} flex min-h-screen`}>
      
      {/* FONDO BASE:
          - Claro: bg-[#eff6ff] (Un tono gris-azulado mate, menos brillante que el blanco)
          - Oscuro: dark:bg-[#0f172a] (Azul noche profundo)
          - Texto: text-slate-600 (Gris oscuro suave, no negro puro)
      */}
      <div className="flex-1 flex min-h-screen transition-colors duration-300 bg-[#eff6ff] dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        
        {/* 1. SIDEBAR */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onLogout={logout} 
        />

        {/* 2. CONTENIDO PRINCIPAL */}
        <div className="transition-all duration-300 md:ml-56 flex-1 flex flex-col relative z-0">
          
          {/* HEADER MÓVIL (Solo visible < 768px) */}
          <header className="md:hidden bg-white dark:bg-[#1e293b] px-4 py-3 shadow-sm flex items-center sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="text-[#1a2744] dark:text-white p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                  <Menu className="w-5 h-5" />
              </button>
              <span className="ml-3 font-bold text-[#1a2744] dark:text-white uppercase text-xs tracking-widest">Menú</span>
          </header>

          {/* 3. ÁREA DE TRABAJO */}
          <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 md:p-8 lg:px-12">
            {children}
          </main>

          {/* BOTÓN FLOTANTE DE TEMA (Sol / Luna) */}
          <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-2xl border transition-all duration-300
              bg-white text-amber-500 border-amber-200 hover:scale-110 hover:shadow-amber-100
              dark:bg-[#1e293b] dark:text-[#d4a843] dark:border-[#d4a843]/30 dark:hover:shadow-[#d4a843]/20"
            title="Cambiar Modo"
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>

        </div>
      </div>
    </div>
  )
}