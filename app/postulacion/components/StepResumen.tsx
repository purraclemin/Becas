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
  FileText
} from "lucide-react"
import { cn, calcularEdad } from "@/lib/utils"

interface ResumenItem {
  label: string;
  value: string | number | undefined;
  highlight?: boolean;
}

interface ResumenSeccion {
  titulo: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  items: ResumenItem[];
}

export function StepResumen({
  user,
  promedio,
  trimestre,
  tipoBeca
}: {
  user: any;
  promedio: string;
  trimestre: string;
  tipoBeca?: string;
}) {
  const edadCalculada = user?.fecha_nacimiento ? calcularEdad(user.fecha_nacimiento) : "—";
  const nombreCompleto = user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : (user?.nombre || "—");

  const getMonto = (valor: any) => {
    if (!valor) return 0;
    const num = parseFloat(valor.toString().replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const ingresoTotalFam = getMonto(user?.monto_ingreso_sueldo) + getMonto(user?.monto_ingreso_familiar) + 
                         getMonto(user?.monto_ingreso_extra) + getMonto(user?.monto_ingreso_pension) + 
                         getMonto(user?.monto_ingreso_ayuda);

  const egresoTotalFam = getMonto(user?.monto_egreso_mercado) + getMonto(user?.monto_egreso_vivienda) + 
                         getMonto(user?.monto_egreso_salud) + getMonto(user?.monto_egreso_servicios);

  const disponibilidadFinal = ingresoTotalFam - egresoTotalFam;

  const secciones: ResumenSeccion[] = [
    {
      titulo: "Académico e Institucional",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50/40",
      items: [
        { label: "Trimestre", value: user?.semestre ? `N° ${user.semestre}` : '—' },
        { label: "Tipo de Beca", value: tipoBeca || user?.tipo_beca || "No especificada", highlight: true },
        { label: "Promedio", value: promedio || '0.00', highlight: true },
        { label: "Carrera", value: user?.carrera || "No especificada" },
        { label: "Modalidad", value: user?.socio_modalidad === 'P' ? 'Presencial' : user?.socio_modalidad === 'V' ? 'Virtual' : 'Semipresencial' },
      ]
    },
    {
      titulo: "Perfil del Solicitante",
      icon: User,
      color: "text-slate-600",
      bg: "bg-slate-50/60",
      items: [
        { label: "Nombre", value: nombreCompleto },
        { label: "Cédula", value: user?.cedula || '—' },
        { label: "Edad", value: edadCalculada !== "—" ? `${edadCalculada} años` : '—' },
        { label: "Estado Civil", value: user?.socio_estado_civil || user?.edo_civil || '—' },
        { label: "Correo", value: user?.email || '—' },
      ]
    },
    {
      titulo: "Carga Familiar",
      icon: Users2,
      color: "text-indigo-600",
      bg: "bg-indigo-50/40",
      items: [
        { label: "Ocupación Padre", value: user?.padre_ocupacion || '—' },
        { label: "Ocupación Madre", value: user?.madre_ocupacion || '—' },
        { label: "Total Hermanos", value: user?.familia_num_hermanos || '0' },
        { label: "Hnos. Uni", value: user?.familia_hermanos_uni || '0' },
        { label: "Clima Familiar", value: user?.familia_relacion || 'Buena' },
      ]
    },
    {
      titulo: "Situación Económica",
      icon: Briefcase,
      color: "text-amber-600",
      bg: "bg-amber-50/40",
      items: [
        { label: "Posee empleo", value: user?.posee_empleo_aspirante || 'No' },
        { label: "Empresa", value: user?.socio_trabajo_empresa || 'N/A' },
        { label: "Rango Familiar", value: user?.rango_ingreso_familiar === "1" ? "1 Salario" : user?.rango_ingreso_familiar === "2" ? "1-2 Salarios" : "Más de 2" },
      ]
    },
    {
      titulo: "Balance Financiero ($)",
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50/40",
      items: [
        { label: "Ingresos Totales", value: `$${ingresoTotalFam.toFixed(2)}`, highlight: true },
        { label: "Egresos Totales", value: `$${egresoTotalFam.toFixed(2)}`, highlight: true },
        { label: "Saldo Disponible", value: `$${disponibilidadFinal.toFixed(2)}`, highlight: true }
      ]
    },
    {
      titulo: "Salud y Hogar",
      icon: HeartPulse,
      color: "text-rose-600",
      bg: "bg-rose-50/40",
      items: [
        { label: "Condición Salud", value: user?.salud_condicion_especial || 'Buena' },
        { label: "Diagnóstico", value: user?.salud_enfermedad_desc || 'Ninguno' },
        { label: "Tipo Vivienda", value: user?.vivienda_tipo || '—' },
        { label: "Tenencia", value: user?.vivienda_estatus || '—' },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 pb-12 lg:pb-0">
      
      {/* Banner de Verificación Compacto */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-tight leading-none">Auditoría de Postulación</h3>
          <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mt-1 leading-none">Datos consolidados de los pasos previos.</p>
        </div>
      </div>

      {/* Grid de Auditoría sin scroll */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {secciones.map((sec) => (
          <div key={sec.titulo} className={cn("p-2.5 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-sm", sec.bg)}>
            <div className="flex items-center gap-1.5 border-b border-black/5 pb-1.5">
              <sec.icon className={cn("h-3.5 w-3.5", sec.color)} />
              <h4 className={cn("font-black text-[8.5px] uppercase tracking-widest", sec.color)}>{sec.titulo}</h4>
            </div>
            <div className="space-y-1.5">
              {sec.items.map((item) => (
                <div key={item.label} className="flex justify-between items-center gap-2">
                  <span className="text-[7.5px] font-black text-slate-500 uppercase leading-none">{item.label}</span>
                  <span className={cn(
                    "text-[8.5px] font-black uppercase leading-none text-right truncate max-w-[55%]",
                    item.highlight ? "text-[#1e3a5f]" : "text-slate-600"
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Justificación Compacta */}
        <div className="col-span-full bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[#d4a843]" />
            <h4 className="font-black text-[8.5px] uppercase tracking-widest text-[#1e3a5f]">Justificación de la Solicitud</h4>
          </div>
          <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-100">
            "{user?.motivo_solicitud || "No se registró exposición de motivos."}"
          </p>
        </div>
      </div>

      {/* Footer Compacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 shrink-0">
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5 shadow-sm">
          <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[8.5px] font-black text-[#1e3a5f] uppercase leading-none">Expediente Completo</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">Datos verificados y listos para envío</p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1e3a5f] text-white shadow-sm flex items-center gap-2.5">
          <AlertCircle className="h-4 w-4 text-[#d4a843] shrink-0" />
          <p className="text-[7.5px] leading-snug font-bold uppercase tracking-tight opacity-90">
            La falsedad en estos datos anula la solicitud inmediatamente.
          </p>
        </div>
      </div>
    </div>
  )
}