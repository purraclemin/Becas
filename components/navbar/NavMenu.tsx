"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Becas", href: "/becas" },
  { label: "Requisitos", href: "/requisitos" },
  { label: "Proceso", href: "/proceso" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/servicios#contacto" },
  { label: "Solicitudes", href: "/postulacion" },
]

interface NavMenuProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
  user?: any
  isMobileCompact?: boolean
}

export function NavMenu({ mobileOpen, setMobileOpen }: NavMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false)
  }

  return (
    <nav className="w-full">
      <ul className={`w-full ${
        mobileOpen 
          ? "grid grid-cols-2 gap-2 py-1" 
          : "flex flex-row items-center justify-center gap-1 xl:gap-2"
      }`}>
        {navLinks.map((link) => (
          <li key={link.label} className={`relative group ${mobileOpen ? "w-full" : "w-auto"}`}>
            {"children" in link && link.children ? (
              <div 
                onMouseEnter={() => !mobileOpen && setOpenDropdown(link.label)} 
                onMouseLeave={() => !mobileOpen && setOpenDropdown(null)}
                className="w-full"
              >
                <button 
                  onClick={() => mobileOpen && setOpenDropdown(openDropdown === link.label ? null : link.label)}
                  className={`flex w-full items-center justify-center gap-1 px-3 py-2.5 text-xs font-bold text-[#1e3a5f] hover:text-[#d4a843] transition-all rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] shadow-xs`}
                >
                  {link.label} <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                </button>
                
                {openDropdown === link.label && (
                  <div className="lg:absolute left-0 top-full z-50 min-w-[200px] bg-white shadow-xl py-2 rounded-lg border border-[#e2e8f0]">
                    {(link.children as { label: string; href: string }[]).map((child) => (
                      <Link 
                        key={child.label} 
                        href={child.href} 
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1e3a5f] font-medium"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href={link.href} 
                onClick={handleLinkClick}
                className="flex items-center justify-center w-full px-3 py-2.5 text-xs font-bold text-[#1e3a5f] hover:text-[#d4a843] transition-all rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] text-center shadow-xs"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}