"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2, ShieldCheck } from "lucide-react"

/**
 * 🟢 COMPONENTE: CAMPO DE EMAIL INSTITUCIONAL (Diseño Inmersivo)
 * Muestra el correo vinculado a la ficha del estudiante integrándose al flujo
 * de ancho completo de la nueva interfaz.
 */
export function SolicitudEmailField({ user }: { user: any }) {
  return (
    <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Etiqueta con estilo refinado */}
      <div className="flex items-center justify-between px-1">
        <Label 
          htmlFor="email_institucional"
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e3a5f]/60 flex items-center gap-2.5"
        >
          <Mail className="h-3.5 w-3.5 text-[#d4a843]" /> 
          Canal de Comunicación Oficial
        </Label>
        
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
           <ShieldCheck className="h-3 w-3 text-emerald-500" />
           <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Identidad Validada</span>
        </div>
      </div>
      
      {/* Contenedor del Input con efecto de profundidad */}
      <div className="relative group">
        <Input 
          id="email_institucional"
          name="email_institucional" 
          // Priorizamos el correo institucional, fallback al correo de registro
          defaultValue={user?.email_institucional || user?.email || ""} 
          readOnly 
          aria-readonly="true"
          className="h-14 bg-white border-2 border-slate-50 font-black text-[#1e3a5f] cursor-not-allowed italic pr-12 rounded-2xl shadow-sm transition-all duration-300 text-sm tracking-tight" 
        />
        
        {/* Indicador visual de verificación */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="h-8 w-[1px] bg-slate-100 mr-1" />
            <CheckCircle2 className="h-5 w-5 text-emerald-500 drop-shadow-sm" />
        </div>
      </div>
      
      {/* Nota legal al pie del campo */}
      <div className="flex items-start gap-2 ml-1">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic max-w-2xl">
          * Las credenciales de acceso y resultados del comité serán enviados exclusivamente a esta dirección @unimar.edu.ve registrada.
        </p>
      </div>
    </div>
  )
}