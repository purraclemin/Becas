"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import Link from "next/link"
import { ArrowLeft, CircleAlert, X, BarChart3, PieChart, ShieldCheck, Activity } from "lucide-react" 
import { obtenerAnaliticasAvanzadas } from "@/lib/ActionsAnalytics"

// IMPORTAMOS LOS MÓDULOS DE GRÁFICOS
import { MatrizMerito } from "@/components/admin/analiticas/MatrizMerito"
import { RadarCarreras } from "@/components/admin/analiticas/RadarCarreras"
import { EmbudoProceso } from "@/components/admin/analiticas/EmbudoProceso"

export default function AnaliticasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analiticas, setAnaliticas] = useState<any>(null)

  // Estados de los Modals
  const [showInfo, setShowInfo] = useState(false) 
  const [showInfoRadar, setShowInfoRadar] = useState(false) 
  const [showInfoEmbudo, setShowInfoEmbudo] = useState(false) 

  useEffect(() => {
    async function cargar() {
      // Ahora esta carga es paralela gracias a tu optimización en el server action
      const data = await obtenerAnaliticasAvanzadas();
      setAnaliticas(data);
      setLoading(false);
    }
    cargar();
  }, [])

  const manejarClickEstudiante = (cedula: string) => {
    router.push(`/admin/solicitudes?q=${cedula}`)
  }

  // --- COMPONENTE DE CARGA (SKELETON) ---
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-8">
      {/* Skeleton Matriz */}
      <div className="bg-white dark:bg-[#1e293b] rounded-3xl h-[400px] w-full border border-slate-200 dark:border-slate-700 p-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
      </div>
      {/* Skeleton Grid Inferior */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl h-[350px] w-full border border-slate-200 dark:border-slate-700 p-4">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-full mx-auto"></div>
        </div>
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl h-[350px] w-full border border-slate-200 dark:border-slate-700 p-4">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
            <div className="h-full w-full bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative font-sans">
      
      {/* --- HEADER --- */}
      <header className="bg-[#1a2744] px-6 py-5 shadow-xl border-b-4 border-[#d4a843] flex flex-col sm:flex-row justify-between items-center sticky top-0 z-40 gap-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-white uppercase tracking-wider flex items-center gap-2">
             <Activity className="h-5 w-5 text-[#d4a843]" /> Inteligencia de Datos
          </h1>
          <p className="text-[10px] text-[#8a9bbd] font-bold uppercase tracking-[0.2em]">
            Sistema de analitica Predictiva
          </p>
        </div>
        <Link href="/admin/dashboard">
          <button className="bg-white/10 text-white px-5 py-2.5 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-white/10 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Dashboard
          </button>
        </Link>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. SECCIÓN PRINCIPAL: MATRIZ DE MÉRITO */}
            <section className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={() => setShowInfo(true)} 
                        className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-[#1a2744] hover:text-[#d4a843] transition-all group shadow-sm"
                    >
                        <CircleAlert className="h-4 w-4 text-slate-400 group-hover:text-[#d4a843]" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Guía</span>
                    </button>
                </div>
                {/* Pasamos array vacío por defecto para evitar crash */}
                <MatrizMerito data={analiticas?.matriz || []} onPointClick={manejarClickEstudiante} />
            </section>

            {/* 2. SECCIÓN SECUNDARIA: RADAR Y EMBUDO */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* RADAR */}
              <section className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setShowInfoRadar(true)} 
                    className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-[#1a2744] hover:text-[#d4a843] transition-all group shadow-sm"
                  >
                    <CircleAlert className="h-4 w-4 text-slate-400 group-hover:text-[#d4a843]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Guía</span>
                  </button>
                </div>
                <RadarCarreras data={analiticas?.radar || []} />
              </section>

              {/* EMBUDO */}
              <section className="relative bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setShowInfoEmbudo(true)} 
                    className="flex items-center gap-2 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-[#1a2744] hover:text-[#d4a843] transition-all group shadow-sm"
                  >
                    <CircleAlert className="h-4 w-4 text-slate-400 group-hover:text-[#d4a843]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Guía</span>
                  </button>
                </div>
                <EmbudoProceso data={analiticas?.embudo || []} />
              </section>

            </div>
          </div>
        )}

        {/* FOOTER DISCRETO */}
        {!loading && (
             <div className="text-center pt-8 pb-4 border-t border-slate-200/60">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-70">
                Datos procesados en tiempo real &bull; Módulo de Análisis Avanzado v2.0
                </p>
            </div>
        )}
       
      </main>

      {/* ================================================================================== */}
      {/* ============================= MODALES INFORMATIVOS =============================== */}
      {/* ================================================================================== */}

      {/* MODAL 1: MATRIZ */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#1a2744] p-6 flex justify-between items-center shrink-0">
              <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-3">
                <CircleAlert className="h-6 w-6 text-[#d4a843]" /> Matriz de Justicia Social
              </h3>
              <button onClick={() => setShowInfo(false)} className="text-white/40 hover:text-white transition-colors bg-white/10 p-2 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <p className="text-slate-600 text-sm leading-relaxed">
                Esta herramienta cruza el <strong>Rendimiento Académico</strong> con la <strong>Vulnerabilidad Social</strong>. 
                Haga clic en cualquier punto para ir directamente a la solicitud del estudiante.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <h4 className="font-black text-emerald-800 text-xs uppercase">Prioridad Máxima</h4>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-medium leading-tight">
                    <strong>Arriba-Derecha:</strong> Estudiantes con promedios excelentes y alta necesidad. Son el foco principal del programa.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                    <h4 className="font-black text-blue-800 text-xs uppercase">Rescate Académico</h4>
                  </div>
                  <p className="text-[11px] text-blue-700 font-medium leading-tight">
                    <strong>Arriba-Izquierda:</strong> Alta vulnerabilidad pero notas bajas. La beca busca dar estabilidad para que suban su promedio.
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
                    <h4 className="font-black text-amber-800 text-xs uppercase">Mérito Académico</h4>
                  </div>
                  <p className="text-[11px] text-amber-700 font-medium leading-tight">
                    <strong>Abajo-Derecha:</strong> Estudiantes con notas sobresalientes pero situación económica estable.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-3 w-3 bg-slate-400 rounded-full"></div>
                    <h4 className="font-black text-slate-600 text-xs uppercase">Baja Prioridad</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight">
                    <strong>Abajo-Izquierda:</strong> Rendimiento bajo y situación económica estable.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                 <button onClick={() => setShowInfo(false)} className="w-full bg-[#1a2744] hover:bg-[#253659] text-[#d4a843] py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RADAR */}
      {showInfoRadar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#1a2744] p-6 flex justify-between items-center shrink-0">
              <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-[#d4a843]" /> Perfil Académico
              </h3>
              <button onClick={() => setShowInfoRadar(false)} className="text-white/40 hover:text-white transition-colors bg-white/10 p-2 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Este gráfico de araña (Radar Chart) permite una comparativa multivariable del rendimiento académico real entre las distintas facultades.
              </p>
              <div className="space-y-4">
                <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="bg-white p-3 rounded-xl shadow-sm"><Activity className="h-5 w-5 text-[#1a2744]" /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#1a2744] mb-1">Equilibrio Académico</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Cada arista representa una carrera. Un área más extendida y simétrica indica excelencia equilibrada entre facultades.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="bg-white p-3 rounded-xl shadow-sm"><ShieldCheck className="h-5 w-5 text-[#d4a843]" /></div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-[#1a2744] mb-1">Detección de Brechas</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Puntos cercanos al centro indican carreras con promedios bajos, señalando necesidad de refuerzo académico.</p>
                  </div>
                </div>
              </div>
            </div>
             <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                 <button onClick={() => setShowInfoRadar(false)} className="w-full bg-[#1a2744] hover:bg-[#253659] text-[#d4a843] py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EMBUDO */}
      {showInfoEmbudo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#1a2744] p-6 flex justify-between items-center shrink-0">
              <h3 className="text-white font-black uppercase tracking-widest text-lg flex items-center gap-3">
                <PieChart className="h-6 w-6 text-[#d4a843]" /> Embudo de Aprobación
              </h3>
              <button onClick={() => setShowInfoEmbudo(false)} className="text-white/40 hover:text-white transition-colors bg-white/10 p-2 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8 space-y-6 overflow-y-auto">
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Visualiza la tasa de conversión y eficiencia del proceso administrativo de becas.
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
              <p className="text-[11px] text-slate-500 italic text-center">Detecta "cuellos de botella": si muchas solicitudes se quedan en la fase de filtro, indica problemas con documentos.</p>
            </div>
             <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                 <button onClick={() => setShowInfoEmbudo(false)} className="w-full bg-[#1a2744] hover:bg-[#253659] text-[#d4a843] py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all">Entendido</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}