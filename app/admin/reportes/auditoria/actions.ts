"use server"

import type { RowDataPacket } from "mysql2/promise"
import { queryFresh } from "@/lib/db"

export type AuditoriaActorNombre =
  | "Secretaría General"
  | "Sistema"
  | "Bienestar Estudiantil"

export type AuditoriaActorTipo = "secretaria" | "sistema" | "bienestar"

interface AuditoriaSQLRow extends RowDataPacket {
  id: number
  admin_id: number
  fecha_aprobacion: Date | string | null
  estatus_previo: string | null
  estatus_nuevo: string | null
  ip_accion: string | null
  admin_email: string | null
  admin_role: string | null
  alumno_nombre: string
  alumno_apellido: string
  alumno_cedula: string
}

export interface ReporteAuditoriaItem {
  id: number
  admin_id: number
  actor_nombre: AuditoriaActorNombre
  actor_tipo: AuditoriaActorTipo
  admin_email: string
  estatus_previo: string
  estatus_nuevo: string
  ip_accion: string
  fecha_aprobacion: string
  alumno_nombre: string
  alumno_apellido: string
  alumno_cedula: string
}

export interface RespuestaReporteAuditoria {
  success: boolean
  data: ReporteAuditoriaItem[]
  error?: string
}

function serializarFechaISO(valor: Date | string | null | undefined): string {
  if (!valor) return ""
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? "" : valor.toISOString()
  }
  const parsed = new Date(valor)
  return Number.isNaN(parsed.getTime()) ? String(valor) : parsed.toISOString()
}

function resolverActorAuditoria(
  adminId: number,
  emailRaw: string | null,
  roleRaw: string | null
): {
  actor_nombre: AuditoriaActorNombre
  actor_tipo: AuditoriaActorTipo
  admin_email: string
} {
  const email = String(emailRaw || "").trim()
  const emailLower = email.toLowerCase()
  const roleLower = String(roleRaw || "").trim().toLowerCase()

  if (adminId === 0 || emailLower === "" || emailLower.includes("sistema")) {
    return {
      actor_nombre: "Sistema",
      actor_tipo: "sistema",
      admin_email: email || "sistema@unimar.edu.ve",
    }
  }

  if (roleLower === "secretaria" || emailLower.includes("secretaria")) {
    return {
      actor_nombre: "Secretaría General",
      actor_tipo: "secretaria",
      admin_email: email,
    }
  }

  return {
    actor_nombre: "Bienestar Estudiantil",
    actor_tipo: "bienestar",
    admin_email: email,
  }
}

/**
 * Consulta la bitácora completa de auditoría (incluyendo acciones automáticas con admin_id = 0)
 * clasificando explícitamente al responsable en:
 * - Secretaría General
 * - Sistema
 * - Bienestar Estudiantil
 */
export async function obtenerReporteAuditoria(
  search?: string
): Promise<RespuestaReporteAuditoria> {
  try {
    const limpio = (search || "").trim().toLowerCase()
    const params: Array<string | number> = []
    let whereClause = ""

    const actorSqlExpr = `
      CASE
        WHEN h.admin_id = 0 OR u.id IS NULL OR LOWER(IFNULL(u.email, '')) LIKE '%sistema%' THEN 'sistema'
        WHEN LOWER(IFNULL(u.role, '')) = 'secretaria' OR LOWER(IFNULL(u.email, '')) LIKE '%secretaria%' THEN 'secretaria general secretaría general'
        ELSE 'bienestar estudiantil'
      END
    `

    if (limpio !== "") {
      const term = `%${limpio}%`
      whereClause = `
        WHERE (
          LOWER(st.nombre) LIKE ?
          OR LOWER(st.apellido) LIKE ?
          OR LOWER(CONCAT(st.nombre, ' ', st.apellido)) LIKE ?
          OR LOWER(st.cedula) LIKE ?
          OR LOWER(IFNULL(u.email, 'sistema@unimar.edu.ve')) LIKE ?
          OR ${actorSqlExpr} LIKE ?
        )
      `
      params.push(term, term, term, term, term, term)
    }

    const sql = `
      SELECT
        h.id,
        h.admin_id,
        h.fecha_aprobacion,
        h.estatus_previo,
        h.estatus_nuevo,
        h.ip_accion,
        u.email AS admin_email,
        u.role AS admin_role,
        st.nombre AS alumno_nombre,
        st.apellido AS alumno_apellido,
        st.cedula AS alumno_cedula
      FROM historial_aprobaciones h
      LEFT JOIN users u ON h.admin_id = u.id
      JOIN students st ON h.user_id = st.id
      ${whereClause}
      ORDER BY h.fecha_aprobacion DESC, h.id DESC
      LIMIT 300
    `

    const rows = await queryFresh<AuditoriaSQLRow[]>(sql, params)

    const data: ReporteAuditoriaItem[] = rows.map((row) => {
      const actor = resolverActorAuditoria(
        Number(row.admin_id ?? 0),
        row.admin_email,
        row.admin_role
      )

      return {
        id: Number(row.id),
        admin_id: Number(row.admin_id ?? 0),
        actor_nombre: actor.actor_nombre,
        actor_tipo: actor.actor_tipo,
        admin_email: actor.admin_email,
        estatus_previo: String(row.estatus_previo || "---"),
        estatus_nuevo: String(row.estatus_nuevo || "---"),
        ip_accion: String(row.ip_accion || "127.0.0.1"),
        fecha_aprobacion: serializarFechaISO(row.fecha_aprobacion),
        alumno_nombre: String(row.alumno_nombre || ""),
        alumno_apellido: String(row.alumno_apellido || ""),
        alumno_cedula: String(row.alumno_cedula || ""),
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error("Error en obtenerReporteAuditoria:", error)
    return {
      success: false,
      data: [],
      error: "No fue posible consultar la bitácora de auditoría.",
    }
  }
}