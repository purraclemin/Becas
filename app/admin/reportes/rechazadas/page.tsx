import React from "react"
import { obtenerReporteRechazadas } from "./actions"
import { RechazadasReporteClient } from "./RechazadasReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteRechazadasPage() {
  const initialData = await obtenerReporteRechazadas()

  return <RechazadasReporteClient initialData={initialData} />
}