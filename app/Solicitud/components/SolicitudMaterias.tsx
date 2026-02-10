"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, BookOpen, GraduationCap } from "lucide-react"

export function SolicitudMaterias({ 
  disabled, 
  materiasGuardadas, 
  onChangeNotas 
}: { 
  disabled: boolean, 
  materiasGuardadas?: any[],
  onChangeNotas?: (notas: string[]) => void 
}) {
  // 🟢 Array de sugerencias para los primeros 4 placeholders
  const sugerenciasNombres = [
    "Ej: Matemática I",
    "Ej: Programación II",
    "Ej: Inglés Técnico",
    "Ej: Ética y Valores"
  ];

  // Estado inicial con 4 filas vacías
  const [materias, setMaterias] = useState<{ id: string; nombre: string; nota: string }[]>([
    { id: "1", nombre: "", nota: "" },
    { id: "2", nombre: "", nota: "" },
    { id: "3", nombre: "", nota: "" },
    { id: "4", nombre: "", nota: "" },
  ])

  // 🟢 CORRECCIÓN CRÍTICA: Carga de datos desde la BD (JSON)
  useEffect(() => {
    if (materiasGuardadas && materiasGuardadas.length > 0) {
      setMaterias(materiasGuardadas.map((m, index) => ({
        id: `db-${index}`,
        nombre: m.nombre || "", 
        nota: m.nota?.toString() || "" 
      })))
    }
  }, [materiasGuardadas])

  // 🟢 LÓGICA DE NOTIFICACIÓN AL PADRE
  useEffect(() => {
    if (!onChangeNotas) return;
    const notasValidas = materias.map(m => m.nota).filter(n => n !== "");
    onChangeNotas(notasValidas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materias]); 

  const manejarCambio = (id: string, campo: 'nombre' | 'nota', valor: string) => {
    // Validación estricta: Notas entre 1 y 20
    if (campo === 'nota' && valor !== "") {
      const num = parseFloat(valor);
      if (isNaN(num) || num < 0 || num > 20) return; 
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
    <div className="pt-6 border-t border-gray-100">
      {/* 🟢 AJUSTE: Se cambia justify-between por gap-4 para desplazar el botón a la izquierda */}
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> 1. Carga Académica del Trimestre
        </h3>
        {!disabled && (
          <Button 
            type="button" 
            onClick={agregarMateria} 
            size="sm" 
            variant="outline" 
            className="text-[10px] font-bold uppercase text-[#1e3a5f] border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white h-7 transition-all"
          >
            <Plus className="h-3 w-3 mr-1" /> Agregar Materia
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {materias.map((materia, index) => (
          <div key={materia.id} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-300">
            {/* Input Nombre Materia */}
            <div className="flex-1">
              {index === 0 && <Label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-1">Nombre de la Asignatura</Label>}
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input 
                  name="materias_nombres[]" 
                  // 🟢 LÓGICA DE PLACEHOLDER: Solo los 4 primeros tienen sugerencia, el resto vacío.
                  placeholder={index < 4 ? sugerenciasNombres[index] : ""} 
                  value={materia.nombre}
                  onChange={(e) => manejarCambio(materia.id, 'nombre', e.target.value)}
                  // 🟢 CORRECCIÓN VISUAL: Estilos condicionales para bloqueo oscuro
                  className={`pl-8 text-xs transition-colors font-medium ${
                    disabled 
                      ? "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed select-none opacity-100 pointer-events-none shadow-none" 
                      : "bg-white border-gray-200 text-[#1e3a5f] focus-visible:ring-[#1e3a5f]"
                  }`}
                  required 
                  // 🟢 IMPORTANTE: Usamos readOnly para que el valor viaje en el submit
                  readOnly={disabled}
                />
              </div>
            </div>

            {/* Input Calificación */}
            <div className="w-28">
              {index === 0 && <Label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-1">Nota (1-20)</Label>}
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input 
                  name="materias_notas[]" 
                  type="number" 
                  placeholder="1-20" 
                  min="1" 
                  max="20" 
                  step="0.01"
                  value={materia.nota}
                  onChange={(e) => manejarCambio(materia.id, 'nota', e.target.value)}
                  // 🟢 CORRECCIÓN VISUAL: Estilos condicionales para bloqueo oscuro
                  className={`pl-8 text-xs transition-colors font-bold text-center ${
                    disabled 
                      ? "bg-slate-200/60 border-slate-300 text-slate-500 cursor-not-allowed select-none opacity-100 pointer-events-none shadow-none" 
                      : "bg-white border-gray-200 text-[#1e3a5f]"
                  }`}
                  required 
                  // 🟢 IMPORTANTE: Usamos readOnly para que el valor viaje en el submit
                  readOnly={disabled}
                />
              </div>
            </div>

            {/* Botón Eliminar */}
            {!disabled && (
              <div className={`pt-${index === 0 ? '6' : '0'} flex items-center`}>
                <Button 
                  type="button" 
                  onClick={() => eliminarMateria(materia.id)}
                  disabled={materias.length <= 4}
                  size="icon"
                  variant="ghost"
                  className={`h-9 w-9 text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ${materias.length <= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-[9px] text-gray-400 mt-2 italic text-right">
        * Mínimo 4 asignaturas por trimestre. Rango de notas permitido: 1 a 20.
      </p>
    </div>
  )
}