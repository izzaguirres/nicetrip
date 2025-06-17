"use client"
import React from "react"
import { motion } from "framer-motion"

export const TestimonialsColumn = (props: {
  className?: string
  testimonials: typeof testimonials
  duration?: number
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div
                  className="p-6 lg:p-8 rounded-2xl bg-white border border-gray-100 shadow-lg max-w-xs w-full"
                  key={i}
                >
                  <div className="text-gray-700 text-sm lg:text-base leading-relaxed">{text}</div>
                  <div className="flex items-center gap-3 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image || "/placeholder.svg"}
                      alt={name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="font-semibold text-gray-900 text-sm">{name}</div>
                      <div className="text-gray-500 text-xs">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  )
}

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
