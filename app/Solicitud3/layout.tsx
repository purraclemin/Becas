"use client"

import React from "react"

/**
 * 🟢 LAYOUT: ESTRUCTURA MAESTRA INMERSIVA (RECONSTRUCCIÓN TOTAL)
 * Se aplica una contratransformación para anular el scale-[0.85] del Root Layout.
 * Esto permite que la interfaz de solicitud sea escala 1:1 y ocupe el 100% real.
 */
export default function SolicitudLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* Aplicamos scale-[1.1765] (inverso de 0.85) para recuperar el tamaño real.
       Ajustamos el origen y el ancho para que el Sidebar y el Main se peguen a los bordes.
    */
    <div className="origin-top-left scale-[1.1765] w-[85%] h-[85vh] min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row overflow-x-hidden selection:bg-[#d4a843]/20">
      
      {/* SIDEBAR: Ahora con escala real, se ve nítido y proporcional */}
      <aside className="lg:w-[280px] xl:w-[320px] w-full bg-[#1e3a5f] lg:h-screen lg:sticky lg:top-0 overflow-y-auto z-20 shadow-2xl border-r border-white/5">
        <div className="p-8 flex flex-col h-full">
          
          {/* Identidad Institucional */}
          <div className="mb-10 group cursor-default">
            <h1 className="text-white font-serif text-2xl lg:text-3xl font-black tracking-tighter italic transition-all group-hover:text-[#d4a843]">
              UNIMAR
            </h1>
            <div className="h-1 w-10 bg-[#d4a843] mt-2 rounded-full transition-all group-hover:w-16" />
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em] mt-6 leading-relaxed">
              Sistema de Gestión <br /> de Becas Universitarias
            </p>
          </div>

          {/* Espacio para StepTracker */}
          <div className="flex-1 py-6">
              {/* Contenedor dinámico de pasos */}
          </div>

          {/* Footer Sidebar */}
          <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="absolute inset-0 h-2 w-2 rounded-full bg-emerald-400 blur-[2px] animate-ping" />
              </div>
              <span className="text-white/40 text-[8px] font-black uppercase tracking-widest italic">Conexión Segura</span>
            </div>
            <p className="text-white/20 text-[8px] font-bold uppercase tracking-tight leading-tight">
              &copy; 2026 Universidad de Margarita <br />
              Nueva Esparta, Venezuela.
            </p>
          </div>
        </div>
      </aside>

      {/* ÁREA DE TRABAJO: Ocupa el resto de la pantalla sin márgenes "fantasma" */}
      <main className="flex-1 w-full bg-[#fcfdfe] relative flex flex-col min-w-0">
        
        {/* Decoración de fondo inmersiva */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.2] -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
        
        {/* Contenedor de Contenido: Expansión total */}
        <div className="w-full flex-1 flex flex-col">
          {/* Contenedor dinámico que ahora hereda el ancho total real */}
          <div className="relative z-10 flex-1 w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}