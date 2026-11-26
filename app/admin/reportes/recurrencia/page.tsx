import React from "react"
import { obtenerReporteRecurrencia } from "./actions"
import { RecurrenciaReporteClient } from "./RecurrenciaReporteClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ReporteRecurrenciaPage() {
  const initialData = await obtenerReporteRecurrencia()

  return <RecurrenciaReporteClient initialData={initialData} />
}