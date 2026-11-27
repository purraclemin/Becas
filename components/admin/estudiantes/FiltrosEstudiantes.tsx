"use client"

import React from "react"
import {
  Search,
  BadgeCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
  RotateCcw,
  RefreshCw
} from "lucide-react"

interface FiltrosEstudiantesProps {
  busqueda: string
  setBusqueda: (val: string) => void
  carrera?: string
  setCarrera?: (val: string) => void
  carrerasDisponibles?: string[]
  onLimpiar?: () => void
  onRefrescar?: () => void
  loading: boolean
  totalRegistros: number
  page: number
  totalPaginas: number
  setPage: React.Dispatch<React.SetStateAction<number>>
}

export const FiltrosEstudiantes = ({
  busqueda = "",
  setBusqueda,
  carrera = "",
  setCarrera,
  carrerasDisponibles = [],
  onLimpiar,
  onRefrescar,
  loading,
  totalRegistros = 0,
  page = 1,
  totalPaginas = 1,
  setPage
}: FiltrosEstudiantesProps) => {
  const listaCarreras = Array.isArray(carrerasDisponibles) ? carrerasDisponibles : []
  const busquedaSegura = String(busqueda ?? "")
  const carreraSegura = String(carrera ?? "")
  const hayFiltros = busquedaSegura.trim() !== "" || carreraSegura !== ""

  const handleLimpiar = () => {
    if (onLimpiar) {
      onLimpiar()
      return
    }
    setBusqueda("")
    if (setCarrera) setCarrera("")
  }

  return (
    <div className="bg-white p-3.5 md:p-3 rounded-xl shadow-sm border border-slate-200 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* BUSCADOR */}
        <div className="md:col-span-5 flex flex-col gap-1.5">
          <label
            htmlFor="buscar-estudiantes-dir"
            className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
          >
            <Search className="h-3 w-3 text-[#d4a843] shrink-0" />
            <span>Nombre, Cédula, Correo o Estatus</span>
          </label>
          <div className="relative group">
            {loading ? (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] animate-spin pointer-events-none" />
            ) : (
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-3.5 md:w-3.5 text-slate-400 group-focus-within:text-[#d4a843] transition-colors pointer-events-none" />
            )}
            <input
              id="buscar-estudiantes-dir"
              type="text"
              placeholder="Buscar estudiante..."
              value={busquedaSegura}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-12 md:h-9 pl-9 pr-9 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] placeholder:text-slate-400 placeholder:font-medium outline-none focus:border-[#1e3a5f] focus:bg-white transition-all"
            />
            {busquedaSegura && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-[#1e3a5f] cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4 md:h-3.5 md:w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* SELECTOR DE CARRERA */}
        <div className="md:col-span-4 flex flex-col gap-1.5">
          <label
            htmlFor="filtro-carrera-estudiantes"
            className="h-4 flex items-center gap-1.5 text-[10px] md:text-[9px] font-black uppercase text-slate-500 tracking-widest"
          >
            <GraduationCap className="h-3 w-3 text-[#d4a843] shrink-0" />
            <span>Carrera</span>
          </label>
          <select
            id="filtro-carrera-estudiantes"
            value={carreraSegura}
            onChange={(e) => setCarrera?.(e.target.value)}
            disabled={!setCarrera}
            className="w-full h-12 md:h-9 px-3 rounded-lg border border-slate-200 bg-[#f8fafc] text-sm md:text-xs font-bold text-[#1e3a5f] outline-none focus:border-[#1e3a5f] focus:bg-white transition-all cursor-pointer disabled:opacity-60"
          >
            <option value="">Todas las Carreras</option>
            {listaCarreras.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* ACCIONES */}
        <div className="md:col-span-3 flex items-center gap-2">
          {hayFiltros && (
            <button
              type="button"
              onClick={handleLimpiar}
              className="h-12 md:h-9 px-3 rounded-lg bg-[#f8fafc] hover:bg-slate-100 border border-slate-200 text-slate-600 text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
              title="Limpiar filtros"
            >
              <RotateCcw className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
          )}

          <button
            type="button"
            disabled={loading || !onRefrescar}
            onClick={() => onRefrescar?.()}
            className="flex-1 h-12 md:h-9 px-3.5 rounded-lg bg-[#1e3a5f] hover:bg-[#162c4a] text-white text-sm md:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 md:h-3.5 md:w-3.5 text-[#d4a843] shrink-0 ${
                loading ? "animate-spin" : ""
              }`}
            />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* BARRA INFERIOR DE CONTEO Y PAGINACIÓN */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/60 rounded-lg border border-blue-100">
          <BadgeCheck className="h-4 w-4 text-[#1e3a5f]" />
          <span className="text-[10px] md:text-[9px] font-black text-[#1e3a5f] uppercase tracking-wider">
            {totalRegistros} Estudiante{totalRegistros === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/70">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="h-9 w-9 md:h-7 md:w-7 flex items-center justify-center hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#1e3a5f]" />
          </button>

          <div className="px-2 min-w-[3.2rem] flex flex-col items-center justify-center border-x border-slate-200">
            <span className="text-xs md:text-[10px] font-mono font-black text-[#1e3a5f] leading-none">
              {page} / {totalPaginas}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPaginas, p + 1))}
            disabled={page >= totalPaginas || loading}
            className="h-9 w-9 md:h-7 md:w-7 flex items-center justify-center hover:bg-white rounded-md disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
            title="Página siguiente"
          >
            <ChevronRight className="h-4 w-4 md:h-3.5 md:w-3.5 text-[#1e3a5f]" />
          </button>
        </div>
      </div>
    </div>
  )
}
