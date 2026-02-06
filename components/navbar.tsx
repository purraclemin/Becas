"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Menu, 
  X, 
  ChevronDown, 
  Facebook, 
  Instagram, 
  Mail, 
  Phone,
  User,
  LogOut,
  LayoutDashboard
} from "lucide-react"
import { getSession } from "@/lib/ActionsSession"
import { logout } from "@/lib/Actionslogout"

const navLinks = [
  { label: "Inicio", href: "/" },
  {
    label: "Becas",
    href: "/becas",
    children: [
      { label: "Beca Academica", href: "/becas" },
      { label: "Beca Socioeconomica", href: "/becas" },
      { label: "Beca Deportiva", href: "/becas" },
      { label: "Beca a la Excelencia", href: "/becas" },
    ],
  },
  { label: "Requisitos", href: "/requisitos" },
  { label: "Proceso", href: "/proceso" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/servicios#contacto" },
  { label: "Solicitudes", href: "/Solicitud" },
  { label: "Solicitud Enviada", href: "/solicitud-enviada" },
  { label: "RE", href: "/admin/Reportes" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Verificación de sesión al cargar
  useEffect(() => {
    async function checkSession() {
      const sessionData = await getSession()
      setUser(sessionData)
      setLoading(false) // Finaliza la carga
    }
    checkSession()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setUser({ isLoggedIn: false })
      setIsProfileOpen(false)
      window.location.replace("/") 
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      window.location.href = "/" 
    }
  }

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a5f] shadow-md border-2 border-[#d4a843]/20">
              <span className="text-2xl font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <div>
              <span className="block text-xl font-extrabold tracking-wide text-[#1e3a5f] font-serif">UNIMAR</span>
              <span className="block text-[11px] font-medium uppercase tracking-widest text-[#6b7280]">Gestión de Becas</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* Mientras carga no mostramos nada para evitar parpadeos */}
            {!loading && (
              <>
                {!user || !user.isLoggedIn ? (
                  <div className="hidden items-center gap-3 md:flex animate-in fade-in duration-500">
                    <Link href="/login" className="rounded-md border border-[#1e3a5f] px-5 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all">
                      Iniciar Sesión
                    </Link>
                    <Link href="/registro" className="rounded-md bg-[#d4a843] px-5 py-2 text-sm font-semibold text-[#1e3a5f] hover:bg-[#c49a3a] shadow-sm transition-all">
                      Registrarse
                    </Link>
                  </div>
                ) : (
                  <div className="relative animate-in fade-in duration-300">
                    <button 
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 bg-[#f8fafb] border border-[#e2e8f0] p-2 rounded-lg hover:border-[#d4a843] transition-all"
                    >
                      <Menu className="h-6 w-6 text-[#1e3a5f]" />
                      <div className="h-8 w-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-[#d4a843]">
                        <User className="h-5 w-5" />
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in duration-200">
                        <div className="px-5 py-3 border-b border-gray-100 mb-2 bg-[#f8fafb] rounded-t-xl text-center">
                          <p className="text-[10px] font-black text-[#d4a843] uppercase tracking-widest mb-1">
                            Nivel: {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                          </p>
                          
                          {user.role === 'estudiante' ? (
                            <>
                              <p className="text-sm font-black text-[#1e3a5f] uppercase leading-tight">
                                {user.nombre || "Estudiante Unimar"}
                              </p>
                              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
                                {user.carrera || "Carrera no especificada"}
                              </p>
                              <p className="text-[9px] text-[#1e3a5f] font-medium mt-1 uppercase">
                                {user.trimestre || "0"}° Trimestre
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-black text-[#1e3a5f] uppercase">Usuario Administrativo</p>
                          )}
                        </div>

                        <div className="px-2 space-y-1">
                          <Link 
                            href={user.role === 'admin' ? '/admin/dashboard' : '/Solicitud'} 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#1e3a5f] hover:bg-gray-50 rounded-lg font-bold transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-[#d4a843]" /> Dashboard
                          </Link>
                          
                          <Link 
                            href="/perfil" 
                            className="flex items-center gap-3 px-4 py-2 text-sm text-[#1e3a5f] hover:bg-gray-50 rounded-lg font-bold transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <User className="h-4 w-4 text-[#d4a843]" /> Mi Perfil
                          </Link>
                        </div>

                        <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                          <button 
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-black uppercase transition-colors"
                          >
                            <LogOut className="h-4 w-4" /> Cerrar Sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            <button className="lg:hidden text-[#1e3a5f]" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú azul de navegación */}
      <nav className="bg-[#1e3a5f] hidden lg:block">
        <div className="mx-auto flex max-w-7xl items-center px-4">
          <ul className="flex items-center">
            {navLinks.map((link) => (
              <li key={link.label} className="relative group">
                {link.children ? (
                  <div onMouseEnter={() => setOpenDropdown(link.label)} onMouseLeave={() => setOpenDropdown(null)}>
                    <button className="flex items-center gap-1 px-4 py-3.5 text-sm font-medium text-[#c7d4e6] hover:text-white border-b-2 border-transparent hover:border-[#d4a843]">
                      {link.label} <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    {openDropdown === link.label && (
                      <div className="absolute left-0 top-full z-50 min-w-[220px] bg-white shadow-xl py-1 border border-gray-100">
                        {link.children.map((child) => (
                          <Link key={child.label} href={child.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={link.href} className="block px-4 py-3.5 text-sm font-medium text-[#c7d4e6] hover:text-white border-b-2 border-transparent hover:border-[#d4a843]">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}