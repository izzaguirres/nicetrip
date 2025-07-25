"use client"

import { TextAnimate } from "@/components/ui/text-animate"
import Image from "next/image"

const images = [
  "/images/equipe/1.jpg",
  "/images/equipe/2.jpg", 
  "/images/equipe/3.jpg",
  "/images/equipe/4.jpg",
  "/images/equipe/5.jpg",
  "/images/equipe/6.jpg",
  "/images/equipe/7.jpg",
  "/images/equipe/8.jpg",
  "/images/equipe/9.jpg"
]

export function QuemSomosSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Header Centralizado APENAS no mobile */}
        <div className="text-center mb-12 lg:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nice Trip Turismo
          </h2>
          
          <h3 className="text-lg font-semibold text-orange-600">
            Seguridad y Confianza
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side - Content */}
          <div>
            {/* Desktop: Títulos à esquerda */}
            <div className="hidden lg:block mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Nice Trip Turismo
              </h2>
              
              <h3 className="text-xl font-semibold text-orange-600 mb-4">
                Seguridad y Confianza
              </h3>
            </div>

            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Nice Trip es una empresa de turismo ubicada en la 
                playa de Canasvieiras, en la isla de Florianópolis. 
                Nos especializamos en ofrecer una amplia gama de 
                servicios, que incluyen traslados, excursiones, 
                reservas de hospedaje, creación de paquetes 
                turísticos y cambio de divisas.
              </p>
              
              <p>
                Contamos con una red hotelera propia, una flota de 
                transporte decente y convenios gastronómicos 
                con establecimientos destacados. Nuestros guías 
                locales bilingües, debidamente acreditados, 
                garantizan un conocimiento profundo del destino 
                y de sus maravillas.
              </p>
              
              <p>
                Además, disponemos de oficinas físicas en el 
                destino para brindar atención personalizada. 
                Nuestro equipo está capacitado para ofrecer 
                soluciones a medida, siempre con un enfoque 
                centrado en el cliente. Estamos preparados para 
                responder de forma rápida ante cualquier 
                imprevisto que pueda surgir durante el viaje, 
                asegurando que su experiencia sea excepcional 
                desde la planificación hasta el regreso a casa.
              </p>
            </div>
          </div>

          {/* Right Side - Ticker de Imagens */}
          <div className="relative">
            <div className="relative h-[400px] lg:h-[500px] overflow-hidden rounded-3xl">
              {/* Ticker Container */}
              <div className="absolute inset-0 flex flex-col gap-4">
                {/* First Row - Moving Left */}
                <div className="flex gap-4 animate-scroll-left">
                  {/* Duplicando as imagens para scroll infinito */}
                  {[...images, ...images].map((image, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-[200px] h-[120px] rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Destino ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Second Row - Moving Left (Slower) */}
                <div className="flex gap-4 animate-scroll-left-fast">
                  {/* Duplicando as imagens para scroll infinito */}
                  {[...images.slice(3), ...images.slice(0, 3), ...images.slice(3), ...images.slice(0, 3)].map((image, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-[200px] h-[120px] rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Destino ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Third Row - Moving Left */}
                <div className="flex gap-4 animate-scroll-left">
                  {/* Duplicando as imagens para scroll infinito */}
                  {[...images.slice(2), ...images.slice(0, 2), ...images.slice(2), ...images.slice(0, 2)].map((image, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 w-[200px] h-[120px] rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`Destino ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Overlay para suavizar as bordas */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 