"use client"

import React, { useState, useEffect, useRef } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { logout } from "@/lib/ActionsAuth"
import { Search, Bell, ShieldCheck, User, Wrench, Globe, LogOut, ChevronDown, Loader2 } from "lucide-react"
import AdminTestPanel from "@/components/admin/AdminTestPanel"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { fetchSolicitudesDesdeDB } from "@/lib/ActionsTodasSolicitudesSQL" // ⚠️ Ajusta esta ruta según donde tengas ubicada tu función server action

interface AdminLayoutProps {
  children: React.ReactNode;
  adminName?: string;
  adminSubtitle?: string;
}

export default function AdminLayout({
  children,
  adminName = "Administrador",
  adminSubtitle = "Unimar Becas",
}: AdminLayoutProps) {
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showTestPanel, setShowTestPanel] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Estados para la búsqueda en tiempo real
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    // Cerrar menús desplegables al hacer clic fuera de ellos
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Efecto de búsqueda en tiempo real con debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([])
      setShowSearchDropdown(false)
      return
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true)
        const result = await fetchSolicitudesDesdeDB({ search: searchQuery.trim(), limit: 5 })
        setSuggestions(result.rows || [])
        setShowSearchDropdown(true)
      } catch (error) {
        console.error("Error al buscar solicitudes:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300) // 300ms de retraso para optimizar consultas

    return () => clearTimeout(timer)
  }, [searchQuery])

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

        {/* CONTENEDOR MAESTRO DE CONTENIDO */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-48'} overflow-hidden pb-16 lg:pb-0`}>
          
          {/* CABECERA SUPERIOR EJECUTIVA (TOP NAVBAR) */}
          <header className="bg-white px-4 md:px-6 h-16 shadow-sm flex items-center justify-between sticky top-0 z-40 border-b border-slate-200 shrink-0">
              
              {/* Sección Izquierda: Identidad móvil, Buscador Global con Dropdown y Botón DevPanel */}
              <div className="flex items-center gap-3 flex-1">
                  <span className="lg:hidden font-black text-[#1a2744] uppercase text-[10px] tracking-widest">
                    Unimar Admin
                  </span>
                  
                  {/* Buscador Integrado con Coincidencias en Tiempo Real */}
                  <div className="hidden md:flex items-center gap-3 w-full max-w-sm relative" ref={searchContainerRef}>
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                          if (suggestions.length > 0) setShowSearchDropdown(true)
                        }}
                        placeholder="Buscar por cédula o nombre..." 
                        className="w-full pl-9 pr-9 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] focus:bg-white transition-all shadow-sm"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />
                      )}
                    </div>

                    {/* Menú Desplegable de Coincidencias */}
                    {showSearchDropdown && suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="px-3 py-1.5 border-b border-slate-100 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Resultados encontrados ({suggestions.length})
                        </div>
                        {suggestions.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setShowSearchDropdown(false)
                              setSearchQuery("")
                              // Redirige a la vista de validación o filtra pasando el parámetro correspondiente
                              router.push(`/admin/validarBeca?search=${encodeURIComponent(item.cedula)}`)
                            }}
                            className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none transition-colors group flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-[#1a2744] group-hover:text-[#1e3a5f]">
                                {item.nombre} {item.apellido}
                              </p>
                              <p className="text-[10px] text-slate-500 font-medium">
                                Cédula: <span className="font-semibold text-slate-700">V-{item.cedula}</span> • <span className="text-slate-400">{item.carrera}</span>
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-slate-100 group-hover:bg-[#1e3a5f] group-hover:text-white rounded-md text-[9px] font-bold uppercase tracking-wider transition-colors">
                              {item.estatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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

              {/* Sección Derecha: Indicadores y Perfil Corporativo con Menú Desplegable */}
              <div className="flex items-center gap-3 md:gap-5 justify-end">
                  
                  {/* Badge de Estado del Sistema */}
                  <div className="hidden sm:flex items-center gap-1.5 px-3 h-7 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">En Línea</span>
                  </div>

                  {/* Icono de Notificaciones 
                  <button className="relative p-2 text-slate-400 hover:bg-slate-50 hover:text-[#1a2744] rounded-full transition-colors">
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                  </button>*/}

                  <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                  {/* Perfil del Usuario Administrador con Menú Desplegable */}
                  <div className="relative" ref={menuRef}>
                    <div 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-3 cursor-pointer group select-none py-1"
                    >
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-bold text-[#1a2744] group-hover:text-[#d4a843] transition-colors leading-tight">
                          {adminName}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
                          {adminSubtitle}
                        </span>
                      </div>
                      
                      {/* Avatar Corporativo con indicador de despliegue */}
                      <div className="relative h-8 w-8 md:h-9 md:w-9 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-[#d4a843] shadow-sm border border-slate-200 group-hover:border-[#d4a843] transition-all">
                        <User className="w-4 h-4 md:w-4 md:h-4" />
                        <ChevronDown className={`absolute -bottom-1 -right-1 w-3 h-3 bg-white text-slate-600 rounded-full border border-slate-200 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Menú Desplegable Estilizado */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                          <p className="text-xs font-bold text-[#1a2744]">{adminName}</p>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest">{adminSubtitle}</p>
                        </div>
                        
                        <Link 
                          href="/" 
                          onClick={() => setIsUserMenuOpen(false)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1e3a5f] transition-colors"
                        >
                          <Globe className="w-4 h-4 text-[#d4a843]" />
                          Ir al portal web
                        </Link>

                        <div className="h-px bg-slate-100 my-1"></div>

                        <button 
                          onClick={() => {
                            setIsUserMenuOpen(false)
                            logout()
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Salir
                        </button>
                      </div>
                    )}
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