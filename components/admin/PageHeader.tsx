"use client"

import React, { useState } from "react"
import {
  FileDown,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Loader2,
} from "lucide-react"

export interface PageHeaderProps {
  titulo: string
  subtitulo?: string
  mostrarExportar?: boolean
  onExport?: () => void
  onExportPDF?: () => void
  onExportXLSX?: () => void | Promise<void>
  exportandoXlsx?: boolean
}

export const PageHeader = ({
  titulo,
  subtitulo,
  mostrarExportar = true,
  onExport,
  onExportPDF,
  onExportXLSX,
  exportandoXlsx = false,
}: PageHeaderProps) => {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false)
  const [procesandoInterno, setProcesandoInterno] = useState<boolean>(false)

  const tieneMenuDual = Boolean(onExportXLSX)
  const estaExportando = exportandoXlsx || procesandoInterno

  const ejecutarPDF = () => {
    setMenuAbierto(false)
    setTimeout(() => {
      if (onExportPDF) {
        onExportPDF()
      } else if (onExport) {
        onExport()
      } else {
        window.print()
      }
    }, 80)
  }

  const ejecutarXLSX = async () => {
    if (!onExportXLSX || estaExportando) return
    setProcesandoInterno(true)
    try {
      await onExportXLSX()
    } catch (error) {
      console.error("Error al exportar hoja de cálculo:", error)
    } finally {
      setProcesandoInterno(false)
      setMenuAbierto(false)
    }
  }

  const handleBotonPrincipal = () => {
    if (estaExportando) return
    if (tieneMenuDual) {
      setMenuAbierto((prev) => !prev)
      return
    }
    if (onExportPDF) {
      onExportPDF()
    } else if (onExport) {
      onExport()
    } else {
      window.print()
    }
  }

  return (
    <div className="relative z-30 flex justify-between items-center gap-4 px-2 py-2 backdrop-blur-md bg-white/70 border-b border-slate-200/50 transition-all w-full print:hidden">
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="text-sm md:text-sm font-black text-[#1e3a5f] uppercase tracking-widest leading-none flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#d4a843] rounded-full inline-block shadow-sm shrink-0"></span>
          <span className="truncate">{titulo}</span>
        </h1>
        {subtitulo && (
          <p className="text-[10px] md:text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-3.5 truncate">
            {subtitulo}
          </p>
        )}
      </div>

      {mostrarExportar && (
        <div className="relative flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={estaExportando}
            onClick={handleBotonPrincipal}
            aria-haspopup={tieneMenuDual ? "menu" : undefined}
            aria-expanded={tieneMenuDual ? menuAbierto : undefined}
            className="h-12 md:h-9 flex items-center gap-1.5 bg-gradient-to-r from-[#d4a843] to-[#c29636] hover:from-[#c29636] hover:to-[#b0832a] text-[#1e3a5f] px-4 md:px-3.5 rounded-lg transition-all shadow-sm active:scale-95 group border border-[#d4a843]/40 cursor-pointer disabled:opacity-60"
          >
            {estaExportando ? (
              <Loader2 className="h-4 w-4 md:h-3.5 md:w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 md:h-3.5 md:w-3.5" />
            )}
            <span className="text-xs md:text-[10px] font-black uppercase tracking-widest">
              {estaExportando ? "Exportando..." : "Exportar"}
            </span>
            {tieneMenuDual && (
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-150 ${
                  menuAbierto ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {tieneMenuDual && menuAbierto && (
            <>
              {/* Capa transparente para cerrar al tocar fuera (100% React, cero DOM nativo) */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => !estaExportando && setMenuAbierto(false)}
                aria-hidden="true"
              />

              <div
                role="menu"
                className="absolute right-0 top-full mt-2 z-50 w-64 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="px-3.5 py-2 bg-[#f8fafc] border-b border-slate-200">
                  <p className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-widest">
                    Formato de Exportación
                  </p>
                </div>

                <div className="p-1.5 space-y-1">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={estaExportando}
                    onClick={ejecutarPDF}
                    className="w-full min-h-12 md:min-h-9 px-3 py-2 rounded-lg flex items-center gap-2.5 text-left hover:bg-[#f8fafc] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="h-8 w-8 md:h-7 md:w-7 rounded-md bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shrink-0">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase leading-tight">
                        Imprimir en PDF
                      </p>
                      <p className="text-[10px] md:text-[9px] text-slate-400 font-semibold leading-tight mt-0.5">
                        Vista oficial institucional
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    disabled={estaExportando}
                    onClick={ejecutarXLSX}
                    className="w-full min-h-12 md:min-h-9 px-3 py-2 rounded-lg flex items-center gap-2.5 text-left hover:bg-[#f8fafc] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="h-8 w-8 md:h-7 md:w-7 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      {estaExportando ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase leading-tight">
                        Hoja de Cálculo (.xlsx)
                      </p>
                      <p className="text-[10px] md:text-[9px] text-slate-400 font-semibold leading-tight mt-0.5">
                        Archivo Excel con filtros
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}