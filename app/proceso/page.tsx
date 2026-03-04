import { Navbar } from "@/components/navbar/navbar"
import { PageHeader } from "@/components/page-header"
import { Footer } from "@/components/footer"
import { 
  UserPlus, 
  FileUp, 
  ClipboardCheck, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileSearch,
  Users,
  Gavel,
  ClipboardList,
  Clock
} from "lucide-react"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const steps = [
  {
    step: 1,
    icon: UserPlus,
    sideIcon: ClipboardList,
    title: "Postulación y Consignación",
    description:
      "Descarga la planilla oficial de la página web y consigna tus recaudos ante el Departamento de Bienestar Estudiantil en las fechas publicadas.",
    details: [
      "Descargar y completar la Planilla de Solicitud",
      "Consignar expediente físico en Bienestar Estudiantil",
      "Verificación de constancia de notas y carga académica",
      "Validación de requisitos básicos de elegibilidad",
    ],
    color: "bg-[#1e3a5f]",
  },
  {
    step: 2,
    icon: FileUp,
    sideIcon: FileSearch,
    title: "Estudio y Visita Social",
    description:
      "El Departamento de Bienestar Estudiantil realizará una entrevista y visita domiciliaria para comprobar tu situación socioeconómica.",
    details: [
      "Agendamiento de entrevista presencial",
      "Visita domiciliaria por trabajadores sociales",
      "Comprobación de ingresos y egresos del núcleo familiar",
      "Evaluación de entorno y condiciones de vivienda",
    ],
    color: "bg-[#2a6041]",
  },
  {
    step: 3,
    icon: ClipboardCheck,
    sideIcon: Users,
    title: "Evaluación de la Secretaría",
    description:
      "La Secretaría General evalúa los informes técnicos y emite un estudio detallado para ser elevado a las autoridades superiores.",
    details: [
      "Revisión de informes por Secretaría General",
      "Clasificación por modalidad (Aprendizaje, Social, Excelencia)",
      "Verificación de cupos máximos permitidos por norma",
      "Elaboración del estudio para el Consejo Superior",
    ],
    color: "bg-[#8b5e1b]",
  },
  {
    step: 4,
    icon: Bell,
    sideIcon: Gavel,
    title: "Decisión del Consejo Superior",
    description:
      "El Consejo Superior ejerce su potestad exclusiva para aprobar o rechazar las becas según la disponibilidad presupuestaria.",
    details: [
      "Análisis de propuestas en sesión de Consejo",
      "Determinación del número de beneficios a otorgar",
      "Notificación oficial de resultados a los aspirantes",
      "Firma del Acta Compromiso y otorgamiento",
    ],
    color: "bg-[#7c2d3e]",
  },
]

const timelineArticulos = [
  { 
    id: "art30",
    titulo: "Artículo 30: Información del Procedimiento", 
    contenido: "Es obligación del departamento de Bienestar Estudiantil, informar a los estudiantes interesados en optar por primera vez al beneficio de beca o ayuda económica, el procedimiento a realizar y las fechas previstas para las solicitudes a través la página web o en los diferentes canales de comunicación de Universidad de Margarita.",
    status: "completed" 
  },
  { 
    id: "art4",
    titulo: "Artículo 4: Competencia de Secretaría", 
    contenido: "La Secretaría General entregará con suficiente antelación al Consejo Superior, el estudio realizado para la aprobación y otorgamiento de Becas y Ayudas Económicas, correspondiente a cada período académico.",
    status: "active" 
  },
  { 
    id: "art3",
    titulo: "Artículo 3: Disponibilidad Presupuestaria", 
    contenido: "El Consejo Superior de la Universidad de Margarita, analizará y determinará el número de Becas y Ayudas Económicas a otorgar en cada periodo académico, tomando en cuenta la disponibilidad presupuestaria de la Universidad.",
    status: "pending" 
  },
  { 
    id: "art2",
    titulo: "Artículo 2: Definición y Vigencia", 
    contenido: "Se entiende como Beca o Ayuda Económica, la subvención que se otorgue sobre el valor de la matrícula. Su duración será por un (1) periodo académico y el otorgamiento es potestad exclusiva del Consejo Superior.",
    status: "pending" 
  },
  { 
    id: "art24",
    titulo: "Artículo 24: Verificación y Rendimiento", 
    contenido: "Es competencia del Departamento de Bienestar Estudiantil verificar la carga académica y las notas alcanzadas por los becarios. Los supervisores deberán realizar la 'Evaluación de Rendimiento Beca' al finalizar cada período.",
    status: "pending" 
  },
]

export default function ProcesoPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Proceso Administrativo"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Proceso" },
        ]}
      />

      <section className="bg-[#f0f4f8] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-[#6b7280] md:text-base">
            El procesamiento de Becas y Ayudas Económicas se rige por etapas administrativas 
            que garantizan la transparencia y el cumplimiento de la normativa institucional.
          </p>
        </div>
      </section>

      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-[72px] hidden h-[calc(100%+32px)] w-0.5 bg-[#e2e8f0] lg:left-8 lg:block" />
                )}
                <div className="overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm">
                  <div className="grid lg:grid-cols-3">
                    <div className="p-6 lg:col-span-2 lg:p-8">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color} text-[#ffffff] shadow-md lg:h-16 lg:w-16`}>
                          <step.icon className="h-6 w-6 lg:h-7 lg:w-7" />
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#d4a843]">
                            Fase Operativa {step.step}
                          </span>
                          <h2 className="text-lg font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">{step.title}</h2>
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

                    <div className="flex flex-col items-center justify-center bg-[#f8fafb] p-6 text-center border-t border-[#e2e8f0] lg:border-l lg:border-t-0">
                      <step.sideIcon className="h-12 w-12 text-[#1e3a5f] opacity-15" />
                      <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#1e3a5f]/30">
                        {step.step === 4 ? "Resolución" : "Trámite"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f0f4f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase">
                  Trazabilidad Normativa (Haz clic para ver el artículo)
                </h2>
              </div>
              
              <Accordion type="single" collapsible className="flex flex-col gap-3">
                {timelineArticulos.map((item) => (
                  <AccordionItem 
                    key={item.id} 
                    value={item.id}
                    className={`rounded-lg border px-4 bg-[#ffffff] transition-all ${
                      item.status === "completed" ? "border-[#2a6041]/30" : 
                      item.status === "active" ? "border-[#d4a843]/30 shadow-sm" : "border-[#e2e8f0]"
                    }`}
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 w-full text-left">
                        {item.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#2a6041]" />
                        ) : item.status === "active" ? (
                          <HelpCircle className="h-5 w-5 flex-shrink-0 text-[#d4a843] animate-pulse" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-200 flex-shrink-0" />
                        )}
                        <span className="text-sm font-bold text-[#1e3a5f]">{item.titulo}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs leading-relaxed text-[#6b7280] pb-4 pl-9 font-medium italic border-t border-slate-50 pt-3">
                      "{item.contenido}"
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div>
              <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase">Consideraciones</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-[#d4a843]" />
                  <h3 className="mt-2 text-sm font-bold text-[#1e3a5f] uppercase tracking-tight">Potestad</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                    Según el Artículo 2, el otorgamiento es potestad exclusiva del Consejo Superior.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1e3a5f] py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-xl font-bold text-[#ffffff] font-serif md:text-2xl uppercase">
            Inicia tu solicitud institucional
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="flex items-center gap-2 rounded-md bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#c49a3a]"
            >
              Comenzar Solicitud
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}