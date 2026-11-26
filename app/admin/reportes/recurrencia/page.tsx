"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Loader2,
  UserCheck,
  UserX,
  GraduationCap,
  FileSpreadsheet,
  RefreshCw,
  Trophy,
  Search,
  X,
  CheckCircle2,
  XCircle,
  Award
} from "lucide-react"
import { reporteRecurrenciaAlumnos, type ReporteRecurrenciaRow } from "@/lib/ActionsReportes"

export default function ReporteRecurrenciaPage() {
  const [data, setData] = useState<ReporteRecurrenciaRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>("")

  const cargarDatos = useCallback(async (termino: string) => {
    setLoading(true)
    try {
      const res = await reporteRecurrenciaAlumnos(termino)
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
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargarDatos(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, cargarDatos])

  const handleExportar = () => {
    window.print()
  }

  const obtenerPeriodosLista = (periodos?: string | null): string[] => {
    if (!periodos) return []
    return String(periodos)
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
  }

  const totalRechazados = data.filter((r) => Number(r.fue_rechazado) === 1 || r.estatus_final === "Rechazada").length
  const totalActivos = data.length - totalRechazados

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN */}
      <div className="print:hidden">
        <PageHeader
          titulo="Recurrencia Trimestral"
          subtitulo="Histórico de continuidad, beneficios acumulados y rechazos finales por estudiante"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* RESUMEN RÁPIDO + BARRA DE BÚSQUEDA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Evaluados</p>
            <p className="text-sm font-black text-[#1e3a5f]">{data.length}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Vigentes / Aprobados</p>
            <p className="text-sm font-black text-emerald-700">{totalActivos}</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rechazados / Baja Definitiva</p>
            <p className="text-sm font-black text-rose-700">{totalRechazados}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA POR NOMBRE Y CÉDULA */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre o Cédula..."
            className="w-full h-12 md:h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => void cargarDatos(search)}
          className="h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-xs md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* TABLA DE RECURRENCIA EN PANTALLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#d4a843]" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Ranking de Continuidad y Estado Final ({data.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Beneficios</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera / Modalidad</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Trayectoria por Periodos</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Estatus Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-[#d4a843] mx-auto mb-2" />
                    Analizando recurrencia...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row) => {
                  const periodosAprobados = obtenerPeriodosLista(row.periodos_beneficiados)
                  const periodosRechazados = obtenerPeriodosLista(row.periodos_rechazados)
                  const esRechazado = Number(row.fue_rechazado) === 1 || row.estatus_final === "Rechazada"

                  return (
                    <tr
                      key={row.student_id}
                      className={`transition-colors group ${
                        esRechazado ? "hover:bg-rose-50/20" : "hover:bg-emerald-50/10"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              esRechazado
                                ? "bg-rose-50 text-rose-600"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {esRechazado ? (
                              <UserX className="w-3.5 h-3.5" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-[#1e3a5f] uppercase leading-none">
                              {row.nombre} {row.apellido}
                            </p>
                            <p className="text-[9px] md:text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                              V-{row.cedula}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] border border-amber-200 shadow-sm">
                          {Number(row.total_beneficios ?? 0)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-slate-600 font-bold uppercase text-[9px]">
                            <GraduationCap className="w-3 h-3 opacity-50 shrink-0" />
                            {row.carrera || "---"}
                          </span>
                          {row.tipo_beca_reciente && (
                            <span className="flex items-center gap-1 text-[#d4a843] font-black uppercase text-[8px]">
                              <Award className="w-2.5 h-2.5 shrink-0" />
                              {row.tipo_beca_reciente}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {periodosAprobados.map((periodo, pIdx) => (
                            <span
                              key={`ap-${pIdx}`}
                              className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black border border-emerald-200"
                            >
                              ✓ {periodo}
                            </span>
                          ))}
                          {periodosRechazados.map((periodo, rIdx) => (
                            <span
                              key={`re-${rIdx}`}
                              className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[8px] font-black border border-rose-200"
                            >
                              ✕ {periodo} (Rechazado)
                            </span>
                          ))}
                          {periodosAprobados.length === 0 && periodosRechazados.length === 0 && (
                            <span className="text-slate-400 text-[8px] font-bold">---</span>
                          )}
                        </div>
                        {esRechazado && row.motivo_rechazo && (
                          <p
                            className="text-[8px] text-rose-600/80 italic mt-1 line-clamp-1 max-w-xs"
                            title={row.motivo_rechazo}
                          >
                            {row.motivo_rechazo}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {esRechazado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 text-[8px] font-black uppercase tracking-wider">
                            <XCircle className="w-3 h-3" />
                            Rechazado (Baja)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 text-[8px] font-black uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            {row.estatus_final || "Aprobada"}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No se encontraron registros de recurrencia para la búsqueda actual
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout<ReporteRecurrenciaRow>
        titulo="Recurrencia Trimestral"
        subtitulo={`Total: ${data.length} | Activos: ${totalActivos} | Rechazados: ${totalRechazados}${
          search.trim() ? ` | Filtro: "${search.trim()}"` : ""
        }`}
        columnas={[
          "Estudiante / Cédula",
          "Beneficios",
          "Carrera / Modalidad",
          "Periodos Aprobados / Rechazados",
          "Estatus Final"
        ]}
        datos={data}
        renderFila={(item, idx) => {
          const periodosAprobados = obtenerPeriodosLista(item.periodos_beneficiados)
          const periodosRechazados = obtenerPeriodosLista(item.periodos_rechazados)
          const esRechazado = Number(item.fue_rechazado) === 1 || item.estatus_final === "Rechazada"

          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">
                  {item.nombre} {item.apellido}
                </span>
                <span className="text-[8px] text-slate-500 font-semibold">V-{item.cedula}</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
                {Number(item.total_beneficios ?? 0)}
              </td>
              <td className="p-1.5 border border-slate-400">
                <span className="uppercase font-semibold block">{item.carrera || "---"}</span>
                {item.tipo_beca_reciente && (
                  <span className="text-[8px] text-slate-600 uppercase">{item.tipo_beca_reciente}</span>
                )}
              </td>
              <td className="p-1.5 border border-slate-400 text-[8px] font-semibold text-slate-700">
                {periodosAprobados.length > 0 && (
                  <span className="block">Aprobados: {periodosAprobados.join(", ")}</span>
                )}
                {periodosRechazados.length > 0 && (
                  <span className="block text-rose-700">
                    Rechazado en: {periodosRechazados.join(", ")}
                  </span>
                )}
                {periodosAprobados.length === 0 && periodosRechazados.length === 0 && "---"}
              </td>
              <td className="p-1.5 border border-slate-400 text-right uppercase font-bold">
                {esRechazado ? "RECHAZADO (BAJA)" : item.estatus_final || "APROBADA"}
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}