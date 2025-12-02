import { FadeIn } from "@/components/ui/fade-in"

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
    <section className="py-16 lg:py-24 bg-[#111] border-t border-white/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Header */}
        <FadeIn className="text-center mb-12 lg:mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 tracking-tight">
            Una empresa del <span className="text-[#EE7215]">FLN GROUP</span>
          </h2>
          
          <p className="text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Parte de un grupo consolidado con hoteles propios,
            transportes y servicios completos de turismo en Florianópolis.
          </p>
        </FadeIn>

        {/* Logos Ticker */}
        <FadeIn delay={0.2} className="relative overflow-hidden w-full">
          {/* Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#111] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#111] to-transparent z-10" />

          <div className="flex animate-scroll-left-fast">
            {/* First set */}
            {logos.map((logo) => (
              <div key={`first-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-14 flex items-center justify-center">
                <div className="relative w-32 h-16 lg:w-40 lg:h-20 group">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-full h-full object-contain opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {logos.map((logo) => (
              <div key={`second-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-14 flex items-center justify-center">
                <div className="relative w-32 h-16 lg:w-40 lg:h-20 group">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-full h-full object-contain opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Third set for extra smooth animation */}
            {logos.map((logo) => (
              <div key={`third-${logo.id}`} className="flex-shrink-0 mx-8 lg:mx-14 flex items-center justify-center">
                <div className="relative w-32 h-16 lg:w-40 lg:h-20 group">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="w-full h-full object-contain opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110 brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
