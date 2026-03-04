"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { SolicitudesFiltersHeader } from "./SolicitudesFiltersHeader"
import { SolicitudesFiltersBar } from "./SolicitudesFiltersBar"
import { AlertCircle } from "lucide-react"

interface SolicitudesFiltersProps {
  onFilterChange: (filters: any) => void
  initialFilters?: any
  totalPaginas: number
  paginaActual: number
  setPaginaActual: (page: number) => void
  loading: boolean
  hasData: boolean
  registrosPorPagina?: number
  setRegistrosPorPagina?: (val: number) => void
}

export function SolicitudesFilters({ 
  onFilterChange, 
  initialFilters = {},
  totalPaginas,
  paginaActual,
  setPaginaActual,
  loading,
  hasData,
  registrosPorPagina,
  setRegistrosPorPagina
}: SolicitudesFiltersProps) {

  const router = useRouter()
  const initialized = useRef(false) 
  
  const obtenerFilasPorAltura = () => {
    if (typeof window === "undefined") return 7
    const alturaVentana = window.innerHeight
    const filasPosibles = Math.floor((alturaVentana - 360) / 55)
    return Math.max(6, filasPosibles)
  }

  const [alturaCalculada, setAlturaCalculada] = useState(7)

  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    status: initialFilters.status || "",
    municipio: initialFilters.municipio || "", 
    carrera: initialFilters.carrera || "",
    trimestre: initialFilters.trimestre || "", 
    tipoBeca: initialFilters.tipoBeca || "", 
    fecha: initialFilters.fecha || "", 
    vulnerabilidad: initialFilters.vulnerabilidad || "", 
    rankingElite: !!initialFilters.rankingElite, 
    estadoEstudio: initialFilters.estadoEstudio || "", 
    filtroPromedio: initialFilters.filtroPromedio || "", 
    limit: initialFilters.limit || 7,
    // 🟢 CAMPOS DE INTEGRACIÓN ANALYTICS
    es_renovacion: initialFilters.es_renovacion || "",
    promedioMin: initialFilters.promedioMin || "",
    vulnerabilidadMin: initialFilters.vulnerabilidadMin || "",
    tendencia: initialFilters.tendencia || "",
    scope: initialFilters.scope || "" // 📊 Agregado scope para persistencia de la Barra 5
  })

  const getActiveFiltersCount = useCallback(() => {
    // Excluimos parámetros técnicos de la cuenta de filtros activos
    const keysToExclude = ['limit', 'search', 'es_renovacion', 'promedioMin', 'vulnerabilidadMin', 'tendencia', 'scope']
    return Object.keys(filters).filter(key => {
      if (keysToExclude.includes(key)) return false
      const val = filters[key as keyof typeof filters]
      return typeof val === 'boolean' ? val === true : val !== ""
    }).length
  }, [filters])

  const activeFiltersCount = getActiveFiltersCount()
  const MAX_FILTROS_RECOMENDADOS = 4

  const resetFilters = useCallback(() => {
    const empty = {
      search: "", 
      status: "", 
      municipio: "", 
      carrera: "", 
      trimestre: "", 
      tipoBeca: "", 
      fecha: "", 
      vulnerabilidad: "", 
      rankingElite: false, 
      estadoEstudio: "",
      filtroPromedio: "", 
      limit: alturaCalculada,
      // 🟢 RESET DE CAMPOS ANALYTICS
      es_renovacion: "",
      promedioMin: "",
      vulnerabilidadMin: "",
      tendencia: "",
      scope: "" // 📊 Limpieza del scope
    }
    setFilters(empty)
    setPaginaActual(1)
    if (setRegistrosPorPagina) setRegistrosPorPagina(alturaCalculada)
    onFilterChange(empty)
    router.push('/admin/solicitudes')
  }, [alturaCalculada, onFilterChange, setPaginaActual, setRegistrosPorPagina, router])

  useEffect(() => {
    if (!initialized.current) {
      const filas = obtenerFilasPorAltura()
      setAlturaCalculada(filas)
      
      if (!initialFilters.limit && setRegistrosPorPagina) {
        setRegistrosPorPagina(filas)
        setFilters(prev => ({ ...prev, limit: filas }))
      }
      initialized.current = true
    }

    const handleResize = () => {
      const filas = obtenerFilasPorAltura()
      setAlturaCalculada(filas)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initialFilters.limit, setRegistrosPorPagina])

  useEffect(() => {
    // Sincroniza todos los filtros de la URL incluyendo el scope
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters]) 
  
  useEffect(() => {
    const timer = setTimeout(() => onFilterChange(filters), 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    const newFilters = { ...filters, [name]: val }
    setFilters(newFilters)
    if (type !== 'text') onFilterChange(newFilters)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
      <SolicitudesFiltersHeader 
        filters={filters}
        handleChange={handleInputChange}
        resetFilters={resetFilters}
        registrosPorPagina={registrosPorPagina}
        setRegistrosPorPagina={setRegistrosPorPagina}
        alturaCalculada={alturaCalculada}
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        setPaginaActual={setPaginaActual}
        loading={loading}
        hasData={hasData}
        activeFiltersCount={activeFiltersCount}
      />
      
      {activeFiltersCount >= MAX_FILTROS_RECOMENDADOS && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 animate-in slide-in-from-top-1">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
            Aviso: {activeFiltersCount} filtros activos. La búsqueda es muy restrictiva.
          </p>
        </div>
      )}

      <SolicitudesFiltersBar 
        filters={filters}
        handleChange={handleInputChange}
        resetFilters={resetFilters}
      />
    </div>
  )
}