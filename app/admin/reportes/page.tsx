"use client"

import React from "react"
import Link from "next/link"
import { 
  FileSpreadsheet, CalendarDays, CheckCircle2, XCircle, 
  UserCog, History, GraduationCap, Award, ChevronLeft 
} from "lucide-react"

// Definimos la estructura de las tarjetas de reporte para mantener el código limpio
const reportes = [
  {
    titulo: "Solicitudes por Fecha",
    descripcion: "Listado completo basado en la fecha de ingreso de la solicitud.",
    icon: CalendarDays,
    color: "bg-blue-500",
    link: "/admin/reportes/solicitudes-fecha" // Ruta futura
  },
  {
    titulo: "Bitácora de Revisiones",
    descripcion: "Fecha exacta del estudio socioeconómico y cambio a 'En Revisión'.",
    icon: History,
    color: "bg-indigo-500",
    link: "/admin/reportes/revisiones"
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
    descripcion: "¿Quién hizo el cambio? Registro de actividad de usuarios.",
    icon: UserCog,
    color: "bg-slate-600",
    link: "/admin/reportes/auditoria"
  },
  {
    titulo: "Recurrencia Trimestral",
    descripcion: "Contador de cuántas veces un alumno ha recibido beneficio.",
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
    descripcion: "Desglose financiero y operativo por categoría de beca.",
    icon: Award,
    color: "bg-violet-500",
    link: "/admin/reportes/tipos-beca"
  }
]

export default function ReportesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      
      {/* Encabezado */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
        <Link 
          href="/admin/dashboard" 
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-500"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1a2744] uppercase tracking-widest">
            Centro de Reportes
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-1">
            Generación y exportación de datos operativos
          </p>
        </div>
      </div>

      {/* Grid de Reportes */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reportes.map((rep, idx) => (
          <div 
            key={idx}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${rep.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <rep.icon className="h-6 w-6" />
              </div>
            </div>
            
            <h3 className="font-black text-[#1a2744] text-sm uppercase tracking-wide mb-2 group-hover:text-blue-700 transition-colors">
              {rep.titulo}
            </h3>
            
            <p className="text-slate-500 text-xs leading-relaxed flex-1">
              {rep.descripcion}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600">
                Generar
              </span>
              <FileSpreadsheet className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}