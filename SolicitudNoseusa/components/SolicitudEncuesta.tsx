"use client"

import { useState } from "react"
import { Info } from "lucide-react"
// Se corrige la ruta de importación para apuntar al archivo de subcomponentes modularizado
import { 
  SeccionIdentificacion, 
  SeccionAcademica, 
  SeccionFamiliar, 
  SeccionEconomica, 
  SeccionVivienda, 
  SeccionSalud 
} from "./SeccionesEncuestaSub"

/**
 * 🟢 COMPONENTE: INVESTIGACIÓN SOCIOECONÓMICA (LIMPIO)
 * Optimizado para nuevos aspirantes. Se eliminó la lógica de estados pendientes
 * ya que este flujo ahora es exclusivo para registros iniciales.
 */
export function SolicitudEncuesta({ 
  disabled, 
  user
}: { 
  disabled: boolean, 
  user: any
}) {
  // Estado para controlar qué sección está expandida. 
  // Por defecto, iniciamos con la identificación abierta para guiar al usuario.
  const [activeSection, setActiveSection] = useState<string | null>("identificacion");

  const toggle = (section: string) => {
    if (disabled) return;
    setActiveSection(activeSection === section ? null : section);
  }

  return (
    <div className="space-y-8 pt-10 border-t-2 border-slate-100 animate-in fade-in duration-700">
      
      {/* BLOQUE INFORMATIVO Y REGLAMENTARIO */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex gap-4 shadow-sm">
        <Info className="h-6 w-6 text-blue-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase text-blue-900 tracking-tight">Instrucciones de Veracidad</p>
          <p className="text-[10px] text-blue-800 leading-relaxed italic">
            Esta encuesta tiene carácter de declaración jurada. 
            <b> La omisión o falsedad en los datos socioeconómicos resultará en la invalidación inmediata del proceso.</b>
          </p>
        </div>
      </div>

      {/* RENDERIZADO DE SECCIONES MODULARES */}
      <div className="w-full space-y-4">
        
        {/* 1. Identificación del Solicitante */}
        <div className="relative">
          <SeccionIdentificacion 
            isOpen={activeSection === "identificacion"} 
            onToggle={() => toggle("identificacion")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 2. Información Académica */}
        <div className="relative">
          <SeccionAcademica 
            isOpen={activeSection === "academica"} 
            onToggle={() => toggle("academica")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 3. Composición y Entorno Familiar */}
        <div className="relative">
          <SeccionFamiliar 
            isOpen={activeSection === "familiar"} 
            onToggle={() => toggle("familiar")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 4. Situación Económica y Cargas Familiares */}
        <div className="relative">
          <SeccionEconomica 
            isOpen={activeSection === "economica"} 
            onToggle={() => toggle("economica")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 5. Condiciones y Tenencia de Vivienda */}
        <div className="relative">
          <SeccionVivienda 
            isOpen={activeSection === "vivienda"} 
            onToggle={() => toggle("vivienda")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 6. Cuadro de Salud y Observaciones Generales */}
        <div className="relative">
          <SeccionSalud 
            isOpen={activeSection === "salud"} 
            onToggle={() => toggle("salud")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

      </div>

      {/* PIE DE DECLARACIÓN */}
      <div className="p-6 bg-slate-900 rounded-2xl text-center shadow-xl border-b-4 border-[#d4a843]">
        <p className="text-[9px] text-slate-400 font-black leading-relaxed italic uppercase tracking-[0.2em]">
            Certifico que la información suministrada es fiel a la realidad.
        </p>
      </div>

    </div>
  )
}