import { Navbar } from "@/components/navbar"
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
      <section className="bg-[#ffffff] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {quickNav.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col items-center gap-3 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${item.color} text-[#ffffff] shadow-md transition-transform group-hover:scale-110`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e3a5f]">{item.title}</h3>
                  <p className="mt-0.5 text-xs text-[#6b7280]">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[#d4a843] opacity-0 transition-opacity group-hover:opacity-100" />
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
