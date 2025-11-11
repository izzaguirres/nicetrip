import Link from "next/link"
import type { ReactNode } from "react"
import { Download, MessageCircle, Search, TrendingUp } from "lucide-react"

import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { AdminSurface } from "@/components/admin/surface"
import { buttonVariants } from "@/components/ui/button"
import { getAnalyticsOverview } from "@/lib/admin-analytics"
import { cn } from "@/lib/utils"

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const formatNumber = (value: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)

const formatPercent = (value: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value)

const parseDays = (value: string | string[] | undefined) => {
  const first = Array.isArray(value) ? value[0] : value
  const parsed = Number(first ?? "30")
  if (!Number.isFinite(parsed)) return 30
  if (parsed <= 7) return 7
  if (parsed >= 90) return 90
  return 30
}

const timeframeOptions = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
]

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const days = parseDays(params.days)
  const overview = await getAnalyticsOverview({ days })
  const downloadHref = `/api/admin/analytics/export?days=${days}`

  return (
    <div className="space-y-8">
      <AdminSurface className="p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Relatórios</p>
            <h1 className="text-3xl font-semibold text-slate-900">Analytics</h1>
            <p className="max-w-xl text-sm text-slate-500">
              Acompanhe a performance do Smart Filter, visualize cliques encaminhados para o WhatsApp e descubra quais destinos e transportes estão em alta.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/75 p-1 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              {timeframeOptions.map((option) => {
                const isActive = option.value === days
                const params = new URLSearchParams({ days: String(option.value) }).toString()
                return (
                  <Link
                    key={option.value}
                    href={`/admin/analytics?${params}`}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)]"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {option.label}
                  </Link>
                )
              })}
            </div>
            <a
              href={downloadHref}
              download
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-full border-white/70 bg-white/70 text-slate-600 shadow-[0_12px_36px_rgba(15,23,42,0.12)] backdrop-blur-xl hover:text-orange-500",
              )}
            >
              <Download className="h-4 w-4" /> Exportar CSV
            </a>
          </div>
        </div>
      </AdminSurface>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricSurface
          icon={<Search className="h-5 w-5" />}
          label={`Buscas (${days} dias)`}
          value={formatNumber(overview.totalSearches)}
          description="Eventos registrados no Smart Filter"
        />
        <MetricSurface
          icon={<MessageCircle className="h-5 w-5" />}
          label={`Conversões (${days} dias)`}
          value={formatNumber(overview.totalConversions)}
          description="Cliques encaminhados ao WhatsApp"
        />
        <MetricSurface
          icon={<TrendingUp className="h-5 w-5" />}
          label="Taxa de conversão"
          value={`${formatPercent(overview.conversionRate)}%`}
          description={`Conversões / Buscas nos últimos ${days} dias`}
        />
        <MetricSurface
          icon={<Search className="h-5 w-5" />}
          label="Eventos capturados"
          value={formatNumber(overview.rawSearches.length + overview.rawConversions.length)}
          description="Somatório de buscas e conversões analisadas"
        />
      </div>

      <AnalyticsCharts
        dailySearches={overview.dailySearches}
        dailyConversions={overview.dailyConversions}
        topDestinations={overview.topDestinations}
        topTransportes={overview.topTransportes}
      />
    </div>
  )
}

function MetricSurface({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode
  label: string
  value: string
  description: string
}) {
  return (
    <AdminSurface className="h-full p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg">
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</span>
      </div>
      <p className="mt-6 text-4xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </AdminSurface>
  )
}
