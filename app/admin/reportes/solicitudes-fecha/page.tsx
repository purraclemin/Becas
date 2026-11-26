"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Table as TableIcon,
  Loader2,
  Calendar,
  User,
  ClipboardList,
  Clock,
  Search,
  X
} from "lucide-react"
import {
  reporteSolicitudesPorFecha,
  type ReporteSolicitudFechaRow
} from "@/lib/ActionsReportes"

export default function ReporteSolicitudesFechaPage() {
  const [data, setData] = useState<ReporteSolicitudFechaRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({ inicio: "", fin: "" })
  const [search, setSearch] = useState<string>("")
  const [buscado, setBuscado] = useState<boolean>(false)

  const cargar = useCallback(async (inicio: string, fin: string, termino: string) => {
    setLoading(true)
    try {
      const res = await reporteSolicitudesPorFecha(
        inicio || undefined,
        fin || undefined,
        termino || undefined
      )
      if (Array.isArray(res)) {
        setData(res)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error)
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Aprobada":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "Rechazada":
        return "bg-rose-100 text-rose-700 border-rose-200"
      case "Convocado a Entrevista":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "En Revisión":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "Pendiente":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "Renovacion":
      case "Renovación":
        return "bg-indigo-100 text-indigo-700 border-indigo-200"
      case "Revisión Especial":
      case "Revision Especial":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-slate-100 text-slate-600 border-slate-200"
    }
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      <div className="print:hidden">
        <PageHeader
          titulo="Solicitudes por Fecha"
          subtitulo="Listado completo basado en la fecha de ingreso al sistema"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* FILTROS: Búsqueda por Nombre/Cédula + Fechas */}
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
                className="w-full h-12 md:h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] bg-slate-50/50"
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
                className="w-full h-12 md:h-9 pl-8 pr-3 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] bg-slate-50/50"
                onChange={(e) => setRange({ ...range, fin: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void generar()}
          disabled={loading}
          className="bg-[#1e3a5f] text-white px-5 h-12 md:h-9 rounded-lg font-black text-xs md:text-[10px] uppercase tracking-widest hover:bg-[#162c4a] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
          Filtrar
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-[#1e3a5f]" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Registros encontrados: {data.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Carrera</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Tipo de Beca</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estatus</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Fecha Ingreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f] mx-auto mb-2" />
                    Cargando información...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[#1e3a5f]">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-black text-[#1e3a5f] uppercase leading-none">
                            {row.nombre} {row.apellido}
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                            V-{row.cedula}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-600 uppercase text-[9px] truncate max-w-[150px]">
                        {row.carrera}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-200">
                        {row.tipo_beca}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase shadow-sm ${getStatusStyles(row.estatus)}`}>
                        {row.estatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-slate-600 font-bold">
                          <Calendar className="w-2.5 h-2.5 opacity-50" />
                          {row.fecha_registro ? new Date(row.fecha_registro).toLocaleDateString() : "---"}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[8px] font-bold mt-0.5">
                          <Clock className="w-2.5 h-2.5 opacity-50" />
                          {row.fecha_registro
                            ? new Date(row.fecha_registro).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    {buscado ? "No se encontraron solicitudes con los criterios actuales" : "Sin registros"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN */}
      <PrintReportLayout<ReporteSolicitudFechaRow>
        titulo="Solicitudes por Fecha"
        subtitulo={`${
          range.inicio && range.fin
            ? `Periodo: ${range.inicio} al ${range.fin}`
            : "Listado completo de ingresos al sistema"
        } — Total: ${data.length}${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`}
        columnas={["Estudiante / Cédula", "Carrera", "Tipo de Beca", "Estatus", "Fecha Ingreso"]}
        datos={data}
        renderFila={(row, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {row.nombre} {row.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{row.cedula}</span>
            </td>
            <td className="p-1.5 border border-slate-400 uppercase">{row.carrera}</td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">{row.tipo_beca}</td>
            <td className="p-1.5 border border-slate-400 uppercase font-bold">{row.estatus}</td>
            <td className="p-1.5 border border-slate-400 text-[8px]">
              {row.fecha_registro ? new Date(row.fecha_registro).toLocaleString() : "---"}
            </td>
          </tr>
        )}
      />
    </div>
  )
}