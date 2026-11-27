import React from "react"

interface PrintReportLayoutProps<T extends object = Record<string, unknown>> {
  titulo: string
  subtitulo?: string
  columnas: string[]
  datos: T[]
  renderFila: (item: T, index: number) => React.ReactNode
}

export function PrintReportLayout<T extends object = Record<string, unknown>>({
  titulo,
  subtitulo,
  columnas,
  datos,
  renderFila
}: PrintReportLayoutProps<T>) {
  return (
    <div
      id="print-section"
      className="hidden print:block print:static print:h-auto print:min-h-0 print:overflow-visible w-full bg-white text-slate-900 p-0 m-0"
    >
      {/* Encabezado Oficial Institucional Unimar */}
      <div className="border-b-2 border-[#1e3a5f] pb-2 mb-3 flex justify-between items-end break-inside-avoid">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#d4a843] rounded-sm"></div>
          <div>
            <h1 className="text-xs font-black uppercase text-[#1e3a5f] tracking-wide">
              Universidad de Margarita — Departamento de Bienestar Estudiantil
            </h1>
            <p className="text-[11px] font-bold text-slate-700 uppercase mt-0.5">
              {titulo}
            </p>
            {subtitulo && (
              <p className="text-[9px] text-slate-500 uppercase">{subtitulo}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">
            Sistema de Becas UNIMAR
          </span>
          <span className="text-[9px] text-slate-600 font-semibold">
            Emisión: {new Date().toLocaleDateString("es-VE")}
          </span>
        </div>
      </div>

      {/* Tabla Genérica Limpia con cabecera repetible y cierre inferior por hoja */}
      <table className="w-full border-collapse border border-slate-400 text-left text-[9px]">
        <thead className="print:[display:table-header-group]">
          <tr className="bg-[#1e3a5f] text-white uppercase tracking-wider">
            {columnas.map((col, idx) => (
              <th key={idx} className="p-1.5 border border-slate-400 font-bold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="print:[display:table-row-group]">
          {datos.map((item, index) => renderFila(item, index))}
        </tbody>
        <tfoot className="print:[display:table-footer-group]">
          <tr>
            <td
              colSpan={Math.max(columnas.length, 1)}
              className="p-0 border-t border-slate-400 h-0"
            />
          </tr>
        </tfoot>
      </table>

      {/* Pie de página institucional y Copyright */}
      <div className="mt-4 pt-2 border-t border-slate-300 flex flex-col gap-1 text-[8px] text-slate-500 break-inside-avoid">
        <div className="flex justify-between">
          <span>Documento oficial generado por plataforma web institucional.</span>
          <span>Total de registros incluidos: {datos.length}</span>
        </div>
        <div className="text-center font-bold text-slate-600 mt-1 pt-1 border-t border-slate-100 uppercase tracking-wider">
          © Copyright 2026-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela
        </div>
      </div>
    </div>
  )
}
