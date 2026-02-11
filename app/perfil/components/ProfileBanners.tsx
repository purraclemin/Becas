"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { renovarBeca } from "@/lib/ActionsRenovacion"
import { 
  ClipboardCheck, 
  RotateCcw, 
  BookCheck, 
  Plus, 
  Trash2, 
  BookOpen, 
  Send, 
  Loader2, 
  AlertTriangle,
  X 
} from "lucide-react"

/**
 * BANNER 1: POSTULACIÓN INICIAL (Estático)
 */
export function ActionBanner() {
  return (
    <div className="p-6 md:p-10 rounded-2xl border-2 border-dashed border-[#d4a843] bg-[#d4a843]/5 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all hover:bg-[#d4a843]/10 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#d4a843]/20">
          <ClipboardCheck className="h-8 w-8 text-[#d4a843]" />
        </div>
        <div>
          <h4 className="text-base md:text-lg font-black text-[#1e3a5f] uppercase tracking-tight">¿Deseas postularte?</h4>
          <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">El proceso de solicitudes para el nuevo periodo está abierto.</p>
        </div>
      </div>
      <Link href="/Solicitud" className="w-full lg:w-auto">
        <Button className="w-full bg-[#1e3a5f] text-[#d4a843] hover:bg-[#1a2744] transition-all font-black text-xs uppercase tracking-widest px-10 py-7 shadow-xl hover:scale-105 active:scale-95">
          Iniciar Solicitud
        </Button>
      </Link>
    </div>
  )
}

/**
 * BANNER 2: RENOVACIÓN ACADÉMICA INTERACTIVA
 * Permite cargar notas y renovar sin salir del perfil.
 */
