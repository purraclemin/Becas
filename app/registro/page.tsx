"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, UserPlus, AlertCircle, Loader2 } from "lucide-react"
import { register, checkExistence } from "@/lib/actions-registro"
import { StepIndicator } from "@/components/registro/StepIndicator"
import { StepContent } from "@/components/registro/StepContent"

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

  /**
   * Valida la complejidad de la contraseña según estándares modernos
   */
  const validatePassword = (password: string) => {
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "La contraseña debe incluir al menos una letra mayúscula";
    if (!/[0-9]/.test(password)) return "La contraseña debe incluir al menos un número";
    return null;
  }

  /**
   * Valida cada paso antes de avanzar
   */
  const validateStep = async (currentStep: number) => {
    setError(null)
    
    if (currentStep === 1) {
      if (!form.nombre || !form.apellido || !form.cedula || !form.telefono || !form.email) {
        setError("Por favor completa todos los datos personales")
        return false
      }
      
      if (!form.email.includes("@unimar.edu.ve")) {
        setError("Debe usar su correo institucional @unimar.edu.ve")
        return false
      }

      // VERIFICACIÓN DE DUPLICADOS EN TIEMPO REAL
      setIsPending(true)
      try {
        const check = await checkExistence(form.cedula, form.email)
        if (check.exists) {
          // Muestra el error específico (Email o Cédula) enviado por el servidor
          setError(check.error || "La cédula o el correo ya están registrados")
          return false
        }
      } catch (e) {
        setError("Error de conexión al validar los datos")
        return false
      } finally {
        setIsPending(false)
      }
      
    } else if (currentStep === 2) {
      if (!form.carrera || !form.semestre) {
        setError("Por favor selecciona tu carrera y trimestre actual")
        return false
      }
    }
    
    return true
  }

  /**
   * Maneja el proceso de envío final y navegación entre pasos
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (step < 3) {
      const isValid = await validateStep(step)
      if (isValid) setStep(step + 1)
      return
    }
    
    // VALIDACIONES DE SEGURIDAD (PASO 3)
    const passwordError = validatePassword(form.password);
    if (passwordError) return setError(passwordError);

    if (form.password !== form.confirmPassword) return setError("Las contraseñas no coinciden")
    if (!form.aceptaTerminos) return setError("Debe aceptar los términos y condiciones")

    setIsPending(true)
    setError(null)

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => formData.append(key, value.toString()))

    try {
      const result = await register(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      } else if (result?.success) {
        setTimeout(() => window.location.replace("/"), 500)
      }
    } catch (e) {
      setError("Error de conexión con el servidor")
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f4f8]">
      <div className="bg-[#1a2744]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] shadow-sm">
              <span className="text-sm font-extrabold text-[#d4a843] font-serif">U</span>
            </div>
            <span className="text-sm font-bold tracking-wide text-white font-serif uppercase tracking-widest">UNIMAR</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[#8a9bbd] hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al Inicio
          </Link>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="overflow-hidden rounded-xl bg-white shadow-2xl border border-[#e2e8f0]">
            <div className="bg-[#1e3a5f] px-8 py-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#d4a843]"></div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#d4a843] bg-[#1a2744] shadow-inner">
                <UserPlus className="h-8 w-8 text-[#d4a843]" />
              </div>
              <h1 className="text-2xl font-black text-white font-serif uppercase tracking-tight">Crear Cuenta</h1>
              <p className="mt-1 text-xs font-medium text-[#8a9bbd] uppercase tracking-widest">Sistema de Gestión de Becas</p>
            </div>

            <StepIndicator currentStep={step} onStepClick={(s) => step > s ? setStep(s) : null} />

            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700 border-l-4 border-red-500 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <StepContent 
                  step={step} 
                  form={form} 
                  updateField={updateField} 
                  showPassword={showPassword} 
                  setShowPassword={setShowPassword} 
                  showConfirm={showConfirm} 
                  setShowConfirm={setShowConfirm} 
                />
                
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                  {step > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setStep(step - 1)} 
                      className="w-full sm:w-1/3 rounded-lg border border-[#e2e8f0] py-3 text-xs font-black uppercase tracking-widest text-[#1e3a5f] hover:bg-[#f8fafc] transition-all"
                    >
                      Anterior
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={isPending} 
                    className={`w-full ${step > 1 ? "sm:w-2/3" : "w-full"} rounded-lg py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all ${
                      step === 3 ? "bg-[#d4a843] hover:bg-[#c29a3a]" : "bg-[#1e3a5f] hover:bg-[#162d4a]"
                    }`}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      step < 3 ? "Continuar" : "Finalizar Registro"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center border-t border-[#e2e8f0] pt-6">
                <p className="text-xs text-[#6b7280] font-medium uppercase tracking-wide">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="font-black text-[#1e3a5f] hover:text-[#d4a843] transition-colors">
                    Inicia Sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}