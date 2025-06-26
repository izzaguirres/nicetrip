"use client"

import { motion } from "framer-motion"
import { TextAnimate } from "@/components/ui/text-animate"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns"

const testimonials = [
  {
    text: "La mejor agencia para hacer todas las excursiones en Floripa!!! Todo el personal súper amable, predispuesto y con ganas de darte una mano en todo. Segundo año que la elijo! Mención aparte para el guía de turismo Gustavo 💛 transmite una pasión que te deja con ganas de saber más de la historia de esta hermosa isla! Sin dudas volveré!",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    name: "Laly Provenzano",
    role: "Viajera frecuente",
  },
  {
    text: "Comunicación anticipada, gentil y precisa. Atención con horarios, sugestiones de paseos y total prestatividad. Parabéns e prosperidade à empresa.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    name: "Ana Maria Nery",
    role: "Empresaria",
  },
  {
    text: "En febrero de 2021 hice un paseo y conocí a Nice Trip recomiendo mucho, eles são ótimos, pessoas honestas, vale a pena viajar com eles, atendeu todas minhas expectativas...",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    name: "Jonata Nunes",
    role: "Turista satisfecho",
  },
  {
    text: "A vendedora foi muito simpática, os motoristas foram excelentes e a guia Anita foi maravilhosa. Ela nos proporcionou um ótimo suporte e atenção, assim como o Gustavo. Ambos foram muito gentis, especialmente considerando que eu estava acompanhando da minha mãe, que tem 83 anos. O motorista MARAVILHOSO que nos ajudou, nos ajudou durante o percurso. Tudo foi muito bom. Eu recomendo! Obrigado! Regiane, topgian e família.",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    name: "Regiane Pereira",
    role: "Familia completa",
  },
  {
    text: "Compramos un paseo para isla de Campeche y la verdad fue todo impecable. Todo accesible desde medios de pago, traslado y el guía un crack. El viaje muy rápido y cómodo y la isla lo mejor de Florianópolis. Si volvemos el próximo año volveríamos a ir nuevamente con esta agencia. Muchas gracias 🤘",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    name: "Jonacel",
    role: "Aventurero",
  },
  {
    text: "Atendimento excelente! Consegui agendar o passeio de última hora e fui atendida com muita empatia e respeito. Guia Gustavo foi um amor de pessoa!",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80",
    name: "Jessika Rezende",
    role: "Turista de último momento",
  },
  {
    text: "São prestativos e ótimo guia quando fomos para Ilha de Campeche.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80",
    name: "Vanessa Ribeiro",
    role: "Exploradora de islas",
  },
  {
    text: "Pasamos un día espectacular en Balneario Camboriú Brasil, con el acompañamiento de Gustavo, un guía de 10, un lujo!! Muchas gracias Gus!! Inolvidable. Marcelo y Verónica de Argentina, Mar de Ajo, Pdo. de La Costa.🥰🏖️⛵😊",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c265?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    name: "Verónica Cabrera",
    role: "Pareja viajera",
  },
  {
    text: "Foi ótimo, são super educados e atenciosos. Através da Nice Trip tivemos um dia inesquecível. Muito obrigada por tudo.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    name: "Rose Queiroz",
    role: "Cliente agradecida",
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
              Testimonios
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
            Lo que dicen nuestros clientes
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
            Testimonios reales de quienes ya vivieron experiencias increíbles con nosotros.
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
