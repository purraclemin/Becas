"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SolicitudesView } from "@/components/admin/solicitudes/SolicitudesView"

function PageContent() {
  const searchParams = useSearchParams()

  // 🟢 CORRECCIÓN: Capturamos los valores reales de la URL
  const initialFilters = {
    // Usamos 'search' para que coincida con filtros.search en el Action
    search: searchParams.get('search') || searchParams.get('q') || "", 
    
    // Usamos 'status' para que coincida con filtros.status
    status: searchParams.get('status') || searchParams.get('filter') || "Todas",
    
    // LEEMOS LA CARRERA (Esto era lo que faltaba)
    carrera: searchParams.get('carrera') || "",
    
    // LEEMOS LA BECA (Esto era lo que faltaba)
    tipoBeca: searchParams.get('tipoBeca') || "",
    
    fecha: searchParams.get('fecha') || "",
    vulnerabilidad: searchParams.get('vulnerabilidad') || "",
    rankingElite: searchParams.get('rankingElite') === 'true',
    estadoEstudio: searchParams.get('estadoEstudio') || ""
  }

  return <SolicitudesView initialFilters={initialFilters} />
}

export default function GestionSolicitudesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Suspense fallback={
        <div className="flex h-screen flex-col items-center justify-center text-[#1a2744]">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#d4a843]" />
          <span className="font-black uppercase tracking-widest text-xs">Sincronizando registros...</span>
        </div>
      }>
        <PageContent />
      </Suspense>
    </div>
  )
}