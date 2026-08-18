"use client"

import React, { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Users2, 
  UserCircle, 
  Baby, 
  Building2, 
  GraduationCap, 
  Info 
} from "lucide-react"
import { cn } from "@/lib/utils"

export function StepEncuestaGrupoFamiliar({
  disabled,
  user
}: {
  disabled: boolean;
  user: any;
}) {
  // Estándar UNIMAR Academic Minimalist (Simetría unificada con altura de 40px y bordes xl)
  const editableClass = "h-10 bg-slate-50 border-slate-200 font-bold text-[#1e3a5f] text-xs focus:bg-white focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all px-3 rounded-xl";

  const [numHermanos, setNumHermanos] = useState(user?.familia_num_hermanos ?? "");
  const [hermanosUni, setHermanosUni] = useState(user?.familia_hermanos_uni ?? "");

  const handleNumHermanosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumHermanos(val);
    const numVal = val === "" ? 0 : parseInt(val, 10);
    const uniVal = hermanosUni === "" ? 0 : parseInt(hermanosUni, 10);
    if (uniVal > numVal) {
      setHermanosUni(numVal.toString());
    }
  };

  const handleHermanosUniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const numVal = numHermanos === "" ? 0 : parseInt(numHermanos, 10);
    const uniVal = val === "" ? 0 : parseInt(val, 10);

    if (uniVal <= numVal) {
      setHermanosUni(val);
    } else {
      setHermanosUni(numVal.toString());
    }
  };

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-500 pb-4">
      
      {/* Encabezado informativo compacto */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2.5 shrink-0">
        <Info className="h-4 w-4 text-[#1e3a5f] shrink-0" />
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight leading-relaxed">
          Proporcione los datos de sus padres y hermanos. Esta información es vital para determinar la carga familiar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* BLOQUE PADRE */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative group hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle className="h-4 w-4 text-blue-600" />
            <Label className="text-[9px] font-black text-blue-700 uppercase tracking-widest">
              Ficha del Padre
            </Label>
          </div>

          <div className="grid grid-cols-4 gap-x-2.5 gap-y-3">
            <div className="col-span-4 lg:col-span-2 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Nombres y Apellidos</Label>
              <Input 
                name="padre_nombre" 
                disabled={disabled} 
                defaultValue={user?.padre_nombre} 
                required 
                placeholder="Nombre completo"
                className={editableClass}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Edad</Label>
              <Input 
                name="padre_edad" 
                type="number" 
                disabled={disabled} 
                defaultValue={user?.padre_edad} 
                required 
                className={cn(editableClass, "text-center")}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Ocupación</Label>
              <Input 
                name="padre_ocupacion" 
                disabled={disabled} 
                defaultValue={user?.padre_ocupacion} 
                required 
                placeholder="Ej. Comerciante"
                className={editableClass}
              />
            </div>

            <div className="col-span-4 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-[#d4a843]" /> Lugar de Trabajo
              </Label>
              <Input 
                name="padre_trabajo" 
                disabled={disabled} 
                defaultValue={user?.padre_trabajo} 
                placeholder="Nombre de la empresa o negocio"
                className={editableClass}
              />
            </div>
          </div>
        </div>

        {/* BLOQUE MADRE */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm relative group hover:border-pink-200 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <UserCircle className="h-4 w-4 text-pink-600" />
            <Label className="text-[9px] font-black text-pink-700 uppercase tracking-widest">
              Ficha de la Madre
            </Label>
          </div>

          <div className="grid grid-cols-4 gap-x-2.5 gap-y-3">
            <div className="col-span-4 lg:col-span-2 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Nombres y Apellidos</Label>
              <Input 
                name="madre_nombre" 
                disabled={disabled} 
                defaultValue={user?.madre_nombre} 
                required 
                placeholder="Nombre completo"
                className={editableClass}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Edad</Label>
              <Input 
                name="madre_edad" 
                type="number" 
                disabled={disabled} 
                defaultValue={user?.madre_edad} 
                required 
                className={cn(editableClass, "text-center")}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500">Ocupación</Label>
              <Input 
                name="madre_ocupacion" 
                disabled={disabled} 
                defaultValue={user?.madre_ocupacion} 
                required 
                placeholder="Ej. Docente"
                className={editableClass}
              />
            </div>

            <div className="col-span-4 space-y-1">
              <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
                <Building2 className="h-3 w-3 text-[#d4a843]" /> Lugar de Trabajo
              </Label>
              <Input 
                name="madre_trabajo" 
                disabled={disabled} 
                defaultValue={user?.madre_trabajo} 
                placeholder="Nombre de la empresa o negocio"
                className={editableClass}
              />
            </div>
          </div>
        </div>

      </div>

      {/* BLOQUE HERMANOS */}
      <div className="p-4 bg-[#1e3a5f]/5 rounded-2xl border border-[#1e3a5f]/10 shrink-0">
        <div className="flex items-center gap-2 mb-3">
           <Baby className="h-4 w-4 text-[#d4a843]" />
           <Label className="text-[9px] font-black uppercase tracking-widest text-[#1e3a5f]">
             Situación de Hermanos
           </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
              <Users2 className="h-3 w-3 text-[#d4a843]" /> Número Total de Hermanos
            </Label>
            <Input 
              name="familia_num_hermanos" 
              type="number" 
              min="0"
              disabled={disabled} 
              value={numHermanos}
              onChange={handleNumHermanosChange}
              required 
              className={editableClass}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[8px] font-black uppercase text-slate-500 flex items-center gap-1.5">
              <GraduationCap className="h-3 w-3 text-[#d4a843]" /> Hermanos en la Universidad
            </Label>
            <Input 
              name="familia_hermanos_uni" 
              type="number" 
              min="0"
              max={numHermanos !== "" ? numHermanos : undefined}
              disabled={disabled} 
              value={hermanosUni}
              onChange={handleHermanosUniChange}
              required 
              className={editableClass}
            />
          </div>
        </div>
      </div>

    </div>
  )
}