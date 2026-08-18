"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Lock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  MessageSquareQuote,
  ArrowRight
} from "lucide-react"

/**
 * 🔒 TARJETA: ACCESO RESTRINGIDO
 * Se muestra cuando no hay una sesión activa.
 */
export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-700">
      <Card className="max-w-md w-full text-center p-10 border-none shadow-xl rounded-[2.5rem] bg-white">
         <div className="h-20 w-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-rose-500" />
         </div>
         <h2 className="text-2xl font-black text-[#1e3a5f] uppercase tracking-tight mb-3">Acceso Restringido</h2>
         <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">
            Debe iniciar sesión en el portal académico para acceder al sistema de postulación de beneficios.
         </p>
         <Link href="/login" className="block">
            <Button className="w-full bg-[#1e3a5f] hover:bg-[#254674] text-white font-black uppercase py-6 rounded-2xl transition-all">
              Ir al Inicio de Sesión
            </Button>
         </Link>
      </Card>
    </div>
  )
}

/**
 * 📊 TARJETA: ESTADO DE SOLICITUD
 * Se muestra cuando ya existe un proceso o beneficio activo.
 */
export function StatusCard({ estatus, studentRaw }: { estatus: string, studentRaw: any }) {
  const esRechazada = estatus === 'Rechazada';
  const esAprobada = estatus === 'Aprobada';
  const observaciones = studentRaw?.observaciones_beca;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-6 animate-in fade-in duration-700">
      <Card className="max-w-lg w-full p-10 border-none shadow-2xl rounded-[3rem] bg-white relative overflow-hidden">
        <div className="text-center">
          <div className={`h-24 w-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-lg ${
            esRechazada ? "bg-rose-50 shadow-rose-200" : "bg-emerald-50 shadow-emerald-200"
          }`}>
            {esRechazada ? <XCircle className="h-12 w-12 text-rose-500" /> : <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
          </div>

          <h1 className="text-3xl font-black text-[#1e3a5f] uppercase tracking-tighter mb-4">
            {esRechazada ? "Solicitud Denegada" : "Solicitud en Proceso"}
          </h1>
          
          <div className="space-y-4 mb-10">
            <p className="text-sm text-slate-500 font-bold leading-relaxed">
              {esRechazada 
                ? "Su postulación no ha sido aprobada por el comité evaluador en esta oportunidad." 
                : "Actualmente su solicitud se encuentra en fase de validación por el departamento de Bienestar Estudiantil."}
            </p>
            
            {observaciones && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
                <div className="flex items-center gap-2 mb-2 text-[#1e3a5f]">
                  <MessageSquareQuote className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Observaciones</span>
                </div>
                <p className="text-[11px] font-bold italic text-slate-600">"{observaciones}"</p>
              </div>
            )}
          </div>

          <Link href="/perfil">
            <Button className="w-full bg-[#1e3a5f] hover:bg-[#254674] text-white font-black uppercase py-7 rounded-2xl flex items-center justify-center gap-3">
              Volver a mi Perfil <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}