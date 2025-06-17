"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <Link href="/" className="flex items-center">
            <Image
              src="https://github.com/izzaguirres/nicetrip/blob/main/logo3.png?raw=true"
              alt="Nice Trip"
              width={120}
              height={30}
              className="h-8 lg:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 hover:border hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-[15px] transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/resultados?categoria=paquete"
              className="text-gray-600 hover:text-gray-900 hover:border hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-[15px] transition-colors"
            >
              Paquetes
            </Link>
            <Link
              href="/resultados?categoria=hospedagem"
              className="text-gray-600 hover:text-gray-900 hover:border hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-[15px] transition-colors"
            >
              Hospedajes
            </Link>
            <Link
              href="/resultados?categoria=passeio"
              className="text-gray-600 hover:text-gray-900 hover:border hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-[15px] transition-colors"
            >
              Paseos
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-gray-900 hover:border hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-[15px] transition-colors"
            >
              Condiciones
            </Link>
            <Link
              href="#"
              className="text-gray-600 hover:text-gray-900 hover:border hover:border-gray-300 px-4 py-2 rounded-xl font-medium text-[15px] transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white rounded-xl px-6 py-2.5 font-medium text-[15px] shadow-lg">
              <Globe className="w-4 h-4 mr-2" />
              Acceso Agencias
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-900 border border-gray-300 px-4 py-2 rounded-xl font-medium">
                Inicio
              </Link>
              <Link href="/resultados?categoria=paquete" className="text-gray-600 hover:text-gray-900 font-medium">
                Paquetes
              </Link>
              <Link href="/resultados?categoria=hospedagem" className="text-gray-600 hover:text-gray-900 font-medium">
                Hospedajes
              </Link>
              <Link href="/resultados?categoria=passeio" className="text-gray-600 hover:text-gray-900 font-medium">
                Paseos
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">
                Condiciones
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900 font-medium">
                Contacto
              </Link>
              <Button className="bg-[#EE7215] hover:bg-[#EE7215]/90 text-white rounded-xl w-full">
                <Globe className="w-4 h-4 mr-2" />
                Acceso Agencias
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
} 