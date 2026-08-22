"use client"

import React, { useMemo, useState, useEffect, useRef } from "react"
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
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: Student & any; 
  onValidationChange?: (isValid: boolean) => void;
}) {
  const [estadoCivil, setEstadoCivil] = useState(user?.socio_estado_civil || user?.estado_civil || "Soltero/a");
  const [nacionalidad, setNacionalidad] = useState(user?.socio_nacionalidad || "Venezolano/a");
  const [lugarNac, setLugarNac] = useState(user?.socio_lugar_nac || "");
  const [direccion, setDireccion] = useState(user?.direccion_completa || "");

  const initialHab = user?.socio_telf_hab && user?.socio_telf_hab.trim() !== "" && user?.socio_telf_hab !== "0" ? user.socio_telf_hab : "";
  const initialCel = (user?.socio_celular || user?.telefono) && (user?.socio_celular || user?.telefono).trim() !== "" && (user?.socio_celular || user?.telefono) !== "00000000000" ? (user?.socio_celular || user?.telefono) : "";

  const [telfHab, setTelfHab] = useState(initialHab);
  const [telfCel, setTelfCel] = useState(initialCel);
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);

  const lugarRef = useRef<HTMLInputElement>(null);
  const direccionRef = useRef<HTMLInputElement>(null);
  const celRef = useRef<HTMLInputElement>(null);

  const isLugarValid = lugarNac.trim() !== "";
  const isDireccionValid = direccion.trim() !== "";
  const isTelfCelValid = telfCel.trim() !== "" && telfCel.length >= 7;

  const isValid = isLugarValid && isDireccionValid && isTelfCelValid;

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  useEffect(() => {
    const handleValidationAttempt = () => {
      setHasAttemptedNext(true);
      if (!isLugarValid && lugarRef.current) lugarRef.current.focus();
      else if (!isDireccionValid && direccionRef.current) direccionRef.current.focus();
      else if (!isTelfCelValid && celRef.current) celRef.current.focus();
    };

    window.addEventListener('intentar-avanzar-personal', handleValidationAttempt);
    return () => window.removeEventListener('intentar-avanzar-personal', handleValidationAttempt);
  }, [isLugarValid, isDireccionValid, isTelfCelValid]);

  // Filtros de entrada específicos
  const handleSoloLetras = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ""));
  };

  const handleTelefono = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.replace(/\D/g, "").slice(0, 11));
  };

  const edadCalculada = useMemo(() => calcularEdad(user?.fecha_nacimiento), [user?.fecha_nacimiento]);
  
  const generoVisual = useMemo(() => {
    if (user?.sexo === 'M') return "Masculino";
    if (user?.sexo === 'F') return "Femenino";
    return user?.sexo || "No especificado";
  }, [user?.sexo]);

  const blockedClass = "h-12 lg:h-9 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/60 cursor-not-allowed text-sm lg:text-[11px] shadow-none px-3 rounded-xl";
  const editableClass = "h-12 lg:h-9 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-sm lg:text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 pb-16 lg:pb-0">
      
      {/* BLOQUE 1: DATOS MAESTROS (BLOQUEADOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 lg:p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Información Académica Validada</span>
        </div>

        {[
          { label: "Nombres", val: user?.nombre || "", icon: User },
          { label: "Apellidos", val: user?.apellido || "", icon: User },
          { label: "Cédula", val: user?.cedula || "", icon: Fingerprint },
          { label: "F. Nacimiento", val: user?.fecha_nacimiento || "", icon: CalendarDays, center: true },
          { label: "Edad", val: `${edadCalculada} años`, icon: Baby, center: true },
          { label: "Género", val: generoVisual, icon: VenetianMask, center: true },
          { label: "Municipio", val: user?.municipio_residencia || "No registrado", icon: MapPin },
          { label: "Correo Institucional", val: user?.email || "", icon: Mail, lower: true, truncate: true }
        ].map((item, idx) => (
          <div key={idx} className="space-y-1">
            <Label className="text-[8px] font-black uppercase text-slate-400 flex items-center gap-1.5">
              <item.icon className="h-2.5 w-2.5 text-[#d4a843]" /> {item.label}
            </Label>
            <Input readOnly disabled value={item.val} className={cn(blockedClass, item.center && "text-center", item.lower && "lowercase", item.truncate && "truncate")} />
          </div>
        ))}
      </div>

      {/* BLOQUE 2: DATOS SOCIOECONÓMICOS (EDITABLES) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 lg:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">Actualización de Datos de Contacto</span>
        </div>

        {/* Nacionalidad */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Globe className="h-3 w-3 text-[#d4a843]" /> Nacionalidad</Label>
          <Select disabled={disabled} value={nacionalidad} onValueChange={setNacionalidad}>
            <SelectTrigger className={editableClass}><SelectValue placeholder="Nacionalidad" /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {OPCIONES_NACIONALIDAD.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm lg:text-xs font-bold uppercase py-2">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="socio_nacionalidad" value={nacionalidad} />
        </div>

        {/* Lugar de Nacimiento (Solo Letras) */}
        <div className="space-y-1">
          <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors", hasAttemptedNext && !isLugarValid ? "text-red-500 font-extrabold" : "text-slate-500")}>
            <Map className="h-3 w-3 text-[#d4a843]" /> Lugar de Nacimiento. {hasAttemptedNext && !isLugarValid && "*"}
          </Label>
          <Input 
            ref={lugarRef}
            name="socio_lugar_nac" 
            disabled={disabled} 
            value={lugarNac}
            onChange={handleSoloLetras(setLugarNac)}
            required 
            placeholder="Ciudad / Estado" 
            className={cn(editableClass, hasAttemptedNext && !isLugarValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")} 
          />
        </div>

        {/* Estado Civil */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5"><Heart className="h-3 w-3 text-[#d4a843]" /> Estado Civil</Label>
          <Select disabled={disabled} value={estadoCivil} onValueChange={setEstadoCivil}>
            <SelectTrigger className={editableClass}><SelectValue placeholder="Estado Civil" /></SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl max-h-[40vh]">
              {OPCIONES_ESTADO_CIVIL.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm lg:text-xs font-bold uppercase py-2">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="socio_estado_civil" value={estadoCivil} />
        </div>

        {/* Dirección Completa */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors", hasAttemptedNext && !isDireccionValid ? "text-red-500 font-extrabold" : "text-slate-500")}>
            <Home className="h-3 w-3 text-[#d4a843]" /> Dirección Completa {hasAttemptedNext && !isDireccionValid && "*"}
          </Label>
          <Input 
            ref={direccionRef}
            name="direccion_completa" 
            disabled={disabled} 
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required 
            placeholder="Sector, Calle, Casa/Apto..." 
            className={cn(editableClass, hasAttemptedNext && !isDireccionValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")} 
          />
        </div>

        {/* Teléfono Habitación */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[#d4a843]" /> Teléfono Hab. (Opcional)
          </Label>
          <Input 
            type="tel" 
            maxLength={11}
            disabled={disabled} 
            value={telfHab}
            onChange={handleTelefono(setTelfHab)}
            placeholder="0295..." 
            className={editableClass} 
          />
          <input type="hidden" name="socio_telf_hab" value={!telfHab || telfHab.trim() === "" ? "0" : telfHab} />
        </div>

        {/* Teléfono Celular */}
        <div className="space-y-1">
          <Label className={cn("text-[8px] font-black uppercase flex items-center gap-1.5 transition-colors", hasAttemptedNext && !isTelfCelValid ? "text-red-500 font-extrabold" : "text-slate-500")}>
            <Smartphone className="h-3 w-3 text-[#d4a843]" /> Teléfono Celular {hasAttemptedNext && !isTelfCelValid && "*"}
          </Label>
          <Input 
            ref={celRef}
            name="socio_celular" 
            type="tel" 
            maxLength={11}
            disabled={disabled} 
            value={telfCel}
            onChange={handleTelefono(setTelfCel)}
            placeholder="04XX..." 
            required
            className={cn(editableClass, hasAttemptedNext && !isTelfCelValid && "border-red-500 bg-red-50/50 text-red-900 focus:ring-red-500 animate-pulse")} 
          />
        </div>
      </div>
    </div>
  )
}