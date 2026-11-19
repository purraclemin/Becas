"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import { FileDown, Table as TableIcon, Loader2, Calendar, UserCheck, GraduationCap, Award } from "lucide-react"
import { reporteAprobadasPorFecha } from "@/lib/ActionsReportes"

interface BecaAprobadaRow {
  nombre?: string
  apellido?: string
  cedula?: string
  puntaje_baremo_?: number | string | null
  puntaje_baremo?: number | string | null
  puntaje?: number | string | null
  tipo_beca_snapshot?: string
  tipo_beca?: string
  programa?: string
  carrera?: string
  periodo?: string
  fecha_aprobacion?: string | Date
  [key: string]: unknown
}

interface ReporteAprobadasResponse {
  success?: boolean
  data?: BecaAprobadaRow[]
}

export default function ReporteAprobadasPage() {
  const [data, setData] = useState<BecaAprobadaRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({ inicio: "", fin: "" })
  const [buscado, setBuscado] = useState<boolean>(false)

  const generar = async () => {
    if (!range.inicio || !range.fin) {
      alert("Por favor selecciona ambas fechas para filtrar.")
      return
    }

    setLoading(true)
    try {
      const res = (await reporteAprobadasPorFecha(range.inicio, range.fin)) as ReporteAprobadasResponse
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
  }

  const handleExportar = () => {
    window.print()
  }

  const obtenerPuntaje = (row: BecaAprobadaRow): string => {
    const valor = row.puntaje_baremo_ ?? row.puntaje_baremo ?? row.puntaje
    if (valor === null || valor === undefined || String(valor).trim() === "") {
      return "---"
    }
    return `${String(valor)} pts`
  }

  const obtenerPrograma = (row: BecaAprobadaRow): string => {
    const valor = row.tipo_beca_snapshot || row.tipo_beca || row.programa
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
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Reporte: Becas Aprobadas"
          subtitulo="Listado histórico de beneficios otorgados y validados"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* FILTROS DE GENERACIÓN (Se ocultan al imprimir) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end gap-3 print:hidden">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                onChange={e => setRange({ ...range, inicio: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="date"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1a2744] outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                onChange={e => setRange({ ...range, fin: e.target.value })}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={generar}
          disabled={loading}
          className="bg-emerald-600 text-white px-5 h-12 sm:h-9 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
          Generar Vista
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA (Se oculta al imprimir) */}
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
              className="text-blue-600 font-black text-[9px] uppercase flex items-center gap-1 hover:underline cursor-pointer"
            >
              <FileDown className="w-3 h-3" /> Exportar Excel
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
            <tbody className="divide-y divide-slate-100 text-[10px]">
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
                          <p className="font-black text-[#1a2744] uppercase leading-none">
                            {String(row.nombre || "")} {String(row.apellido || "")}
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                            {String(row.cedula || "---")}
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
                        <Award className="w-3 h-3 text-amber-500" />
                        {obtenerPrograma(row)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-600 uppercase flex items-center gap-1">
                          <GraduationCap className="w-2.5 h-2.5" /> {String(row.carrera || "---")}
                        </span>
                        <span className="text-[8px] text-blue-600 font-black mt-0.5">
                          {String(row.periodo || "---")}
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
                    {buscado ? "No se encontraron becas aprobadas en este rango" : "Selecciona fechas para generar el listado"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Reporte: Becas Aprobadas"
        subtitulo={
          range.inicio && range.fin
            ? `Periodo de aprobación: ${range.inicio} al ${range.fin} — Total: ${data.length}`
            : `Listado histórico de beneficios otorgados y validados — Total: ${data.length}`
        }
        columnas={["Beneficiario / Cédula", "Puntaje", "Programa", "Carrera / Periodo", "F. Aprobación"]}
        datos={data}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const item = row as BecaAprobadaRow
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
                {obtenerPuntaje(item)}
              </td>
              <td className="p-1.5 border border-slate-400 uppercase font-semibold">
                {obtenerPrograma(item)}
              </td>
              <td className="p-1.5 border border-slate-400">
                <span className="uppercase font-semibold block">{String(item.carrera || "---")}</span>
                <span className="text-[8px] text-slate-600 font-bold">{String(item.periodo || "---")}</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-right text-[8px] font-semibold">
                {formatearFechaAprobacion(item.fecha_aprobacion)}
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}