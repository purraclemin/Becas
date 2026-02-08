"use client"

import React, { useState, useEffect } from "react"
import { 
  Search, RotateCcw, ShieldCheck, Calendar, GraduationCap, 
  Eye, Clock, Check, X, ChevronLeft, ChevronRight 
} from "lucide-react"

// Agregamos las props necesarias para que la paginación funcione
interface SolicitudesFiltersProps {
  onFilterChange: (filters: any) => void
  initialFilters?: any
  totalPaginas: number
  paginaActual: number
  setPaginaActual: (page: number) => void
  loading: boolean
  hasData: boolean
  // --- ACTUALIZACIÓN: Props para el límite de filas ---
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
  // --- ACTUALIZACIÓN: Recibimos las props ---
  registrosPorPagina,
  setRegistrosPorPagina
}: SolicitudesFiltersProps) {

  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    status: initialFilters.status || "",
    carrera: initialFilters.carrera || "",
    tipoBeca: initialFilters.tipoBeca || "", 
    fecha: initialFilters.fecha || "", 
    vulnerabilidad: initialFilters.vulnerabilidad || "", 
    rankingElite: initialFilters.rankingElite === 'true' || initialFilters.rankingElite === true || false, 
    estadoEstudio: initialFilters.estadoEstudio || "", 
    limit: initialFilters.limit || 7 // Agregamos el límite al estado
  })

  // --- CORRECCIÓN AQUÍ ---
  const depSearch = initialFilters.search || "";
  const depStatus = initialFilters.status || "";
  const depCarrera = initialFilters.carrera || "";
  const depBeca = initialFilters.tipoBeca || "";
  const depElite = initialFilters.rankingElite;

  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: depSearch,
      status: depStatus,
      carrera: depCarrera,
      tipoBeca: depBeca,
      rankingElite: depElite === 'true' || depElite === true
    }));
  }, [depSearch, depStatus, depCarrera, depBeca, depElite]) 
  // -----------------------

  // DEBOUNCE PARA EL BUSCADOR (Evita buscar por cada letra)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo notificamos si el search cambió
      onFilterChange(filters)
    }, 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    const newFilters = { ...filters, [name]: val }
    setFilters(newFilters)
    
    // Si no es texto (inputs directos), notificamos de inmediato
    if (type !== 'text') {
      onFilterChange(newFilters)
    }
  }

  // Manejador específico para el selector de filas (Límite)
  const handleLimitChange = (e: any) => {
    const newLimit = Number(e.target.value)
    
    // --- ACTUALIZACIÓN: Usamos el setter del padre si existe ---
    if (setRegistrosPorPagina) {
        setRegistrosPorPagina(newLimit)
    } else {
        const newFilters = { ...filters, limit: newLimit }
        setFilters(newFilters)
        onFilterChange(newFilters) // Notificamos el cambio de límite
    }
    setPaginaActual(1) // Reseteamos a página 1
  }

  const resetFilters = () => {
    const empty = {
      search: "", status: "", carrera: "", tipoBeca: "",
      fecha: "", vulnerabilidad: "", rankingElite: false, estadoEstudio: "",
      limit: 7
    }
    setFilters(empty)
    onFilterChange(empty)
    setPaginaActual(1)
  }

  const selectClass = "w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-600 outline-none focus:border-[#1a2744] focus:ring-1 focus:ring-[#1a2744]/10 transition-all appearance-none cursor-pointer"

  return (
    <div className="space-y-4">
      
      {/* --- 1. BARRA RECUPERADA (Buscador + Iconos + Paginación) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Lado Izquierdo: Buscador y Leyenda */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              name="search"
              type="text"
              placeholder="Buscar por Nombre o Cédula..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-[#1a2744] transition-all"
              value={filters.search}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded border border-slate-100 text-[9px] font-bold text-slate-500"><div className="h-3 w-3 rounded-full bg-slate-200 flex items-center justify-center"><Eye className="h-2 w-2" /></div> Ver</div>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded border border-slate-100 text-[9px] font-bold text-slate-500"><div className="h-3 w-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Clock className="h-2 w-2" /></div> Rev</div>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded border border-slate-100 text-[9px] font-bold text-slate-500"><div className="h-3 w-3 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check className="h-2 w-2" /></div> Apr</div>
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded border border-slate-100 text-[9px] font-bold text-slate-500"><div className="h-3 w-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center"><X className="h-2 w-2" /></div> Rec</div>
          </div>
        </div>

        {/* Lado Derecho: Paginación Real */}
        <div className="flex items-center gap-4 w-full xl:w-auto justify-between xl:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">Filas:</span>
            <select 
              // --- ACTUALIZACIÓN: Usamos el valor del padre o el local ---
              value={registrosPorPagina || filters.limit} 
              onChange={handleLimitChange} 
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none cursor-pointer"
            >
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={21}>21</option>
            </select>
          </div>

          {!loading && hasData && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} 
                disabled={paginaActual === 1} 
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-3 py-1 text-[10px] font-black text-[#1a2744] bg-slate-50 border border-slate-200 rounded-lg">
                {paginaActual} / {totalPaginas}
              </div>
              <button 
                onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} 
                disabled={paginaActual === totalPaginas} 
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- 2. TUS FILTROS ORIGINALES (Grid ajustado) --- */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          
          {/* Fila Superior Ajustada (Ya no está el buscador aquí, dimos más espacio al resto) */}
          <div className="lg:col-span-3 relative">
            <select name="status" value={filters.status} onChange={handleChange} className={selectClass}>
              <option value="">Estatus: Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          <div className="lg:col-span-5 relative">
            <GraduationCap className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 pointer-events-none" />
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
          </div>

          <div className="lg:col-span-4 relative">
            <select name="tipoBeca" value={filters.tipoBeca} onChange={handleChange} className={selectClass}>
              <option value="">Todas las Becas</option>
              <option value="Academica">Beca Académica</option>
              <option value="Socioeconomica">Beca Socioeconómica</option>
              <option value="Deportiva">Beca Deportiva</option>
              <option value="Excelencia">Beca a la Excelencia</option>
            </select>
          </div>
        </div>

        {/* FILA 2: ACCIONES (IDÉNTICO A TU CÓDIGO) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="lg:col-span-2 relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="date"
              name="fecha"
              value={filters.fecha}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-500 outline-none focus:border-[#1a2744]"
            />
          </div>

          <div className="lg:col-span-3">
            <select name="estadoEstudio" value={filters.estadoEstudio} onChange={handleChange} className={selectClass}>
              <option value="">Filtro de Estudio</option>
              <option value="Hecho-Pendiente">Estudio Hecho + Pendiente</option>
              <option value="Hecho-Revision">Estudio Hecho + Revisión</option>
              <option value="Sin-Pendiente">Sin Estudio + Pendiente</option>
              <option value="Hecho">Solo Estudios Hechos</option>
              <option value="Pendiente">Solo sin Estudio</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select name="vulnerabilidad" value={filters.vulnerabilidad} onChange={handleChange} className={selectClass}>
              <option value="">Riesgo Social</option>
              <option value="Alto">Riesgo Alto (60+)</option>
              <option value="Medio">Riesgo Medio (30-59)</option>
              <option value="Bajo">Riesgo Bajo (0-29)</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className={`flex items-center justify-center gap-2 h-full px-3 py-2 rounded-lg border-2 transition-all cursor-pointer ${filters.rankingElite ? 'bg-amber-50 border-[#d4a843] text-[#d4a843]' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}>
              <input type="checkbox" name="rankingElite" className="hidden" checked={filters.rankingElite} onChange={handleChange} />
              <ShieldCheck className={`h-4 w-4 ${filters.rankingElite ? 'fill-amber-500/20' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-tight">Élite</span>
            </label>
          </div>

          <div className="lg:col-span-2">
            <button 
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 h-full py-2 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}