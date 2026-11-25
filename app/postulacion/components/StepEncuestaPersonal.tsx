"use client"

import React, { useMemo, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
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
  Heart,
  Home,
  Phone,
  Smartphone,
  Lock
} from "lucide-react"
import { cn, calcularEdad } from "@/lib/utils"
import type { PostulacionUser } from "../types"

export function StepEncuestaPersonal({
  user,
  onValidationChange
}: {
  disabled: boolean;
  user: PostulacionUser;
  onValidationChange?: (isValid: boolean) => void;
}) {
  useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  const edadCalculada = useMemo(
    () => calcularEdad(user?.fecha_nacimiento),
    [user?.fecha_nacimiento]
  );

  const generoVisual = useMemo(() => {
    if (user?.sexo === "M") return "Masculino";
    if (user?.sexo === "F") return "Femenino";
    return user?.sexo || "No especificado";
  }, [user?.sexo]);

  const nacionalidadValor = user?.socio_nacionalidad || "Venezolano/a";
  const lugarNacValor = user?.socio_lugar_nac || "Porlamar, Nueva Esparta";
  const estadoCivilValor = user?.socio_estado_civil || user?.estado_civil || "Soltero/a";
  const direccionValor = user?.direccion_completa || "Av. Bolívar, Nueva Esparta";
  const telfHabValor = user?.socio_telf_hab || "02952600000";
  const telfCelValor = user?.socio_celular || user?.telefono || "04120000000";

  const readOnlyClass =
    "h-12 lg:h-9 bg-slate-100 border-slate-200 font-bold text-[#1e3a5f]/80 cursor-not-allowed text-sm lg:text-xs shadow-none px-3 rounded-xl select-none";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 pb-16 lg:pb-0">
      {/* BLOQUE 1: DATOS MAESTROS (SOLO LECTURA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3 lg:p-2.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        <div className="col-span-full flex items-center gap-2 mb-0.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#1e3a5f]" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">
            Información Académica Validada (Solo Lectura)
          </span>
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
            <Input
              readOnly
              aria-readonly="true"
              value={item.val}
              className={cn(
                readOnlyClass,
                item.center && "text-center",
                item.lower && "lowercase",
                item.truncate && "truncate"
              )}
            />
          </div>
        ))}
      </div>

      {/* BLOQUE 2: DATOS DE CONTACTO PRECARGADOS (SOLO LECTURA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 lg:p-2.5 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
        <div className="col-span-full flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1e3a5f]">
              Datos de Contacto Precargados
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-slate-400">
            <Lock className="h-2.5 w-2.5 text-[#d4a843]" /> Solo Lectura
          </span>
        </div>

        {/* Nacionalidad */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-[#d4a843]" /> Nacionalidad
          </Label>
          <Input
            type="text"
            readOnly
            aria-readonly="true"
            value={nacionalidadValor}
            className={readOnlyClass}
          />
          <input type="hidden" name="socio_nacionalidad" value={nacionalidadValor} />
        </div>

        {/* Lugar de Nacimiento */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-[#d4a843]" /> Lugar de Nacimiento
          </Label>
          <Input
            name="socio_lugar_nac"
            type="text"
            readOnly
            aria-readonly="true"
            value={lugarNacValor}
            className={readOnlyClass}
          />
        </div>

        {/* Estado Civil */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Heart className="h-3 w-3 text-[#d4a843]" /> Estado Civil
          </Label>
          <Input
            type="text"
            readOnly
            aria-readonly="true"
            value={estadoCivilValor}
            className={readOnlyClass}
          />
          <input type="hidden" name="socio_estado_civil" value={estadoCivilValor} />
        </div>

        {/* Dirección Completa */}
        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Home className="h-3 w-3 text-[#d4a843]" /> Dirección Completa
          </Label>
          <Input
            name="direccion_completa"
            type="text"
            readOnly
            aria-readonly="true"
            value={direccionValor}
            className={readOnlyClass}
          />
        </div>

        {/* Teléfono Habitación */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[#d4a843]" /> Teléfono Hab.
          </Label>
          <Input
            type="text"
            readOnly
            aria-readonly="true"
            value={telfHabValor}
            className={readOnlyClass}
          />
          <input type="hidden" name="socio_telf_hab" value={telfHabValor} />
        </div>

        {/* Teléfono Celular */}
        <div className="space-y-1">
          <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
            <Smartphone className="h-3 w-3 text-[#d4a843]" /> Teléfono Celular
          </Label>
          <Input
            name="socio_celular"
            type="text"
            readOnly
            aria-readonly="true"
            value={telfCelValor}
            className={readOnlyClass}
          />
        </div>
      </div>
    </div>
  )
}