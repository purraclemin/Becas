"use client"

import { Upload, FileText, Image as ImageIcon, AlertTriangle, ShieldCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

/**
 * 🟢 COMPONENTE: RECAUDOS DIGITALES (LIMPIO)
 * Optimizado exclusivamente para la primera carga de documentos de nuevos aspirantes.
 */
export function SolicitudArchivos({ disabled }: { disabled: boolean, user?: any }) {
  const { toast } = useToast();

  /**
   * 🟢 VALIDACIÓN TÉCNICA
   * Verifica que los archivos no excedan los 2MB y cumplan con los formatos Unimar.
   */
  const validarArchivo = (e: React.ChangeEvent<HTMLInputElement>, tipo: 'foto' | 'documento') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    
    if (file.size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "Archivo muy pesado",
        description: "El límite máximo por archivo es de 2MB para asegurar la recepción en el servidor.",
      });
      e.target.value = ""; 
      return;
    }

    const formatosFoto = ['image/jpeg', 'image/png', 'image/jpg'];
    const formatosDoc = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const formatosPermitidos = tipo === 'foto' ? formatosFoto : formatosDoc;

    if (!formatosPermitidos.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no permitido",
        description: tipo === 'foto' ? "Para la foto carnet solo se admiten formatos de imagen (JPG, PNG)." : "La cédula debe ser PDF o imagen.",
      });
      e.target.value = "";
      return;
    }
  };

  return (
    <div className={`pt-8 border-t-2 border-slate-100 mt-6 animate-in fade-in duration-700 ${disabled ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}>
      
      {/* Título de Sección */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xs font-black text-[#1e3a5f] uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e3a5f]/5 text-[#d4a843]">
                <Upload className="h-4 w-4" />
            </span>
            Documentación Digital
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 ml-10 italic">
            Formatos admitidos: PDF, JPG y PNG
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
           <ShieldCheck className="h-3 w-3 text-emerald-600" />
           <span className="text-[8px] font-black text-emerald-700 uppercase tracking-tighter">Carga Segura</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARGADOR 1: FOTO CARNET */}
        <div className="group space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
            <ImageIcon className="h-3.5 w-3.5 text-[#d4a843]" /> Foto Tipo Carnet
          </Label>
          
          <div className={`relative p-6 border-2 border-dashed rounded-[1.5rem] transition-all duration-300 ${
            disabled 
              ? "border-slate-200 bg-slate-50" 
              : "border-slate-200 bg-white hover:border-[#1e3a5f] hover:shadow-md"
          }`}>
            <Input 
              name="foto_carnet" 
              type="file" 
              accept="image/jpeg,image/png,image/jpg" 
              onChange={(e) => validarArchivo(e, 'foto')}
              className="text-[10px] file:bg-[#1e3a5f] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-[9px] file:font-black file:uppercase file:mr-4 file:cursor-pointer border-none bg-transparent shadow-none cursor-pointer h-auto p-0" 
              required={!disabled} 
              disabled={disabled} 
            />
            <div className="mt-4 flex items-center gap-2 text-[#d4a843]">
              <AlertTriangle className="h-3 w-3" />
              <p className="text-[9px] font-bold uppercase tracking-tighter">Fondo blanco preferiblemente</p>
            </div>
          </div>
        </div>

        {/* CARGADOR 2: CÉDULA */}
        <div className="group space-y-3">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1">
            <FileText className="h-3.5 w-3.5 text-[#d4a843]" /> Cédula de Identidad
          </Label>
          
          <div className={`relative p-6 border-2 border-dashed rounded-[1.5rem] transition-all duration-300 ${
            disabled 
              ? "border-slate-200 bg-slate-50" 
              : "border-slate-200 bg-white hover:border-[#1e3a5f] hover:shadow-md"
          }`}>
            <Input 
              name="copia_cedula" 
              type="file" 
              accept="application/pdf,image/jpeg,image/png,image/jpg" 
              onChange={(e) => validarArchivo(e, 'documento')}
              className="text-[10px] file:bg-[#1e3a5f] file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-[9px] file:font-black file:uppercase file:mr-4 file:cursor-pointer border-none bg-transparent shadow-none cursor-pointer h-auto p-0" 
              required={!disabled} 
              disabled={disabled} 
            />
            <div className="mt-4 flex items-center gap-2 text-slate-400">
              <p className="text-[9px] font-bold uppercase tracking-tighter italic">Debe ser legible y estar vigente</p>
            </div>
          </div>
        </div>

      </div>

      

      <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[9px] text-slate-500 leading-relaxed text-center font-medium italic">
          * Los documentos cargados serán procesados bajo la Ley de Protección de Datos Personales y solo se utilizarán con fines de adjudicación de beneficios académicos.
        </p>
      </div>
    </div>
  )
}