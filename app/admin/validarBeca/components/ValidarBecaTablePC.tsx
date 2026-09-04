"use client"

import React, { useState } from "react"
import { 
  MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, 
  Loader2, Check, Undo2, Activity, MapPin, Calendar 
} from "lucide-react"
import { getBadgeColor, getRiskDetails, getAvgStyle } from "@/app/admin/validarBeca/lib/ValidarBecaUtils"
import { SolicitudItem, SortConfig, ordenarSolicitudes, formatearFechaEnvio } from "@/app/admin/validarBeca/lib/ProcesadorDatosValidarBeca"
import { ValidarBecaCardItem } from "./ValidarBecaTableMobil"

interface ValidarBecaTableProps {
  solicitudes?: SolicitudItem[];
  data?: SolicitudItem[];
  loading: boolean;
  onViewAuditoria: (solicitud: SolicitudItem) => void;
  onViewAcademic: (solicitud: SolicitudItem) => void;
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean) => void;
  periodoActualId: number | null;
}

interface ValidarBecaFilaProps {
  s: SolicitudItem;
  onView: (solicitud: SolicitudItem) => void;
  onViewHistorial: (solicitud: SolicitudItem) => void;
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean) => void;
  periodoActualId: number | null;
}

export function ValidarBecaTable({ 
  solicitudes, 
  data, 
  loading, 
  onViewAuditoria, 
  onViewAcademic, 
  onStatusChange, 
  periodoActualId 
}: ValidarBecaTableProps) {
  
  const listaDatos = solicitudes || data || [];

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  })

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = React.useMemo(() => {
    return ordenarSolicitudes(listaDatos, sortConfig)
  }, [listaDatos, sortConfig])

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-50" />
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-white" /> : <ArrowDown className="h-3 w-3 text-white" />
  }

  if (loading) return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative flex flex-col items-center justify-center py-32 text-slate-400">
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando MariaDB...</span>
    </div>
  )

  if (listaDatos.length === 0) return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8 text-center flex flex-col items-center">
      <MoreHorizontal className="h-5 w-5 text-slate-300 mb-2" />
      <h3 className="text-slate-800 font-bold uppercase text-[10px] tracking-widest">Sin resultados</h3>
      <p className="text-slate-500 text-[9px] uppercase">No hay solicitudes que coincidan con la validación</p>
    </div>
  )

  const thClass = "px-4 py-3 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-[#23355b] transition-colors group"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* VISTA ESCRITORIO (PC / LAPTOP): Alta densidad espacial corporativa (h-9, text-xs) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-[#1e3a5f] text-white">
            <tr>
              <th className={`${thClass} text-left w-20`} onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">ID / Fecha {getSortIcon('id')}</div>
              </th>
              <th className={`${thClass} text-left`} onClick={() => handleSort('estudiante')}>
                <div className="flex items-center gap-1">Estudiante {getSortIcon('estudiante')}</div>
              </th>
              <th className={`${thClass} text-left hidden lg:table-cell`} onClick={() => handleSort('municipio_residencia')}>
                <div className="flex items-center gap-1">Municipio {getSortIcon('municipio_residencia')}</div>
              </th>
              <th className={`${thClass} text-left hidden md:table-cell`} onClick={() => handleSort('carrera')}>
                <div className="flex items-center gap-1">Carrera / Becas {getSortIcon('carrera')}</div>
              </th>
              <th className={`${thClass} text-center`} onClick={() => handleSort('trimestre')}>
                <div className="flex items-center justify-center gap-1">Trim. {getSortIcon('trimestre')}</div>
              </th>
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('vulnerabilidad')}>
                <div className="flex items-center justify-center gap-1">Vulnerabilidad {getSortIcon('vulnerabilidad')}</div>
              </th>
              <th className={`${thClass} text-center hidden lg:table-cell`} onClick={() => handleSort('promedio')}>
                <div className="flex items-center justify-center gap-1">Prom/Global {getSortIcon('promedio')}</div>
              </th>
              <th className={`${thClass} text-center hidden sm:table-cell`} onClick={() => handleSort('estatus')}>
                <div className="flex items-center justify-center gap-1">Estatus {getSortIcon('estatus')}</div>
              </th>
              <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-right bg-[#1e3a5f] text-white">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedData.map((s: SolicitudItem, index: number) => (
              <ValidarBecaFila 
                key={`${s.id}-${index}`} 
                s={s} 
                onView={onViewAuditoria} 
                onViewHistorial={onViewAcademic} 
                onStatusChange={onStatusChange} 
                periodoActualId={periodoActualId}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* VISTA MÓVIL Y TABLET: Renderizado delegado al archivo móvil */}
      <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3">
        {sortedData.map((s: SolicitudItem, index: number) => (
          <ValidarBecaCardItem 
            key={`mobile-${s.id}-${index}`} 
            s={s} 
            onView={onViewAuditoria} 
            onViewHistorial={onViewAcademic} 
            onStatusChange={onStatusChange} 
            periodoActualId={periodoActualId}
          />
        ))}
      </div>
    </div>
  )
}

