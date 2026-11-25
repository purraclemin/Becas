"use client"

import React, { useState, ComponentType, SVGProps } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Info,
  HelpCircle,
  AlertTriangle,
  BadgeCheck,
  Activity,
  Landmark,
  ShieldAlert,
  Mail,
  Users,
  Edit3
} from "lucide-react"
import {
  SECCIONES_REPORTE,
  CAMPOS_MONETARIOS,
  type SeccionReporteItem
} from "./ResultCardData"
import { getColorByScore } from "./ResultCardUI"

export interface StudentDataRecord {
  id?: number | string;
  nombre?: string;
  apellido?: string;
  cedula?: string;
  email?: string;
  telefono?: string;
  sexo?: string;
  fecha_nacimiento?: string;
  carrera?: string;
  semestre?: number | string;
  indice_global?: number | string;
  municipio_residencia?: string;
  puntaje_admin?: number | null;
  puntaje?: number | null;
  puntaje_estudiante?: number | null;
  nivel_admin?: string | null;
  nivel_riesgo?: string | null;
  observaciones_solicitante?: string | null;
  [key: string]: unknown;
}

interface ResultCardProps {
  student?: StudentDataRecord | null;
  formData?: Record<string, unknown> | null;
  setMostrarResultado?: (val: boolean) => void;
  setPasoActual?: (val: number) => void;
  onEditar?: (student?: StudentDataRecord | null) => void;
  soloLectura?: boolean;
}

interface NivelConfig {
  bgHeader: string;
  bgLight: string;
  text: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  desc: string;
}

interface IntegranteNucleoDetalle {
  nombre: string;
  edad: string;
  sexo: string;
  parentesco: string;
  instruccion: string;
  ocupacion: string;
}

