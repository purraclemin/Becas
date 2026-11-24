"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar/navbar"
import type { getSession } from "@/lib/ActionsSession"

type InitialSession = Awaited<ReturnType<typeof getSession>>

const PERSISTENT_NAV_ROUTES = [
  "/",
  "/becas",
  "/requisitos",
  "/proceso",
  "/servicios",
]

interface ControladorNavbarProps {
  children: React.ReactNode
  initialUser: InitialSession
}

export function ControladorNavbar({
  children,
  initialUser,
}: ControladorNavbarProps) {
  const pathname = usePathname()

  const normalizedPath =
    pathname && pathname !== "/" ? pathname.replace(/\/$/, "") : pathname ?? ""

  const isExcluded =
    pathname?.startsWith("/admin") || pathname?.startsWith("/postulacion")

  const showPersistentNavbar = PERSISTENT_NAV_ROUTES.includes(normalizedPath)

  if (isExcluded) {
    return <>{children}</>
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      {showPersistentNavbar && <Navbar initialUser={initialUser} />}
      {children}
    </div>
  )
}