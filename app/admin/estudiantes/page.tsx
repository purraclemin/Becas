import React from "react"
import { redirect } from "next/navigation"
import { obtenerEstudiantesConSolicitud } from "@/lib/Actionsestudiantes"
import { EstudiantesAdminClient } from "./EstudiantesAdminClient"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface EstudiantesAdminPageProps {
  searchParams?:
    | Promise<{ search?: string; carrera?: string; from?: string }>
    | { search?: string; carrera?: string; from?: string }
}

function normalizarCedulaComparacion(valor: string): string {
  return valor.trim().toLowerCase().replace(/^[ve]-?/i, "")
}

export default async function EstudiantesAdminPage({
  searchParams
}: EstudiantesAdminPageProps) {
  const resolved = searchParams ? await searchParams : {}
  const initialSearch = String(resolved.search || "").trim()
  const initialCarrera = String(resolved.carrera || "").trim()
  const fromOrigen = String(resolved.from || "").trim().toLowerCase()

  const initialData = await obtenerEstudiantesConSolicitud(
    initialSearch,
    1,
    12,
    initialCarrera
  )

  // Salto directo desde la Matriz de Justicia Social de Analíticas al ValidarBecaAuditoriaPanel
  if (fromOrigen === "matriz" && initialSearch !== "") {
    const cedulaBuscada = normalizarCedulaComparacion(initialSearch)
    const coincidenciaExacta = initialData.estudiantes.find(
      (est) => normalizarCedulaComparacion(est.cedula) === cedulaBuscada
    )

    if (coincidenciaExacta) {
      redirect(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(
          coincidenciaExacta.cedula
        )}&origen=estudiantes`
      )
    }
  }

  return (
    <EstudiantesAdminClient
      initialData={initialData}
      initialSearch={initialSearch}
      initialCarrera={initialCarrera}
    />
  )
}
