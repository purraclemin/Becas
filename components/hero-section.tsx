"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    image: "/images/ourinstitution.jpg",
    title: "Sistema de Gestion de Becas",
    subtitle: "Plataforma digital para estudiantes de pregrado de la Universidad de Margarita",
  },
  {
    image: "/images/ourinstitution.jpg",
    title: "Convocatoria Abierta 2026",
    subtitle: "Solicita tu beca academica, socioeconomica, deportiva o de excelencia",
  },
  {
    image: "/images/ourinstitution.jpg",
    title: "Tu futuro comienza aqui",
    subtitle: "Mas de 500 becas otorgadas apoyando el talento y esfuerzo de nuestros estudiantes",
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)

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
    <section className="relative h-[340px] overflow-hidden sm:h-[420px] md:h-[480px] lg:h-[520px]">
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
          <div className="absolute inset-0 bg-[#0a1628]/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <h2 className="text-2xl font-extrabold text-[#ffffff] font-serif sm:text-3xl md:text-5xl lg:text-6xl text-balance drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#d1d9e6] sm:text-lg md:text-xl leading-relaxed text-pretty">
                {slide.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-[#000000]/30 p-2 text-[#ffffff] backdrop-blur-sm transition-colors hover:bg-[#000000]/50"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Siguiente slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-[#000000]/30 p-2 text-[#ffffff] backdrop-blur-sm transition-colors hover:bg-[#000000]/50"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Ir al slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all ${index === current ? "w-8 bg-[#d4a843]" : "w-2.5 bg-[#ffffff]/50 hover:bg-[#ffffff]/80"}`}
          />
        ))}
      </div>
    </section>
  )
}
