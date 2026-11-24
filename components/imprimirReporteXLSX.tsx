"use client"

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react"
import type {
  Alignment,
  Borders,
  CellValue,
  Fill,
  Font,
  Workbook,
} from "exceljs"

export type CeldaXLSX = string | number | boolean | Date | null | undefined

export interface ReporteXLSXConfig<T = Record<string, unknown>> {
  titulo: string
  subtitulo?: string
  nombreHoja?: string
  nombreArchivo?: string
  columnas: string[]
  datos: T[]
  mapearFila: (item: T, index: number) => CeldaXLSX[]
}

export interface ExportReportXLSXProps<T = Record<string, unknown>>
  extends ReporteXLSXConfig<T> {
  onEstadoCambio?: (exportando: boolean) => void
}

export interface ExportReportXLSXHandle {
  exportar: () => Promise<void>
}

interface ArchivoDescarga {
  url: string
  fileName: string
}

interface ExcelJSModuleShape {
  Workbook?: new () => Workbook
  default?: {
    Workbook?: new () => Workbook
  }
}

const COLOR_AZUL_UNIMAR = "FF1E3A5F"
const COLOR_DORADO_UNIMAR = "FFD4A843"
const COLOR_FONDO_CLARO = "FFF8FAFC"
const COLOR_BLANCO = "FFFFFFFF"
const COLOR_BORDE_SUAVE = "FFCBD5E1"
const COLOR_TEXTO_OSCURO = "FF0F172A"
const COLOR_TEXTO_SECUNDARIO = "FF475569"

const sanitizarNombreHoja = (texto: string): string => {
  const limpio = texto
    .replace(/[\\/?*[\]:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (!limpio) return "Reporte_UNIMAR"
  return limpio.slice(0, 31)
}

const sanitizarNombreArchivo = (texto: string): string => {
  const fechaIso = new Date().toISOString().slice(0, 10)
  const slug = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
  return `${slug || "reporte_unimar"}_${fechaIso}.xlsx`
}

const normalizarCelda = (valor: CeldaXLSX): CellValue => {
  if (valor === null || valor === undefined) return "---"
  if (typeof valor === "string") {
    const trimmed = valor.trim()
    return trimmed === "" ? "---" : trimmed
  }
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : "---"
  }
  if (typeof valor === "boolean") {
    return valor ? "Sí" : "No"
  }
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? "---" : valor
  }
  return String(valor)
}

const longitudVisualCelda = (valor: CellValue): number => {
  if (valor === null || valor === undefined) return 3
  if (valor instanceof Date) return 12
  return String(valor).length
}

