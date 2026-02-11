"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { User, BookOpen, Users2, Wallet, Home, HeartPulse, Building2 } from "lucide-react"
import { CustomSection, Field, SelectField, CheckItem, RadioItem } from "./EncuestaUI"

/**
 * SECCIÓN 3: IDENTIFICACIÓN DEL SOLICITANTE
 * Precarga datos maestros, bloquea campos existentes y calcula edad automáticamente.
 */
export function SeccionIdentificacion({ isOpen, onToggle, disabled, user }: any) {
  // esDatoMaestro: Bloquea edición si el dato ya existe en el registro principal
  const esDatoMaestro = !!user?.cedula; 
  
  // Normalización de Sexo para el Select (M/F -> Masculino/Femenino)
  const sexoDefault = user?.socio_sexo || (
    user?.sexo === 'M' ? 'Masculino' : 
    user?.sexo === 'F' ? 'Femenino' : 
    user?.sexo
  );

  // Mapeo de Municipio
  const municipioDefault = user?.socio_municipio || user?.municipio_residencia || "";
  
  // Estados para manejo dinámico de fecha y edad
  const [fechaNac, setFechaNac] = useState(user?.socio_fecha_nac || user?.fecha_nacimiento || "");
  const [edad, setEdad] = useState(user?.socio_edad || "");
  const [tieneEmpleo, setTieneEmpleo] = useState(!!user?.socio_trabajo_empresa);

  // 🟢 LÓGICA: Cálculo de edad automático basado en la fecha
  useEffect(() => {
    if (fechaNac) {
      const hoy = new Date();
      const cumpleanos = new Date(fechaNac);
      let edadCalculada = hoy.getFullYear() - cumpleanos.getFullYear();
      const mes = hoy.getMonth() - cumpleanos.getMonth();

      if (mes < 0 || (mes === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edadCalculada--;
      }
      
      const resultado = edadCalculada > 0 ? edadCalculada.toString() : "0";
      setEdad(resultado);
    }
  }, [fechaNac]);

  return (
    <CustomSection title="3. Identificación del Solicitante" icon={User} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Nombres" name="socio_nombres" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_nombres || user?.nombre} required />
          <Field label="Apellidos" name="socio_apellidos" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_apellidos || user?.apellido} required />
          <Field label="Cédula" name="socio_cedula" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_cedula || user?.cedula} required />
          
          {/* Campo de Fecha: Bloqueado visual y funcionalmente si es dato maestro */}
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-tight">Fecha de Nacimiento</Label>
            <Input 
              name="socio_fecha_nac" 
              type="date" 
              disabled={disabled} 
              readOnly={esDatoMaestro} 
              defaultValue={fechaNac}
              onChange={(e) => setFechaNac(e.target.value)}
              required={!esDatoMaestro}
              className={`text-[11px] h-9 font-bold transition-all ${
                esDatoMaestro 
                  ? "bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed select-none pointer-events-none shadow-none" 
                  : "bg-white border-slate-200 text-[#1e3a5f]"
              }`}
            />
          </div>

          <Field label="Lugar de Nacimiento" name="socio_lugar_nac" disabled={disabled} defaultValue={user?.socio_lugar_nac} required />
          
          {/* Edad: Solo lectura, se actualiza mediante el useEffect */}
          <div className="space-y-2">
            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 tracking-tight">Edad Calculada</Label>
            <Input 
              key={`edad-${edad}`} 
              name="socio_edad" 
              type="number" 
              readOnly 
              defaultValue={edad} 
              className="text-[11px] h-9 font-bold bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            />
          </div>

          <SelectField label="Nacionalidad" name="socio_nacionalidad" disabled={disabled} defaultValue={user?.socio_nacionalidad || "Venezolano/a"} options={[{ label: "Venezolano/a", value: "Venezolano/a" }, { label: "Extranjero/a", value: "Extranjero/a" }]} />
          
          <SelectField label="Estado Civil" name="socio_estado_civil" disabled={disabled} defaultValue={user?.socio_estado_civil} options={[{ label: "Soltero/a", value: "Soltero/a" }, { label: "Casado/a", value: "Casado/a" }, { label: "Divorciado/a", value: "Divorciado/a" }, { label: "Viudo/a", value: "Viudo/a" }, { label: "Concubinato", value: "Concubinato" }]} />
          
          <SelectField label="Sexo" name="socio_sexo" disabled={disabled || esDatoMaestro} defaultValue={sexoDefault} options={[{ label: "Femenino", value: "Femenino" }, { label: "Masculino", value: "Masculino" }]} />

          <Field label="Dirección Completa" name="socio_direccion" className="md:col-span-2" disabled={disabled} defaultValue={user?.socio_direccion || user?.direccion} required />
          
          <SelectField label="Municipio" name="socio_municipio" disabled={disabled || esDatoMaestro} defaultValue={municipioDefault} options={[{ label: "Antolín del Campo", value: "Antolín del Campo" }, { label: "Arismendi", value: "Arismendi" }, { label: "Díaz", value: "Díaz" }, { label: "García", value: "García" }, { label: "Gómez", value: "Gómez" }, { label: "Maneiro", value: "Maneiro" }, { label: "Marcano", value: "Marcano" }, { label: "Mariño", value: "Mariño" }, { label: "Península de Macanao", value: "Península de Macanao" }, { label: "Tubores", value: "Tubores" }, { label: "Villalba", value: "Villalba" }]} />

          <Field label="Teléfono Hab." name="socio_telf_hab" disabled={disabled} defaultValue={user?.socio_telf_hab} />
          <Field label="Celular" name="socio_celular" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_celular || user?.telefono} required />
          <Field label="Correo Institucional" name="socio_Institucional" type="email" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_Institucional || user?.email_institucional || user?.email} required />
        </div>

        <div className="pt-4 border-t border-slate-100">
          <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 italic">¿Realiza actualmente alguna actividad laboral?</Label>
          <RadioGroup 
            defaultValue={tieneEmpleo ? "Si" : "No"} 
            onValueChange={(v) => setTieneEmpleo(v === "Si")}
            className="flex gap-4 mt-2" 
            disabled={disabled}
          >
            <RadioItem value="Si" id="trabaja_si" label="Sí, trabajo" />
            <RadioItem value="No" id="trabaja_no" label="No poseo empleo" />
          </RadioGroup>
          <input type="hidden" name="posee_empleo_aspirante" value={tieneEmpleo ? "Si" : "No"} />
        </div>

        {tieneEmpleo && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <Label className="text-[10px] font-black uppercase text-[#1e3a5f] flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-[#d4a843]" /> Información Laboral
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Nombre de la Empresa" name="socio_trabajo_empresa" disabled={disabled} defaultValue={user?.socio_trabajo_empresa} required={tieneEmpleo} />
              <Field label="Cargo" name="socio_trabajo_cargo" disabled={disabled} defaultValue={user?.socio_trabajo_cargo} required={tieneEmpleo} />
              <Field label="Sueldo Mensual" name="socio_trabajo_sueldo" type="number" disabled={disabled} defaultValue={user?.socio_trabajo_sueldo} required={tieneEmpleo} />
            </div>
          </div>
        )}
    </CustomSection>
  )
}

