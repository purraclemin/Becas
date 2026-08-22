"use client"

import React, { useState } from "react"
import { Sparkles, Printer, X, ShieldCheck, Loader2 } from "lucide-react"
// Importamos las interfaces directamente desde el archivo de acciones
import { 
  generarReporteIA, 
  generarReporteActividadIA, 
  IActividad, 
  DashboardStats, 
  RankingItem 
} from "@/lib/ActionsImprimirConIA"

interface ImprimirConIAModalProps {
  isOpen: boolean
  onClose: () => void
  stats?: DashboardStats
  ranking?: RankingItem[]
  actividad?: IActividad[]
}

export function ImprimirConIAModal({ isOpen, onClose, stats, ranking, actividad }: ImprimirConIAModalProps) {
  const [loading, setLoading] = useState(false)
  const [reporteTexto, setReporteTexto] = useState<string | null>(null)

  if (!isOpen) return null

  const handleGenerarInforme = async () => {
    setLoading(true)
    let res;

    // Si tenemos actividad, llamamos al auditor. Si no, al dashboard.
    if (actividad) {
      res = await generarReporteActividadIA(actividad)
    } else {
      // Usamos el tipo correcto importado y proveemos valores por defecto para evitar undefined
      res = await generarReporteIA(
        stats ?? { porEstatus: [], porCarrera: [], porTipo: [] }, 
        ranking ?? []
      )
    }

    if (res.success) {
      setReporteTexto(res.reporte)
    } else {
      setReporteTexto("Error al conectar con la IA de Unimar.")
    }
    setLoading(false)
  }

  const handleImprimirReporte = () => {
    window.print()
  }

  // Calculamos el total de registros de forma segura
  const totalRegistros = (stats?.porEstatus?.reduce((acc, curr) => acc + curr.total, 0) || 0) + (actividad?.length || 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="bg-[#1a2744] px-6 py-4 flex items-center justify-between border-b-2 border-[#d4a843] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#d4a843]/20 rounded-lg border border-[#d4a843]/40">
              <Sparkles className="w-4 h-4 text-[#d4a843]" />
            </div>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">
                {actividad ? "Auditoría de Actividad IA - Unimar" : "Reporte Ejecutivo IA - Unimar Becas"}
              </h2>
              <p className="text-[9px] text-[#8a9bbd] font-bold uppercase tracking-widest">Síntesis analítica generada por Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Reporte */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar print:p-0">
          
          <div className="hidden print:flex items-center justify-between border-b pb-4 mb-6">
            <div>
              <h1 className="text-sm font-black text-[#1a2744] uppercase">Universidad de Margarita</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Sistema Automatizado de Gestión de Becas</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400">{new Date().toLocaleDateString('es-VE')}</span>
          </div>

          {!reporteTexto && !loading && (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-200 text-[#d4a843]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-xs font-black text-[#1a2744] uppercase">¿Listo para auditar el sistema?</h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {actividad ? "Gemini analizará la bitácora de movimientos recientes para redactar el informe de auditoría." : "Gemini analizará los registros actuales de rendimiento, solicitudes y baremos para redactar el informe oficial."}
                </p>
              </div>
              <button 
                onClick={handleGenerarInforme}
                className="px-5 py-2.5 bg-[#1a2744] hover:bg-[#152038] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95"
              >
                {actividad ? "Generar Auditoría con IA" : "Generar Análisis con IA"}
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-[#d4a843] animate-spin" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sintetizando métricas institucionales...</p>
            </div>
          )}

          {reporteTexto && !loading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="text-[10px] font-black text-[#1a2744] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Dictamen y Análisis IA:
                </h4>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans">
                  {reporteTexto}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">
                    {actividad ? "Movimientos Analizados" : "Total Solicitudes"}
                  </span>
                  <span className="text-sm font-black text-[#1e3a5f]">{totalRegistros}</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase block">
                    {actividad ? "Estado del Canal" : "Candidatos Élite en Ranking"}
                  </span>
                  <span className="text-sm font-black text-emerald-700">
                    {actividad ? "Operativo" : `${ranking?.length || 0} Registros`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <button 
            onClick={() => setReporteTexto(null)} 
            disabled={!reporteTexto || loading}
            className="text-[10px] font-bold text-slate-500 hover:text-[#1a2744] uppercase disabled:opacity-40"
          >
            Reiniciar Análisis
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Cerrar
            </button>
            <button 
              onClick={handleImprimirReporte}
              disabled={!reporteTexto || loading}
              className="flex items-center gap-1.5 bg-[#d4a843] hover:bg-[#b88f32] text-[#1a2744] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-40"
            >
              <Printer className="w-4 h-4" /> Imprimir Informe Oficial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}