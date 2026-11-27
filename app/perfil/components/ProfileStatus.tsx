'use client'

import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  FileSearch,
  RotateCcw,
  CalendarDays,
  MessageSquareText,
  Lock,
  Archive,
  GraduationCap,
  Building2,
  Award,
  type LucideIcon
} from "lucide-react"

interface MateriaEvaluacionItem {
  nombre?: string;
  nota: number | string;
}

type StatusKey =
  | 'aprobada'
  | 'convocado'
  | 'pendiente'
  | 'rechazada'
  | 'finalizada'
  | 'especial'
  | 'revision'
  | 'renovacion'
  | 'ninguna';

interface StatusVisualConfig {
  bg: string;
  bar: string;
  text: string;
  iconText: string;
  label: string;
  icon: LucideIcon;
  pulse: boolean;
  msg: string;
}

interface ProfileStatusProps {
  estatus: string;
  materias?: unknown;
  motivoRechazo?: string;
  observacionesAdmin?: string | null;
  departamentoAsignado?: string | null;
  tipoBeca?: string | null;
  becaPerdida?: boolean;
  esEgresado?: boolean;
}

/**
 * COMPONENTE: ESTATUS VISUAL DEL PERFIL
 * Muestra el estatus de la solicitud, el departamento asignado, despliega instrucciones de citación,
 * refleja el cierre neutro 'Finalizada' (egreso o rotación sin sanción) y la inhabilitación por rechazo.
 */
