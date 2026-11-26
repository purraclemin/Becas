import React from "react"
import { obtenerReporteDepartamentos } from "./actions"
import { DepartamentosReporteClient } from "./DepartamentosReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteDepartamentosPage() {
  const initialData = await obtenerReporteDepartamentos()

  return <DepartamentosReporteClient initialData={initialData} />
}