export async function generarArchivoReporteXLSX<T = Record<string, unknown>>(
  config: ReporteXLSXConfig<T>
): Promise<{ blob: Blob; fileName: string }> {
  const {
    titulo,
    subtitulo,
    nombreHoja,
    nombreArchivo,
    columnas,
    datos,
    mapearFila,
  } = config

  const moduloImportado = (await import("exceljs")) as unknown as ExcelJSModuleShape
  const WorkbookConstructor =
    moduloImportado.Workbook ?? moduloImportado.default?.Workbook

  if (!WorkbookConstructor) {
    throw new Error("No se pudo inicializar el motor de hojas de cálculo (ExcelJS).")
  }

  const workbook = new WorkbookConstructor()
  workbook.creator = "Sistema de Becas UNIMAR"
  workbook.created = new Date()
  workbook.modified = new Date()

  const totalColumnas = Math.max(columnas.length, 1)
  const worksheet = workbook.addWorksheet(
    sanitizarNombreHoja(nombreHoja || titulo),
    {
      views: [{ state: "frozen", ySplit: 5 }],
      pageSetup: {
        orientation: totalColumnas >= 5 ? "landscape" : "portrait",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    }
  )

  const fechaEmision = new Date().toLocaleDateString("es-VE")

  const fillAzul: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_AZUL_UNIMAR },
  }

  const fillClaro: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_FONDO_CLARO },
  }

  const fillBlanco: Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR_BLANCO },
  }

  const bordeCeldaDatos: Partial<Borders> = {
    top: { style: "thin", color: { argb: COLOR_BORDE_SUAVE } },
    left: { style: "thin", color: { argb: COLOR_BORDE_SUAVE } },
    bottom: { style: "thin", color: { argb: COLOR_BORDE_SUAVE } },
    right: { style: "thin", color: { argb: COLOR_BORDE_SUAVE } },
  }

  // FILA 1: Encabezado Institucional UNIMAR
  const filaInstitucional = worksheet.addRow([
    "UNIVERSIDAD DE MARGARITA — DEPARTAMENTO DE BIENESTAR ESTUDIANTIL",
  ])
  if (totalColumnas > 1) {
    worksheet.mergeCells(1, 1, 1, totalColumnas)
  }
  filaInstitucional.height = 28
  const celdaBanner = filaInstitucional.getCell(1)
  celdaBanner.fill = fillAzul
  celdaBanner.font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: COLOR_BLANCO },
  } as Partial<Font>
  celdaBanner.alignment = {
    vertical: "middle",
    horizontal: "left",
    indent: 1,
  } as Partial<Alignment>

  // FILA 2: Título del Reporte con acento dorado inferior
  const filaTitulo = worksheet.addRow([titulo.toUpperCase()])
  if (totalColumnas > 1) {
    worksheet.mergeCells(2, 1, 2, totalColumnas)
  }
  filaTitulo.height = 22
  const celdaTitulo = filaTitulo.getCell(1)
  celdaTitulo.fill = fillClaro
  celdaTitulo.font = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: COLOR_AZUL_UNIMAR },
  } as Partial<Font>
  celdaTitulo.alignment = {
    vertical: "middle",
    horizontal: "left",
    indent: 1,
  } as Partial<Alignment>
  for (let colIdx = 1; colIdx <= totalColumnas; colIdx++) {
    filaTitulo.getCell(colIdx).border = {
      bottom: { style: "medium", color: { argb: COLOR_DORADO_UNIMAR } },
    }
  }

  // FILA 3: Subtítulo y metadatos de emisión
  const textoMeta = [
    subtitulo ? subtitulo.toUpperCase() : null,
    "SISTEMA DE BECAS UNIMAR",
    `EMISIÓN: ${fechaEmision}`,
  ]
    .filter((parte): parte is string => Boolean(parte))
    .join("   |   ")

  const filaMeta = worksheet.addRow([textoMeta])
  if (totalColumnas > 1) {
    worksheet.mergeCells(3, 1, 3, totalColumnas)
  }
  filaMeta.height = 18
  const celdaMeta = filaMeta.getCell(1)
  celdaMeta.fill = fillBlanco
  celdaMeta.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: COLOR_TEXTO_SECUNDARIO },
  } as Partial<Font>
  celdaMeta.alignment = {
    vertical: "middle",
    horizontal: "left",
    indent: 1,
  } as Partial<Alignment>

  // FILA 4: Espaciador limpio
  const filaEspaciador = worksheet.addRow([])
  filaEspaciador.height = 8

  // FILA 5: Cabeceras de columnas
  const encabezados = columnas.map((col) => col.toUpperCase())
  const filaEncabezado = worksheet.addRow(encabezados)
  filaEncabezado.height = 24
  filaEncabezado.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = fillAzul
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: COLOR_BLANCO },
    } as Partial<Font>
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    } as Partial<Alignment>
    cell.border = {
      top: { style: "thin", color: { argb: COLOR_AZUL_UNIMAR } },
      left: { style: "thin", color: { argb: COLOR_BORDE_SUAVE } },
      right: { style: "thin", color: { argb: COLOR_BORDE_SUAVE } },
      bottom: { style: "medium", color: { argb: COLOR_DORADO_UNIMAR } },
    }
  })

  worksheet.autoFilter = {
    from: { row: 5, column: 1 },
    to: { row: 5, column: totalColumnas },
  }

  // Control de anchos automáticos
  const anchosMaximos: number[] = columnas.map((col) =>
    Math.max(col.length + 4, 14)
  )

  // FILAS DE DATOS
  if (datos.length === 0) {
    const filaVacia = worksheet.addRow([
      "No existen registros disponibles para este reporte.",
    ])
    const numFilaVacia = filaVacia.number
    if (totalColumnas > 1) {
      worksheet.mergeCells(numFilaVacia, 1, numFilaVacia, totalColumnas)
    }
    filaVacia.height = 24
    const celdaVacia = filaVacia.getCell(1)
    celdaVacia.font = {
      name: "Calibri",
      size: 10,
      italic: true,
      color: { argb: COLOR_TEXTO_SECUNDARIO },
    } as Partial<Font>
    celdaVacia.alignment = {
      vertical: "middle",
      horizontal: "center",
    } as Partial<Alignment>
    for (let colIdx = 1; colIdx <= totalColumnas; colIdx++) {
      filaVacia.getCell(colIdx).border = bordeCeldaDatos
    }
  } else {
    datos.forEach((item, index) => {
      const valoresCrudos = mapearFila(item, index)
      const valoresNormalizados: CellValue[] = columnas.map((_, colIdx) =>
        normalizarCelda(valoresCrudos[colIdx])
      )

      const filaDatos = worksheet.addRow(valoresNormalizados)
      filaDatos.height = 20

      const fillFila = index % 2 === 0 ? fillBlanco : fillClaro

      filaDatos.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const idxCol = colNumber - 1
        const val = valoresNormalizados[idxCol]

        cell.fill = fillFila
        cell.border = bordeCeldaDatos
        cell.font = {
          name: "Calibri",
          size: 10,
          color: { argb: COLOR_TEXTO_OSCURO },
        } as Partial<Font>

        if (typeof val === "number") {
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          } as Partial<Alignment>
        } else if (val instanceof Date) {
          cell.numFmt = "dd/mm/yyyy"
          cell.alignment = {
            vertical: "middle",
            horizontal: "center",
          } as Partial<Alignment>
        } else {
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          } as Partial<Alignment>
        }

        const longitud = longitudVisualCelda(val) + 4
        if (idxCol >= 0 && idxCol < anchosMaximos.length) {
          anchosMaximos[idxCol] = Math.max(anchosMaximos[idxCol], longitud)
        }
      })
    })
  }

  // Aplicar anchos calculados (limitados entre 14 y 44 caracteres)
  anchosMaximos.forEach((ancho, index) => {
    const columna = worksheet.getColumn(index + 1)
    columna.width = Math.min(Math.max(ancho, 14), 44)
  })

  // Espaciador antes del pie institucional
  const filaEspaciadorPie = worksheet.addRow([])
  filaEspaciadorPie.height = 10

  // PIE DE PÁGINA INSTITUCIONAL
  const filaNota = worksheet.addRow([
    `Total de registros: ${datos.length}   |   Documento oficial generado por plataforma web institucional.`,
  ])
  const numFilaNota = filaNota.number
  if (totalColumnas > 1) {
    worksheet.mergeCells(numFilaNota, 1, numFilaNota, totalColumnas)
  }
  filaNota.height = 18
  const celdaNota = filaNota.getCell(1)
  celdaNota.font = {
    name: "Calibri",
    size: 9,
    italic: true,
    color: { argb: COLOR_TEXTO_SECUNDARIO },
  } as Partial<Font>
  celdaNota.alignment = {
    vertical: "middle",
    horizontal: "left",
  } as Partial<Alignment>
  for (let colIdx = 1; colIdx <= totalColumnas; colIdx++) {
    filaNota.getCell(colIdx).border = {
      top: { style: "thin", color: { argb: COLOR_DORADO_UNIMAR } },
    }
  }

  const filaCopyright = worksheet.addRow([
    "© COPYRIGHT 2026-2026 UNIVERSIDAD DE MARGARITA, RIF: J-30660040-0. ISLA DE MARGARITA - VENEZUELA",
  ])
  const numFilaCopyright = filaCopyright.number
  if (totalColumnas > 1) {
    worksheet.mergeCells(numFilaCopyright, 1, numFilaCopyright, totalColumnas)
  }
  filaCopyright.height = 18
  const celdaCopyright = filaCopyright.getCell(1)
  celdaCopyright.font = {
    name: "Calibri",
    size: 8.5,
    bold: true,
    color: { argb: COLOR_AZUL_UNIMAR },
  } as Partial<Font>
  celdaCopyright.alignment = {
    vertical: "middle",
    horizontal: "center",
  } as Partial<Alignment>

  // Escritura segura a Blob en memoria
  const rawBuffer = await workbook.xlsx.writeBuffer()
  const bytes = new Uint8Array(rawBuffer)
  const cleanCopy = new Uint8Array(bytes.byteLength)
  cleanCopy.set(bytes)

  const blob = new Blob([cleanCopy.buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })

  return {
    blob,
    fileName: sanitizarNombreArchivo(nombreArchivo || titulo),
  }
}

