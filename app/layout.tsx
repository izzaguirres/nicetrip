import type React from "react"
import type { Metadata } from "next"
import { Rethink_Sans, Manrope } from "next/font/google"
import "./globals.css"
import Script from "next/script"

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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-W5QTFN33');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className={`${rethinkSans.variable} ${manrope.variable} font-sans`} suppressHydrationWarning={true}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W5QTFN33"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
      </body>
    </html>
  )
}
