"use client"

import React, { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Building2, TrendingUp, TrendingDown, Users } from "lucide-react"
import { GroupContainer, Field, SelectField, CheckItem, RadioItem } from "./EncuestaUI"
import { calcularEdad, OPCIONES_MUNICIPIOS, OPCIONES_CARRERAS, OPCIONES_ESTADO_CIVIL } from "./SeccionesEncuestaData"

export function SeccionIdentificacion({ disabled, user }: any) {
  const esDatoMaestro = !!user?.cedula; 
  const sexoDefault = user?.socio_sexo || (user?.sexo === 'M' || user?.sexo === 'Masculino' ? 'Masculino' : user?.sexo === 'F' || user?.sexo === 'Femenino' ? 'Femenino' : "");
  const municipioDefault = user?.socio_municipio || user?.municipio_residencia || "";
  
  const [fechaNac, setFechaNac] = useState(user?.socio_fecha_nac || user?.fecha_nacimiento || "");
  const [edad, setEdad] = useState("");
  const [tieneEmpleo, setTieneEmpleo] = useState(!!user?.socio_trabajo_empresa);

  useEffect(() => { setEdad(calcularEdad(fechaNac)); }, [fechaNac]);

  return (
    <div className="space-y-12">
      <GroupContainer titulo="Datos Personales" subtitulo="Información básica de identidad y contacto">
          <Field label="Nombres" name="socio_nombres" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_nombres || user?.nombre} required />
          <Field label="Apellidos" name="socio_apellidos" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_apellidos || user?.apellido} required />
          <Field label="Cédula" name="socio_cedula" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_cedula || user?.cedula} required />
          
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Fecha de Nacimiento</Label>
            <Input name="socio_fecha_nac" type="date" disabled={disabled} readOnly={esDatoMaestro} defaultValue={fechaNac} onChange={(e) => setFechaNac(e.target.value)} required={!esDatoMaestro} className="text-xs h-12 px-4 rounded-xl font-bold bg-white border-slate-50 shadow-sm" />
          </div>

          <Field label="Lugar de Nacimiento" name="socio_lugar_nac" disabled={disabled} defaultValue={user?.socio_lugar_nac} required />
          
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Edad Calculada</Label>
            <Input name="socio_edad" type="number" readOnly value={edad} className="text-xs h-12 px-4 rounded-xl font-bold bg-slate-50 border-transparent text-slate-400 cursor-not-allowed" />
          </div>

          <SelectField label="Nacionalidad" name="socio_nacionalidad" disabled={disabled} defaultValue={user?.socio_nacionalidad || "Venezolano/a"} options={[{ label: "Venezolano/a", value: "Venezolano/a" }, { label: "Extranjero/a", value: "Extranjero/a" }]} />
          <SelectField label="Estado Civil" name="socio_estado_civil" disabled={disabled} defaultValue={user?.socio_estado_civil} options={OPCIONES_ESTADO_CIVIL} />
          {esDatoMaestro ? <Field label="Sexo" name="socio_sexo" disabled={disabled} readOnly={true} defaultValue={sexoDefault} /> : <SelectField label="Sexo" name="socio_sexo" disabled={disabled} defaultValue={sexoDefault} options={[{ label: "Femenino", value: "Femenino" }, { label: "Masculino", value: "Masculino" }]} />}
          
          <Field label="Dirección Completa" name="direccion_completa" className="lg:col-span-2" disabled={disabled} defaultValue={user?.direccion_completa || user?.socio_direccion || user?.direccion} required />
          {esDatoMaestro ? <Field label="Municipio" name="socio_municipio" disabled={disabled} readOnly={true} defaultValue={municipioDefault} /> : <SelectField label="Municipio" name="socio_municipio" disabled={disabled} defaultValue={municipioDefault} options={OPCIONES_MUNICIPIOS} />}
          
          <Field label="Teléfono Habitación" name="socio_telf_hab" disabled={disabled} defaultValue={user?.socio_telf_hab} />
          <Field label="Celular" name="socio_celular" disabled={disabled} defaultValue={user?.socio_celular || user?.telefono} required />
          <Field label="Correo Institucional" name="socio_Institucional" type="email" disabled={disabled} defaultValue={user?.socio_Institucional || user?.email} required />
      </GroupContainer>

      <GroupContainer titulo="Situación Laboral" subtitulo="Indique si posee actividad remunerada actualmente">
          <div className="lg:col-span-3">
             <RadioGroup defaultValue={tieneEmpleo ? "Si" : "No"} onValueChange={(v) => setTieneEmpleo(v === "Si")} className="flex gap-4" disabled={disabled}>
                <RadioItem value="Si" id="trabaja_si" label="Sí, poseo empleo" />
                <RadioItem value="No" id="trabaja_no" label="No trabajo" />
             </RadioGroup>
             <input type="hidden" name="posee_empleo_aspirante" value={tieneEmpleo ? "Si" : "No"} />
          </div>

          {tieneEmpleo && (
            <>
              <Field label="Nombre de la Empresa" name="socio_trabajo_empresa" disabled={disabled} defaultValue={user?.socio_trabajo_empresa} required={tieneEmpleo} />
              <Field label="Cargo que desempeña" name="socio_trabajo_cargo" disabled={disabled} defaultValue={user?.socio_trabajo_cargo} required={tieneEmpleo} />
              <Field label="Sueldo Mensual ($)" name="monto_ingreso_sueldo" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_sueldo} required={tieneEmpleo} />
            </>
          )}
      </GroupContainer>
    </div>
  )
}

