"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Globe,
  Menu,
  X,
  Bed,
  Luggage,
  Sun,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { PromotionBanners } from "@/components/promotion-banners"
import { BenefitsSection } from "@/components/benefits-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FaqSection } from "@/components/faq-section"
import { PartnersSection } from "@/components/partners-section"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"
import { UnifiedSearchFilter } from "@/components/unified-search-filter"
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
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("paquetes")

  return (
    <div className="bg-white">
      {/* Fixed Header */}
      <header className="!fixed !top-0 !w-full !z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 lg:px-[70px]">
          <div className="flex items-center justify-between h-16 lg:h-20 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/images/nice-trip-logo-new.png"
                alt="Nice Trip"
                width={120}
                height={30}
                className="h-8 lg:h-10 w-auto flex-shrink-0"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                href="/"
                className="text-gray-900 bg-transparent border-2 border-[#EE7215] px-3 py-2 rounded-xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.02] hover:bg-[#EE7215]/5"
              >
                Início
              </Link>
              <Link
                href="/resultados?categoria=paquete"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border hover:border-gray-300 px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 hover:scale-[1.02]"
              >
                Pacotes
              </Link>
              <Link
                href="/resultados?categoria=hospedagem"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border hover:border-gray-300 px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 hover:scale-[1.02]"
              >
                Hospedagens
              </Link>
              <Link
                href="/resultados?categoria=passeio"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border hover:border-gray-300 px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 hover:scale-[1.02]"
              >
                Passeios
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border hover:border-gray-300 px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 hover:scale-[1.02]"
              >
                Condições
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border hover:border-gray-300 px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 hover:scale-[1.02]"
              >
                Contato
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:block flex-shrink-0">
              <button className="relative bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white rounded-xl px-4 py-2 font-semibold text-[14px] shadow-[0_8px_24px_rgba(238,114,21,0.4)] hover:shadow-[0_12px_32px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.02] overflow-hidden group whitespace-nowrap">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                <div className="relative z-10 flex items-center">
                  <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="flex-shrink-0">Acesso Agências</span>
                </div>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-3">
                <Link href="/" className="text-gray-900 bg-transparent border-2 border-[#EE7215] px-3 py-2 rounded-xl font-bold transition-all duration-300">
                  Início
                </Link>
                <Link href="/resultados?categoria=paquete" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-xl font-medium transition-all duration-300">
                  Pacotes
                </Link>
                <Link href="/resultados?categoria=hospedagem" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-xl font-medium transition-all duration-300">
                  Hospedagens
                </Link>
                <Link href="/resultados?categoria=passeio" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-xl font-medium transition-all duration-300">
                  Passeios
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-xl font-medium transition-all duration-300">
                  Condições
                </Link>
                <Link href="#" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-xl font-medium transition-all duration-300">
                  Contato
                </Link>
                <button className="relative bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white rounded-xl w-full py-2.5 font-semibold transition-all duration-300 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                  <div className="relative z-10 flex items-center justify-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Acesso Agências
                  </div>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-gray-900">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/header-bg.png"
              alt="Fundo de praia tropical"
              fill
              className="object-cover object-center"
              quality={100}
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="container mx-auto px-4 lg:px-[70px] pt-20 lg:pt-24 relative z-10">
            <div className="grid lg:grid-cols-12 gap-8 items-start min-h-[460px] lg:min-h-[560px]">
              <div className="text-center lg:text-left lg:col-span-5 lg:pt-14">
                <div className="inline-block mb-6">
                  <TestimonialBadge />
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white font-display">
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
                <p className="mt-4 text-base max-w-lg mx-auto lg:mx-0 text-white/90">
                  Paquetes completos para vos y tu familia.<br />
                  Elegí el tuyo y viví vacaciones inolvidables.
                </p>
              </div>

              <div className="hidden lg:block relative w-full h-[400px] lg:h-full lg:col-span-7 lg:self-end lg:justify-self-end -mb-12 lg:mb-0">
                <Image
                  src="/placeholder.jpg"
                  alt="Família aproveitando as férias"
                  fill
                  className="object-contain object-bottom"
                  sizes="(max-width: 1024px) 90vw, 55vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Search Filter Section */}
        <section className="relative z-20 -mt-24 lg:-mt-24">
          <div className="container mx-auto px-4 lg:px-[70px]">
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/10">
              <div className="mb-5">
                <div className="flex bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-1.5 max-w-[380px] lg:max-w-md mx-auto shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition-all duration-300">
                  <button
                    onClick={() => setActiveTab("paquetes")}
                    className={`relative flex-1 py-2 px-2 lg:py-2.5 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center overflow-hidden group ${
                      activeTab === "paquetes" 
                        ? "bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white shadow-[0_4px_16px_rgba(238,114,21,0.4)] transform scale-[1.02]" 
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                    }`}
                  >
                    {activeTab === "paquetes" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    )}
                    <Luggage className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 relative z-10 flex-shrink-0" />
                    <span className="relative z-10 truncate">Paquetes</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("habitaciones")}
                    className={`relative flex-1 py-2 px-2 lg:py-2.5 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center overflow-hidden group ${
                      activeTab === "habitaciones"
                        ? "bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white shadow-[0_4px_16px_rgba(238,114,21,0.4)] transform scale-[1.02]"
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                    }`}
                  >
                    {activeTab === "habitaciones" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    )}
                    <Bed className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 relative z-10 flex-shrink-0" />
                    <span className="relative z-10 truncate">Habitaciones</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("paseos")}
                    className={`relative flex-1 py-2 px-2 lg:py-2.5 lg:px-4 rounded-xl font-semibold text-xs lg:text-sm transition-all duration-300 flex items-center justify-center overflow-hidden group ${
                      activeTab === "paseos" 
                        ? "bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white shadow-[0_4px_16px_rgba(238,114,21,0.4)] transform scale-[1.02]" 
                        : "text-white/80 hover:text-white hover:bg-white/10 hover:scale-[1.01]"
                    }`}
                  >
                    {activeTab === "paseos" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    )}
                    <Sun className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 relative z-10 flex-shrink-0" />
                    <span className="relative z-10 truncate">Paseos</span>
                  </button>
                </div>
              </div>

              {activeTab === 'paquetes' && <UnifiedSearchFilter variant="homepage" />}
              
              {activeTab === 'habitaciones' && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-white mb-2">Habitaciones</h3>
                  <p className="text-white/80 mb-4">Búsqueda de hospedajes en desarrollo</p>
                  <Button 
                    onClick={() => router.push('/resultados?categoria=hospedagem')}
                    className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white rounded-xl px-6 py-2.5"
                  >
                    Ver Hospedajes
                  </Button>
                </div>
              )}
              
              {activeTab === 'paseos' && (
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold text-white mb-2">Paseos</h3>
                  <p className="text-white/80 mb-4">Búsqueda de excursiones en desarrollo</p>
                  <Button 
                    onClick={() => router.push('/resultados?categoria=passeio')}
                    className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white rounded-xl px-6 py-2.5"
                  >
                    Ver Excursiones
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        <PromotionBanners />

        <BenefitsSection />
        <TestimonialsSection />
        <PartnersSection />
        <FaqSection />

        <Footer />
      </main>
    </div>
  )
} 