'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Percent, CalendarDays, BarChart3, LogOut, Users } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/discounts', label: 'Regras de desconto', icon: Percent },
  { href: '/admin/disponibilidades', label: 'Disponibilidades', icon: CalendarDays },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f6fb] via-[#edf0f7] to-[#e5e9f4] text-slate-800">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-4 py-8 lg:flex-row lg:px-8">
        <aside className="hidden w-full max-w-[260px] flex-col gap-6 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:flex">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">Painel</p>
              <h1 className="text-lg font-semibold text-slate-800">Nice Trip Admin</h1>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-sm font-semibold text-white shadow-lg">
              NT
            </span>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className="block">
                  <span
                    className={cn(
                      'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition-all',
                      'border border-transparent bg-white/60 text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl hover:border-white/80 hover:text-slate-700',
                      active &&
                        'border-white/90 bg-white text-slate-900 shadow-[0_18px_50px_rgba(15,23,42,0.12)]',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4', active ? 'text-orange-500' : 'text-slate-400')} />
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full transition',
                        active ? 'bg-orange-500' : 'bg-transparent',
                      )}
                    />
                  </span>
                </Link>
              )
            })}
          </nav>
          <form action="/admin/logout" method="post" className="mt-auto">
            <Button
              type="submit"
              variant="ghost"
              className="group w-full justify-center gap-2 rounded-2xl border border-white/60 bg-white/80 py-3 text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl hover:text-orange-500"
            >
              <LogOut className="h-4 w-4 transition group-hover:translate-x-0.5" />
              Sair
            </Button>
          </form>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 px-4 py-3 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl lg:hidden">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">Painel</p>
              <h1 className="text-base font-semibold text-slate-800">Nice Trip Admin</h1>
            </div>
            <form action="/admin/logout" method="post">
              <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </header>

          <main className="flex-1 space-y-8 pb-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
