import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { SolicitudForm } from "@/app/Solicitud/components/SolicitudFormFields" 
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, AlertCircle, Home, ShieldAlert, CheckCircle2, XCircle, MessageSquareQuote, UserCircle } from "lucide-react"
import { db } from "@/lib/db"

export default async function SolicitudPage() {
  // 1. OBTENCIÓN DE DATOS EN EL SERVIDOR
  const user = await getSession()

  // 2. PROTECCIÓN DE RUTA
  if (!user?.isLoggedIn) {
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

  // 3. OBTENCIÓN DE DATOS ACADÉMICOS Y ESTATUS DE SOLICITUD
  const [studentRows]: any = await db.execute(
    'SELECT ha_tenido_beca, beca_perdida, motivo_exclusion FROM students WHERE id = ?',
    [user.id]
  );

  const [solicitudRows]: any = await db.execute(
    'SELECT estatus, observaciones_admin, tipo_beca, promedio_notas, motivo_solicitud, foto_carnet, copia_cedula, planilla_inscripcion FROM solicitudes WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [user.id]
  );

  const student = studentRows[0];
  const infoSolicitud = solicitudRows[0];
  const estatus = infoSolicitud?.estatus || 'ninguna';

  const enrichedUser = {
    ...user,
    estatusBeca: estatus,
    observaciones_admin: infoSolicitud?.observaciones_admin || null,
    tipo_beca: infoSolicitud?.tipo_beca || "",
    promedio_notas: infoSolicitud?.promedio_notas || "",
    motivo_solicitud: infoSolicitud?.motivo_solicitud || "",
    foto_url: infoSolicitud?.foto_carnet || null,
    cedula_url: infoSolicitud?.copia_cedula || null,
    planilla_url: infoSolicitud?.planilla_inscripcion || null
  };

  // 🟢 LÓGICA DE TARJETAS DE ESTADO
  // Definimos si hay una solicitud activa que deba mostrar el formulario en lugar del bloqueo
  const tieneSolicitudActiva = estatus === 'En Revisión' || estatus === 'Pendiente';

  // CONDICIÓN PRINCIPAL:
  // 1. Si es Aprobada o Rechazada -> Muestra tarjeta (Prioridad Alta)
  // 2. O SI (tiene candado histórico Y NO tiene solicitud activa) -> Muestra tarjeta de bloqueo
  if (estatus === 'Aprobada' || estatus === 'Rechazada' || ((student && (student.ha_tenido_beca === 1 || student.beca_perdida === 1)) && !tieneSolicitudActiva)) {
    
    const esAprobada = estatus === 'Aprobada';
    const esRechazada = estatus === 'Rechazada';

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] p-4">
        <Card className={`max-w-md w-full text-center p-8 border-t-4 shadow-xl ${
          esAprobada ? 'border-emerald-500' : 
          esRechazada ? 'border-rose-500' : 
          'border-amber-500'
        }`}>
           
           {/* ✅ CASO APROBADA */}
           {esAprobada && (
             <>
               <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
               <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Su Solicitud está Aprobada</h2>
               <div className="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                 <p className="text-emerald-900 text-sm font-bold leading-relaxed mb-4 text-center">
                   ¡Felicidades! Su beneficio académico ha sido confirmado exitosamente.
                 </p>
                 
                 {enrichedUser.observaciones_admin && (
                    <div className="bg-white/60 p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-900">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Nota de Aprobación</span>
                      </div>
                      <p className="text-[11px] font-bold text-emerald-900 italic">"{enrichedUser.observaciones_admin}"</p>
                    </div>
                 )}
               </div>
             </>
           )}

           {/* ❌ CASO RECHAZADA */}
           {esRechazada && (
             <>
               <XCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
               <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Su solicitud ha sido Rechazada</h2>
               <div className="mt-4 p-5 bg-rose-50 rounded-2xl border border-rose-100 text-left">
                 <p className="text-rose-900 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                   <AlertCircle className="h-3 w-3" /> Estado de su Solicitud
                 </p>
                 <p className="text-rose-800 text-sm font-medium leading-relaxed italic mb-4">
                    La solicitud no procede en este momento. Revise los detalles en su perfil.
                 </p>
                 {enrichedUser.observaciones_admin && (
                    <div className="bg-white/60 p-3 rounded-xl border border-rose-200">
                      <div className="flex items-center gap-1.5 mb-1 text-rose-900">
                        <MessageSquareQuote className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Motivo del Rechazo</span>
                      </div>
                      <p className="text-[11px] font-bold text-rose-900 italic">"{enrichedUser.observaciones_admin}"</p>
                    </div>
                 )}
               </div>
             </>
           )}

           {/* ⚠️ CASO BLOQUEO HISTÓRICO (Bala de Plata) */}
           {!esAprobada && !esRechazada && (
             <>
               <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto mb-4" />
               <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Solicitud No Disponible</h2>
               {/* Se eliminó el texto genérico, solo se muestra si hay motivo de exclusión explícito */}
               {student?.beca_perdida === 1 && (
                 <p className="text-gray-500 text-sm mt-4 mb-6 leading-relaxed">
                    Usted ha perdido el beneficio anteriormente. Motivo: {student.motivo_exclusion || 'Incumplimiento de reglamento.'}
                 </p>
               )}
             </>
           )}
           
           {/* BOTÓN DE REDIRECCIÓN */}
           {(esAprobada || esRechazada) ? (
             <Link href="/perfil" className="mt-8 block">
               <Button className="w-full bg-[#1e3a5f] hover:bg-[#2d4f7c] text-white uppercase font-black tracking-widest text-[10px] gap-2">
                  <UserCircle className="h-4 w-4" />
                  Ir a mi Perfil
               </Button>
             </Link>
           ) : (
             <Link href="/" className="mt-8 block">
               <Button variant="outline" className="w-full border-slate-200 text-slate-500 uppercase font-black tracking-widest text-[10px]">
                  Volver al Inicio
               </Button>
             </Link>
           )}
        </Card>
      </div>
    )
  }

  // 4. RENDERIZADO DEL FORMULARIO
  // Si llega aquí es porque está en 'Pendiente' o 'En Revisión' (aunque tenga historial de beca),
  // o es un estudiante nuevo.
  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl animate-in fade-in duration-500">
      
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </Link>
        <div className="text-[#1e3a5f] font-black text-xs uppercase tracking-widest hidden sm:block">
          Unimar • Sistema de Becas
        </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        <div className="bg-[#1e3a5f] p-8 text-center border-b-4 border-[#d4a843]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <FileText className="h-8 w-8 text-[#1e3a5f]" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight font-serif">
            Nueva Solicitud de Beca
          </CardTitle>
          <p className="text-[#8a9bbd] text-xs uppercase tracking-widest mt-2 font-bold italic">
            Universidad de Margarita
          </p>
        </div>

        <CardContent className="p-8">
          <SolicitudForm user={enrichedUser} />
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#8a9bbd] hover:text-[#1e3a5f] transition-colors uppercase tracking-widest">
          <Home className="h-3 w-3" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}