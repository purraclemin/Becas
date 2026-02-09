"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SolicitudesView } from "@/components/admin/solicitudes/SolicitudesView"

function PageContent() {
  const searchParams = useSearchParams()

  // 🟢 Capturamos todos los valores reales de la URL, incluyendo los que faltaban
  const initialFilters = {
    // Búsqueda por texto
    search: searchParams.get('search') || searchParams.get('q') || "", 
    
    // Estatus de la solicitud (Si es vacío, el backend lo interpreta como 'Todas')
    status: searchParams.get('status') || searchParams.get('filter') || "",
    
    // Filtros de categorización
    carrera: searchParams.get('carrera') || "",
    tipoBeca: searchParams.get('tipoBeca') || "",
    
    // Filtros de mérito y riesgo
    fecha: searchParams.get('fecha') || "",
    vulnerabilidad: searchParams.get('vulnerabilidad') || "",
    rankingElite: searchParams.get('rankingElite') === 'true',
    
    // Filtros de seguimiento
    estadoEstudio: searchParams.get('estadoEstudio') || "",
    filtroPromedio: searchParams.get('filtroPromedio') || ""
  }

  /**
   * 🚀 LA CLAVE DEL REINICIO:
   * Al pasar 'key={viewKey}', obligamos a React a destruir el componente viejo 
   * y montar uno nuevo cada vez que la URL cambie. 
   * Esto garantiza que al presionar "Limpiar", la tabla se refresque 
   * con los datos originales sin quedarse "pegada".
   */
  const viewKey = searchParams.toString() || 'root-view';

  return <SolicitudesView key={viewKey} initialFilters={initialFilters} />
}

export default function GestionSolicitudesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Suspense fallback={
        <div className="flex h-screen flex-col items-center justify-center text-[#1a2744]">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#d4a843]" />
          <p className="font-black uppercase tracking-[0.2em] text-[10px] mt-4">
            Sincronizando base de datos...
          </p>
        </div>
      }>
        <PageContent />
      </Suspense>
    </div>
  )
}