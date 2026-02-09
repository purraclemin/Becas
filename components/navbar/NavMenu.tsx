"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "/" },
  {
    label: "Becas",
    href: "/becas",
    children: [
      { label: "Académica", href: "/becas" },
      { label: "Socioeconómica", href: "/becas" },
      { label: "Deportiva", href: "/becas" },
      { label: "Excelencia", href: "/becas" },
    ],
  },
  { label: "Requisitos", href: "/requisitos" },
  { label: "Proceso", href: "/proceso" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/servicios#contacto" },
  { label: "Solicitudes", href: "/Solicitud" },
]

interface NavMenuProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
  user: any
}

export function NavMenu({ mobileOpen, setMobileOpen }: NavMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleLinkClick = () => {
    if (setMobileOpen) setMobileOpen(false)
  }

  return (
    <nav className={`bg-[#1e3a5f] ${mobileOpen ? "block border-t border-white/5" : "hidden"} lg:block shadow-inner transition-all duration-300`}>
      <div className="mx-auto flex flex-col lg:flex-row max-w-7xl items-start lg:items-center px-4">
        <ul className="flex flex-col lg:flex-row items-start lg:items-center w-full">
          {navLinks.map((link) => (
            <li key={link.label} className="relative group w-full lg:w-auto border-b border-white/5 lg:border-none">
              {link.children ? (
                <div 
                  onMouseEnter={() => !mobileOpen && setOpenDropdown(link.label)} 
                  onMouseLeave={() => !mobileOpen && setOpenDropdown(null)}
                  className="w-full lg:w-auto"
                >
                  <button 
                    onClick={() => mobileOpen && setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    className="flex w-full items-center justify-between lg:justify-start gap-1 px-4 py-2 lg:py-3.5 text-[11px] lg:text-sm font-bold text-[#c7d4e6] hover:text-white transition-all"
                  >
                    {link.label} <ChevronDown className={`h-3 w-3 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                  </button>
                  
                  {openDropdown === link.label && (
                    <div className="lg:absolute left-0 top-full z-50 min-w-[200px] bg-white lg:shadow-xl py-1 border-l-4 lg:border-l-0 border-[#d4a843] lg:border border-gray-100">
                      {link.children.map((child) => (
                        <Link 
                          key={child.label} 
                          href={child.href} 
                          onClick={handleLinkClick}
                          className="block px-8 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1e3a5f]"
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
                  className="block w-full px-4 py-2 lg:py-3.5 text-[11px] lg:text-sm font-bold text-[#c7d4e6] hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}