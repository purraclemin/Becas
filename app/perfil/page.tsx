import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { getStudentAcademicStatus } from "@/lib/ActionsStudent"
import { getStudentHistory } from "@/lib/ActionsHistoryMaterias"
import { sincronizarYObtenerRecordAcademico } from "@/lib/ActionsRecordAcademico"
import { evaluarYRenovarEstudianteEnCambioPeriodo } from "@/lib/ActionsRenovacion"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  ArrowLeft,
  LayoutDashboard,
  History,
  CalendarDays,
  MessageSquareText
} from "lucide-react"
import { ProfileIdentity } from "./components/ProfileIdentity"
import { ProfileStatus } from "./components/ProfileStatus"
import { AcademicInfo } from "./components/AcademicInfo"
import { ActionBanner, RenovationBanner, FinalistBanner } from "./components/ProfileBanners"
import { GradesHistory } from "./components/GradesHistory"
import { HistoryTimeline } from "./components/HistoryTimeline"
import { AlertaConvocatoria } from "./components/AlertaConvocatoria"
import { PerfilRealtimeWatcher } from "./components/PerfilRealtimeWatcher"
import type { IEvaluacionAcademica } from "@/lib/RecordAcademicoUtils"

// CRÍTICO: Fuerza a Next.js a no cachear esta página para ver cambios de periodo y estatus al instante
export const dynamic = "force-dynamic"
export const revalidate = 0

const SEMESTRE_EGRESADO = 13

interface PerfilSession {
  isLoggedIn?: boolean;
  role?: string;
  id?: number | string;
  nombre?: string;
  email?: string;
  becaPerdida?: boolean;
  esEgresado?: boolean;
  puedePostular?: boolean;
  observacionesAdmin?: string | null;
  departamentoAsignado?: string | null;
  tipoBeca?: string | null;
  [key: string]: unknown;
}

interface PerfilStatusData {
  estatus?: string;
  becaPerdida?: boolean;
  esEgresado?: boolean;
  puedePostular?: boolean;
  observacionesAdmin?: string | null;
  materias?: unknown;
  periodoActual?: string;
  periodoActualNombre?: string;
  periodoNotas?: string;
  indiceGlobal?: string | number;
  carrera?: string;
  semestre?: number;
  trimestreSugerido?: number;
  materiasSugeridas?: Array<{
    codigo_materia: string;
    nombre_materia: string;
    unidades_credito: number;
  }>;
  evaluacionAcademica?: IEvaluacionAcademica | null;
  lastSolicitud?: {
    departamento_asignado?: string | null;
    tipo_beca?: string | null;
  } | null;
}

