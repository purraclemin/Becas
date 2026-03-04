import React, { useState } from "react"
import { Search, RotateCcw, ChevronLeft, ChevronRight, Filter, Database, Loader2, Trash2 } from "lucide-react"
import { seedDatabase, cleanSeedData } from "@/lib/ActionsSeedData"

export function SolicitudesFiltersHeader({ 
  filters, handleChange, resetFilters, registrosPorPagina, 
  setRegistrosPorPagina, alturaCalculada, paginaActual, 
  totalPaginas, setPaginaActual, loading, hasData,
  activeFiltersCount = 0 
}: any) {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)

  // Función para disparar la generación masiva de datos
  const handleSeed = async () => {
    if (!confirm("¿Deseas generar 100 estudiantes y solicitudes de prueba?")) return;
    
    setIsSeeding(true)
    try {
      const res = await seedDatabase()
      if (res.success) {
        alert("✅ " + res.message)
        window.location.reload() 
      } else {
        alert("❌ Error: " + res.error)
      }
    } catch (error) {
      alert("❌ Ocurrió un error inesperado al generar los datos.")
    } finally {
      setIsSeeding(false)
    }
  }

  // 🧹 Función para limpiar los datos de prueba generados
  const handleClean = async () => {
    if (!confirm("¿Estás seguro de eliminar los 100 registros de prueba? Los estudiantes con ID 10 y 12 no serán afectados.")) return;
    
    setIsCleaning(true)
    try {
      const res = await cleanSeedData()
      if (res.success) {
        alert("🗑️ " + res.message)
        window.location.reload()
      } else {
        alert("❌ Error: " + res.error)
      }
    } catch (error) {
      alert("❌ Ocurrió un error inesperado al limpiar los datos.")
    } finally {
      setIsCleaning(false)
    }
  }

  return (
    <div className="p-3 border-b border-slate-100 bg-white flex flex-col xl:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 w-full xl:w-96">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            name="search" type="text" value={filters.search} onChange={handleChange}
            placeholder="Buscar por Nombre o Cédula..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-[#1a2744] transition-all"
          />
        </div>

        {/* INDICADOR DE FILTROS ACTIVOS */}
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-[#1a2744] rounded-lg border border-[#1a2744] animate-in zoom-in duration-300">
              <Filter className="h-3 w-3 text-[#d4a843]" />
              <span className="text-[10px] font-black text-white leading-none">
                {activeFiltersCount}
              </span>
            </div>
          )}
          
          <button 
            onClick={resetFilters} 
            className="p-2.5 bg-slate-100 text-slate-500 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors group"
            title="Limpiar todos los filtros"
          >
            <RotateCcw className="h-4 w-4 group-active:rotate-180 transition-transform duration-500" />
          </button>

          {/* BOTÓN DE SEEDING: Generar 100 registros */}
          <button 
            onClick={handleSeed}
            disabled={isSeeding || isCleaning}
            className={`p-2.5 rounded-lg border transition-all flex items-center gap-2 ${
              isSeeding 
                ? "bg-slate-50 text-slate-300 border-slate-100" 
                : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white"
            }`}
            title="Generar 100 registros de prueba"
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
          </button>

          {/* 🔴 BOTÓN DE LIMPIEZA: Borrar registros de prueba */}
          <button 
            onClick={handleClean}
            disabled={isSeeding || isCleaning}
            className={`p-2.5 rounded-lg border transition-all flex items-center gap-2 ${
              isCleaning 
                ? "bg-slate-50 text-slate-300 border-slate-100" 
                : "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white"
            }`}
            title="Limpiar registros de prueba"
          >
            {isCleaning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-between md:justify-end">
        <div className="flex items-center bg-slate-50 rounded border border-slate-200 px-2 h-9">
          <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Filas:</span>
          <select 
            value={registrosPorPagina || filters.limit} 
            onChange={(e) => { setRegistrosPorPagina?.(Number(e.target.value)); setPaginaActual(1); }}
            className="bg-transparent py-1.5 text-[10px] font-bold outline-none cursor-pointer"
          >
            <option value={alturaCalculada}>Auto</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {!loading && hasData && (
          <div className="flex items-center bg-slate-50 rounded border border-slate-200 p-0.5 h-9">
            <button 
              onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))} 
              disabled={paginaActual === 1} 
              className="p-1.5 rounded hover:bg-white text-slate-500 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-[10px] font-black text-[#1a2744] min-w-[50px] text-center">
              {paginaActual} / {totalPaginas}
            </span>
            <button 
              onClick={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))} 
              disabled={paginaActual === totalPaginas} 
              className="p-1.5 rounded hover:bg-white text-slate-500 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}