import React from "react"
import { obtenerReporteEnRevision } from "./actions"
import { EnRevisionReporteClient } from "./EnRevisionReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteEnRevisionPage() {
  const initialData = await obtenerReporteEnRevision()

  return <EnRevisionReporteClient initialData={initialData} />
}