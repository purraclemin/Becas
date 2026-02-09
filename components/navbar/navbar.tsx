"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Phone, Mail, Facebook, Instagram, Menu, X } from "lucide-react"
import { getSession } from "@/lib/ActionsSession"
import { UserActions } from "./UserActions"
import { NavMenu } from "./NavMenu"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Verificación de sesión al cargar
  useEffect(() => {
    async function checkSession() {
      const sessionData = await getSession()
      setUser(sessionData)
      setLoading(false)
    }
    checkSession()
  }, [])

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      {/* Barra superior azul */}
      <div className="bg-[#1a2744] text-xs text-[#8a9bbd]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <div className="hidden items-center gap-4 sm:flex">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> 0412.102.2538</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> becas@unimar.edu.ve</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Facebook className="h-3.5 w-3.5 hover:text-white transition-colors cursor-pointer" />
            <Instagram className="h-3.5 w-3.5 hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Barra Blanca de Logo y Acciones */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:py-3">
          
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#1e3a5f] shadow-md border-2 border-[#d4a843]/20">
              <span className="text-lg sm:text-2xl font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <div>
              <span className="block text-sm sm:text-xl font-extrabold tracking-wide text-[#1e3a5f] font-serif leading-none">UNIMAR</span>
              <span className="block text-[9px] sm:text-[11px] font-medium uppercase tracking-widest text-[#6b7280] mt-1">Gestión de Becas</span>
            </div>
          </Link>

          {/* Bloque de Acciones y Menú alineados de derecha a izquierda */}
          <div className="flex items-center flex-row-reverse gap-1 sm:gap-3">
            
            {/* 1. Botón de Menú Hamburguesa Principal (Derecha) */}
            <button 
              className="lg:hidden p-1.5 rounded-lg bg-[#f8fafb] border border-[#e2e8f0] text-[#1e3a5f] transition-colors" 
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* 2. Línea Vertical Separadora (Solo en móvil) */}
            <div className="lg:hidden h-8 w-[1px] bg-black/10 mx-1" />

            {/* 3. Componente de Acciones e Información (Izquierda) */}
            <UserActions user={user} loading={loading} />
            
          </div>
        </div>
      </div>

      {/* Menú azul de navegación */}
      <NavMenu mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} />
      
    </header>
  )
}