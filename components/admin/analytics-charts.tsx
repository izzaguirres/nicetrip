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
}

const formatDateTick = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(value))

const formatTooltipLabel = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value))

export function AnalyticsCharts({
  dailySearches,
  dailyConversions,
  topDestinations,
  topTransportes,
}: AnalyticsChartsProps) {
  const destinationData: RankedPoint[] = topDestinations.map((item) => ({
    label: item.destino || "—",
    count: item.count,
  }))
  const transportData: RankedPoint[] = topTransportes.map((item) => ({
    label: item.transporte || "—",
    count: item.count,
  }))

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <AdminSurface className="col-span-full overflow-hidden p-6">
        <div className="flex flex-col gap-1 border-b border-white/40 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Visão temporal</span>
          <h3 className="text-lg font-semibold text-slate-900">Volume de buscas por dia</h3>
        </div>
        <div className="h-80 pt-4">
          {dailySearches.length === 0 ? (
            <EmptyState message="Nenhum evento registrado no período." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailySearches} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDateTick} tickLine={false} axisLine={false} dy={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.85)" }}
                  labelFormatter={formatTooltipLabel}
                  formatter={(value: number) => [`${value} buscas`, "Volume"]}
                />
                <Area type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} fill="url(#searchGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>

      <AdminSurface className="overflow-hidden p-6">
        <div className="flex flex-col gap-1 border-b border-white/40 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Conversões</span>
          <h3 className="text-lg font-semibold text-slate-900">Cliques encaminhados ao WhatsApp</h3>
        </div>
        <div className="h-72 pt-4">
          {dailyConversions.length === 0 ? (
            <EmptyState message="Nenhuma conversão registrada." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyConversions} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.25)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDateTick} tickLine={false} axisLine={false} dy={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} dx={-8} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.85)" }}
                  labelFormatter={formatTooltipLabel}
                  formatter={(value: number) => [`${value} conversões`, "Volume"]}
                />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>

      <AdminSurface className="overflow-hidden p-6">
        <div className="flex flex-col gap-1 border-b border-white/40 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Destinos</span>
          <h3 className="text-lg font-semibold text-slate-900">Top destinos pesquisados</h3>
        </div>
        <div className="h-72 pt-4">
          {destinationData.length === 0 ? (
            <EmptyState message="Nenhum destino com buscas registradas." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} layout="vertical" margin={{ top: 12, right: 12, bottom: 12, left: 60 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="rgba(148,163,184,0.2)" />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} width={140} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.85)" }}
                  formatter={(value: number) => [`${value} buscas`, "Destinos"]}
                />
                <Bar dataKey="count" fill="#38bdf8" radius={[0, 14, 14, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </AdminSurface>

      <AdminSurface className="overflow-hidden p-6">
        <div className="flex flex-col gap-1 border-b border-white/40 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Modalidades</span>
          <h3 className="text-lg font-semibold text-slate-900">Transportes preferidos</h3>
        </div>
        <div className="h-72 pt-4">
          {transportData.length === 0 ? (
            <EmptyState message="Nenhum modal de transporte registrado." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transportData} margin={{ top: 12, right: 12, left: 8, bottom: 16 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} dy={8} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.85)" }}
                  formatter={(value: number) => [`${value} buscas`, "Modal"]}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[14, 14, 0, 0]} />
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
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/60 bg-white/50 text-sm text-slate-500">
      {message}
    </div>
  )
}
