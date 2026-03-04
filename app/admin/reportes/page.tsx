"use client"

import React from "react"
import Link from "next/link" // Importamos Link para la navegación
import { 
  FileSpreadsheet, CalendarDays, CheckCircle2, XCircle, 
  UserCog, History, GraduationCap, Award 
} from "lucide-react"

import { PageHeader } from "@/components/admin/PageHeader"

const reportes = [
  {
    titulo: "Solicitudes por Fecha",
    descripcion: "Listado completo basado en la fecha de ingreso de la solicitud.",
    icon: CalendarDays,
    color: "bg-blue-500",
    link: "/admin/reportes/solicitudes-fecha"
  },
  {
    titulo: "Bitácora de Revisiones",
    descripcion: "Fecha exacta del estudio socioeconómico y cambios de estatus.",
    icon: History,
    color: "bg-indigo-500",
    // ACTUALIZADO: Apunta a tu nueva página modular
    link: "/admin/Historial-Aprobaciones" 
  },
  {
    titulo: "Becas Aprobadas",
    descripcion: "Reporte histórico de fechas de aprobación y activación.",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    link: "/admin/reportes/aprobadas"
  },
  {
    titulo: "Becas Rechazadas",
    descripcion: "Motivos y fechas de rechazo de solicitudes.",
    icon: XCircle,
    color: "bg-rose-500",
    link: "/admin/reportes/rechazadas"
  },
  {
    titulo: "Auditoría de Administradores",
    descripcion: "Registro de actividad y cambios realizados por usuarios.",
    icon: UserCog,
    color: "bg-slate-600",
    link: "/admin/reportes/auditoria"
  },
  {
    titulo: "Recurrencia Trimestral",
    descripcion: "Contador de beneficios recibidos por cada alumno.",
    icon: FileSpreadsheet,
    color: "bg-amber-500",
    link: "/admin/reportes/recurrencia"
  },
  {
    titulo: "Distribución por Carreras",
    descripcion: "Análisis demográfico de becados agrupados por carrera.",
    icon: GraduationCap,
    color: "bg-cyan-500",
    link: "/admin/reportes/carreras"
  },
  {
    titulo: "Tipos de Beca",
    descripcion: "Desglose operativo por categoría de beca.",
    icon: Award,
    color: "bg-violet-500",
    link: "/admin/reportes/tipos-beca"
  }
]

export default function ReportesPage() {
  return (
    <div className="space-y-4">
      
      <PageHeader 
        titulo="Centro de Reportes" 
        subtitulo="Generación y Exportación de Datos Operativos"
        mostrarExportar={false}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
        {reportes.map((rep, idx) => (
          /* Envolvemos todo en un Link para que sea clicable */
          <Link key={idx} href={rep.link}>
            <div className="group bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${rep.color} text-white shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                  <rep.icon className="h-4 w-4" />
                </div>
              </div>
              
              <h3 className="font-black text-[#1a2744] text-[11px] uppercase tracking-wide mb-1.5 group-hover:text-blue-700 transition-colors">
                {rep.titulo}
              </h3>
              
              <p className="text-slate-500 text-[10px] leading-snug flex-1 font-medium">
                {rep.descripcion}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                  Generar Reporte
                </span>
                <FileSpreadsheet className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center py-4 border-t border-slate-100">
        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-[0.4em]">
          Unimar &bull; Inteligencia de Negocios &bull; 2026
        </p>
      </div>
    </div>
  )
}