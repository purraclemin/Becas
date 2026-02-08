"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getSession } from "@/lib/ActionsSession"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  FileText, 
  Send, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  Home,
  CheckCircle2,
  Download
} from "lucide-react"

export default function SolicitudPage() {
  const [user, setUser] = useState<any>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [promedio, setPromedio] = useState("")
  
  const { toast } = useToast()

  // Carga de sesión al montar el componente
  useEffect(() => {
    async function loadSession() {
      const sessionData = await getSession()
      setUser(sessionData)
      setLoadingSession(false)
    }
    loadSession()
  }, [])

  const tieneSolicitudActiva = user?.estatusBeca && user?.estatusBeca !== 'ninguna'

  // Validación de promedio en tiempo real (0-20)
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
    
    const valorPromedio = parseFloat(promedio)
    if (isNaN(valorPromedio) || valorPromedio < 0 || valorPromedio > 20) {
        toast({ variant: "destructive", title: "Promedio inválido", description: "El promedio debe estar entre 0 y 20." })
        setIsPending(false)
        return
    }

    if (user?.id) {
      formData.append('user_id', user.id)
    }

    try {
      const result = await enviarSolicitud(formData)
      if (result?.error) {
        toast({ variant: "destructive", title: "Error", description: result.error })
      } else {
        window.location.href = "/solicitud-enviada"
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Ocurrió un error inesperado." })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl animate-in fade-in duration-500">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
            Volver al Inicio
          </Button>
        </Link>
        <div className="text-[#1e3a5f] font-black text-xs uppercase tracking-widest hidden sm:block">
          Unimar • Sistema de Becas
        </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden">
        {/* HEADER INSTITUCIONAL */}
        <div className="bg-[#1e3a5f] p-8 text-center border-b-4 border-[#d4a843]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <FileText className="h-8 w-8 text-[#1e3a5f]" />
          </div>
          <CardTitle className="text-2xl font-black text-white uppercase tracking-tight font-serif">
            Nueva Solicitud de Beca
          </CardTitle>
          <p className="text-[#8a9bbd] text-xs uppercase tracking-widest mt-2 font-bold italic">
            Universidad de Margarita
          </p>
        </div>

        <CardContent className="p-8">
          {/* AVISO DE SOLICITUD ACTIVA */}
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

          <form onSubmit={handleSubmit} className={`space-y-6 ${tieneSolicitudActiva ? "opacity-50 pointer-events-none" : ""}`}>
            
            {/* EMAIL (READ ONLY) */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Correo Institucional</Label>
              <div className="relative">
                <Input 
                  type="email" 
                  name="email_institucional"
                  value={user?.email || ""} 
                  readOnly 
                  className="bg-gray-100 border-[#e2e8f0] font-bold text-[#1e3a5f] cursor-not-allowed italic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TIPO DE BECA */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Tipo de Beca</Label>
                <Select name="tipoBeca" required disabled={tieneSolicitudActiva}>
                  <SelectTrigger className="border-[#e2e8f0]">
                    <SelectValue placeholder="Seleccionar beneficio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Academica">Beca Académica</SelectItem>
                    <SelectItem value="Socioeconomica">Beca Socioeconómica</SelectItem>
                    <SelectItem value="Deportiva">Beca Deportiva</SelectItem>
                    <SelectItem value="Excelencia">Beca a la Excelencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* PROMEDIO */}
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Promedio Actual</Label>
                <Input 
                  name="promedio"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 18.50"
                  className="border-[#e2e8f0]"
                  required
                  disabled={tieneSolicitudActiva}
                  value={promedio}
                  onChange={handlePromedioChange}
                />
              </div>
            </div>

            {/* MOTIVO */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]">Motivo de la Solicitud</Label>
              <Textarea 
                name="motivo"
                placeholder="Explique detalladamente su situación..." 
                className="min-h-[120px] border-[#e2e8f0] resize-none"
                required
                disabled={tieneSolicitudActiva}
              />
            </div>

            {/* SECCIÓN DE RECAUDOS */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-xs font-black text-[#d4a843] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Upload className="h-4 w-4" /> Carga de Recaudos (PDF o Imagen)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* BLOQUE DE DESCARGA DE PLANILLA */}
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

                {/* INPUTS DE ARCHIVOS */}
                <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition-colors">
                  <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Foto Tipo Carnet</Label>
                  <Input name="foto_carnet" type="file" accept="image/*" className="text-xs" required disabled={tieneSolicitudActiva} />
                </div>

                <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition-colors">
                  <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Cédula de Identidad</Label>
                  <Input name="copia_cedula" type="file" accept="application/pdf,image/*" className="text-xs" required disabled={tieneSolicitudActiva} />
                </div>
                
                <div className="p-4 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition-colors md:col-span-2">
                  <Label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Planilla de Solicitud (Llenada y Firmada)</Label>
                  <Input name="planilla_inscripcion" type="file" accept="application/pdf,image/*" className="text-xs" required disabled={tieneSolicitudActiva} />
                </div>
              </div>
            </div>

            {/* BOTÓN DE ENVÍO */}
            <Button 
              type="submit"
              disabled={isPending || loadingSession || tieneSolicitudActiva}
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
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#8a9bbd] hover:text-[#1e3a5f] transition-colors uppercase tracking-widest">
          <Home className="h-3 w-3" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  )
}