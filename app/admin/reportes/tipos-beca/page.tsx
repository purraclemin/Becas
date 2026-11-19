"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Loader2,
  Tags,
  PieChart,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Layers
} from "lucide-react"
import { reporteTiposDeBeca } from "@/lib/ActionsReportes"

interface TipoBecaRow {
  tipo_beca?: string
  total?: number | string
  aprobadas?: number | string
  rechazadas?: number | string
  en_proceso?: number | string
  [key: string]: unknown
}

interface ReporteTiposBecaResponse {
  success?: boolean
  data?: TipoBecaRow[]
}

export default function ReporteTiposBecaPage() {
  const [data, setData] = useState<TipoBecaRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = (await reporteTiposDeBeca()) as ReporteTiposBecaResponse
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte de tipos de beca:", error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleExportar = () => {
    window.print()
  }

  const totalGlobal = data.reduce((acc, curr) => {
    const val = Number(curr.total ?? 0)
    return acc + (Number.isFinite(val) ? val : 0)
  }, 0)

  const calcularDistribucion = (row: TipoBecaRow): number => {
    const totalFila = Number(row.total ?? 0)
    if (!Number.isFinite(totalGlobal) || totalGlobal <= 0 || !Number.isFinite(totalFila)) {
      return 0
    }
    return Math.round((totalFila / totalGlobal) * 100)
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Tipos de Beca"
          subtitulo="Análisis operativo y estadístico por categoría de beneficio"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* VISTA DE TABLA ESTADÍSTICA EN PANTALLA (Se oculta al imprimir) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Desglose por Categoría de Programa ({data.length})
            </span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="text-[8px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Datos
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Categoría de Beca</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Total</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Aprobadas</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Rechazadas</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">En Proceso</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Distribución</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto mb-2" />
                    Procesando categorías...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => {
                  const porcentaje = calcularDistribucion(row)
                  const totalFila = Number(row.total ?? 0)
                  const aprobadas = Number(row.aprobadas ?? 0)
                  const rechazadas = Number(row.rechazadas ?? 0)
                  const enProceso = Number(row.en_proceso ?? 0)

                  return (
                    <tr key={idx} className="hover:bg-indigo-50/10 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                            <Tags className="w-3.5 h-3.5" />
                          </div>
                          <p className="font-black text-[#1e3a5f] uppercase tracking-tighter">
                            {String(row.tipo_beca || "No Especificado")}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-black text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {totalFila}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {aprobadas}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-rose-600 font-bold">
                          <XCircle className="w-3 h-3" />
                          {rechazadas}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                          <Clock className="w-3 h-3" />
                          {enProceso}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1 font-black text-indigo-600">
                            <PieChart className="w-2.5 h-2.5" />
                            {porcentaje}%
                          </div>
                          <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all duration-1000"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No hay datos de programas registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Tipos de Beca"
        subtitulo={`Análisis operativo y estadístico por categoría de beneficio — Total Solicitudes: ${totalGlobal}`}
        columnas={["Categoría de Beca", "Total", "Aprobadas", "Rechazadas", "En Proceso", "Distribución"]}
        datos={data}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const item = row as TipoBecaRow
          const porcentaje = calcularDistribucion(item)
          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400 uppercase font-bold text-[#1e3a5f]">
                {String(item.tipo_beca || "No Especificado")}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold">
                {String(item.total ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {String(item.aprobadas ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {String(item.rechazadas ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-semibold">
                {String(item.en_proceso ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 text-right font-bold text-[#1e3a5f]">
                {porcentaje}%
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}