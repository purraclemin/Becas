"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import { Loader2, UserX, GraduationCap, XCircle, Search, Calendar, X } from "lucide-react"
import { reporteRechazadasPorFecha, type ReporteRechazadaRow } from "@/lib/ActionsReportes"

export default function ReporteRechazadasPage() {
  const [data, setData] = useState<ReporteRechazadaRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({ inicio: "", fin: "" })
  const [search, setSearch] = useState<string>("")
  const [buscado, setBuscado] = useState<boolean>(false)

  const cargar = useCallback(async (inicio: string, fin: string, termino: string) => {
    setLoading(true)
    try {
      const res = await reporteRechazadasPorFecha(
        inicio || undefined,
        fin || undefined,
        termino || undefined
      )
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al generar reporte:", error)
      setData([])
    } finally {
      setLoading(false)
      setBuscado(true)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargar(range.inicio, range.fin, search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, cargar])

  const generar = async () => {
    if ((range.inicio && !range.fin) || (!range.inicio && range.fin)) {
      alert("Selecciona ambas fechas o déjalas vacías para consultar todo el historial.")
      return
    }
    await cargar(range.inicio, range.fin, search)
  }

  const handleExportar = () => {
    window.print()
  }

  const obtenerMotivo = (row: ReporteRechazadaRow): string => {
    const motivo = row.observacion_admin
    return motivo && String(motivo).trim() !== "" ? String(motivo) : "Sin motivo especificado"
  }

  const formatearFechaRechazo = (row: ReporteRechazadaRow): string => {
    const fechaValor = row.fecha_aprobacion
    if (!fechaValor) return "---"
    const parsed = new Date(fechaValor)
    if (Number.isNaN(parsed.getTime())) return String(fechaValor)
    return parsed.toLocaleDateString()
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      <div className="print:hidden">
        <PageHeader
          titulo="Reporte: Becas Rechazadas"
          subtitulo="Registro de solicitudes no admitidas y pérdidas de beneficio"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* FILTROS: Nombre/Cédula + Rango de Fechas */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-end gap-3 print:hidden">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">
              Nombre o Cédula
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar estudiante..."
                className="w-full h-12 md:h-9 pl-8 pr-8 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] bg-[#f8fafc] focus:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={range.inicio}
                className="w-full h-12 md:h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-rose-500 bg-slate-50/50"
                onChange={(e) => setRange({ ...range, inicio: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                value={range.fin}
                className="w-full h-12 md:h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-rose-500 bg-slate-50/50"
                onChange={(e) => setRange({ ...range, fin: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void generar()}
          disabled={loading}
          className="bg-rose-600 text-white px-5 h-12 md:h-9 rounded-lg font-black text-xs md:text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          Filtrar
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Carrera / Periodo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Motivo / Observación</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase text-right">Fecha Rechazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
                    Generando...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                          <UserX className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1e3a5f] uppercase leading-none">
                            {row.nombre} {row.apellido}
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">
                            V-{row.cedula || "---"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-bold uppercase text-[9px]">
                      <div className="flex flex-col">
                        <span>
                          <GraduationCap className="w-3 h-3 inline mr-1 opacity-50" /> {row.carrera || "---"}
                        </span>
                        <span className="text-[8px] text-rose-600 font-black mt-0.5">
                          {row.periodo || "---"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-500 italic max-w-xs truncate" title={obtenerMotivo(row)}>
                        &ldquo;{obtenerMotivo(row)}&rdquo;
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-600 uppercase">
                      {formatearFechaRechazo(row)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    {buscado ? "No se encontraron rechazos con los criterios actuales" : "Sin registros"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN */}
      <PrintReportLayout<ReporteRechazadaRow>
        titulo="Reporte: Becas Rechazadas"
        subtitulo={`${
          range.inicio && range.fin
            ? `Periodo: ${range.inicio} al ${range.fin}`
            : "Registro histórico completo de solicitudes rechazadas"
        } — Total: ${data.length}${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`}
        columnas={["Estudiante / Cédula", "Carrera / Periodo", "Motivo / Observación", "Fecha Rechazo"]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{item.cedula || "---"}</span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{item.carrera || "---"}</span>
              <span className="text-[8px] text-slate-600 font-bold">{item.periodo || "---"}</span>
            </td>
            <td className="p-1.5 border border-slate-400 italic text-slate-700">
              {obtenerMotivo(item)}
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px] font-bold uppercase">
              {formatearFechaRechazo(item)}
            </td>
          </tr>
        )}
      />
    </div>
  )
}