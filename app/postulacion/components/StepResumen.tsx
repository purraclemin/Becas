"use client"

import React from "react"
import { 
  CheckCircle2, 
  User, 
  BookOpen, 
  HeartPulse, 
  Wallet, 
  Home,
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
  tipoBeca // Se añade para cumplir con la llamada desde el contenedor
}: {
  user: any;
  promedio: string;
  trimestre: string;
  tipoBeca?: string; // Propiedad opcional para resolver el error de TS
}) {
  // 1. Cálculos dinámicos basados exclusivamente en los inputs retenidos
  const edadCalculada = user?.fecha_nacimiento ? calcularEdad(user.fecha_nacimiento) : "—";
  
  const nombreCompleto = user?.nombres && user?.apellidos 
    ? `${user.nombres} ${user.apellidos}` 
    : user?.nombre || "—";

  // LÓGICA FINANCIERA SEGURA (Transformación estricta de string a número)
  const getMonto = (valor: any) => {
    if (!valor) return 0;
    const num = parseFloat(valor.toString().replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // SUMA DE INGRESOS (Datos capturados de los steps)
  const sueldoTrabajo = getMonto(user?.monto_ingreso_sueldo);
  const sueldosGrupo = getMonto(user?.monto_ingreso_familiar);
  const extras = getMonto(user?.monto_ingreso_extra);
  const pension = getMonto(user?.monto_ingreso_pension);
  const remesas = getMonto(user?.monto_ingreso_ayuda);
  
  const ingresoTotalFam = sueldoTrabajo + sueldosGrupo + extras + pension + remesas;

  // SUMA DE EGRESOS (Datos capturados de los steps)
  const egresoAlimentos = getMonto(user?.monto_egreso_mercado);
  const egresoAlquiler = getMonto(user?.monto_egreso_vivienda);
  const egresoSalud = getMonto(user?.monto_egreso_salud);
  const egresoServicios = getMonto(user?.monto_egreso_servicios);
  
  const egresoTotalFam = egresoAlimentos + egresoAlquiler + egresoSalud + egresoServicios;

  // DISPONIBILIDAD (Ingresos - Egresos)
  const disponibilidadFinal = ingresoTotalFam - egresoTotalFam;

  // 2. Mapeo de Secciones
  const secciones: ResumenSeccion[] = [
    {
      titulo: "Académico e Institucional",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      items: [
        { label: "Trimestre en curso", value: user?.semestre ? `N° ${user.semestre}` : '—' },
        { label: "Tipo de Beca", value: tipoBeca || user?.tipo_beca || "No seleccionada", highlight: true },
        { label: "Índice de postulación", value: promedio, highlight: true },
        { label: "Carrera", value: user?.carrera || "No especificada" },
        { label: "Modalidad", value: user?.socio_modalidad === 'P' ? 'Presencial' : user?.socio_modalidad === 'V' ? 'Virtual' : 'Semipresencial' },
      ]
    },
    {
      titulo: "Perfil del Solicitante",
      icon: User,
      color: "text-slate-600",
      bg: "bg-slate-50/50",
      items: [
        { label: "Nombre Completo", value: nombreCompleto },
        { label: "Cédula", value: user?.cedula || '—' },
        { label: "Fec. Nacimiento", value: user?.fecha_nacimiento || '—' },
        { label: "Edad", value: edadCalculada !== "—" ? `${edadCalculada} años` : '—' },
        { label: "Estado Civil", value: user?.socio_estado_civil || user?.edo_civil || 'No especificado' },
        { label: "Correo", value: user?.email || user?.correo || '—' },
      ]
    },
    {
      titulo: "Carga Familiar",
      icon: Users2,
      color: "text-indigo-600",
      bg: "bg-indigo-50/50",
      items: [
        { label: "Ocupación Padre", value: user?.padre_ocupacion || '—' },
        { label: "Ocupación Madre", value: user?.madre_ocupacion || '—' },
        { label: "Total Hermanos", value: user?.familia_num_hermanos || '0' },
        { label: "Hnos. en Universidad", value: user?.familia_hermanos_uni || '0' },
        { label: "Clima Familiar", value: user?.familia_relacion || 'Buena' },
      ]
    },
    {
      titulo: "Situación Económica",
      icon: Briefcase,
      color: "text-amber-600",
      bg: "bg-amber-50/50",
      items: [
        { label: "¿Trabaja actualmente?", value: user?.posee_empleo_aspirante === "Si" ? 'Sí' : 'No' },
        { label: "Sueldo Personal", value: sueldoTrabajo > 0 ? `$${sueldoTrabajo.toFixed(2)}` : '$0.00' },
        { label: "Empresa", value: user?.socio_trabajo_empresa || 'N/A' },
        { label: "Rango Familiar", value: user?.rango_ingreso_familiar === "1" ? "1 Salario" : user?.rango_ingreso_familiar === "2" ? "1-2 Salarios" : "Más de 2" },
      ]
    },
    {
      titulo: "Balance Financiero ($)",
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
      items: [
        { label: "Ingreso Total Familiar", value: `$${ingresoTotalFam.toFixed(2)}`, highlight: true },
        { label: "Egreso Total Familiar", value: `$${egresoTotalFam.toFixed(2)}`, highlight: true },
        { 
          label: "Disponibilidad / Saldo", 
          value: `$${disponibilidadFinal.toFixed(2)}`, 
          highlight: true 
        }
      ]
    },
    {
      titulo: "Salud y Hogar",
      icon: HeartPulse,
      color: "text-rose-600",
      bg: "bg-rose-50/50",
      items: [
        { label: "Condición Salud", value: user?.salud_condicion_especial === "Si" ? 'Especial' : 'Buena' },
        { label: "Diagnóstico", value: user?.salud_enfermedad_desc || 'Ninguno' },
        { label: "Tipo Vivienda", value: user?.vivienda_tipo || '—' },
        { label: "Tenencia", value: user?.vivienda_estatus || '—' },
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-500 overflow-hidden h-full">
      
      {/* Banner de Verificación */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5.5 w-5.5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-[#1e3a5f] font-black text-[10px] uppercase tracking-tight leading-none">Auditoría de Postulación</h3>
          <p className="text-slate-400 text-[7px] font-bold uppercase tracking-widest mt-1 leading-none">Toda la información mostrada proviene de los pasos anteriores.</p>
        </div>
      </div>

      {/* Grid de Auditoría de Alta Densidad */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {secciones.map((sec) => (
            <div key={sec.titulo} className={cn("p-2 rounded-xl border border-slate-100 flex flex-col gap-1.5 shadow-sm", sec.bg)}>
              <div className="flex items-center gap-1.5 border-b border-white/40 pb-1">
                <sec.icon className={cn("h-3 w-3", sec.color)} />
                <h4 className={cn("font-black text-[8px] uppercase tracking-widest", sec.color)}>{sec.titulo}</h4>
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => (
                  <div key={item.label} className="flex justify-between items-start gap-2 border-b border-white/20 last:border-0 pb-0.5 last:pb-0">
                    <span className="text-[7px] font-black text-slate-500 uppercase leading-none">{item.label}</span>
                    <span className={cn(
                      "text-[8px] font-black uppercase leading-none text-right truncate max-w-[55%]",
                      item.highlight ? "text-[#d4a843]" : "text-[#1e3a5f]"
                    )}>
                      {item.value || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bloque Especial: Exposición de Motivos */}
          <div className="col-span-full bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-[#d4a843]" />
              <h4 className="font-black text-[8px] uppercase tracking-widest text-[#1e3a5f]">Justificación de la Solicitud</h4>
            </div>
            <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-2 rounded-lg border border-slate-100">
              "{user?.motivo_solicitud || "No se registró exposición de motivos en el paso correspondiente."}"
            </p>
          </div>
        </div>
      </div>

      {/* Pie de Página */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 shrink-0 mt-1">
        <div className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2 shadow-sm">
          <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-[#1e3a5f] uppercase leading-none">Expediente Completo</span>
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Datos capturados de los pasos previos</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-[#1e3a5f] text-white relative overflow-hidden group shadow-md flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-[#d4a843] shrink-0 z-10" />
          <p className="text-[7px] leading-tight font-bold uppercase tracking-tight opacity-90 z-10">
            Los datos son veraces. La falsedad anula la solicitud inmediatamente.
          </p>
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full -mr-6 -mt-6 blur-lg" />
        </div>
      </div>
    </div>
  )
}