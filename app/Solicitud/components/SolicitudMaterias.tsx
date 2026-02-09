"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, BookOpen, GraduationCap } from "lucide-react"

export function SolicitudMaterias({ disabled, materiasGuardadas }: { disabled: boolean, materiasGuardadas?: any[] }) {
  // Estado inicial: Si hay materias guardadas, las usamos. Si no, creamos 4 filas vacías por defecto.
  const [materias, setMaterias] = useState<{ id: number; nombre: string; nota: string }[]>([
    { id: 1, nombre: "", nota: "" },
    { id: 2, nombre: "", nota: "" },
    { id: 3, nombre: "", nota: "" },
    { id: 4, nombre: "", nota: "" },
  ])

  // Efecto para cargar datos si vienen de la base de datos (Modo Revisión)
  useEffect(() => {
    if (materiasGuardadas && materiasGuardadas.length > 0) {
      setMaterias(materiasGuardadas.map((m, index) => ({
        id: index,
        nombre: m.nombre_materia,
        nota: m.calificacion
      })))
    }
  }, [materiasGuardadas])

  const agregarMateria = () => {
    setMaterias([...materias, { id: Date.now(), nombre: "", nota: "" }])
  }

  const eliminarMateria = (index: number) => {
    // Regla de negocio: Mínimo 4 materias
    if (materias.length > 4) {
      const nuevasMaterias = [...materias]
      nuevasMaterias.splice(index, 1)
      setMaterias(nuevasMaterias)
    }
  }

  return (
    <div className="pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Carga Académica del Trimestre
        </h3>
        {!disabled && (
          <Button 
            type="button" 
            onClick={agregarMateria} 
            size="sm" 
            variant="outline" 
            className="text-[10px] font-bold uppercase text-[#1e3a5f] border-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white h-7"
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
                  placeholder={`Materia ${index + 1}`}
                  defaultValue={materia.nombre}
                  className="pl-8 text-xs bg-white border-gray-200 focus-visible:ring-[#1e3a5f]" 
                  required 
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Input Calificación */}
            <div className="w-28">
              {index === 0 && <Label className="text-[9px] font-black uppercase text-gray-400 mb-1.5 block ml-1">Calificación</Label>}
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input 
                  name="materias_notas[]" 
                  type="number" 
                  placeholder="0-20" 
                  min="0" 
                  max="20" 
                  step="0.01"
                  defaultValue={materia.nota}
                  className="pl-8 text-xs bg-white border-gray-200 font-bold text-[#1e3a5f] text-center" 
                  required 
                  disabled={disabled}
                />
              </div>
            </div>

            {/* Botón Eliminar (Solo si hay más de 4) */}
            {!disabled && (
              <div className={`pt-${index === 0 ? '6' : '0'} flex items-center`}>
                <Button 
                  type="button" 
                  onClick={() => eliminarMateria(index)}
                  disabled={materias.length <= 4}
                  size="icon"
                  variant="ghost"
                  className={`h-9 w-9 text-rose-400 hover:text-rose-600 hover:bg-rose-50 ${materias.length <= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-[9px] text-gray-400 mt-2 italic text-right">
        * Ingrese todas las materias cursadas en el periodo actual. Mínimo 4 asignaturas.
      </p>
    </div>
  )
}