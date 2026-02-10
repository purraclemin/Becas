"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle2 } from "lucide-react"

export function SolicitudEmailField({ user }: { user: any }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2 ml-1">
        <Mail className="h-3 w-3 text-[#d4a843]" /> Correo Institucional
      </Label>
      <div className="relative">
        <Input 
          name="email_institucional" 
          defaultValue={user?.email_institucional || user?.email || ""} 
          readOnly 
          className="bg-slate-100 font-bold text-[#1e3a5f] cursor-not-allowed italic pr-10" 
        />
        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
      </div>
    </div>
  )
}