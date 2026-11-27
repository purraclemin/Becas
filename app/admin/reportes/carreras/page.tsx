import React from "react"
import { obtenerReporteCarreras } from "./actions"
import { CarrerasReporteClient } from "./CarrerasReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ReporteCarrerasPageProps {
  searchParams?: Promise<{ carrera?: string }> | { carrera?: string }
}

export default async function ReporteCarrerasPage({
  searchParams
}: ReporteCarrerasPageProps) {
  const resolved = searchParams ? await searchParams : {}
  const initialCarrera = String(resolved.carrera || "").trim()
  const initialData = await obtenerReporteCarreras()

  return (
    <CarrerasReporteClient
      initialData={initialData}
      initialCarrera={initialCarrera}
    />
  )
}
