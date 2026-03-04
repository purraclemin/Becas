"use client"

import React from "react"
import { Copy, ChevronRight, Check } from "lucide-react"

export function AuditSection({ icon: Icon, title, fields, formData, dataEstudiante, copyValue, setFormData }: any) {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-5 w-5 text-[#d4a843]" />
        <h3 className="text-xs font-black text-[#1a2744] uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {fields.map((f: any) => {
          const valEstudiante = dataEstudiante?.[f.name] ?? "No declarado";
          const valAdmin = formData[f.name];
          
          // Normalización para comparación visual de inconsistencias (on/off, Si/No)
          // Se agrega soporte para comparación numérica limpia
          const normalize = (v: any) => {
            if (v === 'on' || v === 'Posee' || v === 'Si' || v === 'Sí') return 'on_true';
            if (v === 'off' || v === 'No posee' || v === 'No') return 'off_false';
            if (!isNaN(v) && v !== null && v !== "") return parseFloat(v).toString();
            return v?.toString().toLowerCase().trim();
          };
          
          const displayEstudiante = normalize(valEstudiante);
          const displayAdmin = normalize(valAdmin);

          const isDifferent = valAdmin !== undefined && valAdmin !== "" && displayAdmin !== displayEstudiante && valEstudiante !== "No declarado";
          const isEmpty = valAdmin === undefined || valAdmin === "" || valAdmin === "seleccione";

          return (
            <div key={f.name} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* LADO IZQUIERDO: DECLARED DATA */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{f.label} (Declarado)</p>
                  <p className="text-sm font-black text-[#1a2744] truncate uppercase italic">{valEstudiante}</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    // Lógica de copia inteligente por tipo de campo
                    let copyTarget = valEstudiante;
                    
                    if (f.type === 'checkbox') {
                      copyTarget = (valEstudiante === 'Posee' || valEstudiante === 'on') ? 'on' : 'off';
                    } else if (f.name === 'salud_condicion_especial' || f.name === 'posee_empleo_aspirante') {
                      copyTarget = (valEstudiante === 'Si' || valEstudiante === 'Sí' || valEstudiante === 'on') ? 'Si' : 'No';
                    } else if (f.type === 'number') {
                      // Aseguramos que los montos de ingresos se copien sin caracteres extraños
                      copyTarget = valEstudiante.toString().replace(/[^0-9.]/g, '');
                    }
                    
                    copyValue(f.name, copyTarget);
                  }} 
                  className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-[#d4a843] hover:border-[#d4a843] transition-all shadow-sm shrink-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* LADO DERECHO: ADMIN VERIFICATION */}
              <div className="relative">
                <div className="absolute -top-2 left-4 px-2 bg-white z-10">
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isEmpty ? 'text-slate-400' : isDifferent ? 'text-rose-500' : 'text-[#d4a843]'}`}>
                    {isEmpty ? 'Pendiente' : isDifferent ? '⚠️ Inconsistencia' : 'Verificación Admin'}
                  </span>
                </div>

                {f.type === 'checkbox' ? (
                  <div 
                    onClick={() => setFormData((p:any) => ({...p, [f.name]: valAdmin === 'on' ? 'off' : 'on'}))}
                    className={`w-full bg-white border-2 p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all ${valAdmin === 'on' ? 'border-[#d4a843] bg-[#d4a843]/5' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <span className={`text-sm font-bold uppercase ${valAdmin === 'on' ? 'text-[#1a2744]' : 'text-slate-400'}`}>
                      {valAdmin === 'on' ? 'Posee / Activo' : 'No posee / Inactivo'}
                    </span>
                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${valAdmin === 'on' ? 'bg-[#d4a843] border-[#d4a843]' : 'border-slate-200'}`}>
                      {valAdmin === 'on' && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                ) : f.options ? (
                  <select 
                    name={f.name} value={valAdmin || ""} 
                    onChange={(e) => setFormData((p:any) => ({...p, [f.name]: e.target.value}))} 
                    className={`w-full bg-white border-2 p-4 rounded-xl text-sm font-bold text-[#1a2744] outline-none transition-all appearance-none ${isEmpty ? 'border-slate-100 focus:border-[#d4a843]' : isDifferent ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 focus:border-[#d4a843]'}`}
                  >
                    <option value="">Seleccione...</option>
                    {f.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input 
                    name={f.name} type={f.type || "text"} value={valAdmin || ""} 
                    onChange={(e) => setFormData((p:any) => ({...p, [f.name]: e.target.value}))} 
                    className={`w-full bg-white border-2 p-4 rounded-xl text-sm font-bold text-[#1a2744] outline-none transition-all ${isEmpty ? 'border-slate-100 focus:border-[#d4a843]' : isDifferent ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 focus:border-[#d4a843]'}`} 
                    placeholder="Ingrese valor verificado..."
                  />
                )}
                {f.options && f.type !== 'checkbox' && <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 rotate-90" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}