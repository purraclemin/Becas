"use client"

import React from "react"

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    // Este div envuelve a TODAS tus páginas. 
    // Al ser un 'template', Next.js lo destruye y lo vuelve a crear en cada navegación.
    // Esto fuerza a que los estados (busquedas, formularios) se limpien.
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  )
}