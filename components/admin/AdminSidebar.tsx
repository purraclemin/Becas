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

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (window.innerWidth < 768) onClose();
    if (pathname === href) {
      e.preventDefault(); 
      window.location.href = href; 
    }
  }

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-[#1a2744] text-white flex flex-col shadow-2xl transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:fixed md:inset-y-0
      `}>
        
        {/* HEADER MÁS COMPACTO */}
        <div className="h-16 flex items-center px-6 border-b border-[#1e3a5f]/50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] border border-[#d4a843]/30 shadow-inner">
              <span className="text-sm font-black text-[#d4a843]">U</span>
            </div>
            <div className="leading-none">
               <p className="font-bold text-xs uppercase tracking-wider text-white">Panel</p>
               <p className="text-[9px] text-[#8a9bbd] uppercase tracking-widest">Control</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden ml-auto text-[#8a9bbd] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVEGACIÓN ESTILIZADA */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar mt-2">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={(e) => handleClick(e, link.href)} 
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
        </nav>

        {/* FOOTER MÁS LIMPIO */}
        <div className="p-3 border-t border-[#1e3a5f]/50 bg-[#15203b]">
          <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 text-rose-400/80 hover:text-rose-300 px-4 py-2 text-[10px] font-black uppercase hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20">
            <LogOut className="h-4 w-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-[2px]" onClick={onClose}></div>
      )}
    </>
  )
}