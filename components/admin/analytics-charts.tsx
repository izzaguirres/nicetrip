"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts"

import { AdminSurface } from "@/components/admin/surface"

interface DailyPoint {
  date: string
  count: number
}

interface RankedPoint {
  label: string
  count: number
}

interface AnalyticsChartsProps {
  dailySearches: DailyPoint[]
  dailyConversions: DailyPoint[]
  topDestinations: Array<{ destino: string; count: number }>
  topTransportes: Array<{ transporte: string; count: number }>
  conversionSources: Array<{ source: string; count: number }>
}

const formatDateTick = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value))

const formatTooltipLabel = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))

const formatSourceLabel = (source: string) => {
  if (source === 'promotions-card') return 'Promoções (Home)'
  if (source === 'detalhes_page') return 'Página de Detalhes'
  if (source === 'search-details') return 'Busca Orgânica'
  return source
}

export function AnalyticsCharts({
  dailySearches,
  dailyConversions,
  topDestinations,
  topTransportes,
  conversionSources,
}: AnalyticsChartsProps) {
  const destinationData: RankedPoint[] = topDestinations.map((item) => ({
    label: item.destino || "—",
    count: item.count,
  }))
  const transportData: RankedPoint[] = topTransportes.map((item) => ({
    label: item.transporte || "—",
    count: item.count,
  }))
  const sourceData: RankedPoint[] = conversionSources.map((item) => ({
    label: formatSourceLabel(item.source),
    count: item.count,
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Tentar detectar se é uma data válida para formatar
      let formattedLabel = label
      const date = new Date(label)
      if (!isNaN(date.getTime()) && label.toString().includes('-')) {
         formattedLabel = formatTooltipLabel(label)
      }

      return (
        <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-xl">
          <p className="mb-1 text-xs font-medium text-slate-500">{formattedLabel}</p>
          <p className="text-sm font-bold text-slate-900">
            {payload[0].value} <span className="text-xs font-normal text-slate-500">{payload[0].name === 'count' ? 'registros' : payload[0].name}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Gráfico Principal: Buscas */}
      <AdminSurface className="col-span-full p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">Volume de Buscas</h3>
          <p className="text-sm text-slate-500">Histórico de utilização do filtro inteligente.</p>
        </div>
        <div className="h-[300px] w-full">
          {dailySearches.length === 0 ? (
            <EmptyState message="Sem dados para o período." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySearches} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSearch" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.includes(':') ? val : formatDateTick(val)} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  name="buscas"
                  stroke="#f97316" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorSearch)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>

      {/* Gráfico Secundário: Conversões */}
      <AdminSurface className="p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">Conversões</h3>
          <p className="text-sm text-slate-500">Cliques para contato via WhatsApp.</p>
        </div>
        <div className="h-[250px] w-full">
          {dailyConversions.length === 0 ? (
            <EmptyState message="Sem conversões registradas." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyConversions} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => val.includes(':') ? val : formatDateTick(val)} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="conversões"
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>

      {/* Top Destinos */}
      <AdminSurface className="p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">Top Destinos</h3>
          <p className="text-sm text-slate-500">Locais mais procurados pelos clientes.</p>
        </div>
        <div className="h-[250px] w-full">
          {destinationData.length === 0 ? (
            <EmptyState message="Sem dados de destino." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="label" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="buscas"
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>

      {/* Origem das Conversões */}
      <AdminSurface className="p-6">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">Origem das Conversões</h3>
          <p className="text-sm text-slate-500">De onde vieram os cliques no WhatsApp.</p>
        </div>
        <div className="h-[250px] w-full">
          {sourceData.length === 0 ? (
            <EmptyState message="Sem dados de origem." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="label" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={120}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  name="conversões"
                  fill="#8b5cf6" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50 text-sm text-slate-400">
      {message}
    </div>
  )
}
