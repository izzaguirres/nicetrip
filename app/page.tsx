"use client"

import { useState } from "react"
import { Bed, Luggage, Sun } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { BenefitsSection } from "@/components/benefits-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { QuemSomosSection } from "@/components/quem-somos-section"
import { FaqSection } from "@/components/faq-section"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
import { HabitacionesSearchFilter } from "@/components/habitaciones-search-filter"
import { PaseosSearchFilter } from "@/components/paseos-search-filter"
import { Avatar, AvatarImage } from "@/components/ui/avatar"


// Testimonial Badge Component
function TestimonialBadge() {
  return (
    <div className="inline-flex items-center rounded-full bg-black/20 backdrop-blur-sm border border-white/20 p-1 pr-3 shadow-lg">
      <div className="flex -space-x-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib.rb-1.2.1&auto=format&fit=crop&w=80&q=80" />
        </Avatar>
        <Avatar className="h-6 w-6">
          <AvatarImage src="https://images.unsplash.com/photo-1589329482133-87538464b0f9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib.rb-1.2.1&auto=format&fit=crop&w=80&q=80" />
        </Avatar>
        <Avatar className="h-6 w-6">
          <AvatarImage src="https://images.unsplash.com/photo-1518577915332-c2a19f149a75?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&lib=rb-1.2.1&auto=format&fit=crop&w=80&q=80" />
        </Avatar>
      </div>
      <p className="pl-2 text-xs text-white/90">
        Confianza de <strong className="font-medium text-white">90k+</strong> viajeros.
      </p>
    </div>
  )
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("paquetes")

  return (
    <div className="bg-white">
      {/* Header unificado */}
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gray-900 h-[100vh]">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/background header (1).png"
              alt="Fundo de praia tropical"
              fill
              className="object-cover object-center"
              quality={100}
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container mx-auto px-4 lg:px-[70px] pt-[170px] lg:pt-24 pb-32 lg:pb-96 relative z-10 h-full flex flex-col justify-center">
            {/* Headline Content */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="text-center lg:text-left lg:col-span-5">
                <div className="inline-block mb-6">
                  <TestimonialBadge />
                </div>
                <h1 className="text-3xl lg:text-[42px] font-bold tracking-tight leading-tight text-white">
                  <span className="lg:hidden">
                    Las vacaciones<br />perfectas para<br />quienes aman{" "}
                     <span
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: "linear-gradient(to right, #FF8F00, #F7931E, #FF6B35)",
                      }}
                    >
                      viajar
                    </span>
                  </span>
                  <span className="hidden lg:block">
                    Las vacaciones
                    <br />
                    perfectas para
                    <br />
                    quienes aman{" "}
                    <span
                      className="text-transparent bg-clip-text"
                      style={{
                        backgroundImage: "linear-gradient(to right, #FF8F00, #F7931E, #FF6B35)",
                      }}
                    >
                      viajar
                    </span>
                  </span>
                </h1>
                <p className="mt-2 text-sm lg:text-[20px] max-w-lg mx-auto lg:mx-0 text-white/90">
                  Elegí como querés viajar y empezá a planear
                </p>
              </div>

              {/* IMAGE IS MOVED OUT OF THE GRID */}
            </div>

            {/* Search Filter Section - Hybrid Positioning */}
            <div className="relative mt-8 lg:absolute lg:mt-0 lg:bottom-40 lg:left-0 lg:right-0 lg:z-10">
              <div className="lg:container lg:mx-auto lg:px-[70px]">
                {/* Tabs moved outside the main content box */}
                <div className="mb-4 flex justify-center">
                  <div className="flex gap-[10px] bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-1.5 max-w-[380px] lg:max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-all duration-300">
                    <button
                      onClick={() => setActiveTab("paquetes")}
                      className={`relative flex items-center justify-center py-2 px-3 lg:py-2.5 lg:px-4 whitespace-nowrap rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 overflow-hidden group ${
                        activeTab === "paquetes" 
                          ? "bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white shadow-[0_4px_16px_rgba(238,114,21,0.4)] transform scale-[1.02]" 
                          : "text-gray-200 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                      }`}
                    >
                      {activeTab === "paquetes" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                      )}
                      <Luggage className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 relative z-10 flex-shrink-0" />
                      <span className="relative z-10">Paquetes</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("habitaciones")}
                      className={`relative flex items-center justify-center py-2 px-3 lg:py-2.5 lg:px-4 whitespace-nowrap rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 overflow-hidden group ${
                        activeTab === "habitaciones"
                          ? "bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white shadow-[0_4px_16px_rgba(238,114,21,0.4)] transform scale-[1.02]"
                          : "text-gray-200 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                      }`}
                    >
                      {activeTab === "habitaciones" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                      )}
                      <Bed className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 relative z-10 flex-shrink-0" />
                      <span className="relative z-10">Habitaciones</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("paseos")}
                      className={`relative flex items-center justify-center py-2 px-3 lg:py-2.5 lg:px-4 whitespace-nowrap rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 overflow-hidden group ${
                        activeTab === "paseos" 
                          ? "bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white shadow-[0_4px_16px_rgba(238,114,21,0.4)] transform scale-[1.02]" 
                          : "text-gray-200 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                      }`}
                    >
                      {activeTab === "paseos" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                      )}
                      <Sun className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 relative z-10 flex-shrink-0" />
                      <span className="relative z-10">Paseos</span>
                    </button>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
                  <div className="flex flex-col justify-start h-[320px] lg:h-[100px]">
                    {activeTab === 'paquetes' && <UnifiedSearchFilter variant="homepage" />}
                    {activeTab === 'habitaciones' && <HabitacionesSearchFilter variant="homepage" />}
                    {activeTab === 'paseos' && <PaseosSearchFilter variant="homepage" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Family Image - Absolutely Positioned on Desktop */}
            <div className="hidden lg:block absolute bottom-44 right-[70px] w-[50%] h-[85%] z-0 pointer-events-none">
              <Image
                src="https://raw.githubusercontent.com/izzaguirres/nicetrip/main/public/images/header_family.png"
                alt="Família aproveitando as férias"
                fill
                className="object-contain object-bottom"
                sizes="50vw"
                priority
              />
            </div>
          </div>
        </section>

        <BenefitsSection />
        <TestimonialsSection />
        <QuemSomosSection />
        <PartnersSection />
        <FaqSection />

        <Footer />
      </main>
    </div>
  )
} 