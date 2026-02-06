import { GraduationCap, Award, Trophy, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"

const noticias = [
  {
    title: "UNIMAR abre convocatoria de becas para el trimestre enero-abril 2026",
    excerpt:
      "La Universidad de Margarita invita a todos los estudiantes regulares de pregrado a participar en el proceso de solicitud de becas academicas, socioeconomicas, deportivas y de excelencia para el periodo enero-abril 2026.",
    date: "03 Feb 2026",
  },
  {
    title: "Entrega de certificados a los ganadores de la Beca a la Excelencia, trimestre sept-dic 2025",
    excerpt:
      "Te invitamos a que nos acompanes al acto de entrega de certificados a los ganadores de la Beca a la Excelencia del trimestre septiembre-diciembre 2025.",
    date: "28 Ene 2026",
  },
  {
    title: "Nuevo sistema digital para gestion de becas en UNIMAR",
    excerpt:
      "La plataforma permitira registrar datos, adjuntar documentos y monitorear el estado de las solicitudes de manera eficiente y transparente.",
    date: "15 Ene 2026",
  },
]

const becas = [
  {
    icon: GraduationCap,
    title: "Beca Academica",
    description: "Para estudiantes con promedio superior a 16 puntos. Cobertura hasta 50%.",
  },
  {
    icon: Heart,
    title: "Beca Socioeconomica",
    description: "Segun estudio del perfil socioeconomico del nucleo familiar. Hasta 70%.",
  },
  {
    icon: Trophy,
    title: "Beca Deportiva",
    description: "Para atletas que representen a la universidad en competencias. Hasta 40%.",
  },
  {
    icon: Award,
    title: "Beca a la Excelencia",
    description: "Mejores promedios por carrera en cada trimestre. Hasta 100%.",
  },
]

export function ScholarshipsSection() {
  return (
    <section id="becas" className="bg-[#f0f4f8] py-12">
      <div className="mx-auto max-w-7xl px-4">
        {/* Two-column portal layout: Noticias + Tipos de Becas (like portalunimar) */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Noticias - Left column (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between border-b-2 border-[#1e3a5f] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Noticias</h2>
              <Link href="/becas" className="flex items-center gap-1 text-sm font-medium text-[#1e3a5f] hover:text-[#d4a843]">
                Ver mas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-5">
              {noticias.map((noticia) => (
                <article
                  key={noticia.title}
                  className="flex flex-col gap-3 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row"
                >
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]">
                    <GraduationCap className="h-8 w-8 text-[#d4a843]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#1e3a5f] leading-snug">
                      {noticia.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280]">
                      {noticia.excerpt}
                    </p>
                    <span className="mt-2 inline-block text-xs font-medium text-[#9ca3af]">
                      {noticia.date}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Tipos de Becas - Right column (1/3 width, like Cartelera) */}
          <div>
            <div className="mb-6 flex items-center justify-between border-b-2 border-[#d4a843] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Tipos de Becas</h2>
              <Link href="/becas" className="flex items-center gap-1 text-sm font-medium text-[#1e3a5f] hover:text-[#d4a843]">
                Ver mas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {becas.map((beca) => (
                <div
                  key={beca.title}
                  className="flex items-start gap-3 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/10">
                    <beca.icon className="h-5 w-5 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1e3a5f]">{beca.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
                      {beca.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
