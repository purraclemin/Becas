"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Settings, BarChart3, Users, ClipboardCheck, 
  LogOut, Clock, ClipboardList, Globe, ChevronLeft, ChevronRight, type LucideIcon 
} from "lucide-react"

interface SidebarProps {
  onLogout: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

interface SidebarLink {
  href: string
  label: string
  icon: LucideIcon
}

export function AdminSidebar({ onLogout, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  const links: SidebarLink[] = [
    { href: "/admin/dashboard", label: "Inicio", icon: Settings },
    { href: "/admin/actividad", label: "Actividad", icon: Clock },
    { href: "/admin/solicitudes", label: "Validar", icon: ClipboardCheck },
    { href: "/admin/analiticas", label: "Analíticas", icon: BarChart3 },
    { href: "/admin/estudiantes", label: "Estudiantes", icon: Users },
    { href: "/admin/estudio-socioeconomico", label: "Socioecon.", icon: ClipboardList },
    { href: "/admin/reportes", label: "Reportes", icon: ClipboardList },
  ]

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    if (pathname === href) {
      e.preventDefault(); 
      window.location.href = href; 
    }
  }

  return (
    <>
      {/* ASIDE ESCRITORIO (SIDEBAR CONTROLADA POR BOTÓN EN EL BORDE) */}
      <aside className={`hidden lg:flex fixed top-0 left-0 z-[100] ${isCollapsed ? 'w-16' : 'w-48'} bg-[#1a2744] text-white flex-col shadow-2xl h-screen border-r border-[#1e3a5f]/50 transition-all duration-300 overflow-visible group`}>
        
        {/* BOTÓN FLOTANTE EN EL BORDE DERECHO (ZONA NOTORIA) */}
        <button 
          onClick={onToggleCollapse} 
          title={isCollapsed ? "Expandir menú" : "Minimizar menú"}
          className="absolute -right-3 top-20 z-[120] flex h-6 w-6 items-center justify-center rounded-full bg-[#152038] border border-[#d4a843]/80 text-[#d4a843] shadow-md hover:bg-[#1e3a5f] hover:text-white transition-all active:scale-95"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* HEADER ESCRITORIO */}
        <div className="h-16 flex items-center px-3 border-b border-[#1e3a5f]/50 shrink-0 bg-[#152038] overflow-hidden">
          <div className={`flex items-center gap-2.5 w-full ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#0f172a] border border-[#d4a843]/40 shadow-inner shrink-0">
              <span className="text-xs font-black text-[#d4a843]">U</span>
            </div>
            {!isCollapsed && (
              <div className="leading-tight whitespace-nowrap overflow-hidden">
                 <p className="font-extrabold text-[11px] uppercase tracking-wider text-white">Unimar</p>
                 <p className="text-[9px] text-[#8a9bbd] uppercase tracking-widest font-semibold">Panel Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR DE NAVEGACIÓN ESCRITORIO */}
        <nav className="flex-1 p-2.5 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href

              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={(e) => handleLinkClick(e, link.href)} 
                  title={link.label}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide transition-all
                    ${isActive 
                      ? "bg-[#d4a843] text-[#1a2744] shadow-md shadow-[#d4a843]/15 font-extrabold" 
                      : "text-[#8a9bbd] hover:text-white hover:bg-white/5"
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1a2744]" : "text-[#d4a843] hover:text-white"} transition-colors`} /> 
                  {!isCollapsed && (
                    <span className="truncate whitespace-nowrap">
                      {link.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* ZONA INFERIOR: ENLACE AL PORTAL RAÍZ Y BOTÓN SALIR */}
          <div className="pt-4 border-t border-[#1e3a5f]/50 mb-2 space-y-1">
            <Link 
              href="/" 
              title="Portal Web"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-bold tracking-wide text-[#8a9bbd] hover:text-white hover:bg-white/5 transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Globe className="h-4 w-4 shrink-0 text-[#d4a843] hover:text-white transition-colors" />
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">
                  Portal Web
                </span>
              )}
            </Link>

            <button 
              onClick={onLogout} 
              title="Salir"
              className={`flex items-center gap-3 text-rose-400 hover:text-rose-300 px-3 py-2 text-[10px] font-black uppercase hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20 shadow-sm w-full ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <LogOut className="h-4 w-4 shrink-0" /> 
              {!isCollapsed && (
                <span className="truncate whitespace-nowrap">
                  Salir
                </span>
              )}
            </button>
          </div>
        </nav>
      </aside>

      {/* BARRA DE NAVEGACIÓN INFERIOR MÓVIL Y TABLET (THUMB-FRIENDLY BOTTOM NAV) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#1a2744] border-t border-[#1e3a5f] shadow-[0_-4px_20px_rgba(0,0,0,0.25)] px-2 py-1.5 flex items-center justify-around backdrop-blur-md">
        <div className="flex items-center justify-between w-full overflow-x-auto no-scrollbar gap-1 py-0.5 px-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link 
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`
                  flex flex-col items-center justify-center min-w-[52px] py-1.5 px-1 rounded-xl transition-all relative group
                  ${isActive 
                    ? "text-[#d4a843] bg-white/10 shadow-sm font-black scale-105" 
                    : "text-[#8a9bbd] hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <Icon className={`h-4 w-4 mb-0.5 ${isActive ? "text-[#d4a843]" : "text-[#8a9bbd] group-hover:text-white"} transition-colors`} />
                <span className="text-[9px] font-semibold tracking-tighter truncate max-w-[60px] leading-none">
                  {link.label}
                </span>
                {isActive && (
                  <span className="absolute -top-1.5 w-1.5 h-1.5 bg-[#d4a843] rounded-full"></span>
                )}
              </Link>
            )
          })}
          
          {/* Enlace al Portal Raíz Móvil */}
          <Link 
            href="/"
            className="flex flex-col items-center justify-center min-w-[52px] py-1.5 px-1 rounded-xl transition-all text-[#8a9bbd] hover:text-white hover:bg-white/5"
          >
            <Globe className="h-4 w-4 mb-0.5 text-[#d4a843]" />
            <span className="text-[9px] font-semibold tracking-tighter truncate max-w-[60px] leading-none">
              Portal
            </span>
          </Link>

          {/* Botón Salir Móvil Integrado */}
          <button 
            onClick={onLogout}
            className="flex flex-col items-center justify-center min-w-[52px] py-1.5 px-1 rounded-xl transition-all text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4 mb-0.5" />
            <span className="text-[9px] font-semibold tracking-tighter truncate max-w-[60px] leading-none">
              Salir
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}