"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  MessageSquareQuote, 
  UserCircle, 
  ArrowRight,
  ShieldX,
  Lock,
  ExternalLink
} from "lucide-react"

/**
 * 🟢 TARJETA 1: ACCESO RESTRINGIDO (Diseño Inmersivo)
 * Se muestra cuando no hay una sesión activa.
 */
export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-700">
      <Card className="max-w-md w-full text-center p-10 lg:p-14 border-none shadow-[0_30px_70px_rgba(30,58,95,0.08)] rounded-[3.5rem] bg-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-2 bg-rose-500/20" />
         
         <div className="h-20 w-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Lock className="h-10 w-10 text-rose-500" />
         </div>

         <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-[0.1em]">Acceso Restringido</h2>
         <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-4 mb-10 leading-relaxed italic">
            Para iniciar una solicitud de beneficio académico debe autenticarse en el sistema.
         </p>

         <Link href="/login" className="block group">
           <Button className="w-full bg-[#1e3a5f] text-white uppercase font-black tracking-[0.2em] text-[10px] py-8 rounded-2xl shadow-xl shadow-blue-900/20 group-hover:bg-[#254674] transition-all active:scale-95">
              Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
           </Button>
         </Link>
      </Card>
    </div>
  )
}

/**
 * 🟢 TARJETA 2: GESTIÓN DE ESTADOS MAESTROS (Diseño Inmersivo)
 * Maneja Veto, Becado Activo y Solicitud en Curso con estética Premium.
 */
export function StatusCard({ estatus, studentRaw }: { estatus: string, studentRaw: any }) {
  const perdioBeca = studentRaw?.beca_perdida === 1;
  const yaEsBecado = studentRaw?.ha_tenido_beca === 1;
  const esRechazada = estatus === 'Rechazada';
  const observaciones = studentRaw?.observaciones_admin || "";

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <Card className="max-w-lg w-full text-center p-10 lg:p-14 border-none shadow-[0_40px_80px_rgba(30,58,95,0.1)] rounded-[4rem] bg-white relative overflow-hidden">
        
        {/* CASO A: VETO TOTAL (PERDIÓ LA BECA) */}
        {perdioBeca ? (
          <div className="space-y-8">
            <div className="h-24 w-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm transform -rotate-3">
               <ShieldX className="h-12 w-12 text-rose-600" />
            </div>
            <div className="space-y-2">
               <h2 className="text-xl font-black text-rose-950 uppercase tracking-widest">Beneficio Inhabilitado</h2>
               <div className="h-1 w-12 bg-rose-200 mx-auto rounded-full" />
            </div>
            
            <div className="p-8 bg-rose-50/50 rounded-[2.5rem] border-2 border-rose-100 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <ShieldX className="h-16 w-16" />
              </div>
              <p className="text-rose-900 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" /> Registro de Exclusión
              </p>
              <p className="text-rose-800 text-xs font-bold leading-relaxed italic uppercase tracking-tight">
                "{studentRaw?.motivo_exclusion || 'El estudiante no cumple con los requisitos de permanencia del programa.'}"
              </p>
            </div>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-2 border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-100 uppercase font-black tracking-widest text-[10px] py-8 rounded-2xl transition-all">
                Volver al Portal de Inicio
              </Button>
            </Link>
          </div>
        ) : 

        /* CASO B: BECADO ACTIVO (REDIRECCIÓN AL PERFIL) */
        yaEsBecado ? (
          <div className="space-y-8">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-[#1e3a5f] shadow-2xl shadow-blue-900/30 text-[#d4a843] transform rotate-3">
              <UserCircle className="h-12 w-12" />
            </div>
            <div className="space-y-2">
               <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-widest">Programa Activo</h2>
               <div className="h-1 w-12 bg-[#d4a843] mx-auto rounded-full" />
            </div>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed italic px-4">
              Usted ya posee un beneficio académico vigente. Para renovar, cargar notas o ver su historial, utilice su portal de estudiante.
            </p>
            <Link href="/perfil" className="block group">
              <Button className="w-full bg-[#1e3a5f] text-white font-black uppercase tracking-[0.2em] text-[10px] gap-3 py-9 rounded-[2rem] shadow-xl shadow-blue-900/20 group-hover:bg-[#254674] transition-all active:scale-95">
                Gestionar en mi Perfil <ExternalLink className="h-4 w-4 text-[#d4a843]" />
              </Button>
            </Link>
          </div>
        ) :

        /* CASO C: NUEVA SOLICITUD EN PROCESO / RECHAZADA */
        (
          <div className="space-y-8">
            <div className={`h-24 w-24 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl transform ${esRechazada ? 'bg-rose-50 text-rose-500 -rotate-3' : 'bg-emerald-50 text-emerald-500 rotate-3'}`}>
              {esRechazada ? <XCircle className="h-12 w-12" /> : <CheckCircle2 className="h-12 w-12" />}
            </div>
            
            <div className="space-y-2">
               <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-widest">
                  {esRechazada ? "Solicitud Rechazada" : "Solicitud en Revisión"}
               </h2>
               <div className={`h-1 w-12 mx-auto rounded-full ${esRechazada ? 'bg-rose-300' : 'bg-emerald-300'}`} />
            </div>

            <div className={`p-8 rounded-[2.5rem] border-2 text-left relative overflow-hidden ${esRechazada ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <p className={`text-[11px] font-black uppercase tracking-tight leading-relaxed mb-6 ${esRechazada ? 'text-rose-800' : 'text-emerald-800'}`}>
                {esRechazada 
                  ? "Su postulación no ha sido aprobada por el comité evaluador en esta oportunidad." 
                  : "Hemos recibido su postulación correctamente. Actualmente se encuentra en fase de validación técnica por el departamento de Bienestar Estudiantil."}
              </p>
              
              {observaciones && (
                <div className={`bg-white/80 p-5 rounded-2xl border shadow-sm ${esRechazada ? 'border-rose-100' : 'border-emerald-100'}`}>
                  <div className={`flex items-center gap-2 mb-3 ${esRechazada ? 'text-rose-900' : 'text-emerald-900'}`}>
                    <MessageSquareQuote className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Comentarios del Analista</span>
                  </div>
                  <p className={`text-[11px] font-bold italic leading-relaxed ${esRechazada ? 'text-rose-950' : 'text-emerald-950'}`}>
                    "{observaciones}"
                  </p>
                </div>
              )}
            </div>

            <Link href="/perfil" className="block">
              <Button className="w-full bg-[#1e3a5f] text-white font-black uppercase tracking-[0.2em] text-[10px] py-8 rounded-[2rem] shadow-xl shadow-blue-900/10 hover:bg-[#254674] transition-all">
                Ver historial en mi Perfil
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}