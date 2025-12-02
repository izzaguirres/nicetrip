'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Percent, 
  CalendarDays, 
  BarChart3, 
  LogOut, 
  Users, 
  Sparkles, 
  PlusCircle, 
  Menu,
  ChevronRight,
  ScrollText
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics & IA', icon: BarChart3 },
  { type: 'divider', label: 'Gestão' },
  { href: '/admin/disponibilidades', label: 'Disponibilidades', icon: CalendarDays },
  { href: '/admin/addons', label: 'Adicionais', icon: PlusCircle },
  { href: '/admin/condicoes', label: 'Condiciones', icon: ScrollText },
  { type: 'divider', label: 'Marketing' },
  { href: '/admin/promotions', label: 'Promoções', icon: Sparkles },
  { href: '/admin/discounts', label: 'Regras de desconto', icon: Percent },
  { type: 'divider', label: 'Sistema' },
  { href: '/admin/users', label: 'Usuários Admin', icon: Users },
]

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen w-full bg-[#f8f9fc] text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* Sidebar Desktop - Fixed & Glassy */}
      <aside className="hidden w-[280px] shrink-0 flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl lg:flex fixed inset-y-0 left-0 z-50">
        <div className="flex h-16 items-center px-6 border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 text-sm font-bold text-white shadow-lg shadow-orange-500/20">
              NT
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-900">Nice Trip Admin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-1">
            {navItems.map((item, index) => {
              if (item.type === 'divider') {
                return (
                  <div key={index} className="px-3 pt-5 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>
                  </div>
                )
              }
              
              const Icon = item.icon as any
              const active = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href!} className="block group">
                  <span
                    className={cn(
                      'flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active 
                        ? 'bg-orange-50 text-orange-700 shadow-sm ring-1 ring-orange-200/50' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className={cn('h-4 w-4 transition-colors', active ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600')} />
                      {item.label}
                    </span>
                    {active && <ChevronRight className="h-3 w-3 text-orange-400" />}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 mb-2 flex items-center gap-3 border border-slate-100">
             <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                AD
             </div>
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 truncate">Admin User</p>
                <p className="text-[10px] text-slate-500 truncate">admin@nicetrip.com</p>
             </div>
          </div>
          <form action="/admin/logout" method="post">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area - Fluid */}
      <main className="flex-1 lg:pl-[280px] min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl lg:hidden">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2">
              <Menu className="h-5 w-5 text-slate-600" />
            </Button>
            <span className="font-semibold text-slate-900">Nice Trip</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500" />
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>
    </div>
  )
}
