import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer"
import {
  Shield, BarChart3, Users, Settings, FileSearch, Database,
  FileText, Upload, ClipboardList, UserCheck, ArrowRight,
  Mail, Phone, MapPin, Clock, Gavel, Home
} from "lucide-react"
import Link from "next/link"

const studentServices = [
  {
    icon: FileText,
    title: "Postulación Institucional",
    description: "Inicie su trámite de solicitud consignando la planilla oficial ante el Departamento de Bienestar Estudiantil.",
    color: "bg-[#1e3a5f]",
  },
  {
    icon: Home,
    title: "Estudio Socioeconómico",
    description: "Gestión de citas para entrevistas y visitas domiciliarias obligatorias para la comprobación de situación económica.",
    color: "bg-[#2a6041]",
  },
  {
    icon: ClipboardList,
    title: "Seguimiento de Trámite",
    description: "Monitoreo del estado de su solicitud desde la Secretaría General hasta la decisión del Consejo Superior.",
    color: "bg-[#8b5e1b]",
  },
  {
    icon: UserCheck,
    title: "Gestión de Renovación",
    description: "Consignación de la Evaluación de Rendimiento y Acta Compromiso para el mantenimiento del beneficio.",
    color: "bg-[#5a3070]",
  },
]

const adminFeatures = [
  {
    icon: Shield,
    title: "Criterios Normativos",
    description: "Configuración de índices académicos (16 y 18 pts) y cupos máximos por modalidad según los artículos 5, 6 y 7.",
  },
  {
    icon: FileSearch,
    title: "Informes Técnicos",
    description: "Generación de informes de visitas sociales y estudios técnicos para la evaluación de la Secretaría General.",
  },
  {
    icon: Gavel,
    title: "Potestad de Otorgamiento",
    description: "Módulo de decisiones para el Consejo Superior basado en disponibilidad presupuestaria (Art. 3).",
  },
  {
    icon: Users,
    title: "Control de Becarios",
    description: "Supervisión de carga académica máxima y cumplimiento de las 15 horas de plan de actividades (Art. 17).",
  },
  {
    icon: Settings,
    title: "Planificación de Lapsos",
    description: "Personalización de fechas de convocatoria y vigencia de beneficios por período académico (Art. 22).",
  },
  {
    icon: Database,
    title: "Historial de Beneficios",
    description: "Registro centralizado de renovaciones, suspensiones y trazabilidad de actas compromiso.",
  },
]

const enlaces = [
  { label: "Oferta de Estudios", href: "#" },
  { label: "Educación Virtual", href: "#" },
  { label: "Unimar Científica", href: "#" },
  { label: "Normativas Oficiales", href: "#" },
  { label: "Secretaría General", href: "#" },
  { label: "Bienestar Estudiantil", href: "#" },
  { label: "Evaluación y Apoyo Psicológico", href: "#" },
  { label: "Radio Unimar", href: "#" },
  { label: "Biblioteca UNIMAR", href: "#" },
  { label: "Pagos Online", href: "#" },
]

export default function ServiciosPage() {
  return (
    <main className="min-h-screen w-full flex flex-col bg-slate-50">
      <Navbar />
      
      {/* Contenedor con la franja azul institucional y tipografía unificada estilo Hero (sin breadcrumbs) */}
      <div className="mt-[73px] sm:mt-[81px] w-full bg-[#1e3a5f] text-white py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <h1 className="text-2xl font-extrabold font-serif sm:text-3xl md:text-4xl uppercase tracking-tight drop-shadow-lg text-white">
            Servicios Institucionales
          </h1>
        </div>
      </div>

      {/* Servicios Estudiantiles */}
      <section className="bg-[#ffffff] py-12 w-full">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">Atención al Estudiante</h2>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[#6b7280]">
            El Departamento de Bienestar Estudiantil es la unidad responsable de la planificación, 
            organización y control del proceso de becas, garantizando que cada estudiante 
            pueda gestionar su solicitud conforme a la normativa 2023.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {studentServices.map((service) => (
              <div
                key={service.title}
                className="group flex flex-col items-center gap-4 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${service.color} text-[#ffffff] shadow-md transition-transform group-hover:scale-110`}>
                  <service.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-tighter">{service.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Herramientas Administrativas */}
      <section className="bg-[#f0f4f8] py-12 w-full">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">
                  Gestión Administrativa
                </h2>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
                Módulos operativos diseñados para soportar las funciones de la Secretaría General y 
                el Consejo Superior en la determinación de cupos y aprobación de subvenciones.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {adminFeatures.map((feature) => (
                  <div
                    key={feature.title}
                    className="group rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 transition-all hover:border-[#1e3a5f]/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f] text-[#d4a843]">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-[11px] font-black text-[#1e3a5f] uppercase">{feature.title}</h3>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-[#6b7280]">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enlaces de Interés */}
            <div>
              <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">Dependencias</h2>
              </div>
              <div className="flex flex-col gap-2">
                {enlaces.map((enlace) => (
                  <Link
                    key={enlace.label}
                    href={enlace.href}
                    className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-4 py-3 text-sm font-medium text-[#1e3a5f] transition-all hover:border-[#1e3a5f]/30 hover:bg-[#1e3a5f] hover:text-[#ffffff]"
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

      {/* Contacto y Ubicación (Con id="contacto" y scroll-mt-24 para el desplazamiento perfecto desde el Navbar) */}
      <section id="contacto" className="bg-[#ffffff] py-12 w-full scroll-mt-24">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">Atención Institucional</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contacto */}
            <div>
              <h3 className="mb-4 text-base font-bold text-[#1e3a5f] uppercase">Bienestar Estudiantil (Art. 31)</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Canal de Comunicación</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">becas@unimar.edu.ve</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Ubicación del Departamento</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">El Valle del Espíritu Santo, Campus UNIMAR.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Horario de Atención</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">Lunes a Viernes, 8:00am - 4:00pm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div>
              <h3 className="mb-4 text-base font-bold text-[#1e3a5f] uppercase">Campus Universitario</h3>
              <div className="aspect-video overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm">
                <iframe
                  title="Ubicacion UNIMAR"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.244307525232!2d-63.885834624103755!3d10.983050059231614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c318f77967b072b%3A0x6b4c9b369f80164c!2sUniversidad%20de%20Margarita!5e0!3m2!1ses!2sve!4v1708535000000!5m2!1ses!2sve"
                  className="h-full w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}