export function RenovationBanner({ 
  materias, 
  periodo, 
  periodoNotas, 
  userId 
}: { 
  materias: any[], 
  periodo: string, 
  periodoNotas?: string,
  userId: number 
}) {
  const [isRenovating, setIsRenovating] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Estado para la carga académica minimalista
  const [nuevasMaterias, setNuevasMaterias] = useState([
    { id: "1", nombre: "", nota: "" },
    { id: "2", nombre: "", nota: "" },
    { id: "3", nombre: "", nota: "" },
    { id: "4", nombre: "", nota: "" },
  ])

  const manejarCambio = (id: string, campo: 'nombre' | 'nota', valor: string) => {
    if (campo === 'nota') {
      // Bloqueo de letras: solo números y punto
      const valorLimpio = valor.replace(/[^0-9.]/g, '');
      if (valorLimpio !== "") {
        const num = parseFloat(valorLimpio);
        if (isNaN(num) || num < 0 || num > 20) return;
      }
      setNuevasMaterias(prev => prev.map(m => m.id === id ? { ...m, nota: valorLimpio } : m))
      return;
    }
    setNuevasMaterias(prev => prev.map(m => m.id === id ? { ...m, [campo]: valor } : m))
  }

  const agregarMateria = () => {
    setNuevasMaterias(prev => [...prev, { id: Math.random().toString(36), nombre: "", nota: "" }])
  }

  const eliminarMateria = (id: string) => {
    if (nuevasMaterias.length > 4) {
      setNuevasMaterias(prev => prev.filter(m => m.id !== id))
    }
  }

  const handleRenovacionSubmit = async () => {
    setIsPending(true)
    const formData = new FormData()
    formData.append('user_id', userId.toString())
    
    nuevasMaterias.forEach(m => {
      if (m.nombre.trim() !== "") {
        formData.append('materias_nombres[]', m.nombre)
        // Si el campo está vacío, enviamos "0"
        formData.append('materias_notas[]', m.nota === "" ? "0" : m.nota)
      }
    })

    try {
      const result = await renovarBeca(formData)
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        toast({ title: "Éxito", description: "Renovación procesada correctamente." })
        setIsRenovating(false)
        router.refresh()
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error de conexión." })
    } finally {
      setIsPending(false)
    }
  }

  // VISTA 1: BANNER DE AVISO
  if (!isRenovating) {
    return (
      <div className="p-6 md:p-8 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
              <RotateCcw className="h-7 w-7 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-black text-violet-900 uppercase tracking-tight">Renovación Disponible</h4>
              <p className="text-xs text-violet-600 font-bold uppercase tracking-widest">Periodo Objetivo: {periodo}</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsRenovating(true)}
            className="w-full lg:w-auto bg-violet-600 text-white hover:bg-violet-700 transition-all font-black text-[10px] uppercase tracking-[0.2em] px-8 py-6 shadow-md"
          >
            Cargar Notas y Renovar
          </Button>
        </div>

        {materias && materias.length > 0 && (
          <div className="bg-white/80 rounded-xl p-5 border border-violet-100 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4 border-b border-violet-50 pb-2">
              <div className="flex items-center gap-2">
                  <BookCheck className="h-4 w-4 text-violet-500" />
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Calificaciones Anteriores</span>
              </div>
              {periodoNotas && (
                  <span className="text-[9px] font-bold text-violet-400 uppercase bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                      Lapso: {periodoNotas}
                  </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {materias.slice(0, 4).map((m: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center opacity-60">
                  <span className="text-xs font-bold text-gray-500 uppercase truncate max-w-[180px]">{m.nombre}</span>
                  <span className="text-xs font-black text-[#1e3a5f]">{parseFloat(m.nota).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // VISTA 2: FORMULARIO MINIMALISTA DE CARGA ACADÉMICA
  return (
    <div className="p-8 rounded-[2.5rem] bg-white border-2 border-violet-100 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-violet-600"></div>
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-black text-[#1e3a5f] uppercase tracking-[0.15em] flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BookOpen className="h-4 w-4" />
            </span>
            Carga Académica {periodo}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Ingrese sus nuevas calificaciones finales
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsRenovating(false)} 
          className="rounded-full hover:bg-slate-100"
        >
          <X className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      <div className="space-y-3 mb-8">
        {nuevasMaterias.map((m, index) => (
          <div key={m.id} className="group flex gap-3 items-center p-2 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all duration-300">
            <div className="flex-1">
              <Input 
                placeholder={`Asignatura ${index + 1}...`} 
                value={m.nombre}
                onChange={(e) => manejarCambio(m.id, 'nombre', e.target.value)}
                className="h-11 border-none bg-slate-50 shadow-inner rounded-xl text-xs font-bold text-[#1e3a5f] placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-violet-200"
              />
            </div>
            <div className="w-24 relative">
              <Input 
                type="text"
                inputMode="decimal"
                placeholder="00.0" 
                value={m.nota}
                onChange={(e) => manejarCambio(m.id, 'nota', e.target.value)}
                className="h-11 border-none bg-slate-50 shadow-inner rounded-xl text-xs font-black text-center pr-8 text-[#1e3a5f] focus-visible:ring-2 focus-visible:ring-violet-200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase pointer-events-none">pts</span>
            </div>
            <Button 
              type="button" 
              onClick={() => eliminarMateria(m.id)}
              disabled={nuevasMaterias.length <= 4}
              size="icon"
              variant="ghost"
              className={`h-9 w-9 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition-all ${nuevasMaterias.length <= 4 ? 'opacity-0' : 'opacity-100'}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <Button 
          type="button" 
          onClick={agregarMateria} 
          variant="outline" 
          className="w-full h-10 border-dashed border-2 border-slate-100 hover:border-violet-300 hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest"
        >
          <Plus className="h-3 w-3 mr-2" /> Añadir otra materia
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[9px] text-emerald-800 leading-relaxed font-bold uppercase tracking-tight">
            Al confirmar, se utilizará su expediente socioeconómico anterior para procesar la renovación.
          </p>
        </div>

        <Button 
          onClick={handleRenovacionSubmit}
          disabled={isPending}
          className="w-full py-8 bg-violet-600 text-white hover:bg-violet-700 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-violet-200 transition-all transform active:scale-[0.98] border-b-4 border-violet-800"
        >
          {isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
          {isPending ? "Procesando..." : "Confirmar Renovación"}
        </Button>
      </div>
    </div>
  )
}