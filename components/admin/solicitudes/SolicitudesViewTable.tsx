"use client"

import React from "react"
import { Loader2 } from "lucide-react"
import { SolicitudesTable } from "./SolicitudesTable"

interface TableViewProps {
  loading: boolean;
  solicitudes: any[];
  periodoActualId: number | null;
  handleStatusChange: any;
  onViewAuditoria: (s: any) => void;
  onViewAcademic: (s: any) => void;
}

export function SolicitudesViewTable({ 
  loading, solicitudes, periodoActualId, handleStatusChange, onViewAuditoria, onViewAcademic 
}: TableViewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] relative">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mb-4 text-[#d4a843]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sincronizando MariaDB...</span>
        </div>
      ) : (
        <SolicitudesTable 
          data={solicitudes} 
          onView={onViewAuditoria} 
          onViewHistorial={onViewAcademic} 
          onStatusChange={handleStatusChange}
          periodoActualId={periodoActualId}
        />
      )}
    </div>
  )
}