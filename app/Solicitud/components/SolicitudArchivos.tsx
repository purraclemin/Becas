import { Upload, CheckCircle2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function SolicitudArchivos({ disabled, user }: { disabled: boolean, user?: any }) {
  return (
    <div className="pt-4 border-t border-gray-100">
      <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Upload className="h-4 w-4" /> Carga de Recaudos (PDF o Imagen)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Foto Tipo Carnet */}
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 transition-all">
          <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Foto Tipo Carnet</Label>
          {user?.foto_url ? (
            <div className="flex h-9 w-full items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4" />
                <span className="uppercase tracking-wide text-[10px]">Archivo Cargado</span>
            </div>
          ) : (
            <Input 
                name="foto_carnet" 
                type="file" 
                accept="image/*" 
                className="text-xs bg-white" 
                required={!user?.foto_url && !disabled} 
                disabled={disabled} 
            />
          )}
        </div>

        {/* Cédula de Identidad */}
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 transition-all">
          <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Cédula de Identidad</Label>
          {user?.cedula_url ? (
            <div className="flex h-9 w-full items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4" />
                <span className="uppercase tracking-wide text-[10px]">Archivo Cargado</span>
            </div>
          ) : (
            <Input 
                name="copia_cedula" 
                type="file" 
                accept="application/pdf,image/*" 
                className="text-xs bg-white" 
                required={!user?.cedula_url && !disabled} 
                disabled={disabled} 
            />
          )}
        </div>

        {/* Planilla de Inscripción */}
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 md:col-span-2 transition-all">
          <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Planilla de Inscripción</Label>
          {user?.planilla_url ? (
            <div className="flex h-9 w-full items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 shadow-sm animate-in fade-in duration-300">
                <CheckCircle2 className="h-4 w-4" />
                <span className="uppercase tracking-wide text-[10px]">Archivo Cargado</span>
            </div>
          ) : (
            <Input 
                name="planilla_inscripcion" 
                type="file" 
                accept="application/pdf,image/*" 
                className="text-xs bg-white" 
                required={!user?.planilla_url && !disabled} 
                disabled={disabled} 
            />
          )}
        </div>
      </div>
    </div>
  )
}