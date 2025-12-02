import type React from "react"
import type { Metadata } from "next"
import { Figtree } from "next/font/google"
import "./globals.css"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import WhatsappFloat from "@/components/whatsapp-float"

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
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
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png"
  },
  metadataBase: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: "Nice Trip - Pacotes e Hospedagens",
    description: "Encontre o melhor pacote para suas férias com filtros inteligentes.",
    type: "website",
    locale: "es_AR",
    siteName: "Nice Trip",
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Nice Trip"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nice Trip - Pacotes e Hospedagens",
    description: "Encontre o melhor pacote para suas férias com filtros inteligentes.",
    images: ["/images/og-cover.jpg"]
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
      <body className={`${figtree.variable} font-sans antialiased selection:bg-orange-100 selection:text-orange-600`} suppressHydrationWarning={true}>
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
        <WhatsappFloat />
        <Analytics />
      </body>
    </html>
  )
}
