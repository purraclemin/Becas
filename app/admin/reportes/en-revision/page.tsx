"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Search,
  X,
  Loader2,
  FileText,
  FileSpreadsheet,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  Award,
  ShieldCheck,
  Layers,
  MailCheck
} from "lucide-react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import {
  reporteEnRevision,
  enviarReporteEnRevisionSecretaria,
  type ReporteEnRevisionRow,
  type ResumenCupoModalidad,
  type PeriodoResumenBasico
} from "@/lib/ActionsReportes"
import { CARRERAS_UNIMAR_LIST } from "@/components/registro/validations"
import { MODALIDADES_BECA_OFICIALES } from "@/lib/RecordAcademicoUtils"

interface FeedbackEnvio {
  tipo: "success" | "error"
  mensaje: string
  fecha?: string
}

const formatearNota = (valor: number | string | null | undefined): string => {
  const num = Number(valor ?? 0)
  return Number.isFinite(num) ? num.toFixed(2) : "0.00"
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

export default function ReporteEnRevisionPage() {
  const [data, setData] = useState<ReporteEnRevisionRow[]>([])
  const [cuposResumen, setCuposResumen] = useState<ResumenCupoModalidad[]>([])
  const [periodoActual, setPeriodoActual] = useState<PeriodoResumenBasico | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)

  // Filtros reactivos
  const [search, setSearch] = useState<string>("")
  const [carrera, setCarrera] = useState<string>("")
  const [tipoBeca, setTipoBeca] = useState<string>("")

  // Estados de envío a Secretaría General
  const [confirmandoEnvio, setConfirmandoEnvio] = useState<boolean>(false)
  const [enviandoCorreo, setEnviandoCorreo] = useState<boolean>(false)
  const [feedbackEnvio, setFeedbackEnvio] = useState<FeedbackEnvio | null>(null)

  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)

  const cargarDatos = useCallback(
    async (termino: string, carreraFiltro: string, tipoBecaFiltro: string) => {
      setLoading(true)
      try {
        const res = await reporteEnRevision({
          search: termino || undefined,
          carrera: carreraFiltro || undefined,
          tipoBeca: tipoBecaFiltro || undefined
        })
        if (res.success) {
          setData(res.data)
          setCuposResumen(res.cuposResumen)
          setPeriodoActual(res.periodoActual)
        } else {
          setData([])
          setCuposResumen([])
        }
      } catch (error) {
        console.error("Error al cargar reporte En Revisión:", error)
        setData([])
        setCuposResumen([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargarDatos(search, carrera, tipoBeca)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, carrera, tipoBeca, cargarDatos])

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
        tipoBeca: tipoBeca || undefined
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

  const mapearFilaXLSX = useCallback((row: ReporteEnRevisionRow): CeldaXLSX[] => {
    const pEst =
      row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined
        ? Number(row.puntaje_estudiante)
        : null
    const pAdm =
      row.puntaje_admin !== null && row.puntaje_admin !== undefined
        ? Number(row.puntaje_admin)
        : null
    const diff = pEst !== null && pAdm !== null ? pAdm - pEst : null

    return [
      String(row.nombre || "---").toUpperCase(),
      String(row.apellido || "---").toUpperCase(),
      `V-${row.cedula}`,
      String(row.tipo_beca || "---").toUpperCase(),
      String(row.carrera || "---").toUpperCase(),
      `${Number(row.semestre || 1)}°`,
      Number(formatearNota(row.promedio_notas)),
      Number(formatearNota(row.indice_global)),
      pEst !== null ? pEst : "Sin estudio",
      pAdm !== null ? pAdm : "Pendiente",
      diff !== null ? (diff > 0 ? `+${diff}` : String(diff)) : "---",
      String(row.nivel_riesgo_admin || "Pendiente").toUpperCase(),
      String(row.periodo_origen_codigo || "---").toUpperCase(),
      row.observaciones_admin ? String(row.observaciones_admin).trim() : "---"
    ]
  }, [])

  const periodoSubtitulo = periodoActual
    ? `${periodoActual.codigo} (${periodoActual.nombre})`
    : "Periodo Vigente"

  const filtrosActivosTexto = [
    search.trim() ? `Búsqueda: "${search.trim()}"` : null,
    carrera ? `Carrera: ${carrera}` : null,
    tipoBeca ? `Modalidad: ${tipoBeca}` : null
  ]
    .filter((item): item is string => Boolean(item))
    .join(" | ")

  return (
    <div className="space-y-4 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* CABECERA CON EXPORTACIÓN DUAL */}
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

      {/* BARRA DE ACCIONES DIRECTAS (PDF, EXCEL Y ENVÍO A SECRETARÍA GENERAL) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-black text-[#1e3a5f] uppercase tracking-wider leading-none">
                Lote listo para dictamen ({data.length} expediente{data.length === 1 ? "" : "s"})
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                Exporte en PDF / Excel o remita el consolidado con archivo <strong>.xlsx</strong> adjunto a Secretaría General.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loading || data.length === 0}
              onClick={handleImprimirPDF}
              className="flex-1 sm:flex-none h-12 md:h-9 px-3.5 rounded-lg bg-white hover:bg-[#f8fafc] border border-slate-200 hover:border-[#1e3a5f] text-[#1e3a5f] text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#1e3a5f]" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              disabled={loading || exportandoXlsx || data.length === 0}
              onClick={() => void handleExportarXLSX()}
              className="flex-1 sm:flex-none h-12 md:h-9 px-3.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {exportandoXlsx ? (
                <Loader2 className="h-4 w-4 md:h-3.5 md:w-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 md:h-3.5 md:w-3.5 text-emerald-700" />
              )}
              <span>Excel</span>
            </button>

            <button
              type="button"
              disabled={loading || enviandoCorreo || data.length === 0}
              onClick={() => {
                setFeedbackEnvio(null)
                setConfirmandoEnvio((prev) => !prev)
              }}
              className="w-full sm:w-auto h-12 md:h-9 px-4 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843]" />
              <span>Enviar a Secretaría General</span>
            </button>
          </div>
        </div>

        {/* CONFIRMACIÓN INLINE DE ENVÍO (100% REACT) */}
        {confirmandoEnvio && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-[#d4a843]/50 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <MailCheck className="h-5 w-5 text-[#1e3a5f] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wide">
                  ¿Confirmar envío oficial a Secretaría General?
                </p>
                <p className="text-xs md:text-[11px] text-slate-600 font-medium mt-0.5">
                  Se enviarán <strong>{data.length} expediente(s)</strong> en tabla HTML junto con el resumen de cupos y el libro <strong>.xlsx</strong> adjunto al correo institucional de Secretaría General.
                </p>
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Confirmar Envío
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* FEEDBACK DE ENVÍO */}
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

      {/* RESUMEN EJECUTIVO DE CUPOS POR MODALIDAD EN ESTE LOTE */}
      {cuposResumen.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#d4a843]" />
            <h3 className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">
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
                  <p className="text-[10px] font-black text-[#1e3a5f] uppercase leading-tight line-clamp-2">
                    {c.modalidad}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-bold pt-1 border-t border-slate-200/70">
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

      {/* BARRA DE FILTROS (NOMBRE/CÉDULA, CARRERA Y TIPO DE BECA) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end print:hidden">
        <div className="lg:col-span-4 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">
            Nombre o Cédula
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar estudiante..."
              className="w-full h-12 md:h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
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

        <div className="lg:col-span-3 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">
            Carrera
          </label>
          <select
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white cursor-pointer"
          >
            <option value="">Todas las Carreras</option>
            {CARRERAS_UNIMAR_LIST.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-3 space-y-1">
          <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">
            Tipo de Beca
          </label>
          <select
            value={tipoBeca}
            onChange={(e) => setTipoBeca(e.target.value)}
            className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white cursor-pointer"
          >
            <option value="">Todas las Modalidades</option>
            {MODALIDADES_BECA_OFICIALES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2 flex gap-2">
          <button
            type="button"
            onClick={() => void cargarDatos(search, carrera, tipoBeca)}
            disabled={loading}
            className="w-full h-12 md:h-9 px-3 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR DE DATOS (TABLA PC / TARJETAS MÓVIL) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:border border-slate-200 md:shadow-sm overflow-hidden print:hidden">
        {loading ? (
          <div className="bg-white rounded-xl p-16 text-center text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin text-[#d4a843] mx-auto mb-2" />
            <p className="text-xs font-black uppercase tracking-widest">
              Consultando expedientes en revisión...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center text-slate-400">
            <p className="text-xs font-black uppercase tracking-widest">
              No existen expedientes en estatus En Revisión para los criterios actuales.
            </p>
          </div>
        ) : (
          <>
            {/* VISTA ESCRITORIO (PC) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Tipo de Beca</th>
                    <th className="px-4 py-3">Carrera / Trim.</th>
                    <th className="px-4 py-3 text-center">Promedio</th>
                    <th className="px-4 py-3 text-center">Baremos (Est. / Adm.)</th>
                    <th className="px-4 py-3">Observaciones Coordinación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data.map((row) => {
                    const pEst =
                      row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined
                        ? Number(row.puntaje_estudiante)
                        : null
                    const pAdm =
                      row.puntaje_admin !== null && row.puntaje_admin !== undefined
                        ? Number(row.puntaje_admin)
                        : null
                    const diff = pEst !== null && pAdm !== null ? pAdm - pEst : null

                    return (
                      <tr key={row.solicitud_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
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

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-black text-[#1e3a5f] uppercase text-[10px] leading-snug max-w-[200px]">
                            <Award className="h-3.5 w-3.5 text-[#d4a843] shrink-0" />
                            {row.tipo_beca}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-700 uppercase text-[11px] flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {row.carrera}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-[9px] font-black text-[#1e3a5f] uppercase">
                            {row.semestre}° Trimestre
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-black text-emerald-700 tabular-nums">
                              {formatearNota(row.promedio_notas)}
                            </span>
                            <span className="text-[9px] font-black text-[#d4a843] tabular-nums">
                              G: {formatearNota(row.indice_global)}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
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

                        <td className="px-4 py-3">
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

            {/* VISTA MÓVIL (TABLE-TO-CARDS) */}
            <div className="md:hidden space-y-3">
              {data.map((row) => {
                const pEst =
                  row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined
                    ? Number(row.puntaje_estudiante)
                    : null
                const pAdm =
                  row.puntaje_admin !== null && row.puntaje_admin !== undefined
                    ? Number(row.puntaje_admin)
                    : null

                return (
                  <div
                    key={`mob-${row.solicitud_id}`}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <p className="text-sm font-black text-[#1e3a5f] uppercase">
                          {row.nombre} {row.apellido}
                        </p>
                        <p className="text-xs text-slate-500 font-mono font-bold">
                          V-{row.cedula} • {row.semestre}° Trimestre
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

                    <div className="space-y-1.5 text-sm">
                      <p className="font-black text-[#1e3a5f] uppercase text-xs">
                        {row.tipo_beca}
                      </p>
                      <p className="text-xs font-bold text-slate-600 uppercase">
                        {row.carrera}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200">
                        <span className="block text-[9px] font-black text-slate-400 uppercase">
                          Promedio
                        </span>
                        <span className="text-sm font-black text-emerald-700 tabular-nums">
                          {formatearNota(row.promedio_notas)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#f8fafc] border border-slate-200">
                        <span className="block text-[9px] font-black text-slate-400 uppercase">
                          Baremo Est.
                        </span>
                        <span className="text-sm font-black text-slate-700">
                          {pEst !== null ? `${pEst} pts` : "N/A"}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#1e3a5f] text-white">
                        <span className="block text-[9px] font-black text-[#d4a843] uppercase">
                          Baremo Adm.
                        </span>
                        <span className="text-sm font-black">
                          {pAdm !== null ? `${pAdm} pts` : "Pend."}
                        </span>
                      </div>
                    </div>

                    {row.observaciones_admin && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
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

      {/* PLANTILLA DE IMPRESIÓN PDF LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout<ReporteEnRevisionRow>
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
          const pEst =
            row.puntaje_estudiante !== null && row.puntaje_estudiante !== undefined
              ? `${row.puntaje_estudiante} pts`
              : "N/A"
          const pAdm =
            row.puntaje_admin !== null && row.puntaje_admin !== undefined
              ? `${row.puntaje_admin} pts`
              : "Pend."

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
                <span className="text-[8px] text-slate-600 font-bold">{row.semestre}° Trimestre</span>
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold">
                <span className="block">{formatearNota(row.promedio_notas)}</span>
                <span className="text-[8px] text-slate-600">G: {formatearNota(row.indice_global)}</span>
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
      <ExportReportXLSX<ReporteEnRevisionRow>
        ref={xlsxRef}
        titulo="Expedientes En Revisión — Secretaría General"
        subtitulo={`Periodo Vigente: ${periodoSubtitulo} — Total: ${data.length}`}
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