"use client"

import { motion } from "framer-motion"
import { TextAnimate } from "@/components/ui/text-animate"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns"

const testimonials = [
  {
    text: "A Nice Trip transformou nossa lua de mel em algo mágico! O atendimento foi impecável desde o primeiro contato até nossa volta. Recomendamos de olhos fechados!",
    image: "https://originui.com/avatar-80-03.jpg",
    name: "Marina & Carlos",
    role: "Lua de Mel em Floripa",
  },
  {
    text: "Viagem em família perfeita! As crianças adoraram os passeios e nós ficamos tranquilos com toda a organização. Hospedagem excelente e guias super atenciosos.",
    image: "https://originui.com/avatar-80-04.jpg",
    name: "Família Santos",
    role: "Férias em Família",
  },
  {
    text: "Primeira vez em Florianópolis e não poderia ter escolhido melhor! O city tour foi incrível e conhecemos lugares que jamais encontraríamos sozinhos.",
    image: "https://originui.com/avatar-80-05.jpg",
    name: "Ana Paula",
    role: "Turismo em Floripa",
  },
  {
    text: "O traslado do aeroporto foi pontual e confortável. A hospedagem em Canasvieiras tinha localização perfeita. Voltaremos com certeza!",
    image: "https://originui.com/avatar-80-06.jpg",
    name: "Roberto Silva",
    role: "Viagem de Negócios",
  },
  {
    text: "Beto Carrero com a Nice Trip foi uma experiência única! Tudo organizado, sem filas e com o melhor custo-benefício. Nossos filhos ainda falam da viagem!",
    image: "/placeholder.svg?height=40&width=40&query=happy family mother",
    name: "Juliana Costa",
    role: "Passeio Beto Carrero",
  },
  {
    text: "Aluguel de carro facilitou muito nossa exploração pela região. Veículo novo, documentação em dia e atendimento excepcional. Super recomendo!",
    image: "/placeholder.svg?height=40&width=40&query=happy traveler man",
    name: "Pedro Oliveira",
    role: "Aluguel de Carro",
  },
  {
    text: "Ilha do Campeche foi um sonho realizado! Águas cristalinas, passeio bem organizado e guia que conhecia cada cantinho. Experiência inesquecível!",
    image: "/placeholder.svg?height=40&width=40&query=happy woman beach",
    name: "Camila Ferreira",
    role: "Passeio Ilha do Campeche",
  },
  {
    text: "Bombinhas com a Nice Trip superou todas as expectativas! Praias paradisíacas, mergulho incrível e toda a logística perfeita. Voltaremos em breve!",
    image: "/placeholder.svg?height=40&width=40&query=happy couple beach",
    name: "Lucas & Fernanda",
    role: "Passeio Bombinhas",
  },
  {
    text: "Atendimento humanizado fez toda a diferença! Desde a reserva até nossa volta, sempre tivemos suporte. Nos sentimos cuidados durante toda a viagem.",
    image: "/placeholder.svg?height=40&width=40&query=satisfied customer woman",
    name: "Márcia Rodrigues",
    role: "Atendimento Personalizado",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

export function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24 relative">
      <div className="container z-10 mx-auto px-4 lg:px-[70px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-[#EE7215]/20 bg-[#EE7215]/5 text-[#EE7215] py-2 px-4 rounded-full text-sm font-medium">
              Avaliações
            </div>
          </div>

          <TextAnimate
            as="h2"
            className="text-[24px] lg:text-[24px] font-bold tracking-tight mt-6 text-center text-gray-900"
            animation="slideUp"
            by="word"
            delay={0.2}
            duration={0.6}
            once={true}
          >
            O que nossos clientes dizem
          </TextAnimate>
          
          <TextAnimate
            as="p"
            className="text-center mt-4 text-gray-600 text-[16px] max-w-lg mx-auto"
            animation="slideUp"
            by="word"
            delay={0.4}
            duration={0.6}
            once={true}
          >
            Veja os depoimentos de quem já viveu experiências incríveis conosco.
          </TextAnimate>
        </motion.div>

        {/* Desktop - 3 Columns */}
        <div className="hidden lg:flex justify-center gap-6 mt-12 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} duration={17} />
        </div>

        {/* Tablet - 2 Columns */}
        <div className="hidden md:flex lg:hidden justify-center gap-6 mt-12 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[600px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} duration={19} />
        </div>

        {/* Mobile - 1 Column */}
        <div className="flex md:hidden justify-center mt-12 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[500px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={12} />
        </div>
      </div>
    </section>
  )
}
