"use client"

import React from "react"
import { GraduationCap, Save, Loader2, ClipboardCheck, Lock } from "lucide-react"
import { SECCIONES_MAESTRAS } from "./StepFormData"
import { AuditSection } from "./StepFormUI"
import { useStepForm } from "./hook/HookStepForm"
import type { EstudioSocioeconomicoInput } from "@/lib/ActionsSocioeconomicoActions"

type FormStateMap = Record<string, string | number | boolean | null | undefined>;

interface StepFormProps {
  student: EstudioSocioeconomicoInput | null | undefined;
  handleSubmit: (e: React.FormEvent) => Promise<void> | void;
  loading: boolean;
  formData: FormStateMap;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}

export function StepForm({
  student,
  handleSubmit,
  loading,
  formData,
  setFormData
}: StepFormProps) {
  const {
    dataEstudiante,
    copyValue,
    copiarTodoParaPrueba,
    handleValidateAndSubmit,
    isFormComplete,
    campoFaltante,
    formContainerRef,
  } = useStepForm(student, formData, setFormData);

  return (
    <div
      ref={formContainerRef}
      className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden"
    >
      <div className="bg-[#f8fafc] border-b border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center shadow-sm">
            <GraduationCap className="h-5 w-5 text-[#d4a843]" />
          </div>
          <div>
            <h2 className="text-sm font-black text-[#1e3a5f] uppercase tracking-widest">
              Contraste de Auditoría Final
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              Sincronización Total con Base de Datos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={copiarTodoParaPrueba}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-[#d4a843] hover:text-[#1e3a5f] text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
        >
          <ClipboardCheck className="h-4 w-4" /> Modo Prueba: Copiar Todo
        </button>
      </div>

      <form onSubmit={(e) => handleValidateAndSubmit(e, handleSubmit)} className="p-0">
        <div className="divide-y divide-slate-100">
          {SECCIONES_MAESTRAS.map((sec, idx) => (
            <AuditSection
              key={idx}
              icon={sec.icon}
              title={sec.titulo}
              fields={sec.fields}
              formData={formData as Record<string, unknown>}
              dataEstudiante={dataEstudiante}
              copyValue={copyValue}
              setFormData={setFormData}
              campoFaltante={campoFaltante}
            />
          ))}
        </div>

        <div className="p-8 bg-[#f8fafc] border-t border-slate-200">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer ${
              !isFormComplete
                ? "bg-slate-300 text-slate-600 hover:bg-rose-500 hover:text-white"
                : "bg-[#1e3a5f] text-[#d4a843] hover:scale-[1.01]"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                {!isFormComplete ? <Lock className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                Finalizar y Guardar Baremo
              </>
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