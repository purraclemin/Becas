"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight, FileText, Mail, Download, Home } from "lucide-react"
import { useState, useEffect } from "react" // <--- 1. Agregamos estos hooks

export default function SolicitudEnviadaPage() {
  // 2. Usamos un estado para guardar el número
  const [numeroTramite, setNumeroTramite] = useState<number | string>("...")

  // 3. Generamos el número aleatorio SOLO cuando la página ya cargó en el navegador
  useEffect(() => {
    setNumeroTramite(Math.floor(Math.random() * 90000) + 10000)
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Top bar */}
      <div className="bg-[#1a2744] shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a5f] border border-[#d4a843]">
              <span className="text-lg font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <span className="text-base font-bold tracking-wide text-white font-serif">UNIMAR</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="overflow-hidden rounded-xl bg-white shadow-2xl border-t-4 border-[#d4a843]">
            {/* Icono de Éxito animado o destacado */}
            <div className="bg-[#f8fafc] py-10 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-green-100 opacity-75"></div>
                <CheckCircle className="relative h-20 w-20 text-green-500" />
              </div>
            </div>

            <div className="px-8 pb-10 pt-4 text-center">
              <h1 className="text-2xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">
                ¡Postulación Recibida!
              </h1>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Tu solicitud de beneficio estudiantil ha sido registrada exitosamente en nuestro sistema. 
                Hemos vinculado tu cuenta personal con tu identidad institucional.
              </p>

              {/* Recuadro de información de trámite */}
              <div className="mt-8 rounded-lg border border-dashed border-[#d4a843] bg-[#d4a843]/5 p-6 text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]/60">Detalles del Trámite</span>
                  {/* Aquí se mostrará el número de forma segura */}
                  <span className="rounded bg-[#1e3a5f] px-2 py-1 text-[10px] font-bold text-white"># {numeroTramite}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-[#d4a843] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1e3a5f]">Notificación Enviada</p>
                      <p className="text-[11px] text-gray-500">Se ha enviado un acuse de recibo a tu correo institucional.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-[#d4a843] mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#1e3a5f]">Estatus Actual</p>
                      <p className="text-[11px] font-semibold text-orange-600">Pendiente por Revisión</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-8 flex flex-col gap-3">
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#e2e8f0] py-3 text-sm font-bold text-[#1e3a5f] hover:bg-gray-50 transition-all"
                >
                  <Download className="h-4 w-4" /> Descargar Comprobante (PDF)
                </button>
                
                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] py-3 text-sm font-bold text-white hover:bg-[#162d4a] transition-all shadow-md"
                >
                  <Home className="h-4 w-4 text-[#d4a843]" /> Volver al Inicio
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          <p className="mt-6 text-center text-[10px] text-gray-400 uppercase tracking-[0.2em]">
            Universidad de Margarita &bull; Decanato de Estudiantes
          </p>
        </div>
      </div>
    </div>
  )
}