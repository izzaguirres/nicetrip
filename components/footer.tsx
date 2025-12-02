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
        className="group relative bg-white rounded-2xl p-8 w-full h-full flex flex-col items-center justify-center text-slate-900 shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
      >
        {/* Gradient Blob Background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
        
        <div className="relative z-10 text-center space-y-5">
          {/* Instagram Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-orange-600">@nicetripturismo</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Acompanhe nossas viagens,<br />
              dicas e promoções exclusivas!
            </p>
          </div>
          
          <div className="inline-flex items-center gap-2 text-orange-600 font-bold text-sm uppercase tracking-wider group-hover:gap-3 transition-all">
            <span>Seguir agora</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            
            {/* Left: Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2025 Nice Trip Turismo.<br className="md:hidden"/> Todos los derechos reservados.
            </p>

            {/* Center: FLN Group */}
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-medium mb-1">Una empresa del</p>
              <span className="text-[#EE7215] font-bold tracking-wide">FLN GROUP</span>
            </div>

            {/* Right: Developer */}
            <a 
              href="https://izaguirres.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              <span>Developed by</span>
              <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 group-hover:from-[#EE7215] group-hover:to-orange-600 transition-all">
                IZAGUIRRES
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
