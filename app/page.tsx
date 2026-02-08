import { Navbar } from "@/components/navbar/navbar"
import { HeroSection } from "@/components/hero-section"
import { ScholarshipsSection } from "@/components/scholarships-section"
import { CtaSection } from "@/components/cta-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { GraduationCap, FileText, ClipboardCheck, Headphones, ArrowRight } from "lucide-react"
import Link from "next/link"

const quickNav = [
  {
    icon: GraduationCap,
    title: "Becas",
    description: "Conoce los tipos de becas disponibles y sus coberturas",
    href: "/becas",
    color: "bg-[#1e3a5f]",
  },
  {
    icon: FileText,
    title: "Requisitos",
    description: "Documentos y criterios para postularte",
    href: "/requisitos",
    color: "bg-[#2a6041]",
  },
  {
    icon: ClipboardCheck,
    title: "Proceso",
    description: "Pasos para completar tu solicitud",
    href: "/proceso",
    color: "bg-[#8b5e1b]",
  },
  {
    icon: Headphones,
    title: "Servicios",
    description: "Herramientas y enlaces institucionales",
    href: "/servicios",
    color: "bg-[#5a3070]",
  },
]

export default function Page() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Quick nav grid - portal style */}
      <section className="bg-[#ffffff] py-8 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          {/* - grid-cols-1: 1 columna en celulares pequeños.
            - sm:grid-cols-2: 2 columnas en celulares grandes/tablets.
            - lg:grid-cols-4: 4 columnas en monitores.
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickNav.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col items-center gap-3 rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${item.color} text-[#ffffff] shadow-md transition-transform group-hover:rotate-6`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm md:text-base font-black text-[#1e3a5f] uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[11px] md:text-xs text-[#6b7280] leading-tight px-2">
                    {item.description}
                  </p>
                </div>
                {/* Flecha visible en hover para escritorio, oculta en móvil para limpieza visual */}
                <div className="mt-auto pt-2">
                  <ArrowRight className="h-5 w-5 text-[#d4a843] opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ScholarshipsSection />
      <CtaSection />
      <FaqSection />
      <Footer />
    </main>
  )
}