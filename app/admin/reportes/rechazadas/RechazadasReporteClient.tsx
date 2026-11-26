"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Search,
  X,
  Calendar,
  UserX,
  GraduationCap,
  Award,
  RefreshCw,
  AlertCircle,
  RotateCcw
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import {
  obtenerReporteRechazadas,
  type ReporteRechazadaItem,
  type RespuestaReporteRechazadas
} from "./actions"

interface RechazadasReporteClientProps {
  initialData: RespuestaReporteRechazadas
}

const formatearFecha = (fechaIso: string): string => {
  if (!fechaIso) return "---"
  const parsed = new Date(fechaIso)
  if (Number.isNaN(parsed.getTime())) return fechaIso
  return parsed.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function RechazadasReporteClient({
  initialData
}: RechazadasReporteClientProps) {
  const [data, setData] = useState<ReporteRechazadaItem[]>(initialData.data)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)
  const [search, setSearch] = useState<string>("")
  const [range, setRange] = useState<{ inicio: string; fin: string }>({
    inicio: "",
    fin: ""
  })
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (inicio: string, fin: string, termino: string) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteRechazadas({
          inicio: inicio && fin ? inicio : undefined,
          fin: inicio && fin ? fin : undefined,
          search: termino || undefined
        })

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setData(res.data)
        }
      } catch (error) {
        console.error("Error al actualizar becas rechazadas:", error)
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

  const mapearFilaXLSX = useCallback((item: ReporteRechazadaItem): CeldaXLSX[] => {
    return [
      `${item.nombre} ${item.apellido}`.trim().toUpperCase(),
      `V-${item.cedula}`,
      item.tipo_beca.toUpperCase(),
      item.carrera.toUpperCase(),
      `${item.semestre}°`,
      Number(item.promedio_notas),
      Number(item.indice_global),
      item.puntaje_baremo !== null ? item.puntaje_baremo : "Sin estudio",
      item.motivo_rechazo,
      item.periodo.toUpperCase(),
      formatearFecha(item.fecha_rechazo),
    ]
  }, [])

  const hayFiltrosActivos =
    search.trim() !== "" || range.inicio !== "" || range.fin !== ""

  const subtituloReporte = `${
    range.inicio && range.fin
      ? `Periodo de rechazo: ${range.inicio} al ${range.fin}`
      : "Registro integral de solicitudes rechazadas y pérdidas de beneficio"
  } — Total: ${data.length}${search.trim() ? ` | Filtro: "${search.trim()}"` : ""}`

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON BOTÓN ESTANDARIZADO DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Reporte: Becas Rechazadas"
          subtitulo={`Solicitudes no admitidas y suspensiones definitivas — Total: ${data.length}`}
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
              htmlFor="buscar-rechazadas"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Nombre, Cédula, Carrera o Beca</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-rechazadas"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar estudiante rechazado..."
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
              htmlFor="rechazadas-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="rechazadas-desde"
              type="date"
              value={range.inicio}
              onChange={(e) => setRange((prev) => ({ ...prev, inicio: e.target.value }))}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="rechazadas-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="rechazadas-hasta"
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

      {/* CONTENEDOR DE DATOS (TABLA PC / TABLE-TO-CARDS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        <div className="hidden md:flex px-4 py-2.5 border-b bg-[#f8fafc] justify-between items-center">
          <div className="flex items-center gap-2">
            <UserX className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
              Solicitudes Rechazadas Registradas: {data.length}
            </span>
          </div>
        </div>

        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No se encontraron becas rechazadas con los criterios seleccionados.
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
                    <th className="px-3.5 py-2.5">Carrera / Programa</th>
                    <th className="px-3.5 py-2.5 text-center">Prom. / Global</th>
                    <th className="px-3.5 py-2.5">Motivo / Observación</th>
                    <th className="px-3.5 py-2.5 text-right">F. Rechazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => (
                    <tr
                      key={row.solicitud_id}
                      className="hover:bg-rose-50/20 transition-colors"
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center shrink-0">
                            <UserX className="h-4 w-4" />
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
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-[#1e3a5f] uppercase">
                            <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                            {row.tipo_beca}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-[8px] font-black text-rose-700 uppercase">
                            {row.periodo_codigo}
                          </span>
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 text-center">
                        <span className="text-xs font-mono font-black text-rose-700 tabular-nums block">
                          {row.promedio_notas}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                          G: {row.indice_global}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <p
                          className="text-[11px] text-slate-600 italic max-w-xs line-clamp-2"
                          title={row.motivo_rechazo}
                        >
                          &ldquo;{row.motivo_rechazo}&rdquo;
                        </p>
                      </td>

                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-600 whitespace-nowrap">
                        {formatearFecha(row.fecha_rechazo)}
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
                        V-{row.cedula} • {row.semestre}° Trimestre
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black uppercase shrink-0">
                      {formatearFecha(row.fecha_rechazo)}
                    </span>
                  </div>

                  <p className="text-xs font-black text-[#1e3a5f] uppercase flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                    <span>{row.tipo_beca}</span>
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
                    <span className="uppercase">{row.carrera}</span>
                    <span className="font-mono text-rose-700 font-black">
                      Prom: {row.promedio_notas}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-rose-50/40 p-2.5 rounded-lg border border-rose-100">
                    &ldquo;{row.motivo_rechazo}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ReporteRechazadaItem>
        titulo="Reporte: Becas Rechazadas"
        subtitulo={subtituloReporte}
        columnas={[
          "Estudiante / Cédula",
          "Carrera / Programa",
          "Prom. / Global",
          "Motivo / Observación",
          "F. Rechazo"
        ]}
        datos={data}
        renderFila={(item, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">
                V-{item.cedula} • {item.semestre}° Trim.
              </span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{item.carrera}</span>
              <span className="text-[8px] text-slate-600 font-bold">
                {item.tipo_beca} ({item.periodo_codigo})
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{item.promedio_notas}</span>
              <span className="text-[8px] text-slate-600">G: {item.indice_global}</span>
            </td>
            <td className="p-1.5 border border-slate-400 italic text-slate-700">
              {item.motivo_rechazo}
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px] font-bold uppercase">
              {formatearFecha(item.fecha_rechazo)}
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ReporteRechazadaItem>
        ref={xlsxRef}
        titulo="Reporte: Becas Rechazadas"
        subtitulo={subtituloReporte}
        nombreHoja="Becas_Rechazadas"
        nombreArchivo="becas_rechazadas_unimar"
        columnas={[
          "Estudiante",
          "Cédula",
          "Programa",
          "Carrera",
          "Trimestre",
          "Prom. Trimestral",
          "Índice Global",
          "Puntaje Baremo",
          "Motivo / Observación",
          "Periodo",
          "F. Rechazo"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}