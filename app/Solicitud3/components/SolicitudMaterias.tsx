"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { BookOpen, GraduationCap, CheckCircle2, Info } from "lucide-react"

/**
 * 🟢 COMPONENTE: CARGA ACADÉMICA (Diseño High-Density)
 * Se han reducido escalas de fuentes, paddings y alturas para un look profesional.
 */
export function SolicitudMaterias({ 
  disabled, 
  materiasGuardadas, 
  materiasDelPensum, 
  onChangeNotas,
  onChangeTrimestre, 
  trimestreActual
}: { 
  disabled: boolean, 
  materiasGuardadas?: any[],
  materiasDelPensum?: any[], 
  onChangeNotas?: (notas: string[]) => void,
  onChangeTrimestre?: (t: string) => void,
  isOpen: boolean,
  onToggle: () => void,
  trimestreActual?: any
}) {
  
  const [materias, setMaterias] = useState<{ id: string; nombre: string; nota: string; codigo: string }[]>([])

  // 1. LÓGICA DE INICIALIZACIÓN AUTOMÁTICA
  useEffect(() => {
    if (!trimestreActual && onChangeTrimestre) {
        const sugerido = Math.max(1, (parseInt(trimestreActual) || 1) - 1);
        onChangeTrimestre(sugerido.toString());
    }
  }, [trimestreActual, onChangeTrimestre]);

  // 2. SINCRONIZACIÓN DE DATOS
  useEffect(() => {
    if (materiasGuardadas && materiasGuardadas.length > 0) {
      setMaterias(materiasGuardadas.map((m, index) => ({
        id: m.codigo_materia || `db-${index}`,
        nombre: m.nombre || m.nombre_materia || "", 
        nota: m.nota?.toString() || "",
        codigo: m.codigo_materia || ""
      })))
    } else if (materiasDelPensum && materiasDelPensum.length > 0) {
      setMaterias(materiasDelPensum.map(m => ({
        id: m.codigo_materia,
        nombre: m.nombre_materia,
        nota: "",
        codigo: m.codigo_materia
      })))
    } else {
      setMaterias([])
    }
  }, [materiasGuardadas, materiasDelPensum])

  // 3. NOTIFICACIÓN DE NOTAS AL PADRE
  useEffect(() => {
    if (!onChangeNotas) return;
    const notasProcesadas = materias.map(m => m.nota === "" ? "0" : m.nota);
    onChangeNotas(notasProcesadas);
  }, [materias, onChangeNotas]);

  const manejarCambioNota = (id: string, valor: string) => {
    const valorLimpio = valor.replace(/[^0-9.]/g, '');
    if (valorLimpio !== "") {
      const num = parseFloat(valorLimpio);
      if (isNaN(num) || num < 0 || num > 20) return; 
    }
    setMaterias(prev => prev.map(m => m.id === id ? { ...m, nota: valorLimpio } : m))
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* CABECERA DE SECCIÓN (Compacta) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-[#1e3a5f] shadow-md flex items-center justify-center text-[#d4a843]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase text-[#1e3a5f] tracking-widest leading-none">Carga Académica Oficial</h3>
            <p className="text-[8px] text-slate-400 uppercase font-bold mt-1 tracking-tighter opacity-70">Trimestre evaluado para adjudicación</p>
          </div>
        </div>

        <div className="relative group min-w-[180px] z-10 scale-95 origin-right">
          <div className="absolute -top-2 left-3 bg-[#1e3a5f] text-white px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest z-20">
            Período
          </div>
          <Input 
            value={`TRIMESTRE ${trimestreActual || ""}`}
            readOnly
            className="h-10 rounded-xl border border-slate-200 bg-white font-black text-[#1e3a5f] text-center cursor-not-allowed text-[10px] tracking-widest shadow-none"
          />
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-emerald-500" />
        </div>
      </div>

      {/* TABLA DE MATERIAS (Diseño de Alta Densidad) */}
      <div className="space-y-3">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 mb-1">
            <div className="col-span-9">
                <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">Asignatura</span>
            </div>
            <div className="col-span-3 text-right pr-4">
                <span className="text-[8px] font-black uppercase text-slate-300 tracking-[0.2em]">Nota</span>
            </div>
        </div>

        <div className="space-y-2">
          {materias.length > 0 ? (
            materias.map((materia) => (
              <div 
                key={materia.id} 
                className={`group grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-5 py-3 rounded-xl border transition-all duration-200 ${
                    disabled 
                    ? "bg-slate-50 border-transparent opacity-70" 
                    : "bg-white border-slate-100 hover:border-[#1e3a5f]/20 hover:shadow-sm"
                }`}
              >
                <div className="md:col-span-9 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-12 rounded bg-slate-100/50 flex items-center justify-center text-[7px] font-black text-slate-400 border border-slate-100 shrink-0">
                      {materia.codigo}
                    </span>
                    <p className="text-[11px] font-bold text-[#1e3a5f] uppercase tracking-tight">
                        {materia.nombre}
                    </p>
                  </div>
                  <input type="hidden" name="materias_nombres[]" value={materia.nombre} />
                  <input type="hidden" name="materias_codigos[]" value={materia.codigo} />
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <div className="relative w-full md:w-24">
                    <Input 
                      name="materias_notas[]" 
                      type="text" 
                      inputMode="decimal"
                      placeholder="00" 
                      value={materia.nota}
                      onChange={(e) => manejarCambioNota(materia.id, e.target.value)}
                      className={`h-9 border rounded-lg text-[10px] font-black text-center pr-8 transition-all ${
                        disabled 
                        ? "bg-slate-50 border-transparent text-slate-400" 
                        : "bg-slate-50/30 border-slate-200 text-[#1e3a5f] focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/10 focus-visible:border-[#1e3a5f]"
                      }`}
                      required 
                      readOnly={disabled}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[7px] font-black text-slate-400 uppercase italic">
                      pts
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <BookOpen className="h-6 w-6 text-slate-200 mx-auto mb-2 animate-pulse" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">
                  Sincronizando carga académica...
                </p>
            </div>
          )}
        </div>
      </div>
      
      {/* AVISO (Reducido) */}
      <div className="p-4 bg-amber-50/20 rounded-xl border border-amber-100/50 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-500 shrink-0" />
        <p className="text-[8px] text-amber-800/70 leading-relaxed font-bold uppercase tracking-tight italic">
          Las calificaciones suministradas serán cruzadas con el sistema de control de estudios. Cualquier discrepancia invalidará la solicitud.
        </p>
      </div>
    </div>
  )
}