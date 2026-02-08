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

export function NavMenu() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  return (
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
  )
}