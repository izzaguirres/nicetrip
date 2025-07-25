"use client"

import Image from "next/image"
import Link from "next/link"
import { Phone, Mail } from "lucide-react"
import { useEffect, useState } from "react"

// Componente Instagram Link simples e funcional
function InstagramSection() {
  return (
    <div className="h-80 flex items-center justify-center">
      <a 
        href="https://www.instagram.com/nicetripturismo/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl p-8 w-full h-full flex flex-col items-center justify-center text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 rounded-3xl group-hover:from-purple-600/30 group-hover:via-pink-600/30 group-hover:to-orange-600/30 transition-all duration-500"></div>
        
        <div className="relative z-10 text-center space-y-6">
          {/* Instagram Icon */}
          <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold">@nicetripturismo</h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Acompanhe nossas viagens,<br />
              dicas e promoções exclusivas!
            </p>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
              <span>Seguir no Instagram</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 left-6 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-1000"></div>
      </a>
    </div>
  )
}

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
              src="/images/nicetrip-logo-1.png"
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
                <span className="text-gray-900 font-medium">+55 48 99860-1754</span>
              </div>
              <div className="flex items-center lg:justify-end space-x-2">
                <Mail className="w-4 h-4 text-[#EE7215]" />
                <span className="text-gray-900 font-medium">reservas@nicetripturismo.com.br</span>
              </div>
            </div>
          </div>
        </div>

        {/* Google Maps and Instagram Section */}
        <div className="py-12 border-t border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Google Maps */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Nossa Localização</h3>
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3541.304079165669!2d-48.46227752399955!3d-27.428632614958566!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x952743a26f31cfa7%3A0x25aac1a625c2a7b8!2sNice%20Trip%20Turismo!5e0!3m2!1spt-BR!2sbr!4v1753470004725!5m2!1spt-BR!2sbr" 
                  width="100%" 
                  height="320" 
                  style={{border: 0}} 
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl"
                />
              </div>
            </div>

            {/* Instagram Embed */}
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Siga-nos no Instagram</h3>
              <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 bg-white">
                <InstagramSection />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">© 2025 Nice Trip Turismo. Todos los derechos reservados.</p>
            <p className="text-gray-500 text-sm">
              Una empresa del<br />
              <span className="text-[#EE7215] font-medium">FLN GROUP</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
