import React from "react"
import { BookOpen, Calendar } from "lucide-react"

export const Step2Academic = ({ form, updateField }: any) => (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">Carrera</label>
      <div className="relative">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <select
          value={form.carrera}
          onChange={(e) => updateField("carrera", e.target.value)}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-10 text-sm focus:border-[#d4a843] outline-none appearance-none cursor-pointer"
          required
        >
          {/* 🟢 NOTA: Los 'value' se han estandarizado (sin acentos) para coincidir con SeccionesEncuesta.tsx */}
          <option value="">Selecciona tu carrera</option>
          <option value="Ingenieria de Sistemas">Ingeniería de Sistemas</option>
          <option value="Ingenieria Industrial">Ingeniería Industrial</option>
          <option value="Administracion">Administración</option>
          <option value="Contaduria Publica">Contaduría Pública</option>
          <option value="Derecho">Derecho</option>
          <option value="Psicologia">Psicología</option>
          <option value="Educacion Integral">Educación Integral</option>
          <option value="Diseño Grafico">Diseño Gráfico</option>
          <option value="Idiomas Modernos">Idiomas Modernos</option>
          <option value="Comunicacion Social">Comunicación Social</option>
          <option value="Turismo">Turismo</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">Trimestre Actual</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <select
          value={form.semestre}
          onChange={(e) => updateField("semestre", e.target.value)}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-10 text-sm focus:border-[#d4a843] outline-none appearance-none cursor-pointer"
          required
        >
          <option value="">Selecciona el Trimestre</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
            <option key={n} value={n}>{n}° Trimestre</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </div>
    </div>
  </div>
);