export function SeccionAcademica({ disabled, user }: any) {
  const esDatoMaestro = !!user?.cedula;
  const carreraDefault = user?.socio_carrera || user?.carrera;

  return (
    <GroupContainer titulo="Información Universitaria" subtitulo="Detalles del curso y procedencia académica">
        <Field label="U.E. de Procedencia" name="socio_ue_procedencia" disabled={disabled} defaultValue={user?.socio_ue_procedencia} required />
        <Field label="Otros Estudios" name="socio_otros_estudios" disabled={disabled} defaultValue={user?.socio_otros_estudios} />
        <Field label="Fecha Ingreso UNIMAR" name="socio_fecha_unimar" type="date" disabled={disabled} defaultValue={user?.socio_fecha_unimar} required />
        {esDatoMaestro ? <Field label="Carrera actual" name="socio_carrera" disabled={disabled} readOnly={true} defaultValue={carreraDefault} /> : <SelectField label="Carrera actual" name="socio_carrera" disabled={disabled} defaultValue={carreraDefault} options={OPCIONES_CARRERAS} />}
        {esDatoMaestro ? <Field label="Trimestre" name="socio_trimestre" disabled={disabled} readOnly={true} defaultValue={user?.socio_trimestre || user?.semestre?.toString()} /> : <SelectField label="Trimestre" name="socio_trimestre" disabled={disabled} defaultValue={user?.socio_trimestre || user?.semestre?.toString()} options={[...Array(12)].map((_, i) => ({ label: `Trimestre ${i + 1}`, value: (i + 1).toString() }))} />}
        
        <div className="lg:col-span-3 p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 mt-2">
           <Label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest">Modalidad de Estudio Elegida</Label>
           <RadioGroup defaultValue={user?.socio_modalidad || "P"} className="flex gap-10" disabled={disabled} name="socio_modalidad">
              <RadioItem value="P" id="mp" label="Presencial" />
              <RadioItem value="S" id="ms" label="Semipresencial" />
              <RadioItem value="V" id="mv" label="Virtual" />
           </RadioGroup>
        </div>
    </GroupContainer>
  )
}