export default async function PerfilPage(props: {
  searchParams: Promise<{ view?: string; trimestre_renovacion?: string }>;
}) {
  const sessionUser = (await getSession()) as PerfilSession
  const searchParams = await props.searchParams

  if (!sessionUser?.isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f0f4f8] px-4">
        <div className="max-w-md w-full bg-white rounded-xl text-center p-8 border-t-4 border-red-500 shadow-xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1e3a5f] uppercase tracking-tight">
            Acceso Denegado
          </h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            Inicia sesión para visualizar tu información académica.
          </p>
          <Link href="/login">
            <Button className="bg-[#1e3a5f] text-white w-full uppercase font-black tracking-widest hover:bg-[#162c46] py-6">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const studentIdNum = Number(sessionUser.id ?? 0)

  // 1. Transición automática de periodo + sincronización única previa al Promise.all
  if (sessionUser.role === "estudiante" && Number.isInteger(studentIdNum) && studentIdNum > 0) {
    await evaluarYRenovarEstudianteEnCambioPeriodo(studentIdNum)
    await sincronizarYObtenerRecordAcademico(studentIdNum)
  }

  const [statusDataRaw, historyDataResult] = await Promise.all([
    getStudentAcademicStatus(studentIdNum, searchParams.trimestre_renovacion),
    getStudentHistory(studentIdNum)
  ])

  const statusData = statusDataRaw as PerfilStatusData
  const currentView = searchParams.view || "status"

  const becaPerdidaFinal = Boolean(statusData.becaPerdida || sessionUser.becaPerdida)
  const semestreFinal = Number(statusData.semestre ?? 0)
  const esEgresadoFinal = Boolean(
    statusData.esEgresado || sessionUser.esEgresado || semestreFinal >= SEMESTRE_EGRESADO
  )
  const observacionesAdminFinal =
    statusData.observacionesAdmin ?? sessionUser.observacionesAdmin ?? null

  const estatusFinal = becaPerdidaFinal ? "Rechazada" : statusData.estatus || "ninguna"
  const puedePostularFinal = Boolean(
    !becaPerdidaFinal &&
      !esEgresadoFinal &&
      (statusData.puedePostular ??
        (estatusFinal === "ninguna" || estatusFinal === "Finalizada"))
  )

  const departamentoAsignadoFinal =
    statusData.lastSolicitud?.departamento_asignado &&
    String(statusData.lastSolicitud.departamento_asignado).trim() !== ""
      ? String(statusData.lastSolicitud.departamento_asignado).trim()
      : sessionUser.departamentoAsignado &&
          String(sessionUser.departamentoAsignado).trim() !== ""
        ? String(sessionUser.departamentoAsignado).trim()
        : null

  const tipoBecaFinal =
    statusData.lastSolicitud?.tipo_beca &&
    String(statusData.lastSolicitud.tipo_beca).trim() !== ""
      ? String(statusData.lastSolicitud.tipo_beca).trim()
      : sessionUser.tipoBeca && String(sessionUser.tipoBeca).trim() !== ""
        ? String(sessionUser.tipoBeca).trim()
        : null

  const academicStatus = {
    estatus: estatusFinal,
    becaPerdida: becaPerdidaFinal,
    esEgresado: esEgresadoFinal,
    puedePostular: puedePostularFinal,
    observacionesAdmin: observacionesAdminFinal,
    departamentoAsignado: departamentoAsignadoFinal,
    tipoBeca: tipoBecaFinal,
    materias: statusData.materias,
    periodoActual: statusData.periodoActual || "Sin Periodo Activo",
    periodoActualNombre: statusData.periodoActualNombre || "",
    periodoNotas: statusData.periodoNotas || "",
    indiceGlobal: statusData.indiceGlobal,
    carrera: statusData.carrera,
    semestre: semestreFinal,
    trimestreEvaluado: statusData.trimestreSugerido
  }

  const historyData = historyDataResult.success
    ? historyDataResult
    : { data: [], stats: { promedioHistorico: "0.00", totalMaterias: 0, totalPeriodos: 0 } }

  const user = { ...sessionUser, ...academicStatus }

  const esUltimoTrimestre = user.semestre === 12
  const mostrarBannerFinalista = esUltimoTrimestre || esEgresadoFinal

  const estatusNormalizado =
    user.estatus?.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || ""
  const esConvocado = estatusNormalizado.includes("convocad")

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 md:py-16">
      {/* WATCHER EN TIEMPO REAL PARA ESTUDIANTES (SIN WEBSOCKETS, COMPATIBLE XAMPP/VERCEL) */}
      {sessionUser.role === "estudiante" && (
        <PerfilRealtimeWatcher
          initialSnapshot={{
            estatus: user.estatus,
            observacionesAdmin: user.observacionesAdmin,
            departamentoAsignado: departamentoAsignadoFinal,
            semestre: user.semestre,
            becaPerdida: user.becaPerdida,
            periodoActual: user.periodoActual,
            tipoBeca: tipoBecaFinal,
          }}
        />
      )}

      {/* ALERTA MODAL EN TODA LA PANTALLA CON LAS INSTRUCCIONES DE CITACIÓN */}
      <AlertaConvocatoria
        estatus={user.estatus}
        instrucciones={user.observacionesAdmin}
      />

      <div className="container mx-auto px-4 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex justify-center md:justify-start">
          <Link href="/">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all shadow-sm bg-white group px-6 py-5"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[10px] tracking-[0.2em]">
                Inicio Unimar
              </span>
            </Button>
          </Link>
        </div>

        {/* BANNER PERSISTENTE EN EL PERFIL PARA EL ESTUDIANTE CONVOCADO */}
        {esConvocado && (
          <div className="mb-8 bg-gradient-to-r from-[#1e3a5f] to-[#284b7a] border-l-8 border-[#d4a843] rounded-2xl p-6 text-white shadow-xl space-y-4 animate-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
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

            {user.observacionesAdmin && (
              <div className="bg-white/10 border border-[#d4a843]/40 rounded-xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#d4a843]">
                  <MessageSquareText className="h-3.5 w-3.5 shrink-0" />
                  <span>Instrucciones de Citación</span>
                </div>
                <p className="text-xs md:text-sm text-white font-medium leading-relaxed whitespace-pre-line break-words">
                  {user.observacionesAdmin}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10">
          {/* COLUMNA IZQUIERDA */}
          <div className="md:col-span-4 space-y-6">
            <ProfileIdentity user={user} />
            <ProfileStatus
              estatus={user.estatus}
              materias={user.materias}
              motivoRechazo={
                user.estatus === "Rechazada"
                  ? (user.observacionesAdmin ?? undefined)
                  : undefined
              }
              observacionesAdmin={user.observacionesAdmin}
              departamentoAsignado={departamentoAsignadoFinal}
              tipoBeca={tipoBecaFinal}
              becaPerdida={user.becaPerdida}
              esEgresado={user.esEgresado}
            />
          </div>

          {/* COLUMNA DERECHA */}
          <div className="md:col-span-8 space-y-6">
            <AcademicInfo user={user} />

            <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm mb-6 relative">
              <Link
                href="/perfil?view=status"
                scroll={false}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  currentView === "status"
                    ? "bg-[#1e3a5f] text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" /> Estatus Actual
              </Link>
              <Link
                href="/perfil?view=history"
                scroll={false}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  currentView === "history"
                    ? "bg-[#1e3a5f] text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                <History className="h-4 w-4" /> Materias Cursadas
              </Link>
            </div>

            {currentView === "status" ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {mostrarBannerFinalista && (
                  <FinalistBanner esEgresado={esEgresadoFinal} />
                )}

                {user.puedePostular && <ActionBanner />}

                {!user.becaPerdida && !esEgresadoFinal && user.estatus === "Renovacion" && (
                  <RenovationBanner
                    materias={user.materias}
                    materiasSugeridas={statusData.materiasSugeridas}
                    trimestreActual={academicStatus.trimestreEvaluado}
                    periodo={user.periodoActual}
                    periodoNotas={user.periodoNotas}
                    userId={studentIdNum}
                  />
                )}

                <GradesHistory
                  materias={user.materias}
                  periodoNotas={user.periodoNotas}
                />
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <HistoryTimeline
                  history={historyData.data}
                  stats={historyData.stats}
                />
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