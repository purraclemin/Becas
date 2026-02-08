"use client"

import React, { useState } from "react"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { SolicitudesTableRow } from "./SolicitudesTableRow"

export function SolicitudesTable({ data, loading, onView, onStatusChange }: any) {
  
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
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-pulse">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando registros...</p>
    </div>
  )

  if (data.length === 0) return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
      <MoreHorizontal className="h-6 w-6 text-slate-300 mb-2" />
      <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest">Sin resultados</h3>
      <p className="text-slate-500 text-[10px] uppercase">No hay solicitudes que coincidan con la búsqueda</p>
    </div>
  )

  // Clase base para uniformidad en los encabezados
  const thClass = "px-6 py-4 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#23355b] transition-colors group"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#1a2744] text-white">
            <tr>
              {/* ID */}
              <th className={`${thClass} text-left w-20`} onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">ID {getSortIcon('id')}</div>
              </th>

              {/* Estudiante */}
              <th className={`${thClass} text-left`} onClick={() => handleSort('estudiante')}>
                <div className="flex items-center gap-1">Estudiante {getSortIcon('estudiante')}</div>
              </th>

              {/* Carrera */}
              <th className={`${thClass} text-left hidden md:table-cell`} onClick={() => handleSort('carrera')}>
                <div className="flex items-center gap-1">Carrera / Becas {getSortIcon('carrera')}</div>
              </th>

              {/* Vulnerabilidad */}
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('vulnerabilidad')}>
                <div className="flex items-center justify-center gap-1">Vulnerabilidad {getSortIcon('vulnerabilidad')}</div>
              </th>

              {/* Promedio */}
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('promedio')}>
                <div className="flex items-center justify-center gap-1">Promedio {getSortIcon('promedio')}</div>
              </th>

              {/* Estatus (AHORA CENTRADO) */}
              <th className={`${thClass} text-center hidden sm:table-cell`} onClick={() => handleSort('estatus')}>
                <div className="flex items-center justify-center gap-1">Estatus {getSortIcon('estatus')}</div>
              </th>

              {/* Acciones (FONDO CONTINUO) */}
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right bg-[#1a2744] text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((s: any) => (
              <SolicitudesTableRow 
                key={s.id} 
                s={s} 
                onView={onView} 
                onStatusChange={onStatusChange} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}