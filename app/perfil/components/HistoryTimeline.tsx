import { History, CalendarDays } from "lucide-react"

/**
 * COMPONENTE: HISTORIAL DE NOTAS (KARDEX TIMELINE)
 * Nueva visualización cronológica para la pestaña de Historial.
 */
export function HistoryTimeline({ history, stats }: { history: any[], stats: any }) {
    if (!history || history.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 animate-in fade-in zoom-in-95">
                <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-500">No hay historial disponible</h3>
                <p className="text-sm text-gray-400">Aún no tienes periodos cerrados y aprobados en el sistema.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Resumen de Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Promedio</p>
                    <p className="text-2xl font-black text-[#1e3a5f]">{stats.promedioHistorico}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Materias</p>
                    <p className="text-2xl font-black text-[#d4a843]">{stats.totalMaterias}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Periodos</p>
                    <p className="text-2xl font-black text-gray-600">{stats.totalPeriodos}</p>
                </div>
            </div>

            {/* Línea de Tiempo */}
            <div className="relative border-l-2 border-[#1e3a5f]/10 ml-4 md:ml-6 space-y-12 pb-4">
                {history.map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-8 md:pl-12 group">
                        {/* Punto de la línea de tiempo */}
                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-4 border-[#1e3a5f] group-hover:scale-125 transition-transform duration-300 shadow-sm z-10"></div>
                        
                        {/* Tarjeta del Periodo */}
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="bg-[#f8fafc] border-b border-gray-100 p-5 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-[#1e3a5f] font-black text-lg uppercase tracking-tight">{item.periodoNombre || item.periodoCodigo}</h4>
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-1">
                                        <CalendarDays className="h-3 w-3" /> Procesado: {item.fechaRegistro}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase block text-right">Promedio</span>
                                        <span className="text-sm font-black text-[#1e3a5f]">{item.promedio}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-0">
                                <div className="divide-y divide-gray-50">
                                    {item.materias.map((m: any, mIdx: number) => {
                                        const nota = parseFloat(m.nota);
                                        const aprobada = nota >= 10;
                                        return (
                                            <div key={mIdx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${aprobada ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                                    <span className="text-xs font-bold text-gray-600 uppercase">{m.nombre}</span>
                                                </div>
                                                <span className={`text-sm font-black ${aprobada ? 'text-[#1e3a5f]' : 'text-red-500'}`}>
                                                    {nota.toFixed(1)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}