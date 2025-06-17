"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TextAnimate } from "@/components/ui/text-animate"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQS = [
  {
    question: "Como funciona o processo de reserva?",
    answer:
      "O processo é muito simples! Você escolhe seu pacote, preenche os dados, faz o pagamento e pronto. Nossa equipe entra em contato para confirmar todos os detalhes e enviar o roteiro completo da sua viagem.",
    category: "Reservas",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer:
      "Aceitamos cartão de crédito (até 12x), PIX, transferência bancária e boleto. Para pagamentos à vista, oferecemos desconto especial. Também trabalhamos com parcelamento personalizado.",
    category: "Pagamento",
  },
  {
    question: "Os passeios incluem alimentação?",
    answer:
      "Depende do pacote escolhido. Nossos pacotes completos incluem café da manhã na hospedagem e algumas refeições nos passeios. Sempre informamos detalhadamente o que está incluso em cada roteiro.",
    category: "Passeios",
  },
  {
    question: "Posso cancelar ou alterar minha reserva?",
    answer:
      "Sim! Temos política flexível de cancelamento. Até 30 dias antes da viagem, reembolso de 100%. Entre 15-30 dias, 80%. Alterações de datas podem ser feitas sem custo adicional conforme disponibilidade.",
    category: "Cancelamento",
  },
  {
    question: "As hospedagens são próprias da Nice Trip?",
    answer:
      "Temos 3 hospedagens próprias em Canasvieiras com ótima localização e custo-benefício. Também trabalhamos com parceiros selecionados para oferecer mais opções de acordo com seu perfil e orçamento.",
    category: "Hospedagem",
  },
  {
    question: "Os guias são locais e experientes?",
    answer:
      "Sim! Todos nossos guias são locais, apaixonados por Floripa e região, com anos de experiência. Eles conhecem os melhores lugares, horários ideais e histórias que só quem vive aqui sabe contar.",
    category: "Guias",
  },
  {
    question: "Vocês oferecem seguro viagem?",
    answer:
      "Todos nossos pacotes incluem seguro básico de viagem. Para maior tranquilidade, oferecemos também seguros mais completos com cobertura ampliada por um valor adicional.",
    category: "Segurança",
  },
  {
    question: "Como funciona o traslado do aeroporto?",
    answer:
      "Nosso traslado é pontual e confortável, com veículos próprios e motoristas experientes. Monitoramos seu voo e estamos sempre no horário. O serviço está incluso na maioria dos nossos pacotes.",
    category: "Transporte",
  },
]

export function FaqSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-[70px]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center">
              <Badge className="bg-[#EE7215]/10 text-[#EE7215] border-[#EE7215]/20 px-4 py-2">FAQ</Badge>
            </div>
            <TextAnimate
              as="h2"
              className="text-[24px] lg:text-[24px] font-bold text-gray-900"
              animation="slideUp"
              by="word"
              delay={0.1}
              duration={0.6}
              once={true}
            >
              Perguntas Frequentes
            </TextAnimate>
            
            <TextAnimate
              as="p"
              className="text-[16px] text-gray-600 max-w-lg mx-auto"
              animation="slideUp"
              by="word"
              delay={0.3}
              duration={0.6}
              once={true}
            >
              Tire suas dúvidas sobre nossos serviços e planeje sua viagem com total tranquilidade.
            </TextAnimate>
          </div>

          {/* FAQ Items */}
          <Accordion type="single" collapsible className="space-y-4">
            {FAQS.map((item, index) => (
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

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4 text-lg">Ainda tem dúvidas? Nossa equipe está pronta para ajudar!</p>
            <Button className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white px-8 py-3 rounded-lg font-medium">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
