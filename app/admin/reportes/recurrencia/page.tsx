"use client"

import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import { Loader2, UserCheck, GraduationCap, FileSpreadsheet, RefreshCw, Trophy } from "lucide-react"
import { reporteRecurrenciaAlumnos } from "@/lib/ActionsReportes"

interface RecurrenciaAlumnoRow {
  nombre?: string
  apellido?: string
  cedula?: string
  total_beneficios?: number | string
  carrera?: string
  periodos_beneficiados?: string | string[] | null
  [key: string]: unknown
}

interface ReporteRecurrenciaResponse {
  success?: boolean
  data?: RecurrenciaAlumnoRow[]
}

export default function ReporteRecurrenciaPage() {
  const [data, setData] = useState<RecurrenciaAlumnoRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const res = (await reporteRecurrenciaAlumnos()) as ReporteRecurrenciaResponse
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte de recurrencia:", error)
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

  const obtenerPeriodosLista = (periodos?: string | string[] | null): string[] => {
    if (!periodos) return []
    if (Array.isArray(periodos)) {
      return periodos.map((p) => String(p).trim()).filter(Boolean)
    }
    return String(periodos)
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Recurrencia Trimestral"
          subtitulo="Análisis de continuidad y beneficios acumulados por estudiante"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* RESUMEN RÁPIDO (Se oculta al imprimir) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Becados</p>
            <p className="text-sm font-black text-[#1e3a5f]">{data.length}</p>
          </div>
        </div>
      </div>

      {/* TABLA DE RECURRENCIA EN PANTALLA (Se oculta al imprimir) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Ranking de Continuidad Académica
            </span>
          </div>
          <button
            type="button"
            onClick={cargarDatos}
            className="text-[8px] font-black text-blue-600 uppercase hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Beneficios</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Periodos Beneficiados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto mb-2" />
                    Analizando recurrencia...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => {
                  const periodosLista = obtenerPeriodosLista(row.periodos_beneficiados)
                  return (
                    <tr key={idx} className="hover:bg-amber-50/10 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[#1e3a5f]">
                            <UserCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-black text-[#1e3a5f] uppercase leading-none">
                              {String(row.nombre || "")} {String(row.apellido || "")}
                            </p>
                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                              {String(row.cedula || "---")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 font-black text-[10px] border border-amber-200 shadow-sm">
                          {String(row.total_beneficios ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600 font-bold uppercase text-[9px]">
                          <GraduationCap className="w-3 h-3 opacity-50" />
                          {String(row.carrera || "---")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {periodosLista.length > 0 ? (
                            periodosLista.map((periodo, pIdx) => (
                              <span
                                key={pIdx}
                                className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[8px] font-black border border-slate-200"
                              >
                                {periodo}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[8px] font-bold">---</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No hay datos de recurrencia disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Recurrencia Trimestral"
        subtitulo={`Análisis de continuidad y beneficios acumulados por estudiante — Total Becados: ${data.length}`}
        columnas={["Estudiante / Cédula", "Beneficios", "Carrera", "Periodos Beneficiados"]}
        datos={data}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const item = row as RecurrenciaAlumnoRow
          const periodosLista = obtenerPeriodosLista(item.periodos_beneficiados)
          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">
                  {String(item.nombre || "")} {String(item.apellido || "")}
                </span>
                <span className="text-[8px] text-slate-500 font-semibold">
                  {String(item.cedula || "---")}
                </span>
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
                {String(item.total_beneficios ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400 uppercase font-semibold">
                {String(item.carrera || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 text-[8px] font-semibold text-slate-700">
                {periodosLista.length > 0 ? periodosLista.join(", ") : "---"}
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}