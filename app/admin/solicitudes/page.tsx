"use client"

import React, { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { SolicitudesView } from "@/components/admin/solicitudes/SolicitudesView"
import { PageHeader } from "@/components/admin/PageHeader"

function PageContent() {
  const searchParams = useSearchParams()

  // 🟢 Capturamos todos los valores reales de la URL
  const initialFilters = {
    search: searchParams.get('search') || searchParams.get('q') || "", 
    status: searchParams.get('status') || searchParams.get('filter') || "",
    carrera: searchParams.get('carrera') || "",
    tipoBeca: searchParams.get('tipoBeca') || "",
    municipio: searchParams.get('municipio') || "",
    trimestre: searchParams.get('trimestre') || "",
    fecha: searchParams.get('fecha') || "",
    vulnerabilidad: searchParams.get('vulnerabilidad') || "",
    rankingElite: searchParams.get('rankingElite') === 'true',
    estadoEstudio: searchParams.get('estadoEstudio') || "",
    filtroPromedio: searchParams.get('filtroPromedio') || "",
    es_renovacion: searchParams.get('es_renovacion') || "",
    promedioMin: searchParams.get('promedioMin') || "",
    vulnerabilidadMin: searchParams.get('vulnerabilidadMin') || "",
    tendencia: searchParams.get('tendencia') || "",
    scope: searchParams.get('scope') || ""
  }

  const viewKey = searchParams.toString() || 'root-view';

  return (
    <div className="space-y-4">
      {/* HEADER UNIFICADO (Sustituye al contenedor antiguo) */}
      <PageHeader 
        titulo="Gestión de Solicitudes" 
        subtitulo="Administración y Auditoría de Becas"
        mostrarExportar={true}
      />

      {/* VISTA DE SOLICITUDES (El componente interno ya debe manejar su propia reducción de escala) */}
      <SolicitudesView key={viewKey} initialFilters={initialFilters} />
    </div>
  )
}

export default function GestionSolicitudesPage() {
  return (
    <Suspense fallback={
      <div className="py-32 flex flex-col items-center justify-center text-[#1a2744]">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
        <p className="font-black uppercase tracking-[0.2em] text-[9px]">
          Sincronizando expedientes...
        </p>
      </div>
    }>
      <PageContent />
    </Suspense>
  )
}