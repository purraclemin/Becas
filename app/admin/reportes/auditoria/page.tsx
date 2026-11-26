import React from "react"
import { obtenerReporteAuditoria } from "./actions"
import { AuditoriaReporteClient } from "./AuditoriaReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteAuditoriaPage() {
  const initialData = await obtenerReporteAuditoria()

  return <AuditoriaReporteClient initialData={initialData} />
}