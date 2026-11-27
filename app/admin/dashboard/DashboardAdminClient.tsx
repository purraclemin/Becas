"use client"

import React from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  CalendarCheck
} from "lucide-react"

import type { EstadisticasBecasResponse } from "@/lib/ActionsDashboard"
import type { EstudianteRankingRow } from "@/lib/ActionsRanking"

import { PageHeader } from "@/components/admin/PageHeader"
import { StatCard } from "@/components/admin/dashboard/StatCard"
import { RankingPrioridad } from "@/components/admin/dashboard/RankingPrioridad"
import { CarreraBarChart, BecaPieChart } from "@/components/admin/dashboard/DashboardCharts"
import { HealthStatus, type EstatusOperativoItem } from "@/components/admin/dashboard/OperationalStats"

interface DashboardAdminClientProps {
  initialStats?: EstadisticasBecasResponse | null
  initialRanking?: EstudianteRankingRow[]
}

export function DashboardAdminClient({
  initialStats,
  initialRanking = []
}: DashboardAdminClientProps) {
  const router = useRouter()

  const porEstatus: EstatusOperativoItem[] = Array.isArray(initialStats?.porEstatus)
    ? initialStats.porEstatus.map((item) => ({
        estatus: String(item.estatus ?? ""),
        total: Number(item.total) || 0,
      }))
    : []

  const porCarrera = Array.isArray(initialStats?.porCarrera)
    ? initialStats.porCarrera
    : []

  const porTipo = Array.isArray(initialStats?.porTipo)
    ? initialStats.porTipo
    : []

  const ranking = Array.isArray(initialRanking) ? initialRanking : []

  // Conteo deduplicado por estatus
  const total = porEstatus.reduce((acc, curr) => acc + curr.total, 0)
  const cantPendientes = porEstatus.find((e) => e.estatus === "Pendiente")?.total || 0
  const cantConvocados =
    porEstatus.find((e) => e.estatus === "Convocado a Entrevista")?.total || 0
  const cantEnRevision = porEstatus.find((e) => e.estatus === "En Revisión")?.total || 0
  const cantAprobadas = porEstatus.find((e) => e.estatus === "Aprobada")?.total || 0
  const cantRechazadas = porEstatus.find((e) => e.estatus === "Rechazada")?.total || 0
  const cantFinalizadas = porEstatus.find((e) => e.estatus === "Finalizada")?.total || 0

  const irAStatus = (estatus: string) => {
    if (estatus === "Todas") {
      router.push("/admin/estudiantes")
      return
    }
    if (estatus === "Rechazada" || estatus === "Finalizada") {
      router.push(`/admin/reportes/rechazadas?estatus=${encodeURIComponent(estatus)}`)
      return
    }
    router.push(`/admin/validarBeca?status=${encodeURIComponent(estatus)}`)
  }

  return (
    <div className="space-y-2 px-2 pt-0 pb-6 bg-[#f8fafc] min-h-screen">
      {/* Cabecera Académica Minimalista */}
      <PageHeader
        titulo="Panel de Control"
        subtitulo="Métricas y Rendimiento Operativo"
        mostrarExportar={false}
      />

      {/* UF-Scale: Bloque superior adaptado con grilla fluida y compacta en escritorio */}
      <div className="flex justify-start">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 w-full">
          <StatCard
            label="Total"
            value={total}
            icon={FileText}
            color="bg-[#1e3a5f]"
            onClick={() => irAStatus("Todas")}
          />
          <StatCard
            label="Pendientes"
            value={cantPendientes}
            icon={Clock}
            color="bg-[#d4a843]"
            onClick={() => irAStatus("Pendiente")}
          />
          <StatCard
            label="Convocado a Entrevista"
            value={cantConvocados}
            icon={CalendarCheck}
            color="bg-orange-600"
            onClick={() => irAStatus("Convocado a Entrevista")}
          />
          <StatCard
            label="En Revisión"
            value={cantEnRevision}
            icon={Clock}
            color="bg-blue-600"
            onClick={() => irAStatus("En Revisión")}
          />
          <StatCard
            label="Aprobadas"
            value={cantAprobadas}
            icon={CheckCircle2}
            color="bg-emerald-600"
            onClick={() => irAStatus("Aprobada")}
          />
          <StatCard
            label="Rechazadas"
            value={cantRechazadas}
            icon={XCircle}
            color="bg-rose-600"
            onClick={() => irAStatus("Rechazada")}
          />
          <StatCard
            label="Finalizadas"
            value={cantFinalizadas}
            icon={Archive}
            color="bg-teal-600"
            onClick={() => irAStatus("Finalizada")}
          />
        </div>
      </div>

      {/* Grilla superior: Solicitudes por Carrera y Ranking de Prioridad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <CarreraBarChart
            data={porCarrera}
            onNavigate={(c) =>
              router.push(`/admin/reportes/carreras?carrera=${encodeURIComponent(c)}`)
            }
          />
        </div>
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <RankingPrioridad
            estudiantes={ranking}
            onNavigate={(cedula: string) =>
              router.push(
                `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedula)}&origen=dashboard`
              )
            }
          />
        </div>
      </div>

      {/* Bloque inferior: Salud operativa y Distribución por Programa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4 items-stretch">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <HealthStatus porEstatus={porEstatus} total={total} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex flex-col">
          <BecaPieChart
            data={porTipo}
            onNavigate={(b) =>
              router.push(`/admin/reportes/tipos-beca?tipoBeca=${encodeURIComponent(b)}`)
            }
          />
        </div>
      </div>
    </div>
  )
}
