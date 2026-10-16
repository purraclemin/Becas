"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { ResultCard } from "@/components/admin/socioeconomico/ResultCard"
import { buscarEstudianteConEstudio } from "@/lib/ActionsSocioeconomico" 
import { DiagnosticoBeca } from "@/lib/ActionsBecaValidators"

// Importaciones locales y autónomas dentro del módulo validarBeca
import { ValidarBecaDecisionBox } from "./ValidarBecaDecisionBox"
import { ValidarBecaInfo } from "@/app/admin/validarBeca/components/ValidarBecaInfo"
import { ValidarBecaTrace } from "@/app/admin/validarBeca/components/ValidarBecaTrace"

export interface SolicitudAuditoriaPanelData {
  id: number | string;
  cedula?: string | null;
  periodo_id?: number | string | null;
  estatus?: string | null;
  email_institucional?: string | null;
  departamento_asignado?: string | null;
  [key: string]: unknown;
}

interface ValidarBecaAuditoriaPanelProps {
  solicitud: SolicitudAuditoriaPanelData;
  onStatusChange: (id: number, status: string, observaciones?: string, confirmacionEspecial?: boolean, departamentoAsignado?: string) => void;
  onClose: () => void;
  periodoActualId: number | null;
}

export function ValidarBecaAuditoriaPanel({ solicitud, onStatusChange, onClose, periodoActualId }: ValidarBecaAuditoriaPanelProps) {
  const [observaciones, setObservaciones] = useState("")
  
  // 🟢 Inicialización sincronizada con el valor proveniente de la base de datos
  const [departamentoAsignado, setDepartamentoAsignado] = useState(String(solicitud.departamento_asignado || ""))

  // 🟢 EFECTO DE SINCRONIZACIÓN: Actualiza el estado local si la prop cambia o se recarga el expediente
  useEffect(() => {
    setDepartamentoAsignado(String(solicitud.departamento_asignado || ""));
  }, [solicitud.departamento_asignado]);
  
  const [expedienteDetallado, setExpedienteDetallado] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [, setDiagnostico] = useState<DiagnosticoBeca | null>(null)

  const esPeriodoActual = Number(solicitud.periodo_id) === Number(periodoActualId);

  // Mapeo seguro con tipos garantizados para los subcomponentes hijos
  const solicitudParaHijos = {
    ...solicitud,
    cedula: solicitud.cedula || "",
    estatus: solicitud.estatus || undefined,
    departamento_asignado: departamentoAsignado,
  };

  useEffect(() => {
    async function cargarDetalleSocioeconomico() {
      if (!solicitud.cedula) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const resultados = await buscarEstudianteConEstudio(solicitud.cedula);
        
        const estudioAdmin = (resultados as Array<Record<string, unknown>>)?.find((r) => {
          const tipo = r.tipo ? String(r.tipo).trim().toLowerCase() : "";
          return tipo === 'administrador' || r.puntaje_admin !== null || r.nivel_admin !== null;
        });

        const baseData = estudioAdmin || (resultados && resultados.length > 0 ? (resultados[0] as Record<string, unknown>) : {});
        
        setExpedienteDetallado({
          ...baseData,
          ...solicitud,
          email: solicitud.email_institucional,
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

  const tieneEstudioAdmin = Boolean(expedienteDetallado?.es_estudio_oficial);

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
        {/* Panel de decisión unificado y adaptado que inyecta el departamento seleccionado */}
        <ValidarBecaDecisionBox 
          solicitud={solicitudParaHijos}
          esPeriodoActual={esPeriodoActual}
          periodoActualId={periodoActualId}
          observaciones={observaciones}
          setObservaciones={setObservaciones}
          departamentoAsignado={departamentoAsignado}         
          setDepartamentoAsignado={setDepartamentoAsignado} 
          onStatusChange={onStatusChange}
          onClose={onClose}
          bloqueadoPorEstudio={!tieneEstudioAdmin}
        />

        {/* Resumen académico / Info */}
        <ValidarBecaInfo 
          solicitud={solicitudParaHijos} 
          sinEstudio={!tieneEstudioAdmin}
        />

        <ValidarBecaTrace solicitud={solicitudParaHijos} />
      </div>
    </div>
  )
}