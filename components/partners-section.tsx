"use client"

export function PartnersSection() {
  const logos = [
    {
      id: 1,
      name: "Nice Trip Hotel",
      image: "/placeholder.svg?height=60&width=120&query=nice trip hotel logo",
    },
    {
      id: 2,
      name: "FLN Hospedagem",
      image: "/placeholder.svg?height=60&width=120&query=fln hospedagem logo",
    },
    {
      id: 3,
      name: "Canasvieiras Resort",
      image: "/placeholder.svg?height=60&width=120&query=canasvieiras resort logo",
    },
    {
      id: 4,
      name: "FLN Turismo",
      image: "/placeholder.svg?height=60&width=120&query=fln turismo logo",
    },
    {
      id: 5,
      name: "Nice Trip Transportes",
      image: "/placeholder.svg?height=60&width=120&query=nice trip transportes logo",
    },
  ]

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-[70px]">
        <div className="text-center mb-12">
          <h2 className="text-[24px] lg:text-[24px] font-bold text-gray-900 mb-4">
            Uma empresa do <span className="text-[#EE7215]">FLN GROUP</span>
          </h2>
          <p className="text-gray-600 text-[16px] max-w-lg mx-auto">
            Parte de um grupo consolidado com hotéis próprios, transportes e serviços completos de turismo em
            Florianópolis
          </p>
        </div>

        {/* Infinite scroll logos - faster animation */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left-fast">
            {/* First set */}
            {logos.map((logo) => (
              <div key={`first-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center">
                <img
                  src={logo.image || "/placeholder.svg"}
                  alt={logo.name}
                  className="h-12 lg:h-16 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo) => (
              <div key={`second-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center">
                <img
                  src={logo.image || "/placeholder.svg"}
                  alt={logo.name}
                  className="h-12 lg:h-16 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
