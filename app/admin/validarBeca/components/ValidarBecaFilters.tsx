"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, RotateCcw, Filter, 
  AlertCircle 
} from "lucide-react"
import { Boton100registros } from "./Boton100registros"
import { ControlesPaginacion } from "./ControlesPaginacion"
import { OpcionesFiltros } from "./OpcionesFiltros"
import { calcularFilasPorAltura } from "@/app/admin/validarBeca/lib/ControlesPaginacion"

interface FiltrosValidacionState {
  search: string;
  status: string;
  municipio: string;
  carrera: string;
  trimestre: string;
  tipoBeca: string;
  fecha: string;
  vulnerabilidad: string;
  rankingElite?: boolean; // Mantenido opcional por tipado
  estadoEstudio: string;
  filtroPromedio: string;
  limit: number;
  es_renovacion?: string;
  promedioMin?: string;
  vulnerabilidadMin?: string;
  tendencia?: string;
  scope?: string;
}

interface ValidarBecaFiltersProps {
  onFilterChange: (filters: FiltrosValidacionState) => void;
  initialFilters?: Partial<FiltrosValidacionState>;
  totalPaginas: number;
  paginaActual: number;
  setPaginaActual: (page: number | ((prev: number) => number)) => void;
  loading: boolean;
  hasData: boolean;
  registrosPorPagina: number;
  setRegistrosPorPagina?: (limit: number) => void;
  onOpenAptoIA: () => void; // 👈 Conectado para abrir el modal de IA
}

export function ValidarBecaFilters({ 
  onFilterChange, 
  initialFilters = {},
  totalPaginas,
  paginaActual,
  setPaginaActual,
  loading,
  hasData,
  registrosPorPagina,
  setRegistrosPorPagina,
  onOpenAptoIA
}: ValidarBecaFiltersProps) {

  const router = useRouter()
  const initialized = useRef(false) 
  
  const [alturaCalculada, setAlturaCalculada] = useState(7)

  const [filters, setFilters] = useState<FiltrosValidacionState>({
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
    es_renovacion: initialFilters.es_renovacion || "",
    promedioMin: initialFilters.promedioMin || "",
    vulnerabilidadMin: initialFilters.vulnerabilidadMin || "",
    tendencia: initialFilters.tendencia || "",
    scope: initialFilters.scope || ""
  })

  const getActiveFiltersCount = useCallback(() => {
    const keysToExclude: (keyof FiltrosValidacionState)[] = ['limit', 'search', 'es_renovacion', 'promedioMin', 'vulnerabilidadMin', 'tendencia', 'scope', 'rankingElite']
    return Object.keys(filters).filter(key => {
      if (keysToExclude.includes(key as keyof FiltrosValidacionState)) return false
      const val = filters[key as keyof FiltrosValidacionState]
      return typeof val === 'boolean' ? val === true : val !== ""
    }).length
  }, [filters])

  const activeFiltersCount = getActiveFiltersCount()
  const MAX_FILTROS_RECOMENDADOS = 4

  const resetFilters = useCallback(() => {
    const empty: FiltrosValidacionState = {
      search: "", status: "", municipio: "", carrera: "", trimestre: "", 
      tipoBeca: "", fecha: "", vulnerabilidad: "", rankingElite: false, 
      estadoEstudio: "", filtroPromedio: "", limit: alturaCalculada,
      es_renovacion: "", promedioMin: "", vulnerabilidadMin: "", tendencia: "", scope: ""
    }
    setFilters(empty)
    setPaginaActual(1)
    if (setRegistrosPorPagina) setRegistrosPorPagina(alturaCalculada)
    onFilterChange(empty)
    router.push('/admin/validarBeca')
  }, [alturaCalculada, onFilterChange, setPaginaActual, setRegistrosPorPagina, router])

  useEffect(() => {
    if (!initialized.current) {
      const filas = calcularFilasPorAltura()
      setAlturaCalculada(filas)
      if (!initialFilters.limit && setRegistrosPorPagina) {
        setRegistrosPorPagina(filas)
        setFilters(prev => ({ ...prev, limit: filas }))
      }
      initialized.current = true
    }
    const handleResize = () => setAlturaCalculada(calcularFilasPorAltura())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [initialFilters.limit, setRegistrosPorPagina])

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [initialFilters]) 
  
  useEffect(() => {
    const timer = setTimeout(() => onFilterChange(filters), 400)
    return () => clearTimeout(timer)
  }, [filters.search, onFilterChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    const type = target.type;
    const checked = 'checked' in target ? target.checked : false;

    const val = type === 'checkbox' ? checked : value
    const newFilters = { ...filters, [name]: val }
    setFilters(newFilters)
    if (type !== 'text') onFilterChange(newFilters)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-4">
      <div className="p-3 border-b border-slate-100 bg-white flex flex-col xl:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-[480px]">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="search" type="text" value={filters.search} onChange={handleInputChange}
              placeholder="Buscar por Nombre o Cédula..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#1e3a5f] transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1e3a5f] rounded-xl border border-[#1e3a5f]">
                <Filter className="h-3 w-3 text-[#d4a843]" />
                <span className="text-[10px] font-black text-white leading-none">{activeFiltersCount}</span>
              </div>
            )}
            
            <button onClick={resetFilters} className="p-2.5 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors group" title="Limpiar todos los filtros">
              <RotateCcw className="h-4 w-4 group-active:rotate-180 transition-transform duration-500" />
            </button>

            <Boton100registros />
          </div>
        </div>

        <ControlesPaginacion 
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          setPaginaActual={setPaginaActual}
          registrosPorPagina={registrosPorPagina || filters.limit}
          setRegistrosPorPagina={setRegistrosPorPagina}
          alturaCalculada={alturaCalculada}
          loading={loading}
          hasData={hasData}
        />
      </div>

      {activeFiltersCount > 0 && (
        <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex items-center gap-2 animate-pulse">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          <p className="text-[9px] font-black text-rose-700 uppercase tracking-widest">
            ¡Atención! Tienes {activeFiltersCount} cantidad de filtros activos aplicando en la consulta actual.
          </p>
        </div>
      )}

      {activeFiltersCount >= MAX_FILTROS_RECOMENDADOS && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
            Aviso: {activeFiltersCount} filtros activos. La búsqueda es muy restrictiva.
          </p>
        </div>
      )}

      <OpcionesFiltros 
        filters={filters} 
        handleInputChange={handleInputChange} 
        resetFilters={resetFilters} 
        onOpenAptoIA={onOpenAptoIA}
      />
    </div>
  )
}