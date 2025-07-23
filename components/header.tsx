"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Função para determinar se um link está ativo
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    if (href === "/resultados") {
      // Para paquetes (default)
      const categoria = searchParams.get('categoria')
      return pathname.startsWith('/resultados') && (!categoria || categoria === 'paquete')
    }
    if (href === "/hospedajes") {
      // Para hospedajes
      const categoria = searchParams.get('categoria')
      return pathname.startsWith('/resultados') && categoria === 'hospedagem'
    }
    if (href === "/paseos") {
      // Para paseos
      const categoria = searchParams.get('categoria')
      return pathname.startsWith('/resultados') && categoria === 'passeio'
    }
    return pathname.startsWith(href)
  }

  // Função para obter classes do link
  const getLinkClasses = (href: string) => {
    if (isActive(href)) {
      return "text-gray-900 bg-transparent border-2 border-[#EE7215] px-3 py-2 rounded-xl font-bold text-[15px] transition-all duration-300 hover:scale-[1.02] hover:bg-[#EE7215]/5"
    }
    return "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border hover:border-gray-300 px-3 py-2 rounded-xl font-medium text-[15px] transition-all duration-300 hover:scale-[1.02]"
  }

  // Função para obter classes do link mobile
  const getMobileLinkClasses = (href: string) => {
    if (isActive(href)) {
      return "text-gray-900 bg-transparent border-2 border-[#EE7215] px-3 py-2 rounded-xl font-bold transition-all duration-300"
    }
    return "text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-xl font-medium transition-all duration-300"
  }

  return (
    <header 
      className="navbar-fixed bg-white/95 backdrop-blur-sm shadow-sm"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        width: '100%'
      }}
    >
      <div className="container mx-auto px-4 lg:px-[70px]">
        <div className="flex items-center justify-between h-16 lg:h-20 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/nicetrip-logo-1.png"
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
              className={getLinkClasses("/")}
            >
              Inicio
            </Link>
            <span
              className={getLinkClasses("/resultados")}
            >
              Paquetes
            </span>
            <span
              className={getLinkClasses("/hospedajes")}
            >
              Hospedajes
            </span>
            <span
              className={getLinkClasses("/paseos")}
            >
              Paseos
            </span>
            <Link
              href="/condiciones"
              className={getLinkClasses("/condiciones")}
            >
              Condiciones
            </Link>
            <Link
              href="/contacto"
              className={getLinkClasses("/contacto")}
            >
              Contacto
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block flex-shrink-0">
            <button className="relative bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] hover:from-[#FF5722] hover:via-[#E65100] hover:to-[#FF8F00] text-white rounded-xl px-4 py-2 font-semibold text-[14px] shadow-[0_8px_24px_rgba(238,114,21,0.4)] hover:shadow-[0_12px_32px_rgba(238,114,21,0.6)] transition-all duration-300 hover:scale-[1.02] overflow-hidden group whitespace-nowrap">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
              <div className="relative z-10 flex items-center">
                <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="flex-shrink-0">Acceso Agencias</span>
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
              <Link 
                href="/" 
                className={getMobileLinkClasses("/")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <span 
                className={getMobileLinkClasses("/resultados")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Paquetes
              </span>
              <span 
                className={getMobileLinkClasses("/hospedajes")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Hospedajes
              </span>
              <span
                className={getMobileLinkClasses("/paseos")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Paseos
              </span>
              <Link 
                href="/condiciones" 
                className={getMobileLinkClasses("/condiciones")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Condiciones
              </Link>
              <Link 
                href="/contacto" 
                className={getMobileLinkClasses("/contacto")}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <button className="relative bg-gradient-to-r from-[#FF6B35] via-[#EE7215] to-[#F7931E] text-white rounded-xl w-full py-2.5 font-semibold transition-all duration-300 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                <div className="relative z-10 flex items-center justify-center">
                  <Globe className="w-4 h-4 mr-2" />
                  Acceso Agencias
                </div>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 