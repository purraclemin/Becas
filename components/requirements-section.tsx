import { CheckCircle2, FileText, Upload, ClipboardList, UserCheck } from "lucide-react"

const requirements = [
  "Ser estudiante regular de pregrado de la UNIMAR",
  "Estar inscrito en el trimestre vigente",
  "No poseer deudas academicas o administrativas pendientes",
  "Presentar constancia de inscripcion actualizada",
  "Documento de identidad vigente (cedula o pasaporte)",
  "Constancia de notas certificada del ultimo trimestre",
  "Carta de solicitud dirigida al Decanato de Bienestar Estudiantil",
  "Estudio socioeconomico (para becas socioeconomicas)",
  "Constancia de representacion deportiva (para becas deportivas)",
]

const quickActions = [
  {
    icon: FileText,
    title: "Solicitar Beca",
    description: "Inicia tu proceso de solicitud",
    color: "bg-[#1e3a5f]",
  },
  {
    icon: Upload,
    title: "Cargar Documentos",
    description: "Adjunta tus recaudos",
    color: "bg-[#2a6041]",
  },
  {
    icon: ClipboardList,
    title: "Consultar Estado",
    description: "Revisa tu postulacion",
    color: "bg-[#8b5e1b]",
  },
  {
    icon: UserCheck,
    title: "Mi Perfil",
    description: "Actualiza tus datos",
    color: "bg-[#5a3070]",
  },
]

export function RequirementsSection() {
  return (
    <section id="requisitos" className="bg-[#ffffff] py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Quick access grid - portal style like "Areas Academicas" */}
        <div className="mb-12">
          <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
            <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Accesos Rapidos</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                type="button"
                className="group flex flex-col items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${action.color} text-[#ffffff] shadow-md transition-transform group-hover:scale-110`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e3a5f]">{action.title}</h3>
                  <p className="mt-0.5 text-xs text-[#6b7280]">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Requirements list */}
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">
                Requisitos para Solicitar una Beca
              </h2>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-[#6b7280]">
              Para iniciar el proceso de solicitud de beca, asegurate de cumplir con los
              siguientes requisitos y tener disponible la documentacion necesaria.
            </p>
            <ul className="flex flex-col gap-2.5">
              {requirements.map((req) => (
                <li key={req} className="flex items-start gap-3 rounded-md bg-[#f8fafb] p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2a6041]" />
                  <span className="text-sm leading-relaxed text-[#374151]">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Image side */}
          <div className="relative">
            <div className="overflow-hidden rounded-lg shadow-lg">
              <img
                src="/images/students-studying.jpg"
                alt="Estudiantes de UNIMAR"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 rounded-lg bg-[#1e3a5f] p-5 text-[#ffffff]">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-[#d4a843]">26+</div>
                <div>
                  <div className="text-sm font-bold">Anos formando profesionales</div>
                  <div className="text-xs text-[#8a9bbd]">Universidad de Margarita desde 2000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
