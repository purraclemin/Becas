"use client"

import React, { useMemo } from "react"
import {
  CheckCircle2,
  User,
  BookOpen,
  HeartPulse,
  Wallet,
  FileCheck,
  Briefcase,
  AlertCircle,
  Users2,
  FileText,
  MessageSquare
} from "lucide-react"
import { cn, calcularEdad } from "@/lib/utils"
import type { PostulacionUser } from "../types"

interface ResumenItem {
  label: string;
  value: string | number;
  highlight?: boolean;
  tone?: "default" | "danger" | "success";
}

interface ResumenSeccion {
  titulo: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  items: ResumenItem[];
}

const getMontoEnteroNoNegativo = (valor: string | number | null | undefined): number => {
  if (valor === undefined || valor === null || valor === "") return 0;
  const limpio = String(valor).replace(/,/g, "").trim();
  const num = parseFloat(limpio);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.trunc(num);
};

const formatearModalidad = (mod: string | undefined): string => {
  if (mod === "P") return "Presencial";
  if (mod === "S") return "Semipresencial";
  if (mod === "V") return "Virtual";
  return "Presencial";
};

const formatearRangoIngreso = (rango: string | undefined): string => {
  if (rango === "1") return "1 Salario";
  if (rango === "2") return "1 a 2 Salarios";
  if (rango === "3") return "Más de 2 Salarios";
  return "—";
};

const formatearTextoOpcional = (val: string | undefined, fallback: string): string => {
  if (!val) return fallback;
  const limpio = val.trim();
  if (limpio === "" || limpio.toUpperCase() === "NO") return fallback;
  return limpio;
};

