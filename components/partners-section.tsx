"use client"



export function PartnersSection() {
  const logos = [
    {
      id: 1,
      name: "Partner 1",
      image: "/images/logos/1.png",
    },
    {
      id: 2,
      name: "Partner 2", 
      image: "/images/logos/2.png",
    },
    {
      id: 3,
      name: "Partner 3",
      image: "/images/logos/3.png",
    },
    {
      id: 4,
      name: "Partner 4",
      image: "/images/logos/4.png",
    },
    {
      id: 5,
      name: "Partner 5",
      image: "/images/logos/5.png",
    },
    {
      id: 6,
      name: "Partner 6",
      image: "/images/logos/6.png",
    },
  ]

  return (
    <section className="py-16 lg:py-24" style={{backgroundColor: '#C7C7C7'}}>
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            <span className="block">Una empresa del</span>
            <span className="block text-orange-600">FLN GROUP</span>
          </h2>
          
          <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
            <span className="block">Parte de un grupo consolidado con hoteles propios,</span>
            <span className="block">transportes y servicios completos de turismo en</span>
            <span className="block">Florianópolis</span>
          </p>
        </div>

        {/* Logos Ticker */}
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-left-fast">
            {/* First set */}
            {logos.map((logo) => (
              <div key={`first-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center">
                <div className="relative w-32 h-20 lg:w-40 lg:h-24">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-full h-full object-contain opacity-100 transition-all duration-300 hover:scale-110"
                    onError={(e) => {
                      console.log(`Erro ao carregar logo ${logo.id}:`, logo.image);
                      e.currentTarget.src = `https://via.placeholder.com/120x60/EE7215/white?text=Logo${logo.id}`;
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo) => (
              <div key={`second-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center">
                <div className="relative w-32 h-20 lg:w-40 lg:h-24">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-full h-full object-contain opacity-100 transition-all duration-300 hover:scale-110"
                  />
                </div>
              </div>
            ))}
            {/* Third set for extra smooth animation */}
            {logos.map((logo) => (
              <div key={`third-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-12 flex items-center justify-center">
                <div className="relative w-32 h-20 lg:w-40 lg:h-24">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-full h-full object-contain opacity-100 transition-all duration-300 hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
