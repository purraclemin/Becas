"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, UserPlus, Mail, Lock, User, CreditCard, Phone, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import { register } from "@/lib/actionsregistro" // Importación de tu nueva acción

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    carrera: "",
    semestre: "",
    aceptaTerminos: false,
  })

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Función para procesar el formulario paso a paso o enviar a la BD
  async function handleFormAction(formData: FormData) {
    if (step < 3) {
      setStep(step + 1)
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const result = await register(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } catch (e) {
      // Next.js manejará la redirección automáticamente si tiene éxito
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
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="overflow-hidden rounded-lg bg-[#ffffff] shadow-xl">
            {/* Header */}
            <div className="bg-[#1e3a5f] px-8 py-6 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d4a843] bg-[#1e3a5f]">
                <span className="text-xl font-extrabold text-[#d4a843] font-serif">U</span>
              </div>
              <h1 className="text-xl font-bold text-[#ffffff] font-serif">Crear Cuenta</h1>
              <p className="mt-1 text-sm text-[#8a9bbd]">
                Registrate en el Sistema de Gestion de Becas
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-8 py-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  step === 1
                    ? "bg-[#1e3a5f] text-[#ffffff]"
                    : step > 1
                      ? "bg-[#d4a843]/20 text-[#1e3a5f]"
                      : "bg-[#e2e8f0] text-[#9ca3af]"
                }`}
              >
                {step > 1 ? <CheckCircle2 className="h-3 w-3" /> : <span>1</span>}
                Datos Personales
              </button>
              <div className="h-px w-6 bg-[#d1d5db]" />
              <button
                type="button"
                onClick={() => setStep(2)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  step === 2
                    ? "bg-[#1e3a5f] text-[#ffffff]"
                    : step > 2
                      ? "bg-[#d4a843]/20 text-[#1e3a5f]"
                      : "bg-[#e2e8f0] text-[#9ca3af]"
                }`}
              >
                {step > 2 ? <CheckCircle2 className="h-3 w-3" /> : <span>2</span>}
                Academicos
              </button>
              <div className="h-px w-6 bg-[#d1d5db]" />
              <button
                type="button"
                onClick={() => setStep(3)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  step === 3
                    ? "bg-[#1e3a5f] text-[#ffffff]"
                    : "bg-[#e2e8f0] text-[#9ca3af]"
                }`}
              >
                <span>3</span>
                Seguridad
              </button>
            </div>

            {/* Form */}
            <div className="px-8 py-6">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}

              <form action={handleFormAction} className="flex flex-col gap-4">
                {/* Step 1: Personal Data */}
                {step === 1 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="nombre" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                          Nombre
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                          <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            value={form.nombre}
                            onChange={(e) => updateField("nombre", e.target.value)}
                            placeholder="Juan"
                            className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="apellido" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                          Apellido
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                          <input
                            id="apellido"
                            name="apellido"
                            type="text"
                            value={form.apellido}
                            onChange={(e) => updateField("apellido", e.target.value)}
                            placeholder="Perez"
                            className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cedula" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Cedula de Identidad
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          id="cedula"
                          name="cedula"
                          type="text"
                          value={form.cedula}
                          onChange={(e) => updateField("cedula", e.target.value)}
                          placeholder="V-12345678"
                          className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="telefono" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Telefono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={form.telefono}
                          onChange={(e) => updateField("telefono", e.target.value)}
                          placeholder="0412-1234567"
                          className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                          required
                        />
                      </div>
                    </div>

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
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="usuario@unimar.edu.ve"
                          className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-4 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Academic Data */}
                {step === 2 && (
                  <>
                    <div>
                      <label htmlFor="carrera" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Carrera
                      </label>
                      <select
                        id="carrera"
                        name="carrera"
                        value={form.carrera}
                        onChange={(e) => updateField("carrera", e.target.value)}
                        className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#1e3a5f] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                        required
                      >
                        <option value="">Selecciona tu carrera</option>
                        <option value="ingenieria-sistemas">Ingenieria de Sistemas</option>
                        <option value="administracion">Administracion de Empresas</option>
                        <option value="contaduria">Contaduria Publica</option>
                        <option value="derecho">Derecho</option>
                        <option value="psicologia">Psicologia</option>
                        <option value="educacion">Educacion</option>
                        <option value="ingenieria-industrial">Ingenieria Industrial</option>
                        <option value="arquitectura">Arquitectura</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="semestre" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Semestre Actual
                      </label>
                      <select
                        id="semestre"
                        name="semestre"
                        value={form.semestre}
                        onChange={(e) => updateField("semestre", e.target.value)}
                        className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm text-[#1e3a5f] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                        required
                      >
                        <option value="">Selecciona tu semestre</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                          <option key={s} value={s}>
                            {s}to Semestre
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Info box */}
                    <div className="rounded-md border border-[#d4a843]/30 bg-[#d4a843]/5 px-4 py-3">
                      <p className="text-xs leading-relaxed text-[#6b7280]">
                        <span className="font-semibold text-[#1e3a5f]">Nota:</span>{" "}
                        Debes ser estudiante regular de pregrado inscrito en el semestre actual para poder solicitar una beca. Tu informacion academica sera verificada por la Direccion de Control de Estudios.
                      </p>
                    </div>
                  </>
                )}

                {/* Step 3: Security */}
                {step === 3 && (
                  <>
                    <div>
                      <label htmlFor="reg-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Contrasena
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          id="reg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => updateField("password", e.target.value)}
                          placeholder="Minimo 8 caracteres"
                          className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-10 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                          aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["8+ caracteres", "Mayuscula", "Numero", "Especial"].map((hint) => (
                          <span key={hint} className="rounded-full bg-[#f0f4f8] px-2 py-0.5 text-[10px] text-[#9ca3af]">
                            {hint}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Confirmar Contrasena
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                        <input
                          id="confirm-password"
                          type={showConfirm ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={(e) => updateField("confirmPassword", e.target.value)}
                          placeholder="Repite tu contrasena"
                          className="w-full rounded-md border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-10 pr-10 text-sm text-[#1e3a5f] placeholder-[#9ca3af] outline-none transition-colors focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280]"
                          aria-label={showConfirm ? "Ocultar contrasena" : "Mostrar contrasena"}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <label className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={form.aceptaTerminos}
                        onChange={(e) => updateField("aceptaTerminos", e.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-[#d1d5db] text-[#1e3a5f] focus:ring-[#1e3a5f]"
                        required
                      />
                      <span className="text-xs leading-relaxed text-[#6b7280]">
                        {"Acepto los "}
                        <Link href="#" className="font-medium text-[#1e3a5f] underline hover:text-[#d4a843]">
                          Terminos y Condiciones
                        </Link>
                        {" y la "}
                        <Link href="#" className="font-medium text-[#1e3a5f] underline hover:text-[#d4a843]">
                          Politica de Privacidad
                        </Link>
                        {" del Sistema de Gestion de Becas de UNIMAR."}
                      </span>
                    </label>
                  </>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center gap-3 pt-2">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 rounded-md border border-[#e2e8f0] bg-[#ffffff] py-2.5 text-sm font-semibold text-[#374151] transition-colors hover:bg-[#f8fafc]"
                    >
                      Anterior
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isPending}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-semibold transition-colors ${
                      step === 3 
                        ? "bg-[#d4a843] text-[#1e3a5f] hover:bg-[#c49a3a]" 
                        : "bg-[#1e3a5f] text-[#ffffff] hover:bg-[#162d4a]"
                    } disabled:opacity-70`}
                  >
                    {step < 3 ? "Siguiente" : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        {isPending ? "Registrando..." : "Crear Cuenta"}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Login link */}
              <p className="mt-6 text-center text-sm text-[#6b7280]">
                {"Ya tienes una cuenta? "}
                <Link href="/login" className="font-semibold text-[#1e3a5f] hover:text-[#d4a843]">
                  Inicia sesion
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-[#9ca3af]">
            {"Si tienes problemas para registrarte, contacta a "}
            <Link href="mailto:becas@unimar.edu.ve" className="text-[#1e3a5f] underline hover:text-[#d4a843]">
              becas@unimar.edu.ve
            </Link>
          </p>
        </div>
      </div>

      <div className="bg-[#111b2e] py-3">
        <p className="text-center text-[10px] text-[#4a5d7a]">
          {"Copyright 2001-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela."}
        </p>
      </div>
    </div>
  )
}