"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, FileText, User, LogIn } from "lucide-react"
import Link from "next/link"
import { getSession } from "@/lib/ActionsSession" // Ajusta la ruta según tu estructura

const slides = [
  {
    image: "/images/ourinstitution.jpg",
    title: "Gestión de Becas y Ayudas",
    subtitle: "Procesamiento y seguimiento de subvenciones estudiantiles de la Universidad de Margarita conforme a la normativa vigente.",
  },
  {
    image: "/images/ourinstitution.jpg",
    title: "Modalidades de Beneficio",
    subtitle: "Programas de Aprendizaje, Social Aprendizaje, Discapacidad y Excelencia Académica para estudiantes regulares.",
  },
  {
    image: "/images/ourinstitution.jpg",
    title: "Compromiso con la Excelencia",
    subtitle: "Apoyamos el desarrollo de destrezas y habilidades que complementen el aprendizaje académico de nuestros becarios.",
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Verificación con la Server Action
    getSession().then((session) => {
      if (session?.isLoggedIn) {
        setIsLoggedIn(true)
      }
    })
  }, [])

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative w-full h-[210px] overflow-hidden sm:h-[240px] md:h-[270px] lg:h-[300px] mt-[73px] sm:mt-[81px]">
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <img
            src={slide.image || "/placeholder.svg"}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a1628]/70" />
          <div className="absolute inset-0 flex items-center justify-center w-full px-4 sm:px-6">
            <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-12 text-center mt-2 sm:mt-4">
              <h2 className="text-xl font-extrabold text-[#ffffff] font-serif sm:text-2xl md:text-3xl lg:text-4xl text-balance drop-shadow-lg uppercase tracking-tight">
                {slide.title}
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-xs text-[#d1d9e6] sm:text-sm md:text-base leading-relaxed text-pretty font-medium mb-4">
                {slide.subtitle}
              </p>
              
              {/* Action-Driven CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pointer-events-auto">
                <Link
                  href="/postulacion"
                  className="group flex items-center justify-center gap-2 rounded-full bg-[#d4a843] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#1e3a5f] transition-all hover:bg-[#e5bc55] hover:scale-105 hover:shadow-[0_0_20px_rgba(212,168,67,0.4)] active:scale-95 w-full sm:w-auto"
                >
                  <FileText className="h-4 w-4" />
                  Iniciar Postulación
                </Link>

                {mounted && (
                  isLoggedIn ? (
                    <Link
                      href="/perfil"
                      className="group flex items-center justify-center gap-2 rounded-full border-2 border-[#ffffff]/30 bg-[#1e3a5f]/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#ffffff] backdrop-blur-sm transition-all hover:border-[#ffffff]/60 hover:bg-[#1e3a5f]/60 hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                      <User className="h-4 w-4" />
                      Consultar Perfil
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      className="group flex items-center justify-center gap-2 rounded-full border-2 border-[#ffffff]/30 bg-[#1e3a5f]/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#ffffff] backdrop-blur-sm transition-all hover:border-[#ffffff]/60 hover:bg-[#1e3a5f]/60 hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                      <LogIn className="h-4 w-4" />
                      Iniciar Sesión
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 rounded-full bg-[#000000]/30 p-2 text-[#ffffff] backdrop-blur-sm transition-colors hover:bg-[#000000]/50 pointer-events-auto"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente slide"
        className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 rounded-full bg-[#000000]/30 p-2 text-[#ffffff] backdrop-blur-sm transition-colors hover:bg-[#000000]/50 pointer-events-auto"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 pointer-events-auto">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Ir al slide ${index + 1}`}
            className={`h-2 rounded-full transition-all ${index === current ? "w-6 bg-[#d4a843]" : "w-2 bg-[#ffffff]/50 hover:bg-[#ffffff]/80"}`}
          />
        ))}
      </div>
    </section>
  )
}