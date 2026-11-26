"use client"

import React, { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { ResultCard } from "@/components/admin/socioeconomico/ResultCard"
import { buscarEstudianteConEstudio } from "@/lib/ActionsSocioeconomico"
import { obtenerReglaPorTipoBeca } from "@/lib/RecordAcademicoUtils"
import type { ResultadoActualizacionEstatus } from "@/lib/ActionsEstatusBeca"

import { ValidarBecaDecisionBox } from "./ValidarBecaDecisionBox"
import { ValidarBecaInfo } from "@/app/admin/validarBeca/components/ValidarBecaInfo"
import { ValidarBecaTrace } from "@/app/admin/validarBeca/components/ValidarBecaTrace"

export interface SolicitudAuditoriaPanelData {
  id: number | string;
  user_id?: number | string | null;
  cedula?: string | null;
  tipo_beca?: string | null;
  periodo_id?: number | string | null;
  estatus?: string | null;
  observaciones_admin?: string | null;
  email_institucional?: string | null;
  departamento_asignado?: string | null;
  [key: string]: unknown;
}

interface ValidarBecaAuditoriaPanelProps {
  solicitud: SolicitudAuditoriaPanelData;
  onStatusChange: (
    id: number,
    status: string,
    observaciones?: string,
    confirmacionEspecial?: boolean,
    departamentoAsignado?: string
  ) => Promise<ResultadoActualizacionEstatus>;
  onClose: () => void;
  onViewAcademic?: () => void;
  periodoActualId: number | null;
  esSecretariaGeneral?: boolean;
}

export function ValidarBecaAuditoriaPanel({
  solicitud,
  onStatusChange,
  onClose,
  onViewAcademic,
  periodoActualId,
  esSecretariaGeneral = false
}: ValidarBecaAuditoriaPanelProps) {
  const [observaciones, setObservaciones] = useState(String(solicitud.observaciones_admin || ""))
  const [departamentoAsignado, setDepartamentoAsignado] = useState(String(solicitud.departamento_asignado || ""))

  useEffect(() => {
    setObservaciones(String(solicitud.observaciones_admin || ""));
  }, [solicitud.id, solicitud.observaciones_admin]);

  useEffect(() => {
    setDepartamentoAsignado(String(solicitud.departamento_asignado || ""));
  }, [solicitud.id, solicitud.departamento_asignado]);

  const [expedienteDetallado, setExpedienteDetallado] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const periodoSolicitudNum = Number(solicitud.periodo_id || 0);
  const periodoActualNum = Number(periodoActualId || 0);
  const esPeriodoActual =
    periodoActualNum <= 0 ||
    periodoSolicitudNum <= 0 ||
    periodoSolicitudNum === periodoActualNum;

  const solicitudParaHijos = {
    ...solicitud,
    cedula: solicitud.cedula || "",
    estatus: solicitud.estatus || undefined,
    observaciones_admin: solicitud.observaciones_admin ?? null,
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
          return (
            tipo === 'administrador' ||
            (r.puntaje_admin !== null && r.puntaje_admin !== undefined) ||
            (r.nivel_admin !== null && r.nivel_admin !== undefined)
          );
        });

        const baseData = estudioAdmin || (resultados && resultados.length > 0 ? (resultados[0] as Record<string, unknown>) : {});

        const estudioAdminTyped = estudioAdmin as Record<string, unknown> | undefined;
        const tieneEstudioAdminReal = Boolean(
          estudioAdminTyped &&
          (String(estudioAdminTyped.tipo || "").trim().toLowerCase() === "administrador" ||
            (estudioAdminTyped.puntaje_admin !== null && estudioAdminTyped.puntaje_admin !== undefined) ||
            (estudioAdminTyped.puntaje !== null && estudioAdminTyped.puntaje !== undefined))
        );

        setExpedienteDetallado({
          ...solicitud,
          ...baseData,
          email: solicitud.email_institucional,
          puntaje_admin: tieneEstudioAdminReal
            ? ((estudioAdminTyped?.puntaje_admin ?? estudioAdminTyped?.puntaje) as number | null)
            : null,
          nivel_admin: tieneEstudioAdminReal
            ? ((estudioAdminTyped?.nivel_admin ?? estudioAdminTyped?.nivel_riesgo) as string | null)
            : null,
          es_estudio_oficial: tieneEstudioAdminReal
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

  // Exención normativa: Excelencia Académica (automática) y Concurso Social no exigen baremo previo
  const reglaModalidad = obtenerReglaPorTipoBeca(String(solicitud.tipo_beca || ""));
  const requiereEstudioSocioeconomico = reglaModalidad?.requiereEstudioSocioeconomico ?? true;
  const tieneEstudioAdmin = Boolean(expedienteDetallado?.es_estudio_oficial);
  const bloqueadoPorEstudio = requiereEstudioSocioeconomico && !tieneEstudioAdmin;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
      <Loader2 className="h-10 w-10 animate-spin text-[#d4a843] mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Expediente...</p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-10">
      <div className="flex-1 space-y-6">
        <ResultCard
          student={expedienteDetallado}
          formData={expedienteDetallado}
          soloLectura={esSecretariaGeneral}
        />
      </div>

      <div className="w-full lg:w-[400px] space-y-6">
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
          onViewAcademic={onViewAcademic}
          bloqueadoPorEstudio={bloqueadoPorEstudio}
          esSecretariaGeneral={esSecretariaGeneral}
        />

        <ValidarBecaInfo
          solicitud={solicitudParaHijos}
          sinEstudio={bloqueadoPorEstudio}
        />

        <ValidarBecaTrace solicitud={solicitudParaHijos} />
      </div>
    </div>
  )
}