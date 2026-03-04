"use client"

import React from "react"
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
  // Estilo ultra-compacto institucional
  const editableClass = "h-8 bg-white border-slate-200 font-bold text-[#1e3a5f] text-[10px] focus:ring-1 focus:ring-[#1e3a5f]/10 transition-all px-2";

  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Encabezado informativo compacto */}
      <div className="bg-slate-50 p-2 px-3 rounded-xl border border-slate-200 flex items-center gap-2 shrink-0">
        <Info className="h-3 w-3 text-[#1e3a5f] shrink-0" />
        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tight leading-none">
          Proporcione los datos de sus padres y hermanos. Esta información es vital para determinar la carga familiar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* BLOQUE PADRE */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm relative group hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <UserCircle className="h-3.5 w-3.5 text-blue-600" />
            <Label className="text-[8px] font-black text-blue-700 uppercase tracking-widest">
              Ficha del Padre
            </Label>
          </div>

          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
            <div className="col-span-4 lg:col-span-2 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Nombres y Apellidos</Label>
              <Input 
                name="padre_nombre" 
                disabled={disabled} 
                defaultValue={user?.padre_nombre} 
                required 
                placeholder="Nombre completo"
                className={editableClass}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Edad</Label>
              <Input 
                name="padre_edad" 
                type="number" 
                disabled={disabled} 
                defaultValue={user?.padre_edad} 
                required 
                className={cn(editableClass, "text-center")}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Ocupación</Label>
              <Input 
                name="padre_ocupacion" 
                disabled={disabled} 
                defaultValue={user?.padre_ocupacion} 
                required 
                placeholder="Ej. Comerciante"
                className={editableClass}
              />
            </div>

            <div className="col-span-4 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
                <Building2 className="h-2 w-2 text-[#d4a843]" /> Lugar de Trabajo
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
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm relative group hover:border-pink-200 transition-colors">
          <div className="flex items-center gap-1.5 mb-2">
            <UserCircle className="h-3.5 w-3.5 text-pink-600" />
            <Label className="text-[8px] font-black text-pink-700 uppercase tracking-widest">
              Ficha de la Madre
            </Label>
          </div>

          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
            <div className="col-span-4 lg:col-span-2 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Nombres y Apellidos</Label>
              <Input 
                name="madre_nombre" 
                disabled={disabled} 
                defaultValue={user?.madre_nombre} 
                required 
                placeholder="Nombre completo"
                className={editableClass}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Edad</Label>
              <Input 
                name="madre_edad" 
                type="number" 
                disabled={disabled} 
                defaultValue={user?.madre_edad} 
                required 
                className={cn(editableClass, "text-center")}
              />
            </div>

            <div className="col-span-2 lg:col-span-1 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500">Ocupación</Label>
              <Input 
                name="madre_ocupacion" 
                disabled={disabled} 
                defaultValue={user?.madre_ocupacion} 
                required 
                placeholder="Ej. Docente"
                className={editableClass}
              />
            </div>

            <div className="col-span-4 space-y-0.5">
              <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
                <Building2 className="h-2 w-2 text-[#d4a843]" /> Lugar de Trabajo
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
      <div className="p-3 bg-[#1e3a5f]/5 rounded-xl border border-[#1e3a5f]/10 shrink-0">
        <div className="flex items-center gap-1.5 mb-2">
           <Baby className="h-3 w-3 text-[#d4a843]" />
           <Label className="text-[8px] font-black uppercase tracking-widest text-[#1e3a5f]">
             Situación de Hermanos
           </Label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
          <div className="space-y-0.5">
            <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
              <Users2 className="h-2 w-2 text-[#d4a843]" /> Número Total de Hermanos
            </Label>
            <Input 
              name="familia_num_hermanos" 
              type="number" 
              disabled={disabled} 
              defaultValue={user?.familia_num_hermanos} 
              required 
              className={cn(editableClass, "pl-2")}
            />
          </div>

          <div className="space-y-0.5">
            <Label className="text-[7px] font-black uppercase text-slate-500 flex items-center gap-1">
              <GraduationCap className="h-2 w-2 text-[#d4a843]" /> Hermanos en la Universidad
            </Label>
            <Input 
              name="familia_hermanos_uni" 
              type="number" 
              disabled={disabled} 
              defaultValue={user?.familia_hermanos_uni} 
              required 
              className={cn(editableClass, "pl-2")}
            />
          </div>
        </div>
      </div>

    </div>
  )
}