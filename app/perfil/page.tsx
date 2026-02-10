import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, ClipboardCheck, RotateCcw, BookCheck, FileText } from "lucide-react"
import { ProfileIdentity } from "./components/ProfileIdentity"
import { ProfileStatus } from "./components/ProfileStatus"
import { AcademicInfo } from "./components/AcademicInfo"

/**
 * BANNER 1: POSTULACIÓN INICIAL
 * Se muestra a estudiantes que nunca han solicitado beca.
 */
function ActionBanner() {
  return (
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
  )
}

/**
 * BANNER 2: RENOVACIÓN ACADÉMICA (DETALLADO)
 * Muestra el periodo actual y el resumen de materias registradas anteriormente.
 */
function RenovationBanner({ materias, periodo }: { materias: any[], periodo: string }) {
  return (
    <div className="p-6 md:p-8 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white shadow-sm flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg rotate-3">
            <RotateCcw className="h-7 w-7 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-black text-violet-900 uppercase tracking-tight">Renovación de Beneficio</h4>
            <p className="text-xs text-violet-600 font-bold uppercase tracking-widest">Periodo Académico: {periodo}</p>
          </div>
        </div>
        <Link href="/Solicitud" className="w-full lg:w-auto">
          <Button className="w-full bg-violet-600 text-white hover:bg-violet-700 transition-all font-black text-[10px] uppercase tracking-[0.2em] px-8 py-6 shadow-md">
            Cargar Notas del Nuevo Ciclo
          </Button>
        </Link>
      </div>

      {/* Resumen Académico: Materias y Notas del periodo que cierra */}
      {materias && materias.length > 0 && (
        <div className="bg-white/80 rounded-xl p-5 border border-violet-100 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-violet-50 pb-2">
            <BookCheck className="h-4 w-4 text-violet-500" />
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Calificaciones Registradas Anteriormente</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {materias.map((m: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center group">
                <span className="text-xs font-bold text-gray-500 uppercase truncate max-w-[200px]">{m.nombre}</span>
                <span className={`text-xs font-black px-2 py-1 rounded ${parseFloat(m.nota) >= 10 ? 'text-violet-700 bg-violet-100' : 'text-red-700 bg-red-100'}`}>
                  {parseFloat(m.nota).toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * SECCIÓN DE HISTORIAL DE NOTAS (PERMANENTE)
 * Muestra el registro completo de materias y calificaciones.
 */
function GradesHistory({ materias }: { materias: any[] }) {
  if (!materias || materias.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-[#fcfdfe] border-b border-gray-100 p-6 md:p-8 flex items-center gap-3">
        <div className="p-2 bg-[#1e3a5f]/5 rounded-lg">
          <FileText className="h-6 w-6 text-[#d4a843]" />
        </div>
        <h4 className="text-[#1e3a5f] font-serif text-lg md:text-xl uppercase tracking-tight">Registro de Calificaciones</h4>
      </div>
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {materias.map((m: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-gray-100 bg-gray-50/30 group hover:border-[#d4a843]/20 transition-all">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Asignatura</span>
                <span className="text-sm font-bold text-[#1e3a5f] uppercase tracking-tighter">{m.nombre}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nota</span>
                <span className={`text-lg font-black ${parseFloat(m.nota) >= 10 ? 'text-[#1e3a5f]' : 'text-red-600'}`}>
                  {parseFloat(m.nota).toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PerfilPage() {
  // 1. Obtener identidad básica
  const sessionUser = await getSession() as any;

  if (!sessionUser?.isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] px-4">
        <div className="max-w-md w-full bg-white rounded-xl text-center p-8 border-t-4 border-red-500 shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase">Acceso Denegado</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">Inicia sesión para visualizar tu información académica.</p>
          <Link href="/login">
            <Button className="bg-[#1e3a5f] text-white w-full uppercase font-bold tracking-widest hover:bg-[#162c46]">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // 2. Si es estudiante, obtener lógica académica inteligente de forma modular
  let academicStatus = { estatus: sessionUser.estatus, materias: [], periodoActual: "N/A" };
  if (sessionUser.role === 'estudiante') {
    const statusData = await getStudentAcademicStatus(sessionUser.id);
    academicStatus = {
      estatus: statusData.estatus,
      materias: statusData.materias,
      periodoActual: statusData.periodoActual
    };
  }

  // Combinamos los datos para los componentes
  const user = { ...sessionUser, ...academicStatus };

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex justify-center md:justify-start">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm bg-white group px-6">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[10px] tracking-widest">Inicio Unimar</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          <div className="md:col-span-4 space-y-6">
            <ProfileIdentity user={user} />
            <ProfileStatus estatus={user.estatus} />
          </div>

          <div className="md:col-span-8 space-y-6">
            <AcademicInfo user={user} />
            
            {/* LÓGICA DE BANNERS DINÁMICOS BASADA EN EL CEREBRO MODULAR */}
            {user.estatus === 'ninguna' && <ActionBanner />}
            {user.estatus === 'Renovacion' && (
              <RenovationBanner 
                materias={user.materias} 
                periodo={user.periodoActual} 
              />
            )}

            {/* HISTORIAL PERMANENTE DE CALIFICACIONES */}
            <GradesHistory materias={user.materias} />
            
            <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.4em] pt-4 md:pt-10">
              Universidad de Margarita &bull; Alma Mater del Caribe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}