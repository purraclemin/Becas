import React from "react"
import { BookOpen, Calendar } from "lucide-react"
import { RegistroFormState } from "./Step1Personal"
import { CARRERAS_UNIMAR_LIST, TRIMESTRES_UNIMAR_LIST } from "./validations"

interface Step2AcademicProps {
  form: RegistroFormState;
  updateField: (field: keyof RegistroFormState, value: string | boolean) => void;
}

export const Step2Academic = ({ form, updateField }: Step2AcademicProps) => (
  <div className="space-y-3.5 animate-in fade-in slide-in-from-right-4 duration-300">
    {/* SELECTOR DE CARRERA */}
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">
        Carrera
      </label>
      <div className="relative">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af]" />
        <select
          name="carrera"
          value={form.carrera}
          onChange={(e) => updateField("carrera", e.target.value)}
          className="w-full h-11 sm:h-9 rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] pl-9 pr-9 text-sm sm:text-xs focus:border-[#d4a843] outline-none appearance-none cursor-pointer font-bold text-[#1e3a5f]"
          required
        >
          <option value="">Selecciona tu carrera</option>
          {CARRERAS_UNIMAR_LIST.map((carrera) => (
            <option key={carrera} value={carrera}>
              {carrera}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>

    {/* SELECTOR DE TRIMESTRE */}
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">
        Trimestre Actual
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9ca3af]" />
        <select
          name="semestre"
          value={form.semestre}
          onChange={(e) => updateField("semestre", e.target.value)}
          className="w-full h-11 sm:h-9 rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] pl-9 pr-9 text-sm sm:text-xs focus:border-[#d4a843] outline-none appearance-none cursor-pointer font-bold text-[#1e3a5f]"
          required
        >
          <option value="">Selecciona el Trimestre</option>
          {TRIMESTRES_UNIMAR_LIST.map((trimestre) => (
            <option key={trimestre} value={trimestre}>
              {trimestre}° Trimestre
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  </div>
);