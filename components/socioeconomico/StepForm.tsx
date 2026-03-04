"use client"

import React, { useEffect, useState } from "react"
import { GraduationCap, Save, Loader2, ClipboardCheck, Lock } from "lucide-react"
import { SECCIONES_MAESTRAS } from "./StepFormData"
import { AuditSection } from "./StepFormUI"

export function StepForm({ student, handleSubmit, loading, formData, setFormData }: any) {
  const [dataEstudiante, setDataEstudiante] = useState<any>(null);

  const formatSafeValue = (val: any) => {
    if (val instanceof Date) return val.toISOString().split('T')[0];
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return val;
  };

  useEffect(() => {
    if (student) {
      const flatData = {
        socio_lugar_nac: student.socio_lugar_nac || "No declarado",
        socio_nacionalidad: student.socio_nacionalidad || "No declarado",
        socio_estado_civil: student.socio_estado_civil || "No declarado",
        socio_municipio: student.municipio_residencia || "No declarado",
        socio_telf_hab: student.socio_telf_hab || "No declarado",
        direccion_completa: student.direccion_completa || "No declarado",
        socio_trabajo_empresa: student.socio_trabajo_empresa || "N/A",
        socio_trabajo_cargo: student.socio_trabajo_cargo || "N/A",
        posee_empleo_aspirante: student.situacion_laboral_jefe || student.posee_empleo_aspirante || "No",
        monto_ingreso_sueldo: student.monto_ingreso_sueldo || "0",
        monto_ingreso_extra: student.monto_ingreso_extra || "0",
        monto_ingreso_pension: student.monto_ingreso_pension || "0",
        monto_ingreso_ayuda: student.monto_ingreso_ayuda || "0",
        monto_ingreso_familiar: student.monto_ingreso_familiar || "0",
        rango_ingreso_familiar: student.rango_ingreso_familiar || "No declarado",
        socio_ue_procedencia: student.socio_ue_procedencia || "No declarado",
        socio_otros_estudios: student.socio_otros_estudios || "Ninguno",
        socio_fecha_unimar: formatSafeValue(student.socio_fecha_unimar) || "",
        socio_carrera: student.carrera || "No declarado",
        socio_trimestre: student.semestre ? student.semestre.toString() : "No declarado",
        socio_modalidad: student.socio_modalidad === "P" ? "Presencial" : student.socio_modalidad === "S" ? "Semipresencial" : "Virtual",
        padre_nombre: student.padre_nombre || "No declarado",
        padre_edad: student.padre_edad || "0",
        padre_ocupacion: student.padre_ocupacion || "No declarado",
        padre_trabajo: student.padre_trabajo || "No declarado",
        madre_nombre: student.madre_nombre || "No declarado",
        madre_edad: student.madre_edad || "0",
        madre_ocupacion: student.madre_ocupacion || "No declarado",
        madre_trabajo: student.madre_trabajo || "No declarado",
        familia_num_hermanos: student.familia_num_hermanos ?? "0", 
        familia_hermanos_uni: student.familia_hermanos_uni ?? "0",
        familia_relacion: student.familia_relacion || "Buena",
        monto_egreso_mercado: student.monto_egreso_mercado || "0",
        monto_egreso_vivienda: student.monto_egreso_vivienda || "0",
        monto_egreso_salud: student.monto_egreso_salud || "0",
        monto_egreso_servicios: student.monto_egreso_servicios || "0",
        vivienda_tipo: student.vivienda_tipo || "No declarado",
        vivienda_estatus: student.vivienda_estatus || "No declarado",
        serv_internet: student.serv_internet === "on" ? "Posee" : "No posee",
        serv_agua: student.serv_agua === "on" ? "Posee" : "No posee",
        serv_luz: student.serv_luz === "on" ? "Posee" : "No posee",
        serv_gas: student.serv_gas === "on" ? "Posee" : "No posee",
        serv_aseo: student.serv_aseo === "on" ? "Posee" : "No posee",
        equip_lavadora: student.equip_lavadora === "on" ? "Posee" : "No posee",
        equip_nevera: student.equip_nevera === "on" ? "Posee" : "No posee",
        equip_cable: student.equip_cable === "on" ? "Posee" : "No posee",
        salud_condicion_especial: student.salud_condicion_especial || "No",
        salud_enfermedad_desc: student.salud_enfermedad_desc || "N/A",
        salud_tratamiento: student.salud_tratamiento || "N/A"
      };
      setDataEstudiante(flatData);

      const cleanedFormData: any = { student_id: student.id };
      SECCIONES_MAESTRAS.forEach(sec => {
        sec.fields.forEach(f => {
            if (f.type === "number") cleanedFormData[f.name] = "0";
            else if (f.type === "checkbox") cleanedFormData[f.name] = "off";
            else cleanedFormData[f.name] = "";
        });
      });
      setFormData(cleanedFormData);
    }
  }, [student, setFormData]);

  const copyValue = (field: string, value: any) => {
    if (value === "" || value === undefined || value === "No declarado") return;

    let normalizedValue = value;
    let fieldType = "";
    SECCIONES_MAESTRAS.forEach(s => s.fields.forEach(f => { if(f.name === field) fieldType = f.type || ""; }));

    if (fieldType === 'checkbox') {
      normalizedValue = (value === 'Posee' || value === 'on' || value === 'Si' || value === 'Sí') ? 'on' : 'off';
    } else if (field === 'salud_condicion_especial' || field === 'posee_empleo_aspirante') {
      normalizedValue = (value === 'Si' || value === 'Sí' || value === 'on' || value === 'Posee') ? 'Si' : 'No';
    }

    setFormData((prev: any) => ({ ...prev, [field]: normalizedValue }));
  };

  const copiarTodoParaPrueba = () => {
    if (!dataEstudiante) return;
    const newData = { ...formData };
    
    const camposNumericos = [
        'monto_ingreso_sueldo', 'monto_ingreso_extra', 'monto_ingreso_pension', 'monto_ingreso_ayuda', 'monto_ingreso_familiar',
        'familia_num_hermanos', 'familia_hermanos_uni', 'monto_egreso_mercado', 'monto_egreso_vivienda',
        'monto_egreso_salud', 'monto_egreso_servicios'
    ];

    Object.keys(dataEstudiante).forEach(key => {
      const val = dataEstudiante[key];
      if (val !== "" && val !== undefined && val !== "No declarado") {
          if (camposNumericos.includes(key)) {
              newData[key] = val.toString().replace(/[^0-9.]/g, '');
          } else if (val === "Posee" || val === "on" || val === "Si" || val === "Sí") {
              let isCheck = false;
              SECCIONES_MAESTRAS.forEach(s => s.fields.forEach(f => { if(f.name === key && f.type === 'checkbox') isCheck = true; }));
              newData[key] = isCheck ? "on" : "Si";
          } else if (val === "No posee" || val === "off" || val === "No") {
              let isCheck = false;
              SECCIONES_MAESTRAS.forEach(s => s.fields.forEach(f => { if(f.name === key && f.type === 'checkbox') isCheck = true; }));
              newData[key] = isCheck ? "off" : "No";
          } else {
              newData[key] = val;
          }
      }
    });
    setFormData(newData);
  };

  const handleValidateAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    for (const seccion of SECCIONES_MAESTRAS) {
      for (const field of seccion.fields) {
        const val = formData[field.name];
        if (field.type !== "checkbox" && (val === undefined || val === "" || val === "seleccione")) {
          const element = document.getElementsByName(field.name)[0];
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          return;
        }
      }
    }

    await handleSubmit(e);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFormComplete = SECCIONES_MAESTRAS.every(s => 
    s.fields.every(f => 
      f.type === "checkbox" || (formData[f.name] !== undefined && formData[f.name] !== "" && formData[f.name] !== "seleccione")
    )
  );

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#1a2744] rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="h-5 w-5 text-[#d4a843]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#1a2744] uppercase tracking-widest">Contraste de Auditoría Final</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Sincronización Total con Base de Datos</p>
          </div>
        </div>
        <button type="button" onClick={copiarTodoParaPrueba} className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-[#d4a843] hover:text-white text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all shadow-sm">
          <ClipboardCheck className="h-4 w-4" /> Modo Prueba: Copiar Todo
        </button>
      </div>

      <form onSubmit={handleValidateAndSubmit} className="p-0">
        <div className="divide-y divide-slate-100">
          {SECCIONES_MAESTRAS.map((sec, idx) => (
            <AuditSection 
              key={idx} icon={sec.icon} title={sec.titulo} fields={sec.fields}
              formData={formData} dataEstudiante={dataEstudiante} copyValue={copyValue} setFormData={setFormData}
            />
          ))}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200">
          <button 
            type="submit" disabled={loading} 
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl transition-all ${
              !isFormComplete ? "bg-slate-300 text-slate-500 hover:bg-rose-500 hover:text-white" : "bg-[#1a2744] text-[#d4a843] hover:scale-[1.01]"
            }`}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
              <>{!isFormComplete ? <Lock className="h-5 w-5" /> : <Save className="h-5 w-5" />} Finalizar y Guardar Baremo</>
            )}
          </button>
          {!isFormComplete && (
            <p className="text-center mt-4 text-[9px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">
              ⚠️ Incompleto: El botón le llevará al campo faltante al hacer clic
            </p>
          )}
        </div>
      </form>
    </div>
  )
}