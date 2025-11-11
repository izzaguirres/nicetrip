import Link from 'next/link'
import { BarChart3, ShieldCheck, Search, MessageCircle } from 'lucide-react'
import { getAdminDashboardData } from '@/lib/admin-dashboard'
import { AdminSurface } from '@/components/admin/surface'

const quickLinks = [
  {
    href: '/admin/discounts',
    title: 'Regras de desconto',
    description: 'Configure promoções, campanhas e taxas extras aplicadas automaticamente.',
  },
  {
    href: '/admin/disponibilidades',
    title: 'Disponibilidades',
    description: 'Gerencie pacotes, preços e transporte em tempo real com segurança.',
  },
  {
    href: '/admin/analytics',
    title: 'Analytics',
    description: 'Monitore os filtros mais usados, buscas recentes e taxa de conversão.',
  },
  {
    href: '/admin/audit-log',
    title: 'Log de mudanças',
    description: 'Acompanhe quem alterou regras e disponibilidades no sistema.',
  },
]

export default async function AdminHomePage() {
  const data = await getAdminDashboardData()

  return (
    <div className="space-y-8">
      <AdminSurface className="overflow-hidden p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Visão geral</p>
            <h1 className="text-3xl font-semibold text-slate-900">Bem-vindo ao cockpit da Nice Trip</h1>
            <p className="text-sm text-slate-500">
              Gerencie promoções, mantenha a base de pacotes em dia e acompanhe a performance do Smart Filter.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-medium text-slate-500 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
            Atualizado em {new Date().toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={ShieldCheck}
            label="Regras ativas"
            value={data.activeDiscounts}
            description="Promoções aplicadas automaticamente nos pacotes hoje."
          />
          <MetricCard
            icon={Search}
            label="Buscas (24h)"
            value={data.recentSearches}
            description="Consultas processadas pelo Smart Filter nas últimas 24h."
          />
          <MetricCard
            icon={MessageCircle}
            label="Conversões (24h)"
            value={data.recentConversions}
            description="Cliques encaminhados ao WhatsApp durante o período."
          />
          <MetricCard
            icon={BarChart3}
            label="Atualizações"
            value={data.recentAuditLogs}
            description="Registros auditados entre regras, pacotes e usuários."
          />
        </div>
      </AdminSurface>

      <AdminSurface className="p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Atalhos rápidos</h2>
            <p className="text-sm text-slate-500">
              Acesse áreas críticas com um clique e mantenha a operação sempre atualizada.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="group flex h-full flex-col rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
                <span className="text-sm font-semibold text-slate-900">{link.title}</span>
                <p className="mt-2 text-sm text-slate-500">{link.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                  Abrir
                  <span className="h-px w-6 bg-orange-300 transition group-hover:w-10" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </AdminSurface>
    </div>
  )
}

interface MetricCardProps {
  icon: typeof ShieldCheck
  label: string
  value: number
  description: string
}

function MetricCard({ icon: Icon, label, value, description }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.1)] backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</p>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-6 text-4xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  )
}
