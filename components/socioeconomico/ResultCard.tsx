"use client"

import React from "react"
import { CheckCircle2, Info, Printer, HelpCircle, AlertTriangle, BadgeCheck, Activity, Landmark } from "lucide-react"

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
  transporte_university: "Transporte a Universidad",
  gastos_medicos_mensuales: "Gastos Médicos",
  pago_alquiler_residencia: "Pago de Alquiler",
  hermanos_estudiando: "Hermanos Estudiando",
  beca_otra_institucion: "Beca Externa"
}

const CAMPOS_MONETARIOS = [
  "ingreso_mensual_familiar",
  "egreso_mensual_aproximado",
  "gastos_medicos_mensuales"
];

export function ResultCard({ student, formData }: any) {
  
  const getNivelConfig = (nivel: string) => {
    switch (nivel) {
      case 'Alto':
        return {
          bgHeader: "bg-rose-600",
          bgLight: "bg-rose-50/80",
          text: "text-rose-800",
          border: "border-rose-200",
          icon: <AlertTriangle className="h-6 w-6 text-rose-600" />,
          desc: "CRÍTICO: Vulnerabilidad alta detectada. Requiere asignación prioritaria de beneficio."
        };
      case 'Medio':
        return {
          bgHeader: "bg-amber-500",
          bgLight: "bg-amber-50/80",
          text: "text-amber-800",
          border: "border-amber-200",
          icon: <Info className="h-6 w-6 text-amber-600" />,
          desc: "MODERADO: Se detectan carencias importantes. Evaluación de apoyo recomendada."
        };
      case 'Bajo':
        return {
          bgHeader: "bg-emerald-600",
          bgLight: "bg-emerald-50/80",
          text: "text-emerald-800",
          border: "border-emerald-200",
          icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
          desc: "ESTABLE: Condiciones socioeconómicas básicas cubiertas. Riesgo de deserción bajo."
        };
      default:
        return {
          bgHeader: "bg-slate-700",
          bgLight: "bg-slate-50",
          text: "text-slate-800",
          border: "border-slate-200",
          icon: <HelpCircle className="h-6 w-6 text-slate-600" />,
          desc: "PENDIENTE: El expediente requiere validación técnica adicional."
        };
    }
  };

  const config = getNivelConfig(student?.nivel_riesgo);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* TARJETA PRINCIPAL: ESTILO REPORTE OFICIAL */}
      <div className="bg-white rounded-[1.5rem] shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-2">
        
        {/* Encabezado Institucional */}
        <div className={`p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 ${config.bgHeader} relative overflow-hidden`}>
          {/* Sutil decorado de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] opacity-90 mb-2">
              <Landmark className="h-4 w-4" /> Dirección de Bienestar Estudiantil
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              Nivel de Riesgo: {student?.nivel_riesgo || "---"}
            </h3>
            <div className="mt-4 flex items-center gap-3">
               <span className="px-3 py-1 bg-black/20 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <BadgeCheck className="h-3 w-3" /> Expediente Validado
               </span>
               <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{new Date().getFullYear()}</span>
            </div>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center min-w-[140px] shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Score Total</p>
            <p className="text-5xl font-black tabular-nums tracking-tighter">
              {student?.puntaje || 0}
              <span className="text-xs ml-1 opacity-70 font-bold align-top">PTS</span>
            </p>
          </div>
        </div>
        
        {/* Sección de Diagnóstico Técnico */}
        <div className={`p-6 border-b flex items-center gap-5 ${config.bgLight} ${config.text} border-x-0`}>
          <div className="p-3 bg-white rounded-xl shadow-md shrink-0 border border-white">
             {config.icon}
          </div>
          <p className="text-sm font-black leading-tight uppercase tracking-tight italic">
            {config.desc}
          </p>
        </div>

        {/* Grilla de Datos Principal: Tamaño Optimizado */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white">
            {Object.entries(formData || {})
              .filter(([key]) => LABELS[key])
              .map(([key, value]: any) => {
                const esMonetario = CAMPOS_MONETARIOS.includes(key);
                return (
                  <div key={key} className="flex flex-col justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-[#d4a843]/30 transition-all group">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-[#d4a843] transition-colors">
                      {LABELS[key]}
                    </span>
                    <span className="text-xs font-black text-[#1a2744] uppercase truncate" title={value}>
                      {esMonetario && value ? `$ ${value}` : value || "---"}
                    </span>
                  </div>
                );
              })}
        </div>
      </div>

      {/* BAREMO E INFORMACIÓN TÉCNICA */}
      <div className="bg-white p-8 rounded-[1.5rem] shadow-xl border border-slate-200 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#d4a843]/10 rounded-xl border border-[#d4a843]/20">
               <Activity className="h-6 w-6 text-[#d4a843]" />
            </div>
            <div>
              <h3 className="font-black text-[#1a2744] uppercase tracking-widest text-sm">Criterios de Puntuación Acumulada</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Metodología de Valoración Institucional Unimar</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()} 
            className="w-full md:w-auto bg-[#1a2744] hover:bg-[#253659] text-[#d4a843] px-8 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            <Printer className="h-4 w-4" /> Imprimir Reporte PDF
          </button>
        </div>

        {/* Grilla detallada del Baremo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <LegendItem label="Ingreso < $100" pts="+20 pts" desc="Vulnerabilidad económica severa" />
          <LegendItem label="Vivienda Precaria" pts="+15 pts" desc="Residencia en rancho o anexo" />
          <LegendItem label="Jefe Desempleado" pts="+15 pts" desc="Ausencia de ingreso fijo familiar" />
          <LegendItem label="Hacinamiento" pts="+10 pts" desc="Más de 5 personas en el hogar" />
          <LegendItem label="Brecha Digital" pts="+10 pts" desc="Sin equipo de computación" />
          <LegendItem label="Carga Inmobiliaria" pts="+10 pts" desc="Vivienda en estado de alquiler" />
          <LegendItem label="Discapacidad" pts="+10 pts" desc="Carga familiar por salud" />
          <LegendItem label="Conectividad" pts="+10 pts" desc="Acceso deficiente a internet" />
        </div>
        
        {/* Leyenda de Riesgos Inferior */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-8 justify-between items-center">
            <div className="flex flex-wrap justify-center gap-6 bg-slate-50 px-8 py-3 rounded-2xl border border-slate-200">
              <RiskBadge color="bg-rose-600" label="60+ ALTO" />
              <RiskBadge color="bg-amber-500" label="30-59 MEDIO" />
              <RiskBadge color="bg-emerald-600" label="0-29 BAJO" />
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">Bienestar Estudiantil &bull; 2026</p>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ label, pts, desc }: {label: string, pts: string, desc: string}) {
  return (
    <div className="flex flex-col p-4 bg-slate-50/50 rounded-xl border border-slate-100 transition-all hover:border-[#d4a843]/30 hover:shadow-md group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight leading-tight pr-2">{label}</span>
        <span className="text-[10px] font-black text-[#d4a843] whitespace-nowrap bg-[#d4a843]/5 px-2 py-0.5 rounded-lg border border-[#d4a843]/10">{pts}</span>
      </div>
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter leading-tight">{desc}</p>
    </div>
  )
}

function RiskBadge({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm ring-2 ring-white`}></div> 
      <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">{label}</span>
    </div>
  )
}