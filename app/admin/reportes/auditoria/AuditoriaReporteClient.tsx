"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  UserCog,
  ShieldCheck,
  ArrowRight,
  Globe,
  RefreshCw,
  History,
  Search,
  X,
  Bot,
  Landmark
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import {
  obtenerReporteAuditoria,
  type ReporteAuditoriaItem,
  type RespuestaReporteAuditoria,
  type AuditoriaActorTipo
} from "./actions"

interface AuditoriaReporteClientProps {
  initialData: RespuestaReporteAuditoria
}

const formatearFecha = (fechaIso: string): string => {
  if (!fechaIso) return "---"
  const parsed = new Date(fechaIso)
  if (Number.isNaN(parsed.getTime())) return fechaIso
  return parsed.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Caracas",
  })
}

const formatearHora = (fechaIso: string): string => {
  if (!fechaIso) return ""
  const parsed = new Date(fechaIso)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Caracas",
  })
}

const getStatusColor = (status: string): string => {
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

const getActorAvatarStyle = (tipo: AuditoriaActorTipo): string => {
  if (tipo === "secretaria") return "bg-[#d4a843] text-[#1e3a5f]"
  if (tipo === "sistema") return "bg-slate-700 text-white"
  return "bg-[#1e3a5f] text-[#d4a843]"
}

export function AuditoriaReporteClient({
  initialData
}: AuditoriaReporteClientProps) {
  const [data, setData] = useState<ReporteAuditoriaItem[]>(initialData.data)
  const [search, setSearch] = useState<string>("")
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(async (termino: string) => {
    const reqId = ++requestIdRef.current
    setActualizando(true)

    try {
      const res = await obtenerReporteAuditoria(termino || undefined)
      if (reqId !== requestIdRef.current) return
      if (res.success) {
        setData(res.data)
      }
    } catch (error) {
      console.error("Error al actualizar auditoría:", error)
    } finally {
      if (reqId === requestIdRef.current) {
        setActualizando(false)
      }
    }
  }, [])

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false
      return
    }

    const delay = search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(search)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, cargarDatos])

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((row: ReporteAuditoriaItem): CeldaXLSX[] => {
    const fecha = formatearFecha(row.fecha_aprobacion)
    const hora = formatearHora(row.fecha_aprobacion)
    return [
      row.actor_nombre.toUpperCase(),
      row.admin_email,
      row.estatus_previo.toUpperCase(),
      row.estatus_nuevo.toUpperCase(),
      `${row.alumno_nombre} ${row.alumno_apellido}`.trim().toUpperCase(),
      `V-${row.alumno_cedula}`,
      row.ip_accion,
      `${fecha}${hora ? ` ${hora}` : ""}`,
    ]
  }, [])

  const renderIconoActor = (tipo: AuditoriaActorTipo) => {
    if (tipo === "secretaria") return <Landmark className="h-4 w-4" />
    if (tipo === "sistema") return <Bot className="h-4 w-4" />
    return <UserCog className="h-4 w-4" />
  }

  const subtituloReporte = `Registro cronológico de actividad (incluye acciones automáticas) — Total: ${data.length}${
    search.trim() ? ` | Filtro: "${search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Auditoría de Administradores"
          subtitulo={`Bitácora de trazabilidad institucional — Total: ${data.length}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* BARRA DE BÚSQUEDA ALINEADA (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-9 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-auditoria"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar por Estudiante, Cédula, Responsable o Correo</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-auditoria"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ej: Secretaría General, Bienestar Estudiantil, Sistema, cédula..."
                className="w-full h-12 md:h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] placeholder:text-slate-400 placeholder:font-medium outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#1e3a5f] cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3 flex items-center">
            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(search)}
              className="w-full h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                  actualizando ? "animate-spin" : ""
                }`}
              />
              <span>Refrescar Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE DATOS (TABLA PC / TARJETAS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        <div className="hidden md:flex px-4 py-2.5 border-b bg-[#f8fafc] justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Bitácora de Seguridad del Sistema ({data.length})
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No existen registros de auditoría para la búsqueda actual.
            </p>
          </div>
        ) : (
          <>
            {/* TABLA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="px-3.5 py-2.5">Responsable</th>
                    <th className="px-3.5 py-2.5">Acción (Estatus)</th>
                    <th className="px-3.5 py-2.5">Estudiante Afectado</th>
                    <th className="px-3.5 py-2.5 text-center">Dirección IP</th>
                    <th className="px-3.5 py-2.5 text-right">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => (
                    <tr key={row.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${getActorAvatarStyle(
                              row.actor_tipo
                            )}`}
                          >
                            {renderIconoActor(row.actor_tipo)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                              {row.actor_nombre}
                            </p>
                            <p className="text-[10px] text-blue-600 font-bold mt-0.5 lowercase truncate max-w-[210px]">
                              {row.admin_email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded border text-[9px] font-bold opacity-75 ${getStatusColor(
                              row.estatus_previo
                            )}`}
                          >
                            {row.estatus_previo}
                          </span>
                          <ArrowRight className="h-3 w-3 text-slate-300 shrink-0" />
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase shadow-2xs ${getStatusColor(
                              row.estatus_nuevo
                            )}`}
                          >
                            {row.estatus_nuevo}
                          </span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <p className="font-black text-slate-700 uppercase leading-tight">
                          {row.alumno_nombre} {row.alumno_apellido}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                          V-{row.alumno_cedula}
                        </p>
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono text-[10px] border border-slate-200">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <span>{row.ip_accion}</span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <p className="font-mono font-bold text-slate-700 text-xs">
                          {formatearFecha(row.fecha_aprobacion)}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 inline-flex items-center gap-1">
                          <History className="h-2.5 w-2.5" />
                          <span>{formatearHora(row.fecha_aprobacion)}</span>
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TARJETAS MÓVIL (Table-to-Cards) */}
            <div className="md:hidden space-y-3">
              {data.map((row) => (
                <div
                  key={`mob-${row.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${getActorAvatarStyle(
                          row.actor_tipo
                        )}`}
                      >
                        {renderIconoActor(row.actor_tipo)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                          {row.actor_nombre}
                        </p>
                        <p className="text-xs text-blue-600 font-semibold truncate">
                          {row.admin_email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-bold opacity-75 ${getStatusColor(
                        row.estatus_previo
                      )}`}
                    >
                      {row.estatus_previo}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase ${getStatusColor(
                        row.estatus_nuevo
                      )}`}
                    >
                      {row.estatus_nuevo}
                    </span>
                  </div>

                  <div className="text-sm">
                    <p className="font-black text-slate-700 uppercase">
                      {row.alumno_nombre} {row.alumno_apellido}
                    </p>
                    <p className="text-xs font-mono text-slate-500">
                      V-{row.alumno_cedula}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-mono">
                    <span>IP: {row.ip_accion}</span>
                    <span>
                      {formatearFecha(row.fecha_aprobacion)} {formatearHora(row.fecha_aprobacion)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ReporteAuditoriaItem>
        titulo="Auditoría de Administradores"
        subtitulo={subtituloReporte}
        columnas={[
          "Responsable",
          "Acción (Estatus)",
          "Estudiante Afectado",
          "Dirección IP",
          "Fecha y Hora"
        ]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.actor_nombre}
              </span>
              <span className="text-[8px] text-slate-600 lowercase">
                {item.admin_email}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-[8px] uppercase font-bold">
              <span>{item.estatus_previo}</span>
              <span className="mx-1">→</span>
              <span>{item.estatus_nuevo}</span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.alumno_nombre} {item.alumno_apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">
                CI: V-{item.alumno_cedula}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-mono text-[8px]">
              {item.ip_accion}
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px]">
              <span className="font-bold block">
                {formatearFecha(item.fecha_aprobacion)}
              </span>
              <span className="text-slate-500">
                {formatearHora(item.fecha_aprobacion)}
              </span>
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ReporteAuditoriaItem>
        ref={xlsxRef}
        titulo="Auditoría de Administradores"
        subtitulo={subtituloReporte}
        nombreHoja="Auditoria_Sistema"
        nombreArchivo="auditoria_administradores_unimar"
        columnas={[
          "Responsable",
          "Correo",
          "Estatus Previo",
          "Estatus Nuevo",
          "Estudiante",
          "Cédula",
          "Dirección IP",
          "Fecha y Hora"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}