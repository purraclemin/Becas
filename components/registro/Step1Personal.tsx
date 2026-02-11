import React from "react"
import { User, CreditCard, Phone, Mail, Calendar, MapPin, Users } from "lucide-react"
import { validateLetters, validateNumbers } from "./validations"

export const Step1Personal = ({ form, updateField }: any) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="grid gap-4 sm:grid-cols-2">
      {/* NOMBRE */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Nombre</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={(e) => updateField("nombre", validateLetters(e.target.value))}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            placeholder="Ej: Juan"
            required
          />
        </div>
      </div>

      {/* APELLIDO */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Apellido</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            name="apellido"
            value={form.apellido}
            onChange={(e) => updateField("apellido", validateLetters(e.target.value))}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            placeholder="Ej: Pérez"
            required
          />
        </div>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {/* CÉDULA */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Cédula de Identidad</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            name="cedula"
            value={form.cedula}
            onChange={(e) => updateField("cedula", validateNumbers(e.target.value, 8))}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            placeholder="Ej: 22333444"
            required
          />
        </div>
      </div>

      {/* TELÉFONO */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Teléfono de Contacto</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={(e) => updateField("telefono", validateNumbers(e.target.value, 11))}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            placeholder="Ej: 04121234567"
            required
          />
        </div>
      </div>
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      {/* SEXO */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Sexo</label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <select
            name="sexo"
            value={form.sexo}
            onChange={(e) => updateField("sexo", e.target.value)}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843] appearance-none"
            required
          >
            <option value="">Selecciona</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
      </div>

      {/* FECHA DE NACIMIENTO */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Fecha de Nacimiento</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
          <input
            type="date"
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
            className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            required
          />
        </div>
      </div>
    </div>

    {/* MUNICIPIO */}
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Municipio de Residencia</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
        <select
          name="municipio"
          value={form.municipio}
          onChange={(e) => updateField("municipio", e.target.value)}
          className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843] appearance-none"
          required
        >
          <option value="">Selecciona tu municipio</option>
          <option value="Antolín del Campo">Antolín del Campo</option>
          <option value="Arismendi">Arismendi</option>
          <option value="Díaz">Díaz</option>
          <option value="García">García</option>
          <option value="Gómez">Gómez</option>
          <option value="Maneiro">Maneiro</option>
          <option value="Marcano">Marcano</option>
          <option value="Mariño">Mariño</option>
          <option value="Península de Macanao">Península de Macanao</option>
          <option value="Tubores">Tubores</option>
          <option value="Villalba">Villalba</option>
        </select>
      </div>
    </div>

    {/* EMAIL INSTITUCIONAL */}
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-[#6b7280] ml-1">Email Institucional</label>
      <div className="relative flex">
        {/* Input oculto para asegurar que el FormData capture el email completo */}
        <input type="hidden" name="email" value={form.email} />
        
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af] z-10" />
          <input
            type="text"
            value={form.email.replace("@unimar.edu.ve", "")}
            onChange={(e) => updateField("email", e.target.value.split("@")[0] + "@unimar.edu.ve")}
            placeholder="ej: juan.perez"
            className="w-full rounded-l-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#d4a843]"
            required
          />
        </div>
        <div className="bg-[#f8fafc] border border-l-0 border-[#e2e8f0] rounded-r-lg px-4 flex items-center">
          <span className="text-xs font-bold text-[#1e3a5f]">@unimar.edu.ve</span>
        </div>
      </div>
    </div>
  </div>
)