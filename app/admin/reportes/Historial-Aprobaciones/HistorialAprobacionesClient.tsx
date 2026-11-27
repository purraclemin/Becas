"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Calendar,
  UserCheck,
  FileText,
  BookOpen,
  AlertCircle,
  X,
  RefreshCw,
  RotateCcw,
  Award,
  Building2
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import { esEgresadoPorSemestre } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import {
  obtenerReporteHistorialAprobaciones,
  type HistorialAprobacionItem,
  type RespuestaHistorialAprobaciones
} from "./actions"

const formatearTrimestreHistorial = (trimestre: number): string => {
  if (esEgresadoPorSemestre(trimestre)) return "Egresado"
  return `${trimestre}° Trim.`
}

interface MateriaSnapshotItem {
  codigo?: string
  nombre?: string
  nota?: number | string
}

interface MateriasSnapshotParsed {
  trimestre?: number | string
  materias?: MateriaSnapshotItem[]
}

interface HistorialAprobacionesClientProps {
  initialData: RespuestaHistorialAprobaciones
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Aprobada":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "Rechazada":
      return "bg-rose-100 text-rose-700 border-rose-200"
    case "Finalizada":
      return "bg-teal-100 text-teal-800 border-teal-300"
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

const parsearMateriasSnapshot = (raw: string | null): MateriasSnapshotParsed | null => {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return { materias: parsed as MateriaSnapshotItem[] }
    }
    if (parsed && typeof parsed === "object") {
      return parsed as MateriasSnapshotParsed
    }
    return null
  } catch {
    return null
  }
}

