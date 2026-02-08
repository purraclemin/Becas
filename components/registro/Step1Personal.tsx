import React from "react"
import { User, CreditCard, Phone, Mail } from "lucide-react"
import { validateLetters, validateNumbers } from "./validations"

export const Step1Personal = ({ form, updateField }: any) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => updateField("nombre", validateLetters(e.target.value))}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            placeholder="Ej: Juan"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Apellido</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            value={form.apellido}
            onChange={(e) => updateField("apellido", validateLetters(e.target.value))}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            placeholder="Ej: Pérez"
          />
        </div>
      </div>
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Cédula</label>
      <div className="relative">
        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <input
          type="text"
          inputMode="numeric"
          value={form.cedula}
          onChange={(e) => updateField("cedula", validateNumbers(e.target.value, 8))}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
          placeholder="00000000"
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Teléfono</label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <input
          type="text"
          inputMode="tel"
          value={form.telefono}
          onChange={(e) => updateField("telefono", validateNumbers(e.target.value, 11))}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
          placeholder="04120000000"
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Email Institucional</label>
      <div className="relative flex">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af] z-10" />
          <input
            type="text"
            value={form.email.replace("@unimar.edu.ve", "")}
            onChange={(e) => updateField("email", e.target.value.split("@")[0] + "@unimar.edu.ve")}
            placeholder="ej: juan.perez"
            className="w-full rounded-l-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-3 text-sm outline-none focus:border-[#d4a843]"
          />
        </div>
        <div className="flex items-center justify-center bg-[#f1f5f9] border-y border-r border-[#e2e8f0] rounded-r-lg px-3 text-[11px] font-bold text-[#1e3a5f]">
          @unimar.edu.ve
        </div>
      </div>
    </div>
  </div>
);