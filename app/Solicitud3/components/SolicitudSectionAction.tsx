"use client"

import React from "react"

/**
 * 🟢 COMPONENTE: CONTENEDOR DE PASO (Escala Corregida)
 * Este archivo controla el ancho real del formulario. 
 * Se ha ajustado para evitar que el diseño se "explote" en pantallas grandes.
 */

interface SolicitudSectionActionProps {
  children: React.ReactNode;
}

export function SolicitudSectionAction({ children }: SolicitudSectionActionProps) {
  return (
    <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Ajustamos el max-width a 900px para que los inputs no se vean infinitos 
          y el diseño mantenga la elegancia de la Imagen 1.
      */}
      <div className="w-full max-w-[850px] relative group">
        <div className="relative bg-white border-2 border-slate-50 rounded-[3rem] shadow-2xl shadow-blue-900/5 overflow-hidden transition-all duration-500">
          
          {/* Acento lateral sutil */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1e3a5f]/5" />
          
          {/* Padding interno reducido para que no se vea "gigante" */}
          <div className="p-6 md:p-10 lg:p-12">
            {children}
          </div>
        </div>

        {/* Efecto de sombra inferior inmersiva */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-blue-900/[0.03] blur-[100px] -z-10 rounded-full" />
      </div>
    </div>
  )
}