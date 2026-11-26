"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  FileDown,
  Table as TableIcon,
  Loader2,
  Calendar,
  UserCheck,
  GraduationCap,
  Award,
  Search,
  X
} from "lucide-react"
import { reporteAprobadasPorFecha, type ReporteAprobadaRow } from "@/lib/ActionsReportes"

export default function ReporteAprobadasPage() {
  const [data, setData] = useState<ReporteAprobadaRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({ inicio: "", fin: "" })
  const [search, setSearch] = useState<string>("")
  const [buscado, setBuscado] = useState<boolean>(false)

  const cargar = useCallback(async (inicio: string, fin: string, termino: string) => {
    setLoading(true)
    try {
      const res = await reporteAprobadasPorFecha(
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
      alert("Por favor selecciona ambas fechas o déjalas vacías para buscar en todo el historial.")
      return
    }
    await cargar(range.inicio, range.fin, search)
  }

  const handleExportar = () => {
    window.print()
  }

  const obtenerPuntaje = (row: ReporteAprobadaRow): string => {
    const valor = row.puntaje_baremo_
    if (valor === null || valor === undefined || String(valor).trim() === "") {
      return "---"
    }
    return `${String(valor)} pts`
  }

  const obtenerPrograma = (row: ReporteAprobadaRow): string => {
    const valor = row.tipo_beca_snapshot
    return valor && String(valor).trim() !== "" ? String(valor) : "---"
  }

  const formatearFechaAprobacion = (fecha?: string | Date): string => {
    if (!fecha) return "---"
    const parsed = new Date(fecha)
    if (Number.isNaN(parsed.getTime())) return String(fecha)
    return parsed.toLocaleDateString()
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      <div className="print:hidden">
        <PageHeader
          titulo="Reporte: Becas Aprobadas"
          subtitulo="Listado histórico de beneficios otorgados y validados"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* FILTROS: Búsqueda por Nombre/Cédula + Rango de Fechas */}
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
                className="w-full h-12 md:h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-emerald-500 bg-slate-50/50"
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
                className="w-full h-12 md:h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-emerald-500 bg-slate-50/50"
                onChange={(e) => setRange({ ...range, fin: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void generar()}
          disabled={loading}
          className="bg-emerald-600 text-white px-5 h-12 md:h-9 rounded-lg font-black text-xs md:text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
          Filtrar
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Aprobaciones Encontradas: {data.length}
            </span>
          </div>
          {data.length > 0 && (
            <button
              type="button"
              onClick={handleExportar}
              className="text-[#1e3a5f] font-black text-[9px] uppercase flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FileDown className="w-3 h-3 text-[#d4a843]" /> Imprimir / PDF
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Beneficiario</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Puntaje</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Programa</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera / Periodo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">F. Aprobación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto mb-2" />
                    Consultando registros...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/10 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
                          <UserCheck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1e3a5f] uppercase leading-none">
                            {row.nombre} {row.apellido}
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                            V-{row.cedula || "---"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                        {obtenerPuntaje(row)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-black text-slate-600 uppercase text-[9px]">
                        <Award className="w-3 h-3 text-[#d4a843] shrink-0" />
                        {obtenerPrograma(row)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-600 uppercase flex items-center gap-1">
                          <GraduationCap className="w-2.5 h-2.5" /> {row.carrera || "---"}
                        </span>
                        <span className="text-[8px] text-blue-600 font-black mt-0.5">
                          {row.periodo || "---"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-500">
                      {formatearFechaAprobacion(row.fecha_aprobacion)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    {buscado ? "No se encontraron becas aprobadas con los criterios actuales" : "Sin registros disponibles"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN */}
      <PrintReportLayout<ReporteAprobadaRow>
        titulo="Reporte: Becas Aprobadas"
        subtitulo={`${
          range.inicio && range.fin
            ? `Periodo de aprobación: ${range.inicio} al ${range.fin}`
            : "Listado histórico completo de beneficios otorgados"
        } — Total: ${data.length}${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`}
        columnas={["Beneficiario / Cédula", "Puntaje", "Programa", "Carrera / Periodo", "F. Aprobación"]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{item.cedula || "---"}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
              {obtenerPuntaje(item)}
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">
              {obtenerPrograma(item)}
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{item.carrera || "---"}</span>
              <span className="text-[8px] text-slate-600 font-bold">{item.periodo || "---"}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px] font-semibold">
              {formatearFechaAprobacion(item.fecha_aprobacion)}
            </td>
          </tr>
        )}
      />
    </div>
  )
}