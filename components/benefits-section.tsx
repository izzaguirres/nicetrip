"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TextAnimate } from "@/components/ui/text-animate"
import { ChevronLeft, ChevronRight } from "lucide-react"

const benefits = [
  {
    tag: "GUÍA LOCAL",
    title: "Guía Local",
    description:
      "Recorré los destinos con quien realmente los conoce.",
    image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/1_guia.png",
  },
  {
    tag: "ALOJAMIENTO",
    title: "Alojamiento Propio",
    description:
      "Hospedaje en Canasvieiras con gran ubicación y precio justo.",
    image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/2_alojamiento.png",
  },
  {
    tag: "ATENCIÓN",
    title: "Atención Personalizada",
    description: "Te acompañamos antes, durante y después del viaje.",
    image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/3_atencion.png",
  },
  {
    tag: "TOURS",
    title: "Tours Completos",
    description:
      "Rutas armadas por los mejores destinos turísticos.",
    image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/4_tours.png",
  },
  {
    tag: "TRASLADOS",
    title: "Traslados Seguros",
    description: "Cómodos y seguros para tu experiencia completa.",
    image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/5_traslados.png",
  },
  {
    tag: "ALQUILER",
    title: "Alquiler de Autos",
    description: "Movete con libertad y seguridad por toda la isla.",
    image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/6_alquiler.png",
  },
]

export function BenefitsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0
      const gap = 24 // 1.5rem gap
      scrollContainerRef.current.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth",
      })
    }
    setCurrentIndex(index)
  }

  const nextSlide = () => {
    const newIndex = currentIndex === benefits.length - 1 ? 0 : currentIndex + 1
    scrollToIndex(newIndex)
  }

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? benefits.length - 1 : currentIndex - 1
    scrollToIndex(newIndex)
  }

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const cardWidth = scrollContainerRef.current.children[0]?.clientWidth || 0
        const gap = 24
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newIndex = Math.round(scrollLeft / (cardWidth + gap))
        setCurrentIndex(newIndex)
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <TextAnimate
            as="h2"
            className="text-[24px] lg:text-[24px] font-bold text-gray-900 mb-2"
            animation="slideUp"
            by="word"
            delay={0.1}
            duration={0.6}
            once={true}
          >
            Viajar con nosotros es más fácil 🧡
          </TextAnimate>
          
          <TextAnimate
            as="p"
            className="text-[16px] lg:text-[16px] text-gray-600 max-w-2xl mx-auto"
            animation="slideUp"
            by="word"
            delay={0.3}
            duration={0.6}
            once={true}
          >
            Transformamos el planeamiento de tus vacaciones en algo liviano, seguro e inolvidable.
          </TextAnimate>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-300 h-[400px] border border-gray-100"
            >
              <img
                src={benefit.image || "/placeholder.svg"}
                alt={benefit.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              
              {/* Badge no canto superior esquerdo */}
              <div className="absolute top-4 left-4">
                <span className="inline-block rounded-full bg-black/40 backdrop-blur-sm border border-white/30 px-3 py-1.5 text-xs font-semibold text-white">
                  {benefit.tag}
                </span>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <h3 className="text-xl font-bold leading-tight text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-white/90 leading-snug">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Slider */}
        <div className="lg:hidden relative">
          {/* Cards Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl bg-white shadow-xl flex-shrink-0 w-[280px] h-[360px] snap-center border border-gray-100"
              >
                <img
                  src={benefit.image || "/placeholder.svg"}
                  alt={benefit.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                
                {/* Badge no canto superior esquerdo */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block rounded-full bg-black/40 backdrop-blur-sm border border-white/30 px-3 py-1.5 text-xs font-semibold text-white">
                    {benefit.tag}
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
                    <h3 className="text-lg font-bold leading-tight text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-white/90 leading-snug">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="rounded-full w-10 h-10 p-0 border-gray-200 hover:border-[#EE7215] hover:text-[#EE7215]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex space-x-2">
              {benefits.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex ? "bg-[#EE7215] w-6" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="rounded-full w-10 h-10 p-0 border-gray-200 hover:border-[#EE7215] hover:text-[#EE7215]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}