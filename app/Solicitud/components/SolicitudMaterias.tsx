"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, BookOpen } from "lucide-react"

export function SolicitudMaterias({ 
  disabled, 
  materiasGuardadas, 
  onChangeNotas 
}: { 
  disabled: boolean, 
  materiasGuardadas?: any[],
  onChangeNotas?: (notas: string[]) => void 
}) {
  const sugerenciasNombres = [
    "Ej: Matemática I",
    "Ej: Programación II",
    "Ej: Inglés Técnico",
    "Ej: Ética y Valores"
  ];

  const [materias, setMaterias] = useState<{ id: string; nombre: string; nota: string }[]>([
    { id: "1", nombre: "", nota: "" },
    { id: "2", nombre: "", nota: "" },
    { id: "3", nombre: "", nota: "" },
    { id: "4", nombre: "", nota: "" },
  ])

  useEffect(() => {
    if (materiasGuardadas && materiasGuardadas.length > 0) {
      setMaterias(materiasGuardadas.map((m, index) => ({
        id: `db-${index}`,
        nombre: m.nombre || "", 
        nota: m.nota?.toString() || "" 
      })))
    }
  }, [materiasGuardadas])

  // 🟢 LÓGICA DE NOTIFICACIÓN: Si la nota está vacía, se envía como "0"
  useEffect(() => {
    if (!onChangeNotas) return;
    const notasProcesadas = materias.map(m => m.nota === "" ? "0" : m.nota);
    onChangeNotas(notasProcesadas);
  }, [materias, onChangeNotas]); 

  const manejarCambio = (id: string, campo: 'nombre' | 'nota', valor: string) => {
    if (campo === 'nota') {
      // 🟢 BLOQUEO DE LETRAS: Solo permite números y un punto decimal
      const valorLimpio = valor.replace(/[^0-9.]/g, '');
      
      if (valorLimpio !== "") {
        const num = parseFloat(valorLimpio);
        if (isNaN(num) || num < 0 || num > 20) return; 
      }
      
      setMaterias(prev => prev.map(m => 
        m.id === id ? { ...m, nota: valorLimpio } : m
      ))
      return;
    }

    setMaterias(prev => prev.map(m => 
      m.id === id ? { ...m, [campo]: valor } : m
    ))
  }

  const agregarMateria = () => {
    setMaterias(prev => [...prev, { id: Math.random().toString(36), nombre: "", nota: "" }])
  }

  const eliminarMateria = (id: string) => {
    if (materias.length > 4) {
      setMaterias(prev => prev.filter(m => m.id !== id))
    }
  }

  return (
    <div className="pt-2">
      {/* Encabezado Minimalista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
            <h3 className="text-sm font-black text-[#1e3a5f] uppercase tracking-[0.15em] flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f]/5 text-[#d4a843]">
                <BookOpen className="h-4 w-4" />
            </span>
            Carga Académica
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-10">
                Trimestre en curso
            </p>
        </div>

        {!disabled && (
          <Button 
            type="button" 
            onClick={agregarMateria} 
            variant="outline" 
            className="group h-9 px-4 border-dashed border-2 border-slate-200 hover:border-[#1e3a5f] hover:bg-slate-50 text-[#1e3a5f] transition-all rounded-xl"
          >
            <Plus className="h-3.5 w-3.5 mr-2 text-[#d4a843] group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Añadir Asignatura</span>
          </Button>
        )}
      </div>

      {/* Lista de Materias */}
      <div className="space-y-3">
        {materias.map((materia, index) => (
          <div 
            key={materia.id} 
            className="group flex gap-4 items-center p-2 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300"
          >
            {/* Indicador Numérico */}
            <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-black text-slate-300 border border-slate-100 group-hover:text-[#d4a843] group-hover:border-[#d4a843]/20 transition-colors">
                {index + 1}
            </div>

            {/* Nombre de la Materia */}
            <div className="flex-1">
              <Input 
                name="materias_nombres[]" 
                placeholder={index < 4 ? sugerenciasNombres[index] : "Nombre de la materia..."} 
                value={materia.nombre}
                onChange={(e) => manejarCambio(materia.id, 'nombre', e.target.value)}
                className={`h-11 border-none bg-white shadow-sm rounded-xl text-xs font-bold text-[#1e3a5f] placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/5 transition-all ${
                  disabled 
                    ? "bg-slate-100/50 text-slate-400 cursor-not-allowed opacity-100 shadow-none" 
                    : "group-hover:shadow-md"
                }`}
                required 
                readOnly={disabled}
              />
            </div>

            {/* Calificación */}
            <div className="w-24 md:w-32 relative">
              <Input 
                name="materias_notas[]" 
                type="text" 
                inputMode="decimal"
                placeholder="00.0" 
                value={materia.nota}
                onChange={(e) => manejarCambio(materia.id, 'nota', e.target.value)}
                className={`h-11 border-none bg-white shadow-sm rounded-xl text-xs font-black text-center pr-8 text-[#1e3a5f] focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/5 transition-all ${
                  disabled 
                    ? "bg-slate-100/50 text-slate-400 opacity-100 shadow-none" 
                    : "group-hover:shadow-md"
                }`}
                required 
                readOnly={disabled}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase pointer-events-none group-hover:text-[#d4a843] transition-colors">
                pts
              </span>
            </div>

            {/* Eliminar */}
            {!disabled && (
              <div className="flex items-center">
                <Button 
                  type="button" 
                  onClick={() => eliminarMateria(materia.id)}
                  disabled={materias.length <= 4}
                  size="icon"
                  variant="ghost"
                  // 🟢 ICONO SIEMPRE ROJO: Clases text-red-500 y hover:text-red-700 corregidas
                  className={`h-9 w-9 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all ${materias.length <= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer Informativo */}
      <div className="mt-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-[#d4a843]/20"></div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                Validación de escala 01-20
            </p>
        </div>
        <p className="text-[9px] text-slate-300 font-medium">
            Mínimo 4 materias obligatorias
        </p>
      </div>
    </div>
  )
}