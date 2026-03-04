"use client"

import React from "react"
import { FileText, PlayCircle, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * 🟢 COMPONENTE: BIENVENIDA AL FORMULARIO (Diseño Inmersivo)
 * Primera interacción del aspirante. Prepara el entorno visual para 
 * el flujo de 4 pasos de la nueva interfaz premium.
 */
export function SolicitudFormWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-1000">
      
      {/* Tarjeta Central de Bienvenida */}
      <div className="mb-12 max-w-lg mx-auto p-10 lg:p-16 rounded-[4rem] bg-white border-2 border-slate-50 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
        
        {/* Decoración de Fondo sutil */}
        <div className="absolute -top-10 -left-10 h-40 w-40 bg-[#d4a843]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-[#1e3a5f]/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="h-24 w-24 bg-[#1e3a5f] rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-10 transform -rotate-3 transition-transform hover:rotate-0">
            <FileText className="h-10 w-10 text-[#d4a843]" />
          </div>

          <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-[0.2em] mb-4">
            Sistema de Postulación
          </h3>
          
          <div className="h-1 w-12 bg-[#d4a843] mx-auto mb-6 rounded-full" />

          <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic mb-8">
            Bienvenido al proceso de selección académica. <br />
            Complete los <span className="text-[#1e3a5f]">4 pasos obligatorios</span> del formulario inmersivo para formalizar su solicitud de beneficio.
          </p>

          <div className="flex items-center justify-center gap-2 py-3 px-6 bg-slate-50 rounded-full border border-slate-100 w-fit mx-auto">
             <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entorno Seguro y Encriptado</span>
          </div>
        </div>
      </div>
      
      {/* Botón de Acción Principal */}
      <Button 
        type="button"
        onClick={onStart}
        className="group px-16 py-9 bg-[#1e3a5f] text-[#d4a843] rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-[0_25px_60px_rgba(30,58,95,0.3)] border-b-4 border-[#d4a843] transition-all hover:scale-105 hover:bg-[#254674] active:scale-95"
      >
        <PlayCircle className="mr-4 h-6 w-6 animate-pulse group-hover:animate-none" /> 
        Comenzar Postulación
      </Button>

      {/* Footer Informativo */}
      <p className="mt-10 text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">
        Universidad de Margarita &bull; Bienestar Estudiantil
      </p>
    </div>
  )
}