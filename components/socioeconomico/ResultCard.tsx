"use client"

import React from "react"
import { CheckCircle2, Info, Printer, HelpCircle, Check, Copy, AlertTriangle } from "lucide-react"

// Diccionario de etiquetas para mostrar nombres bonitos en lugar de keys
const LABELS: Record<string, string> = {
  tipo_vivienda: "Tipo de Vivienda",
  tenencia_vivienda: "Tenencia",
  numero_habitaciones: "N° Habitaciones",
  material_vivienda: "Material Predominante",
  num_personas_hogar: "Personas en el Hogar",
  num_personas_trabajan: "Personas que Trabajan",
  dependencia_economica: "Dependencia Económica",
  carga_familiar_discapacidad: "Discapacidad en Familia",
  ingreso_mensual_familiar: "Ingreso Familiar Mensual",
  egreso_mensual_aproximado: "Egreso Mensual Aprox.",
  empleo_jefe_hogar: "Ocupación Jefe Hogar",
  ayuda_otros_familiares: "Ayuda de Terceros",
  acceso_internet: "Acceso a Internet",
  equipo_computacion: "Equipo de Computación",
  servicio_agua_luz: "Servicios Básicos",
  transporte_universidad: "Transporte a Universidad",
  gastos_medicos_mensuales: "Gastos Médicos",
  pago_alquiler_residencia: "Pago de Alquiler",
  hermanos_estudiando: "Hermanos Estudiando",
  beca_otra_institucion: "Beca Externa"
}

export function ResultCard({ student, formData }: any) {
  
  // Lógica de Colores y Descripción según el Nivel de Riesgo
  const getNivelConfig = (nivel: string) => {
    switch (nivel) {
      case 'Alto':
        return {
          bgHeader: "bg-rose-600",
          bgLight: "bg-rose-50",
          text: "text-rose-700",
          icon: <AlertTriangle className="h-5 w-5" />,
          desc: "CRÍTICO: Vulnerabilidad alta. Se recomienda asignación prioritaria de beneficio."
        };
      case 'Medio':
        return {
          bgHeader: "bg-amber-500",
          bgLight: "bg-amber-50",
          text: "text-amber-700",
          icon: <Info className="h-5 w-5" />,
          desc: "MODERADO: Se detectan carencias importantes en el entorno económico."
        };
      case 'Bajo':
        return {
          bgHeader: "bg-emerald-600",
          bgLight: "bg-emerald-50",
          text: "text-emerald-700",
          icon: <CheckCircle2 className="h-5 w-5" />,
          desc: "ESTABLE: Condiciones de vida básicas cubiertas. Riesgo de deserción bajo."
        };
      default:
        return {
          bgHeader: "bg-slate-600",
          bgLight: "bg-slate-50",
          text: "text-slate-700",
          icon: <HelpCircle className="h-5 w-5" />,
          desc: "SIN EVALUACIÓN: No se ha calculado el riesgo."
        };
    }
  };

  const config = getNivelConfig(student?.nivel_riesgo);

  return (
    <div className="animate-in zoom-in-95 duration-500 space-y-6">
      
      {/* TARJETA PRINCIPAL DE RESULTADOS */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-2">
        
        {/* Encabezado con Color de Riesgo */}
        <div className={`p-8 text-white flex justify-between items-center ${config.bgHeader} print:bg-slate-800`}>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              Nivel {student?.nivel_riesgo || "Desconocido"}
            </h3>
            <p className="text-[10px] font-bold uppercase mt-2 opacity-80 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Expediente Validado • {new Date().getFullYear()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-70">Puntaje Total</p>
            <p className="text-5xl font-black tabular-nums tracking-tight">
              {student?.puntaje || 0} <span className="text-sm align-top opacity-60">PTS</span>
            </p>
          </div>
        </div>
        
        {/* Descripción del Diagnóstico */}
        <div className={`p-6 border-b flex items-start gap-4 ${config.bgLight} ${config.text}`}>
          <div className="shrink-0 mt-0.5">{config.icon}</div>
          <p className="text-sm font-bold leading-relaxed">{config.desc}</p>
        </div>

        {/* Grilla de Datos (Respuestas del Formulario) */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
            {Object.entries(formData || {})
              .filter(([key]) => LABELS[key]) // Solo mostramos lo que tiene etiqueta definida
              .map(([key, value]: any) => (
              <div key={key} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                   {LABELS[key]}
                 </span>
                 <span className="text-[11px] font-bold text-[#1a2744] uppercase text-right truncate max-w-[180px]" title={value}>
                   {value || "-"}
                 </span>
              </div>
            ))}
        </div>
      </div>

      {/* LEYENDA TÉCNICA (Oculta al imprimir para ahorrar tinta) */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 print:hidden">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="bg-[#d4a843]/10 p-2 rounded-full">
            <HelpCircle className="h-5 w-5 text-[#d4a843]" />
          </div>
          <div>
            <h3 className="font-black text-[#1a2744] uppercase tracking-widest text-sm">Baremos de Evaluación</h3>
            <p className="text-[10px] text-slate-400 font-medium">Criterios utilizados para el cálculo del puntaje</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LegendItem label="Ingreso < $100" pts="+20" />
          <LegendItem label="Rancho / Anexo" pts="+15" />
          <LegendItem label="Jefe Desempleado" pts="+15" />
          <LegendItem label="Familia > 5" pts="+10" />
          <LegendItem label="Sin PC / Laptop" pts="+10" />
          <LegendItem label="Vivienda Alquilada" pts="+10" />
          <LegendItem label="Sin Internet" pts="+10" />
          <LegendItem label="Discapacidad" pts="+10" />
        </div>
        
        {/* Footer de la Leyenda */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex flex-wrap justify-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <RiskBadge color="bg-rose-600" label="60+ ALTO" />
              <RiskBadge color="bg-amber-500" label="30-59 MEDIO" />
              <RiskBadge color="bg-emerald-600" label="0-29 BAJO" />
            </div>
            
            <button 
              onClick={() => window.print()} 
              className="bg-[#1a2744] hover:bg-[#253659] text-white px-8 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Printer className="h-4 w-4" /> Imprimir Ficha
            </button>
        </div>
      </div>
    </div>
  )
}

// Subcomponentes para mantener limpio el código principal
function LegendItem({ label, pts }: {label: string, pts: string}) {
  return (
    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm hover:border-[#d4a843]/30 transition-colors">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
      <span className="bg-[#1a2744] text-[#d4a843] text-[10px] px-2.5 py-0.5 rounded-lg font-black tabular-nums">{pts}</span>
    </div>
  )
}

function RiskBadge({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></div> 
            <span className="text-[10px] font-black text-slate-500 tracking-tight">{label}</span>
        </div>
    )
}