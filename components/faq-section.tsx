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
    question: "¿Quién tiene la potestad de otorgar las becas y ayudas económicas?",
    answer: "El otorgamiento de Becas y Ayudas Económicas es potestad exclusiva del Consejo Superior de la Universidad de Margarita, tomando en cuenta la disponibilidad presupuestaria institucional.",
  },
  {
    question: "¿Cuál es la vigencia de una beca otorgada?",
    answer: "Toda subvención (Beca Aprendizaje, Beca Social Aprendizaje, Beca por Discapacidad o Beca a la Excelencia Académica) tiene una vigencia de un (1) período académico, y debe revisarse al finalizar cada lapso para su renovación.",
  },
  {
    question: "¿Qué compromiso deben cumplir los becarios de aprendizaje y social aprendizaje?",
    answer: "Deben cumplir un plan de actividades de quince (15) horas semanales de apoyo administrativo o académico, bajo la supervisión del tutor asignado por el Departamento de Bienestar Estudiantil.",
  },
  {
    question: "¿Qué requisitos son obligatorios para mantener el beneficio de beca?",
    answer: "Es obligatorio cursar siempre la máxima carga académica permitida, mantener el índice académico trimestral exigido (mínimo 16 puntos para aprendizaje/discapacidad y 18 puntos para social/excelencia), aprobar la evaluación trimestral de rendimiento y mantener una conducta intachable.",
  },
  {
    question: "¿Qué sucede si renuncio a la beca o me es suspendida?",
    answer: "Según el artículo 28 de la normativa vigente, todo estudiante beneficiario que renuncie o a quien se le suspenda el beneficio no podrá optar nuevamente a este.",
  },
  {
    question: "¿Existen descuentos por participación en actividades culturales o deportivas?",
    answer: "Sí, los estudiantes activos en clubes deportivos, actividades culturales u orfeón que posean un índice académico igual o mayor a 16 puntos pueden recibir un 20% de descuento en la matrícula.",
  },
]

export function FaqSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="bg-[#f0f4f8] py-12 w-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
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
                De conformidad con el Artículo 4, el Departamento de Bienestar Estudiantil gestiona la planificación, organización, ejecución y control del proceso de becas.
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