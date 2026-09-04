"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap } from "lucide-react"
import { SeccionFormulario } from "./EncuestaUI"

/**
 * 🟢 COMPONENTE: CARGA ACADÉMICA AUTOMATIZADA
 * Se ha reemplazado el Select por un Input bloqueado para forzar el trimestre correcto.
 */
export function SolicitudMaterias({ 
  disabled, 
  materiasGuardadas, 
  materiasDelPensum, 
  onChangeNotas,
  onChangeTrimestre, 
  isOpen,
  onToggle,
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
    // Si el componente se monta y no hay un trimestre seleccionado aún
    if (!trimestreActual && onChangeTrimestre) {
        // Calculamos el anterior (mínimo 1) basándonos en la prop que viene del servidor
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
    <SeccionFormulario
      titulo="1. Carga Académica y Notas"
      icono={BookOpen}
      iconoBg="bg-[#1e3a5f]"
      iconoColor="text-[#d4a843]"
      estaAbierto={isOpen}
      alAlternar={onToggle}
    >
      <div className="pt-4 space-y-6">
        
        {/* INDICADOR DE TRIMESTRE BLOQUEADO */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#d4a843]">
                    <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Ubicación Académica</p>
                    <p className="text-sm font-bold text-[#1e3a5f]">Trimestre Cursado (Evaluado)</p>
                </div>
            </div>

            {/* Input bloqueado que sustituye al Select */}
            <div className="w-full md:w-[200px] relative">
                <Input 
                  value={`Trimestre ${trimestreActual || ""}`}
                  readOnly
                  className="h-11 rounded-xl border-none bg-white font-bold text-[#1e3a5f] shadow-sm text-center cursor-not-allowed select-none"
                />
            </div>
        </div>

        <div className="space-y-3">
          {materias.length > 0 ? (
            materias.map((materia) => (
              <div 
                key={materia.id} 
                className="group flex gap-3 md:gap-4 items-center p-3 rounded-2xl border border-slate-50 bg-white hover:border-[#d4a843]/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tighter">
                    Cód: {materia.codigo}
                  </p>
                  <Input 
                    name="materias_nombres[]" 
                    value={materia.nombre}
                    className="h-10 border-none p-0 bg-transparent text-xs font-bold text-[#1e3a5f] shadow-none focus-visible:ring-0 cursor-default"
                    readOnly
                  />
                  <input type="hidden" name="materias_codigos[]" value={materia.codigo} />
                </div>

                <div className="w-24 md:w-32 relative">
                  <Input 
                    name="materias_notas[]" 
                    type="text" 
                    inputMode="decimal"
                    placeholder="0.0" 
                    value={materia.nota}
                    onChange={(e) => manejarCambioNota(materia.id, e.target.value)}
                    className={`h-11 border-slate-200 bg-white shadow-sm rounded-xl text-xs font-black text-center pr-8 text-[#1e3a5f] focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/5 transition-all ${
                      disabled ? "bg-slate-100/50 text-slate-400 shadow-none" : "group-hover:border-[#1e3a5f]"
                    }`}
                    required 
                    readOnly={disabled}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase">
                    pts
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                <BookOpen className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Cargando materias oficiales del pensum...
                </p>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between px-2 pt-4 border-t border-slate-50">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
              * Datos vinculados al pensum oficial de su carrera
          </p>
        </div>
      </div>
    </SeccionFormulario>
  )
}