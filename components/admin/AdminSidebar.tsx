"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Settings, BarChart3, Users, ClipboardCheck, 
  LogOut, X, Clock, ClipboardList, type LucideIcon 
} from "lucide-react"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

interface SidebarLink {
  href: string
  label: string
  icon: LucideIcon
}

export function AdminSidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname()

  const links: SidebarLink[] = [
    { href: "/admin/dashboard", label: "Inicio", icon: Settings },
    { href: "/admin/actividad", label: "Actividad", icon: Clock },
    { href: "/admin/solicitudes", label: "Validar Becas", icon: ClipboardCheck },
    { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
    { href: "/admin/estudiantes", label: "Estudiantes", icon: Users },
    { href: "/admin/estudio-socioeconomico", label: "Socioeconómico", icon: ClipboardList },
  ]

  // Lógica de navegación y cierre
  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    // Cerramos el sidebar en dispositivos móviles/tablets
    if (window.innerWidth < 1024) { 
      onClose();
    }

    // Si es el link actual, forzamos recarga
    if (pathname === href) {
      e.preventDefault(); 
      window.location.href = href; 
    }
  }

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1a2744] text-white flex flex-col shadow-2xl transition-transform duration-300 h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:fixed lg:inset-y-0
      `}>
        
        {/* HEADER */}
        <div className="h-16 flex items-center px-6 border-b border-[#1e3a5f]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] border border-[#d4a843]/30 shadow-inner">
              <span className="text-sm font-black text-[#d4a843]">U</span>
            </div>
            <div className="leading-none">
               <p className="font-bold text-xs uppercase tracking-wider text-white">Panel</p>
               <p className="text-[9px] text-[#8a9bbd] uppercase tracking-widest">Control</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-[#8a9bbd] hover:text-white p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* CONTENEDOR DE NAVEGACIÓN SCROLLABLE */}
        <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar mt-2 flex flex-col">
          {/* Listado de Enlaces */}
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)} 
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all group
                    ${isActive 
                      ? "bg-[#d4a843] text-[#1a2744] shadow-md shadow-[#d4a843]/10 translate-x-1" 
                      : "text-[#8a9bbd] hover:text-white hover:bg-white/5 hover:translate-x-1"
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#1a2744]" : "text-[#d4a843] group-hover:text-white"} transition-colors`} /> 
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* BOTÓN CERRAR SESIÓN: 
              Ahora está dentro del flujo del nav, justo abajo del último enlace.
          */}
          <div className="mt-8 pt-4 border-t border-[#1e3a5f]/50 mb-10">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
                onLogout();
              }} 
              className="flex w-full items-center justify-center gap-2 text-rose-400/80 hover:text-rose-300 px-4 py-3 text-[10px] font-black uppercase hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="h-4 w-4" /> Cerrar Sesión
            </button>
          </div>
        </nav>
      </aside>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-[2px]" 
          onClick={onClose}
        ></div>
      )}
    </>
  )
}