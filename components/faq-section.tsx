"use client"

import { useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Quién tiene la potestad de otorgar las becas?",
    answer: "El otorgamiento de Becas y Ayudas Económicas es potestad exclusiva del Consejo Superior de la Universidad de Margarita, tras analizar el estudio realizado por el Departamento de Bienestar Estudiantil y la disponibilidad presupuestaria.",
  },
  {
    question: "¿Cuál es la vigencia de una beca otorgada?",
    answer: "Toda subvención, ya sea total o parcial, tiene una duración de un (1) periodo académico. Para su renovación, el beneficio debe ser revisado y evaluado al culminar cada lapso.",
  },
  {
    question: "¿Qué compromiso deben cumplir los becarios de aprendizaje?",
    answer: "Los beneficiarios de la Beca Aprendizaje y Beca Social Aprendizaje deben cumplir un plan de actividades de quince (15) horas semanales de apoyo administrativo para complementar su aprendizaje académico.",
  },
  {
    question: "¿Qué requisitos académicos debo mantener para no perder el beneficio?",
    answer: "Es obligatorio inscribir la máxima carga académica permitida y mantener el índice académico exigido (mínimo 16 pts para aprendizaje y 18 pts para social o excelencia). Además, se requiere una evaluación de desempeño positiva del tutor supervisor.",
  },
  {
    question: "¿Puedo optar nuevamente a una beca si renuncio o me es suspendida?",
    answer: "No. Según la normativa, todo estudiante que renuncie o a quien se le suspenda el beneficio por causas imputables (como bajo rendimiento o sanciones), no podrá optar nuevamente al mismo.",
  },
  {
    question: "¿Existen beneficios por formar parte de grupos culturales o deportivos?",
    answer: "Sí, los estudiantes que integran clubes deportivos, actividades culturales u orfeón pueden optar a una Ayuda Económica del 20% de descuento, siempre que mantengan un promedio igual o mayor a 16 puntos.",
  },
]

export function FaqSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="bg-[#f0f4f8] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Preguntas Frecuentes (Normativa 2023)</h2>
            </div>

            {mounted ? (
              <Accordion type="single" collapsible className="flex flex-col gap-2">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-5 shadow-sm"
                  >
                    <AccordionTrigger className="py-4 text-left text-sm font-semibold text-[#1e3a5f] hover:text-[#d4a843] hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-sm leading-relaxed text-[#6b7280]">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="h-[400px] w-full animate-pulse rounded-lg bg-gray-200" />
            )}
          </div>

          <div>
            <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Contacto Oficial</h2>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1e3a5f]">
                Bienestar Estudiantil UNIMAR
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
                De conformidad con el Artículo 4, el Departamento de Bienestar Estudiantil es el responsable de la planificación y control del proceso de becas.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-md bg-[#f0f4f8] p-3">
                  <div className="text-xs font-semibold text-[#1e3a5f]">Canal Oficial</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">becas@unimar.edu.ve</div>
                </div>
                <div className="rounded-md bg-[#f0f4f8] p-3">
                  <div className="text-xs font-semibold text-[#1e3a5f]">Ubicación del Proceso</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">Departamento de Bienestar Estudiantil</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}