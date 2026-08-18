import Link from "next/link"
import { ArrowRight, Calendar, MapPin, Phone, Mail, Building2 } from "lucide-react"

export function CtaSection() {
  return (
    <section className="bg-[#f8fafc] py-8 w-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          
          {/* Bloque Izquierdo: CTA Convocatoria */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#1e3a5f]/20 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#1e3a5f]/40 hover:shadow">
            {/* Resplandor decorativo de fondo */}
            <div className="absolute -top-20 -left-20 h-48 w-48 rounded-full bg-[#d4a843]/5 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d4a843]/30 bg-[#d4a843]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#b8860b]">
                <Calendar className="h-3 w-3" />
                Proceso de Selección Vigente
              </div>

              <h2 className="text-xl font-extrabold text-[#1e3a5f] font-serif sm:text-2xl leading-snug">
                Impulsa tu formación académica con el apoyo de UNIMAR
              </h2>

              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                De acuerdo con la planificación académica, el Departamento de Bienestar Estudiantil
                gestiona las solicitudes para cada período. Asegúrate de cumplir con los lapsos
                publicados en los canales oficiales de la institución.
              </p>

              <p className="mt-2 text-[11px] italic text-slate-500">
                * Sujeto a disponibilidad presupuestaria y aprobación del Consejo Superior.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/postulacion"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#d4a843] px-4 py-2 text-xs font-bold text-[#1e3a5f] shadow-sm transition-all hover:bg-[#c49a3a] active:scale-95"
              >
                Iniciar Solicitud
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <a
                href="/formatos/NORMAS-BECAS-Y-AYUDAS.pdf"
                download="NORMAS-BECAS-Y-AYUDAS.pdf"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#1e3a5f] bg-transparent px-4 py-2 text-xs font-bold text-[#1e3a5f] transition-all hover:bg-[#1e3a5f] hover:text-white"
              >
                Ver Reglamentos
              </a>
            </div>
          </div>

          {/* Bloque Derecho: Ubicación e Información de Contacto */}
          <div className="flex flex-col justify-between rounded-xl border border-[#1e3a5f]/20 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#1e3a5f]/40 hover:shadow">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-[#d4a843]" />
                <h3 className="text-base font-bold text-[#1e3a5f] font-serif">Ubicación Institucional</h3>
              </div>

              <div className="relative mb-4 w-full h-[110px] sm:h-[125px] overflow-hidden rounded-lg border border-[#1e3a5f]/20 bg-slate-50 shadow-inner">
                <iframe
                  title="Ubicación UNIMAR"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.244307525232!2d-63.885834624103755!3d10.983050059231614!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c318f77967b072b%3A0x6b4c9b369f80164c!2sUniversidad%20de%20Margarita!5e0!3m2!1ses!2sve!4v1708535000000!5m2!1ses!2sve"
                  className="h-full w-full border-0 grayscale transition-all duration-500 hover:grayscale-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            <div className="grid gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d4a843]" />
                <span>El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#d4a843]" />
                <span>Contacto: Bienestar Estudiantil / Secretaría General</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#d4a843]" />
                <a href="mailto:info@unimar.edu.ve" className="font-medium transition-colors hover:text-[#d4a843]">
                  info@unimar.edu.ve
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}