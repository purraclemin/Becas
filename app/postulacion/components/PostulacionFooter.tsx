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
  
  // Reglas lógicas de bloqueo
  const isAnteriorDisabled = (pasoActual === 1 && activeEncuestaTab === "personal") || isPending;
  
  const isSiguienteDisabled = 
    isPending || 
    (pasoActual === 1 && !materiasValidas) || 
    (pasoActual === 2 && !detallesValidos) ||
    (pasoActual === 3 && !encuestaValida);

  const isUltimoPaso = pasoActual === totalPasos;

  return (
    <footer className="w-full bg-white border-t border-[#e2e8f0] px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0 transition-all z-10">
      
      {/* Botón Retroceder */}
      <Button 
        variant="ghost" 
        onClick={handleAnterior} 
        disabled={isAnteriorDisabled} 
        className="rounded-full h-10 sm:h-11 px-4 sm:px-6 font-bold uppercase text-[10px] sm:text-xs tracking-wider text-[#6b7280] hover:text-[#1e3a5f] hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-40"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> 
        <span className="hidden sm:inline">Anterior</span>
        <span className="inline sm:hidden">Atrás</span>
      </Button>

      {/* Controles de Avance */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* Indicador de paso en texto (Oculto en móvil ultra-pequeño para dar espacio a botones) */}
        <span className="hidden sm:block text-[#6b7280] font-bold text-[10px] uppercase tracking-widest">
            Paso {pasoActual} de {totalPasos}
        </span>
        
        {/* Botón Siguiente / Finalizar */}
        <Button 
          onClick={isUltimoPaso ? handleSubmit : handleSiguiente}
          disabled={isSiguienteDisabled}
          className={cn(
            "rounded-full h-10 sm:h-11 px-6 sm:px-8 font-bold uppercase text-[10px] sm:text-xs tracking-wider shadow-sm transition-all hover:scale-105 active:scale-95 group disabled:opacity-50 disabled:pointer-events-none",
            isUltimoPaso 
              ? "bg-[#d4a843] hover:bg-[#b58f39] text-white" // Dorado para finalizar
              : "bg-[#1e3a5f] hover:bg-[#162d4a] text-white" // Azul institucional para avanzar
          )}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isUltimoPaso ? <Send className="mr-2 h-4 w-4" /> : null}
          {isUltimoPaso ? (isPending ? "Enviando..." : "Finalizar") : "Siguiente"}
          {!isUltimoPaso && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </Button>
      </div>
      
    </footer>
  )
}