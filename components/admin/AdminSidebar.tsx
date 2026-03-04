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
    { href: "/admin/analiticas", label: "Analíticas", icon: BarChart3 },
    { href: "/admin/estudiantes", label: "Estudiantes", icon: Users },
    { href: "/admin/estudio-socioeconomico", label: "Socioeconómico", icon: ClipboardList },
    { href: "/admin/reportes", label: "Reportes", icon: ClipboardList },
  ]

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (window.innerWidth < 1024) { 
      onClose();
    }

    if (pathname === href) {
      e.preventDefault(); 
      window.location.href = href; 
    }
  }

  return (
    <>
      {/* ASIDE FIJO Y REDUCIDO:
          - 'w-48' reduce el ancho original.
          - 'fixed' y 'h-screen' lo mantienen anclado.
          - 'z-[100]' asegura que esté sobre el contenido escalado.
      */}
      <aside className={`
        fixed top-0 left-0 z-[100] w-48 bg-[#1a2744] text-white flex flex-col shadow-2xl transition-transform duration-300 h-screen
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0
      `}>
        
        {/* HEADER REDUCIDO */}
        <div className="h-14 flex items-center px-4 border-b border-[#1e3a5f]/50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] border border-[#d4a843]/30 shadow-inner">
              <span className="text-xs font-black text-[#d4a843]">U</span>
            </div>
            <div className="leading-none">
               <p className="font-bold text-[10px] uppercase tracking-wider text-white">Panel</p>
               <p className="text-[8px] text-[#8a9bbd] uppercase tracking-widest">Control</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden ml-auto text-[#8a9bbd] hover:text-white p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENEDOR DE NAVEGACIÓN */}
        <nav className="flex-1 p-2 overflow-y-auto custom-scrollbar mt-2 flex flex-col">
          <div className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)} 
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all group
                    ${isActive 
                      ? "bg-[#d4a843] text-[#1a2744] shadow-md shadow-[#d4a843]/10 translate-x-1" 
                      : "text-[#8a9bbd] hover:text-white hover:bg-white/5 hover:translate-x-1"
                    }
                  `}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#1a2744]" : "text-[#d4a843] group-hover:text-white"} transition-colors`} /> 
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-[#1e3a5f]/50 mb-6">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
                onLogout();
              }} 
              className="flex w-full items-center justify-center gap-2 text-rose-400/80 hover:text-rose-300 px-3 py-2.5 text-[9px] font-black uppercase hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </nav>
      </aside>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden backdrop-blur-[2px]" 
          onClick={onClose}
        ></div>
      )}
    </>
  )
}