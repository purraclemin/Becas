"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { ResultCard } from "@/components/admin/socioeconomico/ResultCard"
import { buscarEstudianteConEstudio } from "@/lib/ActionsSocioeconomico" 
import { DiagnosticoBeca } from "@/lib/ActionsBecaValidators"

// Importaciones locales y autónomas dentro del módulo validarBeca
import { ValidarBecaDecisionBox } from "./ValidarBecaDecisionBox"
import { ValidarBecaInfo } from "@/app/admin/validarBeca/components/ValidarBecaInfo"
import {ValidarBecaTrace } from "@/app/admin/validarBeca/components/ValidarBecaTrace"

interface ValidarBecaAuditoriaPanelProps {
  solicitud: any;
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean) => void;
  onClose: () => void;
  periodoActualId: number | null;
}

export function ValidarBecaAuditoriaPanel({ solicitud, onStatusChange, onClose, periodoActualId }: ValidarBecaAuditoriaPanelProps) {
  const [observaciones, setObservaciones] = useState("")
  const [expedienteDetallado, setExpedienteDetallado] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [diagnostico, setDiagnostico] = useState<DiagnosticoBeca | null>(null)

  const esPeriodoActual = Number(solicitud.periodo_id) === Number(periodoActualId);

  useEffect(() => {
    async function cargarDetalleSocioeconomico() {
      setLoading(true);
      try {
        const resultados = await buscarEstudianteConEstudio(solicitud.cedula);
        
        /**
         * 🔍 LÓGICA DE DETECCIÓN REFORZADA:
         * 1. Buscamos por el campo 'tipo' normalizado.
         * 2. Si no lo encuentra por 'tipo', verificamos si algún registro ya tiene
         * puntaje asignado por un administrador (puntaje_admin o nivel_admin).
         */
        const estudioAdmin = resultados?.find((r: any) => 
          r.tipo?.toString().trim().toLowerCase() === 'administrador' || 
          r.puntaje_admin !== null || 
          r.nivel_admin !== null
        );

        const baseData = estudioAdmin || (resultados && resultados.length > 0 ? resultados[0] : {});
        
        setExpedienteDetallado({
          ...baseData,
          ...solicitud,
          email: solicitud.email_institucional,
          // Sincronización explícita de la validación oficial
          puntaje_admin: estudioAdmin ? (estudioAdmin.puntaje_admin || estudioAdmin.puntaje) : null,
          nivel_admin: estudioAdmin ? (estudioAdmin.nivel_admin || estudioAdmin.nivel_riesgo) : null,
          es_estudio_oficial: !!estudioAdmin
        });
      } catch (error) {
        console.error("Error al sincronizar expediente:", error);
        setExpedienteDetallado({ ...solicitud, email: solicitud.email_institucional });
      } finally {
        setLoading(false);
      }
    }
    cargarDetalleSocioeconomico();
  }, [solicitud]);

  /** * 🟢 SENSOR DE SEGURIDAD: 
   * Garantiza el desbloqueo si se detectó la existencia de un baremo oficial.
   */
  const tieneEstudioAdmin = expedienteDetallado?.es_estudio_oficial === true;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
      <Loader2 className="h-10 w-10 animate-spin text-[#d4a843] mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Expediente...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
      <div className="flex-1 space-y-6">
        <ResultCard student={expedienteDetallado} formData={expedienteDetallado} />
      </div>

      <div className="w-full lg:w-[400px] space-y-6">
        {/* Panel de decisión unificado y adaptado */}
        <ValidarBecaDecisionBox 
          solicitud={solicitud}
          esPeriodoActual={esPeriodoActual}
          periodoActualId={periodoActualId}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          onStatusChange={onStatusChange}
          onClose={onClose}
          bloqueadoPorEstudio={!tieneEstudioAdmin}
        />

        {/* Resumen académico / Info */}
        <ValidarBecaInfo 
          solicitud={solicitud} 
          sinEstudio={!tieneEstudioAdmin}
        />

        <ValidarBecaTrace solicitud={solicitud} />
      </div>
    </div>
  )
}