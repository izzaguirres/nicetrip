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
  title: "Nice Trip - A viagem dos seus sonhos",
  description: "Pacotes completos para você e sua família",
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
