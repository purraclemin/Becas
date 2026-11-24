"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  BookOpen,
  GraduationCap,
  Calendar,
  Loader2,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  X,
} from "lucide-react"

import { obtenerSolicitudesRecientes } from "@/lib/ActionsRecientes"
import { PageHeader } from "@/components/admin/PageHeader"
import { ImprimirConIAModal } from "@/components/admin/ImprimirConIAModal"
import { PrintReportLayout } from "@/components/imprimirReporte"
import {
  ExportReportXLSX,
  type ExportReportXLSXHandle,
  type CeldaXLSX,
} from "@/components/imprimirReporteXLSX"

// --- TIPOS ---
export interface ISolicitudReciente {
  id: number | string;
  cedula: string;
  fecha_registro: string;
  nombre: string;
  apellido: string;
  carrera: string;
  tipo_beca: string;
  promedio_notas: string;
  estatus: string;
  [key: string]: unknown;
}

// --- SUBCOMPONENTES AUXILIARES (UI Modular) ---

const StatusBadge = ({ estatus }: { estatus: string }) => {
  const styles = {
    'Aprobada': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En Revisión': 'bg-blue-50 text-blue-700 border-blue-200',
    'Rechazada': 'bg-rose-50 text-rose-700 border-rose-200',
    'Pendiente': 'bg-amber-50 text-amber-700 border-amber-200',
  } as const;

  const style = styles[estatus as keyof typeof styles] || styles['Pendiente'];

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider shadow-xs border ${style}`}>
      {estatus || 'Pendiente'}
    </span>
  );
};

const AvgBadge = ({ nota }: { nota: string }) => {
  const val = parseFloat(nota) || 0;
  const style = val >= 16 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                val >= 10 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border shadow-sm ${style}`}>
      <GraduationCap className="h-3 w-3" />
      <span className="font-black text-[9px]">{nota}</span>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function ActividadPage() {
  const router = useRouter()
  const [recientes, setRecientes] = useState<ISolicitudReciente[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false)

  // Estados y referencia para exportación dual (PDF / XLSX)
  const [mostrarOpcionesExportar, setMostrarOpcionesExportar] = useState<boolean>(false)
  const [exportandoXlsx, setExportandoXlsx] = useState<boolean>(false)
  const xlsxRef = useRef<ExportReportXLSXHandle | null>(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        setError(null)
        const data = await obtenerSolicitudesRecientes()
        if (Array.isArray(data)) setRecientes(data as ISolicitudReciente[])
      } catch (err) {
        setError("No fue posible establecer conexión con el servidor. Intente nuevamente.")
        console.error("Error al cargar actividad:", err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const formatearFecha = useCallback((fecha: string): string => {
    if (!fecha) return "---"
    const parsed = new Date(fecha)
    if (Number.isNaN(parsed.getTime())) return String(fecha)
    return parsed.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const handleImprimirPDF = () => {
    setMostrarOpcionesExportar(false)
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const handleExportarXLSX = async () => {
    if (!xlsxRef.current || exportandoXlsx) return
    await xlsxRef.current.exportar()
    setMostrarOpcionesExportar(false)
  }

  const mapearFilaXLSX = useCallback(
    (s: ISolicitudReciente): CeldaXLSX[] => {
      const notaNumerica = parseFloat(String(s.promedio_notas ?? ""))
      const indiceValor: CeldaXLSX = Number.isFinite(notaNumerica)
        ? notaNumerica
        : String(s.promedio_notas || "---")

      return [
        formatearFecha(s.fecha_registro),
        `${String(s.nombre || "").trim()} ${String(s.apellido || "").trim()}`.trim().toUpperCase() || "---",
        s.cedula ? `V-${s.cedula}` : "---",
        String(s.carrera || "---").toUpperCase(),
        String(s.tipo_beca || "---").toUpperCase(),
        indiceValor,
        String(s.estatus || "Pendiente").toUpperCase(),
      ]
    },
    [formatearFecha]
  )

  return (
    <div className="space-y-4 md:space-y-6 print:space-y-0 print:overflow-visible print:h-auto print:min-h-0">

      {/* CABECERA (Se oculta al imprimir) */}
      <div className="print:hidden">
        <PageHeader
          titulo="Registro de Actividad"
          subtitulo="Auditoría de Movimientos en Tiempo Real"
          mostrarExportar={true}
          onExport={() => setMostrarOpcionesExportar(true)}
        />
      </div>

      {/* CONTENIDO PRINCIPAL EN PANTALLA (Se oculta al imprimir) */}
      <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border border-slate-200 flex flex-col overflow-hidden print:hidden">

        <div className="hidden md:flex bg-slate-50 px-5 py-3 border-b justify-between items-center">
          <h3 className="text-[9px] font-black text-[#1a2744] uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[#d4a843]" /> Últimos Movimientos
          </h3>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
            Periodo Académico 2026
          </span>
        </div>

        <div className="w-full">
          <table className="w-full text-left block md:table border-collapse">
            <thead className="hidden md:table-header-group sticky top-0 z-20 bg-slate-50">
              <tr className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-3 border-b border-slate-200">Fecha / Hora</th>
                <th className="px-6 py-3 border-b border-slate-200">Estudiante</th>
                <th className="px-6 py-3 border-b border-slate-200">Carrera</th>
                <th className="px-6 py-3 border-b border-slate-200">Beca</th>
                <th className="px-6 py-3 border-b border-slate-200 text-center">Índice</th>
                <th className="px-6 py-3 border-b border-slate-200 text-right">Estatus</th>
              </tr>
            </thead>

            <tbody className="flex flex-col gap-4 md:table-row-group md:gap-0">
              {loading ? (
                <tr className="block md:table-row bg-white">
                  <td colSpan={6} className="block md:table-cell py-24 text-center">
                    <Loader2 className="inline-block h-8 w-8 text-[#d4a843] animate-spin mb-2" />
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consultando registros...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr className="block md:table-row bg-rose-50/50">
                  <td colSpan={6} className="block md:table-cell py-12 text-center text-rose-800">
                    <AlertTriangle className="inline-block h-8 w-8 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">{error}</p>
                  </td>
                </tr>
              ) : recientes.length > 0 ? (
                recientes.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => router.push(`/admin/validarBeca?search=${s.cedula}`)}
                    className="group flex flex-col md:table-row bg-white border border-slate-200 rounded-xl shadow-sm md:shadow-none md:border-none md:rounded-none md:hover:bg-blue-50/50 transition-all cursor-pointer overflow-hidden"
                  >
                    <td className="order-6 md:order-none flex justify-between items-center md:table-cell px-4 py-2.5 md:px-6 md:py-3.5 border-t border-slate-100 md:border-none bg-slate-50/30 md:bg-transparent">
                      <span className="md:hidden text-[8px] font-black text-slate-400 uppercase">Registro</span>
                      <div className="flex items-center gap-2 text-slate-500 font-mono text-[9px] font-bold">
                        <Calendar className="h-3 w-3 text-slate-300 hidden md:block" />
                        {formatearFecha(s.fecha_registro)}
                      </div>
                    </td>

                    <td className="order-1 md:order-none flex flex-col md:flex-row md:items-center justify-between md:table-cell px-4 py-3 md:px-6 md:py-3.5 bg-slate-50/50 md:bg-transparent">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 md:h-7 md:w-7 bg-[#1e3a5f] rounded flex items-center justify-center text-[#d4a843] font-black text-[11px] md:text-[10px] shadow-sm shrink-0">
                          {s.nombre?.[0]}{s.apellido?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#1a2744] text-[11px] md:text-[10px] uppercase leading-none">{s.nombre} {s.apellido}</p>
                          <p className="text-[9px] md:text-[8px] text-slate-400 mt-0.5 font-mono tracking-tighter">V-{s.cedula}</p>
                        </div>
                      </div>
                    </td>

                    <td className="order-3 md:order-none flex justify-between items-center md:table-cell px-4 py-2.5 md:px-6 md:py-3.5 border-t border-slate-100 md:border-none">
                      <span className="md:hidden text-[8px] font-black text-slate-400 uppercase">Programa</span>
                      <div className="flex items-center gap-2 text-[#1a2744]">
                        <BookOpen className="h-3 w-3 text-[#d4a843] hidden md:block" />
                        <span className="text-[9px] font-black uppercase truncate max-w-[140px] text-right md:text-left">{s.carrera}</span>
                      </div>
                    </td>

                    <td className="order-4 md:order-none flex justify-between items-center md:table-cell px-4 py-2.5 md:px-6 md:py-3.5 border-t border-slate-100 md:border-none">
                      <span className="md:hidden text-[8px] font-black text-slate-400 uppercase">Beneficio</span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase">{s.tipo_beca}</span>
                    </td>

                    <td className="order-5 md:order-none flex justify-between items-center md:table-cell px-4 py-2.5 md:px-6 md:py-3.5 border-t border-slate-100 md:border-none md:text-center">
                      <span className="md:hidden text-[8px] font-black text-slate-400 uppercase">Índice</span>
                      <AvgBadge nota={s.promedio_notas} />
                    </td>

                    <td className="order-2 md:order-none flex justify-between items-center md:table-cell px-4 py-2 md:px-6 md:py-3.5 md:text-right border-t border-slate-100 md:border-none">
                      <span className="md:hidden text-[8px] font-black text-slate-400 uppercase">Estado</span>
                      <StatusBadge estatus={s.estatus} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="block md:table-row">
                  <td colSpan={6} className="block md:table-cell py-16 text-center text-slate-400 italic text-xs">
                    No hay movimientos registrados en la bitácora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-[7px] text-gray-400 font-bold uppercase tracking-[0.3em] py-2 print:hidden">
        Unimar &bull; Sistema de Auditoría Interna &bull; 2026
      </p>

      {/* MODAL SELECTOR DE FORMATO DE EXPORTACIÓN (PDF / XLSX) */}
      {mostrarOpcionesExportar && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
          onClick={() => !exportandoXlsx && setMostrarOpcionesExportar(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#1e3a5f] px-5 py-3.5 flex items-center justify-between border-b-2 border-[#d4a843]">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">
                  Exportar Reporte
                </h4>
                <p className="text-[10px] text-slate-200 font-medium mt-0.5">
                  Seleccione el formato de salida
                </p>
              </div>
              <button
                type="button"
                disabled={exportandoXlsx}
                onClick={() => setMostrarOpcionesExportar(false)}
                className="p-1.5 rounded-lg text-slate-200 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Cerrar selector de exportación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-2.5 bg-[#f8fafc]">
              <button
                type="button"
                onClick={handleImprimirPDF}
                disabled={exportandoXlsx}
                className="w-full flex items-center gap-3 p-3.5 md:p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#1e3a5f] rounded-xl text-left transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="h-10 w-10 md:h-9 md:w-9 rounded-lg bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wide">
                    Imprimir en PDF
                  </p>
                  <p className="text-xs md:text-[10px] text-slate-500 font-medium">
                    Impresión o guardado PDF
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportarXLSX}
                disabled={exportandoXlsx}
                className="w-full flex items-center gap-3 p-3.5 md:p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#d4a843] rounded-xl text-left transition-all shadow-xs cursor-pointer disabled:opacity-60"
              >
                <div className="h-10 w-10 md:h-9 md:w-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  {exportandoXlsx ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wide">
                    {exportandoXlsx ? "Generando archivo..." : "Hoja de Cálculo (.xlsx)"}
                  </p>
                  <p className="text-xs md:text-[10px] text-slate-500 font-medium">
                    Libro Excel
                  </p>
                </div>
              </button>
            </div>

            <div className="px-4 py-3 bg-white border-t border-slate-200 flex justify-end">
              <button
                type="button"
                disabled={exportandoXlsx}
                onClick={() => setMostrarOpcionesExportar(false)}
                className="h-12 md:h-9 px-4 rounded-lg border border-slate-200 text-sm md:text-xs font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PLANTILLA DE IMPRESIÓN PDF LIMPIA E INSTITUCIONAL */}
      <PrintReportLayout
        titulo="Registro de Actividad"
        subtitulo={`Auditoría de Movimientos en Tiempo Real — Total: ${recientes.length}`}
        columnas={["Fecha / Hora", "Estudiante / Cédula", "Carrera", "Beca", "Índice", "Estatus"]}
        datos={recientes}
        renderFila={(row: Record<string, unknown>, idx: number) => {
          const s = row as ISolicitudReciente
          return (
            <tr key={String(s.id ?? idx)} className="border-b border-slate-200 break-inside-avoid">
              <td className="p-1.5 border border-slate-400 text-[8px] font-mono font-semibold text-slate-700">
                {formatearFecha(s.fecha_registro)}
              </td>
              <td className="p-1.5 border border-slate-400">
                <span className="font-bold text-[#1e3a5f] uppercase block">
                  {String(s.nombre || "")} {String(s.apellido || "")}
                </span>
                <span className="text-[8px] text-slate-500 font-mono font-semibold">
                  V-{String(s.cedula || "---")}
                </span>
              </td>
              <td className="p-1.5 border border-slate-400 uppercase font-semibold">
                {String(s.carrera || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 uppercase font-semibold text-slate-700">
                {String(s.tipo_beca || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 text-center font-bold text-slate-800">
                {String(s.promedio_notas || "---")}
              </td>
              <td className="p-1.5 border border-slate-400 text-right uppercase font-bold text-[#1e3a5f]">
                {String(s.estatus || "Pendiente")}
              </td>
            </tr>
          )
        }}
      />

      {/* EXPORTADOR INSTITUCIONAL A HOJA DE CÁLCULO (.XLSX) */}
      <ExportReportXLSX<ISolicitudReciente>
        ref={xlsxRef}
        titulo="Registro de Actividad"
        subtitulo={`Auditoría de Movimientos en Tiempo Real — Periodo Académico 2026`}
        nombreHoja="Registro_Actividad"
        nombreArchivo="registro_actividad_unimar"
        columnas={["Fecha / Hora", "Estudiante", "Cédula", "Carrera", "Beca", "Índice", "Estatus"]}
        datos={recientes}
        mapearFila={mapearFilaXLSX}
        onEstadoCambio={setExportandoXlsx}
      />

      {/* Referencia reservada de modal IA si se habilita posteriormente */}
      {isAIModalOpen && (
        <div className="hidden print:hidden" aria-hidden="true">
          <ImprimirConIAModal
            isOpen={isAIModalOpen}
            onClose={() => setIsAIModalOpen(false)}
          />
        </div>
      )}
    </div>
  )
}