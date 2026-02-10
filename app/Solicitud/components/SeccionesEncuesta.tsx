"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { User, BookOpen, Users2, Wallet, Home, HeartPulse, Building2 } from "lucide-react"
import { CustomSection, Field, SelectField, CheckItem, RadioItem } from "./EncuestaUI"

// SECCIÓN 3: IDENTIFICACIÓN DEL SOLICITANTE
export function SeccionIdentificacion({ isOpen, onToggle, disabled, user }: any) {
  const esDatoMaestro = !!user?.tieneDatosRegistro;

  return (
    <CustomSection title="3. Identificación del Solicitante" icon={User} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Nombres" name="socio_nombres" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_nombres || user?.nombre} />
          <Field label="Apellidos" name="socio_apellidos" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_apellidos || user?.apellido} />
          <Field label="Cédula" name="socio_cedula" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_cedula || user?.cedula} />
          
          <Field label="Fecha de Nacimiento" name="socio_fecha_nac" type="date" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_fecha_nac || user?.fecha_nac} />
          <Field label="Lugar de Nacimiento" name="socio_lugar_nac" disabled={disabled} defaultValue={user?.socio_lugar_nac} />
          <Field label="Edad" name="socio_edad" type="number" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_edad || user?.edad} />

          <SelectField label="Nacionalidad" name="socio_nacionalidad" disabled={disabled} defaultValue={user?.socio_nacionalidad} options={[
            { label: "Venezolano/a", value: "Venezolano/a" }, { label: "Extranjero/a", value: "Extranjero/a" }
          ]} />
          <SelectField label="Estado Civil" name="socio_estado_civil" disabled={disabled} defaultValue={user?.socio_estado_civil} options={[
            { label: "Soltero/a", value: "Soltero/a" }, { label: "Casado/a", value: "Casado/a" },
            { label: "Divorciado/a", value: "Divorciado/a" }, { label: "Viudo/a", value: "Viudo/a" }, { label: "Concubinato", value: "Concubinato" }
          ]} />
          
          <SelectField label="Sexo" name="socio_sexo" disabled={disabled || esDatoMaestro} defaultValue={user?.socio_sexo || user?.sexo} options={[
            { label: "Femenino", value: "Femenino" }, { label: "Masculino", value: "Masculino" }
          ]} />

          <Field label="Dirección Completa" name="socio_direccion" className="md:col-span-2" disabled={disabled} defaultValue={user?.socio_direccion} />
          
          <SelectField label="Municipio" name="socio_municipio" disabled={disabled || esDatoMaestro} defaultValue={user?.socio_municipio || user?.municipio} options={[
            { label: "Antolín del Campo", value: "Antolín del Campo" }, { label: "Arismendi", value: "Arismendi" },
            { label: "Díaz", value: "Díaz" }, { label: "García", value: "García" }, { label: "Gómez", value: "Gómez" },
            { label: "Maneiro", value: "Maneiro" }, { label: "Marcano", value: "Marcano" }, { label: "Mariño", value: "Mariño" },
            { label: "Península de Macanao", value: "Península de Macanao" }, { label: "Tubores", value: "Tubores" }, { label: "Villalba", value: "Villalba" }
          ]} />

          <Field label="Teléfono Hab." name="socio_telf_hab" disabled={disabled} defaultValue={user?.socio_telf_hab} />
          <Field label="Celular" name="socio_celular" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_celular || user?.telefono} />
          <Field label="Correo Institucional" name="socio_Institucional" type="email" disabled={disabled} readOnly={esDatoMaestro} defaultValue={user?.socio_Institucional || user?.email_institucional} />
        </div>

        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-5">
          <Label className="text-[10px] font-black uppercase text-[#1e3a5f] flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-[#d4a843]" /> Datos Laborales (Si trabaja)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nombre de la Empresa" name="socio_trabajo_empresa" disabled={disabled} defaultValue={user?.socio_trabajo_empresa} />
            <Field label="Dirección Empresa" name="socio_trabajo_dir" disabled={disabled} defaultValue={user?.socio_trabajo_dir} />
            <Field label="Cargo" name="socio_trabajo_cargo" disabled={disabled} defaultValue={user?.socio_trabajo_cargo} />
            <Field label="Sueldo Mensual" name="socio_trabajo_sueldo" type="number" disabled={disabled} defaultValue={user?.socio_trabajo_sueldo} />
          </div>
        </div>
    </CustomSection>
  )
}

