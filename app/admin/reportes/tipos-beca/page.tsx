import React from "react"
import { obtenerReporteTiposBeca } from "./actions"
import { TiposBecaReporteClient } from "./TiposBecaReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteTiposBecaPage() {
  const initialData = await obtenerReporteTiposBeca()

  return <TiposBecaReporteClient initialData={initialData} />
}