/**
 * SECCIÓN 4: INFORMACIÓN ACADÉMICA
 */
export function SeccionAcademica({ isOpen, onToggle, disabled, user }: any) {
  const esDatoMaestro = !!user?.cedula;
  return (
    <CustomSection title="4. Información Académica" icon={BookOpen} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="U.E. de Procedencia" name="socio_ue_procedencia" disabled={disabled} defaultValue={user?.socio_ue_procedencia} required />
          <Field label="Otros Estudios Realizados" name="socio_otros_estudios" disabled={disabled} defaultValue={user?.socio_otros_estudios} />
          <Field label="Fecha Ingreso UNIMAR" name="socio_fecha_unimar" type="date" disabled={disabled} defaultValue={user?.socio_fecha_unimar} required />
          
          <SelectField label="Carrera que Cursa" name="socio_carrera" disabled={disabled || esDatoMaestro} defaultValue={user?.socio_carrera || user?.carrera} options={[{ label: "Ingeniería de Sistemas", value: "Ingenieria de Sistemas" }, { label: "Ingeniería Industrial", value: "Ingenieria Industrial" }, { label: "Administración", value: "Administracion" }, { label: "Contaduría Pública", value: "Contaduria Publica" }, { label: "Derecho", value: "Derecho" }, { label: "Psicología", value: "Psicologia" }, { label: "Educación Integral", value: "Educacion Integral" }, { label: "Diseño Gráfico", value: "Diseño Grafico" }, { label: "Idiomas Modernos", value: "Idiomas Modernos" }, { label: "Comunicación Social", value: "Comunicacion Social" }, { label: "Turismo", value: "Turismo" }]} />

          <SelectField label="Trimestre Actual" name="socio_trimestre" disabled={disabled || esDatoMaestro} defaultValue={user?.socio_trimestre || user?.semestre?.toString()} options={[...Array(12)].map((_, i) => ({ label: `Trimestre ${i + 1}`, value: (i + 1).toString() }))} />

          <div className="space-y-3 md:col-span-2 pt-2">
            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Modalidad de Estudio Elegida</Label>
            <RadioGroup defaultValue={user?.socio_modalidad || "P"} className="flex gap-6 items-center" disabled={disabled} name="socio_modalidad">
              <div className="flex items-center space-x-2"><RadioGroupItem value="P" id="mp" /><Label htmlFor="mp" className="text-xs font-bold">Presencial</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="S" id="ms" /><Label htmlFor="ms" className="text-xs font-bold">Semipresencial</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="V" id="mv" /><Label htmlFor="mv" className="text-xs font-bold">Virtual</Label></div>
            </RadioGroup>
          </div>
        </div>
    </CustomSection>
  )
}

