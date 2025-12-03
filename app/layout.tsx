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
    default: "Nice Trip | Paquetes a Brasil - Canasvieiras y Florianópolis",
    template: "%s | Nice Trip Turismo"
  },
  description: "Tu agencia de viajes experta en Brasil. Paquetes turísticos a Canasvieiras, Florianópolis y Bombinhas. Viajes en Bus y Aéreo con salidas desde Argentina. Hoteles, posadas y excursiones. ¡Tu verano 2026 empieza acá!",
  keywords: [
    "paquetes a brasil 2026", "paquetes a canasvieiras", "paquetes a florianopolis", 
    "viajes a brasil en bus", "turismo joven", "hoteles en canasvieiras", 
    "alojamiento en florianopolis", "micro a brasil", "aéreos a floripa",
    "nice trip", "agencia de viajes", "verano 2026"
  ],
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png"
  },
  metadataBase: typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : new URL('https://nicetrip.com.br'), // Fallback seguro
  alternates: {
    canonical: "/"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Paquetes a Brasil 2026 | Canasvieiras y Florianópolis",
    description: "Encontrá los mejores precios para tu viaje a Brasil. Paquetes en Bus y Aéreo, hoteles y traslados. ¡Pagá en cuotas!",
    url: 'https://nicetrip.com.br',
    siteName: 'Nice Trip Turismo',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: "/images/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Nice Trip - Paquetes a Brasil"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Paquetes a Brasil 2026 | Nice Trip",
    description: "Tu viaje soñado a Canasvieiras y Florianópolis. Salidas desde Argentina.",
    images: ["/images/og-cover.jpg"]
  },
  verification: {
    google: 'google-site-verification-code', // Placeholder para o futuro
  },
  category: 'travel',
  generator: 'Nice Trip Platform v3.0'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-AR">
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
