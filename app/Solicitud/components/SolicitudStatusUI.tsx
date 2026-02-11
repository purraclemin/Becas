"use client"

import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  MessageSquareQuote, 
  UserCircle, 
  ShieldAlert, 
  ArrowRight,
  ShieldX
} from "lucide-react"

/**
 * TARJETA 1: ACCESO RESTRINGIDO (SIN SESIÓN)
 */
export function RestrictedAccessCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4">
      <Card className="max-w-md w-full text-center p-8 border-t-4 border-red-500 shadow-xl">
         <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
         <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Acceso Restringido</h2>
         <p className="text-gray-500 text-sm mt-2 mb-6">Debes iniciar sesión como estudiante para realizar una solicitud de beneficio.</p>
         <Link href="/login">
           <Button className="w-full bg-[#1e3a5f] text-white uppercase font-black tracking-widest py-6">
              Iniciar Sesión
           </Button>
         </Link>
      </Card>
    </div>
  )
}

/**
 * TARJETA 2: GESTIÓN DE ESTADOS MAESTROS
 * Maneja Veto, Becado Activo y Solicitud en Curso.
 */
export function StatusCard({ estatus, studentRaw }: { estatus: string, studentRaw: any }) {
  // Constantes de lógica maestra
  const perdioBeca = studentRaw?.beca_perdida === 1;
  const yaEsBecado = studentRaw?.ha_tenido_beca === 1;
  const esRechazada = estatus === 'Rechazada';
  const observaciones = studentRaw?.observaciones_admin || "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4">
      <Card className={`max-w-md w-full text-center p-8 border-t-4 shadow-2xl animate-in fade-in zoom-in duration-500 ${
        perdioBeca ? 'border-rose-600' : yaEsBecado ? 'border-[#1e3a5f]' : 'border-emerald-500'
      }`}>
        
        {/* CASO A: VETO TOTAL (PERDIÓ LA BECA) */}
        {perdioBeca ? (
          <div className="space-y-6">
            <ShieldX className="h-16 w-16 text-rose-600 mx-auto" />
            <h2 className="text-xl font-black text-rose-950 uppercase tracking-tight">Beneficio Inhabilitado</h2>
            <div className="p-5 bg-rose-50 rounded-2xl border border-rose-100 text-left">
              <p className="text-rose-900 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" /> Registro de Exclusión
              </p>
              <p className="text-rose-800 text-sm font-medium leading-relaxed italic">
                "{studentRaw?.motivo_exclusion || 'El estudiante no cumple con los requisitos de permanencia del programa.'}"
              </p>
            </div>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full border-rose-200 text-rose-800 uppercase font-black tracking-widest text-[10px] py-6">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        ) : 

        /* CASO B: BECADO ACTIVO (REDIRECCIÓN AL PERFIL) */
        yaEsBecado ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-[#1e3a5f]">
              <UserCircle className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Programa Activo</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Usted ya posee un beneficio académico. Para renovar, cargar notas o ver su historial, utilice su portal de estudiante.
            </p>
            <Link href="/perfil" className="block">
              <Button className="w-full bg-[#1e3a5f] text-white font-black uppercase tracking-widest text-[10px] gap-2 py-7 shadow-lg hover:scale-[1.02] transition-transform">
                Gestionar en mi Perfil <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) :

        /* CASO C: NUEVA SOLICITUD EN PROCESO / RECHAZADA */
        (
          <div className="space-y-6">
            {esRechazada ? (
              <>
                <XCircle className="h-16 w-16 text-rose-500 mx-auto" />
                <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Solicitud Rechazada</h2>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto" />
                <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Solicitud en Revisión</h2>
              </>
            )}

            <div className={`p-5 rounded-2xl border text-left ${esRechazada ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-sm font-medium leading-relaxed mb-4 ${esRechazada ? 'text-rose-800' : 'text-emerald-800'}`}>
                {esRechazada 
                  ? "Su postulación inicial no ha sido aprobada por el comité evaluador." 
                  : "Hemos recibido su postulación. Actualmente se encuentra en fase de validación técnica."}
              </p>
              
              {observaciones && (
                <div className={`bg-white/60 p-3 rounded-xl border ${esRechazada ? 'border-rose-200' : 'border-emerald-200'}`}>
                  <div className={`flex items-center gap-1.5 mb-1 ${esRechazada ? 'text-rose-900' : 'text-emerald-900'}`}>
                    <MessageSquareQuote className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Comentarios del Analista</span>
                  </div>
                  <p className={`text-[11px] font-bold italic ${esRechazada ? 'text-rose-900' : 'text-emerald-900'}`}>
                    "{observaciones}"
                  </p>
                </div>
              )}
            </div>

            <Link href="/perfil" className="block">
              <Button className="w-full bg-[#1e3a5f] text-white font-black uppercase tracking-widest text-[10px] py-6 shadow-md">
                Ver detalles en mi Perfil
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}