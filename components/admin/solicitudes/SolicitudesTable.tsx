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
    
    // Si ya estamos ordenando por esta columna y es ascendente, cambiamos a descendente
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // --- PROCESAR DATOS ORDENADOS ---
  // Creamos una copia de 'data' para no mutar el prop original
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a: any, b: any) => {
      // Determinamos los valores a comparar según la columna
      let aValue = a[sortConfig.key!]
      let bValue = b[sortConfig.key!]

      // Casos especiales (Objetos anidados o campos combinados)
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

      // Lógica de comparación
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

  // Vista de Carga
  if (loading) return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-pulse">
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sincronizando registros...</p>
    </div>
  )

  // Vista Vacía
  if (data.length === 0) return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
      <MoreHorizontal className="h-6 w-6 text-slate-300 mb-2" />
      <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest">Sin resultados</h3>
      <p className="text-slate-500 text-[10px] uppercase">No hay solicitudes que coincidan con la búsqueda</p>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#1a2744] text-white">
            <tr className="text-[10px] font-black uppercase tracking-widest">
              
              {/* COLUMNA ID */}
              <th 
                className="px-6 py-4 text-left w-20 cursor-pointer hover:bg-[#23355b] transition-colors group"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-1">
                  ID {getSortIcon('id')}
                </div>
              </th>

              {/* COLUMNA ESTUDIANTE */}
              <th 
                className="px-6 py-4 text-left cursor-pointer hover:bg-[#23355b] transition-colors group"
                onClick={() => handleSort('estudiante')}
              >
                <div className="flex items-center gap-1">
                  Estudiante {getSortIcon('estudiante')}
                </div>
              </th>

              {/* COLUMNA CARRERA */}
              <th 
                className="px-6 py-4 text-left hidden md:table-cell cursor-pointer hover:bg-[#23355b] transition-colors group"
                onClick={() => handleSort('carrera')}
              >
                <div className="flex items-center gap-1">
                  Carrera / Becas {getSortIcon('carrera')}
                </div>
              </th>

              {/* COLUMNA VULNERABILIDAD */}
              <th 
                className="px-6 py-4 text-center hidden lg:table-cell cursor-pointer hover:bg-[#23355b] transition-colors group"
                onClick={() => handleSort('vulnerabilidad')}
              >
                <div className="flex items-center justify-center gap-1">
                  Vulnerabilidad {getSortIcon('vulnerabilidad')}
                </div>
              </th>

              {/* COLUMNA PROMEDIO */}
              <th 
                className="px-6 py-4 text-center hidden lg:table-cell cursor-pointer hover:bg-[#23355b] transition-colors group"
                onClick={() => handleSort('promedio')}
              >
                <div className="flex items-center justify-center gap-1">
                  Promedio {getSortIcon('promedio')}
                </div>
              </th>

              {/* COLUMNA ESTATUS */}
              <th 
                className="px-6 py-4 text-left hidden sm:table-cell cursor-pointer hover:bg-[#23355b] transition-colors group"
                onClick={() => handleSort('estatus')}
              >
                <div className="flex items-center gap-1">
                  Estatus {getSortIcon('estatus')}
                </div>
              </th>

              <th className="px-6 py-4 text-right">Acciones</th>
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