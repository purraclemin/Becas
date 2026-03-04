"use client"

import React from "react"
import { 
  SeccionIdentificacion, 
  SeccionAcademica, 
  SeccionFamiliar, 
  SeccionEconomica, 
  SeccionVivienda, 
  SeccionSalud 
} from "./SeccionesEncuestaSub"

/**
 * 🟢 COMPONENTE: SECCIONES DE LA ENCUESTA (Diseño Inmersivo)
 * Se elimina la lógica de acordeones y estados de apertura para permitir un flujo 
 * lineal y expansivo, coincidiendo con el estilo de la Imagen 1.
 */
export default function SeccionesEncuesta({ user, disabled }: any) {
  return (
    <div className="space-y-20 pb-10">
      
      {/* SECCIÓN: Identificación y Perfil Personal */}
      <div id="encuesta-section-identificacion" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <SeccionIdentificacion 
          user={user} 
          disabled={disabled} 
        />
      </div>
      
      <div className="h-px bg-slate-100 w-full opacity-50" />

      {/* SECCIÓN: Datos Académicos y Procedencia */}
      <div id="encuesta-section-academica" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
        <SeccionAcademica 
          user={user} 
          disabled={disabled} 
        />
      </div>

      <div className="h-px bg-slate-100 w-full opacity-50" />

      {/* SECCIÓN: Composición y Carga Familiar */}
      <div id="encuesta-section-familiar" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <SeccionFamiliar 
          user={user} 
          disabled={disabled} 
        />
      </div>

      <div className="h-px bg-slate-100 w-full opacity-50" />

      {/* SECCIÓN: Situación Económica e Ingresos */}
      <div id="encuesta-section-economica" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <SeccionEconomica 
          user={user} 
          disabled={disabled} 
        />
      </div>

      <div className="h-px bg-slate-100 w-full opacity-50" />

      {/* SECCIÓN: Entorno de Vivienda y Servicios */}
      <div id="encuesta-section-vivienda" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
        <SeccionVivienda 
          user={user} 
          disabled={disabled} 
        />
      </div>

      <div className="h-px bg-slate-100 w-full opacity-50" />

      {/* SECCIÓN: Salud y Clima de Convivencia */}
      <div id="encuesta-section-salud" className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
        <SeccionSalud 
          user={user} 
          disabled={disabled} 
        />
      </div>

    </div>
  )
}