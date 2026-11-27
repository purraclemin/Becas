"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { obtenerAnaliticasAvanzadas } from "@/lib/ActionsAnalytics"
import type { AnaliticasAvanzadas, DatosMatriz } from "@/types/analitica"

import { PageHeader } from "@/components/admin/PageHeader"
import { MatrizMerito } from "@/components/admin/analiticas/MatrizMerito"
import { RadarCarreras } from "@/components/admin/analiticas/RadarCarreras"
import { EmbudoProceso } from "@/components/admin/analiticas/EmbudoProceso"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"

export default function AnaliticasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [analiticas, setAnaliticas] = useState<AnaliticasAvanzadas | null>(null)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)
  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerAnaliticasAvanzadas()
        setAnaliticas(data)
      } catch (error) {
        console.error("Error cargando analíticas avanzadas:", error)
      } finally {
        setLoading(false)
      }
    }
    void cargar()
  }, [])

  const manejarClickEstudiante = (cedula: string) => {
    const cedulaLimpia = cedula.trim()
    if (!cedulaLimpia) return
    router.push(`/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=analiticas`)
  }

  // Datos de la Matriz ordenados por 1° Promedio DESC y 2° Vulnerabilidad (Baremo) DESC
  const matrizOrdenada = useMemo<DatosMatriz[]>(() => {
    const lista = Array.isArray(analiticas?.matriz) ? analiticas.matriz : []
    return [...lista].sort((a, b) => {
      const promDiff = (Number(b.promedio_notas) || 0) - (Number(a.promedio_notas) || 0)
      if (Math.abs(promDiff) >= 0.005) return promDiff
      const vulnDiff =
        (Number(b.vulnerabilidad_puntos) || 0) - (Number(a.vulnerabilidad_puntos) || 0)
      if (vulnDiff !== 0) return vulnDiff
      return String(a.apellido || "").localeCompare(String(b.apellido || ""), "es")
    })
  }, [analiticas])

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((item: DatosMatriz): CeldaXLSX[] => {
    return [
      `${item.nombre} ${item.apellido}`.trim().toUpperCase(),
      `V-${item.cedula}`,
      String(item.carrera || "---").toUpperCase(),
      Number(Number(item.promedio_notas || 0).toFixed(2)),
      Number(item.vulnerabilidad_puntos || 0),
    ]
  }, [])

  const subtituloExportacion = `Matriz de Justicia Social (1° Promedio, 2° Baremo) — Total evaluados: ${matrizOrdenada.length}`

  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl h-[400px] w-full border border-slate-200 p-5 flex flex-col">
          <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
          <div className="flex-1 bg-slate-50 rounded-full w-48 h-48 mx-auto" />
        </div>
        <div className="bg-white rounded-2xl h-[400px] w-full border border-slate-200 p-5 flex flex-col">
          <div className="h-3 w-24 bg-slate-100 rounded mb-4" />
          <div className="space-y-3 flex-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-6 bg-slate-50 rounded-lg w-full" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl h-[480px] w-full border border-slate-200 p-5">
        <div className="h-3 w-40 bg-slate-100 rounded mb-6" />
        <div className="h-full w-full bg-slate-50 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      <div className="print:hidden">
        <PageHeader
          titulo="Inteligencia de Datos"
          subtitulo="Sistema de Analítica Predictiva"
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      <main className="space-y-6 print:hidden">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 1. SECCIÓN SUPERIOR: RADAR Y MONITOR DE CONTINUIDAD */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RadarCarreras data={analiticas?.radar || []} />
              <EmbudoProceso data={analiticas?.embudo || []} />
            </div>

            {/* 2. SECCIÓN INFERIOR: MATRIZ DE MÉRITO */}
            <MatrizMerito
              data={analiticas?.matriz || []}
              onPointClick={manejarClickEstudiante}
            />
          </div>
        )}

        {!loading && (
          <div className="text-center pt-4 pb-2">
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">
              Datos procesados en tiempo real &bull; Módulo de Análisis Avanzado v2.0
            </p>
          </div>
        )}
      </main>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<DatosMatriz>
        titulo="Inteligencia de Datos — Matriz de Justicia Social"
        subtitulo={subtituloExportacion}
        columnas={[
          "Estudiante / Cédula",
          "Carrera",
          "Promedio Académico",
          "Puntaje Baremo (Vulnerabilidad)"
        ]}
        datos={matrizOrdenada}
        renderFila={(item, idx) => (
          <tr key={`${item.cedula}-${idx}`} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{item.cedula}</span>
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">
              {item.carrera}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold text-[#1e3a5f]">
              {Number(item.promedio_notas || 0).toFixed(2)} pts
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
              {Number(item.vulnerabilidad_puntos || 0)} pts
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<DatosMatriz>
        ref={xlsxRef}
        titulo="Inteligencia de Datos — Matriz de Justicia Social"
        subtitulo={subtituloExportacion}
        nombreHoja="Analitica_Matriz"
        nombreArchivo="analitica_matriz_justicia_social_unimar"
        columnas={[
          "Estudiante",
          "Cédula",
          "Carrera",
          "Promedio Académico",
          "Puntaje Baremo"
        ]}
        datos={matrizOrdenada}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}
