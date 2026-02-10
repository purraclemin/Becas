"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { User, LayoutDashboard, LogOut } from "lucide-react"
import { logout } from "@/lib/ActionsAuth"

interface UserActionsProps {
  user: any
  loading: boolean
}

export function UserActions({ user, loading }: UserActionsProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // 🟢 LÓGICA DE ESTILOS DINÁMICOS PARA EL BADGE
  const getStatusStyles = (status: string) => {
    if (!status) return "bg-gray-50 text-gray-400 border-gray-100 font-black"
    const s = status.toLowerCase().trim()
    
    // 1. ESTADOS FIJOS
    if (s === 'aprobada' || s === 'aprobado') return "bg-emerald-50 text-emerald-700 border-emerald-200 font-black"
    if (s === 'rechazada' || s === 'rechazado') return "bg-red-50 text-red-700 border-red-200 font-black"
    
    // 2. ESTADOS TITILANTES (ANIMATE-PULSE)
    // Revisión Especial (Naranja)
    if (s.includes('especial')) {
      return "bg-orange-50 text-orange-700 border-orange-200 font-black animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.2)]"
    }
    // En Revisión (Azul)
    if (s.includes('revisión') || s.includes('revision')) {
      return "bg-blue-50 text-blue-700 border-blue-200 font-black animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.2)]"
    }
    // Pendiente (Amarillo)
    if (s === 'pendiente') {
      return "bg-amber-50 text-amber-700 border-amber-200 font-black animate-pulse shadow-[0_0_8px_rgba(212,168,67,0.2)]"
    }
    
    return "bg-gray-50 text-gray-600 border-gray-100 font-black"
  }

  const userStatus = user?.estatus || user?.status || null;
  const s = userStatus?.toLowerCase().trim() || '';
  
  // Determinamos si debe mostrar el punto titilante
  const shouldPulse = s === 'pendiente' || s.includes('revisión') || s.includes('revision');
  
  // Colores dinámicos para el punto titilante
  const dotColor = s.includes('especial') ? 'bg-orange-600' : 
                   (s.includes('revisión') || s.includes('revision')) ? 'bg-blue-600' :
                   s === 'pendiente' ? 'bg-amber-600' : 'bg-gray-400';

  const dotPingColor = s.includes('especial') ? 'bg-orange-400' : 
                       (s.includes('revisión') || s.includes('revision')) ? 'bg-blue-400' :
                       s === 'pendiente' ? 'bg-amber-400' : 'bg-gray-300';

  if (loading || !user || !user.isLoggedIn) return null

  return (
    <div ref={menuRef} className="relative">
      <div className="flex items-center gap-2 md:gap-3 animate-in fade-in duration-300">
        
        {!isProfileOpen && (
          <div className="flex flex-col items-end text-right select-none border-y border-black py-0.5 px-1 md:px-1.5 min-w-[95px] md:min-w-[125px]">
            <p className="text-[6px] md:text-[8px] font-bold text-[#d4a843] uppercase tracking-[0.05em] leading-tight">
               {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
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
                    {user.trimestre || "0"}° Trimestre.
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {/* 🟢 PUNTO TITILANTE CON COLOR DINÁMICO */}
                    {shouldPulse && (
                      <span className="relative flex h-1.5 w-1.5">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotPingColor} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
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

        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-full bg-[#1e3a5f] text-[#d4a843] border border-[#d4a843]/30 hover:border-[#d4a843] transition-all shadow-md active:scale-95 shrink-0"
        >
          <User className="h-4.5 w-4.5 md:h-5 md:w-5" />
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 md:w-56 bg-white rounded-lg shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-[#e2e8f0] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-3 py-2.5 bg-[#f8fafb] border-b border-[#e2e8f0] text-center">
              <p className="text-[8px] font-black text-[#d4a843] uppercase tracking-[0.1em] mb-0.5">
                 {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
              </p>
              <p className="text-[11px] font-black text-[#1e3a5f] uppercase leading-tight truncate">
                {user.nombre}
              </p>
              {user.role === 'estudiante' && (
                <div className="mt-1.5 space-y-1">
                  <p className="text-[9px] text-gray-500 font-bold uppercase truncate px-2">
                    {user.carrera}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    <span className="text-[8px] text-[#1e3a5f] font-bold uppercase bg-white border border-[#e2e8f0] px-1.5 py-0.5 rounded">
                      {user.trimestre || "0"}° Trim.
                    </span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${getStatusStyles(userStatus)}`}>
                      {userStatus || "Pendiente"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-1.5 space-y-0.5">
              <Link 
                href={user.role === 'admin' ? '/admin/dashboard' : '/Solicitud'} 
                className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-[#1e3a5f] hover:bg-[#f1f5f9] rounded-md font-bold transition-colors group"
                onClick={() => setIsProfileOpen(false)}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-[#d4a843] group-hover:scale-110 transition-transform" /> 
                {user.role === 'estudiante' ? 'Solicitud' : 'Dashboard'}
              </Link>
              <Link 
                href="/perfil" 
                className="flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-[#1e3a5f] hover:bg-[#f1f5f9] rounded-md font-bold transition-colors group"
                onClick={() => setIsProfileOpen(false)}
              >
                <User className="h-3.5 w-3.5 text-[#d4a843] group-hover:scale-110 transition-transform" /> Mi Perfil
              </Link>
            </div>

            <div className="px-1.5 pb-1.5 pt-0.5">
              <button 
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-[10px] text-red-600 hover:bg-red-50 rounded-md font-black uppercase transition-colors border-t border-gray-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}