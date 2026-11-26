import React from "react"
import { obtenerReporteHistorialAprobaciones } from "./actions"
import { HistorialAprobacionesClient } from "./HistorialAprobacionesClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function HistorialAprobacionesPage() {
  const initialData = await obtenerReporteHistorialAprobaciones()

  return <HistorialAprobacionesClient initialData={initialData} />
} 