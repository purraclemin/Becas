import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { BECAS_DATA } from "@/lib/scholarships-data"

export function ScholarshipsSection() {
  const featuredBecas = BECAS_DATA.filter((beca) => beca.featured)

  return (
    <section id="becas" className="bg-[#f8fafc] py-6 sm:py-8 w-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        
        {/* Encabezado Principal */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d4a843]">
              Programas Destacados
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#1e3a5f] font-serif">
              Modalidades Principales de Becas
            </h2>
          </div>
          <Link 
            href="/becas" 
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:text-[#d4a843]"
          >
            Ver todas las modalidades y ayudas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid de 4 Becas Principales (Tarjetas compactas) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredBecas.map((beca) => {
            const Icon = beca.icon
            return (
              <div
                key={beca.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#1e3a5f]/20 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a5f]/5 text-[#1e3a5f] transition-colors group-hover:bg-[#1e3a5f] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-[#d4a843]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#1e3a5f]">
                      {beca.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1e3a5f] font-serif mb-1.5 leading-snug">
                    {beca.title}
                  </h3>
                  
                  <p className="text-xs leading-relaxed text-slate-600 font-normal line-clamp-3">
                    {beca.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href="/postulacion"
                    className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#1e3a5f] transition-colors group-hover:text-[#d4a843]"
                  >
                    Postularme <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}