"use client"

import React from "react"
import { User, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

// 1. Hook de Lógica Central
import { usePostulacionForm, TOTAL_PASOS } from "../hooks/usePostulacionForm"

// 2. Componentes UI Modulares
import { PostulacionSidebar, PASOS } from "./PostulacionSidebar"
import { PostulacionHeader } from "./PostulacionHeader"
import { PostulacionFooter } from "./PostulacionFooter"

// 3. Componentes de Pasos (Steps)
import { StepMaterias } from "./StepMaterias"
import { StepDetalles } from "./StepDetalles"
import { StepEncuesta } from "./StepEncuesta"
import { StepArchivos } from "./StepArchivos"
import { StepResumen } from "./StepResumen"

export function PostulacionContainer({ 
  user, 
  materiasDelPensum, 
  trimestreActual,
  periodoIngreso 
}: { 
  user: any, 
  materiasDelPensum?: any[], 
  trimestreActual?: any,
  periodoIngreso?: string
}) {
  
  // Orquestación: Conectamos la interfaz con la lógica de negocio
  const formHook = usePostulacionForm({ user, trimestreActual });
  const {
    pasoActual, isPending, promedio, materiasValidas, detallesValidos, encuestaValida,
    tipoBecaSeleccionada, formData, activeEncuestaTab, progreso,
    setMateriasValidas, setDetallesValidos, setEncuestaValida, setTipoBecaSeleccionada, setActiveEncuestaTab,
    handleSiguiente, handleAnterior, handleTrimestreChange, handleMateriasChange, handleSubmit
  } = formHook;

  // Obtenemos el título del paso activo para enviarlo al Header
  const tituloPaso = PASOS.find(p => p.id === pasoActual)?.titulo || "Postulación";

  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 bg-white selection:bg-[#d4a843]/30">
      
      {/* 1. SIDEBAR (Navegación Lateral/Superior) */}
      <PostulacionSidebar pasoActual={pasoActual} progreso={progreso} />

      {/* 2. ÁREA DE TRABAJO PRINCIPAL */}
      <section className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        
        {/* Cabecera del Formulario */}
        <PostulacionHeader 
          tituloPaso={tituloPaso}
          periodoIngreso={periodoIngreso}
          promedio={promedio}
        />

        {/* Barra de Información del Estudiante */}
        {user && (
          <div className="bg-[#1e3a5f]/5 px-4 sm:px-6 py-2.5 border-b border-[#1e3a5f]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <p className="text-xs font-bold text-[#1e3a5f] truncate max-w-[200px] sm:max-w-xs">{user.nombre} {user.apellido}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#d4a843]" />
              <p className="text-xs font-bold text-[#1e3a5f] truncate max-w-[200px] sm:max-w-xs">{user.email || user.correo || "Sin correo"}</p>
            </div>
          </div>
        )}

        {/* 3. CONTENEDOR CENTRAL DE PASOS (Formulario Activo sin caja interna) */}
        <form id="form-postulacion" noValidate onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col bg-white">
          <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
            
            {/* Los componentes se mantienen renderizados pero ocultos (hidden) para no perder los datos del FormData nativo */}
            <div className={cn("flex-1 flex-col", pasoActual === 1 ? "flex" : "hidden")}>
              <StepMaterias 
                disabled={isPending} 
                materiasDelPensum={materiasDelPensum} 
                trimestreActual={trimestreActual} 
                onChangeTrimestre={handleTrimestreChange} 
                onChangeNotas={handleMateriasChange} 
                materiasGuardadas={formData?.materias_registradas || user?.materias_registradas} 
                user={formData}
                onValidationChange={setMateriasValidas}
              />
            </div>

            <div className={cn("flex-1 flex-col", pasoActual === 2 ? "flex" : "hidden")}>
              <StepDetalles 
                disabled={isPending} 
                user={formData} 
                onTipoBecaChange={setTipoBecaSeleccionada}
                tipoBecaSeleccionada={tipoBecaSeleccionada}
                promedio={promedio}
                onValidationChange={setDetallesValidos}
              />
            </div>

            <div className={cn("flex-1 flex-col", pasoActual === 3 ? "flex" : "hidden")}>
              <StepEncuesta 
                disabled={isPending} 
                user={formData} 
                activeTab={activeEncuestaTab}
                onTabChange={setActiveEncuestaTab}
                onValidationChange={setEncuestaValida}
              />
            </div>

            <div className={cn("flex-1 flex-col", pasoActual === 4 ? "flex" : "hidden")}>
              <StepArchivos disabled={isPending} tipoBeca={tipoBecaSeleccionada} />
            </div>

            <div className={cn("flex-1 flex-col", pasoActual === 5 ? "flex" : "hidden")}>
              <StepResumen 
                user={formData} 
                promedio={promedio} 
                trimestre={trimestreActual} 
                tipoBeca={tipoBecaSeleccionada}
              />
            </div>
          </div>
        </form>

        {/* 4. FOOTER (Controles de Navegación) */}
        <PostulacionFooter 
          pasoActual={pasoActual}
          totalPasos={TOTAL_PASOS}
          activeEncuestaTab={activeEncuestaTab}
          isPending={isPending}
          materiasValidas={materiasValidas}
          detallesValidos={detallesValidos}
          encuestaValida={encuestaValida}
          handleAnterior={handleAnterior}
          handleSiguiente={handleSiguiente}
          handleSubmit={handleSubmit}
        />
      </section>
    </div>
  )
}