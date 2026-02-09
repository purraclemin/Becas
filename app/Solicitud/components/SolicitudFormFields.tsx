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
import { SolicitudArchivos } from "./SolicitudArchivos"
import { SolicitudMaterias } from "./SolicitudMaterias" // Nuevo Componente Importado
import { 
  FileText, Send, AlertCircle, Loader2, 
  Mail, BookOpen, GraduationCap, CheckCircle2,
  Clock, Lock
} from "lucide-react"

// Recibimos al usuario directamente desde la Page (Server)
export function SolicitudForm({ user }: { user: any }) {
  const [isPending, setIsPending] = useState(false)
  // 🟢 AUTOCAMPLETADO: Inicializamos con el promedio de la base de datos si existe
  const [promedio, setPromedio] = useState(user?.promedio_notas?.toString() || "")
  const { toast } = useToast()
  const router = useRouter()

  // Verificamos si ya tiene una solicitud activa (Pendiente o En Revisión)
  const tieneSolicitudActiva = user?.estatusBeca === 'Pendiente' || user?.estatusBeca === 'En Revisión';
  const esRevision = user?.estatusBeca === 'En Revisión';

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
      {/* 🟢 AVISO INTEGRADO: Solo muestra un pequeño banner informativo si está en trámite */}
      {tieneSolicitudActiva && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
            esRevision ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-yellow-50 border-yellow-200 text-yellow-900'
        }`}>
            {esRevision ? <Clock className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <div>
                <p className="text-xs font-black uppercase tracking-wide">
                    {esRevision ? 'Su Solicitud está en Revisión' : 'Solicitud Pendiente'}
                </p>
                <p className="text-[10px] font-medium opacity-80 leading-tight">
                    Tu trámite está en curso. Los datos no pueden ser modificados en este momento.
                </p>
            </div>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className={`space-y-6 relative ${tieneSolicitudActiva ? "opacity-60 pointer-events-none select-none" : ""}`}>
        
        {/* Capa de bloqueo visual si está activo */}
        {tieneSolicitudActiva && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-[1px] px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Formulario Bloqueado</span>
                </div>
            </div>
        )}

        {/* --- DATOS DEL ESTUDIANTE --- */}
        <div className="space-y-6">
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 🟢 AUTOCAMPLETADO: Tipo de Beca */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f] flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-[#d4a843]" /> Tipo de Beca
              </Label>
              <Select name="tipoBeca" required disabled={tieneSolicitudActiva} defaultValue={user?.tipo_beca}>
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

          {/* 🟢 AUTOCAMPLETADO: Motivo */}
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
              defaultValue={user?.motivo_solicitud}
            />
          </div>
        </div>

        {/* 🟢 NUEVO COMPONENTE: Lista Dinámica de Materias */}
        <SolicitudMaterias disabled={tieneSolicitudActiva} materiasGuardadas={user?.materias} />

        {/* 🟢 COMPONENTE DE ARCHIVOS: Muestra "Cargado" si ya existe */}
        <SolicitudArchivos disabled={tieneSolicitudActiva} user={user} />

        <Button 
          type="submit"
          disabled={isPending || tieneSolicitudActiva}
          className={`w-full py-6 shadow-xl transition-all font-black uppercase tracking-widest ${
            tieneSolicitudActiva 
            ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
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