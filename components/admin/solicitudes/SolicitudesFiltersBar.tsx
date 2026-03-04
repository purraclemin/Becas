import React from "react"
import { ArrowDown10, GraduationCap, ShieldCheck, RotateCcw, MapPin, Hash, TrendingDown, History } from "lucide-react"

export function SolicitudesFiltersBar({ filters, handleChange, resetFilters }: any) {
  // Clases base para los selectores
  const selectClass = "w-full pl-2 pr-6 py-2 bg-slate-50/50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 outline-none focus:border-[#1a2744] focus:bg-white transition-all appearance-none cursor-pointer hover:border-slate-300 text-center"
  const iconClass = "absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none"
  
  // Clase para cuando un filtro está activo desde el Embudo (Analytics)
  const activeFilterClass = "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-100"

  return (
    <div className="bg-slate-50/30 p-3">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-2 items-center">
        
        {/* ESTATUS */}
        <div className="relative">
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.status ? 'border-slate-400 text-[#1a2744]' : ''}`}
          >
            <option value="">Estatus: Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Revisión">Revisión</option>
            <option value="Revisión Especial">Revisión Especial</option>
            <option value="Renovacion">Renovacion</option>
            <option value="Aprobada">Aprobada</option>
            <option value="Rechazada">Rechazada</option>
          </select>
          <ArrowDown10 className={iconClass} />
        </div>

        {/* MUNICIPIO */}
        <div className="relative">
          <select 
            name="municipio" 
            value={filters.municipio} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.municipio ? 'border-slate-400 text-[#1a2744]' : ''}`}
          >
            <option value="">Municipio</option>
            <option value="Antolín del Campo">Antolín del Campo</option>
            <option value="Arismendi">Arismendi</option>
            <option value="Díaz">Díaz</option>
            <option value="García">García</option>
            <option value="Gómez">Gómez</option>
            <option value="Maneiro">Maneiro</option>
            <option value="Marcano">Marcano</option>
            <option value="Mariño">Mariño</option>
            <option value="Península de Macanao">Península de Macanao</option>
            <option value="Tubores">Tubores</option>
            <option value="Villalba">Villalba</option>
          </select>
          <MapPin className={iconClass} />
        </div>

        {/* CARRERA */}
        <div className="relative">
          <select 
            name="carrera" 
            value={filters.carrera} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.carrera ? 'border-slate-400 text-[#1a2744]' : ''}`}
          >
            <option value="">Todas las Carreras</option>
            <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
            <option value="Ingeniería Industrial">Ingeniería Industrial</option>
            <option value="Derecho">Derecho</option>
            <option value="Administración">Administración</option>
            <option value="Contaduría Pública">Contaduría Pública</option>
            <option value="Artes mención Diseño Gráfico">Artes mención Diseño Gráfico</option>
            <option value="Idiomas Modernos">Idiomas Modernos</option>
            <option value="Psicología">Psicología</option>
          </select>
          <GraduationCap className={iconClass} />
        </div>

        {/* TRIMESTRE */}
        <div className="relative">
          <select 
            name="trimestre" 
            value={filters.trimestre} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.trimestre ? 'border-slate-400 text-[#1a2744]' : ''}`}
          >
            <option value="">Trimestre</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(t => (
              <option key={t} value={t}>{t}° Trimestre</option>
            ))}
          </select>
          <Hash className={iconClass} />
        </div>

        {/* TIPO DE BECA / RENOVACIÓN */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
            {filters.es_renovacion === 'true' && (
              <span className="bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-0.5">
                <History className="h-2 w-2" /> Antiguo
              </span>
            )}
          </div>
          <select 
            name="tipoBeca" 
            value={filters.tipoBeca} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.es_renovacion === 'true' ? activeFilterClass : ''}`}
          >
            <option value="">Beca: Todas</option>
            <option value="BECA SOCIAL">BECA SOCIAL</option>
            <option value="BECA APRENDIZAJE">BECA APRENDIZAJE</option>
            <option value="BECA POR DISCAPACIDAD">BECA POR DISCAPACIDAD</option>
            <option value="BECA A LA EXCELENCIA">BECA A LA EXCELENCIA</option>
            <option value="OTRAS BECAS">OTRAS BECAS</option>
          </select>
        </div>

        {/* VULNERABILIDAD */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
             {filters.vulnerabilidadMin && (
              <span className="bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-0.5">
                Min {filters.vulnerabilidadMin} pts
              </span>
            )}
          </div>
          <select 
            name="vulnerabilidad" 
            value={filters.vulnerabilidad} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.vulnerabilidadMin ? activeFilterClass : ''}`}
          >
            <option value="">Riesgo</option>
            <option value="Critico">Critico (70+)</option>
            <option value="Alto">Alto (50+)</option>
            <option value="Medio">Media (25+)</option>
            <option value="Bajo">Baja (0+)</option>
          </select>
        </div>

        {/* PROMEDIO / TENDENCIA */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {filters.promedioMin && (
              <span className="bg-emerald-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                Min {filters.promedioMin}
              </span>
            )}
            {filters.tendencia === 'descenso' && (
              <span className="bg-rose-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm flex items-center gap-0.5">
                <TrendingDown className="h-2 w-2" /> Descenso
              </span>
            )}
          </div>
          <select 
            name="filtroPromedio" 
            value={filters.filtroPromedio} 
            onChange={handleChange} 
            className={`${selectClass} ${(filters.promedioMin || filters.tendencia === 'descenso') ? activeFilterClass : ''}`}
          >
            <option value="">Promedio</option>
            <option value="19-20">19-20</option>
            <option value="16-18">16-18</option>
            <option value="10-15">10-15</option>
          </select>
        </div>

        {/* ESTADO ESTUDIO */}
        <div className="relative">
          <select 
            name="estadoEstudio" 
            value={filters.estadoEstudio} 
            onChange={handleChange} 
            className={`${selectClass} ${filters.estadoEstudio ? 'border-slate-400 text-[#1a2744]' : ''}`}
          >
            <option value="">Estudio</option>
            <option value="Hecho">Hecho</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

        {/* ACCIONES Y APTOS */}
        <div className="flex items-center gap-1">
          <label className={`flex-1 flex items-center justify-center gap-1 h-full rounded border cursor-pointer transition-all ${filters.rankingElite ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'}`}>
            <input type="checkbox" name="rankingElite" className="hidden" checked={filters.rankingElite} onChange={handleChange} />
            <ShieldCheck className={`h-3.5 w-3.5 ${filters.rankingElite ? 'text-white' : 'text-slate-300'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Aptos</span>
          </label>
          <button 
            onClick={resetFilters} 
            className="flex items-center justify-center h-full px-2.5 bg-slate-100 text-slate-500 rounded border border-slate-200 hover:bg-slate-200 active:scale-95 transition-all"
            title="Restablecer todos los filtros"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}