function ValidarBecaFila({ s, onView, onViewHistorial, onStatusChange, periodoActualId }: ValidarBecaFilaProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const risk = getRiskDetails(s.puntaje ?? 0)

  const valPeriodoSolicitud = s.periodo_id ? Number(s.periodo_id) : 0;
  const valPeriodoActual = periodoActualId ? Number(periodoActualId) : 0;
  const esPeriodoActual = valPeriodoActual === 0 || valPeriodoSolicitud === valPeriodoActual;

  const fechaEnvio = formatearFechaEnvio(s);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!value) return
    if (value === "ver_detalles") {
      onView(s)
    } else if (value === "ver_historial") {
      onViewHistorial(s)
    } else {
      setPendingAction(value)
      setIsConfirming(true)
    }
    e.target.value = ""
  }

  const confirmAction = () => {
    if (pendingAction) {
        onStatusChange(Number(s.id), pendingAction)
        setIsConfirming(false)
        setPendingAction(null)
    }
  }

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-2 md:px-4 py-4">
        <span className="font-mono text-[10px] md:text-xs font-bold text-slate-400 block">
          #{s.id?.toString().padStart(4, '0') || '0000'}
        </span>
        <span className="text-[8px] font-medium text-slate-400 flex items-center gap-0.5 mt-0.5">
          <Calendar className="h-2.5 w-2.5 text-slate-300" /> {fechaEnvio}
        </span>
      </td>
      <td className="px-2 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center font-black text-[10px] shadow-inner uppercase shrink-0">
            {s.nombre?.[0] || 'U'}{s.apellido?.[0] || 'S'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#1e3a5f] leading-tight truncate">{s.nombre || ''} {s.apellido || ''}</p>
            <span className="text-[9px] text-slate-500 font-mono tracking-tighter block">V-{s.cedula || ''}</span>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 hidden lg:table-cell">
        <div className="flex items-start gap-1.5">
          <MapPin className="h-3 w-3 text-slate-300 mt-0.5" />
          <p className="text-[10px] font-bold text-slate-600 uppercase leading-tight line-clamp-2">
            {s.municipio_residencia || "S/I"}
          </p>
        </div>
      </td>
      <td className="px-2 py-4 hidden md:table-cell">
        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px] uppercase leading-tight">{s.carrera || "S/I"}</p>
        <p className="text-[8px] text-[#d4a843] font-black uppercase tracking-widest mt-0.5">{s.tipo_beca || "S/I"}</p>
      </td>
      <td className="px-2 py-4 text-center">
        <span className="text-xs font-black text-[#1e3a5f]">{s.semestre || s.trimestre || "0"}</span>
      </td>
      <td className="px-2 py-4 hidden lg:table-cell text-center">
        {s.puntaje != null ? (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl border shadow-sm ${risk.style}`}>
            <Activity className="h-3 w-3" />
            <div className="flex flex-col items-start leading-none text-left">
              <span className="text-[8px] font-black uppercase tracking-tighter">{risk.label}</span>
              <span className="text-[7px] font-bold opacity-75">{s.puntaje} PTS</span>
            </div>
          </div>
        ) : <span className="text-[8px] font-bold text-slate-300 uppercase italic">Sin Estudio</span>}
      </td>
      <td className="px-2 py-4 text-center hidden lg:table-cell">
        <div className="inline-flex flex-col items-center leading-tight">
          <span className={`text-xs font-black ${getAvgStyle(String(s.promedio_notas || "0")).split(' ')[1]}`}>{s.promedio_notas || "0.00"}</span>
          <span className="text-[8px] font-black text-[#d4a843] uppercase tracking-tighter mt-0.5">
            G: {s.promedio_historico || s.indice_global || "0.00"}
          </span>
        </div>
      </td>
      <td className="px-2 py-4 hidden sm:table-cell text-center">
        <span className={`inline-block px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getBadgeColor(s.estatus || '')}`}>
          {s.estatus || "S/I"}
        </span>
      </td>
      <td className="px-2 py-4 text-right">
        {isConfirming ? (
          <div className="flex items-center justify-end gap-1">
            <button onClick={confirmAction} className="h-7 w-7 rounded-full bg-[#1e3a5f] text-[#d4a843] flex items-center justify-center shadow-md">
              <Check className="h-3 w-3" />
            </button>
            <button onClick={() => { setIsConfirming(false); setPendingAction(null); }} className="h-7 w-7 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
              <Undo2 className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <select
              defaultValue=""
              onChange={handleSelectChange}
              className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold rounded-xl px-2 py-1 outline-none focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="" disabled>Validar...</option>
              <option value="ver_detalles">👁️ Ver Expediente</option>
              <option value="ver_historial">📋  Materia Historia</option>
              {esPeriodoActual ? (
                <>
                  {s.estatus !== 'En Revisión' && <option value="En Revisión">⏳ En Revisión</option>}
                  {s.estatus !== 'Rechazada' && <option value="Rechazada">❌ Rechazar</option>}
                  {s.estatus !== 'Aprobada' && <option value="Aprobada">✅ Aprobar</option>}
                </>
              ) : (
                <option value="" disabled>🔒 Registro Histórico</option>
              )}
            </select>
          </div>
        )}
      </td>
    </tr>
  )
}