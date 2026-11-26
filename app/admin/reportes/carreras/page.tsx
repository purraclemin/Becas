import React from "react"
import { obtenerReporteCarreras } from "./actions"
import { CarrerasReporteClient } from "./CarrerasReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteCarrerasPage() {
  const initialData = await obtenerReporteCarreras()

  return <CarrerasReporteClient initialData={initialData} />
}