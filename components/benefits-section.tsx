"use client"

import Image from "next/image"

import { ShieldCheck, Home, Clock } from "lucide-react"

import { FadeIn } from "@/components/ui/fade-in"



const benefits = [

  {

    icon: ShieldCheck,

    title: "Guía Local Experto", 

    description: "Recorré los destinos con seguridad de la mano de quienes realmente conocen la isla.",

  },

  {

    icon: Home,

    title: "Alojamiento Garantizado",

    description: "Selección premium de hoteles y posadas con la mejor relación calidad-precio en Canasvieiras.",

  },

  {

    icon: Clock,

    title: "Atención 24/7",

    description: "Soporte real en destino. Te acompañamos antes, durante y después de tu viaje.",

  },

]



export function BenefitsSection() {

  return (

    <section className="py-20 lg:py-32 bg-white relative overflow-hidden">

      {/* Elemento decorativo de fundo */}

      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-50 to-transparent -z-10 hidden lg:block" />



      <div className="container mx-auto px-4 lg:px-[70px]">

        

        {/* Header Mobile */}

        <FadeIn className="text-center mb-16 lg:hidden">

          <span className="inline-block py-1 px-3 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-widest mb-4 border border-orange-100">

            Por qué elegirnos

          </span>

          <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">

            Viajar con nosotros<br/>es más simple.

          </h2>

          <p className="text-slate-500 text-lg leading-relaxed max-w-md mx-auto">

            Transformamos la organización de tus vacaciones en una experiencia liviana, segura e inolvidable.

          </p>

        </FadeIn>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          

          {/* Left Side - Content */}

          <div className="order-2 lg:order-1">

            {/* Header Desktop */}

            <FadeIn className="hidden lg:block mb-12">

              <span className="inline-block py-1 px-3 rounded-full bg-orange-50 text-orange-600 text-[11px] font-bold uppercase tracking-widest mb-4 border border-orange-100">

                Por qué elegirnos

              </span>

              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-[1.1]">

                Viajar con nosotros<br/>es más simple.

              </h2>

              <p className="text-lg text-slate-500 max-w-xl leading-relaxed">

                Transformamos la organización de tus vacaciones en una experiencia liviana, segura e inolvidable.

              </p>

            </FadeIn>



                        {/* Benefits List */}



                        <div className="space-y-8 lg:space-y-10">



                          {benefits.map((benefit, index) => (



                            <FadeIn key={index} delay={index * 0.25} className="flex items-start gap-5 group">



                              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all duration-300">



                                <benefit.icon className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" strokeWidth={1.5} />



                              </div>

                  <div className="pt-1">

                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">

                      {benefit.title}

                    </h3>

                    <p className="text-slate-600 leading-relaxed">

                      {benefit.description}

                    </p>

                  </div>

                </FadeIn>

              ))}

            </div>

          </div>



          {/* Right Side - Image Card */}

          <FadeIn delay={0.2} className="order-1 lg:order-2 relative lg:pl-10">

            <div className="relative h-[500px] lg:h-[680px] w-full rounded-[32px] overflow-hidden shadow-2xl border border-white/20 group">

              <Image

                src="/images/experiencia.jpg"

                alt="Experiência Nice Trip"

                fill

                className="object-cover transition-transform duration-700 group-hover:scale-105"

              />

              

              {/* Gradiente sutil */}

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              

              {/* Floating Badge - Top Left */}

              <div className="absolute top-6 left-6">

                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/40 flex items-center gap-3">

                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-inner text-white font-black text-lg">

                    NT

                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-900">Nice Trip</p>

                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Desde 2012</p>

                  </div>

                </div>

              </div>



              {/* Stats Card - Bottom */}

              <div className="absolute bottom-6 left-6 right-6">

                <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">

                  <div className="grid grid-cols-2 divide-x divide-white/10">

                    <div className="text-center px-4">

                      <p className="text-3xl font-black text-white mb-1">13+</p>

                      <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Años de Experiencia</p>

                    </div>

                    <div className="text-center px-4">

                      <p className="text-3xl font-black text-white mb-1">50k+</p>

                      <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Viajeros Felices</p>

                    </div>

                  </div>

                </div>

              </div>

            </div>



            {/* Elemento decorativo flutuante atrás */}

            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          </FadeIn>

          

        </div>

      </div>

    </section>

  )

}
