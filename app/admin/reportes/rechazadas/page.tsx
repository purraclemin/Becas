"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import { Loader2, UserX, GraduationCap, XCircle } from "lucide-react"
import { reporteRechazadasPorFecha } from "@/lib/ActionsReportes"

interface BecaRechazadaRow {
  nombre?: string
  apellido?: string
  cedula?: string
  carrera?: string
  observacion_admin?: string | null
  fecha_aprobacion?: string | Date
  fecha_rechazo?: string | Date
  fecha_registro?: string | Date
  [key: string]: unknown
}

interface ReporteRechazadasResponse {
  success?: boolean
  data?: BecaRechazadaRow[]
}

export default function ReporteRechazadasPage() {
  const [data, setData] = useState<BecaRechazadaRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({ inicio: "", fin: "" })
  const [buscado, setBuscado] = useState<boolean>(false)

  const generar = async () => {
    if (!range.inicio || !range.fin) {
      alert("Selecciona ambas fechas")
      return
    }

    setLoading(true)
    try {
      const res = (await reporteRechazadasPorFecha(range.inicio, range.fin)) as ReporteRechazadasResponse
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

  const obtenerMotivo = (row: BecaRechazadaRow): string => {
    const motivo = row.observacion_admin
    return motivo && String(motivo).trim() !== "" ? String(motivo) : "Sin motivo especificado"
  }

  const formatearFechaRechazo = (row: BecaRechazadaRow): string => {
    const fechaValor = row.fecha_aprobacion || row.fecha_rechazo || row.fecha_registro
    if (!fechaValor) return "---"
    const parsed = new Date(fechaValor)
    if (Number.isNaN(parsed.getTime())) return String(fechaValor)
    return parsed.toLocaleDateString()
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN DE EXPORTACIÓN (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Reporte: Becas Rechazadas"
          subtitulo="Registro de solicitudes no admitidas"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* FILTROS DE GENERACIÓN (Se ocultan al imprimir) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end gap-3 print:hidden">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Desde</label>
            <input
              type="date"
              className="w-full p-1.5 rounded-lg border border-slate-200 text-[11px] font-bold outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50/50"
              onChange={e => setRange({ ...range, inicio: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Hasta</label>
            <input
              type="date"
              className="w-full p-1.5 rounded-lg border border-slate-200 text-[11px] font-bold outline-none focus:ring-1 focus:ring-rose-500 bg-slate-50/50"
              onChange={e => setRange({ ...range, fin: e.target.value })}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={generar}
          disabled={loading}
          className="bg-rose-600 text-white px-5 h-12 sm:h-9 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          Generar Reporte
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA (Se oculta al imprimir) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Estudiante</th>
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Carrera</th>
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase">Motivo / Observación</th>
              <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase text-right">Fecha Rechazo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[10px]">
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
                        <p className="font-black text-[#1a2744] uppercase leading-none">
                          {String(row.nombre || "")} {String(row.apellido || "")}
                        </p>
                        <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase">
                          {String(row.cedula || "---")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-bold uppercase text-[9px]">
                    <GraduationCap className="w-3 h-3 inline mr-1 opacity-50" /> {String(row.carrera || "---")}
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
                  {buscado ? "No hay rechazos en este rango" : "Selecciona un rango"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Reporte: Becas Rechazadas"
        subtitulo={
          range.inicio && range.fin
            ? `Periodo: ${range.inicio} al ${range.fin} — Total: ${data.length}`
            : `Registro de solicitudes no admitidas — Total: ${data.length}`
        }
        columnas={["Estudiante / Cédula", "Carrera", "Motivo / Observación", "Fecha Rechazo"]}
        datos={data}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const item = row as BecaRechazadaRow
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
              <td className="p-1.5 border border-slate-400 uppercase font-semibold">
                {String(item.carrera || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 italic text-slate-700">
                {obtenerMotivo(item)}
              </td>
              <td className="p-1.5 border border-slate-400 text-right text-[8px] font-bold uppercase">
                {formatearFechaRechazo(item)}
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}