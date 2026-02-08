import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { SolicitudForm } from "@/app/Solicitud/components/SolicitudFormFields" 
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, AlertCircle, Home } from "lucide-react"

export default async function SolicitudPage() {
  // 1. OBTENCIÓN DE DATOS EN EL SERVIDOR (Cero esperas)
  const user = await getSession()

  // 2. PROTECCIÓN DE RUTA: Si no hay sesión, ni siquiera carga el formulario
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

  // 3. ESTRUCTURA ESTÁTICA: Se envía el HTML listo al navegador
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
          {/* Aquí inyectaremos el formulario interactivo en el siguiente paso */}
          <SolicitudForm user={user} />
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