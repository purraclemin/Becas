"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { User, LayoutDashboard, LogOut, LogIn, UserPlus } from "lucide-react"
import { logout } from "@/lib/ActionsAuth"

interface UserActionsProps {
  user: any
  loading: boolean
}

export function UserActions({ user, loading }: UserActionsProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Lógica para cerrar el menú al hacer clic en cualquier lado de la página
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setIsProfileOpen(false)
      window.location.href = "/" 
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      window.location.href = "/" 
    }
  }

  const getStatusStyles = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-500 border-gray-200"
    const s = status.toLowerCase().trim()
    if (s === 'aprobada') return "bg-emerald-50 text-emerald-700 border-emerald-200 font-black"
    if (s === 'rechazada') return "bg-red-50 text-red-700 border-red-200 font-black"
    if (s.includes('revisión') || s.includes('revision')) return "bg-blue-50 text-blue-700 border-blue-200 font-black animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]"
    if (s === 'pendiente') return "bg-amber-50 text-amber-700 border-amber-200 font-black"
    return "bg-gray-50 text-gray-600 border-gray-200 font-black"
  }

  const userStatus = user?.estatus || user?.status || null;
  const isRevision = userStatus?.toLowerCase().includes('revisión') || userStatus?.toLowerCase().includes('revision');

  if (loading) return null

  return (
    <div ref={menuRef}>
      {!user || !user.isLoggedIn ? (
        <div className="flex items-center gap-2 animate-in fade-in duration-500">
          <Link href="/login" className="flex items-center gap-1 rounded-md border border-[#1e3a5f] px-3 py-1.5 text-[10px] font-bold text-[#1e3a5f] hover:bg-gray-50 transition-all">
            <LogIn className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Entrar</span>
          </Link>
          <Link href="/registro" className="flex items-center gap-1 rounded-md bg-[#d4a843] px-3 py-1.5 text-[10px] font-bold text-[#1e3a5f] hover:bg-[#c49a3a] shadow-sm transition-all">
            <UserPlus className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Registrarse</span>
          </Link>
        </div>
      ) : (
        <div className="relative flex items-center gap-2 md:gap-3 animate-in fade-in duration-300">
          
          {/* Información Detallada Lateral entre dos líneas negras (Visible en Web y Móvil) */}
          {!isProfileOpen && (
            <div className="flex flex-col items-end text-right select-none border-y border-black py-0.5 px-1 md:px-1.5 min-w-[95px] md:min-w-[125px]">
              <p className="text-[6px] md:text-[8px] font-bold text-[#d4a843] uppercase tracking-[0.05em] leading-tight">
                Nivel: {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
              </p>
              <p className="text-[10px] md:text-[11px] font-black text-[#1e3a5f] uppercase leading-none my-0.5 truncate max-w-[85px] md:max-w-none">
                {user.nombre}
              </p>
              {user.role === 'estudiante' && (
                <>
                  <p className="text-[6px] md:text-[8px] text-gray-500 font-bold uppercase leading-tight truncate max-w-[85px] md:max-w-none">
                    {user.carrera}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[6px] md:text-[7px] text-[#1e3a5f] font-black uppercase bg-gray-100 px-1 py-0.5 rounded leading-none">
                      {user.trimestre || "0"}° Trim.
                    </span>
                    <div className="flex items-center gap-0.5">
                      {isRevision && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
                        </span>
                      )}
                      <span className={`text-[6px] md:text-[7px] uppercase px-1 py-0.5 rounded border ${getStatusStyles(userStatus)}`}>
                        {userStatus || "Pendiente"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Botón de Perfil (Solo Icono según lo solicitado) */}
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#1e3a5f] text-[#d4a843] border-2 border-transparent hover:border-[#d4a843] transition-all shadow-md shrink-0"
          >
            <User className="h-5 w-5 md:h-6 md:w-6" />
          </button>

          {/* Menú Desplegable Compacto */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 md:w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in duration-200">
              <div className="px-5 py-3 border-b border-gray-100 mb-2 bg-[#f8fafb] rounded-t-xl text-center">
                <p className="text-[10px] font-black text-[#d4a843] uppercase tracking-widest mb-1">
                  Nivel: {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                </p>
                <p className="text-sm font-black text-[#1e3a5f] uppercase truncate">
                  {user.nombre}
                </p>
                {user.role === 'estudiante' && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <span className="text-[8px] md:text-[9px] text-[#1e3a5f] font-medium uppercase border border-gray-200 bg-white px-2 py-0.5 rounded-full">
                       {user.trimestre || "0"}° Trim.
                     </span>
                     <span className={`text-[8px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusStyles(userStatus)}`}>
                       {userStatus || "Sin Solicitud"}
                     </span>
                  </div>
                )}
              </div>

              <div className="px-2 space-y-1">
                <Link 
                  href={user.role === 'admin' ? '/admin/dashboard' : '/Solicitud'} 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-[#1e3a5f] hover:bg-gray-50 rounded-lg font-bold transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-[#d4a843]" /> 
                  {user.role === 'estudiante' ? 'Solicitud' : 'Dashboard'}
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
    </div>
  )
}