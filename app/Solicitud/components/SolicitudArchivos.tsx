import { Upload } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function SolicitudArchivos({ disabled }: { disabled: boolean }) {
  return (
    <div className="pt-4 border-t border-gray-100">
      <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest mb-4 flex items-center gap-2">
        <Upload className="h-4 w-4" /> Carga de Recaudos (PDF o Imagen)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Foto Tipo Carnet</Label>
          <Input name="foto_carnet" type="file" accept="image/*" className="text-xs bg-white" required disabled={disabled} />
        </div>
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
          <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Cédula de Identidad</Label>
          <Input name="copia_cedula" type="file" accept="application/pdf,image/*" className="text-xs bg-white" required disabled={disabled} />
        </div>
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 md:col-span-2">
          <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Planilla de Inscripción</Label>
          <Input name="planilla_inscripcion" type="file" accept="application/pdf,image/*" className="text-xs bg-white" required disabled={disabled} />
        </div>
      </div>
    </div>
  )
}