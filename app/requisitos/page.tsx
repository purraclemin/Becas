import { Navbar } from "@/components/navbar/navbar"
import { PageHeader } from "@/components/page-header"
import { Footer } from "@/components/footer"
import { CheckCircle2, AlertCircle, FileText, Upload, Download, ArrowRight } from "lucide-react"
import Link from "next/link"

const requisitosGenerales = [
  "Ser estudiante regular de pregrado de la UNIMAR",
  "Estar inscrito en el trimestre vigente",
  "No poseer deudas academicas o administrativas pendientes",
  "Mantener un indice academico minimo de acuerdo al tipo de beca",
  "No haber sido objeto de medidas disciplinarias",
]

const documentos = [
  {
    title: "Constancia de Inscripcion",
    description: "Debe ser del trimestre vigente, emitida por la Secretaria General.",
    required: true,
  },
  {
    title: "Documento de Identidad",
    description: "Cedula de identidad venezolana vigente o pasaporte.",
    required: true,
  },
  {
    title: "Constancia de Notas Certificada",
    description: "Emitida por Control de Estudios. Debe reflejar el ultimo trimestre cursado.",
    required: true,
  },
  {
    title: "Carta de Solicitud",
    description: "Dirigida al Decanato de Bienestar Estudiantil, indicando el tipo de beca.",
    required: true,
  },
  {
    title: "Foto tipo Carnet",
    description: "Fondo blanco, tamano 3x3, formato digital JPG o PNG.",
    required: true,
  },
  {
    title: "Estudio Socioeconomico",
    description: "Requerido unicamente para becas socioeconomicas. Formato proporcionado por la universidad.",
    required: false,
  },
  {
    title: "Constancia de Representacion Deportiva",
    description: "Requerido unicamente para becas deportivas. Avalada por la Direccion de Deportes.",
    required: false,
  },
  {
    title: "Constancia de Ingresos",
    description: "Del representante legal. Solo para becas socioeconomicas.",
    required: false,
  },
]

const formatos = [
  { name: "Planilla de Solicitud de Beca", format: "PDF" },
  { name: "Formato de Estudio Socioeconomico", format: "PDF" },
  { name: "Modelo de Carta de Solicitud", format: "DOCX" },
  { name: "Planilla de Actualizacion de Datos", format: "PDF" },
]

export default function RequisitosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Requisitos"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Requisitos" },
        ]}
      />

      {/* Requisitos Generales */}
      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Requisitos Generales</h2>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
                Todo estudiante que desee postularse a cualquier tipo de beca debe cumplir
                con los siguientes requisitos generales. Adicionalmente, cada tipo de beca
                tiene requisitos especificos que se detallan en la seccion correspondiente.
              </p>
              <ul className="flex flex-col gap-3">
                {requisitosGenerales.map((req) => (
                  <li key={req} className="flex items-start gap-3 rounded-lg bg-[#f8fafb] p-4 border border-[#e2e8f0]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2a6041]" />
                    <span className="text-sm leading-relaxed text-[#374151]">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sidebar - Nota importante */}
            <div>
              <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Importante</h2>
              </div>
              <div className="rounded-lg border border-[#d4a843]/30 bg-[#fefcf3] p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#1e3a5f]">Fecha limite</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                      Los documentos deben cargarse en la plataforma antes del 28 de febrero
                      de 2026. Solicitudes incompletas no seran procesadas.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-5">
                <h3 className="text-sm font-bold text-[#1e3a5f]">Formatos Aceptados</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                  Todos los documentos deben cargarse en formato PDF, JPG o PNG.
                  El tamano maximo por archivo es de 5MB.
                </p>
              </div>
              <div className="mt-4 overflow-hidden rounded-lg">
                <img
                  src="/images/students-studying.jpg"
                  alt="Estudiantes de UNIMAR"
                  className="h-48 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentos requeridos */}
      <section className="bg-[#f0f4f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Documentos Requeridos</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {documentos.map((doc) => (
              <div
                key={doc.title}
                className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${doc.required ? "bg-[#1e3a5f]" : "bg-[#6b7280]"}`}>
                  {doc.required ? (
                    <FileText className="h-5 w-5 text-[#d4a843]" />
                  ) : (
                    <FileText className="h-5 w-5 text-[#d1d5db]" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1e3a5f]">{doc.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.required ? "bg-[#1e3a5f]/10 text-[#1e3a5f]" : "bg-[#f0f4f8] text-[#6b7280]"}`}>
                      {doc.required ? "Obligatorio" : "Condicional"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">{doc.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Descargar formatos */}
      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 border-b-2 border-[#d4a843] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Descargar Formatos</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {formatos.map((formato) => (
              <button
                key={formato.name}
                type="button"
                className="group flex items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-4 text-left transition-all hover:border-[#1e3a5f]/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f] text-[#d4a843] transition-transform group-hover:scale-110">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#1e3a5f]">{formato.name}</h3>
                  <span className="text-[10px] text-[#6b7280]">{formato.format}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a5f] py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Upload className="mx-auto h-10 w-10 text-[#d4a843]" />
          <h2 className="mt-4 text-xl font-bold text-[#ffffff] font-serif md:text-2xl">
            Ya tienes tus documentos listos?
          </h2>
          <p className="mt-3 text-sm text-[#8a9bbd]">
            Registrate en la plataforma y comienza a cargar tus documentos para iniciar tu solicitud.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="flex items-center gap-2 rounded-md bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#c49a3a]"
            >
              Registrarse Ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/proceso"
              className="rounded-md border border-[#4a6a8f] px-6 py-2.5 text-sm font-medium text-[#c7d4e6] transition-colors hover:bg-[#2d4a6f]"
            >
              Ver Proceso
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
