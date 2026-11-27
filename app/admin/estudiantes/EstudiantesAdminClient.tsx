"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "lucide-react"

import { PageHeader } from "@/components/admin/PageHeader"
import { FiltrosEstudiantes } from "@/components/admin/estudiantes/FiltrosEstudiantes"
import {
  FilaEstudiante,
  type IEstudianteAdminFila
} from "@/components/admin/estudiantes/FilaEstudiante"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX
} from "@/components/imprimirReporteXLSX"
import { esEgresadoPorSemestre } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import {
  obtenerEstudiantesConSolicitud,
  obtenerTodosEstudiantesParaExportacion,
  type IEstudianteAdmin,
  type RespuestaEstudiantesAdmin
} from "@/lib/Actionsestudiantes"

interface EstudiantesAdminClientProps {
  initialData: RespuestaEstudiantesAdmin
  initialSearch: string
  initialCarrera: string
}

type AccionExportacionPendiente = "pdf" | "xlsx" | null

const formatearFechaImpresion = (fechaIso: string): string => {
  if (!fechaIso) return "---"
  const fechaParseada = new Date(fechaIso)
  if (Number.isNaN(fechaParseada.getTime())) return fechaIso
  return fechaParseada.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const formatearTrimestreImpresion = (semestre: number): string => {
  if (esEgresadoPorSemestre(semestre)) return "Egresado"
  return `${semestre}° Trim.`
}

export function EstudiantesAdminClient({
  initialData,
  initialSearch,
  initialCarrera
}: EstudiantesAdminClientProps) {
  const router = useRouter()
  const [estudiantes, setEstudiantes] = useState<IEstudianteAdmin[]>(
    Array.isArray(initialData?.estudiantes) ? initialData.estudiantes : []
  )
  const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>(
    Array.isArray(initialData?.carreras) ? initialData.carreras : []
  )
  const [busqueda, setBusqueda] = useState<string>(initialSearch)
  const [carrera, setCarrera] = useState<string>(initialCarrera)
  const [actualizando, setActualizando] = useState<boolean>(false)

  // Exportación completa (sin truncar a los 12 de la página visible)
  const [datosExportacion, setDatosExportacion] = useState<IEstudianteAdmin[]>(
    Array.isArray(initialData?.estudiantes) ? initialData.estudiantes : []
  )
  const [exportando, setExportando] = useState<boolean>(false)
  const [accionPendiente, setAccionPendiente] = useState<AccionExportacionPendiente>(null)
  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)

  const [page, setPage] = useState<number>(initialData.page || 1)
  const [totalPaginas, setTotalPaginas] = useState<number>(
    initialData.totalPaginas || 1
  )
  const [totalRegistros, setTotalRegistros] = useState<number>(
    initialData.totalRegistros || 0
  )

  // Arquitectura estable heredada de los reportes: requestIdRef + isFirstMountRef (cero AbortController)
  const isFirstMountRef = useRef<boolean>(true)
  const requestIdRef = useRef<number>(0)

  const cargarDatos = useCallback(
    async (termino: string, pagina: number, carreraFiltro: string) => {
      const reqId = ++requestIdRef.current
      setActualizando(true)

      try {
        const res = await obtenerEstudiantesConSolicitud(
          termino,
          pagina,
          12,
          carreraFiltro
        )

        if (reqId !== requestIdRef.current) return

        if (res.success) {
          setEstudiantes(res.estudiantes)
          setDatosExportacion(res.estudiantes)
          setTotalPaginas(res.totalPaginas || 1)
          setTotalRegistros(res.totalRegistros || 0)
          if (res.carreras.length > 0) {
            setCarrerasDisponibles(res.carreras)
          }
        }
      } catch (error) {
        if (reqId === requestIdRef.current) {
          console.error("Error al sincronizar estudiantes:", error)
        }
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

    const delay = busqueda.trim() !== "" ? 300 : 0
    const timer = setTimeout(() => {
      void cargarDatos(busqueda, page, carrera)
    }, delay)

    return () => clearTimeout(timer)
  }, [busqueda, carrera, page, cargarDatos])

  // Ejecuta la impresión o descarga XLSX una vez que `datosExportacion` ya está renderizado en React
  useEffect(() => {
    if (!accionPendiente) return

    if (accionPendiente === "pdf") {
      let finalizado = false
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null

      const finalizarImpresion = () => {
        if (finalizado) return
        finalizado = true
        if (fallbackTimer) {
          clearTimeout(fallbackTimer)
          fallbackTimer = null
        }
        window.removeEventListener("afterprint", finalizarImpresion)
        setAccionPendiente(null)
        setExportando(false)
      }

      const printTimer = setTimeout(() => {
        window.addEventListener("afterprint", finalizarImpresion, { once: true })
        // Respaldo garantizado si el navegador no dispara `afterprint` o se cancela el diálogo
        fallbackTimer = setTimeout(finalizarImpresion, 1500)
        try {
          window.print()
        } catch (err) {
          console.error("Error al invocar impresión PDF:", err)
          finalizarImpresion()
        } finally {
          // En navegadores donde window.print() es síncrono y bloquea hasta cerrar el diálogo,
          // garantizamos la liberación inmediata del botón al retornar del diálogo.
          finalizarImpresion()
        }
      }, 120)

      return () => {
        clearTimeout(printTimer)
        if (fallbackTimer) {
          clearTimeout(fallbackTimer)
        }
        window.removeEventListener("afterprint", finalizarImpresion)
      }
    }

    if (accionPendiente === "xlsx") {
      let cancelado = false
      const ejecutar = async () => {
        try {
          if (xlsxRef.current) {
            await xlsxRef.current.exportar()
          }
        } catch (err) {
          console.error("Error al exportar XLSX de estudiantes:", err)
        } finally {
          if (!cancelado) {
            setAccionPendiente(null)
            setExportando(false)
          }
        }
      }
      void ejecutar()
      return () => {
        cancelado = true
      }
    }
  }, [accionPendiente, datosExportacion])

  const sincronizarUrl = useCallback(
    (nuevoSearch: string, nuevaCarrera: string) => {
      const params = new URLSearchParams()
      if (nuevoSearch.trim() !== "") params.set("search", nuevoSearch.trim())
      if (nuevaCarrera.trim() !== "") params.set("carrera", nuevaCarrera.trim())
      const qs = params.toString()
      router.replace(qs ? `/admin/estudiantes?${qs}` : "/admin/estudiantes", {
        scroll: false,
      })
    },
    [router]
  )

  const handleBusquedaChange = (val: string) => {
    setBusqueda(val)
    setPage(1)
    sincronizarUrl(val, carrera)
  }

  const handleCarreraChange = (val: string) => {
    setCarrera(val)
    setPage(1)
    sincronizarUrl(busqueda, val)
  }

  const handleLimpiarFiltros = () => {
    setBusqueda("")
    setCarrera("")
    setPage(1)
    sincronizarUrl("", "")
  }

  const handleSeleccionarEstudiante = useCallback(
    (estudiante: IEstudianteAdminFila) => {
      const cedulaLimpia = String(estudiante.cedula ?? "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(
          cedulaLimpia
        )}&origen=estudiantes`
      )
    },
    [router]
  )

  const prepararExportacionCompleta = useCallback(
    async (formato: "pdf" | "xlsx") => {
      if (exportando) return
      setExportando(true)
      try {
        const res = await obtenerTodosEstudiantesParaExportacion(busqueda, carrera)
        if (res.success) {
          setDatosExportacion(res.estudiantes)
        } else {
          setDatosExportacion(estudiantes)
        }
        setAccionPendiente(formato)
      } catch (error) {
        console.error("Error preparando exportación completa de estudiantes:", error)
        setDatosExportacion(estudiantes)
        setAccionPendiente(formato)
      }
    },
    [exportando, busqueda, carrera, estudiantes]
  )

  const mapearFilaXLSX = useCallback((item: IEstudianteAdmin): CeldaXLSX[] => {
    return [
      `${item.nombre} ${item.apellido}`.trim().toUpperCase(),
      `V-${item.cedula || "---"}`,
      item.carrera.toUpperCase(),
      formatearTrimestreImpresion(item.semestre).toUpperCase(),
      item.estatus_actual.toUpperCase(),
      item.tipo_beca_actual.toUpperCase(),
      item.periodo_codigo.toUpperCase(),
      item.correo || "---",
      item.telefono || "---",
      formatearFechaImpresion(item.created_at),
    ]
  }, [])

  const subtituloImpresion = [
    busqueda.trim() ? `Búsqueda: "${busqueda.trim()}"` : null,
    carrera ? `Carrera: ${carrera}` : null,
    `Padrón Completo — Total: ${datosExportacion.length}`
  ]
    .filter((parte): parte is string => Boolean(parte))
    .join(" | ")

  return (
    <div className="space-y-4 print:block print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">
      {/* HEADER UNIFICADO CON EXPORTACIÓN DUAL (PDF / EXCEL) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Base de Estudiantes"
          subtitulo={`Padrón consolidado de solicitantes y becarios — Total: ${totalRegistros}`}
          mostrarExportar={true}
          onExportPDF={() => void prepararExportacionCompleta("pdf")}
          onExportXLSX={() => prepararExportacionCompleta("xlsx")}
          exportandoXlsx={exportando}
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="space-y-4 print:hidden">
        <FiltrosEstudiantes
          busqueda={busqueda}
          setBusqueda={handleBusquedaChange}
          carrera={carrera}
          setCarrera={handleCarreraChange}
          carrerasDisponibles={carrerasDisponibles}
          onLimpiar={handleLimpiarFiltros}
          onRefrescar={() => void cargarDatos(busqueda, page, carrera)}
          loading={actualizando}
          totalRegistros={totalRegistros}
          page={page}
          totalPaginas={totalPaginas}
          setPage={setPage}
        />

        {/* TABLA DE RESULTADOS (PC compacta / Móvil Table-to-Cards) */}
        <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm overflow-hidden md:border border-slate-200">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left block md:table border-collapse">
              <thead className="hidden md:table-header-group sticky top-0 z-20">
                <tr className="bg-[#1e3a5f] text-white text-[9px] font-black uppercase tracking-widest">
                  <th className="px-4 py-2.5">Datos Personales</th>
                  <th className="px-4 py-2.5">Perfil Académico / Estatus</th>
                  <th className="px-4 py-2.5">Información de Contacto</th>
                  <th className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Calendar className="h-3 w-3 text-[#d4a843]" />
                      <span>Fecha Ingreso</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="flex flex-col gap-3 md:table-row-group md:gap-0 divide-y-0 md:divide-y md:divide-slate-100">
                {estudiantes.length > 0 ? (
                  estudiantes.map((est) => (
                    <FilaEstudiante
                      key={est.id}
                      estudiante={est}
                      onSelect={handleSeleccionarEstudiante}
                    />
                  ))
                ) : (
                  <tr className="block md:table-row bg-white rounded-xl shadow-sm md:shadow-none border border-slate-200 md:border-none">
                    <td
                      colSpan={4}
                      className="block md:table-cell py-16 text-center"
                    >
                      <p className="text-slate-400 font-bold italic text-sm md:text-xs">
                        {busqueda.trim() || carrera
                          ? "Sin resultados para los criterios seleccionados."
                          : "No hay estudiantes con solicitudes registradas."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INFO DE PÁGINA INFERIOR COMPACTA */}
        {totalPaginas > 1 && (
          <div className="flex justify-center pt-1">
            <p className="text-[10px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest bg-white px-4 py-2 md:px-3 md:py-1.5 rounded-full border border-slate-200 shadow-2xs">
              Página {page} de {totalPaginas}
            </p>
          </div>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN PDF (PADRÓN FILTRADO COMPLETO) */}
      <PrintReportLayout<IEstudianteAdmin>
        titulo="Base de Estudiantes"
        subtitulo={subtituloImpresion}
        columnas={[
          "Estudiante / Cédula",
          "Carrera / Trimestre",
          "Estatus / Modalidad",
          "Contacto",
          "Fecha Ingreso"
        ]}
        datos={datosExportacion}
        renderFila={(item, idx) => (
          <tr
            key={String(item.id ?? idx)}
            className="border-b border-slate-200 break-inside-avoid"
          >
            <td className="p-1.5 border border-slate-400">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {item.nombre} {item.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">
                V-{item.cedula || "---"}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-semibold block">{item.carrera}</span>
              <span className="text-[8px] text-slate-600 font-bold">
                {formatearTrimestreImpresion(item.semestre)}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400">
              <span className="uppercase font-bold block text-[#1e3a5f]">
                {item.estatus_actual}
              </span>
              <span className="text-[8px] text-slate-500 uppercase">
                {item.tipo_beca_actual}
              </span>
            </td>
            <td className="p-1.5 border border-slate-400 text-[8px]">
              <span className="block text-slate-700">{item.correo || "---"}</span>
              <span className="block text-slate-500">{item.telefono || "---"}</span>
            </td>
            <td className="p-1.5 border border-slate-400 text-right text-[8px] font-semibold text-slate-700">
              {formatearFechaImpresion(item.created_at)}
            </td>
          </tr>
        )}
      />

      {/* EXPORTADOR INSTITUCIONAL A EXCEL (.XLSX) — PADRÓN FILTRADO COMPLETO */}
      <ExportReportXLSX<IEstudianteAdmin>
        ref={xlsxRef}
        titulo="Base de Estudiantes"
        subtitulo={subtituloImpresion}
        nombreHoja="Base_Estudiantes"
        nombreArchivo="base_estudiantes_unimar"
        columnas={[
          "Estudiante",
          "Cédula",
          "Carrera",
          "Trimestre",
          "Estatus Actual",
          "Tipo de Beca",
          "Periodo",
          "Correo",
          "Teléfono",
          "Fecha Ingreso"
        ]}
        datos={datosExportacion}
        mapearFila={mapearFilaXLSX}
      />
    </div>
  )
}
