import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface Props {
  user: any
  loadingSession: boolean
  disabled: boolean
  promedio: string
  onPromedioChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function SolicitudFormFields({ user, loadingSession, disabled, promedio, onPromedioChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Correo Institucional</Label>
        <div className="relative">
          <Input 
            type="email" name="email_institucional" value={user?.email || ""} readOnly 
            className="bg-gray-100 border-[#e2e8f0] font-bold text-[#1e3a5f] cursor-not-allowed italic pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loadingSession ? <Loader2 className="h-4 w-4 animate-spin text-[#d4a843]" /> : 
             disabled ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-[#8a9bbd]" />}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo Beca */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Tipo de Beca</Label>
          <Select name="tipoBeca" required disabled={disabled}>
            <SelectTrigger className="border-[#e2e8f0]"><SelectValue placeholder="Seleccionar beneficio" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Academica">Beca Académica</SelectItem>
              <SelectItem value="Socioeconomica">Beca Socioeconómica</SelectItem>
              <SelectItem value="Deportiva">Beca Deportiva</SelectItem>
              <SelectItem value="Excelencia">Beca a la Excelencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Promedio Controlado */}
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Promedio Actual</Label>
          <Input 
            name="promedio" type="number" step="0.01" placeholder="Ej: 18.50" className="border-[#e2e8f0]" required
            disabled={disabled}
            value={promedio}
            onChange={onPromedioChange}
            min={0} max={20}
          />
        </div>
      </div>

      {/* Motivo */}
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Motivo de la Solicitud</Label>
        <Textarea name="motivo" placeholder="Explique detalladamente su situación..." className="min-h-[120px] border-[#e2e8f0] resize-none" required disabled={disabled} />
      </div>
    </div>
  )
}