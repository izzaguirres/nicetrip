"use client"

import { TextAnimate } from "@/components/ui/text-animate"
import Image from "next/image"

const benefits = [
  {
    icon: "/images/guia.png",
    title: "Guía Local", 
    description: "Recorré los destinos con quien realmente los conoce.",
  },
  {
    icon: "/images/alojamiento.png",
    title: "Alojamiento",
    description: "Hospedaje con calidad y precio justo en Canasvieiras.",
  },
  {
    icon: "/images/atencion.png",
    title: "Atención 24/7",
    description: "Te acompañamos antes, durante y después del viaje.",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Header Centralizado APENAS no mobile */}
        <div className="text-center mb-12 lg:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            <span className="block">Viajar con nosotros</span>
            <span className="block">es más fácil 🧡</span>
          </h2>
          
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            <span className="block">Transformamos el planeamiento de tus</span>
            <span className="block">vacaciones en algo liviano, seguro e</span>
            <span className="block">inolvidable.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side - Content */}
          <div>
            {/* Desktop: Títulos à esquerda */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                <span className="block">Viajar con nosotros</span>
                <span className="block">es más fácil 🧡</span>
              </h2>
              
              <p className="text-lg text-gray-600 max-w-2xl">
                <span className="block">Transformamos el planeamiento de tus</span>
                <span className="block">vacaciones en algo liviano, seguro e</span>
                <span className="block">inolvidable.</span>
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                    <img 
                      src={benefit.icon} 
                      alt={benefit.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="relative">
            <div className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden">
              <Image
                src="/images/experiencia.jpg"
                alt="Família viajando - Nice Trip"
                fill
                className="object-cover"
              />
              
              {/* Overlay com informações */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Badge flutuante */}
              <div className="absolute top-6 left-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">NT</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Nice Trip</p>
                      <p className="text-xs text-gray-600">13+ años de experiencia</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats no bottom */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-white">
                    <div className="text-center">
                      <p className="text-2xl font-bold">13+</p>
                      <p className="text-sm opacity-90">Años de experiencia</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">5000+</p>
                      <p className="text-sm opacity-90">Viajeros felices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}