const extraerIntegrantesNucleo = (valor: unknown): IntegranteNucleoDetalle[] => {
  if (!valor) return [];

  const mapearArreglo = (arr: unknown[]): IntegranteNucleoDetalle[] =>
    arr
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
      .map((item) => ({
        nombre: String(item.nombre ?? item.NOMBRE ?? "").trim(),
        edad: String(item.edad ?? item.EDAD ?? "").trim(),
        sexo: String(item.sexo ?? item.SEXO ?? "").trim(),
        parentesco: String(item.parentesco ?? item.PARENTESCO ?? "").trim(),
        instruccion: String(item.instruccion ?? item.INSTRUCCION ?? "").trim(),
        ocupacion: String(item.ocupacion ?? item.OCUPACION ?? "").trim(),
      }))
      .filter(
        (m) =>
          m.nombre !== "" ||
          m.edad !== "" ||
          m.sexo !== "" ||
          m.parentesco !== "" ||
          m.instruccion !== "" ||
          m.ocupacion !== ""
      );

  if (Array.isArray(valor)) {
    return mapearArreglo(valor);
  }

  if (typeof valor === "string") {
    const trimmed = valor.trim();
    if (
      trimmed === "" ||
      trimmed === "[]" ||
      trimmed.toLowerCase() === "no" ||
      trimmed.toLowerCase() === "no declarado"
    ) {
      return [];
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return Array.isArray(parsed) ? mapearArreglo(parsed) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const formatearNucleoFamiliar = (valor: unknown): string => {
  const integrantes = extraerIntegrantesNucleo(valor);
  if (integrantes.length === 0) {
    if (typeof valor === "string" && valor.trim() !== "" && valor.trim() !== "[]") {
      const lower = valor.trim().toLowerCase();
      if (lower === "no" || lower === "no declarado") return "No";
    }
    return "Sin integrantes adicionales";
  }

  return integrantes
    .map((m, idx) => {
      const datos = [
        m.parentesco ? `Parentesco: ${m.parentesco}` : "",
        m.edad ? `Edad: ${m.edad} años` : "",
        m.sexo ? `Sexo: ${m.sexo}` : "",
        m.instruccion ? `Instrucción: ${m.instruccion}` : "",
        m.ocupacion ? `Ocupación: ${m.ocupacion}` : "",
      ]
        .filter(Boolean)
        .join(" | ");
      return `${idx + 1}. ${m.nombre || "Sin nombre"}${datos ? ` — ${datos}` : ""}`;
    })
    .join("\n");
};

export function ResultCard({
  student,
  formData,
  setMostrarResultado,
  setPasoActual,
  onEditar,
  soloLectura = false
}: ResultCardProps) {
  const router = useRouter();
  const [mostrarConfirmacionEditar, setMostrarConfirmacionEditar] = useState<boolean>(false);

  const rawData: Record<string, unknown> = { ...(student || {}), ...(formData || {}) };

  const tienePuntajeAdmin =
    !soloLectura &&
    student?.puntaje_admin !== null &&
    student?.puntaje_admin !== undefined &&
    String(student?.puntaje_admin).trim() !== "";

  const observacionesSolicitanteTexto = String(
    rawData.observaciones_solicitante ?? rawData.observaciones_estudio ?? ""
  ).trim();

  const displayData: Record<string, unknown> = {
    ...rawData,
    municipio_residencia:
      rawData.municipio_residencia || rawData.municipio || rawData.socio_municipio || "---",
    telefono:
      rawData.telefono || rawData.socio_celular || rawData.socio_telf_hab || "---",
    sexo: rawData.sexo || rawData.socio_sexo || "---",
    fecha_nacimiento:
      rawData.fecha_nacimiento || rawData.socio_fecha_nac || "---",
    carrera: rawData.carrera || rawData.socio_carrera || "---",
    semestre: rawData.semestre || rawData.socio_trimestre || "---",
    indice_global:
      rawData.indice_global || rawData.promedio_notas || rawData.promedio || "---",
    familia_relacion:
      rawData.familia_relacion || rawData.socio_relacion_fam || "Buena",
    situacion_laboral_jefe:
      rawData.situacion_laboral_jefe ||
      rawData.posee_empleo_aspirante ||
      rawData.posee_empleo ||
      "No",
    salud_condicion_especial:
      rawData.salud_condicion_especial ||
      rawData.carga_familiar_discapacidad ||
      rawData.salud_condicion ||
      "No",
    observaciones_solicitante: observacionesSolicitanteTexto || "---",
  };

  const puntajeFinal = Number(student?.puntaje_admin ?? student?.puntaje ?? 0);
  const puntajeAlumno = Number(student?.puntaje_estudiante ?? 0);
  const nivelFinal = String(student?.nivel_admin ?? student?.nivel_riesgo ?? "Pendiente");

  const getNivelConfig = (nivel: string): NivelConfig => {
    switch (nivel) {
      case 'Crítico':
        return {
          bgHeader: "bg-slate-950",
          bgLight: "bg-rose-50/50",
          text: "text-rose-900",
          icon: ShieldAlert,
          desc: "ESTADO CRÍTICO: Vulnerabilidad extrema detectada."
        };
      case 'Alto':
        return {
          bgHeader: "bg-rose-600",
          bgLight: "bg-rose-50/80",
          text: "text-rose-800",
          icon: AlertTriangle,
          desc: "RIESGO ALTO: Carencias socioeconómicas severas verificadas."
        };
      case 'Medio':
        return {
          bgHeader: "bg-amber-500",
          bgLight: "bg-amber-50/80",
          text: "text-amber-800",
          icon: Info,
          desc: "RIESGO MEDIO: Situación vulnerable evaluada."
        };
      case 'Bajo':
        return {
          bgHeader: "bg-emerald-600",
          bgLight: "bg-emerald-50/80",
          text: "text-emerald-800",
          icon: CheckCircle2,
          desc: "RIESGO BAJO: Condiciones socioeconómicas estables."
        };
      default:
        return {
          bgHeader: "bg-[#1e3a5f]",
          bgLight: "bg-slate-50",
          text: "text-slate-800",
          icon: HelpCircle,
          desc: "PENDIENTE: Requiere validación técnica."
        };
    }
  };

  const config = getNivelConfig(nivelFinal);
  const IconoNivel = config.icon;

  const formatValue = (key: string, value: unknown): string => {
    if (key === "familia_nucleo_json") {
      return formatearNucleoFamiliar(value);
    }
    if (value instanceof Date) return value.toLocaleDateString();
    if (value === "on" || value === "Posee" || value === "Si" || value === "Sí") return "Sí / Posee";
    if (value === "off" || value === "No posee" || value === "No") return "No / No posee";
    if (value === "S") return "Semipresencial";
    if (value === "P") return "Presencial";
    if (value === "V") return "Virtual";
    if (value === "M") return "Masculino";
    if (value === "F") return "Femenino";
    if (CAMPOS_MONETARIOS.includes(key) && value !== undefined && value !== null && value !== "") {
      const num = parseFloat(String(value));
      return Number.isFinite(num) ? `$ ${num.toFixed(2)}` : "---";
    }
    if (key === "indice_global" && value && value !== "---") return `${String(value)} pts`;
    return value !== null && value !== undefined && String(value).trim() !== ""
      ? String(value)
      : "---";
  };

  const nombreExpediente = `${String(student?.nombre || "")} ${String(student?.apellido || "")}`.trim();

  const ejecutarAccionEditar = () => {
    setMostrarConfirmacionEditar(false);
    if (!tienePuntajeAdmin) return;

    if (setMostrarResultado && setPasoActual) {
      setMostrarResultado(false);
      setPasoActual(1);
      return;
    }
    if (onEditar) {
      onEditar(student);
      return;
    }
    const termino = String(student?.cedula || student?.id || "").trim();
    const destino = termino
      ? `/admin/estudio-socioeconomico?search=${encodeURIComponent(termino)}&editar=1`
      : "/admin/estudio-socioeconomico";
    router.push(destino);
  };

  return (
    <div id="print-section" className="w-full max-w-6xl mx-auto">

      {/* 1. VERSIÓN WEB */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4 pb-12 print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className={`px-6 py-4 text-white flex flex-col md:flex-row justify-between items-center gap-4 ${config.bgHeader} relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 text-center md:text-left min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-sm">
                  <Activity className="h-3.5 w-3.5 text-[#d4a843]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em]">Reporte de Auditoría Digital</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
                  <Landmark className="h-3.5 w-3.5 text-[#d4a843]" /> Dirección de Bienestar Estudiantil
                </div>
              </div>

              <h2
                title={`Expediente: ${nombreExpediente}`}
                className="text-xl font-black uppercase tracking-tight mb-2 truncate"
              >
                Expediente: {nombreExpediente}
              </h2>

              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                <span
                  title={`Cédula: V-${String(student?.cedula || "---")}`}
                  className="px-2.5 py-0.5 bg-white/10 rounded-md text-[9px] font-bold uppercase tracking-wider border border-white/20"
                >
                  V-{String(student?.cedula || "---")}
                </span>
                <span
                  title={String(student?.email || "---")}
                  className="px-2.5 py-0.5 bg-white/10 rounded-md text-[9px] font-bold flex items-center gap-1.5 border border-white/10"
                >
                  <Mail className="h-3 w-3 text-[#d4a843]" /> {String(student?.email || "---")}
                </span>
                <span
                  title={`ID: ${student?.id ? `${student.id}` : '---'}`}
                  className="px-2.5 py-0.5 bg-black/20 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <BadgeCheck className="h-3 w-3 text-[#d4a843]" /> ID: {student?.id ? `${student.id}` : '---'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 relative z-10 shrink-0">
              <div className={`px-4 py-2.5 rounded-xl border border-white/10 text-center min-w-[110px] shadow-sm ${getColorByScore(puntajeAlumno)}`}>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-0.5">Alumno</p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-2xl font-black tabular-nums tracking-tighter">{puntajeAlumno}</span>
                  <span className="text-[10px] font-bold opacity-75">PTS</span>
                </div>
              </div>

              <div className={`px-4 py-2.5 rounded-xl border border-white/10 text-center min-w-[110px] shadow-sm ${getColorByScore(puntajeFinal)}`}>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/80 mb-0.5">Institución</p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-2xl font-black tabular-nums tracking-tighter">{puntajeFinal}</span>
                  <span className="text-[10px] font-bold opacity-75">PTS</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`px-6 py-3 border-b flex flex-col sm:flex-row items-center justify-between gap-3 ${config.bgLight} ${config.text} border-x-0`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 bg-white rounded-lg shadow-sm shrink-0 border border-white/50">
                <IconoNivel className="h-4 w-4" />
              </div>
              <p className="text-xs font-black uppercase tracking-tight italic truncate">
                {config.desc}
              </p>
            </div>

            {tienePuntajeAdmin && (
              <button
                type="button"
                onClick={() => setMostrarConfirmacionEditar(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 md:py-1.5 bg-white border border-slate-200 rounded-xl text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all active:scale-95 group cursor-pointer shadow-xs shrink-0"
                title="Editar estudio"
              >
                <Edit3 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-wider">Editar</span>
              </button>
            )}
          </div>

          {tienePuntajeAdmin && mostrarConfirmacionEditar && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-col md:flex-row items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100 text-sky-700 shrink-0">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm md:text-xs font-black text-[#1e3a5f] uppercase tracking-wider">
                    ¿Deseas editar los datos de este estudio?
                  </h4>
                  <p className="text-xs md:text-[10px] text-slate-600">
                    Se habilitará el formulario interactivo para modificar la información.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarConfirmacionEditar(false)}
                  className="px-3.5 py-2.5 md:py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs md:text-[10px] font-bold uppercase transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={ejecutarAccionEditar}
                  className="px-4 py-2.5 md:py-1.5 bg-[#1e3a5f] hover:bg-[#162c4a] text-white rounded-lg text-xs md:text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 md:h-3 md:w-3" />
                  Sí, editar
                </button>
              </div>
            </div>
          )}

          <div className="p-6 space-y-8 bg-[#f8fafc]">
            {Object.entries(SECCIONES_REPORTE as Record<string, SeccionReporteItem>).map(([secKey, seccion]) => {
              const IconoSeccion = seccion.icon;
              return (
                <div key={secKey} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <IconoSeccion className="h-4 w-4 text-[#d4a843]" />
                    <h3 className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-[0.15em]">
                      {seccion.titulo}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(seccion.campos).map(([campoKey, label]) => {
                      if (campoKey === "familia_nucleo_json") {
                        const integrantes = extraerIntegrantesNucleo(displayData[campoKey]);
                        const resumenTexto = integrantes.length > 0
                          ? `${integrantes.length} integrante(s) registrado(s)`
                          : formatearNucleoFamiliar(displayData[campoKey]);

                        return (
                          <div
                            key={campoKey}
                            className="sm:col-span-2 lg:col-span-4 flex flex-col p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Users className="h-3 w-3 text-[#d4a843]" />
                                {label}
                              </span>
                              <span className="text-[10px] font-bold text-[#1e3a5f]">
                                {resumenTexto}
                              </span>
                            </div>

                            {integrantes.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {integrantes.map((m, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-[#1e3a5f] space-y-1.5"
                                  >
                                    <p className="font-black uppercase break-words">
                                      {m.nombre || "Sin nombre"}
                                    </p>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-600 font-semibold">
                                      <span>Parentesco: <strong>{m.parentesco || "No"}</strong></span>
                                      <span>Edad: <strong>{m.edad ? `${m.edad} años` : "No"}</strong></span>
                                      <span>Sexo: <strong>{m.sexo || "No"}</strong></span>
                                      <span>Instrucción: <strong>{m.instruccion || "No"}</strong></span>
                                      <span>Ocupación: <strong>{m.ocupacion || "No"}</strong></span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-white/90 border border-dashed border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-500 uppercase">
                                {formatearNucleoFamiliar(displayData[campoKey])}
                              </div>
                            )}
                          </div>
                        );
                      }

                      const valorTexto = formatValue(campoKey, displayData[campoKey]);
                      const esCampoLargo =
                        campoKey === "observaciones_solicitante" ||
                        campoKey === "familia_problema_desc";

                      return (
                        <div
                          key={campoKey}
                          title={`${label}: ${valorTexto}`}
                          className={`flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-200/60 hover:border-[#d4a843]/40 transition-all cursor-default group ${
                            esCampoLargo ? "sm:col-span-2 lg:col-span-4" : ""
                          }`}
                        >
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#d4a843]">
                            {label}
                          </span>
                          <span
                            className={`text-xs font-bold text-[#1e3a5f] uppercase ${
                              esCampoLargo ? "whitespace-normal break-words" : "truncate"
                            }`}
                          >
                            {valorTexto}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. VERSIÓN DE IMPRESIÓN */}
      <div className="hidden print:block bg-white text-slate-900 m-0 p-0 w-full">

        <div className="p-2 bg-white border-b-2 border-[#1e3a5f] mb-3">
          <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[#1e3a5f] tracking-wider">
                Reporte de Auditoría Digital — Dirección de Bienestar Estudiantil
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase">UNIMAR 2026</span>
          </div>

          <div className="bg-slate-50 rounded border border-slate-300 p-2">
            <div className="flex flex-col divide-y divide-slate-200 text-[10px]">
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">Expediente del Estudiante:</span>
                <span className="font-black text-[#1e3a5f] uppercase text-xs">
                  {nombreExpediente}
                </span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">Cédula de Identidad:</span>
                <span className="font-black text-slate-800 uppercase">V-{String(student?.cedula || "---")}</span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">Correo Electrónico:</span>
                <span className="font-semibold text-slate-800">{String(student?.email || "---")}</span>
              </div>
              <div className="py-1 flex justify-between items-center">
                <span className="font-bold text-slate-600 uppercase">ID de Registro Institucional:</span>
                <span className="font-bold text-slate-800">{student?.id ? `${student.id}` : '---'}</span>
              </div>
              <div className="py-1.5 flex justify-between items-center bg-slate-100 px-2 rounded">
                <span className="font-black text-[#1e3a5f] uppercase">Puntaje Asignado (Alumno / Institución):</span>
                <div className="flex gap-3 font-black text-xs">
                  <span className="text-blue-800">Alumno: {puntajeAlumno} PTS</span>
                  <span>|</span>
                  <span className="text-emerald-800">Institución: {puntajeFinal} PTS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 border border-slate-300 bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-tight italic mb-3 rounded">
          {config.desc}
        </div>

        <div className="space-y-3">
          {Object.entries(SECCIONES_REPORTE as Record<string, SeccionReporteItem>).map(([secKey, seccion]) => (
            <div key={secKey} className="bg-white p-2 rounded border border-slate-300">
              <div className="pb-1 mb-1 border-b border-slate-300">
                <h3 className="text-[9px] font-black text-[#1e3a5f] uppercase tracking-[0.15em]">
                  {seccion.titulo}
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-slate-200">
                {Object.entries(seccion.campos).map(([campoKey, label]) => (
                  <div key={campoKey} className="py-1 flex justify-between items-start gap-3 text-left">
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wide shrink-0">
                      {label}:
                    </span>
                    <span className="text-[10px] font-black text-[#1e3a5f] uppercase text-right whitespace-pre-line break-words">
                      {formatValue(campoKey, displayData[campoKey])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[8px] text-slate-500 uppercase tracking-wider">
          © Copyright 2026-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela
        </div>
      </div>
    </div>
  )
}