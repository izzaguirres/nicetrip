import type { CSSProperties, ReactNode } from 'react'
import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'


export const metadata: Metadata = {
  title: 'Nice Trip Admin',
  description: 'Painel administrativo Nice Trip',
}

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
})

export default function AdminLayout({ children }: { children: ReactNode }) {
  const fontOverrides: CSSProperties = {
    '--font-rethink-sans': 'var(--font-figtree)',
    '--font-manrope': 'var(--font-figtree)',
  }

  return (
    <div className={`${figtree.variable} ${figtree.className} font-sans`} style={fontOverrides}>
      {children}
    </div>
  )
}
