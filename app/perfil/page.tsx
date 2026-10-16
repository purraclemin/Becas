import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, LayoutDashboard, History, CalendarDays } from "lucide-react"
import { ProfileIdentity } from "./components/ProfileIdentity"
import { ProfileStatus } from "./components/ProfileStatus"
import { AcademicInfo } from "./components/AcademicInfo"
import { ActionBanner, RenovationBanner, FinalistBanner } from "./components/ProfileBanners"
import { GradesHistory } from "./components/GradesHistory"
import { HistoryTimeline } from "./components/HistoryTimeline"
import { AlertaConvocatoria } from "./components/AlertaConvocatoria" // 🟢 Importación del modal flotante

// 🟢 CRÍTICO: Fuerza a Next.js a no cachear esta página para ver cambios de estatus al instante
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PerfilPage(props: { searchParams: Promise<{ view?: string, trimestre_renovacion?: string }> }) {
  const sessionUser = await getSession() as any;
  const searchParams = await props.searchParams;

  if (!sessionUser?.isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] px-4">
        <div className="max-w-md w-full bg-white rounded-xl text-center p-8 border-t-4 border-red-500 shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">Acceso Denegado</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">Inicia sesión para visualizar tu información académica.</p>
          <Link href="/login">
            <Button className="bg-[#1e3a5f] text-white w-full uppercase font-black tracking-widest hover:bg-[#162c46] py-6">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // 🟢 CARGA DINÁMICA: Enviamos el trimestre de renovación si existe en la URL
  const [statusData, historyDataResult] = await Promise.all([
    getStudentAcademicStatus(sessionUser.id, searchParams.trimestre_renovacion),
    getStudentHistory(sessionUser.id)
  ]);

  const currentView = searchParams.view || 'status'; 

  // 🟢 SEPARACIÓN ESTRATÉGICA DE DATOS:
  // semestre: Es el valor REAL (ej. 5) para el Expediente y Ficha.
  // trimestreEvaluado: Es el valor SUGERIDO (ej. 4) solo para la carga de notas.
  const academicStatus = {
    estatus: statusData.estatus,
    materias: statusData.materias,
    periodoActual: statusData.periodoActual || "Sin Periodo Activo",
    periodoActualNombre: statusData.periodoActualNombre || "", 
    periodoNotas: statusData.periodoNotas || "",
    indiceGlobal: statusData.indiceGlobal,
    carrera: statusData.carrera,
    semestre: statusData.semestre, // Ficha real
    trimestreEvaluado: statusData.trimestreSugerido // Evaluación
  };

  const historyData = historyDataResult.success 
    ? historyDataResult 
    : { data: [], stats: { promedioHistorico: "0.00", totalMaterias: 0, totalPeriodos: 0 } };

  // El objeto 'user' para los componentes de Expediente ahora tiene el semestre real
  const user = { ...sessionUser, ...academicStatus };

  // 🟢 LÓGICA DE FINALIZACIÓN: Basada en el semestre real
  const esUltimoTrimestre = user.semestre === 12;

  // Normalización estricta para detectar la convocatoria
  const estatusNormalizado = user.estatus?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || '';
  const esConvocado = estatusNormalizado.includes('convocad');

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 md:py-16">
      
      {/* 🟢 ALERTA LLAMATIVA EN TODA LA PANTALLA (Modal Ocultable con Botón Entendido) */}
      <AlertaConvocatoria estatus={user.estatus} />

      <div className="container mx-auto px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="mb-8 flex justify-center md:justify-start">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm bg-white group px-6 py-5">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">Inicio Unimar</span>
            </Button>
          </Link>
        </div>

        {/* 🟢 ALERTA VISUAL / BANNER FLOTANTE EN TIEMPO REAL PARA EL ESTUDIANTE CONVOCADO */}
        {esConvocado && (
          <div className="mb-8 bg-gradient-to-r from-[#1e3a5f] to-[#284b7a] border-l-8 border-[#d4a843] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in zoom-in duration-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#d4a843]/20 rounded-xl border border-[#d4a843]/30 shrink-0">
                <CalendarDays className="h-8 w-8 text-[#d4a843] animate-bounce" />
              </div>
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-[#d4a843] text-[#1e3a5f] rounded font-black text-[9px] uppercase tracking-wider">
                  Citación Oficial Urgente
                </span>
                <h3 className="text-sm md:text-base font-black uppercase tracking-wide">
                  ¡Entrevista Presencial Requerida!
                </h3>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  Su postulación ha sido seleccionada para entrevista presencial. Acuda al Departamento de Bienestar Estudiantil.
                </p>
              </div>
            </div>
            <div className="shrink-0 self-end md:self-center">
              <span className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#d4a843]">
                Estatus: Activo
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          
          {/* COLUMNA IZQUIERDA: Muestra nivel real */}
          <div className="md:col-span-4 space-y-6">
            <ProfileIdentity user={user} />
            <ProfileStatus estatus={user.estatus} />
          </div>

          {/* COLUMNA DERECHA: Muestra nivel real en AcademicInfo */}
          <div className="md:col-span-8 space-y-6">
            <AcademicInfo user={user} />
            
            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm mb-6 relative">
                <Link 
                  href="/perfil?view=status" 
                  scroll={false} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'status' ? 'bg-[#1e3a5f] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <LayoutDashboard className="h-4 w-4" /> Estatus Actual
                </Link>
                <Link 
                  href="/perfil?view=history" 
                  scroll={false} 
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'history' ? 'bg-[#1e3a5f] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <History className="h-4 w-4" /> Materias Cursadas
                </Link>
            </div>

            {currentView === 'status' ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {esUltimoTrimestre && <FinalistBanner />}

                    {user.estatus === 'ninguna' && <ActionBanner />}
                    
                    {user.estatus === 'Renovacion' && (
                        <RenovationBanner 
                            materias={user.materias} 
                            materiasSugeridas={statusData.materiasSugeridas}
                            // 🟢 PASAMOS ÚNICAMENTE AQUÍ EL TRIMESTRE EVALUADO (semestre - 1)
                            trimestreActual={academicStatus.trimestreEvaluado}
                            periodo={user.periodoActual} 
                            periodoNotas={user.periodoNotas}
                            userId={sessionUser.id}
                        />
                    )}
                    
                    <GradesHistory materias={user.materias} periodoNotas={user.periodoNotas} />
                </div>
            ) : (
                <div className="animate-in fade-in duration-500">
                    <HistoryTimeline history={historyData.data} stats={historyData.stats} />
                </div>
            )}
            
            <div className="pt-10 pb-4">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6"></div>
              <p className="text-center text-[9px] text-gray-400 font-black uppercase tracking-[0.4em]">
                Universidad de Margarita &bull; Alma Mater del Caribe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}