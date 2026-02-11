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

// 🟢 PÁGINA PRINCIPAL (SERVER COMPONENT)
// MODIFICACIÓN: Cambiamos la firma para aceptar searchParams como Promise (Next.js 15)
export default async function PerfilPage(props: { searchParams: Promise<{ view?: string }> }) {
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

  // 🟢 CORRECCIÓN: Esperamos a que se resuelvan los parámetros de búsqueda
  const searchParams = await props.searchParams;
  const currentView = searchParams.view || 'status'; // 'status' | 'history'

  // 1. Obtener datos de ESTATUS ACTUAL
  let academicStatus = { 
    estatus: 'ninguna', 
    materias: [] as any[], 
    periodoActual: "N/A", 
    periodoActualNombre: "",
    periodoNotas: "",
    indiceGlobal: "0.00" as string | number, 
    carrera: "", 
    trimestre: 0,
    semestre: 0 
  };

  // 2. Obtener datos de HISTORIAL (Kardex)
  let historyData = { data: [], stats: { promedioHistorico: "0.00", totalMaterias: 0, totalPeriodos: 0 } };

  if (sessionUser.role === 'estudiante') {
    const statusData = await getStudentAcademicStatus(sessionUser.id);
    academicStatus = {
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

    // Obtenemos el historial completo
    const hist = await getStudentHistory(sessionUser.id);
    if (hist.success) {
        historyData = hist;
    }
  }

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
            
            {/* 🟢 SEGMENTED CONTROL (TABS FLOTANTES) */}
            <div className="flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm mb-6 relative">
                <Link href="/perfil?view=status" scroll={false} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'status' ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <LayoutDashboard className="h-4 w-4" /> Estatus Actual
                </Link>
                <Link href="/perfil?view=history" scroll={false} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'history' ? 'bg-[#1e3a5f] text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <History className="h-4 w-4" /> Kardex Histórico
                </Link>
            </div>

            {/* 🟢 CONTENIDO DINÁMICO SEGÚN LA PESTAÑA */}
            {currentView === 'status' ? (
                <>
                    {user.estatus === 'ninguna' && <ActionBanner />}
                    {user.estatus === 'Renovacion' && (
                        <RenovationBanner 
                            materias={user.materias} 
                            periodo={user.periodoActual} 
                            periodoNotas={user.periodoNotas}
                        />
                    )}
                    <GradesHistory materias={user.materias} periodoNotas={user.periodoNotas} />
                </>
            ) : (
                <HistoryTimeline history={historyData.data} stats={historyData.stats} />
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