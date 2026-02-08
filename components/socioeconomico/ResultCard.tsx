//La tarjeta de resultados y colores Este componente se encarga de mostrar el puntaje, los colores de riesgo y la leyenda técnica.
"use client"
import React from "react"
import { CheckCircle2, Info, Printer, HelpCircle, Check, Copy } from "lucide-react"

export function ResultCard({ student, formData, labels }: any) {
  
  // Configuración de colores (Movido aquí para limpiar el componente principal)
  const configRiesgo = {
    Alto: { color: "bg-red-600", bgLight: "bg-red-50", text: "text-red-700", desc: "CRÍTICO: Vulnerabilidad alta. Requiere asignación prioritaria de beneficio." },
    Medio: { color: "bg-amber-500", bgLight: "bg-amber-50", text: "text-amber-700", desc: "MODERADO: Se detectan carencias importantes en el entorno económico." },
    Bajo: { color: "bg-emerald-600", bgLight: "bg-emerald-50", text: "text-emerald-700", desc: "ESTABLE: Condiciones de vida básicas cubiertas. Riesgo de deserción bajo." }
  }[student?.nivel_riesgo as 'Alto' | 'Medio' | 'Bajo'] || { color: "bg-slate-600", bgLight: "bg-slate-50", text: "text-slate-700", desc: "Sin evaluación" };

  return (
    <div className="animate-in zoom-in-95 duration-500 space-y-6">
      {/* TARJETA PRINCIPAL */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className={`p-8 text-white flex justify-between items-center ${configRiesgo.color}`}>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Nivel {student.nivel_riesgo}</h3>
            <p className="text-[10px] font-bold uppercase mt-2 opacity-80 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Expediente Validado</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase opacity-70">Puntaje</p>
            <p className="text-5xl font-black">{student.puntaje} <span className="text-sm">PTS</span></p>
          </div>
        </div>
        
        <div className={`p-6 border-b flex items-start gap-4 ${configRiesgo.bgLight} ${configRiesgo.text}`}>
          <Info className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-bold leading-relaxed">{configRiesgo.desc}</p>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
            {Object.entries(formData)
             .filter(([key]) => labels[key]) 
             .map(([key, value]: any) => (
             <div key={key} className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{labels[key]}</span>
                <span className="text-[11px] font-bold text-[#1a2744] uppercase">{value}</span>
             </div>
            ))}
        </div>
      </div>

      {/* LEYENDA TÉCNICA */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 print:hidden">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <HelpCircle className="text-[#d4a843]" />
          <h3 className="font-black text-[#1a2744] uppercase tracking-widest text-sm">Escala de Valoración</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LegendItem label="Ingreso < $100" pts="+20" />
          <LegendItem label="Rancho / Anexo" pts="+15" />
          <LegendItem label="Jefe Desempleado" pts="+15" />
          <LegendItem label="Familia > 5" pts="+10" />
          <LegendItem label="Sin PC / Laptop" pts="+10" />
          <LegendItem label="Vivienda Alquilada" pts="+10" />
        </div>
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> <span className="text-[10px] font-black text-slate-400">60+ ALTO</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> <span className="text-[10px] font-black text-slate-400">30-59 MEDIO</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-600"></div> <span className="text-[10px] font-black text-slate-400">0-29 BAJO</span></div>
            </div>
            <button onClick={() => window.print()} className="bg-[#1a2744] text-white px-8 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"><Printer className="h-4 w-4" /> Imprimir Ficha</button>
        </div>
      </div>
    </div>
  )
}

function LegendItem({ label, pts }: {label: string, pts: string}) {
  return (
    <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
      <span className="bg-[#1a2744] text-[#d4a843] text-[10px] px-2.5 py-0.5 rounded-lg font-black">{pts}</span>
    </div>
  )
}