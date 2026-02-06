"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Send, GraduationCap, ClipboardList, FileText, BarChart, AlertCircle, UserCheck, Mail } from "lucide-react"
import { enviarSolicitud } from "@/lib/ActionsSolicitud"

export default function SolicitudesPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)

    const result = await enviarSolicitud(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Top bar institucional */}
      <div className="bg-[#1a2744]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f]">
              <span className="text-sm font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <span className="text-sm font-bold tracking-wide text-[#ffffff] font-serif">UNIMAR</span>
          </Link>
          <Link
            href="/requisitos"
            className="flex items-center gap-1.5 text-xs text-[#8a9bbd] transition-colors hover:text-[#ffffff]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Requisitos
          </Link>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="overflow-hidden rounded-lg bg-[#ffffff] shadow-xl">
            {/* Header */}
            <div className="bg-[#1e3a5f] px-8 py-8 text-center border-b-4 border-[#d4a843]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffffff]">
                <ClipboardList className="h-8 w-8 text-[#1e3a5f]" />
              </div>
              <h1 className="text-2xl font-bold text-[#ffffff] font-serif uppercase tracking-tight">Postulación de Beca</h1>
              <p className="mt-2 text-sm text-[#8a9bbd]">Vinculación de cuenta personal con credenciales institucionales</p>
            </div>

            <div className="px-8 py-10">
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-md bg-red-50 p-4 text-sm text-red-700 border-l-4 border-red-500">
                  <AlertCircle className="h-5 w-5" />
                  {error}
                </div>
              )}

              <form action={handleSubmit} className="space-y-6">
                
                {/* SECCIÓN 1: Identificación de Correos */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#1e3a5f] flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-[#d4a843]" /> Correo Personal (Registro)
                    </label>
                    <input
                      name="email_personal"
                      type="email"
                      placeholder="tu-correo@gmail.com"
                      className="w-full rounded-md border border-gray-200 bg-[#f8fafc] p-3 text-sm focus:border-[#1e3a5f] outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#1e3a5f] flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#d4a843]" /> Correo Institucional (Intranet)
                    </label>
                    <input
                      name="email_institucional"
                      type="email"
                      placeholder="usuario@unimar.edu.ve"
                      className="w-full rounded-md border border-gray-200 bg-[#f8fafc] p-3 text-sm focus:border-[#1e3a5f] outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* SECCIÓN 2: Detalles Académicos */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#1e3a5f] flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-[#d4a843]" /> Tipo de Beca
                    </label>
                    <select
                      name="tipoBeca"
                      className="w-full rounded-md border border-gray-200 bg-[#f8fafc] p-3 text-sm focus:border-[#1e3a5f] outline-none"
                      required
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="Academica">Beca Académica (Honor)</option>
                      <option value="Socioeconomica">Beca Socio-Económica</option>
                      <option value="Deportiva">Beca Deportiva</option>
                      <option value="Cultural">Beca Cultural</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-[#1e3a5f] flex items-center gap-2">
                      <BarChart className="h-3.5 w-3.5 text-[#d4a843]" /> Promedio Actual
                    </label>
                    <input
                      name="promedio"
                      type="number"
                      step="0.01"
                      min="0"
                      max="20"
                      placeholder="0.00"
                      className="w-full rounded-md border border-gray-200 bg-[#f8fafc] p-3 text-sm focus:border-[#1e3a5f] outline-none"
                      required
                    />
                  </div>
                </div>

                {/* SECCIÓN 3: Justificación */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-[#1e3a5f]">Motivo de la Solicitud</label>
                  <textarea
                    name="motivo"
                    rows={4}
                    placeholder="Explique los motivos de su solicitud para la validación institucional..."
                    className="w-full rounded-md border border-gray-200 bg-[#f8fafc] p-3 text-sm outline-none focus:border-[#1e3a5f] resize-none"
                    required
                  ></textarea>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-[#1e3a5f] py-4 text-sm font-bold text-white transition-all hover:bg-[#162d4a] active:scale-[0.98] disabled:opacity-70 shadow-lg"
                >
                  <Send className="h-4 w-4 text-[#d4a843]" />
                  {isPending ? "ENVIANDO DATOS..." : "ENVIAR SOLICITUD"}
                </button>

                <p className="text-[10px] text-center text-gray-500 italic">
                  Nota: Las notificaciones sobre el estatus de su beca serán enviadas exclusivamente a su correo institucional (@unimar.edu.ve).
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#111b2e] py-4">
        <p className="text-center text-[10px] text-[#4a5d7a]">
          Universidad de Margarita - Sistema de Gestión de Becas 2026.
        </p>
      </div>
    </div>
  )
}