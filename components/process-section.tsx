import { UserPlus, FileUp, ClipboardCheck, Bell, ArrowRight } from "lucide-react"

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Registro en el Sistema",
    description:
      "Crea tu cuenta en la plataforma utilizando tu correo institucional y datos personales.",
  },
  {
    step: 2,
    icon: FileUp,
    title: "Carga de Documentos",
    description:
      "Adjunta todos los documentos requeridos segun el tipo de beca que deseas solicitar.",
  },
  {
    step: 3,
    icon: ClipboardCheck,
    title: "Evaluacion de Solicitud",
    description:
      "Tu solicitud sera evaluada por el comite de becas verificando criterios de elegibilidad.",
  },
  {
    step: 4,
    icon: Bell,
    title: "Notificacion de Resultados",
    description:
      "Recibe la notificacion del resultado a traves del sistema y correo electronico.",
  },
]

export function ProcessSection() {
  return (
    <section id="proceso" className="bg-[#f0f4f8] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
          <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Proceso de Solicitud</h2>
        </div>

        <div className="grid gap-px overflow-hidden rounded-lg border border-[#e2e8f0] bg-[#e2e8f0] sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.step}
              className="relative flex flex-col items-center bg-[#ffffff] p-6 text-center"
            >
              {/* Step number badge */}
              <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f4f8] text-xs font-bold text-[#1e3a5f]">
                {step.step}
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1e3a5f] text-[#d4a843] shadow-md">
                <step.icon className="h-7 w-7" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#1e3a5f]">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">{step.description}</p>

              {step.step < 4 && (
                <ArrowRight className="mt-4 hidden h-4 w-4 text-[#d4a843] lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
