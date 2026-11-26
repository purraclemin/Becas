import React from "react"
import { obtenerReporteAprobadas } from "./actions"
import { AprobadasReporteClient } from "./AprobadasReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteAprobadasPage() {
  const initialData = await obtenerReporteAprobadas()

  return <AprobadasReporteClient initialData={initialData} />
}