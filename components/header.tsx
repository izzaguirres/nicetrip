"use client"

import { useState, useEffect } from "react"
import { Globe, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { TARIFARIOS_PDF_URL } from "@/lib/constants"
import { cn } from "@/lib/utils"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const agencyUrl = "https://app.redevt.com/red/ag/login.asp?xpid=4643367633313934344559"

  // Detectar scroll para mudar o estilo da navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Função para determinar se um link está ativo
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    if (href === "/resultados") {
      const categoria = searchParams.get('categoria')
      return pathname.startsWith('/resultados') && (!categoria || categoria === 'paquete')
    }
    return pathname.startsWith(href)
  }

  const isHomePage = pathname === "/"
  const isLightMode = scrolled || !isHomePage

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 flex justify-center pointer-events-none">
        <header 
          className={cn(
            "pointer-events-auto transition-all duration-500 ease-in-out flex items-center rounded-full border",
            isLightMode 
              ? "w-[95%] max-w-5xl mt-2 bg-white/90 backdrop-blur-xl border-slate-200 py-2 shadow-lg" 
              : "w-[95%] max-w-7xl mt-6 bg-transparent border-transparent py-4"
          )}
        >
          <div className="w-full h-full px-4 lg:px-[70px] flex items-center justify-between mx-auto">
            
            {/* Logo - Alterna entre Branco e Colorido */}
            <Link href="/" className="relative z-10 flex-shrink-0 block h-8 lg:h-9 w-[140px] transition-transform hover:scale-105 duration-300">
              <Image
                src={isLightMode ? "/images/nicetrip-logo-1.png" : "/images/nicetrip-logo-2.png"}
                alt="Nice Trip"
                fill
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <nav className="flex items-center gap-8">
                <Link href="/condiciones" className={cn(
                  "text-sm font-semibold transition-colors tracking-wide relative group",
                  isLightMode ? "text-slate-600 hover:text-[#EE7215]" : "text-white/90 hover:text-white"
                )}>
                  Condiciones
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                </Link>
                <Link href="/contacto" className={cn(
                  "text-sm font-semibold transition-colors tracking-wide relative group",
                  isLightMode ? "text-slate-600 hover:text-[#EE7215]" : "text-white/90 hover:text-white"
                )}>
                  Contacto
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                </Link>
                <Link
                  href={TARIFARIOS_PDF_URL}
                  className={cn(
                    "text-sm font-semibold transition-colors tracking-wide relative group",
                    isLightMode ? "text-slate-600 hover:text-[#EE7215]" : "text-white/90 hover:text-white"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tarifários
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF6B35] transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100" />
                </Link>
              </nav>

              {/* CTA Button */}
              <button
                onClick={() => window.open(agencyUrl, '_blank', 'noopener,noreferrer')}
                className={cn(
                  "rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 group transition-all duration-300",
                  isLightMode 
                    ? "bg-[#EE7215] text-white border border-transparent hover:bg-[#d6630f] shadow-md hover:shadow-lg" 
                    : "bg-white/10 border border-white/30 text-white hover:bg-white hover:text-black backdrop-blur-sm"
                )}
              >
                <Globe className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                <span>Acceso Agencias</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={cn(
                "lg:hidden p-2 rounded-full transition-colors pointer-events-auto",
                isLightMode ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/95 backdrop-blur-xl lg:hidden animate-in slide-in-from-top-10 fade-in duration-300 flex flex-col justify-center items-center p-8">
          <nav className="flex flex-col space-y-6 text-center w-full max-w-sm">
            <Link 
              href="/condiciones" 
              className="text-2xl font-bold text-white hover:text-orange-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Condiciones
            </Link>
            <Link 
              href="/contacto" 
              className="text-2xl font-bold text-white hover:text-orange-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacto
            </Link>
            <div className="pt-8 w-full">
              <button
                onClick={() => window.open(agencyUrl, '_blank', 'noopener,noreferrer')}
                className="btn-liquid-orange w-full rounded-2xl py-4 text-center flex justify-center items-center gap-3 text-lg"
              >
                <Globe className="w-5 h-5" />
                Acceso Agencias
              </button>
            </div>
          </nav>
          
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-white/50 hover:text-white"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  )
}