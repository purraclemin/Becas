"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import { Table as TableIcon, Loader2, Calendar, User, ClipboardList, Clock } from "lucide-react"
import { reporteSolicitudesPorFecha } from "@/lib/ActionsReportes"

interface SolicitudFechaRow {
  nombre?: string
  apellido?: string
  cedula?: string
  carrera?: string
  tipo_beca?: string
  estatus?: string
  fecha_registro?: string | Date
  [key: string]: unknown
}

export default function ReporteSolicitudesFechaPage() {
  const [data, setData] = useState<SolicitudFechaRow[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({ inicio: "", fin: "" })
  const [buscado, setBuscado] = useState<boolean>(false)

  const generar = async () => {
    if (!range.inicio || !range.fin) return alert("Selecciona ambas fechas")
    setLoading(true)
    try {
      const res = await reporteSolicitudesPorFecha(range.inicio, range.fin)
      // queryFresh devuelve las filas directamente
      if (res) {
        setData(res as SolicitudFechaRow[])
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte:", error)
    } finally {
      setLoading(false)
      setBuscado(true)
    }
  }

  const handleExportar2 = () => {
    window.print()
  }

  // Función para los colores de estatus (Mismo diseño que Dashboard)
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Aprobada': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'Rechazada': return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'En Revisión': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Pendiente': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Renovacion':
      case 'Renovación': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      case 'Revisión Especial':
      case 'Revision Especial': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON UN SOLO BOTÓN EXPORTAR2 (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Solicitudes por Fecha"
          subtitulo="Listado completo basado en la fecha de ingreso al sistema"
          mostrarExportar={true}
          onExport={handleExportar2}
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
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1e3a5f] outline-none focus:ring-1 focus:ring-[#1e3a5f] bg-slate-50/50"
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
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-bold text-[#1e3a5f] outline-none focus:ring-1 focus:ring-[#1e3a5f] bg-slate-50/50"
                onChange={e => setRange({ ...range, fin: e.target.value })}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={generar}
          disabled={loading}
          className="bg-[#1e3a5f] text-white px-5 h-12 sm:h-9 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#162c4a] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
          Generar Listado
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA (Se oculta al imprimir) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-[#1e3a5f]" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Registros en el periodo: {data.length}
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
            <tbody className="divide-y divide-slate-100 text-[10px]">
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
                          <p className="font-black text-[#1e3a5f] uppercase leading-none">{String(row.nombre || "")} {String(row.apellido || "")}</p>
                          <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{String(row.cedula || "")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-600 uppercase text-[9px] truncate max-w-[150px]">
                        {String(row.carrera || "")}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[8px] font-black uppercase border border-slate-200">
                        {String(row.tipo_beca || "")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase shadow-sm ${getStatusStyles(String(row.estatus || ""))}`}>
                        {String(row.estatus || "")}
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
                          {row.fecha_registro ? new Date(row.fecha_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    {buscado ? "No se encontraron solicitudes en este periodo" : "Define un rango de fechas para consultar"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Solicitudes por Fecha"
        subtitulo={range.inicio && range.fin ? `Periodo: ${range.inicio} al ${range.fin}` : "Listado completo basado en la fecha de ingreso al sistema"}
        columnas={["Estudiante / Cédula", "Carrera", "Tipo de Beca", "Estatus", "Fecha Ingreso"]}
        datos={data}
        renderFila={(row, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">{String(row.nombre || "")} {String(row.apellido || "")}</span>
              <span className="text-[8px] text-slate-500 font-semibold">{String(row.cedula || "")}</span>
            </td>
            <td className="p-1.5 border border-slate-400 uppercase">
              {String(row.carrera || "")}
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">
              {String(row.tipo_beca || "")}
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-bold">
              {String(row.estatus || "")}
            </td>
            <td className="p-1.5 border border-slate-400 text-[8px]">
              {row.fecha_registro ? new Date(row.fecha_registro).toLocaleString() : "---"}
            </td>
          </tr>
        )}
      />
    </div>
  )
}