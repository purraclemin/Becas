import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, XCircle, MessageSquareQuote, UserCircle, ShieldAlert } from "lucide-react"

export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4">
      <Card className="max-w-md w-full text-center p-8 border-t-4 border-red-500 shadow-xl">
         <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
         <h2 className="text-xl font-black text-[#1e3a5f] uppercase">Acceso Restringido</h2>
         <p className="text-gray-500 text-sm mt-2 mb-6">Debes iniciar sesión como estudiante para realizar una solicitud.</p>
         <Link href="/login">
           <Button className="w-full bg-[#1e3a5f] text-white uppercase font-black tracking-widest">
              Iniciar Sesión
           </Button>
         </Link>
      </Card>
    </div>
  )
}

export function StatusCard({ estatus, user, studentRaw }: any) {
  const esAprobada = estatus === 'Aprobada';
  const esRechazada = estatus === 'Rechazada';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4">
      <Card className={`max-w-md w-full text-center p-8 border-t-4 shadow-xl ${
        esAprobada ? 'border-emerald-500' : esRechazada ? 'border-rose-500' : 'border-amber-500'
      }`}>
         {esAprobada && (
           <>
             <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
             <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Su Solicitud está Aprobada</h2>
             <div className="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
               <p className="text-emerald-900 text-sm font-bold leading-relaxed mb-4 text-center">¡Felicidades! Su beneficio académico ha sido confirmado exitosamente.</p>
               {user.observaciones_admin && (
                  <div className="bg-white/60 p-3 rounded-xl border border-emerald-200">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-900">
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Nota de Aprobación</span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-900 italic">"{user.observaciones_admin}"</p>
                  </div>
               )}
             </div>
           </>
         )}
         {esRechazada && (
           <>
             <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
             <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Su solicitud ha sido Rechazada</h2>
             <div className="mt-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 text-left">
               <p className="text-rose-900 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                 <AlertCircle className="h-3 w-3" /> Estado de su Solicitud
               </p>
               <p className="text-rose-800 text-sm font-medium leading-relaxed italic mb-4">La solicitud no procede en este momento. Revise los detalles en su perfil.</p>
               {user.observaciones_admin && (
                  <div className="bg-white/60 p-3 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-1.5 mb-1 text-rose-900">
                      <MessageSquareQuote className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Motivo del Rechazo</span>
                    </div>
                    <p className="text-[11px] font-bold text-rose-900 italic">"{user.observaciones_admin}"</p>
                  </div>
               )}
             </div>
           </>
         )}
         {!esAprobada && !esRechazada && (
           <>
             <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
             <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Solicitud No Disponible</h2>
             {studentRaw?.beca_perdida === 1 && (
               <p className="text-gray-500 text-sm mt-4 mb-6 leading-relaxed text-center">
                 Usted ha perdido el beneficio anteriormente. Motivo: {studentRaw.motivo_exclusion || 'Incumplimiento de reglamento.'}
               </p>
             )}
           </>
         )}
         <Link href={esAprobada || esRechazada ? "/perfil" : "/"} className="mt-8 block">
           <Button className={`w-full uppercase font-black tracking-widest text-[10px] gap-2 ${
             esAprobada || esRechazada ? "bg-[#1e3a5f] hover:bg-[#2d4f7c] text-white" : "border-slate-200 text-slate-500"
           }`} variant={esAprobada || esRechazada ? "default" : "outline"}>
              {esAprobada || esRechazada ? <><UserCircle className="h-4 w-4" /> Ir a mi Perfil</> : "Volver al Inicio"}
           </Button>
         </Link>
      </Card>
    </div>
  )
}