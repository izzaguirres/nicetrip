import { DollarSign, MessageCircle, Search, Megaphone, Activity, ArrowRight, Zap, ShieldCheck, BarChart3, Clock } from 'lucide-react'
import { AdminSurface } from '@/components/admin/surface'
import { cn } from '@/lib/utils'
import { getAdminDashboardData } from '@/lib/admin-dashboard'
import Link from 'next/link'
import type { DashboardActivity } from '@/lib/admin-dashboard'

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

const getTimeAgo = (dateStr: string) => {
  const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000 / 60
  if (diff < 1) return 'Agora'
  if (diff < 60) return `${Math.floor(diff)}m atrás`
  const hours = Math.floor(diff / 60)
  if (hours < 24) return `${hours}h atrás`
  return '1d+'
}

export async function DashboardMetrics() {
  const data = await getAdminDashboardData()

  return (
    <>
      {/* Super Cards - Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          label="Pipeline (Estimado)"
          value={formatCurrency(data.estimatedPipeline)}
          subvalue="Baseado em 24h corridas"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          label="Leads Gerados"
          value={data.recentConversions.toString()}
          subvalue="Janela de 24h corridas"
          icon={MessageCircle}
          color="orange"
        />
        <StatCard
          label="Buscas Realizadas"
          value={data.recentSearches.toString()}
          subvalue="Janela de 24h corridas"
          icon={Search}
          color="blue"
        />
        <StatCard
          label="Ofertas Ativas"
          value={`${data.activePromotions + data.activeDiscounts}`}
          subvalue="Promoções & Regras"
          icon={Megaphone}
          color="violet"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column: Live Feed */}
        <div className="lg:col-span-2 space-y-6">
          <AdminSurface className="h-full min-h-[400px] p-0 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Feed de Atividade</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-white rounded border border-slate-200">
                Últimas ações
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {data.activityFeed.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Nenhuma atividade recente registrada.</div>
              ) : (
                data.activityFeed.map((item) => (
                  <ActivityItem key={item.id} item={item} />
                ))
              )}
            </div>
            <div className="p-4 bg-slate-50/30 text-center border-t border-slate-100 mt-auto">
              <Link href="/admin/analytics" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                Ver histórico completo no Analytics &rarr;
              </Link>
            </div>
          </AdminSurface>
        </div>

        {/* Sidebar: System Health (Only dynamic part of sidebar) */}
        <div className="space-y-6">
           {/* Quick Actions is static, handled in parent */}
           <SystemHealth activePromotions={data.activePromotions} activeDiscounts={data.activeDiscounts} recentAuditLogs={data.recentAuditLogs} />
        </div>
      </div>
    </>
  )
}

function SystemHealth({ activePromotions, activeDiscounts, recentAuditLogs }: any) {
    return (
        <AdminSurface className="p-5 bg-slate-900 text-slate-200 border-slate-800">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Status da Loja
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Promoções na Home</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {activePromotions}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Regras de Desconto</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {activeDiscounts}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Logs de Auditoria</span>
                <span className="font-mono font-bold text-slate-400">
                  {recentAuditLogs} (24h)
                </span>
              </div>
            </div>
          </AdminSurface>
    )
}

function StatCard({ label, value, subvalue, icon: Icon, color }: any) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
  }

  return (
    <AdminSurface className="p-5 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <h4 className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h4>
        </div>
        <div className={cn("p-2.5 rounded-xl border", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
        <Clock className="w-3 h-3" /> {subvalue}
      </p>
    </AdminSurface>
  )
}

function ActivityItem({ item }: { item: DashboardActivity }) {
  const isConversion = item.type === 'conversion'
  
  return (
    <div className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/80 transition-colors">
      <div className={cn(
        "mt-1 p-2 rounded-full flex-shrink-0",
        isConversion ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
      )}>
        {isConversion ? <MessageCircle className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <p className="text-sm font-semibold text-slate-900 truncate pr-2">
            {item.title}
          </p>
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap bg-slate-100 px-1.5 py-0.5 rounded">
            {getTimeAgo(item.created_at)}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 truncate">
          {item.subtitle}
        </p>
      </div>
    </div>
  )
}