const contarIntegrantesNucleo = (jsonStr: string | undefined): number => {
  if (!jsonStr) return 0;
  try {
    const parsed: unknown = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

export function StepResumen({
  user,
  promedio,
  indiceGlobal,
  trimestre,
  tipoBeca
}: {
  user: PostulacionUser;
  promedio: string;
  indiceGlobal?: string;
  trimestre: string;
  tipoBeca?: string;
}) {
  const edadCalculada = useMemo(() => {
    return user?.fecha_nacimiento ? calcularEdad(user.fecha_nacimiento) : "—";
  }, [user?.fecha_nacimiento]);

  const nombreCompleto =
    user?.nombre && user?.apellido
      ? `${user.nombre} ${user.apellido}`
      : (user?.nombre || "—");

  const { ingresoTotalFam, egresoTotalFam, disponibilidadFinal } = useMemo(() => {
    const ingresos =
      getMontoEnteroNoNegativo(user?.monto_ingreso_sueldo) +
      getMontoEnteroNoNegativo(user?.monto_ingreso_familiar) +
      getMontoEnteroNoNegativo(user?.monto_ingreso_extra) +
      getMontoEnteroNoNegativo(user?.monto_ingreso_pension) +
      getMontoEnteroNoNegativo(user?.monto_ingreso_ayuda) +
      getMontoEnteroNoNegativo(user?.monto_ingreso_rentas) +
      getMontoEnteroNoNegativo(user?.monto_ingreso_otros);

    const egresos =
      getMontoEnteroNoNegativo(user?.monto_egreso_mercado) +
      getMontoEnteroNoNegativo(user?.monto_egreso_vivienda) +
      getMontoEnteroNoNegativo(user?.monto_egreso_salud) +
      getMontoEnteroNoNegativo(user?.monto_egreso_servicios) +
      getMontoEnteroNoNegativo(user?.monto_egreso_suntuarios) +
      getMontoEnteroNoNegativo(user?.monto_egreso_estudios) +
      getMontoEnteroNoNegativo(user?.monto_egreso_recreacion);

    return {
      ingresoTotalFam: ingresos,
      egresoTotalFam: egresos,
      disponibilidadFinal: ingresos - egresos
    };
  }, [
    user?.monto_ingreso_sueldo,
    user?.monto_ingreso_familiar,
    user?.monto_ingreso_extra,
    user?.monto_ingreso_pension,
    user?.monto_ingreso_ayuda,
    user?.monto_ingreso_rentas,
    user?.monto_ingreso_otros,
    user?.monto_egreso_mercado,
    user?.monto_egreso_vivienda,
    user?.monto_egreso_salud,
    user?.monto_egreso_servicios,
    user?.monto_egreso_suntuarios,
    user?.monto_egreso_estudios,
    user?.monto_egreso_recreacion
  ]);

  const tieneCondicionSalud =
    user?.salud_condicion_especial === "Si" ||
    (!!user?.salud_enfermedad_desc && user.salud_enfermedad_desc.trim().toUpperCase() !== "NO");

  const semestreNum = Number(user?.semestre ?? trimestre ?? 1) || 1;
  const esNuevoIngreso = semestreNum <= 1;
  const trimestreVisual = user?.semestre
    ? `N° ${user.semestre}`
    : (trimestre ? `N° ${trimestre}` : "—");

  const promedioTrimVal = parseFloat(promedio || "0");
  const promedioTrimDisplay = esNuevoIngreso
    ? "Nuevo Ingreso"
    : (Number.isFinite(promedioTrimVal) ? promedioTrimVal.toFixed(2) : "0.00");

  const globalVal = parseFloat(indiceGlobal || String(user?.indice_global ?? "0"));
  const indiceGlobalDisplay = esNuevoIngreso
    ? "Nuevo Ingreso"
    : (Number.isFinite(globalVal) ? globalVal.toFixed(2) : "0.00");

  const totalIntegrantes = useMemo(
    () => contarIntegrantesNucleo(user?.familia_nucleo_json),
    [user?.familia_nucleo_json]
  );

  const observacionesSolicitante = formatearTextoOpcional(
    user?.observaciones_solicitante || user?.observaciones_estudio,
    ""
  );

  const secciones: ResumenSeccion[] = [
    {
      titulo: "Académico e Institucional",
      icon: BookOpen,
      color: "text-[#1e3a5f]",
      bg: "bg-blue-50/40",
      items: [
        { label: "Trimestre", value: trimestreVisual },
        { label: "Tipo de Beca", value: tipoBeca || user?.tipo_beca || "No especificada", highlight: true },
        {
          label: "Prom. Trim. Anterior",
          value: promedioTrimDisplay,
          highlight: true,
          tone: !esNuevoIngreso && promedioTrimVal < 16 ? "danger" : "success"
        },
        { label: "Índice Global", value: indiceGlobalDisplay },
        { label: "Carrera", value: user?.carrera || "No especificada" },
        { label: "Modalidad", value: formatearModalidad(user?.socio_modalidad) },
      ]
    },
    {
      titulo: "Perfil del Solicitante",
      icon: User,
      color: "text-slate-700",
      bg: "bg-[#f8fafc]",
      items: [
        { label: "Nombre", value: nombreCompleto },
        { label: "Cédula", value: user?.cedula || "—" },
        { label: "Edad", value: edadCalculada !== "—" ? `${edadCalculada} años` : "—" },
        { label: "Estado Civil", value: user?.socio_estado_civil || user?.estado_civil || user?.edo_civil || "—" },
        { label: "Correo", value: user?.email || user?.correo || "—" },
      ]
    },
    {
      titulo: "Carga Familiar",
      icon: Users2,
      color: "text-indigo-700",
      bg: "bg-indigo-50/40",
      items: [
        { label: "Sit. Parental", value: user?.familia_estatus_conyugal || "—" },
        { label: "Ocupación Padre", value: formatearTextoOpcional(user?.padre_ocupacion, "—") },
        { label: "Ocupación Madre", value: formatearTextoOpcional(user?.madre_ocupacion, "—") },
        { label: "Hnos / Hnos Uni", value: `${user?.familia_num_hermanos ?? "0"} / ${user?.familia_hermanos_uni ?? "0"}` },
        { label: "Núcleo / Clima", value: `${totalIntegrantes} reg. • ${user?.familia_relacion || "Buena"}` },
      ]
    },
    {
      titulo: "Situación Económica",
      icon: Briefcase,
      color: "text-amber-700",
      bg: "bg-amber-50/40",
      items: [
        { label: "Posee empleo", value: user?.posee_empleo_aspirante === "Si" ? "Sí" : "No" },
        { label: "Empresa", value: formatearTextoOpcional(user?.socio_trabajo_empresa, "N/A") },
        { label: "Condición", value: formatearTextoOpcional(user?.socio_condicion_laboral_tipo, "N/A") },
        { label: "Rango Familiar", value: formatearRangoIngreso(user?.rango_ingreso_familiar) },
      ]
    },
    {
      titulo: "Balance Financiero ($)",
      icon: Wallet,
      color: "text-emerald-700",
      bg: "bg-emerald-50/40",
      items: [
        { label: "Ingresos Totales", value: `$${ingresoTotalFam.toFixed(2)}`, highlight: true },
        { label: "Egresos Totales", value: `$${egresoTotalFam.toFixed(2)}`, highlight: true },
        {
          label: "Saldo Disponible",
          value: `$${disponibilidadFinal.toFixed(2)}`,
          highlight: true,
          tone: disponibilidadFinal < 0 ? "danger" : "success"
        }
      ]
    },
    {
      titulo: "Salud y Hogar",
      icon: HeartPulse,
      color: "text-rose-700",
      bg: "bg-rose-50/40",
      items: [
        { label: "Condición Salud", value: tieneCondicionSalud ? "Sí" : "Buena" },
        { label: "Diagnóstico", value: formatearTextoOpcional(user?.salud_enfermedad_desc, "Ninguno") },
        { label: "Organización", value: user?.organizacion_activa || "Ninguna" },
        { label: "Tipo Vivienda", value: user?.vivienda_tipo || "—" },
        { label: "Tenencia", value: user?.vivienda_estatus || "—" },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      <div className="bg-white p-3 lg:p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 lg:h-8 lg:w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-[#1e3a5f] font-black text-xs lg:text-[10px] uppercase tracking-tight leading-none">
            Auditoría de Postulación
          </h3>
          <p className="text-slate-400 text-[10px] lg:text-[8px] font-bold uppercase tracking-widest mt-1 leading-none">
            Datos consolidados de los pasos previos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 lg:gap-2">
        {secciones.map((sec) => (
          <div key={sec.titulo} className={cn("p-3 lg:p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm", sec.bg)}>
            <div className="flex items-center gap-1.5 border-b border-black/5 pb-1.5">
              <sec.icon className={cn("h-3.5 w-3.5", sec.color)} />
              <h4 className={cn("font-black text-[10px] lg:text-[8.5px] uppercase tracking-widest", sec.color)}>
                {sec.titulo}
              </h4>
            </div>
            <div className="space-y-1.5">
              {sec.items.map((item) => (
                <div key={item.label} className="flex justify-between items-center gap-2">
                  <span className="text-[10px] lg:text-[8px] font-black text-slate-500 uppercase leading-tight">
                    {item.label}
                  </span>
                  <span className={cn(
                    "text-xs lg:text-[9px] font-black uppercase leading-tight text-right truncate max-w-[58%]",
                    item.tone === "danger"
                      ? "text-rose-600"
                      : item.tone === "success"
                        ? "text-emerald-700"
                        : item.highlight
                          ? "text-[#1e3a5f]"
                          : "text-slate-600"
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="bg-white p-3 lg:p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#d4a843]" />
              <h4 className="font-black text-[10px] lg:text-[8.5px] uppercase tracking-widest text-[#1e3a5f]">
                Justificación de la Solicitud
              </h4>
            </div>
            <p className="text-xs lg:text-[10px] text-slate-600 font-medium leading-relaxed italic bg-[#f8fafc] p-2.5 lg:p-2 rounded-lg border border-slate-100">
              &ldquo;{user?.motivo_solicitud || "No se registró exposición de motivos."}&rdquo;
            </p>
          </div>

          <div className="bg-white p-3 lg:p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-[#d4a843]" />
              <h4 className="font-black text-[10px] lg:text-[8.5px] uppercase tracking-widest text-[#1e3a5f]">
                Observaciones del Solicitante
              </h4>
            </div>
            <p className="text-xs lg:text-[10px] text-slate-600 font-medium leading-relaxed italic bg-[#f8fafc] p-2.5 lg:p-2 rounded-lg border border-slate-100">
              {observacionesSolicitante
                ? `"${observacionesSolicitante}"`
                : "Sin observaciones adicionales declaradas."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
        <div className="p-3 lg:p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5 shadow-sm">
          <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xs lg:text-[9px] font-black text-[#1e3a5f] uppercase leading-none">
              Expediente Completo
            </p>
            <p className="text-[10px] lg:text-[7.5px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
              Datos verificados y listos para envío
            </p>
          </div>
        </div>

        <div className="p-3 lg:p-2.5 rounded-xl bg-[#1e3a5f] text-white shadow-sm flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-[#d4a843] shrink-0" />
          <p className="text-[10px] lg:text-[8px] leading-snug font-bold uppercase tracking-tight opacity-90">
            La falsedad en estos datos anula la solicitud inmediatamente.
          </p>
        </div>
      </div>
    </div>
  )
}