// SECCIÓN 4: INFORMACIÓN ACADÉMICA
export function SeccionAcademica({ isOpen, onToggle, disabled, user }: any) {
  const esDatoMaestro = !!user?.tieneDatosRegistro;

  return (
    <CustomSection title="4. Información Académica" icon={BookOpen} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="U.E. de Procedencia" name="socio_ue_procedencia" disabled={disabled} defaultValue={user?.socio_ue_procedencia} />
          <Field label="Otros Estudios Realizados" name="socio_otros_estudios" disabled={disabled} defaultValue={user?.socio_otros_estudios} />
          <Field label="Fecha Ingreso UNIMAR" name="socio_fecha_unimar" type="date" disabled={disabled} defaultValue={user?.socio_fecha_unimar} />
          
          <SelectField label="Carrera que Cursa" name="socio_carrera" disabled={disabled || esDatoMaestro} defaultValue={user?.socio_carrera || user?.carrera} options={[
            { label: "Ingeniería de Sistemas", value: "Ingenieria de Sistemas" },
            { label: "Ingeniería Industrial", value: "Ingenieria Industrial" },
            { label: "Administración", value: "Administracion" },
            { label: "Contaduría Pública", value: "Contaduria Publica" },
            { label: "Derecho", value: "Derecho" },
            { label: "Psicología", value: "Psicologia" },
            { label: "Educación Integral", value: "Educacion Integral" },
            { label: "Diseño Gráfico", value: "Diseño Grafico" },
            { label: "Idiomas Modernos", value: "Idiomas Modernos" },
            { label: "Comunicación Social", value: "Comunicacion Social" },
            { label: "Turismo", value: "Turismo" }
          ]} />

          <SelectField label="Trimestre Actual" name="socio_trimestre" disabled={disabled || esDatoMaestro} defaultValue={user?.socio_trimestre || user?.trimestre?.toString()} options={
             [...Array(12)].map((_, i) => ({ label: `Trimestre ${i + 1}`, value: (i + 1).toString() }))
          } />

          <div className="space-y-3 md:col-span-2">
            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Modalidad de Estudio</Label>
            {/* 🟢 CORRECCIÓN: flex-wrap y gap responsivo para evitar que se pegue 'Virtual' */}
            <RadioGroup defaultValue={user?.socio_modalidad || "P"} className="flex flex-wrap gap-6 items-center" disabled={disabled} name="socio_modalidad">
              <div className="flex items-center space-x-2"><RadioGroupItem value="P" id="mp" /><Label htmlFor="mp" className="text-xs font-bold">Presencial</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="S" id="ms" /><Label htmlFor="ms" className="text-xs font-bold">Semipresencial</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="V" id="mv" /><Label htmlFor="mv" className="text-xs font-bold">Virtual</Label></div>
            </RadioGroup>
          </div>
        </div>
    </CustomSection>
  )
}
// SECCIÓN 5: ENTORNO FAMILIAR
export function SeccionFamiliar({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="5. Entorno Familiar" icon={Users2} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-5 bg-white border-2 border-slate-50 rounded-2xl shadow-sm space-y-4">
            <Label className="text-[10px] font-black text-[#d4a843] uppercase tracking-tighter">Datos del Padre</Label>
            <Field label="Nombres y Apellidos" name="padre_nombre" disabled={disabled} defaultValue={user?.padre_nombre} />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Edad" name="padre_edad" type="number" disabled={disabled} defaultValue={user?.padre_edad} />
                <Field label="Ocupación" name="padre_ocupacion" disabled={disabled} defaultValue={user?.padre_ocupacion} />
            </div>
            <Field label="Lugar de Trabajo" name="padre_trabajo" disabled={disabled} defaultValue={user?.padre_trabajo} />
          </div>
          <div className="p-5 bg-white border-2 border-slate-50 rounded-2xl shadow-sm space-y-4">
            <Label className="text-[10px] font-black text-[#d4a843] uppercase tracking-tighter">Datos de la Madre</Label>
            <Field label="Nombres y Apellidos" name="madre_nombre" disabled={disabled} defaultValue={user?.madre_nombre} />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Edad" name="madre_edad" type="number" disabled={disabled} defaultValue={user?.madre_edad} />
                <Field label="Ocupación" name="madre_ocupacion" disabled={disabled} defaultValue={user?.madre_ocupacion} />
            </div>
            <Field label="Lugar de Trabajo" name="madre_trabajo" disabled={disabled} defaultValue={user?.madre_trabajo} />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Número de Hermanos" name="familia_num_hermanos" type="number" disabled={disabled} defaultValue={user?.familia_num_hermanos} />
          <Field label="Hermanos Universitarios" name="familia_hermanos_uni" type="number" disabled={disabled} defaultValue={user?.familia_hermanos_uni} />
        </div>
    </CustomSection>
  )
}