export function HistorialAprobacionesClient({
  initialData
}: HistorialAprobacionesClientProps) {
  const router = useRouter()
  const [historial, setHistorial] = useState<HistorialAprobacionItem[]>(initialData.data)
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)

  const [filtros, setFiltros] = useState<{
    fechaInicio: string
    fechaFin: string
    search: string
  }>({
    fechaInicio: "",
    fechaFin: "",
    search: ""
  })

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (params: { fechaInicio: string; fechaFin: string; search: string }) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteHistorialAprobaciones({
          fechaDesde: params.fechaInicio || undefined,
          fechaHasta: params.fechaFin || undefined,
          search: params.search || undefined
        })

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setHistorial(res.data)
        }
      } catch (error) {
        console.error("Error al actualizar historial de decisiones:", error)
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

    if (filtros.fechaInicio && filtros.fechaFin && filtros.fechaInicio > filtros.fechaFin) {
      setAvisoFecha("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")
      return
    }

    setAvisoFecha(null)
    const delay = filtros.search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(filtros)
    }, delay)

    return () => clearTimeout(timer)
  }, [filtros, cargarDatos])

  const toggleRow = (id: number) => {
    setExpandedRow((prev) => (prev === id ? null : id))
  }

  const handleLimpiarFiltros = () => {
    setFiltros({ fechaInicio: "", fechaFin: "", search: "" })
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

  const abrirAuditoria = useCallback(
    (cedula: string) => {
      const cedulaLimpia = String(cedula || "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=reportes-historial`
      )
    },
    [router]
  )

  const mapearFilaXLSX = useCallback((reg: HistorialAprobacionItem): CeldaXLSX[] => {
    const fecha = formatearFecha(reg.fecha_aprobacion)
    const hora = formatearHora(reg.fecha_aprobacion)
    const etiquetaMovimiento = reg.es_cambio_departamento
      ? reg.departamento_anterior && reg.departamento_nuevo
        ? `CAMBIO DE DEPTO.: ${reg.departamento_anterior} → ${reg.departamento_nuevo}`
        : "CAMBIO DE DEPARTAMENTO"
      : `${reg.estatus_previo.toUpperCase()} → ${reg.estatus_nuevo.toUpperCase()}`

    return [
      `${fecha}${hora ? ` ${hora}` : ""}`,
      `${reg.nombre} ${reg.apellido}`.trim().toUpperCase(),
      `V-${reg.cedula}`,
      reg.carrera.toUpperCase(),
      reg.tipo_beca_snapshot.toUpperCase(),
      `${reg.periodo_codigo} — ${reg.periodo_nombre}`,
      reg.es_cambio_departamento ? "CAMBIO DE DEPTO." : reg.estatus_previo.toUpperCase(),
      etiquetaMovimiento,
      Number(reg.promedio_ciclo),
      reg.puntaje_baremo,
      reg.observacion_admin || "---",
    ]
  }, [])

  const hayFiltrosActivos =
    filtros.search.trim() !== "" ||
    filtros.fechaInicio !== "" ||
    filtros.fechaFin !== ""

  const etiquetaRango =
    filtros.fechaInicio && filtros.fechaFin
      ? ` | Rango: ${filtros.fechaInicio} al ${filtros.fechaFin}`
      : filtros.fechaInicio
        ? ` | Desde: ${filtros.fechaInicio}`
        : filtros.fechaFin
          ? ` | Hasta: ${filtros.fechaFin}`
          : ""

  const subtituloReporte = `Orden cronológico (más reciente primero) — Total: ${historial.length}${etiquetaRango}${
    filtros.search.trim() ? ` | Filtro: "${filtros.search.trim()}"` : ""
  }`

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Historial de Decisiones"
          subtitulo={`Bitácora cronológica de aprobaciones y cambios — Total: ${historial.length}`}
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
              htmlFor="buscar-historial"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Buscar Estudiante, Cédula, Estatus o Departamento</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-historial"
                type="text"
                value={filtros.search}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Nombre, apellido, cédula, estatus o departamento..."
                className="w-full h-12 md:h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] placeholder:text-slate-400 placeholder:font-medium outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
              />
              {filtros.search && (
                <button
                  type="button"
                  onClick={() => setFiltros((prev) => ({ ...prev, search: "" }))}
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
              htmlFor="historial-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="historial-desde"
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
              }
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="historial-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="historial-hasta"
              type="date"
              value={filtros.fechaFin}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
              }
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
              onClick={() => void cargarDatos(filtros)}
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
        {historial.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No se encontraron registros de historial para los criterios actuales.
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
                    <th className="px-3.5 py-2.5">Periodo / Modalidad</th>
                    <th className="px-3.5 py-2.5">Movimiento / Estatus</th>
                    <th className="px-3.5 py-2.5 text-center">Prom. / Baremo</th>
                    <th className="px-3.5 py-2.5">Fecha y Hora</th>
                    <th className="px-3.5 py-2.5 text-right">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {historial.map((reg) => {
                    const materiasData = parsearMateriasSnapshot(reg.materias_snapshot_json)
                    const abierto = expandedRow === reg.id

                    return (
                      <React.Fragment key={reg.id}>
                        <tr
                          onClick={() => abrirAuditoria(reg.cedula)}
                          title="Abrir panel de auditoría del estudiante"
                          className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                            abierto ? "bg-blue-50/40" : ""
                          }`}
                        >
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center shrink-0">
                                <UserCheck className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                                  {reg.nombre} {reg.apellido}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono font-bold mt-0.5">
                                  V-{reg.cedula} • {formatearTrimestreHistorial(reg.trimestre)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3.5 py-2.5">
                            <span className="inline-block font-black text-[#1e3a5f] uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                              {reg.periodo_codigo} — {reg.periodo_nombre}
                            </span>
                            <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 flex items-center gap-1 max-w-[220px] truncate">
                              <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
                              <span>{reg.tipo_beca_snapshot}</span>
                            </p>
                          </td>

                          <td className="px-3.5 py-2.5">
                            {reg.es_cambio_departamento ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase bg-indigo-50 text-indigo-800 border-indigo-200 shadow-2xs">
                                  <Building2 className="h-3 w-3 text-[#d4a843]" />
                                  <span>Cambio de Depto.</span>
                                </span>
                                {reg.departamento_anterior && reg.departamento_nuevo && (
                                  <p className="text-[10px] font-bold text-[#1e3a5f] leading-snug max-w-[250px]">
                                    <span className="text-slate-500">{reg.departamento_anterior}</span>
                                    <span className="mx-1 text-[#d4a843] font-black">→</span>
                                    <span>{reg.departamento_nuevo}</span>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border opacity-75 ${getStatusColor(
                                    reg.estatus_previo
                                  )}`}
                                >
                                  {reg.estatus_previo}
                                </span>
                                <span className="text-slate-400 font-bold">→</span>
                                <span
                                  className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase shadow-2xs ${getStatusColor(
                                    reg.estatus_nuevo
                                  )}`}
                                >
                                  {reg.estatus_nuevo}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="px-3.5 py-2.5 text-center">
                            <span className="text-xs font-mono font-black text-emerald-700 block">
                              {reg.promedio_ciclo}
                            </span>
                            <span className="text-[9px] font-black text-[#1e3a5f] bg-slate-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {reg.puntaje_baremo} pts
                            </span>
                          </td>

                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <p className="font-mono font-bold text-slate-700 text-xs">
                              {formatearFecha(reg.fecha_aprobacion)}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono font-bold mt-0.5">
                              {formatearHora(reg.fecha_aprobacion)}
                            </p>
                          </td>

                          <td className="px-3.5 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleRow(reg.id)
                                }}
                                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                  abierto
                                    ? "bg-[#1e3a5f] text-[#d4a843]"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                                title="Ver detalle académico y nota inline"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  abrirAuditoria(reg.cedula)
                                }}
                                className="h-8 px-2.5 rounded-lg bg-blue-50 text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white border border-blue-200/80 flex items-center justify-center gap-1 transition-colors cursor-pointer text-[10px] font-black uppercase"
                                title="Ver observación en Panel de Auditoría"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Ver Observación</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {abierto && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-5 py-4 bg-[#f8fafc] border-l-4 border-[#1e3a5f]"
                            >
                              <div className="space-y-3 animate-in fade-in duration-200">
                                {materiasData &&
                                Array.isArray(materiasData.materias) &&
                                materiasData.materias.length > 0 ? (
                                  <div>
                                    <div className="flex items-center gap-2 mb-2.5">
                                      <div className="w-1 h-3 bg-[#d4a843] rounded-full" />
                                      <h4 className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">
                                        Carga Académica Registrada{" "}
                                        {materiasData.trimestre
                                          ? `(Trimestre ${materiasData.trimestre})`
                                          : ""}
                                      </h4>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {materiasData.materias.map((mat, i) => (
                                        <div
                                          key={i}
                                          className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs"
                                        >
                                          <div className="flex flex-col overflow-hidden mr-2">
                                            <span className="text-[8px] text-slate-400 font-bold uppercase truncate">
                                              {mat.codigo || "N/A"}
                                            </span>
                                            <span
                                              className="text-[10px] font-black text-slate-700 uppercase truncate"
                                              title={mat.nombre || ""}
                                            >
                                              {mat.nombre || "Asignatura"}
                                            </span>
                                          </div>
                                          <div className="bg-slate-100 px-2 py-1 rounded text-[#1e3a5f] font-mono font-black text-xs shrink-0 border border-slate-200">
                                            {mat.nota ?? "0"}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-slate-400 py-1">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-bold uppercase italic">
                                      Sin detalle de materias capturado en esta acción.
                                    </span>
                                  </div>
                                )}

                                {reg.observacion_admin && (
                                  <div className="p-3 bg-white rounded-lg border border-slate-200 border-l-4 border-l-[#d4a843]">
                                    <p className="text-[9px] font-black text-[#1e3a5f] uppercase mb-1">
                                      Nota Administrativa:
                                    </p>
                                    <p className="text-xs text-slate-600 font-medium italic">
                                      &ldquo;{reg.observacion_admin}&rdquo;
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* TARJETAS MÓVIL (Table-to-Cards) */}
            <div className="md:hidden space-y-3">
              {historial.map((reg) => {
                const abierto = expandedRow === reg.id
                const materiasData = parsearMateriasSnapshot(reg.materias_snapshot_json)

                return (
                  <div
                    key={`mob-${reg.id}`}
                    onClick={() => abrirAuditoria(reg.cedula)}
                    className="bg-white rounded-xl border border-slate-200 hover:border-[#1e3a5f]/50 p-4 shadow-sm space-y-2.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                          {reg.nombre} {reg.apellido}
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                          V-{reg.cedula} • {reg.periodo_codigo}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-mono font-bold text-slate-700">
                          {formatearFecha(reg.fecha_aprobacion)}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {formatearHora(reg.fecha_aprobacion)}
                        </p>
                      </div>
                    </div>

                    {reg.es_cambio_departamento ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase bg-indigo-50 text-indigo-800 border-indigo-200">
                          <Building2 className="h-3 w-3 text-[#d4a843]" />
                          <span>Cambio de Departamento</span>
                        </span>
                        {reg.departamento_anterior && reg.departamento_nuevo && (
                          <p className="text-xs font-bold text-[#1e3a5f]">
                            <span className="text-slate-500">{reg.departamento_anterior}</span>
                            <span className="mx-1.5 text-[#d4a843]">→</span>
                            <span>{reg.departamento_nuevo}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border opacity-75 ${getStatusColor(
                            reg.estatus_previo
                          )}`}
                        >
                          {reg.estatus_previo}
                        </span>
                        <span className="text-slate-400 font-bold">→</span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${getStatusColor(
                            reg.estatus_nuevo
                          )}`}
                        >
                          {reg.estatus_nuevo}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200">
                        <span className="block text-[9px] font-black text-slate-400 uppercase">
                          Promedio
                        </span>
                        <span className="text-sm font-mono font-black text-emerald-700">
                          {reg.promedio_ciclo}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200">
                        <span className="block text-[9px] font-black text-slate-400 uppercase">
                          Baremo
                        </span>
                        <span className="text-sm font-black text-[#1e3a5f]">
                          {reg.puntaje_baremo} pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleRow(reg.id)
                        }}
                        className="h-11 rounded-lg bg-[#f8fafc] border border-slate-200 text-xs font-black uppercase text-[#1e3a5f] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5 text-[#d4a843]" />
                        <span>{abierto ? "Ocultar" : "Materias"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          abrirAuditoria(reg.cedula)
                        }}
                        className="h-11 rounded-lg bg-[#1e3a5f] text-white text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#d4a843]" />
                        <span>Ver Observación</span>
                      </button>
                    </div>

                    {abierto && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-2 border-t border-slate-100 space-y-2"
                      >
                        {materiasData &&
                        Array.isArray(materiasData.materias) &&
                        materiasData.materias.length > 0 ? (
                          <div className="space-y-1.5">
                            {materiasData.materias.map((mat, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center bg-[#f8fafc] p-2 rounded-lg border border-slate-200 text-xs"
                              >
                                <span className="font-bold text-slate-700 uppercase truncate mr-2">
                                  {mat.nombre || "Asignatura"}
                                </span>
                                <span className="font-mono font-black text-[#1e3a5f] shrink-0">
                                  {mat.nota ?? "0"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">
                            Sin materias registradas en este evento.
                          </p>
                        )}

                        {reg.observacion_admin && (
                          <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/70">
                            &ldquo;{reg.observacion_admin}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<HistorialAprobacionItem>
        titulo="Historial de Decisiones"
        subtitulo={subtituloReporte}
        columnas={[
          "Estudiante / Cédula",
          "Periodo / Modalidad",
          "Movimiento / Estatus",
          "Prom. / Baremo",
          "Fecha y Hora"
        ]}
        datos={historial}
        renderFila={(reg, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {reg.nombre} {reg.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{reg.cedula}</span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="font-semibold block">{reg.periodo_nombre}</span>
              <span className="text-[8px] text-slate-600 uppercase">{reg.tipo_beca_snapshot}</span>
            </td>
            <td className="p-1.5 border border-slate-400">
              {reg.es_cambio_departamento ? (
                <div>
                  <span className="font-bold text-indigo-800 uppercase block text-[8px]">
                    CAMBIO DE DEPARTAMENTO
                  </span>
                  {reg.departamento_anterior && reg.departamento_nuevo && (
                    <span className="text-[8px] text-slate-700">
                      {reg.departamento_anterior} → {reg.departamento_nuevo}
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <span className="font-semibold text-slate-700">{reg.estatus_previo}</span> →{" "}
                  <span className="font-bold text-[#1e3a5f]">{reg.estatus_nuevo}</span>
                </>
              )}
            </td>
            <td className="p-1.5 border border-slate-400 text-center font-bold">
              <span className="block">{reg.promedio_ciclo}</span>
              <span className="text-[8px] text-slate-600">{reg.puntaje_baremo} pts</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px] font-semibold">
              {formatearFecha(reg.fecha_aprobacion)} {formatearHora(reg.fecha_aprobacion)}
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<HistorialAprobacionItem>
        ref={xlsxRef}
        titulo="Historial de Decisiones"
        subtitulo={subtituloReporte}
        nombreHoja="Historial_Decisiones"
        nombreArchivo="historial_decisiones_unimar"
        columnas={[
          "Fecha y Hora",
          "Estudiante",
          "Cédula",
          "Carrera",
          "Modalidad",
          "Periodo",
          "Tipo / Estatus Previo",
          "Movimiento / Estatus Nuevo",
          "Promedio",
          "Baremo",
          "Observación"
        ]}
        datos={historial}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}
