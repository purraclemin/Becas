"use client"

import React, { useState, useEffect } from "react"
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
  BookOpen, 
  Send, 
  Loader2, 
  AlertTriangle,
  X,
  GraduationCap,
  Trophy,
  Sparkles,
  PartyPopper
} from "lucide-react"

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
      <Link href="/postulacion" className="w-full lg:w-auto">
        <Button className="w-full bg-[#1e3a5f] text-[#d4a843] hover:bg-[#1a2744] transition-all font-black text-xs uppercase tracking-widest px-10 py-7 shadow-xl hover:scale-105 active:scale-95">
          Iniciar Solicitud
        </Button>
      </Link>
    </div>
  )
}

// 🟢 NUEVO COMPONENTE: BANNER DE FELICITACIONES PARA EL ÚLTIMO TRIMESTRE
export function FinalistBanner() {
  return (
    <div className="relative p-8 md:p-10 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden animate-in fade-in zoom-in-95 duration-700 shadow-xl shadow-amber-900/5">
      <div className="absolute -top-10 -right-10 opacity-10 rotate-12">
        <Trophy className="h-40 w-40 text-amber-500" />
      </div>
      <div className="absolute -bottom-6 left-10 opacity-20">
        <Sparkles className="h-20 w-20 text-amber-400" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
        <div className="h-20 w-20 bg-gradient-to-tr from-amber-500 to-[#d4a843] rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 rotate-6 transition-transform hover:rotate-0 duration-500">
          <PartyPopper className="h-10 w-10 text-white" />
        </div>
        <div>
          <h4 className="text-xl md:text-2xl font-black text-[#1a2744] uppercase tracking-tighter leading-tight italic">
            ¡Felicidades, Egresado!
          </h4>
          <p className="text-sm md:text-base text-amber-800 font-bold mt-2 max-w-md leading-snug">
            Has llegado al trimestre 12. Este es tu último periodo académico, ¡estás listo para finalizar tu meta en Unimar!
          </p>
        </div>
      </div>

      <div className="relative z-10 shrink-0">
        <div className="bg-white/60 backdrop-blur-sm border border-amber-200 px-6 py-4 rounded-2xl text-center shadow-sm">
          <span className="block text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Estatus Final</span>
          <p className="text-xl font-black text-[#1a2744] flex items-center gap-2">
            PENSUM COMPLETADO <CheckCircle className="h-5 w-5 text-emerald-500" />
          </p>
        </div>
      </div>
    </div>
  )
}

export function RenovationBanner({ 
  materiasSugeridas = [], 
  periodo, 
  userId,
  trimestreActual 
}: { 
  materias: any[], 
  materiasSugeridas?: any[],
  periodo: string, 
  periodoNotas?: string,
  userId: number,
  trimestreActual?: number
}) {
  const [isRenovating, setIsRenovating] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [trimestreElegido] = useState(trimestreActual?.toString() || "1")
  const { toast } = useToast()
  const router = useRouter()
  const [listaMaterias, setListaMaterias] = useState<any[]>([])

  useEffect(() => {
    if (materiasSugeridas.length > 0) {
        setListaMaterias(materiasSugeridas.map(m => ({
            codigo: m.codigo_materia,
            nombre: m.nombre_materia,
            nota: ""
        })));
    }
  }, [materiasSugeridas, isRenovating]);

  const manejarCambioNota = (codigo: string, valor: string) => {
    const valorLimpio = valor.replace(/[^0-9.]/g, '');
    if (valorLimpio !== "") {
        const num = parseFloat(valorLimpio);
        if (isNaN(num) || num < 0 || num > 20) return;
    }
    setListaMaterias(prev => prev.map(m => m.codigo === codigo ? { ...m, nota: valorLimpio } : m))
  }

  const handleRenovacionSubmit = async () => {
    setIsPending(true)
    const formData = new FormData()
    formData.append('user_id', userId.toString())
    formData.append('trimestre_seleccionado', trimestreElegido)
    
    listaMaterias.forEach(m => {
        formData.append('materias_codigos[]', m.codigo)
        formData.append('materias_nombres[]', m.nombre)
        formData.append('materias_notas[]', m.nota === "" ? "0" : m.nota)
    })

    try {
      const result = await renovarBeca(formData)
      if (result.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        toast({ title: "Renovación Exitosa", description: "Tu estatus se actualizará al instante." })
        setIsRenovating(false)
        router.refresh()
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Fallo de conexión." })
    } finally {
      setIsPending(false)
    }
  }

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
      </div>
    )
  }

  return (
    <div className="p-8 rounded-[2.5rem] bg-white border-2 border-violet-100 shadow-2xl animate-in zoom-in-95 duration-500 relative">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-violet-600"></div>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-[#1e3a5f] uppercase tracking-[0.15em] flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <BookOpen className="h-4 w-4" />
          </span>
          Carga Académica {periodo}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setIsRenovating(false)} className="rounded-full">
          <X className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      {/* 🟢 SECCIÓN DE TRIMESTRE AUTOMATIZADA (BLOQUEADA) */}
      <div className="mb-8 p-4 bg-slate-50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100">
          <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-violet-600" />
              <p className="text-[10px] font-black uppercase text-slate-500">Trimestre a Renovar:</p>
          </div>
          <div className="w-full md:w-[180px] relative">
            <Input 
              value={`Trimestre ${trimestreElegido}`} 
              readOnly 
              className="h-10 rounded-xl border-none bg-white font-bold text-[#1e3a5f] shadow-sm text-center cursor-not-allowed"
            />
          </div>
      </div>

      <div className="space-y-3 mb-8">
        {listaMaterias.map((m) => (
          <div key={m.codigo} className="group flex gap-3 items-center p-3 rounded-2xl bg-slate-50 border border-transparent hover:border-violet-200 transition-all">
            <div className="flex-1">
              <p className="text-[8px] font-black text-violet-400 uppercase tracking-tighter mb-0.5">{m.codigo}</p>
              <p className="text-[11px] font-bold text-[#1e3a5f] leading-tight">{m.nombre}</p>
            </div>
            <div className="w-24 relative">
              <Input 
                type="text" inputMode="decimal" placeholder="00.0" 
                value={m.nota}
                onChange={(e) => manejarCambioNota(m.codigo, e.target.value)}
                className="h-10 border-none bg-white shadow-sm rounded-xl text-xs font-black text-center pr-8 text-violet-700"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-300 uppercase">pts</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[9px] text-emerald-800 leading-relaxed font-bold uppercase tracking-tight">
            Se validará contra el pensum oficial de su carrera. Asegúrese de reportar todas las notas del periodo anterior.
          </p>
        </div>

        <Button 
          onClick={handleRenovacionSubmit}
          disabled={isPending}
          className="w-full py-8 bg-violet-600 text-white hover:bg-violet-700 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] border-b-4 border-violet-800"
        >
          {isPending ? "Procesando..." : "Confirmar Renovación"}
        </Button>
      </div>
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  )
}