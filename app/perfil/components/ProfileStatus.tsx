import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert, FileSearch, RotateCcw } from "lucide-react"

export function ProfileStatus({ estatus }: { estatus: string }) {
  const s = estatus?.toLowerCase().trim() || 'ninguna';
  
  const config = {
    aprobada: { bg: "bg-green-50", bar: "bg-green-500", text: "text-green-800", iconText: "text-green-600", label: "Aprobada", icon: CheckCircle2, pulse: false, msg: "Felicidades, tu beneficio académico ha sido confirmado exitosamente." },
    pendiente: { bg: "bg-yellow-50", bar: "bg-yellow-400", text: "text-yellow-800", iconText: "text-yellow-600", label: "Pendiente", icon: Clock, pulse: true, msg: "Tu documentación ha sido recibida y se encuentra bajo revisión del decanato." },
    rechazada: { bg: "bg-red-50", bar: "bg-red-500", text: "text-red-800", iconText: "text-red-600", label: "Rechazada", icon: XCircle, pulse: false, msg: "Tu solicitud ha sido declinada. Puedes contactar a Bienestar Estudiantil." },
    especial: { bg: "bg-orange-50", bar: "bg-orange-500", text: "text-orange-800", iconText: "text-orange-600", label: "Revisión Especial", icon: ShieldAlert, pulse: true, msg: "Tu solicitud requiere una evaluación detallada debido al índice académico reportado." },
    revision: { bg: "bg-blue-50", bar: "bg-blue-500", text: "text-blue-800", iconText: "text-blue-600", label: "En Revisión", icon: FileSearch, pulse: true, msg: "Tu expediente está siendo analizado actualmente por la comisión de becas." },
    renovacion: { bg: "bg-violet-50", bar: "bg-violet-500", text: "text-violet-800", iconText: "text-violet-600", label: "Renovación", icon: RotateCcw, pulse: true, msg: "Es momento de actualizar tus datos. Sube tus notas del nuevo trimestre para mantener tu beca." },
    ninguna: { bg: "bg-slate-50", bar: "bg-slate-400", text: "text-slate-600", iconText: "text-slate-400", label: "Sin Solicitud", icon: AlertCircle, pulse: false, msg: "Actualmente no posees ningún proceso de beca activo en el sistema." }
  };

  const key = s.includes('especial') ? 'especial' : 
              s.includes('renovacion') || s.includes('renovación') ? 'renovacion' :
              s.includes('revisión') || s.includes('revision') ? 'revision' : 
              (config as any)[s] ? s : 'ninguna';
              
  const c = (config as any)[key];

  return (
    <Card className={`border-none shadow-xl overflow-hidden relative transition-all duration-500 ${c.bg}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${c.bar}`}></div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Estado del Trámite</span>
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