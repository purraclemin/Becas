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

  // 📞 Estados locales para validación estricta de teléfonos (Solo números, máx 11 dígitos, valor por defecto 00000000000)
  const [telfHab, setTelfHab] = useState(user?.socio_telf_hab && user?.socio_telf_hab.trim() !== "" ? user.socio_telf_hab : "00000000000");
  const [telfCel, setTelfCel] = useState((user?.socio_celular || user?.telefono) && (user?.socio_celular || user?.telefono).trim() !== "" ? (user?.socio_celular || user?.telefono) : "00000000000");

  // 🔄 SINCRONIZACIÓN ESTABLE: Dependemos de valores primitivos, no del objeto 'user' completo
  const userId = user?.id;
  const userEC = user?.socio_estado_civil || user?.estado_civil;
  const userNac = user?.socio_nacionalidad;
  const userHab = user?.socio_telf_hab;
  const userCel = user?.socio_celular || user?.telefono;

  useEffect(() => {
    if (userEC) setEstadoCivil(userEC);
    if (userNac) setNacionalidad(userNac);
    if (userHab) setTelfHab(userHab);
    if (userCel) setTelfCel(userCel);
  }, [userId, userEC, userNac, userHab, userCel]);

  const handleTelfHabChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
    setTelfHab(val);
  };

  const handleTelfHabBlur = () => {
    if (!telfHab || telfHab.trim() === "") {
      setTelfHab("00000000000");
    }
  };

  const handleTelfCelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 11);
    setTelfCel(val);
  };

  const handleTelfCelBlur = () => {
    if (!telfCel || telfCel.trim() === "") {
      setTelfCel("00000000000");
    }
  };

  const edadCalculada = useMemo(() => {
    return calcularEdad(user?.fecha_nacimiento);
  }, [user?.fecha_nacimiento]);

  const generoVisual = useMemo(() => {
    if (user?.sexo === 'M') return "Masculino";
    if (user?.sexo === 'F') return "Femenino";
    return user?.sexo || "No especificado";
  }, [user?.sexo]);

  const blockedClass = "h-9 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/60 cursor-not-allowed text-[11px] shadow-none px-3 rounded-xl";
  const editableClass = "h-10 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-500 pb-4">
      
      {/* BLOQUE 1: DATOS MAESTROS (BLOQUEADOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Información Académica Validada</span>
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><User className="h-2.5 w-2.5 text-[#d4a843]" /> Nombres</Label>
          <Input readOnly disabled value={user?.nombre || ""} className={blockedClass} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><User className="h-2.5 w-2.5 text-[#d4a843]" /> Apellidos</Label>
          <Input readOnly disabled value={user?.apellido || ""} className={blockedClass} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Fingerprint className="h-2.5 w-2.5 text-[#d4a843]" /> Cédula</Label>
          <Input readOnly disabled value={user?.cedula || ""} className={blockedClass} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><CalendarDays className="h-2.5 w-2.5 text-[#d4a843]" /> F. Nacimiento</Label>
          <Input readOnly disabled value={user?.fecha_nacimiento || ""} className={cn(blockedClass, "text-center")} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Baby className="h-2.5 w-2.5 text-[#d4a843]" /> Edad</Label>
          <Input readOnly disabled value={`${edadCalculada} años`} className={cn(blockedClass, "text-center")} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><VenetianMask className="h-2.5 w-2.5 text-[#d4a843]" /> Género</Label>
          <Input readOnly disabled value={generoVisual} className={cn(blockedClass, "text-center")} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><MapPin className="h-2.5 w-2.5 text-[#d4a843]" /> Municipio</Label>
          <Input readOnly disabled value={user?.municipio_residencia || "No registrado"} className={blockedClass} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5"><Mail className="h-2.5 w-2.5 text-[#d4a843]" /> Correo Institucional</Label>
          <Input readOnly disabled value={user?.email || ""} className={cn(blockedClass, "lowercase truncate")} />
        </div>
      </div>

      {/* BLOQUE 2: DATOS SOCIOECONÓMICOS (EDITABLES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Actualización de Datos de Contacto</span>
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Globe className="h-3 w-3 text-[#d4a843]" /> Nacionalidad</Label>
          <Select disabled={disabled} value={nacionalidad} onValueChange={setNacionalidad}>
            <SelectTrigger className={editableClass}><SelectValue placeholder="Nacionalidad" /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {OPCIONES_NACIONALIDAD.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold uppercase py-2">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="socio_nacionalidad" value={nacionalidad} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Map className="h-3 w-3 text-[#d4a843]" /> Lugar de Nac.</Label>
          <Input name="socio_lugar_nac" disabled={disabled} defaultValue={user?.socio_lugar_nac} required placeholder="Ciudad / Estado" className={editableClass} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Heart className="h-3 w-3 text-[#d4a843]" /> Estado Civil</Label>
          <Select 
            disabled={disabled} 
            value={estadoCivil} 
            onValueChange={setEstadoCivil}
          >
            <SelectTrigger className={editableClass}>
              <SelectValue placeholder="Estado Civil" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {OPCIONES_ESTADO_CIVIL.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs font-bold uppercase py-2">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="socio_estado_civil" value={estadoCivil} />
        </div>

        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Home className="h-3 w-3 text-[#d4a843]" /> Dirección Completa</Label>
          <Input name="direccion_completa" disabled={disabled} defaultValue={user?.direccion_completa} required placeholder="Sector, Calle, Casa/Apto..." className={editableClass} />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Phone className="h-3 w-3 text-[#d4a843]" /> Teléfono Hab.</Label>
          <Input 
            name="socio_telf_hab" 
            type="tel" 
            maxLength={11}
            disabled={disabled} 
            value={telfHab}
            onChange={handleTelfHabChange}
            onBlur={handleTelfHabBlur}
            placeholder="0295..." 
            className={editableClass} 
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Smartphone className="h-3 w-3 text-[#d4a843]" /> Teléfono Celular</Label>
          <Input 
            name="socio_celular" 
            type="tel" 
            maxLength={11}
            disabled={disabled} 
            value={telfCel}
            onChange={handleTelfCelChange}
            onBlur={handleTelfCelBlur}
            placeholder="04XX..." 
            className={editableClass} 
          />
        </div>
      </div>
    </div>
  )
}