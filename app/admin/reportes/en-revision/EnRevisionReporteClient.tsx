"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  X,
  Loader2,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  Award,
  ShieldCheck,
  Layers,
  MailCheck,
  Calendar,
  RotateCcw,
  AlertCircle
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
  obtenerReporteEnRevision,
  enviarReporteEnRevisionSecretaria,
  type ExpedienteEnRevisionItem,
  type ResumenCupoModalidad,
  type PeriodoResumenBasico,
  type RespuestaReporteEnRevision
} from "./actions"

const MAX_EXPEDIENTES_POR_TIPO_BECA = 5

const formatearTrimestreRevision = (semestre: number, corto: boolean = false): string => {
  if (esEgresadoPorSemestre(semestre)) return "Egresado"
  return corto ? `${semestre}°` : `${semestre}° Trimestre`
}
import { CARRERAS_UNIMAR_LIST } from "@/components/registro/validations"
import { MODALIDADES_BECA_OFICIALES } from "@/lib/RecordAcademicoUtils"

interface EnRevisionReporteClientProps {
  initialData: RespuestaReporteEnRevision
}

interface FeedbackEnvio {
  tipo: "success" | "error"
  mensaje: string
  fecha?: string
}

const getRiesgoBadgeStyle = (nivel: string | null | undefined): string => {
  const n = String(nivel || "").trim().toLowerCase()
  if (n.includes("crít") || n.includes("crit")) {
    return "bg-rose-100 text-rose-800 border-rose-200"
  }
  if (n.includes("alto")) {
    return "bg-orange-100 text-orange-800 border-orange-200"
  }
  if (n.includes("medio")) {
    return "bg-amber-100 text-amber-800 border-amber-200"
  }
  if (n.includes("bajo")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200"
  }
  return "bg-slate-100 text-slate-600 border-slate-200"
}

