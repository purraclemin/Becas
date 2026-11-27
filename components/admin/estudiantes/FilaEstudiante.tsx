"use client"

import React from "react"
import { Mail, Phone, BookOpen, Calendar, ChevronRight, Archive } from "lucide-react"
import {
  esEgresadoPorSemestre,
  getBadgeColor
} from "@/app/admin/validarBeca/lib/ValidarBecaUtils"

export interface IEstudianteAdminFila {
  id?: number | string
  nombre?: string
  apellido?: string
  cedula?: string
  email_institucional?: string
  email?: string
  correo?: string
  telefono?: string
  carrera?: string
  semestre?: string | number
  created_at?: string
  estatus_actual?: string
  tipo_beca_actual?: string
  periodo_codigo?: string
}

interface EstudianteProps {
  estudiante: IEstudianteAdminFila
  onSelect?: (estudiante: IEstudianteAdminFila) => void
}

export const FilaEstudiante = ({ estudiante, onSelect }: EstudianteProps) => {
  const esInteractivo = Boolean(onSelect && estudiante.cedula)
  const esEgresado = esEgresadoPorSemestre(estudiante.semestre)
  const estatus = String(estudiante.estatus_actual || "").trim()
  const esFinalizada = estatus.toLowerCase() === "finalizada"
  const correoMostrar =
    estudiante.email_institucional ||
    estudiante.correo ||
    estudiante.email ||
    "No registrado"

  const handleActivate = () => {
    if (onSelect && estudiante.cedula) {
      onSelect(estudiante)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!esInteractivo) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleActivate()
    }
  }

  return (
    <tr
      role={esInteractivo ? "button" : undefined}
      tabIndex={esInteractivo ? 0 : undefined}
      onClick={esInteractivo ? handleActivate : undefined}
      onKeyDown={esInteractivo ? handleKeyDown : undefined}
      title={
        esInteractivo
          ? `Abrir auditoría de ${estudiante.nombre || ""} ${estudiante.apellido || ""}`.trim()
          : undefined
      }
      className={`group flex flex-col md:table-row bg-white border rounded-xl md:rounded-none shadow-sm md:shadow-none md:border-none transition-all overflow-hidden animate-in fade-in duration-300 ${
        esFinalizada ? "border-teal-200" : "border-slate-200"
      } ${
        esInteractivo
          ? "cursor-pointer hover:border-[#d4a843] md:hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/60"
          : "md:hover:bg-blue-50/30"
      }`}
    >
      {/* 1. DATOS PERSONALES */}
      <td className="order-1 md:order-none flex flex-row items-center justify-between md:table-cell px-4 py-3 md:px-4 md:py-2.5 bg-[#f8fafc] md:bg-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-9 w-9 md:h-8 md:w-8 rounded-lg flex items-center justify-center font-black text-xs md:text-[10px] shadow-2xs group-hover:scale-105 transition-transform shrink-0 ${
              esFinalizada
                ? "bg-teal-600 text-white"
                : "bg-[#1e3a5f] text-[#d4a843]"
            }`}
          >
            {estudiante.nombre?.[0] || "U"}
            {estudiante.apellido?.[0] || "M"}
          </div>
          <div className="min-w-0">
            <p className="font-black text-[#1e3a5f] text-sm md:text-xs uppercase tracking-tight leading-tight group-hover:text-blue-800 transition-colors truncate">
              {estudiante.apellido || "N/A"}, {estudiante.nombre || "N/A"}
            </p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-block bg-white md:bg-slate-100 text-slate-600 text-[10px] md:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-200">
                V-{estudiante.cedula || "S/N"}
              </span>
              {estudiante.periodo_codigo && (
                <span className="text-[9px] font-black text-slate-400 uppercase">
                  {estudiante.periodo_codigo}
                </span>
              )}
            </div>
          </div>
        </div>
        {esInteractivo && (
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#d4a843] group-hover:translate-x-0.5 transition-all md:hidden shrink-0" />
        )}
      </td>

      {/* 2. PERFIL ACADÉMICO / ESTATUS */}
      <td className="order-2 md:order-none flex justify-between items-center gap-2 md:table-cell px-4 py-2.5 md:px-4 md:py-2.5 border-t border-slate-100 md:border-none">
        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
          Perfil
        </span>
        <div className="flex items-center gap-2.5 text-right md:text-left">
          <div className="p-1.5 bg-blue-50 rounded-md hidden md:block border border-blue-100/70 shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-[#1e3a5f]" />
          </div>
          <div className="min-w-0">
            <p
              className="text-xs font-black text-[#1e3a5f] uppercase leading-tight truncate max-w-[200px]"
              title={estudiante.carrera}
            >
              {estudiante.carrera || "No asignada"}
            </p>
            <div className="flex items-center justify-end md:justify-start gap-1.5 mt-1 flex-wrap">
              <span
                className={`text-[10px] md:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                  esEgresado
                    ? "bg-teal-50 text-teal-800 border-teal-200"
                    : "bg-amber-50/70 text-[#1e3a5f] border-[#d4a843]/30"
                }`}
              >
                {esEgresado ? "Egresado" : `${estudiante.semestre || "1"}° Trimestre`}
              </span>
              {estatus && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] md:text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getBadgeColor(
                    estatus
                  )}`}
                >
                  {esFinalizada && <Archive className="h-2.5 w-2.5" />}
                  {estatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* 3. INFORMACIÓN DE CONTACTO */}
      <td className="order-3 md:order-none flex flex-col md:table-cell px-4 py-2.5 md:px-4 md:py-2.5 border-t border-slate-100 md:border-none">
        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Contacto
        </span>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs md:text-[11px] text-slate-600 font-bold group-hover:text-[#1a2744] transition-colors">
            <Mail className="h-3.5 w-3.5 md:h-3 md:w-3 text-[#d4a843] shrink-0" />
            <span className="truncate max-w-[240px]">{correoMostrar}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-[11px] text-slate-600 font-bold">
            <Phone className="h-3.5 w-3.5 md:h-3 md:w-3 text-[#d4a843] shrink-0" />
            <span>{estudiante.telefono || "No registrado"}</span>
          </div>
        </div>
      </td>

      {/* 4. FECHA INGRESO */}
      <td className="order-4 md:order-none flex justify-between items-center md:table-cell px-4 py-2.5 md:px-4 md:py-2.5 border-t border-slate-100 md:border-none bg-[#f8fafc]/60 md:bg-transparent md:text-right font-mono text-xs md:text-[11px] font-bold text-slate-500 whitespace-nowrap">
        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Calendar className="h-3 w-3 text-slate-400" /> Ingreso
        </span>
        <div className="inline-flex items-center justify-end gap-1.5">
          <span>
            {estudiante.created_at
              ? new Date(estudiante.created_at).toLocaleDateString("es-VE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "---"}
          </span>
          {esInteractivo && (
            <ChevronRight className="hidden md:inline-block h-3.5 w-3.5 text-slate-300 group-hover:text-[#d4a843] group-hover:translate-x-0.5 transition-all shrink-0" />
          )}
        </div>
      </td>
    </tr>
  )
}
