"use client"

import React, { useState } from "react"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { SolicitudesTableRow } from "./SolicitudesTableRow"

// 🟢 Recibe onViewHistorial para servir de puente entre la fila y la vista principal
export function SolicitudesTable({ data, loading, onView, onViewHistorial, onStatusChange, periodoActualId }: any) {
  
  // --- ESTADO PARA EL ORDENAMIENTO ---
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  })

  // --- FUNCIÓN DE ORDENAMIENTO ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // --- PROCESAR DATOS ORDENADOS ---
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a: any, b: any) => {
      let aValue = a[sortConfig.key!]
      let bValue = b[sortConfig.key!]

      if (sortConfig.key === 'estudiante') {
        aValue = `${a.nombre} ${a.apellido}`.toLowerCase()
        bValue = `${b.nombre} ${b.apellido}`.toLowerCase()
      } else if (sortConfig.key === 'vulnerabilidad') {
        aValue = Number(a.puntaje || 0)
        bValue = Number(b.puntaje || 0)
      } else if (sortConfig.key === 'promedio') {
        aValue = Number(a.promedio_notas || 0)
        bValue = Number(b.promedio_notas || 0)
      } else if (sortConfig.key === 'trimestre') {
        aValue = Number(a.semestre || a.trimestre || 0)
        bValue = Number(b.semestre || b.trimestre || 0)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  // --- COMPONENTE VISUAL PARA EL ICONO DE FLECHA ---
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-white" /> 
      : <ArrowDown className="h-3 w-3 text-white" />
  }

  if (loading) return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-pulse">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando registros...</p>
    </div>
  )

  if (data.length === 0) return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center">
      <MoreHorizontal className="h-5 w-5 text-slate-300 mb-2" />
      <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Sin resultados</h3>
      <p className="text-slate-500 text-[9px] uppercase">No hay solicitudes que coincidan con la búsqueda</p>
    </div>
  )

  // Clase base optimizada para mayor densidad
  const thClass = "px-4 py-3 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#23355b] transition-colors group"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#1a2744] text-white">
            <tr>
              {/* ID */}
              <th className={`${thClass} text-left w-16`} onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">ID {getSortIcon('id')}</div>
              </th>

              {/* Estudiante */}
              <th className={`${thClass} text-left`} onClick={() => handleSort('estudiante')}>
                <div className="flex items-center gap-1">Estudiante {getSortIcon('estudiante')}</div>
              </th>

              {/* Municipio */}
              <th className={`${thClass} text-left hidden lg:table-cell`} onClick={() => handleSort('municipio_residencia')}>
                <div className="flex items-center gap-1">Municipio {getSortIcon('municipio_residencia')}</div>
              </th>

              {/* Carrera */}
              <th className={`${thClass} text-left hidden md:table-cell`} onClick={() => handleSort('carrera')}>
                <div className="flex items-center gap-1">Carrera / Becas {getSortIcon('carrera')}</div>
              </th>

              {/* Trimestre */}
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('trimestre')}>
                <div className="flex items-center justify-center gap-1">Trim. {getSortIcon('trimestre')}</div>
              </th>

              {/* Vulnerabilidad */}
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('vulnerabilidad')}>
                <div className="flex items-center justify-center gap-1">Vulnerabilidad {getSortIcon('vulnerabilidad')}</div>
              </th>

              {/* Promedio */}
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('promedio')}>
                <div className="flex items-center justify-center gap-1">Prom/Global {getSortIcon('promedio')}</div>
              </th>

              {/* Estatus */}
              <th className={`${thClass} text-center hidden sm:table-cell`} onClick={() => handleSort('estatus')}>
                <div className="flex items-center justify-center gap-1">Estatus {getSortIcon('estatus')}</div>
              </th>

              {/* Acciones */}
              <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right bg-[#1a2744] text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((s: any, index: number) => (
              <SolicitudesTableRow 
                key={`${s.id}-${index}`} 
                s={s} 
                onView={onView} 
                onViewHistorial={onViewHistorial} // 🟢 Pasamos la función de historial a la fila
                onStatusChange={onStatusChange} 
                periodoActualId={periodoActualId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}