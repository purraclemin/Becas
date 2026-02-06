import { Shield, BarChart3, Users, Settings, FileSearch, Database } from "lucide-react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Criterios de Elegibilidad",
    description: "Configure los criterios para cada tipo de beca de manera flexible.",
  },
  {
    icon: FileSearch,
    title: "Evaluacion de Postulaciones",
    description: "Evalue y compare las solicitudes de forma sistematica y transparente.",
  },
  {
    icon: BarChart3,
    title: "Reportes Automatizados",
    description: "Genere reportes detallados sobre solicitudes y estadisticas del programa.",
  },
  {
    icon: Users,
    title: "Gestion de Estudiantes",
    description: "Administre perfiles de beneficiarios e historico de becas otorgadas.",
  },
  {
    icon: Settings,
    title: "Configuracion del Sistema",
    description: "Personalice parametros segun el periodo academico vigente.",
  },
  {
    icon: Database,
    title: "Base de Datos Centralizada",
    description: "Informacion de becas centralizada, accesible y segura.",
  },
]

const enlaces = [
  { label: "Oferta de Estudios", href: "#" },
  { label: "Educacion Virtual", href: "#" },
  { label: "Unimar Cientifica", href: "#" },
  { label: "Normativas", href: "#" },
  { label: "Secretaria General", href: "#" },
  { label: "Bienestar Estudiantil", href: "#" },
  { label: "Evaluacion y Apoyo Psicologico", href: "#" },
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
                Herramientas Administrativas
              </h2>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
              La plataforma incluye herramientas para que la universidad administre criterios
              de elegibilidad, evalue postulaciones y genere reportes automatizados, agilizando
              el proceso de seleccion.
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
                  <h3 className="text-sm font-bold text-[#1e3a5f]">{feature.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6b7280]">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enlaces de Interes - 1/3, like portalunimar sidebar */}
          <div>
            <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Enlaces de Interes</h2>
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
