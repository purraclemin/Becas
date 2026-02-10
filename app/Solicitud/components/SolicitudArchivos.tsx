"use client"

import { useState, useEffect } from "react"
import { Upload, CheckCircle2, FileText, Image as ImageIcon, RefreshCcw, Clock, ShieldCheck, AlertTriangle } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function SolicitudArchivos({ disabled, user }: { disabled: boolean, user?: any }) {
  const [reemplazarFoto, setReemplazarFoto] = useState(false);
  const [reemplazarCedula, setReemplazarCedula] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (disabled) {
      setReemplazarFoto(false);
      setReemplazarCedula(false);
    }
  }, [disabled]);

  // 🟢 FUNCIÓN DE VALIDACIÓN: Revisa peso y formato
  const validarArchivo = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'foto' | 'documento') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    
    // Alerta específica de peso
    if (file.size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "¡Error de carga!",
        description: "Este archivo pesa más de 2mb. Por favor, sube uno más ligero.",
      });
      e.target.value = ""; // Limpiar el input para que no se envíe
      return;
    }

    const formatosFoto = ['image/jpeg', 'image/png', 'image/jpg'];
    const formatosDoc = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const formatosPermitidos = tipo === 'foto' ? formatosFoto : formatosDoc;

    if (!formatosPermitidos.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no válido",
        description: tipo === 'foto' ? "Solo se permiten imágenes (JPG, PNG)." : "Solo se permiten PDF o imágenes.",
      });
      e.target.value = "";
      return;
    }
  };

  const estatus = user?.estatusBeca || "Pendiente";
  
  const getStatusStyles = () => {
    if (estatus === "En Revisión") {
      return {
        bg: "bg-blue-50/80",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: <ShieldCheck className="h-4 w-4 text-blue-600" />,
        label: "En Revisión Administrativa"
      };
    }
    if (estatus === "Pendiente") {
      return {
        bg: "bg-amber-50/80",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: <Clock className="h-4 w-4 text-amber-600" />,
        label: "Archivo Cargado (Pendiente)"
      };
    }
    return {
      bg: "bg-emerald-50/80",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      label: "Archivo Verificado"
    };
  };

  const statusStyle = getStatusStyles();

  return (
    <div className={`pt-8 border-t-2 border-slate-100 mt-6 transition-opacity ${disabled ? "opacity-80" : "opacity-100"}`}>
      <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest mb-6 flex items-center gap-2">
        <Upload className="h-4 w-4" /> Recaudos Digitales
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Foto Tipo Carnet */}
        <div className={`group relative p-5 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          disabled 
            ? "border-slate-200 bg-slate-100/50 cursor-not-allowed" 
            : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#1e3a5f]/30"
        }`}>
          <div className="flex items-center justify-between mb-3">
             <Label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${disabled ? "text-slate-400" : "text-slate-500"}`}>
                <ImageIcon className={`h-3.5 w-3.5 ${disabled ? "text-slate-300" : "text-[#1e3a5f]"}`} /> Foto Tipo Carnet
             </Label>
             {user?.foto_url && !reemplazarFoto && statusStyle.icon}
          </div>
          
          {user?.foto_url && !reemplazarFoto ? (
            <div className="flex flex-col gap-2">
                <div className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 py-1 text-xs font-bold shadow-sm ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                    <span className="uppercase tracking-widest text-[9px]">{statusStyle.label}</span>
                </div>
                {!disabled && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setReemplazarFoto(true)}
                        className="text-[9px] h-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 w-full"
                    >
                        <RefreshCcw className="h-3 w-3 mr-1" /> Cambiar Archivo
                    </Button>
                )}
            </div>
          ) : (
            <div className="space-y-2">
                <Input 
                    name="foto_carnet" 
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg" 
                    // 🟢 CONEXIÓN AL DISPARADOR:
                    onChange={(e) => validarArchivo(e, 'foto')}
                    className={`text-[10px] file:bg-[#1e3a5f] file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:text-[9px] file:font-bold file:uppercase file:mr-2 transition-colors ${
                        disabled 
                        ? "bg-slate-200/50 text-slate-400 cursor-not-allowed file:bg-slate-300" 
                        : "bg-white text-[#1e3a5f] cursor-pointer"
                    }`} 
                    required={(!user?.foto_url || reemplazarFoto) && !disabled} 
                    disabled={disabled} 
                />
                {reemplazarFoto && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setReemplazarFoto(false)} className="text-[9px] h-6 text-slate-400 w-full">Cancelar cambio</Button>
                )}
            </div>
          )}
          <div className="flex justify-end items-center gap-1.5 mt-2">
            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
            <p className="text-[9px] text-slate-400 font-medium italic">Límite 2mb. JPG, PNG</p>
          </div>
        </div>

        {/* Cédula de Identidad */}
        <div className={`group relative p-5 border-2 border-dashed rounded-2xl transition-all duration-300 ${
          disabled 
            ? "border-slate-200 bg-slate-100/50 cursor-not-allowed" 
            : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#1e3a5f]/30"
        }`}>
          <div className="flex items-center justify-between mb-3">
             <Label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${disabled ? "text-slate-400" : "text-slate-500"}`}>
                <FileText className={`h-3.5 w-3.5 ${disabled ? "text-slate-300" : "text-[#1e3a5f]"}`} /> Cédula de Identidad
             </Label>
             {user?.cedula_url && !reemplazarCedula && statusStyle.icon}
          </div>
          
          {user?.cedula_url && !reemplazarCedula ? (
            <div className="flex flex-col gap-2">
                <div className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 py-1 text-xs font-bold shadow-sm ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                    <span className="uppercase tracking-widest text-[9px]">{statusStyle.label}</span>
                </div>
                {!disabled && (
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setReemplazarCedula(true)}
                        className="text-[9px] h-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 w-full"
                    >
                        <RefreshCcw className="h-3 w-3 mr-1" /> Cambiar Archivo
                    </Button>
                )}
            </div>
          ) : (
            <div className="space-y-2">
                <Input 
                    name="copia_cedula" 
                    type="file" 
                    accept="application/pdf,image/jpeg,image/png,image/jpg" 
                    // 🟢 CONEXIÓN AL DISPARADOR:
                    onChange={(e) => validarArchivo(e, 'documento')}
                    className={`text-[10px] file:bg-[#1e3a5f] file:text-white file:border-0 file:rounded-lg file:px-2 file:py-1 file:text-[9px] file:font-bold file:uppercase file:mr-2 transition-colors ${
                        disabled 
                        ? "bg-slate-200/50 text-slate-400 cursor-not-allowed file:bg-slate-300" 
                        : "bg-white text-[#1e3a5f] cursor-pointer"
                    }`} 
                    required={(!user?.cedula_url || reemplazarCedula) && !disabled} 
                    disabled={disabled} 
                />
                {reemplazarCedula && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setReemplazarCedula(false)} className="text-[9px] h-6 text-slate-400 w-full">Cancelar cambio</Button>
                )}
            </div>
          )}
          <div className="flex justify-end items-center gap-1.5 mt-2">
            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
            <p className="text-[9px] text-slate-400 font-medium italic">Límite 2mb. PDF, JPG, PNG</p>
          </div>
        </div>

      </div>
    </div>
  )
}