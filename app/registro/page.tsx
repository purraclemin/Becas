"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react"
import { register, checkExistence } from "@/lib/actions-registro"
import { StepIndicator } from "@/components/registro/StepIndicator"
import { StepContent } from "@/components/registro/StepContent"
import { RegistroFormState } from "@/components/registro/Step1Personal"
import {
  personalStepSchema,
  academicStepSchema,
  securityStepSchema,
} from "@/components/registro/validations"

export default function RegistroPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  
  // Referencia para hacer scroll automático hacia la alerta de error
  const errorRef = useRef<HTMLDivElement>(null)

  const [emailVerified, setEmailVerified] = useState(false)

  const [form, setForm] = useState<RegistroFormState>({
    nombre: "",
    apellido: "",
    cedula: "",
    sexo: "",
    fecha_nacimiento: "",
    municipio: "",
    telefono: "",
    email: "",
    password: "",
    confirmPassword: "",
    carrera: "",
    semestre: "",
    aceptaTerminos: false,
  })

  // Función auxiliar para mostrar error y hacer scroll automático hacia él
  const triggerError = (message: string) => {
    setError(message);
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function updateField(field: keyof RegistroFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "email") {
      setEmailVerified(false)
    }
  }

  const validateStep = async (currentStep: number) => {
    setError(null)
    
    if (currentStep === 1) {
      const parsedPersonal = personalStepSchema.safeParse(form);
      if (!parsedPersonal.success) {
        triggerError(parsedPersonal.error.issues[0]?.message || "Por favor revisa tus datos personales");
        return false;
      }

      if (!emailVerified) {
        triggerError("Debe verificar su correo institucional con el código antes de continuar");
        return false;
      }

      setIsPending(true)
      try {
        const check = await checkExistence(form.cedula, form.email)
        if (check.exists) {
          if (check.field === 'email') {
            setEmailVerified(false);
          }
          triggerError(check.error || "La cédula o el correo ya están registrados");
          return false;
        }
      } catch {
        triggerError("Error de conexión al validar los datos");
        return false;
      } finally {
        setIsPending(false)
      }
      
    } else if (currentStep === 2) {
      const parsedAcademic = academicStepSchema.safeParse(form);
      if (!parsedAcademic.success) {
        triggerError(parsedAcademic.error.issues[0]?.message || "Por favor selecciona tu carrera y trimestre actual");
        return false;
      }
    }
    
    return true
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (step < 3) {
      const isValid = await validateStep(step)
      if (isValid) setStep(step + 1)
      return
    }
    
    const parsedSecurity = securityStepSchema.safeParse(form);
    if (!parsedSecurity.success) {
      triggerError(parsedSecurity.error.issues[0]?.message || "Verifica los datos de seguridad");
      return;
    }

    setIsPending(true)
    setError(null)

    const formData = new FormData()
    formData.append("nombre", form.nombre.trim())
    formData.append("apellido", form.apellido.trim())
    formData.append("cedula", form.cedula.trim())
    formData.append("sexo", form.sexo)
    formData.append("fecha_nacimiento", form.fecha_nacimiento)
    formData.append("municipio", form.municipio)
    formData.append("telefono", form.telefono.trim())
    formData.append("email", form.email.trim().toLowerCase())
    formData.append("password", form.password)
    formData.append("carrera", form.carrera)
    formData.append("semestre", form.semestre)

    try {
      const result = await register(formData)
      if (result?.error) {
        triggerError(result.error);
        setIsPending(false)
        if (result.error.includes("correo") || result.error.includes("usuario")) {
          setEmailVerified(false);
        }
      } else if (result?.success) {
        router.push("/")
        router.refresh()
      }
    } catch {
      triggerError("Error crítico de conexión con el servidor");
      setIsPending(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] bg-[url('/images/Camino.jpg')] bg-cover bg-center bg-no-repeat relative overflow-x-hidden">
      
      {/* Capa de superposición semitransparente para contraste óptimo */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none"></div>

      {/* Barra Superior Institucional con Brillo Neón Azul */}
      <div className="bg-[#1a2744] relative z-10 border-b-2 border-blue-400/60 shadow-[0_0_25px_rgba(30,58,95,0.8)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="relative w-36 h-12 sm:w-56 sm:h-16 flex items-center justify-center overflow-hidden">
              <Image 
                src="/images/logounimar4.png"
                alt="Logo UNIMAR"
                width={292}
                height={100}
                priority
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <span className="block text-[8px] sm:text-[10px] font-medium uppercase tracking-widest text-[#8a9bbd] mt-0.5">Gestión de Becas</span>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[#8a9bbd] hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al Inicio
          </Link>
        </div>
      </div>

      {/* Contenedor principal con diseño equilibrado, alineado a la izquierda y divisor central */}
      <div className="flex flex-1 items-center justify-start px-4 sm:px-12 py-6 sm:py-8 relative z-10">
        
        {/* Tarjeta de Registro con ancho ampliado (max-w-xl) y alineada a la izquierda */}
        <div className="w-full max-w-xl">
          <div className="overflow-hidden rounded-xl bg-white shadow-[0_0_30px_rgba(30,58,95,0.6)] hover:shadow-[0_0_40px_rgba(59,130,246,0.8)] border-2 border-blue-400/40 transition-all duration-300">
            
            {/* Cabecera del Card Minimalista y Compacta */}
            <div className="bg-[#1e3a5f] px-5 sm:px-6 py-4 sm:py-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#d4a843]"></div>
              
              {/* Logotipo institucional de Unimar Reducido */}
              <div className="mx-auto mb-2.5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-[#d4a843] bg-[#1a2744] shadow-md relative overflow-hidden p-1.5">
                <Image 
                  src="/images/logounimar3.png"
                  alt="Logo UNIMAR"
                  width={120}
                  height={120}
                  className="object-contain w-full h-full"
                />
              </div>

              <h1 className="text-lg sm:text-xl font-black text-white font-serif uppercase tracking-tight">Crear Cuenta</h1>
              <p className="mt-0.5 text-[10px] font-medium text-[#8a9bbd] uppercase tracking-widest">Sistema de Gestión de Becas</p>
            </div>

            <StepIndicator currentStep={step} onStepClick={(s) => step > s ? setStep(s) : null} />

            <div className="px-5 sm:px-6 py-5 sm:py-6">
              <div ref={errorRef}>
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 border-l-4 border-red-500 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <StepContent 
                  step={step} 
                  form={form} 
                  updateField={updateField} 
                  showPassword={showPassword} 
                  setShowPassword={setShowPassword} 
                  showConfirm={showConfirm} 
                  setShowConfirm={setShowConfirm}
                  emailVerified={emailVerified}
                  setEmailVerified={setEmailVerified}
                />
                
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3">
                  {step > 1 && (
                    <button 
                      type="button" 
                      onClick={() => setStep(step - 1)} 
                      className="w-full sm:w-1/3 h-10 sm:h-9 rounded-lg border border-[#e2e8f0] text-[11px] font-black uppercase tracking-widest text-[#1e3a5f] hover:bg-[#f8fafc] transition-all"
                    >
                      Anterior
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={isPending} 
                    className={`w-full ${step > 1 ? "sm:w-2/3" : "w-full"} h-10 sm:h-9 rounded-lg text-[11px] font-black uppercase tracking-widest text-white shadow-md transition-all ${
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

              <div className="mt-6 text-center border-t border-[#e2e8f0] pt-4">
                <p className="text-[11px] text-[#6b7280] font-medium uppercase tracking-wide">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/login" className="font-black text-[#1e3a5f] hover:text-[#d4a843] transition-colors">
                    Inicia Sesión
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Línea Divisoria Brillante en el medio de la página */}
        <div className="hidden lg:flex absolute left-1/2 top-24 bottom-10 w-0.5 -translate-x-1/2 bg-gradient-to-b from-blue-400 via-[#d4a843] to-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.9)] z-20 pointer-events-none"></div>

      </div>
    </div>
  )
}