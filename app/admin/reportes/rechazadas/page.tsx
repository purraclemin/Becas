import React from "react"
import { obtenerReporteRechazadas, type FiltroEstatusCierre } from "./actions"
import { RechazadasReporteClient } from "./RechazadasReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ReporteRechazadasPageProps {
  searchParams?: Promise<{ estatus?: string }> | { estatus?: string }
}

function normalizarFiltroUrl(raw?: string): FiltroEstatusCierre {
  const val = String(raw || "").trim().toLowerCase()
  if (val === "rechazada" || val === "rechazado") return "Rechazada"
  if (val === "finalizada") return "Finalizada"
  return "Todas"
}

export default async function ReporteRechazadasPage({
  searchParams
}: ReporteRechazadasPageProps) {
  const resolved = searchParams ? await searchParams : {}
  const initialEstatus = normalizarFiltroUrl(resolved.estatus)
  const initialData = await obtenerReporteRechazadas({ estatus: initialEstatus })

  return (
    <RechazadasReporteClient
      initialData={initialData}
      initialEstatus={initialEstatus}
    />
  )
}
