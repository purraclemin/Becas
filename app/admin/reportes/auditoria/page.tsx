"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Loader2,
  UserCog,
  ShieldCheck,
  ArrowRight,
  Globe,
  RefreshCw,
  History,
  Search,
  X
} from "lucide-react"
import {
  reporteAuditoriaAdministradores,
  type ReporteAuditoriaAdminRow
} from "@/lib/ActionsReportes"

export default function ReporteAuditoriaPage() {
  const [data, setData] = useState<ReporteAuditoriaAdminRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>("")

  const cargarDatos = useCallback(async (termino: string) => {
    setLoading(true)
    try {
      const res = await reporteAuditoriaAdministradores(termino)
      if (res && res.success && Array.isArray(res.data)) {
        setData(res.data)
      } else {
        setData([])
      }
    } catch (error) {
      console.error("Error al cargar reporte de auditoría:", error)
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

  const formatearFechaHora = (fecha?: string | Date): { fechaStr: string; horaStr: string } => {
    if (!fecha) return { fechaStr: "---", horaStr: "" }
    const parsed = new Date(fecha)
    if (Number.isNaN(parsed.getTime())) {
      return { fechaStr: String(fecha), horaStr: "" }
    }
    return {
      fechaStr: parsed.toLocaleDateString(),
      horaStr: parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    }
  }

  const getStatusColor = (status: string) => {
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
          titulo="Auditoría de Administradores"
          subtitulo="Registro cronológico de actividad y gestión de solicitudes"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* BARRA DE BÚSQUEDA POR NOMBRE Y CÉDULA */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 print:hidden">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por Nombre, Cédula o Correo Admin..."
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
          Refrescar Logs
        </button>
      </div>

      {/* TABLA DE RESULTADOS EN PANTALLA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:hidden">
        <div className="p-3 border-b bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">
              Bitácora de Seguridad del Sistema ({data.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Administrador</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Acción (Estatus)</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante Afectado</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Dirección IP</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-600 mx-auto mb-2" />
                    Sincronizando registros de seguridad...
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((row, idx) => {
                  const { fechaStr, horaStr } = formatearFechaHora(row.fecha_aprobacion)
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#1e3a5f] rounded-lg flex items-center justify-center text-[#d4a843]">
                            <UserCog className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-black text-[#1e3a5f] uppercase leading-none">Autoridad / Sistema</p>
                            <p className="text-[8px] text-blue-600 font-bold mt-1 lowercase tracking-tighter">
                              {row.admin_email || "---"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded border text-[8px] font-bold opacity-60 ${getStatusColor(row.estatus_previo || "")}`}>
                            {row.estatus_previo || "---"}
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
                          <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase shadow-sm ${getStatusColor(row.estatus_nuevo || "")}`}>
                            {row.estatus_nuevo || "---"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <p className="font-black text-slate-700 uppercase">
                            {row.alumno_nombre} {row.alumno_apellido}
                          </p>
                          <p className="text-[8px] text-slate-400 font-bold">
                            CI: V-{row.alumno_cedula || "---"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-500 font-mono text-[9px] border border-slate-200">
                          <Globe className="w-2.5 h-2.5" />
                          {row.ip_accion || "0.0.0.0"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <p className="font-bold text-slate-600 uppercase">{fechaStr}</p>
                          {horaStr && (
                            <p className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase flex items-center gap-1">
                              <History className="w-2 h-2" />
                              {horaStr}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No existen registros de auditoría para la búsqueda actual
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN */}
      <PrintReportLayout<ReporteAuditoriaAdminRow>
        titulo="Auditoría de Administradores"
        subtitulo={`Registro cronológico de actividad — Total: ${data.length}${
          search.trim() ? ` | Filtro: "${search.trim()}"` : ""
        }`}
        columnas={["Administrador", "Acción (Estatus)", "Estudiante Afectado", "Dirección IP", "Fecha y Hora"]}
        datos={data}
        renderFila={(item, idx) => {
          const { fechaStr, horaStr } = formatearFechaHora(item.fecha_aprobacion)
          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">Autoridad / Sistema</span>
                <span className="text-[8px] text-slate-600 lowercase">{item.admin_email || "---"}</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-[8px] uppercase font-bold">
                <span>{item.estatus_previo || "---"}</span>
                <span className="mx-1">→</span>
                <span>{item.estatus_nuevo || "---"}</span>
              </td>
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">
                  {item.alumno_nombre} {item.alumno_apellido}
                </span>
                <span className="text-[8px] text-slate-500 font-semibold">
                  CI: V-{item.alumno_cedula || "---"}
                </span>
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-mono text-[8px]">
                {item.ip_accion || "0.0.0.0"}
              </td>
              <td className="p-1.5 border border-slate-400 text-right text-[8px]">
                <span className="font-bold block">{fechaStr}</span>
                {horaStr && <span className="text-slate-500">{horaStr}</span>}
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}