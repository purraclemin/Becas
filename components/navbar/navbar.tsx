"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, LogIn, UserPlus } from "lucide-react"
import { getSession } from "@/lib/ActionsSession"
import { UserActions } from "./UserActions"
import { NavMenu } from "./NavMenu"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const sessionData = await getSession()
      setUser(sessionData)
      setLoading(false)
    }
    checkSession()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-sm w-full bg-white">
      {/* Barra Principal (Logo + Menú Integrado + Acciones) */}
      <div className="relative z-20 w-full border-b border-[#e2e8f0]">
        {/* Contenedor ampliado a max-w-[1600px] y padding lateral reducido a lg:px-8 para mayor espacio */}
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-3">
          
          {/* 1. Izquierda: Botón Hamburguesa (Móvil) + Logotipo Institucional */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Botón de Menú Hamburguesa (Visible solo en móvil) */}
            <button 
              className="lg:hidden p-1.5 rounded-lg text-[#1e3a5f] hover:bg-slate-100 transition-colors" 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#1e3a5f] shadow-sm border border-[#d4a843]/30">
                <span className="text-base sm:text-xl font-extrabold text-[#d4a843] font-serif">U</span>
              </div>
              <div>
                <span className="block text-sm sm:text-lg font-extrabold tracking-wide text-[#1e3a5f] font-serif leading-none">UNIMAR</span>
                <span className="block text-[8px] sm:text-[10px] font-medium uppercase tracking-widest text-[#6b7280] mt-0.5">Gestión de Becas</span>
              </div>
            </Link>
          </div>

          {/* 2. Centro: Menú de Navegación Integrado (Escritorio) */}
          <div className="hidden lg:flex flex-1 justify-center px-4">
            <NavMenu mobileOpen={false} setMobileOpen={setMobileOpen} user={user} />
          </div>

          {/* 3. Derecha: Bloque de Acciones y Sesión */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Botones de Sesión */}
            {!loading && (!user || !user.isLoggedIn) && (
              <div className="flex items-center gap-2 animate-in fade-in duration-500">
                <Link 
                  href="/login" 
                  className="hidden sm:flex items-center gap-1 rounded-md border border-[#1e3a5f] px-3 py-1.5 text-xs font-bold text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all"
                >
                  <LogIn className="h-4 w-4" /> <span>Entrar</span>
                </Link>
                <Link 
                  href="/registro" 
                  className="flex items-center gap-1 rounded-md bg-[#d4a843] px-3 py-1.5 text-xs font-bold text-[#1e3a5f] hover:bg-[#c49a3a] shadow-sm transition-all"
                >
                  <UserPlus className="h-4 w-4" /> <span>Registrarse</span>
                </Link>
              </div>
            )}

            {/* Perfil de Usuario */}
            <div className="relative z-30">
              <UserActions user={user} loading={loading} />
            </div>

          </div>
        </div>
      </div>

      {/* Menú Desplegable Compacto para Móviles */}
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-md border-b border-[#e2e8f0] transition-all duration-300 origin-top ${mobileOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 h-0 overflow-hidden"}`}>
        <div className="flex flex-col w-full">
          <NavMenu mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} />
        </div>
      </div>
      
    </header>
  )
}