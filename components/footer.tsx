"use client"

import Image from "next/image"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 lg:py-16">
      <div className="container mx-auto px-4 lg:px-[70px]">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
          {/* Left Side - Logo and Company Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/nice-trip-logo-new.png"
                alt="Nice Trip"
                width={140}
                height={35}
                className="h-10 w-auto"
              />
            </Link>
            <div className="space-y-1">
              <p className="text-gray-900 font-medium">Nice Trip Turismo</p>
              <p className="text-gray-600 text-sm">Florianópolis, Brasil/SC</p>
            </div>
          </div>

          {/* Right Side - Contact Info */}
          <div className="space-y-4 lg:text-right">
            <div className="space-y-3">
              <div className="flex items-center lg:justify-end space-x-2">
                <Phone className="w-4 h-4 text-[#EE7215]" />
                <span className="text-gray-900 font-medium">(48) 99999-9999</span>
              </div>
              <div className="flex items-center lg:justify-end space-x-2">
                <Mail className="w-4 h-4 text-[#EE7215]" />
                <span className="text-gray-900 font-medium">contato@nicetrip.com.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Serviços</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Pacotes
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Hospedagens
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Passeios
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Traslados
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Destinos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Florianópolis
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Canasvieiras
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Bombinhas
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Balneário Camboriú
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Nossa Equipe
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Condições
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#EE7215] transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">© 2025 Nice Trip Turismo. Todos os direitos reservados.</p>
            <p className="text-gray-500 text-sm">
              Uma empresa do <span className="text-[#EE7215] font-medium">FLN GROUP</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
