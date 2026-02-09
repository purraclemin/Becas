"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  User, BookOpen, Users, Wallet, Home, 
  HeartPulse, Info, Building2, Landmark 
} from "lucide-react"

export function SolicitudEncuesta({ disabled }: { disabled: boolean }) {
  return (
    <div className="space-y-10 pt-8 border-t border-gray-100">
      
      {/* SECCIÓN DE INSTRUCCIONES */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 italic">
        <Info className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-[10px] text-amber-900 leading-tight">
          Esta encuesta es para uso exclusivo de la Unidad de Becas de la UNIMAR[cite: 10]. 
          <b> Cualquier falsificación anula la gestión[cite: 11].</b>
        </p>
      </div>

      {/* 1. ÁREA DE IDENTIFICACIÓN */}
      <section className="space-y-6">
        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 border-b pb-2">
          <User className="h-4 w-4 text-[#d4a843]" /> 1. Identificación del Solicitante [cite: 12]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Apellidos" name="socio_apellidos" required disabled={disabled} />
          <Field label="Nombres" name="socio_nombres" required disabled={disabled} />
          <Field label="Cédula" name="socio_cedula" required disabled={disabled} />
          <Field label="Fecha Nac." name="socio_fecha_nac" type="date" required disabled={disabled} />
          <Field label="Lugar Nac." name="socio_lugar_nac" required disabled={disabled} />
          <Field label="Estado Civil" name="socio_estado_civil" required disabled={disabled} />
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
          <Label className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-2">
            <Building2 className="h-3 w-3" /> En caso de Trabajar [cite: 26]
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre Empresa" name="socio_empresa" disabled={disabled} />
            <Field label="Sueldo Mensual" name="socio_sueldo" type="number" disabled={disabled} />
            <Field label="Cargo" name="socio_cargo" disabled={disabled} />
            <Field label="Especificar (Comerciante/Informal)" name="socio_trabajo_tipo" disabled={disabled} />
          </div>
        </div>
      </section>

      {/* 2. ÁREA ACADÉMICA */}
      <section className="space-y-6">
        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 border-b pb-2">
          <BookOpen className="h-4 w-4 text-[#d4a843]" /> 2. Área Académica 
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="U.E. Procedencia" name="socio_ue_procedencia" disabled={disabled} />
          <Field label="Fecha Ingreso UNIMAR" name="socio_fecha_ingreso" type="date" disabled={disabled} />
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500">Modalidad [cite: 41]</Label>
            <RadioGroup defaultValue="P" className="flex gap-4" disabled={disabled} name="socio_modalidad">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="P" id="p" /> <Label htmlFor="p" className="text-xs">Presencial</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="S" id="s" /> <Label htmlFor="s" className="text-xs">Semipresencial</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="V" id="v" /> <Label htmlFor="v" className="text-xs">Virtual</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </section>

      {/* 4. ÁREA ECONÓMICA */}
      <section className="space-y-6">
        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 border-b pb-2">
          <Wallet className="h-4 w-4 text-[#d4a843]" /> 3. Área Económica [cite: 64]
        </h3>
        <div className="space-y-4">
          <Label className="text-[9px] font-black uppercase text-slate-500">Ingreso Mensual Familiar [cite: 65]</Label>
          <RadioGroup defaultValue="1" className="grid grid-cols-1 md:grid-cols-3 gap-2" disabled={disabled} name="socio_rango_ingreso">
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
              <RadioGroupItem value="1" id="r1" /> <Label htmlFor="r1" className="text-[10px]">1 Salario Mínimo [cite: 66]</Label>
            </div>
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
              <RadioGroupItem value="2" id="r2" /> <Label htmlFor="r2" className="text-[10px]">1 a 2 Salarios [cite: 67]</Label>
            </div>
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
              <RadioGroupItem value="3" id="r3" /> <Label htmlFor="r3" className="text-[10px]">Más de 2 Salarios [cite: 68]</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-emerald-600 uppercase">Ingresos Mensuales [cite: 70]</Label>
            <Field label="Sueldos y Salarios" name="ingreso_sueldos" type="number" disabled={disabled} />
            <Field label="Ayudas Familiares" name="ingreso_ayudas" type="number" disabled={disabled} />
            <Field label="Pensión / Jubilación" name="ingreso_pension" type="number" disabled={disabled} />
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black text-rose-600 uppercase">Egresos Mensuales [cite: 73]</Label>
            <Field label="Mercado (Alimentos)" name="egreso_mercado" type="number" disabled={disabled} />
            <Field label="Servicios Públicos" name="egreso_servicios" type="number" disabled={disabled} />
            <Field label="Gastos Suntuarios*" name="egreso_suntuarios" type="number" placeholder="Internet, TV, etc." disabled={disabled} />
          </div>
        </div>
      </section>

      {/* 5. ÁREA FÍSICO AMBIENTAL */}
      <section className="space-y-6">
        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 border-b pb-2">
          <Home className="h-4 w-4 text-[#d4a843]" /> 4. Área Vivienda [cite: 87]
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <CheckItem label="Agua" name="serv_agua" disabled={disabled} />
          <CheckItem label="Luz" name="serv_luz" disabled={disabled} />
          <CheckItem label="Gas" name="serv_gas" disabled={disabled} />
          <CheckItem label="Aseo" name="serv_aseo" disabled={disabled} />
          <CheckItem label="Internet" name="serv_internet" disabled={disabled} />
          <CheckItem label="Aire Acond." name="serv_aire" disabled={disabled} />
        </div>
      </section>

      {/* 7. SALUD */}
      <section className="space-y-6">
        <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest flex items-center gap-2 border-b pb-2">
          <HeartPulse className="h-4 w-4 text-[#d4a843]" /> 5. Área Salud [cite: 113]
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500">¿Padece alguna enfermedad? [cite: 117]</Label>
            <Textarea name="socio_enfermedad" className="text-xs bg-white" placeholder="Explique..." disabled={disabled} />
          </div>
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-gray-500">Tratamiento médico [cite: 118]</Label>
            <Input name="socio_tratamiento" className="text-xs bg-white" placeholder="Indique medicamentos..." disabled={disabled} />
          </div>
        </div>
      </section>

    </div>
  )
}

function Field({ label, name, type = "text", required = false, disabled = false, placeholder = "" }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[9px] font-black uppercase text-gray-500 ml-1">{label}</Label>
      <Input 
        name={name} 
        type={type} 
        required={required} 
        disabled={disabled} 
        placeholder={placeholder}
        className="text-xs bg-white border-slate-200 focus-visible:ring-[#1e3a5f]" 
      />
    </div>
  )
}

function CheckItem({ label, name, disabled }: any) {
  return (
    <div className="flex items-center space-x-2 bg-white p-3 rounded-xl border border-slate-100">
      <Checkbox id={name} name={name} disabled={disabled} />
      <Label htmlFor={name} className="text-[10px] font-medium text-slate-600">{label}</Label>
    </div>
  )
}