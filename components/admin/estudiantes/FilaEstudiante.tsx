"use client"

import React from "react"
import { Mail, Phone, BookOpen, Calendar, ChevronRight } from "lucide-react"

// 1. TIPADO ESTRICTO (Cero 'any')
export interface IEstudianteAdminFila {
  id?: number | string;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  email_institucional?: string;
  email?: string;
  telefono?: string;
  carrera?: string;
  semestre?: string | number;
  created_at?: string;
}

interface EstudianteProps {
  estudiante: IEstudianteAdminFila;
  onSelect?: (estudiante: IEstudianteAdminFila) => void;
}

export const FilaEstudiante = ({ estudiante, onSelect }: EstudianteProps) => {
  const esInteractivo = Boolean(onSelect && estudiante.cedula);

  const handleActivate = () => {
    if (onSelect && estudiante.cedula) {
      onSelect(estudiante);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (!esInteractivo) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate();
    }
  };

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
      className={`group flex flex-col md:table-row bg-white border border-slate-200 rounded-lg shadow-sm md:shadow-none md:border-none md:rounded-none transition-all overflow-hidden animate-in fade-in duration-300 ${
        esInteractivo
          ? "cursor-pointer hover:border-[#d4a843] md:hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-[#d4a843]/60"
          : "md:hover:bg-blue-50/30"
      }`}
    >
      {/* DATOS PERSONALES - Cabecera de tarjeta en móvil (order-1) */}
      <td className="order-1 md:order-none flex flex-row items-center justify-between md:table-cell px-3 py-2.5 md:px-5 md:py-3 bg-slate-50/60 md:bg-transparent">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 md:h-8 md:w-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-[#d4a843] font-black text-[10px] shadow-sm group-hover:scale-105 transition-transform shrink-0">
            {estudiante.nombre?.[0] || "U"}
            {estudiante.apellido?.[0] || "M"}
          </div>
          <div>
            <p className="font-black text-[#1e3a5f] text-[11px] uppercase tracking-tight leading-none group-hover:text-blue-800 transition-colors">
              {estudiante.apellido || "N/A"}, {estudiante.nombre || "N/A"}
            </p>
            <span className="inline-block mt-1 bg-white md:bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-200/50">
              V-{estudiante.cedula || "S/N"}
            </span>
          </div>
        </div>
        {esInteractivo && (
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#d4a843] group-hover:translate-x-0.5 transition-all md:hidden shrink-0" />
        )}
      </td>

      {/* ACADÉMICO - Subcabecera en móvil (order-2) */}
      <td className="order-2 md:order-none flex justify-between items-center md:table-cell px-3 py-2 md:px-5 md:py-3 border-t border-slate-100 md:border-none">
        <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest">
          Perfil
        </span>
        <div className="flex items-center gap-2.5 text-right md:text-left">
          <div className="p-1.5 bg-blue-50 rounded-md hidden md:block border border-blue-100/50">
            <BookOpen className="h-3 w-3 text-[#1e3a5f]" />
          </div>
          <div>
            <p
              className="text-[9px] font-black text-[#1e3a5f] uppercase leading-none truncate max-w-[130px]"
              title={estudiante.carrera}
            >
              {estudiante.carrera || "No asignada"}
            </p>
            <p className="text-[7.5px] text-[#d4a843] font-black uppercase mt-0.5 tracking-widest">
              {estudiante.semestre || "0"}° TRIMESTRE
            </p>
          </div>
        </div>
      </td>

      {/* CONTACTO - Info detallada (order-3) */}
      <td className="order-3 md:order-none flex flex-col md:table-cell px-3 py-2 md:px-5 md:py-3 border-t border-slate-100 md:border-none">
        <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          Contacto
        </span>
        <div className="space-y-1.5 md:space-y-1">
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

      {/* FECHA - Pie de tarjeta (order-4) */}
      <td className="order-4 md:order-none flex justify-between items-center md:table-cell px-3 py-2 md:px-5 md:py-3 border-t border-slate-100 md:border-none bg-slate-50/40 md:bg-transparent md:text-right font-mono text-[9px] font-bold text-slate-400">
        <span className="md:hidden text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <Calendar className="h-3 w-3 text-slate-300" /> Ingreso
        </span>
        <div className="inline-flex items-center justify-end gap-1.5">
          <span>
            {estudiante.created_at
              ? new Date(estudiante.created_at).toLocaleDateString("es-VE")
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