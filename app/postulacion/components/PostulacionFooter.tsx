"use client"

import React from "react"
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PostulacionFooterProps {
  pasoActual: number;
  totalPasos: number;
  activeEncuestaTab: string;
  isPending: boolean;
  materiasValidas: boolean;
  detallesValidos: boolean;
  encuestaValida: boolean;
  handleAnterior: () => void;
  handleSiguiente: () => void;
  handleSubmit: () => void;
}

export function PostulacionFooter({
  pasoActual,
  totalPasos,
  activeEncuestaTab,
  isPending,
  materiasValidas,
  detallesValidos,
  encuestaValida,
  handleAnterior,
  handleSiguiente,
  handleSubmit
}: PostulacionFooterProps) {
  
  const isAnteriorDisabled = (pasoActual === 1 && activeEncuestaTab === "personal") || isPending;
  
  const isSiguienteDisabled = 
    isPending || 
    (pasoActual === 1 && !materiasValidas) || 
    (pasoActual === 2 && !detallesValidos) ||
    (pasoActual === 3 && !encuestaValida);

  const isUltimoPaso = pasoActual === totalPasos;

  return (
    <footer 
      className={cn(
        "w-full bg-white border-t border-[#e2e8f0] px-4 sm:px-6 py-2 flex items-center justify-between transition-all z-50",
        /* En móvil: fijo abajo, en PC: relativo/estático */
        "fixed bottom-0 left-0 lg:static",
        "h-[60px] lg:h-auto"
      )}
    >
      
      {/* Botón Retroceder */}
      <Button 
        variant="ghost" 
        onClick={handleAnterior} 
        disabled={isAnteriorDisabled} 
        className="rounded-full h-9 px-4 sm:px-5 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider text-[#6b7280] hover:text-[#1e3a5f] hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-40"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> 
        <span className="hidden sm:inline">Anterior</span>
        <span className="inline sm:hidden">Atrás</span>
      </Button>

      {/* Controles de Avance */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* Indicador de paso en texto */}
        <span className="hidden sm:block text-[#6b7280] font-bold text-[9px] uppercase tracking-widest">
            Paso {pasoActual} de {totalPasos}
        </span>
        
        {/* Botón Siguiente / Finalizar */}
        <Button 
          onClick={isUltimoPaso ? handleSubmit : handleSiguiente}
          disabled={isSiguienteDisabled}
          className={cn(
            "rounded-full h-9 px-5 sm:px-7 font-bold uppercase text-[9px] sm:text-[10px] tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 group disabled:opacity-50 disabled:pointer-events-none",
            isUltimoPaso 
              ? "bg-[#d4a843] hover:bg-[#b58f39] text-white" 
              : "bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
          )}
        >
          {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : isUltimoPaso ? <Send className="mr-1.5 h-3.5 w-3.5" /> : null}
          {isUltimoPaso ? (isPending ? "Enviando..." : "Finalizar") : "Siguiente"}
          {!isUltimoPaso && <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />}
        </Button>
      </div>
      
    </footer>
  )
}