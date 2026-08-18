import { Navbar } from "@/components/navbar/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { BECAS_DATA, BECAS_STATS } from "@/lib/scholarships-data"

export default function BecasPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Header compacto con padding reducido */}
      <section className="bg-[#1e3a5f] pt-20 pb-4 md:pt-24 md:pb-5">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <h1 className="text-2xl font-extrabold font-serif sm:text-3xl md:text-4xl uppercase tracking-tight drop-shadow-lg text-white">
            Tipos de Becas
          </h1>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#16304f]">
        <div className="mx-auto w-full max-w-[1600px] grid grid-cols-2 gap-px bg-[#1e3a5f]/50 sm:grid-cols-4 px-4 sm:px-6 lg:px-8 xl:px-10">
          {BECAS_STATS.map((stat) => (
            <div key={stat.label} className="flex items-center justify-center gap-3 bg-[#16304f] px-4 py-4">
              <stat.icon className="h-5 w-5 text-[#d4a843]" />
              <div>
                <div className="text-lg font-extrabold text-[#ffffff]">{stat.value}</div>
                <div className="text-[11px] text-[#8a9bbd]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Intro */}
      <section className="bg-[#f0f4f8] py-8">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <p className="mx-auto max-w-3xl text-center text-xs leading-relaxed text-[#6b7280] md:text-sm">
            De conformidad con la Normativa de Becas vigente, la Universidad de Margarita ofrece subvenciones 
            totales o parciales sobre el valor de la matrícula para apoyar la formación de sus estudiantes regulares.
          </p>
        </div>
      </section>

      {/* Becas cards */}
      <section className="bg-[#ffffff] py-10">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-col gap-6">
            {BECAS_DATA.map((beca, index) => (
              <article
                key={beca.id}
                className="overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`grid items-stretch lg:grid-cols-3 ${index % 2 !== 0 ? "lg:direction-rtl" : ""}`}>
                  {/* Info side */}
                  <div className="p-5 lg:col-span-2 lg:p-6">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${beca.color} text-[#ffffff] shadow-md`}>
                        <beca.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-[#1e3a5f] font-serif">{beca.title}</h2>
                        <span className="inline-block rounded-full bg-[#d4a843]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#8b5e1b]">
                          Beneficio: {beca.badge}
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-[#6b7280]">
                      {beca.description}
                    </p>
                    <div className="mt-4">
                      <h3 className="mb-1.5 text-xs font-bold text-[#1e3a5f]">Requisitos Normativos:</h3>
                      <ul className="flex flex-col gap-1.5">
                        {beca.requisitos.map((req) => (
                          <li key={req} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#2a6041]" />
                            <span className="text-xs text-[#374151]">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Side panel */}
                  <div className={`flex flex-col items-center justify-center ${beca.color} p-5 text-center text-[#ffffff]`}>
                    <beca.icon className="h-14 w-14 opacity-30" />
                    <div className="mt-3 text-2xl font-extrabold">{beca.coverage}</div>
                    <div className="text-xs opacity-80">de exoneración / beneficio</div>
                    <Link
                      href="/postulacion"
                      className="mt-4 flex items-center gap-1.5 rounded-md bg-[#ffffff]/20 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-[#ffffff]/30"
                    >
                      Solicitar
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#f0f4f8] py-8">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-lg font-bold text-[#1e3a5f] font-serif md:text-xl">
              ¿Cumples con los requisitos académicos?
            </h2>
            <p className="mt-2 text-xs text-[#6b7280]">
              El otorgamiento de becas es potestad del Consejo Superior y su vigencia es de un periodo académico renovable.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/postulacion"
                className="flex items-center gap-2 rounded-md bg-[#d4a843] px-5 py-2 text-xs font-semibold text-[#1e3a5f] transition-colors hover:bg-[#c49a3a]"
              >
                Iniciar Proceso
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href="/formatos/NORMAS-BECAS-Y-AYUDAS.pdf"
                download="NORMAS-BECAS-Y-AYUDAS.pdf"
                className="rounded-md border border-[#1e3a5f] px-5 py-2 text-xs font-semibold text-[#1e3a5f] transition-colors hover:bg-[#1e3a5f] hover:text-[#ffffff]"
              >
                Consultar Normativa
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}