/**
 * SECCIÓN 5: ENTORNO FAMILIAR
 */
export function SeccionFamiliar({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="5. Entorno Familiar" icon={Users2} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
            <Label className="text-[10px] font-black text-[#d4a843] uppercase tracking-widest border-b pb-2 block border-slate-50">Ficha del Padre</Label>
            <Field label="Nombres y Apellidos" name="padre_nombre" disabled={disabled} defaultValue={user?.padre_nombre} required />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Edad" name="padre_edad" type="number" disabled={disabled} defaultValue={user?.padre_edad} required />
                <Field label="Ocupación" name="padre_ocupacion" disabled={disabled} defaultValue={user?.padre_ocupacion} required />
            </div>
            <Field label="Lugar de Trabajo" name="padre_trabajo" disabled={disabled} defaultValue={user?.padre_trabajo} />
          </div>
          <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-4">
            <Label className="text-[10px] font-black text-[#d4a843] uppercase tracking-widest border-b pb-2 block border-slate-50">Ficha de la Madre</Label>
            <Field label="Nombres y Apellidos" name="madre_nombre" disabled={disabled} defaultValue={user?.madre_nombre} required />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Edad" name="madre_edad" type="number" disabled={disabled} defaultValue={user?.madre_edad} required />
                <Field label="Ocupación" name="madre_ocupacion" disabled={disabled} defaultValue={user?.madre_ocupacion} required />
            </div>
            <Field label="Lugar de Trabajo" name="madre_trabajo" disabled={disabled} defaultValue={user?.madre_trabajo} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
          <Field label="N° de Hermanos" name="familia_num_hermanos" type="number" disabled={disabled} defaultValue={user?.familia_num_hermanos} required />
          <Field label="Hermanos en Universidad" name="familia_hermanos_uni" type="number" disabled={disabled} defaultValue={user?.familia_hermanos_uni} required />
        </div>
    </CustomSection>
  )
}

/**
 * SECCIÓN 6: SITUACIÓN ECONÓMICA
 */
export function SeccionEconomica({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="6. Situación Económica" icon={Wallet} isOpen={isOpen} onToggle={onToggle}>
        <div className="space-y-6">
          <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 italic">Rango de Ingreso Familiar Mensual</Label>
          <RadioGroup defaultValue={user?.rango_ingreso_familiar || "1"} className="grid grid-cols-1 md:grid-cols-3 gap-4" disabled={disabled} name="rango_ingreso_familiar">
            <RadioItem value="1" id="ri1" label="1 Salario Mínimo" />
            <RadioItem value="2" id="ri2" label="Entre 1 y 2 Salarios" />
            <RadioItem value="3" id="ri3" label="Más de 2 Salarios" />
          </RadioGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4 p-6 bg-emerald-50/40 rounded-[2rem] border border-emerald-100">
            <Label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-1">Detalle de Ingresos</Label>
            <Field label="Sueldos y Salarios" name="monto_ingreso_sueldo" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_sueldo} required />
            <Field label="Ingresos Extras" name="monto_ingreso_extra" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_extra} />
            <Field label="Pensión / Jubilación" name="monto_ingreso_pension" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_pension} />
            <Field label="Ayudas Externas" name="monto_ingreso_ayuda" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_ayuda} />
          </div>
          <div className="space-y-4 p-6 bg-rose-50/40 rounded-[2rem] border border-rose-100">
            <Label className="text-[10px] font-black text-rose-700 uppercase tracking-widest ml-1">Detalle de Gastos</Label>
            <Field label="Canasta Alimentaria" name="monto_egreso_mercado" type="number" disabled={disabled} defaultValue={user?.monto_egreso_mercado} required />
            <Field label="Alquiler / Hipoteca" name="monto_egreso_vivienda" type="number" disabled={disabled} defaultValue={user?.monto_egreso_vivienda} required />
            <Field label="Salud y Medicinas" name="monto_egreso_salud" type="number" disabled={disabled} defaultValue={user?.monto_egreso_salud} required />
            <Field label="Servicios del Hogar" name="monto_egreso_servicios" type="number" disabled={disabled} defaultValue={user?.monto_egreso_servicios} required />
          </div>
        </div>
    </CustomSection>
  )
}