export function ProfileStatus({
  estatus,
  materias,
  motivoRechazo,
  observacionesAdmin,
  departamentoAsignado,
  tipoBeca,
  becaPerdida = false,
  esEgresado = false,
}: ProfileStatusProps) {
  const s =
    estatus
      ?.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || 'ninguna';

  let listaMaterias: MateriaEvaluacionItem[] = [];
  try {
    let parsed: unknown = materias;
    if (typeof materias === 'string') {
      parsed = JSON.parse(materias);
    }
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const obj = parsed as { materias?: unknown };
      if (Array.isArray(obj.materias)) {
        listaMaterias = obj.materias as MateriaEvaluacionItem[];
      }
    } else if (Array.isArray(parsed)) {
      listaMaterias = parsed as MateriaEvaluacionItem[];
    }
  } catch {
    listaMaterias = [];
  }

  const tieneReprobadas = listaMaterias.some((m) => Number(m.nota) < 10);

  const observacionLimpia =
    observacionesAdmin && observacionesAdmin.trim() !== ''
      ? observacionesAdmin.trim()
      : null;

  const mensajeRechazo =
    motivoRechazo && motivoRechazo.trim() !== ''
      ? motivoRechazo.trim()
      : observacionLimpia
        ? observacionLimpia
        : tieneReprobadas || s.includes('materia')
          ? "Solicitud rechazada: se detectó al menos una unidad curricular reprobada (calificación inferior a 10 puntos). Por reglamento institucional, no podrá optar nuevamente por becas."
          : "Tu solicitud ha sido rechazada de forma definitiva. Por reglamento institucional, no podrás optar nuevamente a becas ni ayudas económicas.";

  const mensajeFinalizada = observacionLimpia
    ? observacionLimpia
    : esEgresado
      ? "Acabó su periodo académico. Has culminado satisfactoriamente tu trayectoria académica en UNIMAR."
      : "Tu beneficio anterior culminó sin sanción académica ni disciplinaria. Puedes postularte nuevamente en el periodo vigente.";

  const config: Record<StatusKey, StatusVisualConfig> = {
    aprobada: {
      bg: "bg-green-50",
      bar: "bg-green-500",
      text: "text-green-800",
      iconText: "text-green-600",
      label: "Becado / Activo",
      icon: CheckCircle2,
      pulse: false,
      msg: "Felicidades, tu beneficio académico está vigente y confirmado para este periodo."
    },
    convocado: {
      bg: "bg-orange-50",
      bar: "bg-orange-500",
      text: "text-orange-800",
      iconText: "text-orange-600",
      label: "Convocado a Entrevista",
      icon: CalendarDays,
      pulse: true,
      msg: "Su postulación ha sido seleccionada para entrevista presencial. Acuda al Departamento de Bienestar Estudiantil."
    },
    pendiente: {
      bg: "bg-yellow-50",
      bar: "bg-yellow-400",
      text: "text-yellow-800",
      iconText: "text-yellow-600",
      label: "En Espera / Pendiente",
      icon: Clock,
      pulse: true,
      msg: "Tu documentación ha sido recibida y se encuentra en cola para revisión del Departamento de Bienestar Estudiantil."
    },
    rechazada: {
      bg: "bg-red-50",
      bar: "bg-red-500",
      text: "text-red-800",
      iconText: "text-red-600",
      label: "Solicitud Rechazada",
      icon: XCircle,
      pulse: false,
      msg: mensajeRechazo
    },
    finalizada: {
      bg: "bg-teal-50",
      bar: "bg-teal-600",
      text: "text-teal-900",
      iconText: "text-teal-600",
      label: esEgresado ? "Periodo Culminado" : "Proceso Finalizado",
      icon: esEgresado ? GraduationCap : Archive,
      pulse: false,
      msg: mensajeFinalizada
    },
    especial: {
      bg: "bg-orange-50",
      bar: "bg-orange-500",
      text: "text-orange-800",
      iconText: "text-orange-600",
      label: "Revisión Especial",
      icon: ShieldAlert,
      pulse: true,
      msg: "Tu solicitud está bajo una evaluación académica detallada debido al promedio reportado."
    },
    revision: {
      bg: "bg-blue-50",
      bar: "bg-blue-500",
      text: "text-blue-800",
      iconText: "text-blue-600",
      label: "Analizando Expediente",
      icon: FileSearch,
      pulse: true,
      msg: "La comisión está validando actualmente la veracidad de tus datos socioeconómicos."
    },
    renovacion: {
      bg: "bg-violet-50",
      bar: "bg-violet-500",
      text: "text-violet-800",
      iconText: "text-violet-600",
      label: "Renovación Automática",
      icon: RotateCcw,
      pulse: true,
      msg: "Has sido becado anteriormente. Por favor, carga tus notas nuevas para mantener el beneficio."
    },
    ninguna: {
      bg: "bg-slate-50",
      bar: "bg-slate-400",
      text: "text-slate-600",
      iconText: "text-slate-400",
      label: "Sin Proceso Activo",
      icon: AlertCircle,
      pulse: false,
      msg: "Actualmente no se detectan solicitudes ni beneficios asignados en el sistema."
    }
  };

  const resolveKey = (): StatusKey => {
    if (becaPerdida) return 'rechazada';
    if (s.includes('finaliz')) return 'finalizada';
    if (s.includes('aprob') || s.includes('aprov') || s === 'becado') return 'aprobada';
    if (s.includes('convocad')) return 'convocado';
    if (s.includes('pendiente')) return 'pendiente';
    if (s.includes('rechaz') || s.includes('deneg')) return 'rechazada';
    if (s.includes('especial')) return 'especial';
    if (s.includes('renov')) return 'renovacion';
    if (s.includes('revis') || s.includes('analis')) return 'revision';
    return 'ninguna';
  };

  const key = resolveKey();
  const c = config[key];
  const IconoEstado = c.icon;

  const departamentoLimpio =
    departamentoAsignado && departamentoAsignado.trim() !== ''
      ? departamentoAsignado.trim()
      : null;
  const tipoBecaLimpio =
    tipoBeca && tipoBeca.trim() !== '' ? tipoBeca.trim() : null;
  const mostrarBloqueDepartamento =
    key === 'aprobada' || Boolean(departamentoLimpio);

  return (
    <Card className={`border-none shadow-xl overflow-hidden relative transition-all duration-500 ${c.bg}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${c.bar}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">
            Estatus de Solicitud
          </span>
          <div className={`h-3 w-3 rounded-full shadow-sm ${c.pulse ? 'animate-pulse' : ''} ${c.bar}`} />
        </div>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-white/60 shadow-inner ${c.iconText}`}>
            <IconoEstado className="h-6 w-6" />
          </div>
          <span className={`text-lg font-black uppercase tracking-tighter ${c.text}`}>
            {c.label}
          </span>
        </div>
        <p className="mt-4 text-[11px] md:text-xs font-semibold text-gray-600 leading-relaxed italic border-t border-black/5 pt-4 whitespace-pre-line break-words">
          {c.msg}
        </p>

        {mostrarBloqueDepartamento && (
          <div className="mt-4 p-3.5 rounded-xl bg-white/90 border border-[#d4a843]/40 shadow-xs space-y-2">
            {tipoBecaLimpio && (
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 pb-1.5 border-b border-slate-100">
                <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                <span className="truncate">{tipoBecaLimpio}</span>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] shrink-0 mt-0.5">
                <Building2 className="h-4 w-4 text-[#1e3a5f]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Departamento Asignado
                </span>
                {departamentoLimpio ? (
                  <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase leading-snug mt-0.5 break-words">
                    {departamentoLimpio}
                  </p>
                ) : (
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-black uppercase tracking-wider text-amber-800">
                    Por asignar
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {key === 'rechazada' && (
          <div className="mt-4 p-3 rounded-xl bg-white/80 border border-red-200 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-red-700">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Inhabilitación Definitiva: Sin opción a futuras becas</span>
          </div>
        )}

        {key === 'finalizada' && (
          <div className="mt-4 p-3 rounded-xl bg-white/85 border border-teal-200 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-teal-800">
            {esEgresado ? (
              <>
                <GraduationCap className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                <span>Egresado UNIMAR: Periodo académico culminado</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-teal-600" />
                <span>Sin Sanción: Habilitado para nuevas postulaciones</span>
              </>
            )}
          </div>
        )}

        {key === 'convocado' && observacionLimpia && (
          <div className="mt-4 p-3.5 rounded-xl bg-white/85 border border-orange-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">
              <MessageSquareText className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
              <span>Instrucciones de Citación</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line break-words">
              {observacionLimpia}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}