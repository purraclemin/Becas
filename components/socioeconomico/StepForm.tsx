//(El formulario por pasos) Este componente maneja los inputs, las secciones y los botones de navegación.
"use client"
import React from "react"
import { Home, Users, DollarSign, Zap, GraduationCap, ChevronRight, Save, Loader2 } from "lucide-react"

export function StepForm({ pasoActual, setPasoActual, handleNext, handleSubmit, loading, formData, setFormData }: any) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
        
        {pasoActual === 1 && <Section icon={Home} title="Vivienda" step="01" 
            fields={[
                {label: "Tipo", name: "tipo_vivienda", options: ["Casa", "Apartamento", "Habitación", "Rancho/Anexo"]}, 
                {label: "Tenencia", name: "tenencia_vivienda", options: ["Propia", "Alquilada", "Prestada", "Pagándose"]}, 
                {label: "Habitaciones", name: "numero_habitaciones", type: "number"}, 
                {label: "Material", name: "material_vivienda", options: ["Bloque", "Madera", "Zinc", "Adobe"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {pasoActual === 2 && <Section icon={Users} title="Familia" step="02" 
            fields={[
                {label: "Personas", name: "num_personas_hogar", type: "number"}, 
                {label: "Trabajan", name: "num_personas_trabajan", type: "number"}, 
                {label: "Dependencia", name: "dependencia_economica", options: ["Padres", "Cónyuge", "Autosuficiente", "Otros"]}, 
                {label: "Discapacidad", name: "carga_familiar_discapacidad", options: ["Si", "No"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {pasoActual === 3 && <Section icon={DollarSign} title="Economía" step="03" 
            fields={[
                {label: "Ingreso ($)", name: "ingreso_mensual_familiar", type: "number"}, 
                {label: "Egreso ($)", name: "egreso_mensual_aproximado", type: "number"}, 
                {label: "Jefe Hogar", name: "empleo_jefe_hogar", options: ["Fijo", "Informal", "Desempleado", "Jubilado"]}, 
                {label: "Ayuda Ext.", name: "ayuda_otros_familiares", options: ["Si", "No"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {pasoActual === 4 && <Section icon={Zap} title="Servicios" step="04" 
            fields={[
                {label: "Internet", name: "acceso_internet", options: ["Excelente", "Bueno", "Deficiente", "No posee"]}, 
                {label: "PC", name: "equipo_computacion", options: ["Si", "No"]}, 
                {label: "Agua/Luz", name: "servicio_agua_luz", options: ["Permanente", "Con Fallas", "Crítico"]}, 
                {label: "Transporte", name: "transporte_universidad", options: ["Público", "Propio", "Caminando", "Cola"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {pasoActual === 5 && <Section icon={GraduationCap} title="Salud/Otros" step="05" 
            fields={[
                {label: "Salud ($)", name: "gastos_medicos_mensuales", type: "number"}, 
                {label: "Residencia", name: "pago_alquiler_residencia", options: ["Si", "No"]}, 
                {label: "Hermanos", name: "hermanos_estudiando", type: "number"}, 
                {label: "Beca", name: "beca_otra_institucion", options: ["Si", "No"]}
            ]} formData={formData} setFormData={setFormData} />}

        <div className="pt-10 flex gap-4">
          {pasoActual > 1 && <button type="button" onClick={() => setPasoActual((p:number) => p-1)} className="flex-1 py-4 border-2 rounded-2xl font-black uppercase text-xs text-slate-500 hover:bg-slate-50 transition-all">Atrás</button>}
          {pasoActual < 5 ? (
            <button type="button" onClick={handleNext} className="flex-1 py-4 bg-[#1a2744] text-[#d4a843] rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg">Siguiente <ChevronRight className="h-4 w-4" /></button>
          ) : (
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-700 transition-all">{loading ? <Loader2 className="animate-spin" /> : <><Save className="h-4 w-4" /> Finalizar Evaluación</>}</button>
          )}
        </div>
      </form>
    </div>
  )
}

function Section({ icon: Icon, title, step, fields, formData, setFormData }: any) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1a2744]/5 rounded-lg text-[#1a2744]"><Icon className="h-5 w-5" /></div>
                    <h2 className="text-lg font-black text-[#1a2744] uppercase tracking-tight">{title}</h2>
                </div>
                <span className="text-4xl font-black text-slate-100 font-serif italic leading-none">{step}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {fields.map((f: any) => (
                    <div key={f.name} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{f.label}</label>
                        {f.options ? (
                            <select 
                              name={f.name} value={formData[f.name]} 
                              onChange={(e) => setFormData((p:any) => ({...p, [f.name]: e.target.value}))} 
                              className={`w-full bg-slate-50 border-2 ${formData[f.name] === "" ? 'border-red-50' : 'border-slate-100'} p-4 rounded-2xl text-sm font-bold text-[#1a2744] outline-none focus:border-[#d4a843] transition-all cursor-pointer`}
                            >
                                <option value="">Seleccione...</option>
                                {f.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        ) : (
                            <input 
                              type={f.type || "text"} name={f.name} value={formData[f.name]} 
                              onChange={(e) => setFormData((p:any) => ({...p, [f.name]: e.target.value}))} 
                              className={`w-full bg-slate-50 border-2 ${formData[f.name] === "" ? 'border-red-50' : 'border-slate-100'} p-4 rounded-2xl text-sm font-bold text-[#1a2744] outline-none focus:border-[#d4a843] transition-all`} 
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}