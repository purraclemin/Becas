"use client"

import React from "react"
import { ArrowLeft, BookOpen, GraduationCap, Award, Loader2 } from "lucide-react"

interface EstudianteSolicitudAcademic {
  nombre?: string;
  apellido?: string;
  cedula?: string;
  carrera?: string;
  promedio_notas?: number | string;
  tipo_beca?: string;
  semestre?: number | string;
  trimestre?: number | string;
}

interface HistorialAcademicoData {
  success?: boolean;
  [key: string]: any;
}

interface ValidarBecaViewAcademicProps {
  selectedSolicitud: EstudianteSolicitudAcademic | null;
  dataHistorial: HistorialAcademicoData | null;
  loadingHistorial: boolean;
  onClose: () => void;
}

export function ValidarBecaViewAcademic({ 
  selectedSolicitud, 
  dataHistorial, 
  loadingHistorial, 
  onClose 
}: ValidarBecaViewAcademicProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6">
      {/* CABECERA DE LA VISTA ACADÉMICA */}
      <div className="bg-[#1e3a5f] rounded-2xl p-6 text-white shadow-lg border border-[#1e3a5f]/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[#d4a843] transition-all"
            title="Volver a la lista"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-5 w-5 text-[#d4a843]" />
              <h1 className="text-lg font-black tracking-wider uppercase">Kardex Académico del Estudiante</h1>
            </div>
            <p className="text-xs text-slate-300">
              {selectedSolicitud?.nombre || ""} {selectedSolicitud?.apellido || ""} • V-{selectedSolicitud?.cedula || ""}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#172e4d] rounded-xl border border-white/10">
          <Award className="h-4 w-4 text-[#d4a843]" />
          <span className="text-[10px] font-black uppercase tracking-wider">Carrera: {selectedSolicitud?.carrera || "S/I"}</span>
        </div>
      </div>

      {/* CONTENEDOR DE DATOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 min-h-[400px]">
        {loadingHistorial ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cargando historial de materias...</span>
          </div>
        ) : dataHistorial ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#1e3a5f]" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Promedio General</p>
                  <p className="text-sm font-black text-[#1e3a5f]">{selectedSolicitud?.promedio_notas || "0.00"}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <Award className="h-5 w-5 text-[#d4a843]" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Tipo de Beneficio</p>
                  <p className="text-sm font-black text-[#1e3a5f]">{selectedSolicitud?.tipo_beca || "S/I"}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-[#1e3a5f]" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase">Trimestre Actual</p>
                  <p className="text-sm font-black text-[#1e3a5f]">{selectedSolicitud?.semestre || selectedSolicitud?.trimestre || "0"}</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-200 text-center">
              <p className="text-xs text-slate-600 font-medium">
                Historial de materias sincronizado correctamente para la validación de la beca institucional.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <p className="text-xs uppercase font-bold">No se encontró historial académico disponible.</p>
          </div>
        )}
      </div>
    </div>
  )
}