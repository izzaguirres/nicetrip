import type React from "react"
import type { Metadata } from "next"
import { Rethink_Sans, Manrope } from "next/font/google"
import "./globals.css"

const rethinkSans = Rethink_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rethink-sans",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: {
    default: "Nice Trip - Pacotes de viagem, hospedagens e passeios",
    template: "%s | Nice Trip"
  },
  description: "Busca inteligente de pacotes (Bus/Aéreo), hospedagens e passeios. Pagamento parcelado, suporte em português e espanhol.",
  keywords: [
    "viagem", "pacotes", "florianópolis", "bombinhas", "bus", "aéreo",
    "hospedagem", "hotel", "passeios", "argentina", "brasil"
  ],
  openGraph: {
    title: "Nice Trip - Pacotes e Hospedagens",
    description: "Encontre o melhor pacote para suas férias com filtros inteligentes.",
    type: "website",
    locale: "es_AR",
    siteName: "Nice Trip"
  },
  twitter: {
    card: "summary_large_image",
    title: "Nice Trip - Pacotes e Hospedagens",
    description: "Encontre o melhor pacote para suas férias com filtros inteligentes."
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head />
      <body className={`${rethinkSans.variable} ${manrope.variable} font-sans`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
