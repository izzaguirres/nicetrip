"use client"

import { TextAnimate } from "@/components/ui/text-animate"

export function PromotionBanners() {
  const banners = [
    {
      id: 1,
      image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/bajamos.png",
      alt: "Promoção Pacote Praia",
    },
    {
      id: 2,
      image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/bajamos.png",
      alt: "Promoção Viagem em Família",
    },
    {
      id: 3,
      image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/bajamos.png",
      alt: "Promoção Passeios Aventura",
    },
    {
      id: 4,
      image: "https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/bajamos.png",
      alt: "Promoção Escapada Romântica",
    },
  ]

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Títulos animados */}
        <div className="text-center mb-12">
          <TextAnimate
            as="h2"
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
            animation="slideUp"
            by="word"
            delay={0.1}
            duration={0.6}
            once={true}
          >
            ¡Promociones por tiempo limitado! 🔥
          </TextAnimate>
          
          <TextAnimate
            as="p"
            className="text-lg lg:text-xl text-gray-600"
            animation="slideUp"
            by="word"
            delay={0.3}
            duration={0.6}
            once={true}
          >
            Las mejores ofertas están por terminar.
          </TextAnimate>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <img
                src={banner.image || "/placeholder.svg"}
                alt={banner.alt}
                className="w-full h-[200px] md:h-[160px] lg:h-[280px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