export function SeccionFamiliar({ disabled, user }: any) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <Users className="h-5 w-5 text-[#d4a843]" />
            <span className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">Ficha del Padre</span>
          </div>
          <Field label="Nombres y Apellidos" name="padre_nombre" disabled={disabled} defaultValue={user?.padre_nombre} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Edad" name="padre_edad" type="number" disabled={disabled} defaultValue={user?.padre_edad} required />
            <Field label="Ocupación" name="padre_ocupacion" disabled={disabled} defaultValue={user?.padre_ocupacion} required />
          </div>
          <Field label="Lugar de Trabajo" name="padre_trabajo" disabled={disabled} defaultValue={user?.padre_trabajo} />
        </div>

        <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <Users className="h-5 w-5 text-[#d4a843]" />
            <span className="text-xs font-black text-[#1e3a5f] uppercase tracking-widest">Ficha de la Madre</span>
          </div>
          <Field label="Nombres y Apellidos" name="madre_nombre" disabled={disabled} defaultValue={user?.madre_nombre} required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Edad" name="madre_edad" type="number" disabled={disabled} defaultValue={user?.madre_edad} required />
            <Field label="Ocupación" name="madre_ocupacion" disabled={disabled} defaultValue={user?.madre_ocupacion} required />
          </div>
          <Field label="Lugar de Trabajo" name="madre_trabajo" disabled={disabled} defaultValue={user?.madre_trabajo} />
        </div>
      </div>

      <GroupContainer titulo="Carga Familiar" subtitulo="Composición de hermanos y estudios">
          <Field label="N° total de hermanos" name="familia_num_hermanos" type="number" disabled={disabled} defaultValue={user?.familia_num_hermanos} required />
          <Field label="Hermanos en universidad" name="familia_hermanos_uni" type="number" disabled={disabled} defaultValue={user?.familia_hermanos_uni} required />
      </GroupContainer>
    </div>
  )
}

export function SeccionEconomica({ disabled, user }: any) {
  return (
    <div className="space-y-10">
      <GroupContainer titulo="Rango de Ingresos" subtitulo="Escala salarial del núcleo familiar mensual">
        <div className="lg:col-span-3">
          <RadioGroup defaultValue={user?.rango_ingreso_familiar || "1"} className="grid grid-cols-1 md:grid-cols-3 gap-4" disabled={disabled} name="rango_ingreso_familiar">
            <RadioItem value="1" id="ri1" label="1 Salario Mínimo" />
            <RadioItem value="2" id="ri2" label="Entre 1 y 2 Salarios" />
            <RadioItem value="3" id="ri3" label="Más de 2 Salarios" />
          </RadioGroup>
        </div>
      </GroupContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
        <div className="p-8 bg-emerald-50/30 rounded-[3rem] border-2 border-emerald-100/50 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-emerald-100 pb-4">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Detalle de Ingresos ($)</span>
          </div>
          <Field label="Sueldos y Salarios" name="monto_ingreso_familiar" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_familiar} required />
          <Field label="Ingresos Extras" name="monto_ingreso_extra" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_extra} />
          <Field label="Pensión / Jubilación" name="monto_ingreso_pension" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_pension} />
          <Field label="Ayudas Externas" name="monto_ingreso_ayuda" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_ayuda} />
        </div>

        <div className="p-8 bg-rose-50/30 rounded-[3rem] border-2 border-rose-100/50 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
            <TrendingDown className="h-5 w-5 text-rose-600" />
            <span className="text-xs font-black text-rose-800 uppercase tracking-widest">Detalle de Gastos ($)</span>
          </div>
          <Field label="Canasta Alimentaria" name="monto_egreso_mercado" type="number" disabled={disabled} defaultValue={user?.monto_egreso_mercado} required />
          <Field label="Alquiler / Vivienda" name="monto_egreso_vivienda" type="number" disabled={disabled} defaultValue={user?.monto_egreso_vivienda} required />
          <Field label="Salud y Medicinas" name="monto_egreso_salud" type="number" disabled={disabled} defaultValue={user?.monto_egreso_salud} required />
          <Field label="Servicios del Hogar" name="monto_egreso_servicios" type="number" disabled={disabled} defaultValue={user?.monto_egreso_servicios} required />
        </div>
      </div>
    </div>
  )
}

