import { Navbar } from "@/components/navbar/navbar"
import { HeroSection } from "@/components/hero-section"
import { ScholarshipsSection } from "@/components/scholarships-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import { CtaSection } from "@/components/cta-section"
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
    <main className="min-h-screen w-full flex flex-col bg-slate-50">
      <Navbar />
      <HeroSection />

      {/* Quick nav grid - portal style with fluid full-bleed container */}
      <section className="bg-white py-10 md:py-14 border-b border-[#e2e8f0]">
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickNav.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col items-center gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#1e3a5f]/30 active:scale-95"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${item.color} text-white shadow-md transition-transform group-hover:rotate-6`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm md:text-base font-black text-[#1e3a5f] uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed px-1">
                    {item.description}
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1 text-xs font-bold text-[#1e3a5f]">
                  <span>Acceder</span>
                  <ArrowRight className="h-4 w-4 text-[#d4a843] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ScholarshipsSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  )
}