/**
 * SECCIÓN 7: CONDICIONES DE VIVIENDA
 */
export function SeccionVivienda({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="7. Condiciones de Vivienda" icon={Home} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField label="Tipo de Estructura" name="vivienda_tipo" disabled={disabled} defaultValue={user?.vivienda_tipo} options={[{ label: "Quinta", value: "Quinta" }, { label: "Casa", value: "Casa" }, { label: "Apartamento", value: "Apartamento" }, { label: "Vivienda rural", value: "Vivienda rural" }, { label: "Otro", value: "Otro" }]} />
            <SelectField label="Tenencia de la Vivienda" name="vivienda_estatus" disabled={disabled} defaultValue={user?.vivienda_estatus} options={[{ label: "Propia", value: "Propia" }, { label: "Alquilada", value: "Alquilada" }, { label: "Residencia", value: "Residencia" }, { label: "Otro", value: "Otro" }]} />
        </div>
        <div className="space-y-4 pt-4">
            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 italic">Servicios y Equipamiento</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
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
    </CustomSection>
  )
}

/**
 * SECCIÓN 8: SALUD Y ENTORNO FAMILIAR
 */
export function SeccionSalud({ isOpen, onToggle, disabled, user }: any) {
  const [estaEnfermo, setEstaEnfermo] = useState(!!user?.salud_enfermedad_desc || !!user?.salud_tratamiento);
  return (
    <CustomSection title="8. Salud y Entorno Familiar" icon={HeartPulse} isOpen={isOpen} onToggle={onToggle}>
        <div className="space-y-6">
            <div className="pb-2">
              <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 italic">¿Padece alguna enfermedad o condición médica actualmente?</Label>
              <RadioGroup defaultValue={estaEnfermo ? "Si" : "No"} onValueChange={(v) => setEstaEnfermo(v === "Si")} className="flex gap-4 mt-2" disabled={disabled}>
                <RadioItem value="Si" id="salud_si" label="Sí, poseo una condición" />
                <RadioItem value="No" id="salud_no" label="Gozo de buena salud" />
              </RadioGroup>
              <input type="hidden" name="posee_enfermedad_aspirante" value={estaEnfermo ? "Si" : "No"} />
            </div>
            {estaEnfermo && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400 bg-amber-50/30 p-6 rounded-3xl border border-amber-100">
                <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-amber-700 ml-1">Descripción de la condición</Label>
                    <Textarea name="salud_enfermedad_desc" className="text-xs bg-white min-h-[80px] border-amber-200 resize-none rounded-xl" placeholder="Especifique su diagnóstico..." disabled={disabled} defaultValue={user?.salud_enfermedad_desc} required={estaEnfermo} />
                </div>
                <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-amber-700 ml-1">Tratamiento e insumos</Label>
                    <Input name="salud_tratamiento" className="text-xs bg-white border-amber-200 h-11 rounded-xl" placeholder="Medicamentos o cuidados permanentes" disabled={disabled} defaultValue={user?.salud_tratamiento} required={estaEnfermo} />
                </div>
              </div>
            )}
            <div className="pt-6 border-t border-slate-100 space-y-4">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1 italic">Clima de Convivencia Familiar</Label>
                <RadioGroup defaultValue={user?.socio_relacion_fam || "Buena"} className="flex flex-wrap gap-8" disabled={disabled} name="socio_relacion_fam">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Buena" id="rb" /><Label htmlFor="rb" className="text-xs font-bold cursor-pointer">Buena</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Regular" id="rr" /><Label htmlFor="rr" className="text-xs font-bold cursor-pointer">Regular</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Mala" id="rm" /><Label htmlFor="rm" className="text-xs font-bold cursor-pointer">Mala</Label></div>
                </RadioGroup>
            </div>
        </div>
    </CustomSection>
  )
}