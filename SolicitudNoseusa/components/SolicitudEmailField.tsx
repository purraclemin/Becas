"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2 } from "lucide-react"

/**
 * 🟢 COMPONENTE: CAMPO DE EMAIL INSTITUCIONAL (LIMPIO)
 * Muestra el correo vinculado a la ficha del estudiante de forma segura.
 */
export function SolicitudEmailField({ user }: { user: any }) {
  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      <Label 
        htmlFor="email_institucional"
        className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2 ml-1"
      >
        <Mail className="h-3 w-3 text-[#d4a843]" /> Correo Institucional
      </Label>
      
      <div className="relative group">
        <Input 
          id="email_institucional"
          name="email_institucional" 
          // Priorizamos el correo institucional, fallback al correo de registro
          defaultValue={user?.email_institucional || user?.email || ""} 
          readOnly 
          aria-readonly="true"
          className="h-12 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f] cursor-not-allowed italic pr-10 rounded-xl focus-visible:ring-0 shadow-none" 
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter hidden sm:block">Verificado</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
      </div>
      
      <p className="text-[9px] text-slate-400 font-medium ml-1 italic">
        * Este correo se utilizará para todas las notificaciones oficiales del proceso.
      </p>
    </div>
  )
}