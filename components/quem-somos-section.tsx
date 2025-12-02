"use client"

import { TextAnimate } from "@/components/ui/text-animate"

import Image from "next/image"

import { FadeIn } from "@/components/ui/fade-in"



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

    <section className="py-20 lg:py-32 bg-slate-50 overflow-hidden">

      <div className="container mx-auto px-4 lg:px-[70px]">

        

        {/* Mobile Header */}

        <FadeIn className="text-center mb-12 lg:hidden">

          <span className="inline-block py-1 px-3 rounded-full bg-white text-orange-600 text-[11px] font-bold uppercase tracking-widest mb-4 border border-slate-200 shadow-sm">

            Conócenos

          </span>

          <h2 className="text-3xl font-bold text-slate-900 mb-4">

            Nice Trip Turismo

          </h2>

          <h3 className="text-lg font-medium text-orange-600">

            Seguridad y Confianza

          </h3>

        </FadeIn>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left Side - Content */}

          <div>

            <FadeIn className="hidden lg:block mb-10">

              <span className="inline-block py-1 px-3 rounded-full bg-white text-orange-600 text-[11px] font-bold uppercase tracking-widest mb-4 border border-slate-200 shadow-sm">

                Conócenos

              </span>

              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight">

                Nice Trip Turismo

              </h2>

              <h3 className="text-xl font-medium text-orange-600">

                Seguridad y Confianza

              </h3>

            </FadeIn>



            <FadeIn delay={0.2} className="space-y-6 text-lg text-slate-600 leading-relaxed font-normal">

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

                centrado en el cliente.

              </p>

            </FadeIn>

          </div>



          {/* Right Side - Ticker de Imagens */}

          <FadeIn delay={0.4} className="relative">

            <div className="relative h-[500px] lg:h-[600px] overflow-hidden rounded-[32px] shadow-2xl border border-white/50 bg-white">

              {/* Gradient Overlay Top/Bottom */}

              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white z-10" />

              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white z-10" />



              {/* Ticker Container */}

              <div className="absolute inset-0 flex flex-col gap-5 py-8 -rotate-6 scale-110 opacity-90">

                {/* Row 1 */}

                <div className="flex gap-5 animate-scroll-left">

                  {[...images, ...images].map((image, index) => (

                    <div key={`r1-${index}`} className="relative flex-shrink-0 w-[280px] h-[180px] rounded-2xl overflow-hidden shadow-md">

                      <Image src={image} alt="Equipe" fill className="object-cover transition-all duration-500" />

                    </div>

                  ))}

                </div>



                {/* Row 2 */}

                <div className="flex gap-5 animate-scroll-left-fast">

                  {[...images.slice(3), ...images.slice(0, 3), ...images.slice(3), ...images.slice(0, 3)].map((image, index) => (

                    <div key={`r2-${index}`} className="relative flex-shrink-0 w-[280px] h-[180px] rounded-2xl overflow-hidden shadow-md">

                      <Image src={image} alt="Equipe" fill className="object-cover transition-all duration-500" />

                    </div>

                  ))}

                </div>



                {/* Row 3 */}

                <div className="flex gap-5 animate-scroll-left">

                  {[...images.slice(5), ...images.slice(0, 5), ...images.slice(5), ...images.slice(0, 5)].map((image, index) => (

                    <div key={`r3-${index}`} className="relative flex-shrink-0 w-[280px] h-[180px] rounded-2xl overflow-hidden shadow-md">

                      <Image src={image} alt="Equipe" fill className="object-cover transition-all duration-500" />

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </FadeIn>

        </div>

      </div>

    </section>

  )

}

 