export function EnRevisionReporteClient({
  initialData
}: EnRevisionReporteClientProps) {
  const router = useRouter()
  const [data, setData] = useState<ExpedienteEnRevisionItem[]>(initialData.data)
  const [cuposResumen, setCuposResumen] = useState<ResumenCupoModalidad[]>(
    initialData.cuposResumen
  )
  const [periodoActual, setPeriodoActual] = useState<PeriodoResumenBasico | null>(
    initialData.periodoActual
  )
  const [actualizando, setActualizando] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  const [search, setSearch] = useState<string>("")
  const [carrera, setCarrera] = useState<string>("")
  const [tipoBeca, setTipoBeca] = useState<string>("")
  const [fechaDesde, setFechaDesde] = useState<string>("")
  const [fechaHasta, setFechaHasta] = useState<string>("")
  const [avisoFecha, setAvisoFecha] = useState<string | null>(null)

  const [confirmandoEnvio, setConfirmandoEnvio] = useState<boolean>(false)
  const [enviandoCorreo, setEnviandoCorreo] = useState<boolean>(false)
  const [feedbackEnvio, setFeedbackEnvio] = useState<FeedbackEnvio | null>(null)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (
      termino: string,
      carreraFiltro: string,
      tipoBecaFiltro: string,
      desde: string,
      hasta: string
    ) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerReporteEnRevision({
          search: termino || undefined,
          carrera: carreraFiltro || undefined,
          tipoBeca: tipoBecaFiltro || undefined,
          fechaDesde: desde || undefined,
          fechaHasta: hasta || undefined,
        })

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setData(res.data)
          setCuposResumen(res.cuposResumen)
          setPeriodoActual(res.periodoActual)
        }
      } catch (error) {
        console.error("Error al actualizar reporte En Revisión:", error)
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

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
      setAvisoFecha("La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.")
      return
    }

    setAvisoFecha(null)
    const delay = search.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(search, carrera, tipoBeca, fechaDesde, fechaHasta)
    }, delay)

    return () => clearTimeout(timer)
  }, [search, carrera, tipoBeca, fechaDesde, fechaHasta, cargarDatos])

  const hayFiltrosActivos =
    search.trim() !== "" ||
    carrera !== "" ||
    tipoBeca !== "" ||
    fechaDesde !== "" ||
    fechaHasta !== ""

  const handleLimpiarFiltros = () => {
    setSearch("")
    setCarrera("")
    setTipoBeca("")
    setFechaDesde("")
    setFechaHasta("")
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

  const handleConfirmarEnvioSecretaria = async () => {
    setEnviandoCorreo(true)
    setFeedbackEnvio(null)

    try {
      const res = await enviarReporteEnRevisionSecretaria({
        search: search || undefined,
        carrera: carrera || undefined,
        tipoBeca: tipoBeca || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      })

      if (res.success) {
        setFeedbackEnvio({
          tipo: "success",
          mensaje:
            res.message ||
            "Reporte enviado correctamente al correo de Secretaría General.",
          fecha: res.fechaEnvio
        })
        setConfirmandoEnvio(false)
      } else {
        setFeedbackEnvio({
          tipo: "error",
          mensaje: res.error || "No se pudo completar el envío por correo electrónico."
        })
      }
    } catch {
      setFeedbackEnvio({
        tipo: "error",
        mensaje: "Error de comunicación al intentar enviar el correo a Secretaría General."
      })
    } finally {
      setEnviandoCorreo(false)
    }
  }

  const mapearFilaXLSX = useCallback((row: ExpedienteEnRevisionItem): CeldaXLSX[] => {
    const pEst = row.puntaje_estudiante
    const pAdm = row.puntaje_admin
    const diff = pEst !== null && pAdm !== null ? pAdm - pEst : null

    return [
      row.nombre.toUpperCase() || "---",
      row.apellido.toUpperCase() || "---",
      `V-${row.cedula}`,
      row.tipo_beca.toUpperCase(),
      row.carrera.toUpperCase(),
      formatearTrimestreRevision(row.semestre, true).toUpperCase(),
      Number(row.promedio_notas),
      Number(row.indice_global),
      pEst !== null ? pEst : "Sin estudio",
      pAdm !== null ? pAdm : "Pendiente",
      diff !== null ? (diff > 0 ? `+${diff}` : String(diff)) : "---",
      String(row.nivel_riesgo_admin || "Pendiente").toUpperCase(),
      String(row.periodo_origen_codigo || "---").toUpperCase(),
      row.observaciones_admin || "---"
    ]
  }, [])

  const periodoSubtitulo = useMemo<string>(() => {
    return periodoActual
      ? `${periodoActual.codigo} (${periodoActual.nombre})`
      : "Periodo Vigente"
  }, [periodoActual])

  const filtrosActivosTexto = useMemo<string>(() => {
    const rango =
      fechaDesde && fechaHasta
        ? `Rango: ${fechaDesde} al ${fechaHasta}`
        : fechaDesde
          ? `Desde: ${fechaDesde}`
          : fechaHasta
            ? `Hasta: ${fechaHasta}`
            : null

    return [
      search.trim() ? `Búsqueda: "${search.trim()}"` : null,
      carrera ? `Carrera: ${carrera}` : null,
      tipoBeca ? `Modalidad: ${tipoBeca}` : null,
      rango,
    ]
      .filter((item): item is string => Boolean(item))
      .join(" | ")
  }, [search, carrera, tipoBeca, fechaDesde, fechaHasta])

  // Calcula el lote exacto Top 5 por cada tipo de beca (1° Promedio DESC, 2° Puntaje Baremo DESC)
  const resumenEnvioTop5 = useMemo(() => {
    const grupos = new Map<string, ExpedienteEnRevisionItem[]>()
    for (const item of data) {
      const clave = item.tipo_beca || "No especificado"
      const lista = grupos.get(clave) ?? []
      lista.push(item)
      grupos.set(clave, lista)
    }

    const porModalidad = Array.from(grupos.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "es"))
      .map(([modalidad, lista]) => {
        const ordenados = [...lista].sort((a, b) => {
          const promDiff = (parseFloat(b.promedio_notas) || 0) - (parseFloat(a.promedio_notas) || 0)
          if (Math.abs(promDiff) >= 0.005) return promDiff

          const baremoA = a.puntaje_admin ?? a.puntaje_estudiante ?? -1
          const baremoB = b.puntaje_admin ?? b.puntaje_estudiante ?? -1
          if (baremoB !== baremoA) return baremoB - baremoA

          const globalDiff = (parseFloat(b.indice_global) || 0) - (parseFloat(a.indice_global) || 0)
          if (Math.abs(globalDiff) >= 0.005) return globalDiff

          return a.apellido.localeCompare(b.apellido, "es")
        })

        return {
          modalidad,
          enviados: Math.min(ordenados.length, MAX_EXPEDIENTES_POR_TIPO_BECA),
          total: ordenados.length,
        }
      })

    const totalAEnviar = porModalidad.reduce((acc, m) => acc + m.enviados, 0)
    return {
      porModalidad,
      totalModalidades: porModalidad.length,
      totalAEnviar,
      recortado: totalAEnviar < data.length,
    }
  }, [data])

  const abrirAuditoria = useCallback(
    (cedula: string) => {
      const cedulaLimpia = String(cedula || "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=reportes-en-revision`
      )
    },
    [router]
  )

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Expedientes En Revisión"
          subtitulo={`Remisión a Secretaría General — ${periodoSubtitulo}`}
          mostrarExportar={true}
          onExportPDF={handleImprimirPDF}
          onExportXLSX={handleExportarXLSX}
          exportandoXlsx={exportandoXlsx}
        />
      </div>

      {/* BARRA DE REMISIÓN DIRECTA A SECRETARÍA GENERAL */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 md:h-9 md:w-9 rounded-lg bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="h-5 w-5 md:h-4 md:w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider leading-tight">
                  Lote listo para dictamen ({data.length} expediente{data.length === 1 ? "" : "s"})
                </p>
                {data.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-[#d4a843]/60 text-[10px] md:text-[9px] font-black text-[#1e3a5f] uppercase">
                    Correo: Top por beca ({resumenEnvioTop5.totalAEnviar} de {data.length})
                  </span>
                )}
              </div>

            </div>
          </div>

          <button
            type="button"
            disabled={enviandoCorreo || data.length === 0}
            onClick={() => {
              setFeedbackEnvio(null)
              setConfirmandoEnvio((prev) => !prev)
            }}
            className="w-full md:w-auto h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Send className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0" />
            <span>Enviar a Secretaría General</span>
          </button>
        </div>

        {confirmandoEnvio && (
          <div className="p-3.5 md:p-3 rounded-xl bg-amber-50 border border-[#d4a843]/50 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5 min-w-0">
              <MailCheck className="h-5 w-5 md:h-4 md:w-4 text-[#1e3a5f] shrink-0 mt-0.5" />
              <div className="min-w-0 space-y-1.5">
                <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wide">
                  ¿Confirmar envío oficial a Secretaría General?
                </p>
                <p className="text-xs md:text-[11px] text-slate-600 font-medium leading-snug">
                  Se enviarán los primeros <strong>{MAX_EXPEDIENTES_POR_TIPO_BECA} expedientes por cada tipo de beca</strong>:{" "}
                  <strong>{resumenEnvioTop5.totalAEnviar} expediente(s)</strong> en{" "}
                  <strong>{resumenEnvioTop5.totalModalidades} modalidad(es)</strong>
                  {resumenEnvioTop5.recortado ? ` (de ${data.length} en revisión)` : ""}, ordenados por{" "}
                  <strong>1° Promedio y 2° Baremo</strong>, en tabla HTML junto al resumen de cupos y el libro <strong>.xlsx</strong> adjunto.
                </p>
                {resumenEnvioTop5.porModalidad.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {resumenEnvioTop5.porModalidad.map((m) => (
                      <span
                        key={m.modalidad}
                        className="px-2 py-0.5 rounded bg-white border border-[#d4a843]/40 text-[10px] md:text-[9px] font-black text-[#1e3a5f] uppercase"
                      >
                        {m.modalidad}: {m.enviados}/{m.total}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 justify-end">
              <button
                type="button"
                disabled={enviandoCorreo}
                onClick={() => setConfirmandoEnvio(false)}
                className="h-12 md:h-9 px-4 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm md:text-xs font-bold uppercase cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={enviandoCorreo}
                onClick={() => void handleConfirmarEnvioSecretaria()}
                className="h-12 md:h-9 px-4 rounded-lg bg-[#d4a843] hover:bg-[#c2973b] text-[#1e3a5f] text-sm md:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {enviandoCorreo ? (
                  <>
                    <Loader2 className="h-4 w-4 md:h-3.5 md:w-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Confirmar Envío</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {feedbackEnvio && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-start justify-between gap-3 animate-in fade-in duration-200 ${
              feedbackEnvio.tipo === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-start gap-2">
              {feedbackEnvio.tipo === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p>{feedbackEnvio.mensaje}</p>
                {feedbackEnvio.fecha && (
                  <p className="text-[10px] text-emerald-700/80 font-semibold mt-0.5">
                    Hora de despacho: {feedbackEnvio.fecha}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackEnvio(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* RESUMEN EJECUTIVO DE CUPOS POR MODALIDAD */}
      {cuposResumen.length > 0 && (
        <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#d4a843]" />
            <h3 className="text-[10px] md:text-[9px] font-black text-[#1e3a5f] uppercase tracking-widest">
              Disponibilidad de Cupos del Periodo Vigente ({periodoActual?.codigo || "Actual"})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {cuposResumen.map((c) => {
              const sinCupo = c.disponibles === 0
              return (
                <div
                  key={c.modalidad}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 ${
                    sinCupo
                      ? "bg-rose-50/50 border-rose-200"
                      : "bg-[#f8fafc] border-slate-200"
                  }`}
                >
                  <p className="text-xs md:text-[10px] font-black text-[#1e3a5f] uppercase leading-tight line-clamp-2">
                    {c.modalidad}
                  </p>
                  <div className="flex items-center justify-between text-[11px] md:text-[10px] font-bold pt-1 border-t border-slate-200/70">
                    <span className="text-blue-700">En Revisión: {c.enRevisionLote}</span>
                    <span className={sinCupo ? "text-rose-700 font-black" : "text-emerald-700 font-black"}>
                      {c.disponibles !== null
                        ? `Disp: ${c.disponibles} / ${c.cupoMaximo}`
                        : "Sin tope fijo"}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS ALINEADA (UF-Scale) */}
      <div className="bg-white p-3.5 md:p-3 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="buscar-en-revision"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Nombre, Apellido o Cédula</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 pointer-events-none" />
              <input
                id="buscar-en-revision"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre, apellido o cédula..."
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

          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="filtro-carrera-en-revision"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <GraduationCap className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Carrera</span>
            </label>
            <select
              id="filtro-carrera-en-revision"
              value={carrera}
              onChange={(e) => setCarrera(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Todas las Carreras</option>
              {CARRERAS_UNIMAR_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="filtro-beca-en-revision"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Award className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Tipo de Beca</span>
            </label>
            <select
              id="filtro-beca-en-revision"
              value={tipoBeca}
              onChange={(e) => setTipoBeca(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Todas las Modalidades</option>
              {MODALIDADES_BECA_OFICIALES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="en-revision-desde"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Desde</span>
            </label>
            <input
              id="en-revision-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label
              htmlFor="en-revision-hasta"
              className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
            >
              <Calendar className="h-3 w-3 text-[#d4a843] shrink-0" />
              <span>Hasta</span>
            </label>
            <input
              id="en-revision-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex items-center gap-2">
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="h-12 md:h-9 px-3 rounded-lg bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                title="Restablecer filtros"
              >
                <RotateCcw className="h-4 w-4 md:h-3.5 md:w-3.5" />
                <span>Limpiar</span>
              </button>
            )}

            <button
              type="button"
              disabled={actualizando}
              onClick={() => void cargarDatos(search, carrera, tipoBeca, fechaDesde, fechaHasta)}
              className="flex-1 h-12 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
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
        {data.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 md:border-none p-12 text-center text-slate-400">
            <p className="text-sm md:text-xs font-black uppercase tracking-widest">
              No existen expedientes en estatus En Revisión para los criterios actuales.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA ESCRITORIO */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="px-3.5 py-2.5">Estudiante</th>
                    <th className="px-3.5 py-2.5">Tipo de Beca</th>
                    <th className="px-3.5 py-2.5">Carrera / Trim.</th>
                    <th className="px-3.5 py-2.5 text-center">Promedio</th>
                    <th className="px-3.5 py-2.5 text-center">Baremos (Est. / Adm.)</th>
                    <th className="px-3.5 py-2.5">Observaciones Coordinación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => {
                    const pEst = row.puntaje_estudiante
                    const pAdm = row.puntaje_admin
                    const diff = pEst !== null && pAdm !== null ? pAdm - pEst : null

                    return (
                      <tr
                        key={row.solicitud_id}
                        onClick={() => abrirAuditoria(row.cedula)}
                        title="Abrir panel de auditoría del estudiante"
                        className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      >
                        <td className="px-3.5 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f] flex items-center justify-center shrink-0">
                              <UserCheck className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-[#1e3a5f] uppercase leading-tight">
                                {row.nombre} {row.apellido}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-slate-500 font-mono font-bold">
                                  V-{row.cedula}
                                </span>
                                {row.periodo_origen_codigo && (
                                  <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[8px] font-black text-slate-500 uppercase">
                                    {row.periodo_origen_codigo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <span className="inline-flex items-center gap-1 font-black text-[#1e3a5f] uppercase text-[10px] leading-snug max-w-[200px]">
                            <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                            {row.tipo_beca}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <p className="font-bold text-slate-700 uppercase text-xs flex items-center gap-1 leading-tight">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {row.carrera}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[9px] font-black text-[#1e3a5f] uppercase">
                            {formatearTrimestreRevision(row.semestre, false)}
                          </span>
                        </td>

                        <td className="px-3.5 py-2.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-mono font-black text-emerald-700 tabular-nums">
                              {row.promedio_notas}
                            </span>
                            <span className="text-[9px] font-black text-[#d4a843] tabular-nums">
                              G: {row.indice_global}
                            </span>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                Est: {pEst !== null ? `${pEst} pts` : "N/A"}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#1e3a5f] text-[#d4a843]">
                                Adm: {pAdm !== null ? `${pAdm} pts` : "Pend."}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase ${getRiesgoBadgeStyle(
                                  row.nivel_riesgo_admin
                                )}`}
                              >
                                {row.nivel_riesgo_admin || "Sin Baremo"}
                              </span>
                              {diff !== null && diff !== 0 && (
                                <span
                                  className={`text-[9px] font-black ${
                                    Math.abs(diff) >= 15 ? "text-rose-600" : "text-slate-500"
                                  }`}
                                >
                                  Δ {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3.5 py-2.5">
                          <p
                            className="text-[11px] text-slate-600 italic max-w-[220px] line-clamp-2"
                            title={row.observaciones_admin || "Sin observaciones"}
                          >
                            {row.observaciones_admin
                              ? `"${row.observaciones_admin}"`
                              : "Sin observaciones registradas"}
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* VISTA MÓVIL (Table-to-Cards) */}
            <div className="md:hidden space-y-3">
              {data.map((row) => {
                const pEst = row.puntaje_estudiante
                const pAdm = row.puntaje_admin

                return (
                  <div
                    key={`mob-${row.solicitud_id}`}
                    onClick={() => abrirAuditoria(row.cedula)}
                    className="bg-white rounded-xl border border-slate-200 hover:border-[#1e3a5f]/50 p-4 shadow-sm space-y-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#1e3a5f] uppercase leading-snug">
                          {row.nombre} {row.apellido}
                        </p>
                        <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                          V-{row.cedula} • {formatearTrimestreRevision(row.semestre, false)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-black uppercase shrink-0 ${getRiesgoBadgeStyle(
                          row.nivel_riesgo_admin
                        )}`}
                      >
                        {row.nivel_riesgo_admin || "Pendiente"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="font-black text-[#1e3a5f] uppercase text-xs flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                        <span>{row.tipo_beca}</span>
                      </p>
                      <p className="text-sm font-bold text-slate-600 uppercase">
                        {row.carrera}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200">
                        <span className="block text-[9px] font-black text-slate-400 uppercase">
                          Promedio
                        </span>
                        <span className="text-sm font-mono font-black text-emerald-700 tabular-nums">
                          {row.promedio_notas}
                        </span>
                        <span className="block text-[9px] font-bold text-[#d4a843]">
                          G: {row.indice_global}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200 flex flex-col justify-center">
                        <span className="block text-[9px] font-black text-slate-400 uppercase">
                          Baremo Est.
                        </span>
                        <span className="text-sm font-black text-slate-700 mt-0.5">
                          {pEst !== null ? `${pEst} pts` : "N/A"}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1e3a5f] text-white flex flex-col justify-center">
                        <span className="block text-[9px] font-black text-[#d4a843] uppercase">
                          Baremo Adm.
                        </span>
                        <span className="text-sm font-black mt-0.5">
                          {pAdm !== null ? `${pAdm} pts` : "Pend."}
                        </span>
                      </div>
                    </div>

                    {row.observaciones_admin && (
                      <p className="text-xs text-slate-600 italic bg-[#f8fafc] p-2.5 rounded-lg border border-slate-100">
                        &ldquo;{row.observaciones_admin}&rdquo;
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF */}
      <PrintReportLayout<ExpedienteEnRevisionItem>
        titulo="Expedientes En Revisión — Secretaría General"
        subtitulo={`Periodo Vigente: ${periodoSubtitulo} — Total: ${data.length}${
          filtrosActivosTexto ? ` | ${filtrosActivosTexto}` : ""
        }`}
        columnas={[
          "Nombre y Apellido / Cédula",
          "Tipo de Beca",
          "Carrera / Trim.",
          "Prom. / Global",
          "Baremo (Est. / Adm.)",
          "Riesgo / Obs."
        ]}
        datos={data}
        renderFila={(row, idx) => {
          const pEst = row.puntaje_estudiante !== null ? `${row.puntaje_estudiante} pts` : "N/A"
          const pAdm = row.puntaje_admin !== null ? `${row.puntaje_admin} pts` : "Pend."

          return (
            <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">
                  {row.nombre} {row.apellido}
                </span>
                <span className="text-[8px] text-slate-500 font-semibold">V-{row.cedula}</span>
              </td>
              <td className="p-1.5 border border-slate-400 uppercase font-semibold">
                {row.tipo_beca}
              </td>
              <td className="p-1.5 border border-slate-400">
                <span className="uppercase font-semibold block">{row.carrera}</span>
                <span className="text-[8px] text-slate-600 font-bold">{formatearTrimestreRevision(row.semestre, false)}</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold">
                <span className="block">{row.promedio_notas}</span>
                <span className="text-[8px] text-slate-600">G: {row.indice_global}</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold">
                <span className="block">Est: {pEst}</span>
                <span className="block text-[#1e3a5f]">Adm: {pAdm}</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-[8px]">
                <span className="font-bold uppercase block">
                  {row.nivel_riesgo_admin || "Pendiente"}
                </span>
                <span className="italic text-slate-600">
                  {row.observaciones_admin || "---"}
                </span>
              </td>
            </tr>
          )
        }}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) */}
      <ExportReportXLSX<ExpedienteEnRevisionItem>
        ref={xlsxRef}
        titulo="Expedientes En Revisión — Secretaría General"
        subtitulo={`Periodo Vigente: ${periodoSubtitulo} — Total: ${data.length}${
          filtrosActivosTexto ? ` | ${filtrosActivosTexto}` : ""
        }`}
        nombreHoja="En_Revision"
        nombreArchivo="expedientes_en_revision_unimar"
        columnas={[
          "Nombre",
          "Apellido",
          "Cédula",
          "Tipo de Beca",
          "Carrera",
          "Trimestre",
          "Prom. Trimestral",
          "Índice Global",
          "Baremo Estudiante",
          "Baremo Admin",
          "Diferencia",
          "Nivel Riesgo",
          "Periodo Origen",
          "Observaciones Coordinación"
        ]}
        datos={data}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />
    </div>
  )
}