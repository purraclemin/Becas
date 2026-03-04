"use client"

import React from "react"
import { FileText, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SolicitudFormWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 max-w-sm mx-auto p-8 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
        <div className="h-20 w-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
          <FileText className="h-10 w-10 text-[#1e3a5f]" />
        </div>
        <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-tight">
          Nueva Postulación
        </h3>
        <p className="text-[11px] text-gray-500 mt-3 leading-relaxed italic">
          Bienvenido. Por favor complete los 6 pasos obligatorios del formulario para procesar su solicitud de beca.
        </p>
      </div>
      
      <Button 
        type="button"
        onClick={onStart}
        className="group px-12 py-8 bg-[#1e3a5f] text-[#d4a843] rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all hover:scale-105 active:scale-95"
      >
        <PlayCircle className="mr-3 h-5 w-5 animate-pulse" /> Comenzar Solicitud
      </Button>
    </div>
  )
}