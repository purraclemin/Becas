import Link from "next/link"
import { ArrowRight, Calendar, MapPin, Phone, Mail } from "lucide-react"

export function CtaSection() {
  return (
    <section className="bg-[#1e3a5f] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* CTA - Convocatoria */}
          <div className="rounded-lg border border-[#2d4a6f] bg-[#16304f] p-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#d4a843]/20 px-3 py-1 text-xs font-semibold text-[#d4a843]">
              <Calendar className="h-3.5 w-3.5" />
              Convocatoria Abierta
            </div>
            <h2 className="text-2xl font-extrabold text-[#ffffff] font-serif md:text-3xl text-balance">
              No pierdas la oportunidad de obtener tu beca
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#8a9bbd]">
              La convocatoria para el trimestre enero-abril 2026 esta abierta. Registrate en
              nuestra plataforma y comienza tu proceso de solicitud hoy.
            </p>
            <p className="mt-3 text-xs text-[#6b829e]">
              Fecha limite de postulacion: 28 de febrero de 2026
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#"
                className="flex items-center justify-center gap-2 rounded-md bg-[#d4a843] px-6 py-2.5 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#c49a3a]"
              >
                Comenzar Solicitud
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-center gap-2 rounded-md border border-[#4a6a8f] px-6 py-2.5 text-sm font-medium text-[#c7d4e6] transition-colors hover:bg-[#2d4a6f]"
              >
                Mas Informacion
              </Link>
            </div>
          </div>

          {/* Location info - like portalunimar "Ubicacion" */}
          <div className="rounded-lg border border-[#2d4a6f] bg-[#16304f] p-8">
            <h2 className="mb-4 text-xl font-bold text-[#ffffff] font-serif">Ubicacion</h2>
            <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-[#0a1628]">
              <iframe
                title="Ubicacion UNIMAR"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.0!2d-63.9!3d11.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sUNIMAR!5e0!3m2!1ses!2sve"
                className="h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5 text-sm text-[#8a9bbd]">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#d4a843]" />
                <span>Av. Concepcion Marino, Sector El Toporo, El Valle del Espiritu Santo, Edo. Nueva Esparta, Venezuela.</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#8a9bbd]">
                <Phone className="h-4 w-4 flex-shrink-0 text-[#d4a843]" />
                <span>0412.102.2538 / 0412.595.7440 / 0412.595.7430</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-[#8a9bbd]">
                <Mail className="h-4 w-4 flex-shrink-0 text-[#d4a843]" />
                <span>info@unimar.edu.ve</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
