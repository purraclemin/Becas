"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert, FileSearch, RotateCcw, CalendarDays } from "lucide-react"

/**
 * 🟢 COMPONENTE: ESTATUS VISUAL DEL PERFIL (PASO 5: FINALIZACIÓN)
 * Refleja fielmente el estado físico almacenado en la base de datos.
 */
export function ProfileStatus({ estatus }: { estatus: string }) {
  // Normalización para evitar errores por tildes o mayúsculas
  const s = estatus?.toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") || 'ninguna';
  
  const config = {
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
      bg: "bg-blue-50", 
      bar: "bg-blue-600", 
      text: "text-blue-900", 
      iconText: "text-blue-600", 
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
      msg: "Tu documentación ha sido recibida y se encuentra en cola para revisión del decanato." 
    },
    rechazada: { 
      bg: "bg-red-50", 
      bar: "bg-red-500", 
      text: "text-red-800", 
      iconText: "text-red-600", 
      label: "Solicitud Rechazada", 
      icon: XCircle, 
      pulse: false, 
      msg: "Tu solicitud ha sido declinada. Dirígete a Bienestar Estudiantil para conocer los detalles." 
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

  // Lógica de detección de etiquetas flexible incluyendo 'convocado'
  const key = (s.includes('aprob') || s.includes('aprov') || s === 'becado') ? 'aprobada' : 
              s.includes('convocad') ? 'convocado' :
              s.includes('pendiente') ? 'pendiente' :
              (s.includes('rechaz') || s.includes('deneg')) ? 'rechazada' :
              s.includes('especial') ? 'especial' :
              s.includes('renov') ? 'renovacion' :
              (s.includes('revis') || s.includes('analis')) ? 'revision' : 
              (config as any)[s] ? s : 'ninguna';
              
  const c = (config as any)[key];

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
            <c.icon className="h-6 w-6" />
          </div>
          <span className={`text-lg font-black uppercase tracking-tighter ${c.text}`}>
            {c.label}
          </span>
        </div>
        <p className="mt-4 text-[11px] md:text-xs font-semibold text-gray-600 leading-relaxed italic border-t border-black/5 pt-4">
          {c.msg}
        </p>
      </CardContent>
    </Card>
  )
}