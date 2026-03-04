"use client"

import React from "react"
import { ArrowLeft, Loader2, GraduationCap } from "lucide-react"
import { StudentAcademicHistory } from "./StudentAcademicHistory"

interface AcademicViewProps {
  selectedSolicitud: any;
  dataHistorial: any;
  loadingHistorial: boolean;
  onClose: () => void;
}

export function SolicitudesViewAcademic({ selectedSolicitud, dataHistorial, loadingHistorial, onClose }: AcademicViewProps) {
  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
        <button onClick={onClose} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#1a2744] transition-all group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Cerrar Expediente
        </button>
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-[#1a2744]">
             Expediente Académico: {selectedSolicitud.nombre} {selectedSolicitud.apellido}
           </span>
        </div>
      </div>
      {loadingHistorial ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
          <Loader2 className="h-10 w-10 animate-spin text-[#d4a843] mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultando MariaDB...</p>
        </div>
      ) : dataHistorial && dataHistorial.data.length > 0 ? (
        <StudentAcademicHistory historial={dataHistorial.data} stats={dataHistorial.stats} />
      ) : (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
          <GraduationCap className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">
            No se detectaron registros de materias para este estudiante.
          </p>
        </div>
      )}
    </div>
  )
}