import React from "react"
import { obtenerEstadisticasBecas } from "@/lib/ActionsDashboard"
import { obtenerRankingPrioridad } from "@/lib/ActionsRanking"
import { DashboardAdminClient } from "./DashboardAdminClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminDashboardPage() {
  const [initialStats, initialRanking] = await Promise.all([
    obtenerEstadisticasBecas(),
    obtenerRankingPrioridad(),
  ])

  return (
    <DashboardAdminClient
      initialStats={initialStats}
      initialRanking={initialRanking}
    />
  )
}
