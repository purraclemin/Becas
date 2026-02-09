import { Navbar } from "@/components/navbar/navbar"
import { PageHeader } from "@/components/page-header"
import { Footer } from "@/components/footer"
import {
  Shield, BarChart3, Users, Settings, FileSearch, Database,
  FileText, Upload, ClipboardList, UserCheck, ArrowRight,
  Mail, Phone, MapPin, Clock
} from "lucide-react"
import Link from "next/link"

const studentServices = [
  {
    icon: FileText,
    title: "Solicitar Beca",
    description: "Inicia tu proceso de solicitud de beca directamente desde la plataforma. Selecciona el tipo de beca y completa el formulario.",
    color: "bg-[#1e3a5f]",
  },
  {
    icon: Upload,
    title: "Carga de Documentos",
    description: "Adjunta los documentos requeridos de manera digital. El sistema te indicara los formatos aceptados y requisitos.",
    color: "bg-[#2a6041]",
  },
  {
    icon: ClipboardList,
    title: "Consultar Estado",
    description: "Monitorea el estado de tu solicitud en tiempo real. Recibe notificaciones sobre cada etapa del proceso.",
    color: "bg-[#8b5e1b]",
  },
  {
    icon: UserCheck,
    title: "Mi Perfil",
    description: "Actualiza tus datos personales, academicos y de contacto para mantener tu informacion vigente.",
    color: "bg-[#5a3070]",
  },
]

const adminFeatures = [
  {
    icon: Shield,
    title: "Criterios de Elegibilidad",
    description: "Configure y administre los criterios de elegibilidad para cada tipo de beca de manera flexible y transparente.",
  },
  {
    icon: FileSearch,
    title: "Evaluacion de Postulaciones",
    description: "Evalue y compare las solicitudes de forma sistematica y transparente con herramientas especializadas.",
  },
  {
    icon: BarChart3,
    title: "analitica Automatizados",
    description: "Genere analitica detallados sobre solicitudes, aprobaciones, rechazos y estadisticas del programa de becas.",
  },
  {
    icon: Users,
    title: "Gestion de Estudiantes",
    description: "Administre perfiles de beneficiarios, historico de becas otorgadas y seguimiento academico.",
  },
  {
    icon: Settings,
    title: "Configuracion del Sistema",
    description: "Personalice parametros, periodos de convocatoria y porcentajes de cobertura segun el periodo academico.",
  },
  {
    icon: Database,
    title: "Base de Datos Centralizada",
    description: "Toda la informacion de becas centralizada, accesible y segura en un solo sistema integrado.",
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
  { label: "Biblioteca UNIMAR", href: "#" },
  { label: "Pagos Online", href: "#" },
]

export default function ServiciosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Servicios"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Servicios" },
        ]}
      />

      {/* Servicios Estudiantiles */}
      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Servicios para Estudiantes</h2>
          </div>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[#6b7280]">
            La plataforma digital de becas UNIMAR ofrece un espacio donde los estudiantes pueden
            gestionar sus solicitudes de manera eficiente, registrar datos, adjuntar documentos
            y monitorear el estado de su aplicacion.
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
                  <h3 className="text-sm font-bold text-[#1e3a5f]">{service.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Herramientas Administrativas */}
      <section className="bg-[#f0f4f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">
                  Herramientas Administrativas
                </h2>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
                La plataforma incluye herramientas para que la universidad administre criterios
                de elegibilidad, evalue postulaciones y genere analitica automatizados, agilizando
                el proceso de seleccion.
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
                    <h3 className="text-sm font-bold text-[#1e3a5f]">{feature.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#6b7280]">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enlaces de Interes */}
            <div>
              <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Enlaces de Interes</h2>
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

      {/* Contacto y Ubicacion */}
      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Contacto y Ubicacion</h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contacto */}
            <div>
              <h3 className="mb-4 text-base font-bold text-[#1e3a5f]">Decanato de Bienestar Estudiantil</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Correo Electronico</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">becas@unimar.edu.ve</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Telefonos</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">0412.102.2538 / 0412.595.7440 / 0412.595.7430</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Direccion</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">Av. Concepcion Marino, Sector El Toporo, El Valle del Espiritu Santo, Edo. Nueva Esparta.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Horario de Atencion</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">Lunes a Viernes, 8:00am - 4:00pm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div>
              <h3 className="mb-4 text-base font-bold text-[#1e3a5f]">Ubicacion</h3>
              <div className="aspect-video overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm">
                <iframe
                  title="Ubicacion UNIMAR"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.0!2d-63.9!3d11.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sUNIMAR!5e0!3m2!1ses!2sve"
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
