"use client"

import React from "react"
import { Mail, Phone, BookOpen } from "lucide-react"

interface EstudianteProps {
  estudiante: any
}

export const FilaEstudiante = ({ estudiante }: EstudianteProps) => {
  return (
    <tr className="hover:bg-blue-50/30 transition-all group animate-in fade-in duration-300">
      
      {/* DATOS PERSONALES - COMPACTO */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-[#d4a843] font-black text-[10px] shadow-sm group-hover:scale-105 transition-transform shrink-0">
            {estudiante.nombre?.[0] || 'U'}{estudiante.apellido?.[0] || 'M'}
          </div>
          <div>
            <p className="font-black text-[#1e3a5f] text-[11px] uppercase tracking-tight leading-none">
              {estudiante.apellido || "N/A"}, {estudiante.nombre || "N/A"}
            </p>
            <span className="inline-block mt-1 bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-200/50">
              V-{estudiante.cedula || "S/N"}
            </span>
          </div>
        </div>
      </td>

      {/* CONTACTO - COMPACTO */}
      <td className="px-5 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold group-hover:text-[#1a2744] transition-colors">
            <Mail className="h-3 w-3 text-[#d4a843] shrink-0" /> 
            {estudiante.email_institucional || estudiante.email || "No registrado"}
          </div>
          <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold">
            <Phone className="h-3 w-3 text-[#d4a843] shrink-0" /> 
            {estudiante.telefono || "No registrado"}
          </div>
        </div>
      </td>

      {/* ACADÉMICO - COMPACTO */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-50 rounded-md hidden sm:block border border-blue-100/50">
            <BookOpen className="h-3 w-3 text-[#1e3a5f]" />
          </div>
          <div>
            <p className="text-[9px] font-black text-[#1e3a5f] uppercase leading-none truncate max-w-[130px]" title={estudiante.carrera}>
              {estudiante.carrera || "No asignada"}
            </p>
            <p className="text-[7.5px] text-[#d4a843] font-black uppercase mt-0.5 tracking-widest">
              {estudiante.semestre || "0"}° TRIMESTRE
            </p>
          </div>
        </div>
      </td>

      {/* FECHA - COMPACTO */}
      <td className="px-5 py-3 text-right font-mono text-[9px] font-bold text-slate-400">
        {estudiante.created_at ? new Date(estudiante.created_at).toLocaleDateString('es-VE') : "---"}
      </td>
    </tr>
  )
}