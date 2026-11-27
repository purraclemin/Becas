"use client"

import { Fragment, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  FileText,
  Home,
  Award,
  ClipboardCheck,
  GitBranch,
  Briefcase,
  Phone,
} from "lucide-react"

interface NavChildItem {
  label: string
  href: string
}

interface NavItem {
  label: string
  href: string
  icon: "home" | "award" | "clipboard" | "branch" | "briefcase" | "phone" | "file"
  children?: NavChildItem[]
}

const navLinks: NavItem[] = [
  { label: "Inicio", href: "/", icon: "home" },
  { label: "Becas", href: "/becas", icon: "award" },
  { label: "Requisitos", href: "/requisitos", icon: "clipboard" },
  { label: "Proceso", href: "/proceso", icon: "branch" },
  { label: "Servicios", href: "/servicios", icon: "briefcase" },
  { label: "Contacto", href: "/servicios#contacto", icon: "phone" },
  { label: "Solicitud", href: "/postulacion", icon: "file" },
]

interface NavMenuProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
  user?: Record<string, unknown> | null
  isMobileCompact?: boolean
  showLeadingDivider?: boolean
  showTrailingDivider?: boolean
}

function renderNavIcon(icon: NavItem["icon"], isMobile?: boolean) {
  const sizeClass = isMobile
    ? "h-4 w-4 shrink-0 stroke-[2.2]"
    : "h-3.5 w-3.5 shrink-0 stroke-[2.2]"
  switch (icon) {
    case "home":
      return <Home className={sizeClass} />
    case "award":
      return <Award className={sizeClass} />
    case "clipboard":
      return <ClipboardCheck className={sizeClass} />
    case "branch":
      return <GitBranch className={sizeClass} />
    case "briefcase":
      return <Briefcase className={sizeClass} />
    case "phone":
      return <Phone className={sizeClass} />
    case "file":
      return <FileText className={sizeClass} />
  }
}

function getMobileStatusBadgeClass(status: string): string {
  const s = status
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  if (s === "aprobada" || s === "aprobado") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200"
  }
  if (s === "rechazada" || s === "rechazado") {
    return "bg-rose-50 text-rose-700 border-rose-200"
  }
  if (s.includes("finaliz")) {
    return "bg-teal-50 text-teal-800 border-teal-200"
  }
  if (s.includes("convocad")) {
    return "bg-orange-50 text-orange-800 border-orange-200 animate-pulse"
  }
  if (s.includes("revision")) {
    return "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
  }
  if (s === "pendiente") {
    return "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
  }
  return "bg-slate-100 text-slate-600 border-slate-200"
}

