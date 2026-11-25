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
}

/**
 * COMPONENTE: ESTATUS VISUAL DEL PERFIL
 * Muestra el estatus de la solicitud, detecta si fue rechazada por materias
 * y despliega las instrucciones de citación cuando el estudiante está convocado.
 */
export function ProfileStatus({ estatus, materias, motivoRechazo, observacionesAdmin }: ProfileStatusProps) {
  // Normalización para evitar errores por tildes o mayúsculas
  const s =
    estatus
      ?.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || 'ninguna';

  // Extracción robusta de materias para verificar si hay notas < 10
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

  // Detecta si tiene materias reprobadas (nota < 10)
  const tieneReprobadas = listaMaterias.some((m) => Number(m.nota) < 10);

  // Mensaje inteligente para cuando está rechazada
  const mensajeRechazo =
    motivoRechazo && motivoRechazo.trim() !== ''
      ? motivoRechazo.trim()
      : tieneReprobadas || s.includes('materia')
        ? "Solicitud rechazada: se detectó al menos una unidad curricular reprobada (calificación inferior a 10 puntos), requisito indispensable para optar al beneficio."
        : "Tu solicitud ha sido declinada. Dirígete a Bienestar Estudiantil para conocer los detalles.";

  const instruccionesCitacion =
    observacionesAdmin && observacionesAdmin.trim() !== '' ? observacionesAdmin.trim() : null;

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

  return (
    <Card className={`border-none shadow-xl overflow-hidden relative transition-all duration-500 ${c.bg}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${c.bar}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Estatus de Solicitud</span>
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
        <p className="mt-4 text-[11px] md:text-xs font-semibold text-gray-600 leading-relaxed italic border-t border-black/5 pt-4">
          {c.msg}
        </p>

        {key === 'convocado' && instruccionesCitacion && (
          <div className="mt-4 p-3.5 rounded-xl bg-white/85 border border-orange-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">
              <MessageSquareText className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
              <span>Instrucciones de Citación</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line break-words">
              {instruccionesCitacion}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}