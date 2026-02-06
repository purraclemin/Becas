"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react"
import { login } from "@/lib/Actionslogin"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    setError(null)
    
    try {
      // ⚠️ AGREGADO: El Server Action 'login' ahora es quien crea las cookies 
      // de 'session_token' y 'user_role' internamente.
      const result = await login(formData)
      
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } catch (e) {
      // Si el login redirige (comportamiento normal de Next.js), el catch lo ignora
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Top bar */}
      <div className="bg-[#1a2744]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f]">
              <span className="text-sm font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <span className="text-sm font-bold tracking-wide text-[#ffffff] font-serif">UNIMAR</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#8a9bbd] transition-colors hover:text-[#ffffff]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al Inicio
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-lg bg-[#ffffff] shadow-xl border-t-4 border-[#d4a843]">
            {/* Header */}
            <div className="bg-[#1e3a5f] px-8 py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4a843] bg-[#1e3a5f]">
                <span className="text-2xl font-extrabold text-[#d4a843] font-serif">U</span>
              </div>
              <h1 className="text-xl font-bold text-[#ffffff] font-serif uppercase tracking-tight">Iniciar Sesión</h1>
              <p className="mt-1 text-sm text-[#8a9bbd]">
                Sistema de Gestión de Becas - UNIMAR
              </p>
            </div>

            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <form action={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    Correo Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="usuario@unimar.edu.ve"
                      className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-10 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-[#6b7280]">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-[#d1d5db] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                    />
                    Recordarme
                  </label>
                  <Link href="#" className="text-xs font-medium text-[#1e3a5f] hover:text-[#d4a843]">
                    Olvidé mi contraseña
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1e3a5f] py-2.5 text-sm font-semibold text-[#ffffff] transition-colors hover:bg-[#162d4a] disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  {isPending ? "Verificando..." : "Acceder al Sistema"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#6b7280]">
                {"¿No tienes una cuenta? "}
                <Link href="/registro" className="font-semibold text-[#1e3a5f] hover:text-[#d4a843] transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#9ca3af]">
            {"Si tienes problemas para acceder, contacta a "}
            <Link href="mailto:becas@unimar.edu.ve" className="text-[#1e3a5f] underline hover:text-[#d4a843]">
              becas@unimar.edu.ve
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#111b2e] py-3">
        <p className="text-center text-[10px] text-[#4a5d7a] font-bold uppercase tracking-tighter">
          {"Copyright 2001-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela."}
        </p>
      </div>
    </div>
  )
}