"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, LogIn, Mail, Lock, ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
// IMPORTANTE: Asegúrate de importar desde el archivo correcto que creamos anteriormente
import { login } from "@/lib/ActionsAuth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    // Prevenimos la recarga por defecto para manejar la respuesta del servidor
    e.preventDefault()
    setIsPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)

    try {
      // Llamamos a la Server Action
      const result = await login(formData)
      
      if (result?.error) {
        // Si hay error (contraseña mal, usuario no existe), lo mostramos
        setError(result.error)
        setIsPending(false)
      } else if (result?.success) {
        // SI ES EXITOSO: Redirigimos según el rol que nos devolvió la base de datos
        // Esto separa a los administradores de los estudiantes
        if (result.role === 'admin') {
           window.location.replace("/admin/dashboard")
        } else {
           window.location.replace("/Solicitud") 
           // O "/estudiante/perfil" según tus rutas
        }
      }
    } catch (e) {
      setError("Error de conexión. Intente nuevamente.")
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      {/* Barra Superior Institucional */}
      <div className="bg-[#1a2744]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] shadow-sm">
              <span className="text-sm font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <span className="text-sm font-bold tracking-wide text-[#ffffff] font-serif uppercase tracking-widest">UNIMAR</span>
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

      {/* Contenido Principal */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="overflow-hidden rounded-xl bg-[#ffffff] shadow-2xl border-t-4 border-[#d4a843]">
            
            {/* Cabecera del Card */}
            <div className="bg-[#1e3a5f] px-8 py-8 text-center relative">
              {/* Línea dorada decorativa */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#d4a843]"></div>
              
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4a843] bg-[#1e3a5f] shadow-lg">
                <span className="text-2xl font-extrabold text-[#d4a843] font-serif">U</span>
              </div>
              <h1 className="text-xl font-bold text-[#ffffff] font-serif uppercase tracking-tight">Iniciar Sesión</h1>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#8a9bbd]">
                Sistema de Gestión de Becas
              </p>
            </div>

            <div className="px-8 py-8">
              {/* Mensaje de Error */}
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-xs font-bold text-red-700 border-l-4 border-red-500 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Input Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">
                    Correo Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="usuario@unimar.edu.ve"
                      className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-4 text-sm font-medium text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-all focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20"
                      required
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-[#6b7280] ml-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      className="w-full rounded-lg border border-[#e2e8f0] bg-[#fcfdfe] py-3 pl-10 pr-10 text-sm font-medium text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-all focus:border-[#d4a843] focus:ring-1 focus:ring-[#d4a843]/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1e3a5f] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#6b7280] cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-[#d1d5db] text-[#1e3a5f] focus:ring-[#d4a843]"
                    />
                    Recordarme
                  </label>
                  <Link href="#" className="text-[10px] font-black uppercase text-[#1e3a5f] hover:text-[#d4a843] transition-colors">
                    ¿Olvidaste tu clave?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] py-3 text-xs font-black uppercase tracking-widest text-[#ffffff] transition-all hover:bg-[#162d4a] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Verificando...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" /> Acceder al Sistema
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center border-t border-[#e2e8f0] pt-6">
                <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">
                  {"¿No tienes una cuenta? "}
                  <Link href="/registro" className="font-black text-[#1e3a5f] hover:text-[#d4a843] transition-colors">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
             Si tienes problemas, contacta a <a href="mailto:soporte@unimar.edu.ve" className="text-[#1e3a5f] underline decoration-[#d4a843]">soporte@unimar.edu.ve</a>
          </p>
        </div>
      </div>

      {/* Footer Legal */}
      <div className="bg-[#111b2e] py-4 border-t border-[#1e3a5f]">
        <p className="text-center text-[9px] text-[#4a5d7a] font-black uppercase tracking-[0.2em]">
          © 2026 Universidad de Margarita • RIF: J-30660040-0 • Isla de Margarita
        </p>
      </div>
    </div>
  )
}