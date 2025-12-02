"use client"

import { useState } from "react"
import { Bed, Luggage, Sun } from "lucide-react"
import Link from "next/link"

import { FadeIn } from "@/components/ui/fade-in"
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
import { TARIFARIOS_PDF_URL } from "@/lib/constants"
import { PromotionsSection } from "@/components/promotions-section"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("paquetes")

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Header />

      <main className="flex-1 bg-white p-2 md:p-4">
        {/* Hero Section Imersiva - Style Card/Frame */}
        <section className="relative min-h-[85vh] w-full overflow-hidden flex items-center justify-center rounded-[2rem] md:rounded-[3rem]">
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full scale-105"
              poster="/images/hero-poster.jpg"
            >
              <source src="/images/hero.mp4" type="video/mp4" />
            </video>
            {/* Cinematic Gradient Overlay - Vignette + Bottom Fade */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] z-10 mix-blend-overlay" />
          </div>

          <div className="container relative z-20 px-4 flex flex-col items-center justify-center h-full pt-32">
            {/* Headline */}
            <FadeIn delay={0.2} className="text-center max-w-5xl mx-auto mb-12">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 drop-shadow-2xl leading-[1.1]">
                Tu Verano{" "}
                <span className="relative inline-block">
                  Perfecto
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FF6B35] overflow-visible" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0 10 Q 50 0 100 10" stroke="url(#gradient)" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#FF9F43" />
                        <stop offset="50%" stopColor="#FF6B35" />
                        <stop offset="100%" stopColor="#FF4757" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              <p className="text-xl md:text-3xl text-white/95 font-light tracking-wide max-w-3xl mx-auto drop-shadow-lg leading-relaxed">
                Calidad premium, atención experta y momentos inolvidables.
              </p>
            </FadeIn>

            {/* Glass Cockpit - Search Filter */}
            <FadeIn delay={0.6} className="w-full max-w-6xl">
              {/* Tabs Flutuantes - Style iOS Segmented Control */}
              <div className="flex justify-center mb-4">
                <div className="bg-black/30 backdrop-blur-xl p-1 md:p-1.5 rounded-full flex items-center gap-1 border border-white/10 shadow-2xl">
                  {[
                    { id: "paquetes", icon: Luggage, label: "Paquetes" },
                    { id: "habitaciones", icon: Bed, label: "Hospedajes" },
                    { id: "paseos", icon: Sun, label: "Paseos" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative flex items-center px-3 py-1.5 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300",
                        activeTab === tab.id
                          ? "bg-white text-slate-900 shadow-md scale-100"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <tab.icon className={cn("w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 transition-colors", activeTab === tab.id ? "text-[#FF6B35]" : "text-white/70")} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Painel de Busca */}
              <div className="glass-panel rounded-[2rem] p-4 md:p-6 shadow-2xl border border-white/20 relative overflow-visible">
                <div className="relative z-10">
                  {activeTab === 'paquetes' && <UnifiedSearchFilter variant="homepage" />}
                  {activeTab === 'habitaciones' && <HabitacionesSearchFilter variant="homepage" />}
                  {activeTab === 'paseos' && <PaseosSearchFilter variant="homepage" />}
                </div>
              </div>

              {/* Mobile CTA for PDF */}
              <div className="mt-8 text-center md:hidden">
                <Link
                  href={TARIFARIOS_PDF_URL}
                  target="_blank"
                  className="text-white/80 text-sm font-medium underline decoration-[#FF6B35] underline-offset-4 hover:text-white transition-colors"
                >
                  Ver Tarifários Completos (PDF)
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Scroll Indicator */}
          <FadeIn delay={1.0} className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block z-20">
             <div className="animate-bounce">
              <div className="w-[26px] h-[42px] rounded-full border-2 border-white/30 flex justify-center p-2 backdrop-blur-sm shadow-sm">
                <div className="w-1 h-2 bg-white/80 rounded-full animate-scroll" />
              </div>
             </div>
          </FadeIn>
        </section>

        <PromotionsSection />
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
