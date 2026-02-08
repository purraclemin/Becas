"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, User, LayoutDashboard, LogOut } from "lucide-react"
import { logout } from "@/lib/ActionsLogout"

interface UserActionsProps {
  user: any
  loading: boolean
}

export function UserActions({ user, loading }: UserActionsProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

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

  // Lógica de Colores mejorada
  const getStatusStyles = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-500 border-gray-200"
    
    const s = status.toLowerCase().trim()
    
    if (s === 'aprobada') return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (s === 'rechazada') return "bg-red-50 text-red-700 border-red-200"
    if (s.includes('revisión') || s.includes('revision')) return "bg-blue-50 text-blue-700 border-blue-200"
    if (s === 'pendiente') return "bg-amber-50 text-amber-700 border-amber-200"
    
    return "bg-gray-50 text-gray-600 border-gray-200"
  }

  // Recuperamos el estatus de cualquiera de las dos propiedades posibles
  const userStatus = user?.estatus || user?.status || null;

  if (loading) return null

  return (
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
                    <p className="text-sm font-black text-[#1e3a5f] uppercase leading-tight truncate">
                      {user.nombre || "Estudiante Unimar"}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase truncate">
                      {user.carrera || "Carrera no especificada"}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 mt-2">
                       {/* TRIMESTRE */}
                       <span className="text-[9px] text-[#1e3a5f] font-medium uppercase border border-gray-200 bg-white px-2 py-0.5 rounded-full">
                         {user.trimestre || user.semestre || "0"}° Trim.
                       </span>
                       
                       {/* ESTATUS DE SOLICITUD */}
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusStyles(userStatus)}`}>
                         {userStatus || "Sin Solicitud"}
                       </span>
                    </div>
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
  )
}