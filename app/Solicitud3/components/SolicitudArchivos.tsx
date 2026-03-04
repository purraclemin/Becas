"use client"

import { Upload, FileText, Image as ImageIcon, AlertTriangle, ShieldCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

/**
 * 🟢 COMPONENTE: RECAUDOS DIGITALES (Diseño Inmersivo)
 * Rediseñado para el Paso 4 del formulario de becas. 
 * Aprovecha el ancho completo y mejora la experiencia de carga de archivos.
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
    <div className={`space-y-10 animate-in fade-in duration-700 ${disabled ? "opacity-60 cursor-not-allowed" : "opacity-100"}`}>
      
      {/* CABECERA DE SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-[#1e3a5f] shadow-lg flex items-center justify-center text-[#d4a843]">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-[#1e3a5f] tracking-widest">Documentación Digital</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-widest italic">Formatos admitidos: PDF, JPG y PNG (Máx 2MB)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white rounded-full border border-emerald-100 shadow-sm self-start md:self-center">
           <ShieldCheck className="h-4 w-4 text-emerald-500" />
           <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Carga Encriptada Segura</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARGADOR 1: FOTO CARNET */}
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm space-y-6 group transition-all duration-300 hover:border-[#1e3a5f]/10">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
              <ImageIcon className="h-4 w-4 text-[#d4a843]" /> Fotografía Tipo Carnet
            </Label>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter ml-1">Imagen reciente del postulante</p>
          </div>
          
          <div className={`relative p-8 border-2 border-dashed rounded-[2rem] transition-all duration-500 flex flex-col items-center justify-center text-center ${
            disabled 
              ? "border-slate-100 bg-slate-50/50" 
              : "border-slate-200 bg-slate-50/30 group-hover:bg-white group-hover:border-[#1e3a5f]/30"
          }`}>
            <Input 
              name="foto_carnet" 
              type="file" 
              accept="image/jpeg,image/png,image/jpg" 
              onChange={(e) => validarArchivo(e, 'foto')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
              required={!disabled} 
              disabled={disabled} 
            />
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto border border-slate-100 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6 text-[#1e3a5f]/40" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">Seleccionar Imagen</p>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">JPG o PNG hasta 2MB</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50/50 rounded-2xl border border-amber-100/30">
            <AlertTriangle className="h-4 w-4 text-[#d4a843] shrink-0" />
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-tighter leading-tight">
              Fondo blanco y buena iluminación para agilizar la validación.
            </p>
          </div>
        </div>

        {/* CARGADOR 2: CÉDULA */}
        <div className="p-8 bg-white border-2 border-slate-50 rounded-[3rem] shadow-sm space-y-6 group transition-all duration-300 hover:border-[#1e3a5f]/10">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
              <FileText className="h-4 w-4 text-[#d4a843]" /> Cédula de Identidad
            </Label>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter ml-1">Copia digital del documento de identidad</p>
          </div>
          
          <div className={`relative p-8 border-2 border-dashed rounded-[2rem] transition-all duration-500 flex flex-col items-center justify-center text-center ${
            disabled 
              ? "border-slate-100 bg-slate-50/50" 
              : "border-slate-200 bg-slate-50/30 group-hover:bg-white group-hover:border-[#1e3a5f]/30"
          }`}>
            <Input 
              name="copia_cedula" 
              type="file" 
              accept="application/pdf,image/jpeg,image/png,image/jpg" 
              onChange={(e) => validarArchivo(e, 'documento')}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
              required={!disabled} 
              disabled={disabled} 
            />
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto border border-slate-100 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-[#1e3a5f]/40" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#1e3a5f] uppercase tracking-widest">Seleccionar Documento</p>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">PDF, JPG o PNG hasta 2MB</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <ShieldCheck className="h-4 w-4 text-[#1e3a5f]/40 shrink-0" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-tight italic">
              Asegúrese de que el documento sea legible y esté vigente.
            </p>
          </div>
        </div>

      </div>

      {/* AVISO LEGAL DE PRIVACIDAD */}
      <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
        <p className="text-[10px] text-slate-400 leading-relaxed text-center font-bold uppercase tracking-[0.1em] max-w-2xl mx-auto">
          &bull; Los documentos cargados son almacenados bajo estrictos protocolos de seguridad institucional de la Universidad de Margarita y serán eliminados al finalizar el proceso de adjudicación académica.
        </p>
      </div>
    </div>
  )
}