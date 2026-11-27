import { Footer } from "@/components/footer"
import {
  Shield,
  Users,
  Settings,
  FileSearch,
  Database,
  FileText,
  ClipboardList,
  UserCheck,
  Mail,
  MapPin,
  Clock,
  Gavel,
  Home,
  Download,
} from "lucide-react"

const studentServices = [
  {
    icon: FileText,
    title: "Postulación Institucional",
    description:
      "Inicie su trámite de solicitud consignando la planilla oficial ante el Departamento de Bienestar Estudiantil.",
    color: "bg-[#1e3a5f]",
  },
  {
    icon: Home,
    title: "Estudio Socioeconómico",
    description:
      "Gestión de citas para entrevistas y visitas domiciliarias obligatorias para la comprobación de situación económica.",
    color: "bg-[#2a6041]",
  },
  {
    icon: ClipboardList,
    title: "Seguimiento de Trámite",
    description:
      "Monitoreo del estado de su solicitud desde la Secretaría General hasta la decisión del Consejo Superior.",
    color: "bg-[#8b5e1b]",
  },
  {
    icon: UserCheck,
    title: "Gestión de Renovación",
    description:
      "Consignación de la Evaluación de Rendimiento y Acta Compromiso para el mantenimiento del beneficio.",
    color: "bg-[#5a3070]",
  },
]

const adminFeatures = [
  {
    icon: Shield,
    title: "Criterios Normativos",
    description:
      "Configuración de índices académicos (16 y 18 pts) y cupos máximos por modalidad según los artículos 5, 6 y 7.",
  },
  {
    icon: FileSearch,
    title: "Informes Técnicos",
    description:
      "Generación de informes de visitas sociales y estudios técnicos para la evaluación de la Secretaría General.",
  },
  {
    icon: Gavel,
    title: "Potestad de Otorgamiento",
    description:
      "Módulo de decisiones para el Consejo Superior basado en disponibilidad presupuestaria .",
  },
  {
    icon: Users,
    title: "Control de Becarios",
    description:
      "Supervisión de carga académica máxima y cumplimiento de las 15 horas de plan de actividades .",
  },
  {
    icon: Settings,
    title: "Planificación de Lapsos",
    description:
      "Personalización de fechas de convocatoria y vigencia de beneficios por período académico .",
  },
  {
    icon: Database,
    title: "Historial de Beneficios",
    description:
      "Registro centralizado de renovaciones, suspensiones y trazabilidad de actas compromiso.",
  },
]

export default function ServiciosPage() {
  return (
    <main className="min-h-screen w-full flex flex-col bg-slate-50">
      

      {/* Contenedor con la franja azul institucional y tipografía unificada estilo Hero */}
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
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">
              Atención al Estudiante
            </h2>
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
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${service.color} text-[#ffffff] shadow-md transition-transform group-hover:scale-110`}
                >
                  <service.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e3a5f] uppercase tracking-tighter">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Herramientas Administrativas */}
      <section className="bg-[#f0f4f8] py-14 w-full border-y border-[#e2e8f0]">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">
              Gestión Administrativa
            </h2>
          </div>

          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-2xl text-sm leading-relaxed text-[#6b7280]">
              Módulos operativos diseñados para soportar las funciones de la Secretaría General y
              el Consejo Superior en la determinación de cupos y aprobación de subvenciones.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-4 py-3 shadow-xs lg:max-w-lg w-full">
              <div className="flex items-start gap-2.5 min-w-0">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#1e3a5f]" />
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold text-[#1e3a5f] uppercase tracking-tight leading-tight">
                    Normativa Oficial
                  </h3>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#6b7280]">
                    Reglamento completo de becas y ayudas económicas UNIMAR.
                  </p>
                </div>
              </div>
              <a
                href="/formatos/NORMAS-BECAS-Y-AYUDAS.pdf"
                download="NORMAS-BECAS-Y-AYUDAS.pdf"
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md bg-[#1e3a5f] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#162b47]"
              >
                <Download className="h-3.5 w-3.5 text-[#d4a843]" />
                Descargar PDF
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adminFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col justify-between rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-6 sm:p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d4a843] hover:shadow-md"
              >
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1e3a5f] text-[#d4a843] shadow-sm transition-transform group-hover:scale-105">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#1e3a5f] uppercase tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#6b7280]">
                    {feature.description}
                  </p>
                </div>
                <div className="mt-5 h-1 w-10 rounded-full bg-[#d4a843]/60 transition-all group-hover:w-16 group-hover:bg-[#d4a843]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto y Ubicación */}
      <section id="contacto" className="bg-[#ffffff] py-12 w-full scroll-mt-24">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif uppercase tracking-tight">
              Atención Institucional
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contacto */}
            <div>
              <h3 className="mb-4 text-base font-bold text-[#1e3a5f] uppercase">
                Bienestar Estudiantil
              </h3>
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
                    <div className="text-sm font-bold text-[#1e3a5f]">
                      Ubicación del Departamento
                    </div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">
                      El Valle del Espíritu Santo, Campus UNIMAR.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <div className="text-sm font-bold text-[#1e3a5f]">Horario de Atención</div>
                    <div className="mt-0.5 text-sm text-[#6b7280]">
                      Lunes a Viernes, 8:00am - 4:00pm
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div>
              <h3 className="mb-4 text-base font-bold text-[#1e3a5f] uppercase">
                Campus Universitario
              </h3>
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