"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Quien puede solicitar una beca en UNIMAR?",
    answer:
      "Todos los estudiantes regulares de pregrado de la Universidad de Margarita que esten inscritos en el trimestre vigente y no posean deudas academicas o administrativas pendientes.",
  },
  {
    question: "Cuantas becas puedo solicitar al mismo tiempo?",
    answer:
      "Cada estudiante puede postularse a un solo tipo de beca por trimestre. Sin embargo, si no es seleccionado, puede aplicar a otro tipo de beca en el siguiente periodo.",
  },
  {
    question: "Cual es el plazo para subir los documentos?",
    answer:
      "Los documentos deben ser cargados en la plataforma antes de la fecha limite de cada convocatoria. Generalmente se otorgan 15 dias habiles a partir de la apertura del proceso.",
  },
  {
    question: "Como puedo conocer el estado de mi solicitud?",
    answer:
      "A traves de la plataforma puedes monitorear el estado de tu solicitud en tiempo real. Ademas, recibiras notificaciones por correo electronico cada vez que haya una actualizacion.",
  },
  {
    question: "Que sucede si mi beca es aprobada?",
    answer:
      "Si tu beca es aprobada, el descuento correspondiente se aplicara automaticamente a tu estado de cuenta para el siguiente trimestre. Recibiras un certificado digital de beneficiario.",
  },
  {
    question: "Puedo renovar mi beca?",
    answer:
      "Si, las becas son renovables trimestralmente siempre que el estudiante mantenga los requisitos de elegibilidad correspondientes al tipo de beca otorgada.",
  },
]

export function FaqSection() {
  return (
    <section className="bg-[#f0f4f8] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* FAQ - 2/3 */}
          <div className="lg:col-span-2">
            <div className="mb-6 border-b-2 border-[#1e3a5f] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Preguntas Frecuentes</h2>
            </div>

            <Accordion type="single" collapsible className="flex flex-col gap-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
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
          </div>

          {/* Sidebar info - 1/3 */}
          <div>
            <div className="mb-6 border-b-2 border-[#d4a843] pb-2">
              <h2 className="text-xl font-bold text-[#1e3a5f] font-serif">Contacto Becas</h2>
            </div>
            <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1e3a5f]">
                Decanato de Bienestar Estudiantil
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
                Para consultas sobre el proceso de becas, comunicate con nosotros a traves de los
                siguientes canales:
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="rounded-md bg-[#f0f4f8] p-3">
                  <div className="text-xs font-semibold text-[#1e3a5f]">Correo Electronico</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">becas@unimar.edu.ve</div>
                </div>
                <div className="rounded-md bg-[#f0f4f8] p-3">
                  <div className="text-xs font-semibold text-[#1e3a5f]">Telefono</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">0412.595.7430</div>
                </div>
                <div className="rounded-md bg-[#f0f4f8] p-3">
                  <div className="text-xs font-semibold text-[#1e3a5f]">WhatsApp</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">0412.595.7430</div>
                </div>
                <div className="rounded-md bg-[#f0f4f8] p-3">
                  <div className="text-xs font-semibold text-[#1e3a5f]">Horario de Atencion</div>
                  <div className="mt-0.5 text-xs text-[#6b7280]">Lunes a Viernes, 8:00am - 4:00pm</div>
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-lg">
              <img
                src="/images/ourinstitution.jpg"
                alt="Estudiantes de UNIMAR"
                className="h-48 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
