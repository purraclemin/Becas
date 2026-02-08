import { Navbar } from "@/components/navbar/navbar"
import { PageHeader } from "@/components/page-header"
import { Footer } from "@/components/footer"
import { UserPlus, FileUp, ClipboardCheck, Bell, ArrowRight, Clock, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Registro en la Plataforma",
    description:
      "Crea tu cuenta en el sistema utilizando tu correo institucional y datos personales. El proceso de registro toma solo unos minutos.",
    details: [
      "Ingresa a la plataforma y selecciona Registrarse",
      "Completa tus datos personales y academicos",
      "Verifica tu correo institucional",
      "Configura tu contrasena de acceso",
    ],
    duration: "5-10 minutos",
    color: "bg-[#1e3a5f]",
  },
  {
    step: 2,
    icon: FileUp,
    title: "Carga de Documentos",
    description:
      "Adjunta todos los documentos requeridos segun el tipo de beca que deseas solicitar. El sistema te indicara los formatos aceptados.",
    details: [
      "Selecciona el tipo de beca a solicitar",
      "Carga cada documento en formato PDF, JPG o PNG",
      "Verifica que los documentos sean legibles",
      "Confirma el envio de tu solicitud",
    ],
    duration: "15-30 minutos",
    color: "bg-[#2a6041]",
  },
  {
    step: 3,
    icon: ClipboardCheck,
    title: "Evaluacion de Solicitud",
    description:
      "Tu solicitud sera evaluada por el Comite de Becas de la universidad. Se verificaran los criterios de elegibilidad y la documentacion presentada.",
    details: [
      "Revision de documentos por el equipo administrativo",
      "Verificacion de cumplimiento de requisitos",
      "Evaluacion comparativa con otros postulantes",
      "Aprobacion o rechazo por el Comite de Becas",
    ],
    duration: "5-10 dias habiles",
    color: "bg-[#8b5e1b]",
  },
  {
    step: 4,
    icon: Bell,
    title: "Notificacion de Resultados",
    description:
      "Recibe la notificacion del resultado de tu solicitud a traves del sistema y correo electronico institucional.",
    details: [
      "Notificacion automatica por correo electronico",
      "Consulta el resultado en la plataforma",
      "En caso de aprobacion, el descuento se aplica automaticamente",
      "Recibe tu certificado digital de beneficiario",
    ],
    duration: "1-2 dias habiles",
    color: "bg-[#7c2d3e]",
  },
]

const timeline = [
  { date: "01 Feb 2026", event: "Apertura de convocatoria", status: "completed" },
  { date: "01-28 Feb", event: "Periodo de carga de documentos", status: "active" },
  { date: "01-10 Mar", event: "Evaluacion de solicitudes", status: "pending" },
  { date: "11 Mar 2026", event: "Publicacion de resultados", status: "pending" },
  { date: "15 Mar 2026", event: "Aplicacion del beneficio", status: "pending" },
]

export default function ProcesoPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Proceso de Solicitud"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Proceso" },
        ]}
      />

      {/* Intro */}
      <section className="bg-[#f0f4f8] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-[#6b7280] md:text-base">
            El proceso de solicitud de becas en UNIMAR es completamente digital. Sigue estos
            pasos para completar tu postulacion de manera exitosa.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-[72px] hidden h-[calc(100%+32px)] w-0.5 bg-[#e2e8f0] lg:left-8 lg:block" />
                )}
                <div className="overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm">
                  <div className="grid lg:grid-cols-3">
                    {/* Main content */}
                    <div className="p-6 lg:col-span-2 lg:p-8">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color} text-[#ffffff] shadow-md lg:h-16 lg:w-16`}>
                          <step.icon className="h-6 w-6 lg:h-7 lg:w-7" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#d4a843]">
                            Paso {step.step}
                          </span>
                          <h2 className="text-lg font-bold text-[#1e3a5f] font-serif">{step.title}</h2>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-[#6b7280]">
                        {step.description}
                      </p>
                      <ul className="mt-4 flex flex-col gap-2">
                        {step.details.map((detail) => (
                          <li key={detail} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2a6041]" />
                            <span className="text-sm text-[#374151]">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Duration side panel */}
                    <div className="flex flex-col items-center justify-center bg-[#f8fafb] p-6 text-center border-t border-[#e2e8f0] lg:border-l lg:border-t-0">
                      <Clock className="h-8 w-8 text-[#1e3a5f]" />
                      <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
                        Duracion estimada
                      </div>
                      <div className="mt-1 text-lg font-bold text-[#1e3a5f]">{step.duration}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cronograma */}
      <section className="bg-[#f0f4f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">
                  Cronograma Ene-Abr 2026
                </h2>
              </div>
              <div className="flex flex-col gap-3">
                {timeline.map((item) => (
                  <div
                    key={item.event}
                    className={`flex items-center gap-4 rounded-lg border p-4 ${
                      item.status === "completed"
                        ? "border-[#2a6041]/30 bg-[#f0fdf4]"
                        : item.status === "active"
                          ? "border-[#d4a843]/30 bg-[#fefcf3]"
                          : "border-[#e2e8f0] bg-[#ffffff]"
                    }`}
                  >
                    {item.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#2a6041]" />
                    ) : item.status === "active" ? (
                      <Clock className="h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                    ) : (
                      <HelpCircle className="h-5 w-5 flex-shrink-0 text-[#9ca3af]" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#1e3a5f]">{item.event}</div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "completed"
                        ? "bg-[#2a6041]/10 text-[#2a6041]"
                        : item.status === "active"
                          ? "bg-[#d4a843]/15 text-[#8b5e1b]"
                          : "bg-[#f0f4f8] text-[#6b7280]"
                    }`}>
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar tips */}
            <div>
              <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Recomendaciones</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-[#d4a843]" />
                  <h3 className="mt-2 text-sm font-bold text-[#1e3a5f]">Prepara tus documentos</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                    Asegurate de tener todos los documentos digitalizados antes de iniciar la solicitud.
                  </p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-[#d4a843]" />
                  <h3 className="mt-2 text-sm font-bold text-[#1e3a5f]">Revisa los requisitos</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                    Verifica que cumples con todos los criterios antes de postularte.
                  </p>
                </div>
                <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-[#d4a843]" />
                  <h3 className="mt-2 text-sm font-bold text-[#1e3a5f]">No esperes al ultimo dia</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                    Evita inconvenientes cargando tus documentos con tiempo de anticipacion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a5f] py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-xl font-bold text-[#ffffff] font-serif md:text-2xl">
            Comienza tu solicitud ahora
          </h2>
          <p className="mt-3 text-sm text-[#8a9bbd]">
            El proceso es rapido, digital y completamente transparente.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="flex items-center gap-2 rounded-md bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#c49a3a]"
            >
              Registrarse
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/requisitos"
              className="rounded-md border border-[#4a6a8f] px-6 py-2.5 text-sm font-medium text-[#c7d4e6] transition-colors hover:bg-[#2d4a6f]"
            >
              Ver Requisitos
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
