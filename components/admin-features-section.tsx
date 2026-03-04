import { Shield, BarChart3, Users, Settings, FileSearch, Database } from "lucide-react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Criterios Normativos",
    description: "Gestione los índices académicos (16 o 18 pts) y cupos máximos por modalidad según el reglamento.",
  },
  {
    icon: FileSearch,
    title: "Evaluación Socioeconómica",
    description: "Sistematice las entrevistas y visitas domiciliarias obligatorias para determinar la procedencia del beneficio.",
  },
  {
    icon: BarChart3,
    title: "Informes para Consejo",
    description: "Genere automáticamente los informes técnicos que Bienestar Estudiantil debe elevar al Consejo Superior.",
  },
  {
    icon: Users,
    title: "Control de Beneficiarios",
    description: "Supervise la carga académica máxima y el cumplimiento de las 15 horas de servicio administrativo.",
  },
  {
    icon: Settings,
    title: "Parámetros del Periodo",
    description: "Configure las fechas límite de solicitud y disponibilidad presupuestaria para cada lapso académico.",
  },
  {
    icon: Database,
    title: "Historial de Decisiones",
    description: "Registro seguro de aprobaciones, renovaciones y suspensiones dictadas por la autoridad competente.",
  },
]

const enlaces = [
  { label: "Oferta de Estudios", href: "#" },
  { label: "Educación Virtual", href: "#" },
  { label: "Unimar Científica", href: "#" },
  { label: "Normativas", href: "#" },
  { label: "Secretaría General", href: "#" },
  { label: "Bienestar Estudiantil", href: "#" },
  { label: "Evaluación y Apoyo Psicológico", href: "#" },
  { label: "Radio Unimar", href: "#" },
]

export function AdminFeaturesSection() {
  return (
    <section id="servicios" className="bg-[#ffffff] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Admin tools - 2/3 */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between border-b-2 border-[#1e3a5f] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">
                Herramientas de Gestión Institucional
              </h2>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
              Módulos diseñados para soportar la planificación, organización y control del proceso de becas, 
              garantizando que cada postulación cumpla con los requisitos y condiciones de mantenimiento 
              exigidos por la normativa universitaria.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-5 transition-all hover:border-[#1e3a5f]/30 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f] text-[#d4a843]">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-tight">{feature.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6b7280]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces de Interés */}
          <div>
            <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Dependencias</h2>
            </div>
            <div className="flex flex-col gap-2">
              {enlaces.map((enlace) => (
                <Link
                  key={enlace.label}
                  href={enlace.href}
                  className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-[#f8fafb] px-4 py-3 text-sm font-medium text-[#1e3a5f] transition-all hover:border-[#1e3a5f]/30 hover:bg-[#1e3a5f] hover:text-[#ffffff]"
                >
                  {enlace.label}
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}