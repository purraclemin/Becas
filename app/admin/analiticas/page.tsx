"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation" 
import { obtenerAnaliticasAvanzadas } from "@/lib/ActionsAnalytics"

// IMPORTAMOS LOS COMPONENTES MODULARES
import { PageHeader } from "@/components/admin/PageHeader"
import { MatrizMerito } from "@/components/admin/analiticas/MatrizMerito"
import { RadarCarreras } from "@/components/admin/analiticas/RadarCarreras"
import { EmbudoProceso } from "@/components/admin/analiticas/EmbudoProceso"

export default function AnaliticasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
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

  // --- COMPONENTE DE CARGA (SKELETON) REDUCIDO ---
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl h-[400px] w-full border border-slate-200 p-5 flex flex-col">
          <div className="h-3 w-24 bg-slate-100 rounded mb-4"></div>
          <div className="flex-1 bg-slate-50 rounded-full w-48 h-48 mx-auto"></div>
        </div>
        <div className="bg-white rounded-2xl h-[400px] w-full border border-slate-200 p-5 flex flex-col">
          <div className="h-3 w-24 bg-slate-100 rounded mb-4"></div>
          <div className="space-y-3 flex-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-6 bg-slate-50 rounded-lg w-full"></div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl h-[480px] w-full border border-slate-200 p-5">
        <div className="h-3 w-40 bg-slate-100 rounded mb-6"></div>
        <div className="h-full w-full bg-slate-50 rounded-xl"></div>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      
      {/* HEADER UNIFICADO (Sustituye al header antiguo) */}
      <PageHeader 
        titulo="Inteligencia de Datos" 
        subtitulo="Sistema de Analítica Predictiva"
        mostrarExportar={true}
      />

      <main className="space-y-6">
        
        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* 1. SECCIÓN SUPERIOR: RADAR Y EMBUDO (ALTURA COMPACTA) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* RADAR DE FACULTADES */}
              <RadarCarreras data={analiticas?.radar || []} />

              {/* MONITOR DE CONTINUIDAD (EMBUDO) */}
              <EmbudoProceso data={analiticas?.embudo || []} />

            </div>

            {/* 2. SECCIÓN INFERIOR: MATRIZ DE MÉRITO (ESCALA REDUCIDA) */}
            <MatrizMerito data={analiticas?.matriz || []} onPointClick={manejarClickEstudiante} />

          </div>
        )}

        {/* FOOTER DISCRETO */}
        {!loading && (
          <div className="text-center pt-4 pb-2">
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">
              Datos procesados en tiempo real &bull; Módulo de Análisis Avanzado v2.0
            </p>
          </div>
        )}
       
      </main>
    </div>
  )
}