'use server'

import { supabaseServer } from '@/app/supabase-server'
import type { SearchEvent, ConversionEvent } from '@/lib/supabase'

export interface AnalyticsOverview {
  totalSearches: number
  totalConversions: number
  conversionRate: number
  topDestinations: Array<{ destino: string; count: number }>
  topTransportes: Array<{ transporte: string; count: number }>
  dailySearches: Array<{ date: string; count: number }>
  dailyConversions: Array<{ date: string; count: number }>
  rawSearches: SearchEvent[]
  rawConversions: ConversionEvent[]
}

const normalizeDate = (iso: string) => iso.slice(0, 10)

export async function getAnalyticsOverview({ days = 30 } = {}): Promise<AnalyticsOverview> {
  const supabase = await supabaseServer()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: searches, error: searchesError }, { data: conversions, error: conversionsError }] =
    await Promise.all([
      supabase
        .from('search_events')
        .select('*')
        .filter('created_at', 'gte', since)
        .order('created_at', { ascending: false })
        .limit(1000),
      supabase
        .from('conversion_events')
        .select('*')
        .filter('created_at', 'gte', since)
        .order('created_at', { ascending: false })
        .limit(1000),
    ])

  if (searchesError) {
    throw new Error(`Erro ao carregar buscas: ${searchesError.message}`)
  }
  if (conversionsError) {
    throw new Error(`Erro ao carregar conversões: ${conversionsError.message}`)
  }

  const searchEvents = (searches ?? []) as SearchEvent[]
  const conversionEvents = (conversions ?? []) as ConversionEvent[]

  const totalSearches = searchEvents.length
  const totalConversions = conversionEvents.length
  const conversionRate =
    totalSearches > 0 ? Number(((totalConversions / totalSearches) * 100).toFixed(2)) : 0

  const destinationMap = new Map<string, number>()
  const transportMap = new Map<string, number>()
  const dailySearchesMap = new Map<string, number>()

  searchEvents.forEach((event) => {
    const filters = event.filters || {}
    const destino = (filters.destino || filters.destination || '').toString().trim()
    const transporte = (filters.transporte || filters.transport || '').toString().trim()
    const dateKey = normalizeDate(event.created_at)

    if (destino) {
      destinationMap.set(destino, (destinationMap.get(destino) || 0) + 1)
    }
    if (transporte) {
      transportMap.set(transporte, (transportMap.get(transporte) || 0) + 1)
    }
    dailySearchesMap.set(dateKey, (dailySearchesMap.get(dateKey) || 0) + 1)
  })

  const dailyConversionsMap = new Map<string, number>()
  conversionEvents.forEach((event) => {
    const dateKey = normalizeDate(event.created_at)
    dailyConversionsMap.set(dateKey, (dailyConversionsMap.get(dateKey) || 0) + 1)
  })

  const topDestinations = Array.from(destinationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([destino, count]) => ({ destino, count }))

  const topTransportes = Array.from(transportMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([transporte, count]) => ({ transporte, count }))

  const dailySearches = Array.from(dailySearchesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const dailyConversions = Array.from(dailyConversionsMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  return {
    totalSearches,
    totalConversions,
    conversionRate,
    topDestinations,
    topTransportes,
    dailySearches,
    dailyConversions,
    rawSearches: searchEvents,
    rawConversions: conversionEvents,
  }
}
