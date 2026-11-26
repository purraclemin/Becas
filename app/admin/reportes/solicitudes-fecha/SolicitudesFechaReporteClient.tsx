"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Calendar,
  User,
  ClipboardList,
  Clock,
  Search,
  X,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Award,
  GraduationCap
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import {
  obtenerReporteSolicitudesFecha,
  type ReporteSolicitudFechaItem,
  type RespuestaReporteSolicitudesFecha
} from "./actions"

interface SolicitudesFechaReporteClientProps {
  initialData: RespuestaReporteSolicitudesFecha
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
    timeZone: "America/Caracas",
  })
}

const getStatusStyles = (status: string): string => {
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

export function SolicitudesFechaReporteClient({
  initialData
}: SolicitudesFechaReporteClientProps) {
  const [data, setData] = useState<ReporteSolicitudFechaItem[]>(initialData.data)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)
  const [range, setRange] = useState<{ inicio: string; fin: string }>({
    inicio: "",
    fin: ""
  })
  const [search, setSearch] = useState<string>("")
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (inicio: string, fin: string, termino: string) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteSolicitudesFecha({
          inicio: inicio && fin ? inicio : undefined,
          fin: inicio && fin ? fin : undefined,
          search: termino || undefined
        })

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setData(res.data)
        }
      } catch (error) {
        console.error("Error al actualizar solicitudes por fecha:", error)
      } finally {
        if (reqId === requestIdRef.current) {
          setActualizando(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false
      return
    }

    const fechasIncompletas =
      (range.inicio !== "" && range.fin === "") ||
      (range.inicio === "" && range.fin !== "")

    if (fechasIncompletas) {
      setAvisoFecha("Seleccione ambas fechas (Desde y Hasta) para filtrar por rango.")
      return
    }

    setAvisoFecha(null)
    const delay = search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(range.inicio, range.fin, search)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, range.inicio, range.fin, cargarDatos])

  const handleLimpiarFiltros = () => {
    setSearch("")
    setRange({ inicio: "", fin: "" })
    setAvisoFecha(null)
  }

  const handleImprimirPDF = () => {
    setTimeout(() => {
      window.print()
    }, 80)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
  }

  const mapearFilaXLSX = useCallback((row: ReporteSolicitudFechaItem): CeldaXLSX[] => {
    const fecha = formatearFecha(row.fecha_registro)
    const hora = formatearHora(row.fecha_registro)
    return [
      `${fecha}${hora ? ` ${hora}` : ""}`,
      `${row.nombre} ${row.apellido}`.trim().toUpperCase(),
      `V-${row.cedula}`,
      row.carrera.toUpperCase(),
      `${row.semestre}°`,
      row.tipo_beca.toUpperCase(),
      Number(row.promedio_notas),
      Number(row.indice_global),
      row.estatus.toUpperCase(),
      `${row.periodo_codigo} — ${row.periodo_nombre}`,
    ]
  }, [])

  const hayFiltrosActivos =
    search.trim() !== "" || range.inicio !== "" || range.fin !== ""

  const subtituloReporte = `${
    range.inicio && range.fin
      ? `Periodo de registro: ${range.inicio} al ${range.fin}`
      : "Listado completo de ingresos al sistema"
  } — Total: ${data.length}${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Solicitudes por Fecha"
          subtitulo={`Listado basado en la fecha de ingreso al sistema — Total: ${data.length}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* BARRA DE FILTROS ALINEADA (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-5 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-solicitudes-fecha"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Nombre, Cédula, Carrera o Estatus</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-solicitudes-fecha"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar estudiante o estatus..."
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

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="solicitudes-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="solicitudes-desde"
              type="date"
              value={range.inicio}
              onChange={(e) => setRange((prev) => ({ ...prev, inicio: e.target.value }))}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="solicitudes-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="solicitudes-hasta"
              type="date"
              value={range.fin}
              onChange={(e) => setRange((prev) => ({ ...prev, fin: e.target.value }))}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex items-center gap-2">
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="h-12 md:h-9 px-3 rounded-lg bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                title="Restablecer filtros"
              >
                <RotateCcw className="h-4 w-4 md:h-3.5 md:w-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}

            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(range.inicio, range.fin, search)}
              className="flex-1 h-12 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                  actualizando ? "animate-spin" : ""
                }`}
              />
              <span>Refrescar</span>
            </button>
          </div>
        </div>

        {avisoFecha && (
          <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{avisoFecha}</span>
          </div>
        )}
      </div>

      {/* CONTENEDOR DE DATOS (TABLA PC / TARJETAS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        <div className="hidden md:flex px-4 py-2.5 border-b bg-[#f8fafc] justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-3.5 w-3.5 text-[#1e3a5f]" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Solicitudes Encontradas: {data.length}
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No se encontraron solicitudes con los criterios actuales.
            </p>
          </div>
        ) : (
          <>
            {/* TABLA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="px-3.5 py-2.5">Estudiante</th>
                    <th className="px-3.5 py-2.5">Carrera / Periodo</th>
                    <th className="px-3.5 py-2.5">Tipo de Beca</th>
                    <th className="px-3.5 py-2.5 text-center">Prom. / Global</th>
                    <th className="px-3.5 py-2.5 text-center">Estatus</th>
                    <th className="px-3.5 py-2.5 text-right">Fecha Ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => (
                    <tr
                      key={row.solicitud_id}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 text-[#1e3a5f] flex items-center justify-center shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                              {row.nombre} {row.apellido}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                              V-{row.cedula} • {row.semestre}° Trim.
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <p className="font-bold text-slate-700 uppercase text-xs flex items-center gap-1 leading-tight">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{row.carrera}</span>
                        </p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-black text-slate-600 uppercase">
                          {row.periodo_codigo}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#1e3a5f] uppercase max-w-[200px]">
                          <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                          <span>{row.tipo_beca}</span>
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span className="text-xs font-mono font-black text-[#1e3a5f] block">
                          {row.promedio_notas}
                        </span>
                        <span className="text-[9px] font-bold text-[#d4a843]">
                          G: {row.indice_global}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase shadow-2xs ${getStatusStyles(
                            row.estatus
                          )}`}
                        >
                          {row.estatus}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-slate-700 font-mono font-bold text-xs">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            <span>{formatearFecha(row.fecha_registro)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-mono font-bold mt-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            <span>{formatearHora(row.fecha_registro)}</span>
                          </div>
                        </div>
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
                  key={`mob-${row.solicitud_id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                        {row.nombre} {row.apellido}
                      </p>
                      <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                        V-{row.cedula} • {row.semestre}° Trim.
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase shrink-0 ${getStatusStyles(
                        row.estatus
                      )}`}
                    >
                      {row.estatus}
                    </span>
                  </div>

                  <p className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                    <span>{row.tipo_beca}</span>
                  </p>

                  <p className="text-sm font-bold text-slate-700 uppercase">
                    {row.carrera}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-mono">
                    <span>
                      Prom: <strong className="text-[#1e3a5f]">{row.promedio_notas}</strong>
                    </span>
                    <span>
                      {formatearFecha(row.fecha_registro)} {formatearHora(row.fecha_registro)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ReporteSolicitudFechaItem>
        titulo="Solicitudes por Fecha"
        subtitulo={subtituloReporte}
        columnas={[
          "Estudiante / Cédula",
          "Carrera / Periodo",
          "Tipo de Beca",
          "Prom. / Global",
          "Estatus",
          "Fecha Ingreso"
        ]}
        datos={data}
        renderFila={(row, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {row.nombre} {row.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">
                V-{row.cedula} • {row.semestre}° Trim.
              </span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{row.carrera}</span>
              <span className="text-[8px] text-slate-600 font-bold">{row.periodo_codigo}</span>
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-semibold">
              {row.tipo_beca}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{row.promedio_notas}</span>
              <span className="text-[8px] text-slate-600">G: {row.indice_global}</span>
            </td>
            <td className="p-1.5 border border-slate-400 uppercase font-bold text-center">
              {row.estatus}
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px]">
              {formatearFecha(row.fecha_registro)} {formatearHora(row.fecha_registro)}
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ReporteSolicitudFechaItem>
        ref={xlsxRef}
        titulo="Solicitudes por Fecha"
        subtitulo={subtituloReporte}
        nombreHoja="Solicitudes_Fecha"
        nombreArchivo="solicitudes_por_fecha_unimar"
        columnas={[
          "Fecha Ingreso",
          "Estudiante",
          "Cédula",
          "Carrera",
          "Trimestre",
          "Tipo de Beca",
          "Prom. Trimestral",
          "Índice Global",
          "Estatus",
          "Periodo"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}