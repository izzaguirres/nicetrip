"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TextAnimate } from "@/components/ui/text-animate"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQS = [
  {
    question: "¿Cómo puedo reservar un paquete?",
    answer:
      "Solo tenés que usar el buscador en la parte superior de la página para encontrar la opción ideal. Al hacer clic en \"Reservar\", serás redirigido directamente a nuestro WhatsApp",
    category: "Reservas",
  },
  {
    question: "¿Los paseos están incluidos en el paquete?",
    answer:
      "Nuestros paquetes incluyen transporte (Bus o Aéreo), alojamiento y regreso. Los paseos locales se contratan por separado. ⚠️ Solo están incluidos en los paquetes de octubre y noviembre.",
    category: "Paseos",
  },
  {
    question: "¿Puedo reservar solo el alojamiento?",
    answer:
      "¡Sí! Podés reservar únicamente la estadía en uno de nuestros hoteles, sin necesidad de contratar paseos, traslados ni paquetes.",
    category: "Hospedaje",
  },
  {
    question: "¿Qué formas de pago aceptan?",
    answer:
      "Aceptamos pagos vía Pix en nuestras cuentas de Brasil, y también transferencias o depósitos en dólares en nuestras cuentas en Argentina.",
    category: "Pagos",
  },
  {
    question: "¿Nice Trip es una agencia confiable?",
    answer:
      "Con más de 13 años de experiencia y operación propia en Florianópolis, ya realizamos miles de viajes con seguridad, soporte personalizado y total transparencia.",
    category: "Confianza",
  },
  {
    question: "¿Puedo cancelar o modificar mi reserva?",
    answer:
      "Sí. Tenemos una política de cancelación clara, disponible en nuestro sitio web en la sección de \"Condiciones Generales\".",
    category: "Cancelación",
  },
  {
    question: "¿Ofrecen seguro de viaje?",
    answer:
      "Todos nuestros paquetes incluyen seguro médico con cobertura internacional. También podés contratar un seguro ampliado con cobertura extra por un costo adicional.",
    category: "Seguro",
  },
  {
    question: "¿Cómo funciona la atención por WhatsApp?",
    answer:
      "Nuestro equipo está disponible en horario comercial para atenderte con agilidad y atención. Siempre que lo necesites, estamos a un mensaje de distancia.",
    category: "Soporte",
  },
]

export function FaqSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-[70px]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Preguntas Frecuentes
            </h2>
            
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              <span className="block">Resolvé todas tus dudas sobre nuestros servicios</span>
              <span className="block">y planificá tu viaje con total tranquilidad.</span>
            </p>
          </div>

          {/* FAQ Items */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            {/* Primeira coluna (primeiras 4 perguntas) */}
            <div className="space-y-4">
              <Accordion type="single" collapsible className="space-y-4">
                {FAQS.slice(0, 4).map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className={cn(
                      "mb-4 rounded-xl",
                      "bg-white border border-gray-100",
                      "shadow-sm hover:shadow-md transition-shadow duration-200",
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        "px-6 py-4 text-left hover:no-underline",
                        "data-[state=open]:border-b data-[state=open]:border-gray-100",
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="w-fit text-xs font-normal bg-gray-100 text-gray-600">
                          {item.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900 text-left">{item.question}</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pt-2 pb-6">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Segunda coluna (últimas 4 perguntas) */}
            <div className="space-y-4 mt-4 lg:mt-0">
              <Accordion type="single" collapsible className="space-y-4">
                {FAQS.slice(4, 8).map((item, index) => (
                  <AccordionItem
                    key={index + 4}
                    value={`item-${index + 4}`}
                    className={cn(
                      "mb-4 rounded-xl",
                      "bg-white border border-gray-100",
                      "shadow-sm hover:shadow-md transition-shadow duration-200",
                    )}
                  >
                    <AccordionTrigger
                      className={cn(
                        "px-6 py-4 text-left hover:no-underline",
                        "data-[state=open]:border-b data-[state=open]:border-gray-100",
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="w-fit text-xs font-normal bg-gray-100 text-gray-600">
                          {item.category}
                        </Badge>
                        <h3 className="text-lg font-semibold text-gray-900 text-left">{item.question}</h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pt-2 pb-6">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4 text-lg">
              ¿Todavía tenés dudas?<br />
              ¡Nuestro equipo está listo para ayudarte!
            </p>
            <Button className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white px-8 py-3 rounded-lg font-medium">
              Hablar con Especialista
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
