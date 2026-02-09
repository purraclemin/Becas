"use client"

import React, { useState, useEffect } from "react"
import { 
  Search, RotateCcw, ShieldCheck, GraduationCap, 
  ChevronLeft, ChevronRight, ArrowDown10
} from "lucide-react"

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

  const [alturaCalculada, setAlturaCalculada] = useState(7)

  useEffect(() => {
    const calcularFilasDisponibles = () => {
      if (typeof window !== 'undefined') {
        const alturaVentana = window.innerHeight;
        const espacioOcupado = 360; 
        const alturaFilaPromedio = 55; 
        const filasPosibles = Math.floor((alturaVentana - espacioOcupado) / alturaFilaPromedio);
        const filasFinal = Math.max(6, filasPosibles);
        
        setAlturaCalculada(filasFinal);
        
        if (!initialFilters.limit && setRegistrosPorPagina) {
           setRegistrosPorPagina(filasFinal);
        }
      }
    }

    calcularFilasDisponibles();
    window.addEventListener('resize', calcularFilasDisponibles);
    return () => window.removeEventListener('resize', calcularFilasDisponibles);
  }, []);

  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    status: initialFilters.status || "",
    carrera: initialFilters.carrera || "",
    tipoBeca: initialFilters.tipoBeca || "", 
    fecha: initialFilters.fecha || "", 
    vulnerabilidad: initialFilters.vulnerabilidad || "", 
    rankingElite: initialFilters.rankingElite === 'true' || initialFilters.rankingElite === true || false, 
    estadoEstudio: initialFilters.estadoEstudio || "", 
    filtroPromedio: initialFilters.filtroPromedio || "", 
    limit: initialFilters.limit || alturaCalculada 
  })

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: initialFilters.search || "",
      status: initialFilters.status || "",
      carrera: initialFilters.carrera || "",
      tipoBeca: initialFilters.tipoBeca || "",
      filtroPromedio: initialFilters.filtroPromedio || "", 
      rankingElite: initialFilters.rankingElite === 'true' || initialFilters.rankingElite === true
    }));
  }, [initialFilters]) 
  
  useEffect(() => {
    if (filters.search === initialFilters.search) return;

    const timer = setTimeout(() => {
      onFilterChange(filters)
    }, 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    const newFilters = { ...filters, [name]: val }
    setFilters(newFilters)
    
    if (type !== 'text') {
      onFilterChange(newFilters)
    }
  }

  const handleLimitChange = (e: any) => {
    const newLimit = Number(e.target.value)
    if (setRegistrosPorPagina) {
        setRegistrosPorPagina(newLimit)
    } else {
        const newFilters = { ...filters, limit: newLimit }
        setFilters(newFilters)
        onFilterChange(newFilters) 
    }
    setPaginaActual(1) 
  }

  const resetFilters = () => {
    const empty = {
      search: "", status: "", carrera: "", tipoBeca: "",
      fecha: "", vulnerabilidad: "", rankingElite: false, estadoEstudio: "",
      filtroPromedio: "", 
      limit: alturaCalculada 
    }
    setFilters(empty)
    onFilterChange(empty)
    setPaginaActual(1)
    if(setRegistrosPorPagina) setRegistrosPorPagina(alturaCalculada);
  }

  const selectClass = "w-full pl-2 pr-6 py-2 bg-slate-50/50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 outline-none focus:border-[#1a2744] focus:bg-white transition-all appearance-none cursor-pointer hover:border-slate-300"
  const iconClass = "absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
      
      {/* SECCIÓN SUPERIOR: BUSCADOR Y HERRAMIENTAS */}
      <div className="p-3 border-b border-slate-100 bg-white flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* BUSCADOR CON BOTÓN REINICIAR EN MÓVIL */}
        <div className="flex items-center gap-2 w-full xl:w-96">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              name="search"
              type="text"
              placeholder="Buscar por Nombre o Cédula..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-[#1a2744] focus:ring-1 focus:ring-[#1a2744]/10 transition-all"
              value={filters.search}
              onChange={handleChange}
            />
          </div>
          {/* Botón Reiniciar visible solo en Móvil/Tablet */}
          <button 
            onClick={resetFilters}
            className="xl:hidden flex items-center justify-center p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors shadow-sm"
            title="Reiniciar Filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* HERRAMIENTAS RESPONSIVAS */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between md:justify-end">
          
          {/* LEYENDA (Oculta en móviles pequeños) */}
          <div className="hidden lg:flex items-center gap-4 mr-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600"><div className="w-2.5 h-2.5 rounded-full bg-[#cbd5e1]"></div>Ver</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#4a89dc]"><div className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]"></div>Rev</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#2ecc71]"><div className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></div>Apr</div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#e74c3c]"><div className="w-2.5 h-2.5 rounded-full bg-[#fb7185]"></div>Rec</div>
          </div>

          {/* SELECTOR FILAS */}
          <div className="flex items-center bg-slate-50 rounded border border-slate-200 px-2 h-9">
            <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Filas:</span>
            <select 
              value={registrosPorPagina || filters.limit} 
              onChange={handleLimitChange} 
              className="bg-transparent py-1.5 text-[10px] font-bold outline-none cursor-pointer"
            >
              <option value={alturaCalculada}>Auto</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* PAGINACIÓN */}
          {!loading && hasData && (
            <div className="flex items-center bg-slate-50 rounded border border-slate-200 p-0.5 h-9">
              <button 
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} 
                disabled={paginaActual === 1} 
                className="p-1.5 rounded hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-[10px] font-black text-[#1a2744] min-w-[50px] text-center">
                {paginaActual} / {totalPaginas}
              </span>
              <button 
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} 
                disabled={paginaActual === totalPaginas} 
                className="p-1.5 rounded hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: FILTROS AVANZADOS */}
      <div className="bg-slate-50/30 p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          
          <div className="relative">
            <select name="status" value={filters.status} onChange={handleChange} className={selectClass}>
              <option value="">Estatus: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">Revisión</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
            <ArrowDown10 className={iconClass} />
          </div>

          <div className="relative col-span-2 md:col-span-2">
            <select name="carrera" value={filters.carrera} onChange={handleChange} className={selectClass}>
              <option value="">Todas las Carreras</option>
              <option value="Ingenieria de Sistemas">Ingeniería de Sistemas</option>
              <option value="Ingenieria Industrial">Ingeniería Industrial</option>
              <option value="Administracion">Administración</option>
              <option value="Contaduria Publica">Contaduría Pública</option>
              <option value="Derecho">Derecho</option>
              <option value="Psicologia">Psicología</option>
              <option value="Educacion Integral">Educación Integral</option>
              <option value="Diseño Grafico">Diseño Gráfico</option>
              <option value="Idiomas Modernos">Idiomas Modernos</option>
              <option value="Comunicacion Social">Comunicación Social</option>
              <option value="Turismo">Turismo</option>
            </select>
            <GraduationCap className={iconClass} />
          </div>

          <div className="relative">
             <select name="tipoBeca" value={filters.tipoBeca} onChange={handleChange} className={selectClass}>
              <option value="">Beca: Todas</option>
              <option value="Academica">Académica</option>
              <option value="Socioeconomica">Socioeconomica</option>
              <option value="Deportiva">Deportiva</option>
              <option value="Excelencia">Excelencia</option>
            </select>
          </div>

          <div className="relative">
            <select name="vulnerabilidad" value={filters.vulnerabilidad} onChange={handleChange} className={selectClass}>
              <option value="">Riesgo</option>
              <option value="Alto">Alta (60+)</option>
              <option value="Medio">Media (30-59)</option>
              <option value="Bajo">Baja (0-29)</option>
            </select>
          </div>

          <div className="relative">
            <select name="filtroPromedio" value={filters.filtroPromedio} onChange={handleChange} className={selectClass}>
              <option value="">Promedio</option>
              <option value="19-20">19-20</option>
              <option value="16-18">16-18</option>
              <option value="10-15">10-15</option>
            </select>
          </div>

          <div className="relative">
            <select name="estadoEstudio" value={filters.estadoEstudio} onChange={handleChange} className={selectClass}>
              <option value="">Estudio</option>
              <option value="Hecho">Hecho</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
             <label className={`flex-1 flex items-center justify-center gap-1 h-full rounded border cursor-pointer transition-all ${filters.rankingElite ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-slate-200 text-slate-400'}`}>
              <input type="checkbox" name="rankingElite" className="hidden" checked={filters.rankingElite} onChange={handleChange} />
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase">Aptos</span>
            </label>
            
            {/* Botón Reiniciar visible solo en Escritorio para mantener balance */}
            <button 
              onClick={resetFilters}
              className="hidden xl:flex items-center justify-center h-full px-2.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded border border-slate-200 hover:border-rose-200 transition-all"
              title="Limpiar Filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}