function ExportReportXLSXInner<T = Record<string, unknown>>(
  props: ExportReportXLSXProps<T>,
  ref: React.ForwardedRef<ExportReportXLSXHandle>
) {
  const {
    titulo,
    subtitulo,
    nombreHoja,
    nombreArchivo,
    columnas,
    datos,
    mapearFila,
    onEstadoCambio,
  } = props

  const [descarga, setDescarga] = useState<ArchivoDescarga | null>(null)
  const anchorRef = useRef<HTMLAnchorElement | null>(null)

  const exportar = useCallback(async () => {
    onEstadoCambio?.(true)
    try {
      const { blob, fileName } = await generarArchivoReporteXLSX({
        titulo,
        subtitulo,
        nombreHoja,
        nombreArchivo,
        columnas,
        datos,
        mapearFila,
      })

      const url = URL.createObjectURL(blob)
      setDescarga({ url, fileName })
    } catch (error) {
      console.error("Error al generar reporte XLSX:", error)
    } finally {
      onEstadoCambio?.(false)
    }
  }, [
    titulo,
    subtitulo,
    nombreHoja,
    nombreArchivo,
    columnas,
    datos,
    mapearFila,
    onEstadoCambio,
  ])

  useImperativeHandle(
    ref,
    () => ({
      exportar,
    }),
    [exportar]
  )

  useEffect(() => {
    if (!descarga || !anchorRef.current) return

    anchorRef.current.click()
    const urlActual = descarga.url

    const timer = setTimeout(() => {
      URL.revokeObjectURL(urlActual)
      setDescarga(null)
    }, 1500)

    return () => {
      clearTimeout(timer)
    }
  }, [descarga])

  return (
    <a
      ref={anchorRef}
      href={descarga?.url}
      download={descarga?.fileName}
      className="hidden"
      aria-hidden="true"
      tabIndex={-1}
    />
  )
}

export const ExportReportXLSX = forwardRef(ExportReportXLSXInner) as <
  T = Record<string, unknown>
>(
  props: ExportReportXLSXProps<T> & {
    ref?: React.Ref<ExportReportXLSXHandle>
  }
) => React.ReactElement