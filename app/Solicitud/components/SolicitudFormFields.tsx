"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, FileText, Send, AlertCircle, Loader2, Download, 
  Mail, BookOpen, GraduationCap, CheckCircle2 
} from "lucide-react"

// Recibimos al usuario directamente desde la Page (Server)
export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  // Verificamos si ya tiene una solicitud activa
  const tieneSolicitudActiva = user?.estatusBeca && user?.estatusBeca !== 'ninguna'

  // Control del input de promedio (0-20)
  const handlePromedioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setPromedio("")
      return
    }
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0 && num <= 20) {
      setPromedio(value)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (tieneSolicitudActiva) {
      toast({
        variant: "destructive",
        title: "Acción no permitida",
        description: "Ya tienes una solicitud en curso.",
      })
      return
    }

    setIsPending(true)
    const formData = new FormData(e.currentTarget)
    
    // Validación final antes de enviar
    const valorPromedio = parseFloat(promedio)
    if (isNaN(valorPromedio) || valorPromedio < 0 || valorPromedio > 20) {
        toast({ variant: "destructive", title: "Promedio inválido", description: "Verifique el valor ingresado." })
        setIsPending(false)
        return
    }

    // Adjuntamos el ID del usuario de forma segura
    if (user?.id) {
      formData.append('user_id', user.id)
    }

    try {
      const result = await enviarSolicitud(formData)
      
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        // ¡Éxito! Redirigimos a la página de confirmación
        router.push("/solicitud-enviada") 
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error inesperado." })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <>
      {/* AVISO DE SOLICITUD ACTIVA (Si ya tiene una) */}
      {tieneSolicitudActiva && (
        <div className="mb-8 p-6 rounded-xl border-2 border-dashed border-yellow-400 bg-yellow-50 flex flex-col items-center text-center gap-3 animate-in zoom-in duration-300">
          <AlertCircle className="h-8 w-8 text-yellow-600" />
          <div>
            <p className="text-sm font-black text-[#1e3a5f] uppercase">Solicitud en trámite</p>
            <p className="text-xs text-yellow-800 font-medium mt-1">
              Tu solicitud actual tiene estatus: <b>{user.estatusBeca}</b>. 
            </p>
          </div>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className={`space-y-6 ${tieneSolicitudActiva ? "opacity-50 pointer-events-none" : ""}`}>
        
        {/* --- DATOS DEL ESTUDIANTE --- */}
        <div className="space-y-6">
           {/* 1. CORREO INSTITUCIONAL */}
           <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2">
              <Mail className="h-3 w-3 text-[#d4a843]" /> Correo Institucional
            </Label>
            <div className="relative group">
              <Input 
                type="email" 
                name="email_institucional" 
                defaultValue={user?.email || ""} 
                readOnly 
                className="bg-slate-100 border-[#e2e8f0] font-bold text-[#1e3a5f] cursor-not-allowed italic pr-10 focus-visible:ring-0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2" title="Usuario Verificado">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. TIPO DE BECA */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-[#d4a843]" /> Tipo de Beca
              </Label>
              <Select name="tipoBeca" required disabled={tieneSolicitudActiva}>
                <SelectTrigger className="border-[#e2e8f0] bg-white text-xs font-medium text-[#1e3a5f]">
                  <SelectValue placeholder="Seleccionar beneficio..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academica">Beca Académica</SelectItem>
                  <SelectItem value="Socioeconomica">Beca Socioeconómica</SelectItem>
                  <SelectItem value="Deportiva">Beca Deportiva</SelectItem>
                  <SelectItem value="Excelencia">Beca a la Excelencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. PROMEDIO ACADÉMICO */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2">
                <GraduationCap className="h-3 w-3 text-[#d4a843]" /> Promedio Actual
              </Label>
              <div className="relative">
                <Input 
                  name="promedio" 
                  type="number" 
                  step="0.01" 
                  min={0} 
                  max={20}
                  placeholder="Ej: 18.50" 
                  className="border-[#e2e8f0] bg-white text-xs font-bold text-[#1e3a5f]" 
                  required
                  disabled={tieneSolicitudActiva}
                  value={promedio}
                  onChange={handlePromedioChange}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
                  PTS
                </span>
              </div>
            </div>
          </div>

          {/* 4. MOTIVO DE SOLICITUD */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2">
               <FileText className="h-3 w-3 text-[#d4a843]" /> Motivo de la Solicitud
            </Label>
            <Textarea 
              name="motivo" 
              placeholder="Explique detalladamente su situación académica y socioeconómica..." 
              className="min-h-[120px] border-[#e2e8f0] resize-none text-xs bg-white text-slate-700 leading-relaxed" 
              required 
              disabled={tieneSolicitudActiva} 
            />
          </div>
        </div>

        {/* --- SECCIÓN DE ARCHIVOS --- */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4" /> Carga de Recaudos (PDF o Imagen)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Descarga Planilla */}
            <div className="md:col-span-2 bg-[#f0f9ff] border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                  <FileText className="h-6 w-6 text-[#1e3a5f]" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase text-[#1e3a5f] tracking-wide">Paso 1: Descargar Formato</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight">Llene y firme la planilla antes de subirla.</p>
                </div>
              </div>
              
              <a href="/formatos/planilla-solicitud-beca.pdf" download="planilla-solicitud-beca.pdf" target="_blank" rel="noopener noreferrer">
                <Button type="button" size="sm" className="bg-[#1e3a5f] hover:bg-[#2d4f7c] text-white text-[10px] font-bold uppercase gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Descargar Planilla
                </Button>
              </a>
            </div>

            {/* Inputs de Archivo - Componente Interno */}
            <FileInput label="Foto Tipo Carnet" name="foto_carnet" disabled={tieneSolicitudActiva} />
            <FileInput label="Cédula de Identidad" name="copia_cedula" disabled={tieneSolicitudActiva} />
            
            <div className="md:col-span-2">
              <FileInput label="Planilla de Solicitud (Llenada y Firmada)" name="planilla_inscripcion" disabled={tieneSolicitudActiva} />
            </div>
          </div>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <Button 
          type="submit"
          disabled={isPending || tieneSolicitudActiva}
          className={`w-full py-6 shadow-xl transition-all font-black uppercase tracking-widest ${
            tieneSolicitudActiva 
            ? "bg-gray-300 text-gray-500" 
            : "bg-[#1e3a5f] hover:bg-[#152944] text-[#d4a843]"
          }`}
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {tieneSolicitudActiva ? "Solicitud en proceso" : isPending ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </form>
    </>
  )
}

// Subcomponente simple para inputs de archivo (Para no repetir código)
function FileInput({ label, name, disabled }: any) {
  return (
    <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition-colors">
      <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">{label}</Label>
      <Input name={name} type="file" accept="application/pdf,image/*" className="text-xs" required disabled={disabled} />
    </div>
  )
}