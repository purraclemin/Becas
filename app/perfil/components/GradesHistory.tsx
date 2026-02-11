import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle2, XCircle, AlertCircle, CalendarDays } from "lucide-react"

/**
 * COMPONENTE: HISTORIAL DE NOTAS (VISTA DE ESTATUS)
 * Muestra las notas del periodo anterior con la etiqueta de su lapso correspondiente.
 */
export function GradesHistory({ materias, periodoNotas }: { materias: any[], periodoNotas?: string }) {
  
  // 1. ESTADO VACÍO: Si no hay materias, mostramos el placeholder
  if (!materias || materias.length === 0) {
    return (
      <Card className="border-none shadow-md bg-white overflow-hidden mt-6 animate-in fade-in zoom-in-95">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center opacity-60">
          <div className="bg-gray-100 p-4 rounded-full mb-3">
            <div className="relative">
              <FileText className="h-8 w-8 text-gray-400" />
              <XCircle className="h-4 w-4 text-gray-300 absolute -bottom-1 -right-1 bg-white rounded-full" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">No hay notas registradas</p>
          <p className="text-xs text-gray-400 mt-1">Tus calificaciones aparecerán aquí una vez procesemos tu solicitud.</p>
        </CardContent>
      </Card>
    )
  }

  // 2. CÁLCULOS: Promedio y Aprobación
  // Usamos parseFloat para asegurar que trabajamos con números, incluso si vienen como strings de la BD
  const suma = materias.reduce((acc, curr) => acc + parseFloat(curr.nota), 0);
  const promedio = (suma / materias.length).toFixed(2);
  const esAprobatorio = parseFloat(promedio) >= 10;

  return (
    <Card className="border-none shadow-2xl bg-white overflow-hidden mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER: Título + Badge de Periodo + Promedio General */}
      <CardHeader className="bg-[#fcfdfe] border-b border-gray-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <div className="space-y-1">
            <CardTitle className="text-[#1e3a5f] font-serif text-lg flex items-center gap-3 uppercase tracking-tight">
            <div className="p-2 bg-[#1e3a5f]/5 rounded-lg">
                <FileText className="h-5 w-5 text-[#d4a843]" />
            </div>
            Registro de Notas
            </CardTitle>

            {/* Renderizado condicional: Solo se muestra si periodoNotas existe */}
            {periodoNotas && (
                <div className="flex items-center gap-2 pl-[3.25rem] animate-in fade-in slide-in-from-left-2 duration-500">
                    <CalendarDays className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Correspondiente al lapso: <span className="text-[#1e3a5f] bg-[#1e3a5f]/5 px-2 py-0.5 rounded border border-[#1e3a5f]/10">{periodoNotas}</span>
                    </span>
                </div>
            )}
        </div>

        {/* Badge del Promedio (Verde si aprobó, Rojo si reprobó) */}
        <div className={`px-4 py-1 rounded-full text-xs font-black border self-start sm:self-center ${esAprobatorio ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          PROM: {promedio}
        </div>
      </CardHeader>
      
      {/* BODY: Lista de Materias */}
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">
          {materias.map((m: any, index: number) => {
            const nota = parseFloat(m.nota);
            const aprobada = nota >= 10;

            return (
              <div key={index} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`mt-1 ${aprobada ? 'text-green-500' : 'text-red-500'}`}>
                    {aprobada ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e3a5f] uppercase tracking-tight group-hover:text-[#d4a843] transition-colors">
                      {m.nombre}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                      {aprobada ? 'Materia Aprobada' : 'Materia Reprobada'}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`text-lg font-black ${aprobada ? 'text-[#1e3a5f]' : 'text-red-600'}`}>
                    {nota.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Puntos</span>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* FOOTER: Aviso Legal / Disclaimer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5" />
            <p className="text-[10px] text-gray-500 font-medium leading-tight">
              Estas son las calificaciones reportadas en tu última gestión{periodoNotas ? ` (${periodoNotas})` : ''}. Si notas alguna discrepancia, por favor contacta a control de estudios antes de la próxima renovación.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}