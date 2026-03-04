import { Navbar } from "@/components/navbar/navbar"
import { PageHeader } from "@/components/page-header"
import { Footer } from "@/components/footer"
import { CheckCircle2, AlertCircle, FileText, Upload, Download, ArrowRight } from "lucide-react"
import Link from "next/link"

const requisitosGenerales = [
  "Ser estudiante regular de pregrado de la Universidad de Margarita ",
  "Inscribir la máxima carga académica permitida según el pensum de la carrera ",
  "Mantener un índice académico igual o superior a 16 puntos (Beca Aprendizaje, Discapacidad y Ayudas) ",
  "Tener un promedio de notas igual o superior a 18 puntos para Beca Social Aprendizaje ",
  "No haber sido objeto de sanciones académicas o disciplinarias según la norma ",
  "Mantener una conducta intachable dentro y fuera de la institución ",
]

const documentos = [
  {
    title: "Planilla de Solicitud",
    description: "Descargada de la página web oficial para completar los datos requeridos.",
    required: true,
  },
  {
    title: "Cédula de Identidad",
    description: "Fotocopia ampliada del documento de identidad vigente.",
    required: true,
  },
  {
    title: "Constancia de Notas",
    description: "Emitida por el Departamento de Control de Estudios para confirmar índices.",
    required: true,
  },
  {
    title: "Foto tipo Carnet",
    required: true,
  },
  {
    title: "Informe Médico Especializado",
    description: "Requerido solo para Beca por Discapacidad, junto al carnet respectivo.",
    required: false,
  },
  {
    title: "Estudio Socioeconómico",
    description: "Evaluación aplicada por el Departamento de Bienestar Estudiantil mediante entrevista.",
    required: true,
  },
  {
    title: "Notas Certificadas de Bachillerato",
    description: "Requerido para aspirantes a Beca Social Aprendizaje (7mo a 5to año).",
    required: false,
  },
  {
    title: "Acta Compromiso",
    description: "Documento firmado por el becario y el Rectorado tras la aprobación del beneficio.",
    required: true,
  },
]

const formatos = [
  { name: "Planilla de Solicitud de Beca", format: "PDF" },
  { name: "Formato de Estudio Socioeconómico", format: "PDF" },
  { name: "Acta Compromiso de Renovación", format: "PDF" },
  { name: "Instrumento de Evaluación de Rendimiento", format: "PDF" },
]

export default function RequisitosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Requisitos Normativos"
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
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Condiciones de Elegibilidad</h2>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
                De acuerdo con el Reglamento de Becas vigente, todo estudiante debe cumplir con los requisitos 
                de ingreso y permanencia. El otorgamiento es potestad exclusiva del Consejo Superior.
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
                <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Mantenimiento</h2>
              </div>
              <div className="rounded-lg border border-[#d4a843]/30 bg-[#fefcf3] p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#d4a843]" />
                  <div>
                    <h3 className="text-sm font-bold text-[#1e3a5f]">Evaluación Semestral</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                      Los becarios deben aprobar la "Evaluación del Rendimiento Beca" realizada por su supervisor 
                      directo para optar a la renovación.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-[#e2e8f0] bg-[#f8fafb] p-5">
                <h3 className="text-sm font-bold text-[#1e3a5f]">Horas de Servicio</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                  Las modalidades de Aprendizaje requieren una dedicación de quince (15) horas semanales 
                  de apoyo administrativo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documentos requeridos */}
      <section className="bg-[#f0f4f8] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Documentación Obligatoria</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {documentos.map((doc) => (
              <div
                key={doc.title}
                className="flex items-start gap-4 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${doc.required ? "bg-[#1e3a5f]" : "bg-[#6b7280]"}`}>
                  <FileText className="h-5 w-5 text-[#d4a843]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1e3a5f]">{doc.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${doc.required ? "bg-[#1e3a5f]/10 text-[#1e3a5f]" : "bg-[#f0f4f8] text-[#6b7280]"}`}>
                      {doc.required ? "Obligatorio" : "Si aplica"}
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
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Formatos Oficiales</h2>
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
            ¿Listo para consignar tus recaudos?
          </h2>
          <p className="mt-3 text-sm text-[#8a9bbd]">
            La recepción de documentos se realiza en el Departamento de Bienestar Estudiantil según el cronograma publicado.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/registro"
              className="flex items-center gap-2 rounded-md bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#c49a3a]"
            >
              Iniciar Solicitud
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}