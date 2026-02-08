import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  GraduationCap, Mail, IdCard, CalendarDays, BookOpen, 
  ClipboardCheck, AlertCircle, Clock, CheckCircle2, 
  XCircle, ArrowLeft 
} from "lucide-react"

// NOTA: Ya no usamos "use client", ni useState, ni useEffect.
// Esta función es 'async' y se ejecuta en el servidor antes de enviar nada al navegador.
export default async function PerfilPage() {
  
  // 1. OBTENCIÓN DE DATOS DIRECTA (Sin tiempos de carga visibles)
  const user = await getSession()

  // 2. MANEJO DE ACCESO DENEGADO (Renderizado en servidor)
  if (!user?.isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] px-4">
        <Card className="max-w-md w-full text-center p-8 border-t-4 border-red-500 shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase">Acceso Denegado</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">Inicia sesión para visualizar tu información académica.</p>
          <Link href="/login">
            <Button className="bg-[#1e3a5f] text-white w-full uppercase font-bold tracking-widest hover:bg-[#162c46]">
              Iniciar Sesión
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  // 3. RENDERIZADO DEL PERFIL (Igual que tu diseño, pero instantáneo)
  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Botón de navegación */}
        <div className="mb-8 flex justify-center md:justify-start">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm bg-white group px-6">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[10px] tracking-widest">Inicio Unimar</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          
          {/* IDENTIDAD Y ESTATUS */}
          <div className="md:col-span-4 space-y-6">
            <Card className="border-none shadow-2xl overflow-hidden bg-white">
              <div className="h-24 bg-[#1e3a5f] relative">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a843_1px,transparent_1px)] [background-size:16px_16px]"></div>
              </div>
              <CardContent className="flex flex-col items-center -mt-12 relative z-10">
                <Avatar className="h-28 w-28 border-4 border-white shadow-2xl ring-2 ring-gray-50">
                  <AvatarFallback className="bg-[#d4a843] text-[#1e3a5f] text-3xl font-black font-serif">
                    {user.nombre?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mt-6">
                  <h3 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight leading-tight px-4">{user.nombre}</h3>
                  <Badge className="mt-3 bg-[#1e3a5f] text-[#d4a843] border border-[#d4a843]/30 uppercase font-black text-[10px] tracking-[0.2em] px-5 py-1.5 shadow-sm">
                    {user.role}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* TARJETA DE ESTATUS */}
            <Card className={`border-none shadow-xl overflow-hidden relative transition-all duration-500 ${
              user.estatusBeca === 'Aprobada' ? 'bg-green-50' :
              user.estatusBeca === 'Pendiente' ? 'bg-yellow-50' :
              user.estatusBeca === 'Rechazada' ? 'bg-red-50' : 'bg-gray-50'
            }`}>
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                 user.estatusBeca === 'Aprobada' ? 'bg-green-500' :
                 user.estatusBeca === 'Pendiente' ? 'bg-yellow-400' :
                 user.estatusBeca === 'Rechazada' ? 'bg-red-500' : 'bg-gray-400'
              }`}></div>

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Estado del Trámite</span>
                  <div className={`h-3 w-3 rounded-full animate-pulse shadow-sm ${
                    user.estatusBeca === 'Aprobada' ? 'bg-green-500' :
                    user.estatusBeca === 'Pendiente' ? 'bg-yellow-400' :
                    user.estatusBeca === 'Rechazada' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-white/60 shadow-inner ${
                    user.estatusBeca === 'Aprobada' ? 'text-green-600' :
                    user.estatusBeca === 'Pendiente' ? 'text-yellow-600' :
                    user.estatusBeca === 'Rechazada' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {user.estatusBeca === 'Aprobada' && <CheckCircle2 className="h-6 w-6" />}
                    {user.estatusBeca === 'Pendiente' && <Clock className="h-6 w-6" />}
                    {user.estatusBeca === 'Rechazada' && <XCircle className="h-6 w-6" />}
                    {user.estatusBeca === 'ninguna' && <AlertCircle className="h-6 w-6" />}
                  </div>
                  
                  <span className={`text-lg font-black uppercase tracking-tighter ${
                    user.estatusBeca === 'Aprobada' ? 'text-green-800' :
                    user.estatusBeca === 'Pendiente' ? 'text-yellow-800' :
                    user.estatusBeca === 'Rechazada' ? 'text-red-800' : 'text-gray-500'
                  }`}>
                    {user.estatusBeca === 'ninguna' ? 'Sin Solicitud' : user.estatusBeca}
                  </span>
                </div>
                
                <p className="mt-4 text-[11px] md:text-xs font-semibold text-gray-600 leading-relaxed italic border-t border-black/5 pt-4">
                  {user.estatusBeca === 'ninguna' && "Actualmente no posees ningún proceso de beca activo en el sistema."}
                  {user.estatusBeca === 'Pendiente' && "Tu documentación ha sido recibida y se encuentra bajo revisión del decanato."}
                  {user.estatusBeca === 'Aprobada' && "Felicidades, tu beneficio académico ha sido confirmado exitosamente."}
                  {user.estatusBeca === 'Rechazada' && "Tu solicitud ha sido declinada. Puedes contactar a Bienestar Estudiantil."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* INFORMACIÓN ACADÉMICA */}
          <div className="md:col-span-8 space-y-6">
            <Card className="border-none shadow-2xl bg-white overflow-hidden">
              <CardHeader className="bg-[#fcfdfe] border-b border-gray-100 p-6 md:p-8">
                <CardTitle className="text-[#1e3a5f] font-serif text-lg md:text-xl flex items-center gap-3 uppercase tracking-tight">
                  <div className="p-2 bg-[#1e3a5f]/5 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-[#d4a843]" />
                  </div>
                  Expediente Académico
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 md:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <InfoItem icon={IdCard} label="Cédula de Identidad" value={`V-${user.cedula}`} />
                  <InfoItem icon={Mail} label="Correo Institucional" value={user.email} isLowercase />
                  <InfoItem icon={BookOpen} label="Programa de Estudios" value={user.carrera} isUppercase />
                  <InfoItem icon={CalendarDays} label="Periodo Lectivo" value={`${user.trimestre}° Trimestre / Semestre`} />
                </div>
              </CardContent>
            </Card>

            {/* Banner de Acción (Solo si no tiene beca) */}
            {user.estatusBeca === 'ninguna' && (
              <div className="p-6 md:p-10 rounded-2xl border-2 border-dashed border-[#d4a843] bg-[#d4a843]/5 flex flex-col lg:flex-row items-center justify-between gap-6 transition-all hover:bg-[#d4a843]/10">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-[#d4a843]/20">
                    <ClipboardCheck className="h-8 w-8 text-[#d4a843]" />
                  </div>
                  <div>
                    <h4 className="text-base md:text-lg font-black text-[#1e3a5f] uppercase tracking-tight">¿Deseas postularte?</h4>
                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">El proceso de solicitudes para el nuevo periodo está abierto.</p>
                  </div>
                </div>
                <Link href="/Solicitud" className="w-full lg:w-auto">
                  <Button className="w-full bg-[#1e3a5f] text-[#d4a843] hover:bg-[#1a2744] transition-all font-black text-xs uppercase tracking-widest px-10 py-7 shadow-xl hover:scale-105 active:scale-95">
                    Iniciar Solicitud
                  </Button>
                </Link>
              </div>
            )}
            
            <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] pt-4 md:pt-10">
              Universidad de Margarita &bull; Alma Mater del Caribe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Subcomponente simple para mantener el código limpio
function InfoItem({ icon: Icon, label, value, isLowercase, isUppercase }: any) {
  return (
    <div className="space-y-2 group cursor-default">
      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest group-hover:text-[#d4a843] transition-colors">
        <Icon className="h-4 w-4" /> 
        {label}
      </div>
      <p className={`text-sm md:text-base font-bold text-[#1e3a5f] border-b border-gray-100 pb-2 transition-all group-hover:border-[#d4a843]/30 ${isLowercase ? 'lowercase' : isUppercase ? 'uppercase tracking-tighter' : ''}`}>
        {value || "No especificado"}
      </p>
    </div>
  )
}