export function NavMenu({
  mobileOpen,
  setMobileOpen,
  user,
  showLeadingDivider = true,
  showTrailingDivider = true,
}: NavMenuProps) {
  const pathname = usePathname()
  const [currentHash, setCurrentHash] = useState<string>("")
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
    setCurrentHash(window.location.hash || "")

    const handleHashChange = () => {
      setPendingHref(null)
      setCurrentHash(window.location.hash || "")
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [pathname])

  const effectiveLocation = pendingHref ?? `${pathname}${currentHash}`

  const isLinkActive = (href: string): boolean => {
    const [activePath, activeHash = ""] = effectiveLocation.split("#")
    const [targetPath, targetHash = ""] = href.split("#")

    const normalizedActivePath = activePath || "/"
    const normalizedTargetPath = targetPath || "/"

    if (normalizedActivePath !== normalizedTargetPath) {
      return false
    }

    if (targetHash) {
      return activeHash === targetHash
    }

    if (normalizedTargetPath === "/servicios" && activeHash === "contacto") {
      return false
    }

    return true
  }

  const handleLinkClick = (href: string) => {
    const hashIndex = href.indexOf("#")
    if (hashIndex !== -1) {
      setCurrentHash(href.slice(hashIndex))
    } else {
      setCurrentHash("")
      if (pathname === href && window.location.hash) {
        window.history.replaceState(null, "", href)
      }
    }

    setPendingHref(href)

    if (setMobileOpen) {
      setMobileOpen(false)
    }
  }

  const esEstudianteLogueado = Boolean(
    user && user.isLoggedIn === true && user.role === "estudiante"
  )
  const estatusEstudiante = esEstudianteLogueado
    ? String(user?.estatus ?? user?.status ?? "ninguna").trim()
    : ""
  const semestreEstudiante = esEstudianteLogueado
    ? Number(user?.semestre ?? user?.trimestre ?? 0)
    : 0
  const etiquetaNivelEstudiante =
    semestreEstudiante >= 13
      ? "Egresado"
      : `${semestreEstudiante > 0 ? semestreEstudiante : 0}° Trim.`

  return (
    <nav aria-label="Navegación principal" className="w-full">
      {mobileOpen && esEstudianteLogueado && (
        <div className="px-3 pt-2.5 pb-1.5">
          <Link
            href="/perfil"
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#f8fafc] border border-slate-200"
          >
            <span className="text-[11px] font-black uppercase text-[#1e3a5f] truncate">
              Mi Estatus • {etiquetaNivelEstudiante}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase shrink-0 ${getMobileStatusBadgeClass(
                estatusEstudiante
              )}`}
            >
              {estatusEstudiante === "ninguna" ? "Sin Solicitud" : estatusEstudiante}
            </span>
          </Link>
        </div>
      )}
      <ul
        className={`w-full ${
          mobileOpen
            ? "grid grid-cols-2 gap-2 py-2 px-3"
            : "flex flex-row items-center justify-center gap-1 xl:gap-1.5"
        }`}
      >
        {!mobileOpen && showLeadingDivider && (
          <li aria-hidden="true" className="flex items-center justify-center px-1">
            <span className="h-5 w-[2px] rounded-full bg-[#d4a843]/80" />
          </li>
        )}

        {navLinks.map((link, index) => {
          const active = isLinkActive(link.href)
          const hasActiveChild =
            link.children?.some((child) => isLinkActive(child.href)) ?? false
          const isHighlighted = active || hasActiveChild
          const isLastItem = index === navLinks.length - 1

          return (
            <Fragment key={link.label}>
              <li className={`relative group ${mobileOpen ? "w-full" : "w-auto"}`}>
                {link.children && link.children.length > 0 ? (
                  <div
                    onMouseEnter={() => !mobileOpen && setOpenDropdown(link.label)}
                    onMouseLeave={() => !mobileOpen && setOpenDropdown(null)}
                    className="w-full"
                  >
                    <button
                      type="button"
                      aria-expanded={openDropdown === link.label}
                      onClick={() =>
                        mobileOpen &&
                        setOpenDropdown(openDropdown === link.label ? null : link.label)
                      }
                      className={`flex w-full items-center justify-center gap-1.5 px-3 transition-colors duration-150 rounded-full border ${
                        mobileOpen
                          ? "h-11 text-sm font-bold"
                          : "h-8 py-1.5 text-xs font-extrabold"
                      } ${
                        isHighlighted
                          ? "bg-[#d4a843] text-[#1e3a5f] border-[#d4a843] shadow-xs"
                          : "text-[#1e3a5f] hover:bg-[#d4a843]/20 bg-slate-50 border-[#e2e8f0]"
                      }`}
                    >
                      {renderNavIcon(link.icon, Boolean(mobileOpen))}
                      <span className="leading-none">{link.label}</span>
                      <ChevronDown
                        className={`h-3 w-3 transition-transform duration-150 ${
                          openDropdown === link.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openDropdown === link.label && (
                      <div className="lg:absolute left-0 top-full z-50 min-w-[190px] bg-white shadow-xl py-1.5 rounded-2xl border border-[#e2e8f0]">
                        {link.children.map((child) => {
                          const childActive = isLinkActive(child.href)
                          return (
                            <Link
                              key={child.label}
                              href={child.href}
                              aria-current={childActive ? "page" : undefined}
                              onClick={() => handleLinkClick(child.href)}
                              className={`flex items-center justify-between px-3.5 py-1.5 text-xs transition-colors duration-150 ${
                                childActive
                                  ? "bg-[#d4a843] text-[#1e3a5f] font-extrabold mx-1 rounded-full"
                                  : "text-slate-700 font-medium hover:bg-slate-50 hover:text-[#1e3a5f]"
                              }`}
                            >
                              <span>{child.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => handleLinkClick(link.href)}
                    className={`flex items-center justify-center gap-1.5 w-full px-3 transition-colors duration-150 rounded-full border text-center ${
                      mobileOpen
                        ? "h-11 text-sm font-bold"
                        : "h-8 py-1.5 text-xs font-extrabold"
                    } ${
                      active
                        ? "bg-[#d4a843] text-[#1e3a5f] border-[#d4a843] shadow-xs"
                        : "text-[#1e3a5f] hover:bg-[#d4a843]/20 bg-slate-50 border-[#e2e8f0]"
                    }`}
                  >
                    {renderNavIcon(link.icon, Boolean(mobileOpen))}
                    <span className="leading-none">{link.label}</span>
                  </Link>
                )}
              </li>

              {!mobileOpen && isLastItem && showTrailingDivider && (
                <li aria-hidden="true" className="flex items-center justify-center px-1">
                  <span className="h-5 w-[2px] rounded-full bg-[#d4a843]/80" />
                </li>
              )}
            </Fragment>
          )
        })}
      </ul>
    </nav>
  )
}