// SECCIÓN 6: SITUACIÓN ECONÓMICA
export function SeccionEconomica({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="6. Situación Económica" icon={Wallet} isOpen={isOpen} onToggle={onToggle}>
        <div className="space-y-6">
          <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Rango de Ingreso Familiar</Label>
          <RadioGroup defaultValue={user?.rango_ingreso_familiar || "1"} className="grid grid-cols-1 md:grid-cols-3 gap-4" disabled={disabled} name="rango_ingreso_familiar">
            <RadioItem value="1" id="ri1" label="1 Salario Mínimo" />
            <RadioItem value="2" id="ri2" label="Entre 1 y 2 Salarios" />
            <RadioItem value="3" id="ri3" label="Más de 2 Salarios" />
          </RadioGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
            <Label className="text-[10px] font-black text-emerald-700 uppercase">Ingresos Mensuales</Label>
            <Field label="Sueldos y Salarios" name="monto_ingreso_sueldo" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_sueldo} />
            <Field label="Ingresos Particulares" name="monto_ingreso_extra" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_extra} />
            <Field label="Pensión o Jubilación" name="monto_ingreso_pension" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_pension} />
            <Field label="Ayudas Familiares" name="monto_ingreso_ayuda" type="number" disabled={disabled} defaultValue={user?.monto_ingreso_ayuda} />
          </div>
          <div className="space-y-4 p-5 bg-rose-50/50 rounded-2xl border border-rose-100">
            <Label className="text-[10px] font-black text-rose-700 uppercase">Egresos Mensuales</Label>
            <Field label="Alimentación" name="monto_egreso_mercado" type="number" disabled={disabled} defaultValue={user?.monto_egreso_mercado} />
            <Field label="Vivienda" name="monto_egreso_vivienda" type="number" disabled={disabled} defaultValue={user?.monto_egreso_vivienda} />
            <Field label="Salud" name="monto_egreso_salud" type="number" disabled={disabled} defaultValue={user?.monto_egreso_salud} />
            <Field label="Servicios Públicos" name="monto_egreso_servicios" type="number" disabled={disabled} defaultValue={user?.monto_egreso_servicios} />
          </div>
        </div>
    </CustomSection>
  )
}

// SECCIÓN 7: CONDICIONES DE VIVIENDA
export function SeccionVivienda({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="7. Condiciones de Vivienda" icon={Home} isOpen={isOpen} onToggle={onToggle}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField label="Tipo de Vivienda" name="vivienda_tipo" disabled={disabled} defaultValue={user?.vivienda_tipo} options={[
              { label: "Quinta", value: "Quinta" }, { label: "Casa", value: "Casa" },
              { label: "Apartamento", value: "Apartamento" }, { label: "Vivienda rural", value: "Vivienda rural" }, { label: "Otro", value: "Otro" }
            ]} />
            <SelectField label="La vivienda es:" name="vivienda_estatus" disabled={disabled} defaultValue={user?.vivienda_estatus} options={[
              { label: "Propia", value: "Propia" }, { label: "Alquilada", value: "Alquilada" },
              { label: "Residencia", value: "Residencia" }, { label: "Otro", value: "Otro" }
            ]} />
        </div>
        <div className="space-y-4">
            <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Servicios y Equipamiento Disponible</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

// SECCIÓN 8: SALUD Y ENTORNO FAMILIAR
export function SeccionSalud({ isOpen, onToggle, disabled, user }: any) {
  return (
    <CustomSection title="8. Salud y Entorno Familiar" icon={HeartPulse} isOpen={isOpen} onToggle={onToggle}>
        <div className="space-y-5">
            <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">¿Padece alguna enfermedad?</Label>
                <Textarea name="salud_enfermedad_desc" className="text-xs bg-white min-h-[80px] resize-none" placeholder="Especifique si padece alguna condición..." disabled={disabled} defaultValue={user?.salud_enfermedad_desc} />
            </div>
            <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">¿Recibe algún tratamiento médico?</Label>
                <Input name="salud_tratamiento" className="text-xs bg-white" placeholder="Indique medicamentos o tratamiento constante" disabled={disabled} defaultValue={user?.salud_tratamiento} />
            </div>
            <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-slate-500 ml-1">Relación del Grupo Familiar</Label>
                <RadioGroup defaultValue={user?.socio_relacion_fam || "Buena"} className="flex gap-6" disabled={disabled} name="socio_relacion_fam">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Buena" id="rb" /><Label htmlFor="rb" className="text-xs font-bold">Buena</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Regular" id="rr" /><Label htmlFor="rr" className="text-xs font-bold">Regular</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="Mala" id="rm" /><Label htmlFor="rm" className="text-xs font-bold">Mala</Label></div>
                </RadioGroup>
            </div>
        </div>
    </CustomSection>
  )
}