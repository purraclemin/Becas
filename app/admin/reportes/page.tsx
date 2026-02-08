"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import Link from "next/link"
import { ArrowLeft, CircleAlert, X, Loader2, BarChart3, PieChart, ShieldCheck, Activity } from "lucide-react" 
import { obtenerAnaliticasAvanzadas } from "@/lib/ActionsAnalytics"

// IMPORTAMOS LOS MÓDULOS
import { MatrizMerito } from "@/components/admin/reportes/MatrizMerito"
import { RadarCarreras } from "@/components/admin/reportes/RadarCarreras"
import { EmbudoProceso } from "@/components/admin/reportes/EmbudoProceso"

export default function ReportesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [showInfo, setShowInfo] = useState(false) // Tu showInfo original para la Matriz
  const [showInfoRadar, setShowInfoRadar] = useState(false) // Nuevo para Radar
  const [showInfoEmbudo, setShowInfoEmbudo] = useState(false) // Nuevo para Embudo
  const [analiticas, setAnaliticas] = useState<any>(null)

  useEffect(() => {
    async function cargar() {
      const data = await obtenerAnaliticasAvanzadas();
      setAnaliticas(data);
      setLoading(false);
    }
    cargar();
  }, [])

  const manejarClickEstudiante = (cedula: string) => {
    router.push(`/admin/solicitudes?q=${cedula}`)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative">
      
      {/* --- MODAL 1: MATRIZ (TU LÓGICA ORIGINAL) --- */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-[#1a2744] p-6 flex justify-between items-center border-b-4 border-[#d4a843]">
              <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
                <CircleAlert className="h-6 w-6 text-[#d4a843]" /> Matriz de Justicia Social
              </h3>
              <button onClick={() => setShowInfo(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Esta herramienta cruza el <strong>Rendimiento Académico</strong> con la <strong>Vulnerabilidad Social</strong>. 
                Haga clic en cualquier punto para ir directamente a la solicitud del estudiante.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <h4 className="font-black text-emerald-800 dark:text-emerald-400 text-xs uppercase">Prioridad Máxima</h4>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-tight">
                    <strong>Arriba-Derecha:</strong> Estudiantes con promedios excelentes y alta necesidad. Son el foco principal del programa.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <h4 className="font-black text-blue-800 dark:text-blue-400 text-xs uppercase">Rescate Académico</h4>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium leading-tight">
                    <strong>Arriba-Izquierda:</strong> Alta vulnerabilidad pero notas bajas. La beca busca dar estabilidad para que suban su promedio.
                  </p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
                    <h4 className="font-black text-amber-800 dark:text-amber-400 text-xs uppercase">Mérito Académico</h4>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium leading-tight">
                    <strong>Abajo-Derecha:</strong> Estudiantes con notas sobresalientes pero situación económica estable.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-slate-400 rounded-full"></div>
                    <h4 className="font-black text-slate-600 dark:text-slate-400 text-xs uppercase">Baja Prioridad</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    <strong>Abajo-Izquierda:</strong> Rendimiento bajo y situación económica estable. No requieren atención inmediata.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowInfo(false)} className="w-full bg-[#1a2744] hover:bg-[#253659] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: RADAR (NUEVO) --- */}
      {showInfoRadar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-[#1a2744] p-6 flex justify-between items-center border-b-4 border-[#d4a843]">
              <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-[#d4a843]" /> Perfil Académico por Carrera
              </h3>
              <button onClick={() => setShowInfoRadar(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                Este gráfico de araña (Radar Chart) permite una comparativa multivariable del rendimiento académico real entre las distintas facultades.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-100 p-3 rounded-xl"><Activity className="h-5 w-5 text-[#1a2744]" /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#1a2744] mb-1">Equilibrio Académico</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Cada arista del radar representa una carrera. Un área más extendida y simétrica indica que la institución mantiene un estándar de excelencia equilibrado entre todas sus facultades.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-100 p-3 rounded-xl"><ShieldCheck className="h-5 w-5 text-[#d4a843]" /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#1a2744] mb-1">Detección de Brechas</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Los puntos más cercanos al centro indican carreras con promedios más bajos, permitiendo al administrador identificar dónde se necesita reforzar el apoyo tutorial o flexibilizar criterios de becas.</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowInfoRadar(false)} className="w-full bg-[#1a2744] hover:bg-[#253659] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Cerrar Guía</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: EMBUDO (NUEVO) --- */}
      {showInfoEmbudo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-[#1a2744] p-6 flex justify-between items-center border-b-4 border-[#d4a843]">
              <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-2">
                <PieChart className="h-6 w-6 text-[#d4a843]" /> Embudo de Aprobación
              </h3>
              <button onClick={() => setShowInfoEmbudo(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                Visualiza la tasa de conversión y eficiencia del proceso administrativo de becas en tiempo real.
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fase de Entrada</span>
                  <span className="text-[10px] font-bold text-[#1a2744]">Solicitudes Totales</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fase de Filtro</span>
                  <span className="text-[10px] font-bold text-[#1a2744]">Validación Documental</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fase Final</span>
                  <span className="text-[10px] font-bold text-[#1a2744]">Becas Asignadas</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 italic text-center">Este gráfico permite detectar "cuellos de botella": si muchas solicitudes se quedan en la fase de filtro, indica problemas con la carga de documentos de los estudiantes.</p>
              <button onClick={() => setShowInfoEmbudo(false)} className="w-full bg-[#1a2744] hover:bg-[#253659] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-[#1a2744] px-8 py-6 shadow-lg border-b-4 border-[#d4a843] flex justify-between items-center sticky top-0 z-50">
        <div>
          <h1 className="text-xl font-bold font-serif text-white uppercase tracking-wider">Inteligencia de Datos</h1>
          <p className="text-[10px] text-[#8a9bbd] font-bold uppercase tracking-widest">Análisis Profundo de Becas</p>
        </div>
        <Link href="/admin/dashboard">
          <button className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/10">
            <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
          </button>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-[#d4a843] animate-spin" />
            <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Sincronizando métricas reales...</p>
          </div>
        ) : (
          <>
            {/* TARJETA 1: MATRIZ */}
            <div className="grid grid-cols-1 relative">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setShowInfo(true)} 
                  className="flex items-center gap-2 bg-white dark:bg-[#1e293b] text-[#1a2744] dark:text-white px-4 py-2 rounded-full shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all group"
                >
                  <CircleAlert className="h-4 w-4 text-[#d4a843]" />
                  <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#d4a843] transition-colors">¿Cómo funciona?</span>
                </button>
              </div>
              <MatrizMerito data={analiticas.matriz} onPointClick={manejarClickEstudiante} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* TARJETA 2: RADAR */}
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setShowInfoRadar(true)} 
                    className="flex items-center gap-2 bg-white dark:bg-[#1e293b] text-[#1a2744] dark:text-white px-4 py-2 rounded-full shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all group"
                  >
                    <CircleAlert className="h-4 w-4 text-[#d4a843]" />
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#d4a843] transition-colors">¿Cómo funciona?</span>
                  </button>
                </div>
                <RadarCarreras data={analiticas.radar} />
              </div>

              {/* TARJETA 3: EMBUDO */}
              <div className="relative">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setShowInfoEmbudo(true)} 
                    className="flex items-center gap-2 bg-white dark:bg-[#1e293b] text-[#1a2744] dark:text-white px-4 py-2 rounded-full shadow-md border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all group"
                  >
                    <CircleAlert className="h-4 w-4 text-[#d4a843]" />
                    <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#d4a843] transition-colors">¿Cómo funciona?</span>
                  </button>
                </div>
                <EmbudoProceso data={analiticas.embudo} />
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <div className="text-center pt-10 border-t border-slate-200">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            Datos actualizados en tiempo real &bull; Módulo de Análisis Avanzado
          </p>
        </div>
      </div>
    </div>
  )
}