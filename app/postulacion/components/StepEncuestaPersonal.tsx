"use client"

import React, { useMemo, useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  User, 
  Fingerprint, 
  CalendarDays, 
  Baby, 
  VenetianMask, 
  MapPin, 
  Mail,
  ShieldCheck,
  Globe,
  Map,
  Heart,
  Home,
  Phone,
  Smartphone
} from "lucide-react"
import { cn, calcularEdad } from "@/lib/utils"
import { 
  OPCIONES_ESTADO_CIVIL, 
  OPCIONES_NACIONALIDAD 
} from "@/lib/constants"
import { Student } from "@/lib/TablaStudient"

export function StepEncuestaPersonal({
  disabled,
  user
}: {
  disabled: boolean;
  user: Student & any; 
}) {
  // 🟢 Inicialización con fallback seguro para evitar "No especificado"
  const valInicialEC = user?.socio_estado_civil || user?.estado_civil || "Soltero/a";
  const valInicialNac = user?.socio_nacionalidad || "Venezolano/a";

  const [estadoCivil, setEstadoCivil] = useState(valInicialEC);
  const [nacionalidad, setNacionalidad] = useState(valInicialNac);

  // 🔄 SINCRONIZACIÓN ESTABLE: Dependemos de valores primitivos, no del objeto 'user' completo
  // Esto evita el error "changed size between renders"
  const userId = user?.id;
  const userEC = user?.socio_estado_civil || user?.estado_civil;
  const userNac = user?.socio_nacionalidad;

  useEffect(() => {
    if (userEC) setEstadoCivil(userEC);
    if (userNac) setNacionalidad(userNac);
  }, [userId, userEC, userNac]);

  const edadCalculada = useMemo(() => {
    return calcularEdad(user?.fecha_nacimiento);
  }, [user?.fecha_nacimiento]);

  const generoVisual = useMemo(() => {
    if (user?.sexo === 'M') return "Masculino";
    if (user?.sexo === 'F') return "Femenino";
    return user?.sexo || "No especificado";
  }, [user?.sexo]);

  const blockedClass = "h-8 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/60 cursor-not-allowed text-[10px] shadow-none px-2";
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[10px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* BLOQUE 1: DATOS MAESTROS (BLOQUEADOS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-x-3 gap-y-2 p-3 bg-slate-50/50 rounded-xl border border-slate-100 relative overflow-hidden">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3 w-3 text-slate-400" />
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">Información Académica Validada</span>
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><User className="h-2 w-2" /> Nombres</Label>
          <Input readOnly disabled value={user?.nombre || ""} className={blockedClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><User className="h-2 w-2" /> Apellidos</Label>
          <Input readOnly disabled value={user?.apellido || ""} className={blockedClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><Fingerprint className="h-2 w-2" /> Cédula</Label>
          <Input readOnly disabled value={user?.cedula || ""} className={blockedClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><CalendarDays className="h-2 w-2" /> F. Nacimiento</Label>
          <Input readOnly disabled value={user?.fecha_nacimiento || ""} className={cn(blockedClass, "text-center")} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><Baby className="h-2 w-2" /> Edad</Label>
          <Input readOnly disabled value={`${edadCalculada} años`} className={cn(blockedClass, "text-center")} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><VenetianMask className="h-2 w-2" /> Género</Label>
          <Input readOnly disabled value={generoVisual} className={cn(blockedClass, "text-center")} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><MapPin className="h-2 w-2" /> Municipio</Label>
          <Input readOnly disabled value={user?.municipio_residencia || "No registrado"} className={blockedClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-400 flex items-center gap-1"><Mail className="h-2 w-2" /> Correo Institucional</Label>
          <Input readOnly disabled value={user?.email || ""} className={cn(blockedClass, "lowercase truncate")} />
        </div>
      </div>

      {/* BLOQUE 2: DATOS SOCIOECONÓMICOS (EDITABLES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 gap-y-2 p-3 bg-white rounded-xl border border-[#1e3a5f]/10 shadow-sm relative">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <div className="h-1 w-1 rounded-full bg-[#d4a843]" />
          <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Actualización de Datos de Contacto</span>
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Globe className="h-2 w-2 text-[#d4a843]" /> Nacionalidad</Label>
          <Select disabled={disabled} value={nacionalidad} onValueChange={setNacionalidad}>
            <SelectTrigger className={editableClass}><SelectValue placeholder="Nacionalidad" /></SelectTrigger>
            <SelectContent>
              {OPCIONES_NACIONALIDAD.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="socio_nacionalidad" value={nacionalidad} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Map className="h-2 w-2 text-[#d4a843]" /> Lugar de Nac.</Label>
          <Input name="socio_lugar_nac" disabled={disabled} defaultValue={user?.socio_lugar_nac} required placeholder="Ciudad / Estado" className={editableClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Heart className="h-2 w-2 text-[#d4a843]" /> Estado Civil</Label>
          <Select 
            disabled={disabled} 
            value={estadoCivil} 
            onValueChange={setEstadoCivil}
          >
            <SelectTrigger className={editableClass}>
              <SelectValue placeholder="Estado Civil" />
            </SelectTrigger>
            <SelectContent>
              {OPCIONES_ESTADO_CIVIL.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-[10px] font-bold uppercase">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="socio_estado_civil" value={estadoCivil} />
        </div>

        <div className="space-y-0.5 md:col-span-2">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Home className="h-2 w-2 text-[#d4a843]" /> Dirección Completa</Label>
          <Input name="direccion_completa" disabled={disabled} defaultValue={user?.direccion_completa} required placeholder="Sector, Calle, Casa/Apto..." className={editableClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Phone className="h-2 w-2 text-[#d4a843]" /> Teléfono Hab.</Label>
          <Input name="socio_telf_hab" type="tel" disabled={disabled} defaultValue={user?.socio_telf_hab} placeholder="0295..." className={editableClass} />
        </div>

        <div className="space-y-0.5">
          <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1"><Smartphone className="h-2 w-2 text-[#d4a843]" /> Teléfono Celular</Label>
          <Input name="socio_celular" type="tel" disabled={disabled} defaultValue={user?.socio_celular || user?.telefono} required placeholder="04XX..." className={editableClass} />
        </div>
      </div>
    </div>
  )
}