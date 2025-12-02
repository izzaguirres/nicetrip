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
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 max-w-xs w-full"
                  key={i}
                >
                  <div className="text-slate-600 text-sm leading-relaxed font-medium">"{text}"</div>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-50">
                    <div className="relative">
                      <img
                        width={40}
                        height={40}
                        src={image || "/placeholder.svg"}
                        alt={name}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white ring-offset-2 ring-offset-slate-50"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="font-bold text-slate-900 text-sm">{name}</div>
                      <div className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">{role}</div>
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
    image: "https://images.unsplash.com/photo-1621624666561-84d0ed50f22d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Marina & Carlos",
    role: "Lua de Mel em Floripa",
  },
  {
    text: "Viagem em família perfeita! As crianças adoraram os passeios e nós ficamos tranquilos com toda a organização. Hospedagem excelente e guias super atenciosos.",
    image: "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Família Santos",
    role: "Férias em Família",
  },
  {
    text: "Primeira vez em Florianópolis e não poderia ter escolhido melhor! O city tour foi incrível e conhecemos lugares que jamais encontraríamos sozinhos.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Ana Paula",
    role: "Turismo em Floripa",
  },
  {
    text: "O traslado do aeroporto foi pontual e confortável. A hospedagem em Canasvieiras tinha localização perfeita. Voltaremos com certeza!",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Roberto Silva",
    role: "Viagem de Negócios",
  },
  {
    text: "Beto Carrero com a Nice Trip foi uma experiência única! Tudo organizado, sem filas e com o melhor custo-benefício. Nossos filhos ainda falam da viagem!",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Juliana Costa",
    role: "Passeio Beto Carrero",
  },
  {
    text: "Aluguel de carro facilitou muito nossa exploração pela região. Veículo novo, documentação em dia e atendimento excepcional. Super recomendo!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Pedro Oliveira",
    role: "Aluguel de Carro",
  },
  {
    text: "Ilha do Campeche foi um sonho realizado! Águas cristalinas, passeio bem organizado e guia que conhecia cada cantinho. Experiência inesquecível!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Camila Ferreira",
    role: "Passeio Ilha do Campeche",
  },
  {
    text: "Bombinhas com a Nice Trip superou todas as expectativas! Praias paradisíacas, mergulho incrível e toda a logística perfeita. Voltaremos em breve!",
    image: "https://images.unsplash.com/photo-1516939884455-14a5c7f36489?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Lucas & Fernanda",
    role: "Passeio Bombinhas",
  },
  {
    text: "Atendimento humanizado fez toda a diferença! Desde a reserva até nossa volta, sempre tivemos suporte. Nos sentimos cuidados durante toda a viagem.",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
    name: "Márcia Rodrigues",
    role: "Atendimento Personalizado",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)
