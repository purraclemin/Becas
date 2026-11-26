import React from "react"
import { obtenerReporteSolicitudesFecha } from "./actions"
import { SolicitudesFechaReporteClient } from "./SolicitudesFechaReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteSolicitudesFechaPage() {
  const initialData = await obtenerReporteSolicitudesFecha()

  return <SolicitudesFechaReporteClient initialData={initialData} />
}