export function SeccionVivienda({ disabled, user }: any) {
  return (
    <GroupContainer titulo="Características del Hogar" subtitulo="Estructura, tenencia y equipamiento de servicios">
        <SelectField label="Tipo de Estructura" name="vivienda_tipo" disabled={disabled} defaultValue={user?.vivienda_tipo} options={["Quinta", "Casa", "Apartamento", "Vivienda rural", "Otro"].map(v => ({label: v, value: v}))} />
        <SelectField label="Tenencia de la Vivienda" name="vivienda_estatus" disabled={disabled} defaultValue={user?.vivienda_estatus} options={["Propia", "Alquilada", "Residencia", "Otro"].map(v => ({label: v, value: v}))} />
        
        <div className="lg:col-span-3 pt-6">
            <Label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest italic">Servicios y Equipamiento Disponibles</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <CheckItem label="Agua" name="serv_agua" disabled={disabled} defaultChecked={user?.serv_agua === "on"} />
                <CheckItem label="Luz" name="serv_luz" disabled={disabled} defaultChecked={user?.serv_luz === "on"} />
                <CheckItem label="Gas" name="serv_gas" disabled={disabled} defaultChecked={user?.serv_gas === "on"} />
                <CheckItem label="Aseo" name="serv_aseo" disabled={disabled} defaultChecked={user?.serv_aseo === "on"} />
                <CheckItem label="Internet" name="serv_internet" disabled={disabled} defaultChecked={user?.serv_internet === "on"} />
                <CheckItem label="Lavadora" name="equip_lavadora" disabled={disabled} defaultChecked={user?.equip_lavadora === "on"} />
                <CheckItem label="Nevera" name="equip_nevera" disabled={disabled} defaultChecked={user?.equip_nevera === "on"} />
                <CheckItem label="TV por Cable" name="equip_cable" disabled={disabled} defaultChecked={user?.equip_cable === "on"} />
            </div>
        </div>
    </GroupContainer>
  )
}

export function SeccionSalud({ disabled, user }: any) {
  const [estaEnfermo, setEstaEnfermo] = useState(!!user?.salud_enfermedad_desc || !!user?.salud_tratamiento);
  
  return (
    <div className="space-y-10">
      <GroupContainer titulo="Salud y Convivencia" subtitulo="Estado físico y entorno de armonía familiar">
          <div className="lg:col-span-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest italic">
                  ¿Padece alguna enfermedad o condición médica actualmente?
              </Label>
              <RadioGroup 
                  defaultValue={estaEnfermo ? "Si" : "No"} 
                  onValueChange={(v) => setEstaEnfermo(v === "Si")} 
                  className="flex gap-4" 
                  disabled={disabled}
              >
                  <RadioItem value="Si" id="salud_si" label="Sí, poseo una condición" />
                  <RadioItem value="No" id="salud_no" label="Gozo de buena salud" />
              </RadioGroup>
              <input type="hidden" name="salud_condicion_especial" value={estaEnfermo ? "Si" : "No"} />
          </div>

          {estaEnfermo && (
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-400">
                  <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-amber-600 ml-1">Descripción de la condición</Label>
                      <Textarea 
                          name="salud_enfermedad_desc" 
                          className="text-xs bg-white min-h-[100px] border-slate-200 resize-none rounded-xl p-4 font-bold text-[#1e3a5f] focus-visible:ring-[#1e3a5f] shadow-sm" 
                          placeholder="Especifique su diagnóstico..." 
                          disabled={disabled} 
                          defaultValue={user?.salud_enfermedad_desc} 
                          required={estaEnfermo} 
                      />
                  </div>
                  <div className="space-y-2.5">
                      <Label className="text-[10px] font-black uppercase text-amber-600 ml-1">Tratamiento e insumos</Label>
                      <Input 
                          name="salud_tratamiento" 
                          className="text-xs bg-white border-slate-200 h-12 rounded-xl px-4 font-bold text-[#1e3a5f] focus-visible:ring-[#1e3a5f] shadow-sm" 
                          placeholder="Medicamentos o cuidados permanentes" 
                          disabled={disabled} 
                          defaultValue={user?.salud_tratamiento} 
                          required={estaEnfermo} 
                      />
                  </div>
              </div>
          )}

          <div className="lg:col-span-3 pt-6 border-t border-slate-50">
              <Label className="text-[10px] font-black uppercase text-slate-400 block mb-4 tracking-widest">
                  Clima de Convivencia Familiar
              </Label>
              <RadioGroup defaultValue={user?.familia_relacion || "Buena"} className="flex flex-wrap gap-8" disabled={disabled} name="familia_relacion">
                  <RadioItem value="Buena" id="rb" label="Buena" />
                  <RadioItem value="Regular" id="rr" label="Regular" />
                  <RadioItem value="Mala" id="rm" label="Mala" />
              </RadioGroup>
          </div>
      </GroupContainer>
    </div>
  )
}