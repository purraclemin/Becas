"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Calendar } from "lucide-react"

// Importamos los componentes modulares
import { PageHeader } from "@/components/admin/PageHeader"
import { FiltrosEstudiantes } from "@/components/admin/estudiantes/FiltrosEstudiantes"
import {
  FilaEstudiante,
  type IEstudianteAdminFila
} from "@/components/admin/estudiantes/FilaEstudiante"
import { PrintReportLayout } from "@/components/imprimirReporte"

// Importamos las acciones
import { obtenerEstudiantesConSolicitud } from "@/lib/Actionsestudiantes"

// 1. TIPADO ESTRICTO (Cero 'any')
export interface IEstudianteAdmin {
  id: number | string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  correo?: string;
  email?: string;
  email_institucional?: string;
  telefono?: string;
  carrera?: string;
  semestre?: string | number;
  fecha_ingreso?: string;
  fecha_registro?: string;
  fecha_solicitud?: string;
  created_at?: string;
  fecha?: string;
  [key: string]: unknown;
}

interface IEstudiantesResponse {
  estudiantes: IEstudianteAdmin[];
  totalPaginas?: number;
  totalRegistros?: number;
}

export default function EstudiantesAdminPage() {
  const router = useRouter()
  const [estudiantes, setEstudiantes] = useState<IEstudianteAdmin[]>([])
  const [busqueda, setBusqueda] = useState("")
  const [loading, setLoading] = useState(true)

  // Estados de Paginación
  const [page, setPage] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalRegistros, setTotalRegistros] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)

  // 1. FUNCIÓN DE CARGA CENTRALIZADA
  const cargarDatos = useCallback(async (termino: string, pagina: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setLoading(true)

    try {
      const data = (await obtenerEstudiantesConSolicitud(termino, pagina, 12)) as IEstudiantesResponse

      if (controller.signal.aborted) return

      if (data && Array.isArray(data.estudiantes)) {
        setEstudiantes(data.estudiantes)
        setTotalPaginas(data.totalPaginas || 1)
        setTotalRegistros(data.totalRegistros || 0)
      } else {
        setEstudiantes([])
        setTotalPaginas(1)
        setTotalRegistros(0)
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("Error en la conexión:", error)
        setEstudiantes([])
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  // 2. EFECTO UNIFICADO: Sincroniza búsqueda y paginación
  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos(busqueda, page)
    }, busqueda ? 400 : 0)

    return () => clearTimeout(timer)
  }, [busqueda, page, cargarDatos])

  // Resetear página al buscar un nuevo término
  useEffect(() => {
    setPage(1)
  }, [busqueda])

  const handleSeleccionarEstudiante = useCallback(
    (estudiante: IEstudianteAdminFila) => {
      const cedulaLimpia = String(estudiante.cedula ?? "").trim()
      if (!cedulaLimpia) return
      router.push(
        `/admin/validarBeca?abrirAuditoria=${encodeURIComponent(cedulaLimpia)}&origen=estudiantes`
      )
    },
    [router]
  )

  const handleExportar = () => {
    window.print()
  }

  const formatearFechaImpresion = (row: IEstudianteAdmin): string => {
    const valorFecha =
      row.fecha_ingreso ||
      row.fecha_registro ||
      row.fecha_solicitud ||
      row.created_at ||
      row.fecha

    if (!valorFecha) return "---"
    const fechaParseada = new Date(String(valorFecha))
    if (Number.isNaN(fechaParseada.getTime())) return String(valorFecha)
    return fechaParseada.toLocaleDateString()
  }

  return (
    <div className="space-y-4 md:space-y-6 print:space-y-0 print:overflow-visible print:h-auto">

      {/* HEADER UNIFICADO (Se oculta al imprimir, conserva el botón existente) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Base de Estudiantes"
          subtitulo="Gestión y Control de Datos Académicos"
          mostrarExportar={true}
          onExport={handleExportar}
        />
      </div>

      {/* --- CONTENIDO AJUSTADO AL LAYOUT RESPONSIVO (Se oculta al imprimir) --- */}
      <div className="space-y-4 print:hidden">

        {/* COMPONENTE MODULAR DE FILTROS */}
        <FiltrosEstudiantes
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          loading={loading}
          totalRegistros={totalRegistros}
          page={page}
          totalPaginas={totalPaginas}
          setPage={setPage}
        />

        {/* 2. TABLA DE RESULTADOS - DISEÑO RESPONSIVO (Table to Cards) */}
        <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm overflow-hidden md:border border-slate-200">
          <div className="w-full">
            <table className="w-full text-left block md:table border-collapse">

              {/* Cabecera oculta en móviles */}
              <thead className="hidden md:table-header-group sticky top-0 z-20">
                <tr className="bg-slate-50 border-b border-slate-200 text-[#1e3a5f] text-[8.5px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">Datos Personales</th>
                  <th className="px-6 py-4">Información de Contacto</th>
                  <th className="px-6 py-4">Perfil Académico</th>
                  <th className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Calendar className="h-3 w-3 text-[#d4a843]" /> Fecha Ingreso
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Transformación a flex-col en móviles para que FilaEstudiante sea una tarjeta */}
              <tbody className="flex flex-col gap-4 md:table-row-group md:gap-0 divide-y-0 md:divide-y md:divide-slate-100">
                {loading && estudiantes.length === 0 ? (
                  <tr className="block md:table-row bg-white rounded-xl shadow-sm md:shadow-none border border-slate-200 md:border-none">
                    <td colSpan={4} className="block md:table-cell py-16 md:py-20 text-center">
                      <Loader2 className="inline-block h-8 w-8 text-[#d4a843] animate-spin" />
                      <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Sincronizando base de datos...
                      </p>
                    </td>
                  </tr>
                ) : estudiantes.length > 0 ? (
                  estudiantes.map((e) => (
                    <FilaEstudiante
                      key={e.id}
                      estudiante={e}
                      onSelect={handleSeleccionarEstudiante}
                    />
                  ))
                ) : (
                  <tr className="block md:table-row bg-white rounded-xl shadow-sm md:shadow-none border border-slate-200 md:border-none">
                    <td colSpan={4} className="block md:table-cell py-16 text-center">
                      <p className="text-slate-400 font-bold italic text-xs">
                        {busqueda ? `Sin resultados para "${busqueda}"` : "La base de datos está vacía."}
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
          <div className="flex justify-center pt-2">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest bg-white px-4 py-2 md:px-3 md:py-1.5 rounded-full border border-slate-200 shadow-xs">
              Página {page} de {totalPaginas}
            </p>
          </div>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Base de Estudiantes"
        subtitulo={
          busqueda
            ? `Filtro aplicado: "${busqueda}" — Página ${page}`
            : `Gestión y Control de Datos Académicos — Página ${page}`
        }
        columnas={["Estudiante / Cédula", "Contacto", "Carrera", "Fecha Ingreso"]}
        datos={estudiantes}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const item = row as IEstudianteAdmin
          return (
            <tr key={String(item.id ?? idx)} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">
                  {String(item.nombre || "")} {String(item.apellido || "")}
                </span>
                <span className="text-[8px] text-slate-500 font-semibold">
                  {String(item.cedula || "---")}
                </span>
              </td>
              <td className="p-1.5 border border-slate-400 text-[8px]">
                <span className="block text-slate-700">{String(item.correo || item.email || "---")}</span>
                <span className="block text-slate-500">{String(item.telefono || "---")}</span>
              </td>
              <td className="p-1.5 border border-slate-400 uppercase font-semibold">
                {String(item.carrera || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 text-[8px] font-semibold text-slate-700">
                {formatearFechaImpresion(item)}
              </td>
            </tr>
          )
        }}
      />
    </div>
  )
}