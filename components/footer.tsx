import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react"

const footerLinks = {
  "Accesos Rápida": [
    { label: "Solicitar Beca", href: "/becas" },
    { label: "Requisitos", href: "/requisitos" },
    { label: "Proceso", href: "/proceso" },
    { label: "Servicios", href: "/servicios" },
  ],
  "Atención al Estudiante": [
    { label: "Preguntas Frecuentes", href: "#faq" },
    { label: "Consulta de Estado", href: "/perfil" },
    { label: "Soporte Institucional", href: "#" },
  ],
  "Contacto Directo": [
    { label: "Coordinación de Becas", href: "mailto:becas@unimar.edu.ve" },
    { label: "Atención Telefónica", href: "tel:+582952600000" },
    { label: "Ubicación General", href: "#" },
  ],
  "Horario de Atención": [
    { label: "Lunes a Viernes", href: "#" },
    { label: "8:00 AM - 4:00 PM", href: "#" },
    { label: "Edificio Administrativo", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer id="contacto" className="bg-[#111b2e] w-full">
      {/* Main footer */}
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f]">
                <span className="text-lg font-extrabold text-[#d4a843] font-serif">U</span>
              </div>
              <div>
                <span className="block text-sm font-extrabold tracking-wide text-[#ffffff] font-serif">UNIMAR</span>
                <span className="block text-[10px] text-[#6b829e]">Gestión de Becas</span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#6b829e]">
              Av. Concepción Mariño, Sector El Toporo, El Valle del Espíritu Santo, Edo. Nueva Esparta, Venezuela.
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              <Link href="#" aria-label="Facebook" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-[#8a9bbd] transition-colors hover:bg-[#d4a843] hover:text-[#1e3a5f]">
                <Facebook className="h-3.5 w-3.5" />
              </Link>
              <Link href="#" aria-label="Instagram" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-[#8a9bbd] transition-colors hover:bg-[#d4a843] hover:text-[#1e3a5f]">
                <Instagram className="h-3.5 w-3.5" />
              </Link>
              <Link href="#" aria-label="Twitter" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-[#8a9bbd] transition-colors hover:bg-[#d4a843] hover:text-[#1e3a5f]">
                <Twitter className="h-3.5 w-3.5" />
              </Link>
              <Link href="#" aria-label="YouTube" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-[#8a9bbd] transition-colors hover:bg-[#d4a843] hover:text-[#1e3a5f]">
                <Youtube className="h-3.5 w-3.5" />
              </Link>
              <Link href="#" aria-label="Correo" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-[#8a9bbd] transition-colors hover:bg-[#d4a843] hover:text-[#1e3a5f]">
                <Mail className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#d4a843]">
                {title}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-[#6b829e] transition-colors hover:text-[#ffffff]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1e2d44] w-full">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 xl:px-10 py-4 sm:flex-row">
          <p className="text-[10px] text-[#4a5d7a]">
            {'Copyright 2001-2026 Universidad de Margarita, Rif: J-30660040-0. Isla de Margarita - Venezuela.'}
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-[10px] text-[#4a5d7a] hover:text-[#8a9bbd]">
              Términos de Uso
            </Link>
            <Link href="#" className="text-[10px] text-[#4a5d7a] hover:text-[#8a9bbd]">
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}