import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft, LayoutDashboard, History } from "lucide-react"
import { ProfileIdentity } from "./components/ProfileIdentity"
import { ProfileStatus } from "./components/ProfileStatus"
import { AcademicInfo } from "./components/AcademicInfo"
import { ActionBanner, RenovationBanner } from "./components/ProfileBanners"
import { GradesHistory } from "./components/GradesHistory"
import { HistoryTimeline } from "./components/HistoryTimeline"

// 🟢 CRÍTICO: Fuerza a Next.js a no cachear esta página para ver cambios de estatus al instante
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PerfilPage(props: { searchParams: Promise<{ view?: string }> }) {
  const sessionUser = await getSession() as any;

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

  // Carga de datos fresca del servidor
  const [searchParams, statusData, historyDataResult] = await Promise.all([
    props.searchParams,
    getStudentAcademicStatus(sessionUser.id),
    getStudentHistory(sessionUser.id)
  ]);

  const currentView = searchParams.view || 'status'; 

  const academicStatus = {
    estatus: statusData.estatus,
    materias: statusData.materias,
    periodoActual: statusData.periodoActual || "Sin Periodo Activo",
    periodoActualNombre: statusData.periodoActualNombre || "", 
    periodoNotas: statusData.periodoNotas || "",
    indiceGlobal: statusData.indiceGlobal,
    carrera: statusData.carrera,
    trimestre: statusData.semestre, 
    semestre: statusData.semestre
  };

  const historyData = historyDataResult.success 
    ? historyDataResult 
    : { data: [], stats: { promedioHistorico: "0.00", totalMaterias: 0, totalPeriodos: 0 } };

  const user = { ...sessionUser, ...academicStatus };

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 md:py-16">
      <div className="container mx-auto px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="mb-8 flex justify-center md:justify-start">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm bg-white group px-6 py-5">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">Inicio Unimar</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="md:col-span-4 space-y-6">
            <ProfileIdentity user={user} />
            <ProfileStatus estatus={user.estatus} />
          </div>

          {/* COLUMNA DERECHA */}
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
                    <History className="h-4 w-4" /> Kardex Histórico
                </Link>
            </div>

            {currentView === 'status' ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {user.estatus === 'ninguna' && <ActionBanner />}
                    
                    {user.estatus === 'Renovacion' && (
                        <RenovationBanner 
                            materias={user.materias} 
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