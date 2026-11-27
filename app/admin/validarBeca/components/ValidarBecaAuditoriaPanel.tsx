"use client"

import React, { useState, useEffect, useRef } from "react"
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
  initialExpedienteDetallado?: Record<string, unknown> | null;
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

export function construirExpedienteDetallado(
  solicitud: SolicitudAuditoriaPanelData,
  resultados: Array<Record<string, unknown>> | null | undefined
): Record<string, unknown> {
  const lista = Array.isArray(resultados) ? resultados : [];
  const estudioAdmin = lista.find((r) => {
    const tipo = r.tipo ? String(r.tipo).trim().toLowerCase() : "";
    return (
      tipo === "administrador" ||
      (r.puntaje_admin !== null && r.puntaje_admin !== undefined) ||
      (r.nivel_admin !== null && r.nivel_admin !== undefined)
    );
  });

  const baseData = estudioAdmin || (lista.length > 0 ? lista[0] : {});

  const tieneEstudioAdminReal = Boolean(
    estudioAdmin &&
    (String(estudioAdmin.tipo || "").trim().toLowerCase() === "administrador" ||
      (estudioAdmin.puntaje_admin !== null && estudioAdmin.puntaje_admin !== undefined) ||
      (estudioAdmin.puntaje !== null && estudioAdmin.puntaje !== undefined))
  );

  return {
    ...solicitud,
    ...baseData,
    email: solicitud.email_institucional ?? baseData.email,
    puntaje_admin: tieneEstudioAdminReal
      ? ((estudioAdmin?.puntaje_admin ?? estudioAdmin?.puntaje) as number | null)
      : null,
    nivel_admin: tieneEstudioAdminReal
      ? ((estudioAdmin?.nivel_admin ?? estudioAdmin?.nivel_riesgo) as string | null)
      : null,
    es_estudio_oficial: tieneEstudioAdminReal,
  };
}

export function ValidarBecaAuditoriaPanel({
  solicitud,
  initialExpedienteDetallado = null,
  onStatusChange,
  onClose,
  onViewAcademic,
  periodoActualId,
  esSecretariaGeneral = false
}: ValidarBecaAuditoriaPanelProps) {
  const claveExpediente = `${String(solicitud.id)}:${String(solicitud.cedula || "").trim()}`;

  const [observaciones, setObservaciones] = useState<string>(
    String(solicitud.observaciones_admin || "")
  );
  const [departamentoAsignado, setDepartamentoAsignado] = useState<string>(
    String(solicitud.departamento_asignado || "")
  );

  const [expedienteDetallado, setExpedienteDetallado] = useState<Record<string, unknown> | null>(
    () => initialExpedienteDetallado
  );
  const [loading, setLoading] = useState<boolean>(() => !initialExpedienteDetallado);

  const solicitudRef = useRef<SolicitudAuditoriaPanelData>(solicitud);
  solicitudRef.current = solicitud;

  const ultimaClaveCargadaRef = useRef<string | null>(
    initialExpedienteDetallado ? claveExpediente : null
  );
  const requestIdRef = useRef<number>(0);

  useEffect(() => {
    setObservaciones(String(solicitud.observaciones_admin || ""));
  }, [solicitud.id, solicitud.observaciones_admin]);

  useEffect(() => {
    setDepartamentoAsignado(String(solicitud.departamento_asignado || ""));
  }, [solicitud.id, solicitud.departamento_asignado]);

  // Sincroniza cambios de estatus/observaciones/departamento en memoria sin desmontar ni disparar spinner
  useEffect(() => {
    setExpedienteDetallado((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        estatus: solicitud.estatus,
        observaciones_admin: solicitud.observaciones_admin ?? null,
        departamento_asignado: solicitud.departamento_asignado ?? prev.departamento_asignado,
      };
    });
  }, [solicitud.estatus, solicitud.observaciones_admin, solicitud.departamento_asignado]);

  // Carga el estudio socioeconómico únicamente cuando cambia de expediente (solicitud.id / solicitud.cedula)
  useEffect(() => {
    const cedulaLimpia = String(solicitud.cedula || "").trim();
    const claveActual = `${String(solicitud.id)}:${cedulaLimpia}`;

    if (ultimaClaveCargadaRef.current === claveActual) {
      setLoading(false);
      return;
    }

    if (!cedulaLimpia) {
      ultimaClaveCargadaRef.current = claveActual;
      setExpedienteDetallado({
        ...solicitudRef.current,
        email: solicitudRef.current.email_institucional,
        es_estudio_oficial: false,
      });
      setLoading(false);
      return;
    }

    const reqId = ++requestIdRef.current;
    setLoading(true);

    const cargarDetalleSocioeconomico = async () => {
      try {
        const resultados = (await buscarEstudianteConEstudio(cedulaLimpia)) as Array<
          Record<string, unknown>
        >;

        if (reqId !== requestIdRef.current) return;

        ultimaClaveCargadaRef.current = claveActual;
        setExpedienteDetallado(
          construirExpedienteDetallado(solicitudRef.current, resultados)
        );
      } catch (error) {
        if (reqId !== requestIdRef.current) return;
        console.error("Error al sincronizar expediente:", error);
        ultimaClaveCargadaRef.current = claveActual;
        setExpedienteDetallado({
          ...solicitudRef.current,
          email: solicitudRef.current.email_institucional,
          es_estudio_oficial: false,
        });
      } finally {
        if (reqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    void cargarDetalleSocioeconomico();
  }, [solicitud.id, solicitud.cedula]);

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

  // Exención normativa: Excelencia Académica (automática) y Concurso Social no exigen baremo previo
  const reglaModalidad = obtenerReglaPorTipoBeca(String(solicitud.tipo_beca || ""));
  const requiereEstudioSocioeconomico = reglaModalidad?.requiereEstudioSocioeconomico ?? true;
  const tieneEstudioAdmin = Boolean(expedienteDetallado?.es_estudio_oficial);
  const bloqueadoPorEstudio = requiereEstudioSocioeconomico && !tieneEstudioAdmin;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-200 shadow-xl">
        <Loader2 className="h-10 w-10 animate-spin text-[#d4a843] mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Sincronizando Expediente...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 pb-10">
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
  );
}
