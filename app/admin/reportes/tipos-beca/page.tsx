import React from "react"
import { obtenerReporteTiposBeca } from "./actions"
import { TiposBecaReporteClient } from "./TiposBecaReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ReporteTiposBecaPageProps {
  searchParams?: Promise<{ tipoBeca?: string }> | { tipoBeca?: string }
}

export default async function ReporteTiposBecaPage({
  searchParams
}: ReporteTiposBecaPageProps) {
  const resolved = searchParams ? await searchParams : {}
  const initialTipoBeca = String(resolved.tipoBeca || "").trim()

  const initialData = await obtenerReporteTiposBeca()

  return (
    <TiposBecaReporteClient
      initialData={initialData}
      initialTipoBeca={initialTipoBeca}
    />
  )
}
