"use client"

import React from "react"
import { Info, ShieldAlert, CheckCircle } from "lucide-react"
import { 
  SeccionIdentificacion, 
  SeccionAcademica, 
  SeccionFamiliar, 
  SeccionEconomica, 
  SeccionVivienda, 
  SeccionSalud 
} from "./SeccionesEncuestaSub"

/**
 * 🟢 COMPONENTE: INVESTIGACIÓN SOCIOECONÓMICA (Diseño Inmersivo)
 * Integrado como el Paso 3 del flujo lineal. Elimina la navegación por clics
 * para ofrecer una experiencia de lectura y llenado continua y profesional.
 */
export function SolicitudEncuesta({ 
  disabled, 
  user
}: { 
  disabled: boolean, 
  user: any
}) {
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* BLOQUE INFORMATIVO Y REGLAMENTARIO (Estilo Premium) */}
      <div className="relative overflow-hidden bg-[#1e3a5f]/5 border-2 border-[#1e3a5f]/10 p-8 lg:p-10 rounded-[3rem] flex flex-col md:flex-row gap-8 items-center shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldAlert className="h-24 w-24" />
        </div>
        
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-[#1e3a5f] flex items-center justify-center text-[#d4a843] shadow-lg">
          <Info className="h-8 w-8" />
        </div>
        
        <div className="space-y-3 relative z-10">
          <h4 className="text-sm font-black uppercase text-[#1e3a5f] tracking-[0.2em]">
            Declaración Jurada de Información
          </h4>
          <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight italic">
            Este estudio socioeconómico es vinculante. 
            <span className="text-[#1e3a5f] ml-1">
              La omisión, ocultamiento o falsedad en los datos suministrados resultará en la 
              <b> invalidación inmediata y permanente</b> de su postulación al programa de becas.
            </span>
          </p>
        </div>
      </div>

      {/* RENDERIZADO DE SECCIONES LINEALES */}
      <div className="w-full space-y-20">
        
        <div className="relative group">
          <SeccionIdentificacion 
            disabled={disabled} 
            user={user} 
          />
        </div>

        <div className="relative group">
          <SeccionAcademica 
            disabled={disabled} 
            user={user} 
          />
        </div>

        <div className="relative group">
          <SeccionFamiliar 
            disabled={disabled} 
            user={user} 
          />
        </div>

        <div className="relative group">
          <SeccionEconomica 
            disabled={disabled} 
            user={user} 
          />
        </div>

        <div className="relative group">
          <SeccionVivienda 
            disabled={disabled} 
            user={user} 
          />
        </div>

        <div className="relative group">
          <SeccionSalud 
            disabled={disabled} 
            user={user} 
          />
        </div>

      </div>

      {/* PIE DE CERTIFICACIÓN FINAL DEL PASO */}
      <div className="mt-10 p-10 bg-white border-2 border-slate-50 rounded-[3rem] text-center shadow-xl shadow-blue-900/5 flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 mb-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
        </div>
        <p className="text-[10px] text-[#1e3a5f] font-black leading-relaxed italic uppercase tracking-[0.3em] max-w-lg">
            Confirmo que he revisado cada sección y que los datos expresados son fieles a mi realidad socioeconómica actual.
        </p>
        <div className="h-1 w-20 bg-[#d4a843] rounded-full mt-2" />
      </div>

    </div>
  )
}