"use client"

import React from "react"
import { ArrowDown10, MapPin, GraduationCap, Hash, History, TrendingDown } from "lucide-react"

interface OpcionesFiltrosProps {
  filters: {
    status: string;
    municipio: string;
    carrera: string;
    trimestre: string;
    tipoBeca: string;
    vulnerabilidad: string;
    filtroPromedio: string;
    estadoEstudio: string;
    rankingElite?: boolean;
    es_renovacion?: string;
    vulnerabilidadMin?: string;
    promedioMin?: string;
    tendencia?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  resetFilters: () => void;
  onOpenAptoIA: () => void;
}

export function OpcionesFiltros({ filters, handleInputChange, resetFilters, onOpenAptoIA }: OpcionesFiltrosProps) {
  const selectClass = "w-full pl-2 pr-6 py-2 bg-slate-50/50 border border-slate-200 rounded text-[10px] font-bold text-slate-600 outline-none focus:border-[#1e3a5f] focus:bg-white transition-all appearance-none cursor-pointer hover:border-slate-300 text-center"
  const iconClass = "absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 pointer-events-none"
  const activeFilterClass = "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-100"

  return (
    <div className="bg-slate-50/30 p-3">
      {/* 🟢 Ajustado a 8 columnas exactas para que los filtros ocupen todo el ancho de manera uniforme tras remover el botón */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 items-center">
        
        {/* Estatus */}
        <div className="relative">
          <select name="status" value={filters.status} onChange={handleInputChange} className={selectClass}>
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

        {/* Municipio */}
        <div className="relative">
          <select name="municipio" value={filters.municipio} onChange={handleInputChange} className={selectClass}>
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

        {/* Carrera */}
        <div className="relative">
          <select name="carrera" value={filters.carrera} onChange={handleInputChange} className={selectClass}>
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

        {/* Trimestre */}
        <div className="relative">
          <select name="trimestre" value={filters.trimestre} onChange={handleInputChange} className={selectClass}>
            <option value="">Trimestre</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(t => (<option key={t} value={t}>{t}° Trimestre</option>))}
          </select>
          <Hash className={iconClass} />
        </div>

        {/* Tipo de Beca */}
        <div className="relative">
          {filters.es_renovacion === 'true' && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-blue-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
              <History className="h-2 w-2" /> Antiguo
            </span>
          )}
          <select name="tipoBeca" value={filters.tipoBeca} onChange={handleInputChange} className={`${selectClass} ${filters.es_renovacion === 'true' ? activeFilterClass : ''}`}>
            <option value="">Beca: Todas</option>
            <option value="BECA SOCIAL">BECA SOCIAL</option>
            <option value="BECA APRENDIZAJE">BECA APRENDIZAJE</option>
            <option value="BECA POR DISCAPACIDAD">BECA POR DISCAPACIDAD</option>
            <option value="BECA A LA EXCELENCIA">BECA A LA EXCELENCIA</option>
            <option value="AYUDA ECONÓMICA GENERAL">AYUDA ECONÓMICA GENERAL</option>
            <option value="AYUDA ECONÓMICA FAMILIAR BECAS">AYUDA ECONÓMICA FAMILIAR</option>
            <option value="AYUDA ECONÓMICA PARA TRABAJADORES">AYUDA ECONÓMICA PARA TRABAJADORES</option>
            <option value="AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES">AYUDA ECONÓMICA PARA HIJOS DE TRABAJADORES</option>
            <option value="AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORESL">AYUDA ECONÓMICA PARA ESTUDIANTES PREPARADORES</option>
            <option value="AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES">AYUDA ECONÓMICA POR ACTIVIDADES EXTRACURRICULARES</option>
          </select>
        </div>

        {/* Riesgo / Vulnerabilidad */}
        <div className="relative">
          {filters.vulnerabilidadMin && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">
              Min {filters.vulnerabilidadMin} pts
            </span>
          )}
          <select name="vulnerabilidad" value={filters.vulnerabilidad} onChange={handleInputChange} className={`${selectClass} ${filters.vulnerabilidadMin ? activeFilterClass : ''}`}>
            <option value="">Riesgo</option>
            <option value="critico">Crítico (70+)</option>
            <option value="alto">Alto (50-69)</option>
            <option value="medio">Medio (25-49)</option>
            <option value="bajo">Bajo (0-24)</option>
          </select>
        </div>

        {/* Promedio */}
        <div className="relative">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {filters.promedioMin && <span className="bg-emerald-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">Min {filters.promedioMin}</span>}
            {filters.tendencia === 'descenso' && <span className="bg-rose-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><TrendingDown className="h-2 w-2" /> Descenso</span>}
          </div>
          <select name="filtroPromedio" value={filters.filtroPromedio} onChange={handleInputChange} className={`${selectClass} ${(filters.promedioMin || filters.tendencia === 'descenso') ? activeFilterClass : ''}`}>
            <option value="">Promedio</option>
            <option value="19-20">19-20</option>
            <option value="16-18">16-18</option>
            <option value="10-15">10-15</option>
          </select>
        </div>

        {/* Estudio */}
        <div className="relative">
          <select name="estadoEstudio" value={filters.estadoEstudio} onChange={handleInputChange} className={selectClass}>
            <option value="">Estudio</option>
            <option value="Hecho">Hecho</option>
            <option value="Pendiente">Pendiente</option>
          </select>
        </div>

      </div>
    </div>
  )
}