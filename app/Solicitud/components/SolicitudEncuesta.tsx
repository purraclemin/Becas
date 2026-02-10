"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { 
  SeccionIdentificacion, 
  SeccionAcademica, 
  SeccionFamiliar, 
  SeccionEconomica, 
  SeccionVivienda, 
  SeccionSalud 
} from "./SeccionesEncuesta"

// 🟢 ACTUALIZACIÓN: Props simplificadas, ya no necesita la lógica de edición
export function SolicitudEncuesta({ 
  disabled, 
  user
}: { 
  disabled: boolean, 
  user: any
}) {
  // 🟢 LÓGICA DE VISUALIZACIÓN: Si ya existe una solicitud pendiente, forzamos la vista completa
  const esPendiente = user?.estatusBeca === 'Pendiente';
  
  // Estado para controlar qué sección está abierta (solo activo si no hay solicitud previa)
  const [activeSection, setActiveSection] = useState<string | null>("identificacion");

  const toggle = (section: string) => {
    // Si la solicitud está pendiente, impedimos cerrar las secciones para mantener la visibilidad total
    if (esPendiente) return;
    setActiveSection(activeSection === section ? null : section);
  }

  return (
    <div className="space-y-8 pt-10 border-t-2 border-slate-100 animate-in fade-in duration-700">
      
      {/* SECCIÓN DE INSTRUCCIONES */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex gap-4 shadow-sm">
        <Info className="h-6 w-6 text-blue-600 shrink-0" />
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase text-blue-900 tracking-tight">Instrucciones Importantes</p>
          <p className="text-[10px] text-blue-800 leading-relaxed italic">
            Esta encuesta es para uso exclusivo de la Unidad de Becas y Ayudas Estudiantiles. 
            <b> Cualquier falsificación o adulteración en los datos anula la gestión de la solicitud.</b>
          </p>
        </div>
      </div>

      <div className="w-full space-y-4">
        
        {/* Renderizado de Secciones Modulares con inyección de datos del usuario */}
        
        {/* 3. Identificación del Solicitante */}
        <div className="relative">
          <SeccionIdentificacion 
            isOpen={esPendiente || activeSection === "identificacion"} 
            onToggle={() => toggle("identificacion")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 4. Información Académica */}
        <div className="relative">
          <SeccionAcademica 
            isOpen={esPendiente || activeSection === "academica"} 
            onToggle={() => toggle("academica")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 5. Entorno Familiar */}
        <div className="relative">
          <SeccionFamiliar 
            isOpen={esPendiente || activeSection === "familiar"} 
            onToggle={() => toggle("familiar")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 6. Situación Económica */}
        <div className="relative">
          <SeccionEconomica 
            isOpen={esPendiente || activeSection === "economica"} 
            onToggle={() => toggle("economica")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 7. Condiciones de Vivienda */}
        <div className="relative">
          <SeccionVivienda 
            isOpen={esPendiente || activeSection === "vivienda"} 
            onToggle={() => toggle("vivienda")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

        {/* 8. Salud y Entorno Familiar */}
        <div className="relative">
          <SeccionSalud 
            isOpen={esPendiente || activeSection === "salud"} 
            onToggle={() => toggle("salud")} 
            disabled={disabled} 
            user={user} 
          />
        </div>

      </div>

      {/* DECLARACIÓN JURADA */}
      <div className="p-6 bg-slate-900 rounded-2xl text-center shadow-xl">
        <p className="text-[9px] text-slate-400 font-medium leading-relaxed italic uppercase tracking-wider">
            El solicitante da fe de que todos los datos suministrados son reales y pueden ser verificados cuando la universidad así lo requiera.
        </p>
      </div>

    </div>
  )
}