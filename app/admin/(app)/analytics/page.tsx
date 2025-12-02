import Link from "next/link"
import type { ReactNode } from "react"
import { Download, MessageCircle, Search, TrendingUp, TrendingDown, Calendar } from "lucide-react"

import { AnalyticsCharts } from "@/components/admin/analytics-charts"
import { AiAnalystCard } from "@/components/admin/ai-analyst-card"
import { AdminSurface } from "@/components/admin/surface"
import { Button } from "@/components/ui/button"
import { getAnalyticsOverview } from "@/lib/admin-analytics"
import { cn } from "@/lib/utils"

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const formatNumber = (value: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)

const parsePeriod = (value: string | string[] | undefined): 'today' | '7d' | '30d' | '90d' => {
  const first = Array.isArray(value) ? value[0] : value
  if (first === 'today') return 'today'
  
  const parsed = Number(first ?? "30")
  if (!Number.isFinite(parsed)) return '30d'
  if (parsed <= 7) return '7d'
  if (parsed >= 90) return '90d'
  return '30d'
}

const timeframeOptions = [
  { label: "Hoje", value: "today" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "90 dias", value: "90d" },
]

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const period = parsePeriod(params.period || params.days)
  const overview = await getAnalyticsOverview({ period })
  const downloadHref = `/api/admin/analytics/export?period=${period}`

  return (
    <div className="space-y-8">
      {/* Header Compacto */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
           <p className="text-slate-500 mt-1">Performance do Smart Filter e conversões.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
             {timeframeOptions.map((option) => {
                const isActive = option.value === period
                const params = new URLSearchParams({ period: String(option.value) }).toString()
                return (
                  <Link
                    key={option.value}
                    href={`/admin/analytics?${params}`}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                    )}
                  >
                    {option.label}
                  </Link>
                )
             })}
          </div>
          
          <a href={downloadHref} download tabIndex={-1}>
            <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Coluna Principal: Gráficos e AI */}
        <div className="xl:col-span-2 space-y-6">
           <AiAnalystCard analyticsData={overview} />
           
           <AnalyticsCharts
            dailySearches={overview.dailySearches}
            dailyConversions={overview.dailyConversions}
            topDestinations={overview.topDestinations}
            topTransportes={overview.topTransportes}
            conversionSources={overview.conversionSources}
          />
        </div>

        {/* Coluna Lateral: KPIs */}
        <div className="space-y-4">
           <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Métricas Chave</h3>
           
           <MetricSurface
             icon={<Search className="h-4 w-4" />}
             label="Buscas Totais"
             value={formatNumber(overview.totalSearches)}
             delta={overview.growth.searches}
             description="Filtros aplicados"
           />
           
           <MetricSurface
             icon={<MessageCircle className="h-4 w-4" />}
             label="Leads WhatsApp"
             value={formatNumber(overview.totalConversions)}
             delta={overview.growth.conversions}
             description="Cliques no botão reservar"
           />
           
           <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">Mais métricas em breve</p>
              <p className="text-xs text-slate-400">Taxa de rejeição e tempo na página</p>
           </div>
        </div>
      </div>
    </div>
  )
}

function MetricSurface({
  icon,
  label,
  value,
  delta,
  description,
}: {
  icon: ReactNode
  label: string
  value: string
  delta?: number
  description: string
}) {
  const isPositive = delta !== undefined && delta >= 0
  
  return (
    <AdminSurface className="p-5 flex flex-col justify-between h-[160px] relative overflow-hidden group hover:border-orange-200 transition-colors">
      <div className="flex justify-between items-start">
         <div className="p-2 rounded-lg bg-slate-50 text-slate-500 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
            {icon}
         </div>
         {delta !== undefined && (
            <div className={cn(
              "flex items-center text-xs font-bold px-2 py-1 rounded-full", 
              isPositive ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(delta)}%
            </div>
          )}
      </div>
      
      <div>
        <h4 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h4>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{label}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </div>
    </AdminSurface>
  )
}
