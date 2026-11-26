"use client"

import React, { useState, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/admin/PageHeader"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  Search,
  Loader2,
  Calendar,
  UserCheck,
  FileText,
  BookOpen,
  AlertCircle,
  X
} from "lucide-react"
import {
  obtenerHistorialAprobaciones,
  type HistorialAprobacionRow
} from "@/lib/ActionsHistorialAprobacion"

interface MateriaSnapshotItem {
  codigo?: string
  nombre?: string
  nota?: number | string
}

interface MateriasSnapshotParsed {
  trimestre?: number | string
  materias?: MateriaSnapshotItem[]
}

export default function HistorialAprobacionesPage() {
  const [historial, setHistorial] = useState<HistorialAprobacionRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const [filtros, setFiltros] = useState<{
    fechaInicio: string
    fechaFin: string
    search: string
  }>({
    fechaInicio: "",
    fechaFin: "",
    search: ""
  })

  const cargarDatos = useCallback(
    async (params: { fechaInicio: string; fechaFin: string; search: string }) => {
      setLoading(true)
      try {
        const res = await obtenerHistorialAprobaciones(params)
        if (res.success && res.data) {
          setHistorial(res.data)
        } else {
          setHistorial([])
        }
      } catch (error) {
        console.error("Error al cargar historial:", error)
        setHistorial([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      void cargarDatos(filtros)
    }, 300)
    return () => clearTimeout(timer)
  }, [filtros.search, cargarDatos])

  const toggleRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id)
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

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <PageHeader
          titulo="Historial de Decisiones"
          subtitulo="Auditoría de aprobaciones y rechazos de becas"
          mostrarExportar={true}
          onExport={() => window.print()}
        />
      </div>

      {/* Filtros de búsqueda (Nombre/Cédula + Fechas) */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-3 items-end print:hidden">
        <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Buscar Estudiante
          </span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400" />
            <input
              type="text"
              value={filtros.search}
              onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
              placeholder="Buscar por Nombre o Cédula..."
              className="w-full h-12 md:h-9 pl-9 pr-8 border border-slate-200 rounded-lg text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] bg-[#f8fafc] focus:bg-white transition-all"
            />
            {filtros.search && (
              <button
                type="button"
                onClick={() => setFiltros({ ...filtros, search: "" })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Desde</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={filtros.fechaInicio}
              className="h-12 md:h-9 pl-8 pr-3 border border-slate-200 rounded-lg text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] bg-slate-50/50"
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasta</span>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="date"
              value={filtros.fechaFin}
              className="h-12 md:h-9 pl-8 pr-3 border border-slate-200 rounded-lg text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] bg-slate-50/50"
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => void cargarDatos(filtros)}
          disabled={loading}
          className="bg-[#1e3a5f] text-white px-4 h-12 md:h-9 rounded-lg text-xs md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#162c4a] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          Filtrar Registro
        </button>
      </div>

      {/* Tabla interactiva visual en pantalla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Estudiante</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Periodo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Cambio de Estatus</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Baremo</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Fecha y Hora</th>
                <th className="px-4 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs md:text-[10px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">
                    <Loader2 className="w-6 h-6 animate-spin text-[#d4a843] mx-auto mb-2" />
                    Sincronizando auditoría...
                  </td>
                </tr>
              ) : historial.length > 0 ? (
                historial.map((reg) => {
                  const materiasData = parsearMateriasSnapshot(reg.materias_snapshot_json)

                  return (
                    <React.Fragment key={reg.id}>
                      <tr className={`hover:bg-blue-50/30 transition-colors group ${expandedRow === reg.id ? "bg-blue-50/50" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-[#1e3a5f]">
                              <UserCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-black text-[#1e3a5f] uppercase leading-none">
                                {reg.nombre} {reg.apellido}
                              </p>
                              <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                                V-{reg.cedula}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-black text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded">
                            {reg.periodo_nombre}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(reg.estatus_previo)} opacity-70`}>
                              {reg.estatus_previo}
                            </span>
                            <span className="text-slate-300 font-bold">→</span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase shadow-sm ${getStatusColor(reg.estatus_nuevo)}`}>
                              {reg.estatus_nuevo}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-black text-[#1e3a5f]">
                          {reg.puntaje_baremo_}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-600 uppercase">
                            {new Date(reg.fecha_aprobacion).toLocaleDateString()}
                          </p>
                          <p className="text-[8px] text-slate-400 mt-0.5 font-bold uppercase">
                            {new Date(reg.fecha_aprobacion).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleRow(reg.id)}
                              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                expandedRow === reg.id
                                  ? "bg-[#1e3a5f] text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title="Ver detalle académico"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleRow(reg.id)}
                              className="p-1.5 bg-slate-100 text-slate-500 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer"
                              title="Ver observación"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {expandedRow === reg.id && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-slate-50/50 border-l-4 border-[#1e3a5f]">
                            <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                              {materiasData && Array.isArray(materiasData.materias) && materiasData.materias.length > 0 ? (
                                <>
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-1 h-3 bg-[#1e3a5f] rounded-full"></div>
                                    <h4 className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-widest">
                                      Carga Académica Registrada {materiasData.trimestre ? `(Trimestre ${materiasData.trimestre})` : ""}
                                    </h4>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {materiasData.materias.map((mat, i) => (
                                      <div
                                        key={i}
                                        className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-colors"
                                      >
                                        <div className="flex flex-col overflow-hidden mr-2">
                                          <span className="text-[7px] text-slate-400 font-bold uppercase truncate">
                                            {mat.codigo || "N/A"}
                                          </span>
                                          <span
                                            className="text-[9px] font-black text-slate-700 uppercase truncate"
                                            title={mat.nombre || ""}
                                          >
                                            {mat.nombre || "Asignatura"}
                                          </span>
                                        </div>
                                        <div className="bg-slate-100 px-2 py-1 rounded text-[#1e3a5f] font-black text-[10px] shrink-0 border border-slate-200">
                                          {mat.nota ?? "0"}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-slate-400 py-4">
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-[9px] font-black uppercase italic">
                                    Sin datos de materias capturados en esta acción.
                                  </span>
                                </div>
                              )}

                              {reg.observacion_admin && (
                                <div className="mt-4 p-2 bg-white rounded-lg border-l-2 border-[#d4a843] shadow-sm">
                                  <p className="text-[8px] font-black text-[#1e3a5f] uppercase mb-1 tracking-tighter">
                                    Nota Administrativa:
                                  </p>
                                  <p className="text-[10px] text-slate-600 font-medium italic">
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
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center opacity-40 font-black uppercase tracking-widest">
                    No se encontraron registros de auditoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLANTILLA DE IMPRESIÓN LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout<HistorialAprobacionRow>
        titulo="Historial de Decisiones"
        subtitulo={`Auditoría de Aprobaciones y Rechazos de Becas — Total: ${historial.length}${
          filtros.search.trim() ? ` | Filtro: "${filtros.search.trim()}"` : ""
        }`}
        columnas={["Estudiante / Cédula", "Periodo", "Cambio de Estatus", "Baremo", "Fecha y Hora"]}
        datos={historial}
        renderFila={(reg, idx) => (
          <tr key={idx} className="border-b border-slate-200 break-inside-avoid">
            <td className="p-2 border border-slate-300">
              <span className="font-bold text-[#1e3a5f] uppercase block">
                {reg.nombre} {reg.apellido}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold">V-{reg.cedula}</span>
            </td>
            <td className="p-2 border border-slate-300 font-semibold">{reg.periodo_nombre}</td>
            <td className="p-2 border border-slate-300">
              <span className="font-semibold text-slate-700">{reg.estatus_previo}</span> →{" "}
              <span className="font-bold text-[#1e3a5f]">{reg.estatus_nuevo}</span>
            </td>
            <td className="p-2 border border-slate-300 text-center font-bold">{reg.puntaje_baremo_}</td>
            <td className="p-2 border border-slate-300 text-[9px]">
              {new Date(reg.fecha_aprobacion).toLocaleString()}
            </td>
          </tr>
        )}
      />
    </div>
  )
}