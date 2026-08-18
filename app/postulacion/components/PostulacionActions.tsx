"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"

interface PostulacionActionsProps {
  pasoActual: number
  totalPasos: number
  isPending: boolean
  onAnterior: () => void
  onSiguiente: () => void
  disableAnterior: boolean
  disableSiguiente: boolean
}

/**
 * Componente modular encargado de renderizar la barra de navegación inferior
 * y gestionar las acciones de flujo del formulario.
 */
export function PostulacionActions({
  pasoActual,
  totalPasos,
  isPending,
  onAnterior,
  onSiguiente,
  disableAnterior,
  disableSiguiente
}: PostulacionActionsProps) {
  
  return (
    <footer className="h-14 bg-white border-t border-slate-200 flex items-center justify-between px-5 flex-shrink-0 w-full">
      <Button 
        variant="ghost" 
        type="button"
        onClick={onAnterior} 
        disabled={disableAnterior || isPending} 
        className="rounded-lg h-8 px-4 font-black uppercase text-[8px] tracking-widest text-[#1e3a5f]"
      >
        <ArrowLeft className="mr-2 h-3 w-3" /> Anterior
      </Button>

      <div className="flex items-center gap-3">
        <span className="text-slate-300 font-bold text-[7px] uppercase tracking-widest">
            {pasoActual} / {totalPasos}
        </span>
        <Button 
          type={pasoActual === totalPasos ? "submit" : "button"}
          onClick={pasoActual !== totalPasos ? onSiguiente : undefined}
          disabled={disableSiguiente || isPending}
          className="bg-[#1e3a5f] hover:bg-[#254674] text-white rounded-lg h-8 px-5 font-black uppercase text-[8px] tracking-widest shadow-sm transition-all active:scale-95 group disabled:opacity-50"
        >
          {isPending ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : pasoActual === totalPasos ? <Send className="mr-2 h-3 w-3" /> : null}
          {pasoActual === totalPasos ? (isPending ? "Enviando..." : "Finalizar") : "Siguiente"}
          {pasoActual !== totalPasos && <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />}
        </Button>
      </div>
    </footer>
  )
}