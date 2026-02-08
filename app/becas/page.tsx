import { Navbar } from "@/components/navbar/navbar"
import { PageHeader } from "@/components/page-header"
import { Footer } from "@/components/footer"
import { GraduationCap, Award, Trophy, Heart, ArrowRight, CheckCircle2, Users, Clock, Percent } from "lucide-react"
import Link from "next/link"

const becas = [
  {
    icon: GraduationCap,
    title: "Beca Academica",
    coverage: "Hasta 50%",
    description:
      "Dirigida a estudiantes con un rendimiento academico destacado. Se otorga a quienes mantengan un promedio general igual o superior a 16 puntos durante el trimestre anterior.",
    requisitos: [
      "Promedio general igual o superior a 16 puntos",
      "Estar inscrito en el trimestre vigente",
      "No tener materias reprobadas en el ultimo trimestre",
      "Constancia de notas certificada",
    ],
    color: "bg-[#1e3a5f]",
  },
  {
    icon: Heart,
    title: "Beca Socioeconomica",
    coverage: "Hasta 70%",
    description:
      "Destinada a estudiantes cuyo nucleo familiar presenta condiciones economicas que dificultan el pago de la matricula. Se evalua mediante un estudio socioeconomico.",
    requisitos: [
      "Estudio socioeconomico del nucleo familiar",
      "Carta de exposicion de motivos",
      "Constancia de ingresos del representante",
      "Recibos de servicios publicos del hogar",
    ],
    color: "bg-[#2a6041]",
  },
  {
    icon: Trophy,
    title: "Beca Deportiva",
    coverage: "Hasta 40%",
    description:
      "Para atletas que representen oficialmente a la universidad en competencias deportivas regionales, nacionales o internacionales.",
    requisitos: [
      "Constancia de representacion deportiva",
      "Certificados de participacion en competencias",
      "Aval de la Direccion de Deportes de UNIMAR",
      "Mantener un promedio minimo de 13 puntos",
    ],
    color: "bg-[#8b5e1b]",
  },
  {
    icon: Award,
    title: "Beca a la Excelencia",
    coverage: "Hasta 100%",
    description:
      "La mas alta distincion academica de UNIMAR. Se otorga automaticamente a los estudiantes con el mejor promedio de cada carrera al finalizar el trimestre.",
    requisitos: [
      "Ser el mejor promedio de su carrera en el trimestre",
      "Haber cursado la carga completa del trimestre",
      "No tener materias reprobadas",
      "Minimo 2 trimestres cursados en UNIMAR",
    ],
    color: "bg-[#7c2d3e]",
  },
]

const stats = [
  { icon: Users, value: "500+", label: "Becas otorgadas" },
  { icon: Percent, value: "100%", label: "Cobertura maxima" },
  { icon: GraduationCap, value: "4", label: "Tipos de becas" },
  { icon: Clock, value: "15", label: "Dias de proceso" },
]

export default function BecasPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PageHeader
        title="Tipos de Becas"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Becas" },
        ]}
      />

      {/* Stats bar */}
      <section className="bg-[#16304f]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-[#1e3a5f]/50 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-center gap-3 bg-[#16304f] px-4 py-5">
              <stat.icon className="h-6 w-6 text-[#d4a843]" />
              <div>
                <div className="text-xl font-extrabold text-[#ffffff]">{stat.value}</div>
                <div className="text-xs text-[#8a9bbd]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="bg-[#f0f4f8] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mx-auto max-w-3xl text-center text-sm leading-relaxed text-[#6b7280] md:text-base">
            La Universidad de Margarita ofrece distintos programas de becas para apoyar a sus
            estudiantes regulares de pregrado. Conoce cada tipo de beca, sus beneficios y
            requisitos especificos.
          </p>
        </div>
      </section>

      {/* Becas cards */}
      <section className="bg-[#ffffff] py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8">
            {becas.map((beca, index) => (
              <article
                key={beca.title}
                className="overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`grid items-stretch lg:grid-cols-3 ${index % 2 !== 0 ? "lg:direction-rtl" : ""}`}>
                  {/* Info side */}
                  <div className="p-6 lg:col-span-2 lg:p-8">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${beca.color} text-[#ffffff] shadow-md`}>
                        <beca.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#1e3a5f] font-serif">{beca.title}</h2>
                        <span className="inline-block rounded-full bg-[#d4a843]/15 px-3 py-0.5 text-xs font-semibold text-[#8b5e1b]">
                          Cobertura: {beca.coverage}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-[#6b7280]">
                      {beca.description}
                    </p>
                    <div className="mt-5">
                      <h3 className="mb-2 text-sm font-bold text-[#1e3a5f]">Requisitos Especificos:</h3>
                      <ul className="flex flex-col gap-2">
                        {beca.requisitos.map((req) => (
                          <li key={req} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#2a6041]" />
                            <span className="text-sm text-[#374151]">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Side panel */}
                  <div className={`flex flex-col items-center justify-center ${beca.color} p-6 text-center text-[#ffffff]`}>
                    <beca.icon className="h-16 w-16 opacity-30" />
                    <div className="mt-4 text-3xl font-extrabold">{beca.coverage}</div>
                    <div className="text-sm opacity-80">de cobertura</div>
                    <Link
                      href="/registro"
                      className="mt-6 flex items-center gap-2 rounded-md bg-[#ffffff]/20 px-5 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-[#ffffff]/30"
                    >
                      Solicitar
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f0f4f8] py-10">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-xl font-bold text-[#1e3a5f] font-serif md:text-2xl">
            Estas listo para solicitar tu beca?
          </h2>
          <p className="mt-3 text-sm text-[#6b7280]">
            Registrate en la plataforma y comienza tu proceso de solicitud hoy mismo.
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
              className="rounded-md border border-[#1e3a5f] px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#1e3a5f] hover:text-[#ffffff]"
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
