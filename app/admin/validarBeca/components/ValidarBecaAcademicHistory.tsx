"use client"

import React, { useState } from "react"
import { 
  ChevronDown, ChevronUp, GraduationCap, 
  BookOpen, BarChart3, Clock 
} from "lucide-react"

/**
 * 🎓 COMPONENTE: StudentAcademicHistory
 * Visualización tecnológica del historial académico por periodos (Kardex).
 * Diseñado para ser utilizado en vistas de auditoría o expedientes detallados.
 */
export function StudentAcademicHistory({ historial, stats }: any) {
  // Estado para manejar qué periodo está expandido (por defecto el más reciente en el índice 0)
  const [abierto, setAbierto] = useState<number | null>(0)

  // 🟢 Utilidad profesional para asignación semántica de colores según calificación
  const getNotaBadge = (nota: any) => {
    const val = parseFloat(nota || 0);
    if (val >= 18) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    if (val >= 16) return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    if (val >= 10) return "bg-amber-500/10 text-amber-600 border-amber-500/20"
    return "bg-rose-500/10 text-rose-600 border-rose-500/20"
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      {/* 📊 MINI DASHBOARD ACADÉMICO: Resumen de métricas globales del estudiante */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Índice Histórico */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#d4a843] transition-all">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1a2744] transition-colors">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Índice Histórico</p>
            <p className="text-xl font-mono font-black text-[#1a2744] leading-tight">
              {stats?.promedioHistorico || "0.00"}
            </p>
          </div>
        </div>

        {/* Trayectoria / Periodos */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#d4a843] transition-all">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1a2744] transition-colors">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trayectoria</p>
            <p className="text-xl font-mono font-black text-[#1a2744] leading-tight">
              {stats?.totalPeriodos || 0} <span className="text-[10px] font-bold text-slate-300 italic uppercase">Trims</span>
            </p>
          </div>
        </div>

        {/* Materias Logradas */}
        <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4 group hover:border-[#d4a843] transition-all">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#d4a843] group-hover:bg-[#1a2744] transition-colors">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Materias Cargadas</p>
            <p className="text-xl font-mono font-black text-[#1a2744] leading-tight">
              {stats?.totalMaterias || 0}
            </p>
          </div>
        </div>
      </div>

      {/* 📜 SECCIÓN DE REGISTRO ACADÉMICO: Listado colapsable por periodos */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-1">
          <GraduationCap className="h-4 w-4 text-[#d4a843]" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Registro Académico Detectado</h3>
        </div>

        {!historial || historial.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-dashed border-slate-300 p-12 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
              No se han encontrado materias registradas <br /> en las solicitudes de este estudiante.
            </p>
          </div>
        ) : (
          historial.map((p: any, idx: number) => (
            <div key={p.id || idx} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden transition-all group">
              
              {/* CABECERA DE PERIODO (BOTÓN DE CONTROL) */}
              <button 
                onClick={() => setAbierto(abierto === idx ? null : idx)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  {/* Identificación del Periodo */}
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-[8px] font-black text-[#d4a843] uppercase tracking-tighter">Periodo {p.periodoCodigo}</span>
                    <span className="text-xs font-black text-[#1a2744] uppercase tracking-wide">{p.periodoNombre}</span>
                  </div>
                  
                  {/* Fecha de Registro (Oculto en móvil pequeño) */}
                  <div className="hidden sm:flex flex-col items-start leading-none border-l border-slate-200 pl-6">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Fecha Registro</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{p.fechaRegistro}</span>
                  </div>

                  {/* Nivel de Trimestre */}
                  {p.trimestre && (
                    <div className="hidden sm:flex flex-col items-start leading-none border-l border-slate-200 pl-6">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Nivel Académico</span>
                      <span className="text-[10px] font-bold text-slate-500 font-mono italic">Trimestre #{p.trimestre}</span>
                    </div>
                  )}

                  {/* Estatus de la Solicitud Origen (Informativo para el Admin) */}
                  <div className="hidden lg:flex flex-col items-start leading-none border-l border-slate-200 pl-6">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Estatus Origen</span>
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded mt-1 ${
                      p.estado === 'Aprobada' ? 'bg-emerald-50 text-emerald-600' : 
                      p.estado === 'Rechazada' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {p.estado}
                    </span>
                  </div>
                </div>

                {/* Resumen de Calificación del Periodo */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end leading-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Promedio Periodo</span>
                    <span className="text-sm font-mono font-black text-[#1a2744]">{p.promedio}</span>
                  </div>
                  {abierto === idx ? (
                    <ChevronUp className="h-4 w-4 text-slate-300" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-300" />
                  )}
                </div>
              </button>

              {/* CONTENIDO DESPLEGABLE: Detalle de asignaturas */}
              {abierto === idx && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="rounded-2xl border border-slate-100 overflow-hidden bg-slate-50/50">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100/50">
                          <th className="px-4 py-2 text-left text-[8px] font-black text-slate-400 uppercase tracking-widest">Cód.</th>
                          <th className="px-4 py-2 text-left text-[8px] font-black text-slate-400 uppercase tracking-widest">Asignatura</th>
                          <th className="px-4 py-2 text-center text-[8px] font-black text-slate-400 uppercase tracking-widest">Calificación</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {p.materias && p.materias.map((m: any, mIdx: number) => (
                          <tr key={mIdx} className="hover:bg-white transition-colors group/row">
                            <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400 font-bold uppercase">
                              {m.codigo || 'N/A'}
                            </td>
                            <td className="px-4 py-2.5 text-[10px] font-bold text-[#1a2744] uppercase tracking-tight">
                              {m.nombre}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-block min-w-[32px] py-1 rounded-lg border text-[10px] font-mono font-black ${getNotaBadge(m.nota)}`}>
                                {parseFloat(m.nota || 0).toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}