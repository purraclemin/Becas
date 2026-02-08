"use client"

import React, { useEffect } from "react"
import { Home, Users, DollarSign, Zap, GraduationCap, ChevronRight, Save, Loader2, ArrowLeft } from "lucide-react"

export function StepForm({ pasoActual, setPasoActual, handleNext, handleSubmit, loading, formData, setFormData }: any) {
  
  // UX: Scrollear hacia arriba cuando cambia el paso para que el usuario no se pierda
  useEffect(() => {
    const formContainer = document.getElementById('step-form-container');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [pasoActual]);

  return (
    <div id="step-form-container" className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      
      {/* Barra de Progreso Superior */}
      <div className="bg-slate-50 h-1.5 w-full flex">
        <div className={`h-full transition-all duration-500 ease-in-out ${pasoActual >= 1 ? 'bg-[#d4a843] w-1/5' : 'bg-transparent w-0'}`}></div>
        <div className={`h-full transition-all duration-500 ease-in-out ${pasoActual >= 2 ? 'bg-[#d4a843] w-1/5' : 'bg-transparent w-0'}`}></div>
        <div className={`h-full transition-all duration-500 ease-in-out ${pasoActual >= 3 ? 'bg-[#d4a843] w-1/5' : 'bg-transparent w-0'}`}></div>
        <div className={`h-full transition-all duration-500 ease-in-out ${pasoActual >= 4 ? 'bg-[#d4a843] w-1/5' : 'bg-transparent w-0'}`}></div>
        <div className={`h-full transition-all duration-500 ease-in-out ${pasoActual >= 5 ? 'bg-[#d4a843] w-1/5' : 'bg-transparent w-0'}`}></div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
        
        {/* PASO 1: VIVIENDA */}
        {pasoActual === 1 && <Section icon={Home} title="Vivienda" step="01" 
            fields={[
                {label: "Tipo", name: "tipo_vivienda", options: ["Casa", "Apartamento", "Habitación", "Rancho/Anexo"]}, 
                {label: "Tenencia", name: "tenencia_vivienda", options: ["Propia", "Alquilada", "Prestada", "Pagándose"]}, 
                {label: "Habitaciones", name: "numero_habitaciones", type: "number"}, 
                {label: "Material", name: "material_vivienda", options: ["Bloque", "Madera", "Zinc", "Adobe"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {/* PASO 2: FAMILIA */}
        {pasoActual === 2 && <Section icon={Users} title="Grupo Familiar" step="02" 
            fields={[
                {label: "Personas en Hogar", name: "num_personas_hogar", type: "number"}, 
                {label: "Personas que Trabajan", name: "num_personas_trabajan", type: "number"}, 
                {label: "Dependencia Económica", name: "dependencia_economica", options: ["Padres", "Cónyuge", "Autosuficiente", "Otros"]}, 
                {label: "Discapacidad en Familia", name: "carga_familiar_discapacidad", options: ["Si", "No"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {/* PASO 3: ECONOMÍA */}
        {pasoActual === 3 && <Section icon={DollarSign} title="Economía" step="03" 
            fields={[
                {label: "Ingreso Familiar ($)", name: "ingreso_mensual_familiar", type: "number"}, 
                {label: "Egreso Aprox. ($)", name: "egreso_mensual_aproximado", type: "number"}, 
                {label: "Ocupación Jefe Hogar", name: "empleo_jefe_hogar", options: ["Fijo", "Informal", "Desempleado", "Jubilado"]}, 
                {label: "Ayuda de Terceros", name: "ayuda_otros_familiares", options: ["Si", "No"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {/* PASO 4: SERVICIOS */}
        {pasoActual === 4 && <Section icon={Zap} title="Servicios Básicos" step="04" 
            fields={[
                {label: "Conexión a Internet", name: "acceso_internet", options: ["Excelente", "Bueno", "Deficiente", "No posee"]}, 
                {label: "Posee Computadora", name: "equipo_computacion", options: ["Si", "No"]}, 
                {label: "Servicio Agua/Luz", name: "servicio_agua_luz", options: ["Permanente", "Con Fallas", "Crítico"]}, 
                {label: "Transporte a U", name: "transporte_universidad", options: ["Público", "Propio", "Caminando", "Cola"]}
            ]} formData={formData} setFormData={setFormData} />}
        
        {/* PASO 5: OTROS */}
        {pasoActual === 5 && <Section icon={GraduationCap} title="Salud y Estudios" step="05" 
            fields={[
                {label: "Gastos Médicos ($)", name: "gastos_medicos_mensuales", type: "number"}, 
                {label: "Paga Residencia Est.", name: "pago_alquiler_residencia", options: ["Si", "No"]}, 
                {label: "Hermanos Estudiando", name: "hermanos_estudiando", type: "number"}, 
                {label: "Beca Otra Institución", name: "beca_otra_institucion", options: ["Si", "No"]}
            ]} formData={formData} setFormData={setFormData} />}

        {/* BOTONES DE NAVEGACIÓN */}
        <div className="pt-8 mt-4 flex gap-4 border-t border-slate-50">
          {pasoActual > 1 && (
            <button 
                type="button" 
                onClick={() => setPasoActual((p:number) => p-1)} 
                className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black uppercase text-xs text-slate-400 hover:text-[#1a2744] hover:border-[#1a2744] hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
                <ArrowLeft className="h-4 w-4" /> Atrás
            </button>
          )}
          
          {pasoActual < 5 ? (
            <button 
                type="button" 
                onClick={handleNext} 
                className="flex-[2] py-4 bg-[#1a2744] text-[#d4a843] rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
                Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button 
                type="submit" 
                disabled={loading} 
                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="h-4 w-4" /> Finalizar Evaluación</>}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// Subcomponente de Sección (Interno)
function Section({ icon: Icon, title, step, fields, formData, setFormData }: any) {
    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-300 fade-in">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#1a2744]/5 rounded-xl text-[#1a2744]"><Icon className="h-6 w-6" /></div>
                    <h2 className="text-xl font-black text-[#1a2744] uppercase tracking-tight">{title}</h2>
                </div>
                <span className="text-5xl font-black text-slate-100 font-serif italic leading-none select-none">{step}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {fields.map((f: any) => (
                    <div key={f.name} className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1 group-focus-within:text-[#d4a843] transition-colors">
                            {f.label}
                        </label>
                        {f.options ? (
                            <div className="relative">
                                <select 
                                    name={f.name} 
                                    value={formData[f.name]} 
                                    onChange={(e) => setFormData((p:any) => ({...p, [f.name]: e.target.value}))} 
                                    className={`w-full bg-slate-50 border-2 ${formData[f.name] === "" ? 'border-slate-100' : 'border-[#d4a843]/20 bg-[#d4a843]/5'} p-4 rounded-2xl text-sm font-bold text-[#1a2744] outline-none focus:border-[#d4a843] transition-all cursor-pointer appearance-none`}
                                >
                                    <option value="">Seleccione...</option>
                                    {f.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none rotate-90" />
                            </div>
                        ) : (
                            <input 
                                type={f.type || "text"} 
                                name={f.name} 
                                value={formData[f.name]} 
                                onChange={(e) => setFormData((p:any) => ({...p, [f.name]: e.target.value}))} 
                                className={`w-full bg-slate-50 border-2 ${formData[f.name] === "" ? 'border-slate-100' : 'border-[#d4a843]/20 bg-[#d4a843]/5'} p-4 rounded-2xl text-sm font-bold text-[#1a2744] outline-none focus:border-[#d4a843] transition-all placeholder:text-slate-300`} 
                                placeholder="0"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}